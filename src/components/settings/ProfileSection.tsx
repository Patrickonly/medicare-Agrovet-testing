import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  ArrowLeft, Save, Loader2, User, Lock, Mail, Phone, Camera, LogOut, AlertTriangle,
} from "lucide-react";
import { ROLE_LABELS } from "@/types/rbac";
import TwoFactorSetup from "./TwoFactorSetup";
import TrustedDevicesSection from "./TrustedDevicesSection";
import ActivityLog from "./ActivityLog";

interface ProfileProps {
  onBack: () => void;
}

export default function ProfileSection({ onBack }: ProfileProps) {
  const { user, userRole, signOut } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const refreshSignedAvatar = async (path: string) => {
    const { data } = await supabase.storage.from("org-logos").createSignedUrl(path, 60 * 60 * 24 * 7);
    if (data?.signedUrl) setAvatarUrl(data.signedUrl);
  };

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("first_name, last_name, phone, avatar_url")
      .eq("id", user.id)
      .single();
    if (data) {
      setFirstName(data.first_name || "");
      setLastName(data.last_name || "");
      setPhone(data.phone || "");
      if (data.avatar_url) {
        if (data.avatar_url.startsWith("http")) {
          const match = data.avatar_url.match(/\/org-logos\/(.+?)(?:\?|$)/);
          if (match) await refreshSignedAvatar(match[1]);
          else setAvatarUrl(data.avatar_url);
        } else {
          await refreshSignedAvatar(data.avatar_url);
        }
      }
    }
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First and last name are required");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ first_name: firstName, last_name: lastName, phone: phone || null })
      .eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Profile updated");
      await supabase.from("audit_logs").insert({
        action: "profile_updated",
        user_id: user.id,
        user_name: `${firstName} ${lastName}`,
        resource_type: "user_account",
        resource_id: user.id,
        risk_level: "low",
        details: "Personal information updated",
      });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Avatar must be less than 2MB");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("org-logos").upload(path, file, { upsert: true });
    if (upErr) {
      toast.error(upErr.message);
      setUploading(false);
      return;
    }
    const { error } = await supabase.from("profiles").update({ avatar_url: path }).eq("id", user.id);
    setUploading(false);
    if (error) toast.error(error.message);
    else {
      await refreshSignedAvatar(path);
      toast.success("Avatar updated");
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", user.id);
    if (error) toast.error(error.message);
    else {
      setAvatarUrl(null);
      toast.success("Avatar removed");
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Password changed successfully");
      setNewPassword("");
      setConfirmPassword("");
      if (user) {
        await supabase.from("audit_logs").insert({
          action: "password_changed",
          user_id: user.id,
          user_name: user.email,
          resource_type: "user_account",
          resource_id: user.id,
          risk_level: "medium",
          details: "Account password was changed",
        });
      }
    }
  };

  const handleSignOut = async () => {
    if (user) {
      await supabase.from("audit_logs").insert({
        action: "sign_out",
        user_id: user.id,
        user_name: user.email,
        resource_type: "user_account",
        resource_id: user.id,
        risk_level: "low",
        details: "User signed out",
      });
    }
    await signOut();
    toast.success("Signed out");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";
  const roleLabel = userRole ? (ROLE_LABELS as Record<string, string>)[userRole] || userRole : "Member";

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft size={16} /> Back to Settings
      </button>

      <div>
        <h2 className="font-display font-bold text-xl text-foreground">My Profile</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your personal information and account security</p>
      </div>

      {/* Avatar */}
      <div className="medicare-card">
        <h3 className="font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
          <Camera size={16} className="text-primary" /> Profile Picture
        </h3>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl overflow-hidden flex-shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="gap-2">
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              {uploading ? "Uploading..." : "Upload new"}
            </Button>
            {avatarUrl && (
              <Button variant="ghost" size="sm" onClick={handleRemoveAvatar} className="text-destructive hover:text-destructive">
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="medicare-card space-y-4">
        <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
          <User size={16} className="text-primary" /> Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">First Name *</label>
            <input className="medicare-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Last Name *</label>
            <input className="medicare-input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1.5">
              <Mail size={12} /> Email
            </label>
            <input className="medicare-input bg-muted/50" value={user?.email || ""} disabled />
            <p className="text-[10px] text-muted-foreground mt-1">Contact support to change your email</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1.5">
              <Phone size={12} /> Phone
            </label>
            <input className="medicare-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+255 ..." />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Role</label>
            <input className="medicare-input bg-muted/50" value={roleLabel} disabled />
          </div>
        </div>
        <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Changes
        </Button>
      </div>

      {/* Password */}
      <div className="medicare-card space-y-4">
        <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
          <Lock size={16} className="text-primary" /> Change Password
        </h3>
        <p className="text-xs text-muted-foreground">Use at least 8 characters. Make it strong and unique.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">New Password</label>
            <input type="password" className="medicare-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Confirm New Password</label>
            <input type="password" className="medicare-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
          </div>
        </div>
        <Button onClick={handleChangePassword} disabled={changingPassword || !newPassword} className="gap-2">
          {changingPassword ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
          Update Password
        </Button>
      </div>

      {/* Two-Factor Authentication */}
      <TwoFactorSetup />

      {/* Trusted Devices */}
      <TrustedDevicesSection />

      {/* Activity Log */}
      <ActivityLog />

      {/* Danger zone */}
      <div className="medicare-card border-destructive/30 bg-destructive/5 space-y-4">
        <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
          <AlertTriangle size={16} className="text-destructive" /> Account Actions
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">Sign out of your account</p>
            <p className="text-xs text-muted-foreground mt-0.5">You'll need to sign in again to access your dashboard</p>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive">
            <LogOut size={14} />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}

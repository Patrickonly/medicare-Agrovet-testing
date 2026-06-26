import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { localDB } from "@/data/localStorageDB";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Settings, Building2, Users, Save, ArrowLeft } from "lucide-react";

type SettingsView = "menu" | "profile" | "org_profile" | "users";

const settingsSections = [
  { key: "profile" as const, icon: Users, title: "My Profile", desc: "Personal info and account" },
  { key: "org_profile" as const, icon: Building2, title: "Organization Profile", desc: "Business details" },
  { key: "users" as const, icon: Users, title: "User Management", desc: "Manage staff accounts" },
];

export default function SettingsPage() {
  const { user, organizationId, userRole } = useAuth();
  const { toast } = useToast();
  const [view, setView] = useState<SettingsView>("menu");
  const [org, setOrg] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Editable org fields
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");

  useEffect(() => {
    if (organizationId) {
      const orgData = localDB.organizations.getById(organizationId);
      setOrg(orgData);
      if (orgData) {
        setEditName(orgData.name);
        setEditPhone(orgData.phone || "");
        setEditEmail(orgData.email || "");
      }
    }
  }, [organizationId]);

  const handleSaveOrg = () => {
    if (!organizationId) return;
    setSaving(true);

    try {
      localDB.organizations.update(organizationId, {
        name: editName,
        phone: editPhone || null,
        email: editEmail || null,
      });

      toast({ title: "Organization updated", description: "Your changes have been saved" });
      setOrg(localDB.organizations.getById(organizationId));
    } catch (error) {
      toast({ title: "Error", description: "Failed to save changes", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const renderBackButton = () => (
    <Button variant="ghost" onClick={() => setView("menu")} className="mb-4">
      <ArrowLeft className="mr-2 h-4 w-4" /> Back to Settings
    </Button>
  );

  // Organization Profile View
  const renderOrgProfile = () => (
    <div className="space-y-6">
      {renderBackButton()}
      <div>
        <h2 className="font-bold text-xl text-slate-900">Organization Profile</h2>
        <p className="text-sm text-slate-500 mt-1">Manage your business details</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="rounded-xl border-slate-200 focus-visible:ring-[#0aa9ad]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="rounded-xl border-slate-200 focus-visible:ring-[#0aa9ad]"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="rounded-xl border-slate-200 focus-visible:ring-[#0aa9ad]"
              />
            </div>
          </div>

          <Button
            onClick={handleSaveOrg}
            disabled={saving}
            className="bg-[#0aa9ad] hover:bg-[#07969a] text-white rounded-xl"
          >
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {view === "menu" && (
        <div className="space-y-6">
          <div>
            <h1 className="font-bold text-2xl text-slate-900">Settings</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your organization and account</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {settingsSections.map((s) => (
              <button
                key={s.key}
                onClick={() => setView(s.key)}
                className="p-6 border border-slate-200 rounded-xl text-left hover:bg-slate-50 transition-colors"
              >
                <div className="p-3 bg-slate-100 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
                  <s.icon className="h-6 w-6 text-slate-700" />
                </div>
                <h3 className="font-semibold text-slate-900">{s.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{s.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}
      {view === "profile" && (
        <div className="space-y-6">
          {renderBackButton()}
          <div>
            <h2 className="font-bold text-xl text-slate-900">My Profile</h2>
            <p className="text-sm text-slate-500 mt-1">Manage your personal account</p>
          </div>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <p className="text-slate-500">Profile settings coming soon!</p>
            </CardContent>
          </Card>
        </div>
      )}
      {view === "org_profile" && renderOrgProfile()}
      {view === "users" && (
        <div className="space-y-6">
          {renderBackButton()}
          <div>
            <h2 className="font-bold text-xl text-slate-900">User Management</h2>
            <p className="text-sm text-slate-500 mt-1">Go to the Users page to manage staff accounts</p>
          </div>
          <Button
            onClick={() => window.location.href = "/dashboard/users"}
            className="bg-[#0aa9ad] hover:bg-[#07969a] text-white rounded-xl"
          >
            Go to Users Page
          </Button>
        </div>
      )}
    </div>
  );
}
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ROLE_LABELS } from "@/types/rbac";
import { LogOut, UserCircle, Settings, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UserMenu() {
  const navigate = useNavigate();
  const { user, userRole, signOut } = useAuth();
  const profile = useUserProfile();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const fullName = `${profile.firstName} ${profile.lastName}`.trim() || user?.email || "User";
  const roleLabel = userRole ? (ROLE_LABELS as Record<string, string>)[userRole] || userRole : "Member";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full hover:bg-secondary transition-colors p-1 pr-2 outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={fullName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs font-semibold text-primary">{profile.initials}</span>
          )}
        </div>
        <ChevronDown size={14} className="text-muted-foreground hidden sm:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex items-center gap-3 py-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-semibold text-primary">{profile.initials}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">{fullName}</p>
            <p className="text-[11px] text-muted-foreground truncate">{roleLabel}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/dashboard/settings?tab=profile" className="cursor-pointer">
            <UserCircle size={16} className="mr-2" />
            My Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/dashboard/settings" className="cursor-pointer">
            <Settings size={16} className="mr-2" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
          <LogOut size={16} className="mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

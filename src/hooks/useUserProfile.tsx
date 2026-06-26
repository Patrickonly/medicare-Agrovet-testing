
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { localDB } from "@/data/localStorageDB";

interface UserProfile {
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  initials: string;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    avatarUrl: null,
    initials: "U",
  });

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const load = async () => {
      // Load user from our localStorage DB
      const dbUser = localDB.users.getById(user.id);
      if (!dbUser || cancelled) return;

      const fn = dbUser.firstName || "";
      const ln = dbUser.lastName || "";
      const initials = `${fn[0] || ""}${ln[0] || ""}`.toUpperCase() || (dbUser.email?.[0] || "U").toUpperCase();

      if (!cancelled) {
        setProfile({ 
          firstName: fn, lastName: ln, avatarUrl: null, initials });
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return profile;
}

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from "react";
import { localDB } from "@/data/localStorageDB";
import type { User, UserRole, OrganizationType, Address } from "@/types/models";

interface SignUpMeta {
  first_name: string;
  last_name: string;
  phone?: string;
  organization_name: string;
  organization_type: OrganizationType;
  organization_business_unit?: string;
  organization_address?: Address;
  organization_tax_id?: string;
  organization_registration_number?: string;
  organization_license_number?: string;
  organization_website?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  roleLoading: boolean;
  userRole: UserRole | null;
  organizationId: string | null;
  tempUserId: string | null;

  signUp: (
    email: string,
    password: string,
    meta: SignUpMeta
  ) => Promise<{ error: any; tempUserId?: string; otp?: string }>;

  signIn: (
    identifier: string,
    password: string
  ) => Promise<{ error: any; requiresOtp?: boolean; tempUserId?: string; otp?: string }>;

  signOut: () => Promise<void>;

  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [tempUserId, setTempUserId] = useState<string | null>(null);

  const loadSession = async () => {
    try {
      const session = localDB.session.get();
      if (session) {
        const dbUser = localDB.users.getById(session.userId);
        if (dbUser) {
          setUser(dbUser);
          setUserRole(session.userRole);
          setOrganizationId(session.organizationId);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRoleLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, []);

  const signUp = async (email: string, password: string, meta: SignUpMeta) => {
    try {
      const existingUser = localDB.users.getByEmail(email);
      if (existingUser) {
        return { error: new Error("User with this email already exists") };
      }

      const tempUser = localDB.tempUsers.create({
        email,
        password,
        first_name: meta.first_name,
        last_name: meta.last_name,
        phone: meta.phone,
        organization_name: meta.organization_name,
        organization_type: meta.organization_type,
        organization_business_unit: meta.organization_business_unit,
        organization_address: meta.organization_address,
        organization_tax_id: meta.organization_tax_id,
        organization_registration_number: meta.organization_registration_number,
        organization_license_number: meta.organization_license_number,
        organization_website: meta.organization_website
      });

      setTempUserId(tempUser.id);

      return {
        error: null,
        tempUserId: tempUser.id,
        otp: tempUser.otp
      };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (identifier: string, password: string) => {
    try {
      const tempUser = localDB.tempUsers.getByEmail(identifier);
      if (tempUser) {
        if (tempUser.password === password) {
          setTempUserId(tempUser.id);
          return {
            error: null,
            requiresOtp: true,
            tempUserId: tempUser.id,
            otp: tempUser.otp
          };
        }
      }

      const user = localDB.users.getByEmail(identifier);
      if (user) {
        // If user exists, set session directly (for demo purposes)
        // First, get organization and role
        const organizations = localDB.organizations.getAll();
        const org = organizations.find(o => o.id === user.organization_id);
        
        if (org) {
          localDB.session.set({
            userId: user.id,
            organizationId: org.id,
            userRole: "admin"
          });
          
          setUser(user);
          setUserRole("admin");
          setOrganizationId(org.id);
          
          return {
            error: null,
            requiresOtp: false
          };
        }
      }

      return { error: new Error("Invalid credentials") };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    localDB.session.clear();
    setUser(null);
    setUserRole(null);
    setOrganizationId(null);
    setTempUserId(null);
  };

  const refreshRole = async () => {
    // No-op for now
  };

  const value: AuthContextType = {
    user,
    loading,
    roleLoading,
    userRole,
    organizationId,
    tempUserId,
    signUp,
    signIn,
    signOut,
    refreshRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

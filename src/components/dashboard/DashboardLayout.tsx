import { localDB } from "@/data/localStorageDB";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types/models";
import {
  BarChart3,
  Bell,
  ChevronRight,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Receipt,
  ShoppingCart,
  Truck,
  UserPlus,
  Users,
  Wifi,
  CloudOff,
  X,
  Clock,
  ClipboardList,
  Tags,
  ListTree,
  CreditCard,
  Percent,
  BookOpen,
  ShieldCheck,
  Banknote
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import UserMenu from "./UserMenu";

interface MenuItem {
  label: string;
  items: {
    icon: any;
    label: string;
    path: string;
    roles: UserRole[];
  }[];
}

const getMenuForRole = (role?: UserRole | null): MenuItem[] => {
  const baseMenu = [
    {
      label: "Dashboard",
      items: [
        { icon: LayoutDashboard, label: "Operations Dashboard", path: "/dashboard", roles: ["super_admin", "org_owner", "admin", "director", "accountant", "cashier", "cashier_agro", "cashier_vet", "pharmacist", "storekeeper"] }
      ]
    }
  ];

  if (role === "super_admin" || role === "org_owner" || role === "admin" || role === "director") {
    return [
      ...baseMenu,
      {
        label: "Sales & POS",
        items: [
          { icon: ShoppingCart, label: "Point of Sale", path: "/dashboard/pos", roles: ["super_admin", "org_owner", "admin", "cashier", "cashier_agro", "cashier_vet", "pharmacist"] },
          { icon: Clock, label: "Shift Management", path: "/dashboard/shifts", roles: ["super_admin", "org_owner", "admin"] },
          { icon: Percent, label: "Discount Requests", path: "/dashboard/discounts", roles: ["super_admin", "org_owner", "admin"] }
        ]
      },
      {
        label: "Procurement",
        items: [
          { icon: Truck, label: "Suppliers", path: "/dashboard/suppliers", roles: ["super_admin", "org_owner", "admin", "accountant", "procurement_officer"] },
          { icon: ClipboardList, label: "Purchase Orders", path: "/dashboard/purchase-orders", roles: ["super_admin", "org_owner", "admin", "procurement_officer"] }
        ]
      },
      {
        label: "Inventory",
        items: [
          { icon: Package, label: "Product Batches (Stock)", path: "/dashboard/inventory", roles: ["super_admin", "org_owner", "admin", "pharmacist", "storekeeper", "accountant"] },
          { icon: Package, label: "Products Master", path: "/dashboard/products", roles: ["super_admin", "org_owner", "admin"] },
          { icon: ListTree, label: "Categories", path: "/dashboard/categories", roles: ["super_admin", "org_owner", "admin"] },
          { icon: Tags, label: "Product Types", path: "/dashboard/product-types", roles: ["super_admin", "org_owner", "admin"] },
        ]
      },
      {
        label: "Customers",
        items: [
          { icon: Users, label: "Customer List", path: "/dashboard/customers", roles: ["super_admin", "org_owner", "admin", "cashier", "cashier_agro", "cashier_vet", "accountant"] },
        ]
      },
      {
        label: "Finance & Accounting",
        items: [
          { icon: Receipt, label: "Billing / Invoices", path: "/dashboard/billing", roles: ["super_admin", "org_owner", "admin", "accountant", "finance_manager", "cfo"] },
          { icon: CreditCard, label: "Credit Payments", path: "/dashboard/credit-payments", roles: ["super_admin", "org_owner", "admin", "accountant"] },
          { icon: BookOpen, label: "Cashbook", path: "/dashboard/cashbook", roles: ["super_admin", "org_owner", "admin", "accountant"] },
          { icon: Banknote, label: "Expenses", path: "/dashboard/expenses", roles: ["super_admin", "org_owner", "admin", "accountant"] },
        ]
      },
      {
        label: "Reports & Logs",
        items: [
          { icon: BarChart3, label: "Reports & Analytics", path: "/dashboard/reports", roles: ["super_admin", "org_owner", "admin", "accountant", "finance_manager", "cfo"] },
          { icon: ShieldCheck, label: "Audit Logs", path: "/dashboard/audit-logs", roles: ["super_admin", "org_owner"] },
        ]
      },
      {
        label: "Administration",
        items: [
          { icon: UserPlus, label: "User Management", path: "/dashboard/users", roles: ["super_admin", "org_owner", "admin", "hr_manager"] },
        ]
      }
    ];
  } else if (role === "accountant" || role === "finance_manager" || role === "cfo") {
    return [
      ...baseMenu,
      {
        label: "Finance",
        items: [
          { icon: Receipt, label: "Billing & Accounting", path: "/dashboard/billing", roles: ["accountant", "finance_manager", "cfo"] },
          { icon: CreditCard, label: "Credit Payments", path: "/dashboard/credit-payments", roles: ["accountant"] },
          { icon: BookOpen, label: "Cashbook", path: "/dashboard/cashbook", roles: ["accountant"] },
          { icon: Banknote, label: "Expenses", path: "/dashboard/expenses", roles: ["accountant"] },
          { icon: BarChart3, label: "Reports & Analytics", path: "/dashboard/reports", roles: ["accountant", "finance_manager", "cfo"] },
        ]
      }
    ];
  } else if (role === "cashier" || role === "cashier_agro" || role === "cashier_vet" || role === "pharmacist") {
    return [
      ...baseMenu,
      {
        label: "Sales",
        items: [
          { icon: Clock, label: "Shift Management", path: "/dashboard/shifts", roles: ["cashier", "cashier_agro", "cashier_vet", "pharmacist"] },
          { icon: ShoppingCart, label: "Point of Sale", path: "/dashboard/pos", roles: ["cashier", "cashier_agro", "cashier_vet", "pharmacist"] },
          { icon: Package, label: "Inventory Checks", path: "/dashboard/inventory", roles: ["cashier", "cashier_agro", "cashier_vet", "pharmacist"] },
          { icon: Users, label: "Customer List", path: "/dashboard/customers", roles: ["cashier", "cashier_agro", "cashier_vet", "pharmacist"] },
        ]
      }
    ];
  }

  return baseMenu;
};

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orgType, setOrgType] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  useEffect(() => {
    // Offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Get current session
    const session = localDB.session.get();
    if (session?.organizationId) {
      const org = localDB.organizations.getById(session.organizationId);
      if (org) {
        setOrgType(org.type);
        setUserRole(session.userRole);
        // Ensure demo data is seeded for this organization
        localDB.initDemoData(session.organizationId);
      }
    }
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const getPageTitle = (path: string) => {
    const allItems = getMenuForRole(userRole).flatMap(m => m.items);
    const item = allItems.find(i => i.path === path);
    if (item) return item.label;
    return "MEDICARE ONE";
  };

  return (
    <div className="flex min-h-screen bg-[#f5fbfb]">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-[#dcebf0] bg-[#0aa9ad] text-white transition-transform duration-300 lg:static lg:translate-x-0 lg:flex-shrink-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-white/15 px-5 py-4">
            <div className="flex items-center justify-between">
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#07969a] shadow-lg shadow-teal-950/10">
                  <HeartPulse className="h-6 w-6" />
                </div>

                <div>
                  <p className="font-heading text-sm font-extrabold tracking-wide text-white">
                    MEDICARE ONE
                  </p>
                  <p className="text-[11px] font-semibold text-white/70">
                    {orgType === "agrovet" ? "Agrovet Operations" : "Healthcare Operations"}
                  </p>
                </div>
              </Link>

              <button
                className="rounded-xl p-2 text-white/75 hover:bg-white/10 hover:text-white lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
            {getMenuForRole(userRole).map((group, groupIdx) => (
              <div key={groupIdx}>
                <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/55">
                  {group.label}
                </p>

                <div className="space-y-1">
                  {group.items.map((item, itemIdx) => {
                    const active =
                      location.pathname === item.path ||
                      (item.path !== "/dashboard" && location.pathname.startsWith(item.path));

                    return (
                      <Link
                        key={`${groupIdx}-${itemIdx}`}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`group flex items-center justify-between rounded-[1rem] px-3 py-2.5 text-sm font-bold transition ${
                          active
                            ? "bg-white text-[#07969a] shadow-lg shadow-teal-950/10"
                            : "text-white/78 hover:bg-white/12 hover:text-white"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <item.icon
                            size={18}
                            className={active ? "text-[#07969a]" : "text-white/65 group-hover:text-white"}
                          />
                          {item.label}
                        </span>

                        {active && <ChevronRight size={16} className="text-[#07969a]" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-white/15 p-3">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-[1rem] px-3 py-2.5 text-sm font-bold text-white/78 transition hover:bg-white/12 hover:text-white"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#09111f]/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#dcebf0] bg-white/90 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <button
              className="rounded-xl p-2 text-[#5f6d84] hover:bg-[#e8fbfb] hover:text-[#07969a] lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>

            <div className="min-w-0 flex items-center gap-4">
              <p className="truncate font-heading text-sm font-extrabold text-[#09111f] hidden sm:block">
                {getPageTitle(location.pathname)}
              </p>
              
              {/* Cloud / Offline Indicator */}
              <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                isOnline ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
              }`}>
                {isOnline ? <Wifi className="w-3 h-3" /> : <CloudOff className="w-3 h-3" />}
                {isOnline ? "Cloud Synced" : "Offline Mode"}
              </div>

              {/* Subscription Badge */}
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-amber-50 text-amber-700 border-amber-200">
                 <Clock className="w-3 h-3" />
                 14 Days Left
              </div>
            </div>
          </div>

          <UserMenu />
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

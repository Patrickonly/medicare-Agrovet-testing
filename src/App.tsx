
import { MfaChallengeGate } from "@/components/auth/MfaChallengeGate";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { TwoFactorGate } from "@/components/auth/TwoFactorGate";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Loader2, ShieldCheck } from "lucide-react";
import { lazy, ReactNode, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import OTPPage from "./pages/OTPPage";
import RegisterPage from "./pages/RegisterPage";
import SubscriptionPage from "./pages/SubscriptionPage";

// Public pages
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));

// Onboarding and security
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const TwoFactorUnlockPage = lazy(() => import("./pages/TwoFactorUnlockPage"));

// Admin workspace
const DashboardLayout = lazy(() => import("./components/dashboard/DashboardLayout"));
const DashboardHome = lazy(() => import("./pages/dashboard/DashboardHome"));
const POSPage = lazy(() => import("./pages/dashboard/POSPage"));
const CustomersPage = lazy(() => import("./pages/dashboard/CustomersPage"));
const AddCustomerPage = lazy(() => import("./pages/dashboard/AddCustomerPage"));
const EditCustomerPage = lazy(() => import("./pages/dashboard/EditCustomerPage"));
const SuppliersPage = lazy(() => import("./pages/dashboard/SuppliersPage"));
const AddSupplierPage = lazy(() => import("./pages/dashboard/AddSupplierPage"));
const EditSupplierPage = lazy(() => import("./pages/dashboard/EditSupplierPage"));
const ProductTypesPage = lazy(() => import("./pages/dashboard/ProductTypesPage"));
const CategoriesPage = lazy(() => import("./pages/dashboard/CategoriesPage"));
const ProductsPage = lazy(() => import("./pages/dashboard/ProductsPage"));
const ShiftManagementPage = lazy(() => import("./pages/dashboard/ShiftManagementPage"));
const PurchaseOrdersPage = lazy(() => import("./pages/dashboard/PurchaseOrdersPage"));
const CreditPaymentsPage = lazy(() => import("./pages/dashboard/CreditPaymentsPage"));
const CashbookPage = lazy(() => import("./pages/dashboard/CashbookPage"));
const ExpensesPage = lazy(() => import("./pages/dashboard/ExpensesPage"));
const AuditLogsPage = lazy(() => import("./pages/dashboard/AuditLogsPage"));
const DiscountRequestsPage = lazy(() => import("./pages/dashboard/DiscountRequestsPage"));
const InventoryPage = lazy(() => import("./pages/dashboard/InventoryPage"));
const AddInventoryPage = lazy(() => import("./pages/dashboard/AddInventoryPage"));
const EditInventoryPage = lazy(() => import("./pages/dashboard/EditInventoryPage"));
const BillingPage = lazy(() => import("./pages/dashboard/BillingPage"));
const ReportsPage = lazy(() => import("./pages/dashboard/ReportsPage"));
const SecurityAuditPage = lazy(() => import("./pages/dashboard/SecurityAuditPage"));
const SettingsPage = lazy(() => import("./pages/dashboard/SettingsPage"));
const UsersPage = lazy(() => import("./pages/dashboard/UsersPage"));
const AddUserPage = lazy(() => import("./pages/dashboard/AddUserPage"));
const EditUserPage = lazy(() => import("./pages/dashboard/EditUserPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 10,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

const RouteFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white px-8 py-7 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
        <ShieldCheck className="h-6 w-6" />
      </div>

      <div className="text-center">
        <p className="text-sm font-semibold text-slate-900">Loading MediCare workspace</p>
        <p className="mt-1 text-xs text-slate-500">Preparing secure clinical operations</p>
      </div>

      <Loader2 className="h-5 w-5 animate-spin text-blue-700" />
    </div>
  </div>
);

const SecureAppRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute>
    <MfaChallengeGate>
      <TwoFactorGate>{children}</TwoFactorGate>
    </MfaChallengeGate>
  </ProtectedRoute>
);

const SecurePortalRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute>
    <MfaChallengeGate>{children}</MfaChallengeGate>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner richColors closeButton position="top-right" />

      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/subscription" element={<SubscriptionPage />} />
              <Route path="/otp" element={<OTPPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/pricing" element={<PricingPage />} />

              {/* Onboarding */}
              <Route
                path="/onboarding"
                element={
                  <SecurePortalRoute>
                    <OnboardingPage />
                  </SecurePortalRoute>
                }
              />

              <Route
                path="/2fa-unlock"
                element={
                  <ProtectedRoute>
                    <TwoFactorUnlockPage />
                  </ProtectedRoute>
                }
              />

              {/* Administration */}
              <Route
                path="/dashboard"
                element={
                  <SecureAppRoute>
                    <DashboardLayout />
                  </SecureAppRoute>
                }
              >
                <Route index element={<DashboardHome />} />
                <Route path="pos" element={<POSPage />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="customers/add" element={<AddCustomerPage />} />
                <Route path="customers/edit/:id" element={<EditCustomerPage />} />
                <Route path="suppliers" element={<SuppliersPage />} />
                <Route path="suppliers/add" element={<AddSupplierPage />} />
                <Route path="suppliers/edit/:id" element={<EditSupplierPage />} />
                <Route path="product-types" element={<ProductTypesPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="inventory/add" element={<AddInventoryPage />} />
                <Route path="inventory/edit/:id" element={<EditInventoryPage />} />
                <Route path="billing" element={<BillingPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="security-audit" element={<SecurityAuditPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="users/add" element={<AddUserPage />} />
                <Route path="users/edit/:id" element={<EditUserPage />} />
                <Route path="shifts" element={<ShiftManagementPage />} />
                <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
                <Route path="credit-payments" element={<CreditPaymentsPage />} />
                <Route path="cashbook" element={<CashbookPage />} />
                <Route path="expenses" element={<ExpensesPage />} />
                <Route path="audit-logs" element={<AuditLogsPage />} />
                <Route path="discounts" element={<DiscountRequestsPage />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

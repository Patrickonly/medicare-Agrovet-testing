import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { localDB } from "@/data/localStorageDB";
import { useAuth } from "@/hooks/useAuth";
import {
  Banknote,
  Building,
  Calendar,
  CreditCard,
  Package,
  PieChart,
  ShoppingCart,
  TrendingUp,
  User,
  Users,
  AlertTriangle,
  Clock
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(value);

export default function DashboardHome() {
  const { user, organizationId, userRole } = useAuth();
  const [orgInfo, setOrgInfo] = useState<any>(null);
  
  // Real KPIs
  const [dailySales, setDailySales] = useState(0);
  const [monthlySales, setMonthlySales] = useState(0);
  const [todaysPurchases, setTodaysPurchases] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [expiredCount, setExpiredCount] = useState(0);
  const [expiringSoonCount, setExpiringSoonCount] = useState(0);
  const [openShift, setOpenShift] = useState<any>(null);
  const [recentSales, setRecentSales] = useState<any[]>([]);

  useEffect(() => {
    if (!organizationId) return;

    const org = localDB.organizations.getById(organizationId);
    if (org) setOrgInfo(org);

    // Sales metrics
    const sales = localDB.sales.getByOrganizationId(organizationId);
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const monthStr = todayStr.substring(0, 7); // YYYY-MM

    let dSales = 0;
    let mSales = 0;
    
    // Sort recent sales
    const sortedSales = [...sales].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setRecentSales(sortedSales.slice(0, 5));

    sales.forEach(sale => {
      const saleDateStr = sale.timestamp ? sale.timestamp.split("T")[0] : sale.created_at?.split("T")[0] || "";
      const amount = sale.total_amount || sale.total || 0;
      if (saleDateStr === todayStr) dSales += amount;
      if (saleDateStr.startsWith(monthStr)) mSales += amount;
    });

    setDailySales(dSales);
    setMonthlySales(mSales);

    // Purchases
    const pos = localDB.purchaseOrders.getByOrganizationId(organizationId);
    let dPurchases = 0;
    pos.forEach(po => {
      if (po.created_at && po.created_at.split("T")[0] === todayStr) dPurchases += po.total_amount || 0;
    });
    setTodaysPurchases(dPurchases);

    // Products & Batches
    const products = localDB.products.getByOrganizationId(organizationId);
    setTotalProducts(products.length);

    const batches = localDB.productBatches.getByOrganizationId(organizationId);
    let lowStock = 0;
    let expired = 0;
    let expiringSoon = 0;

    // Get reorder levels mapped by product ID
    const productReorderLevels: Record<string, number> = {};
    products.forEach(p => productReorderLevels[p.id] = p.reorder_level || 10);

    batches.forEach(batch => {
      if (batch.status === "active") {
        if (batch.quantity_remaining <= (productReorderLevels[batch.product_id] || 10)) {
          lowStock++;
        }
        
        if (batch.expiry_date) {
          const exp = new Date(batch.expiry_date);
          const timeDiff = exp.getTime() - now.getTime();
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
          
          if (daysDiff < 0) {
            expired++;
          } else if (daysDiff <= 30) {
            expiringSoon++;
          }
        }
      }
    });

    setLowStockCount(lowStock);
    setExpiredCount(expired);
    setExpiringSoonCount(expiringSoon);

    // Shifts
    const shifts = localDB.shifts.getByOrganizationId(organizationId);
    const activeShift = shifts.find(s => s.status === "open");
    setOpenShift(activeShift || null);

  }, [organizationId, user]);

  const commandCards = [
    {
      label: "Daily Sales",
      value: formatCurrency(dailySales),
      icon: Banknote,
      tone: "emerald",
    },
    {
      label: "Monthly Sales",
      value: formatCurrency(monthlySales),
      icon: TrendingUp,
      tone: "blue",
    },
    {
      label: "Today's Purchases",
      value: formatCurrency(todaysPurchases),
      icon: ShoppingCart,
      tone: "violet",
    },
    {
      label: "Total Products",
      value: formatNumber(totalProducts),
      icon: Package,
      tone: "orange",
    },
  ];

  const alertCards = [
    { label: "Low Stock Items", count: lowStockCount, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
    { label: "Expired Batches", count: expiredCount, color: "text-red-600", bg: "bg-red-50 border-red-200" },
    { label: "Expiring < 30 Days", count: expiringSoonCount, color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8 bg-slate-50/30 min-h-[calc(100vh-4rem)]">
      {/* Header section */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
              System Online
            </Badge>
            <Badge className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50">
              {orgInfo?.type === "agrovet" ? "Agrovet Operations" : "Healthcare Operations"}
            </Badge>
          </div>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome back, {user?.first_name || "User"} 👋
          </h1>
          <p className="mt-1 font-medium text-slate-500">
            Here's what's happening with {orgInfo?.name || "your organization"} today.
          </p>
        </div>

        {/* Subscription Status Card */}
        <div className="flex items-center gap-4 bg-amber-50/80 border border-amber-200/60 p-4 rounded-2xl shadow-sm">
          <div className="bg-amber-100 p-3 rounded-xl">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Subscription Status</p>
            <p className="text-lg font-extrabold text-amber-900">14 Days Remaining</p>
          </div>
          <div className="ml-4 pl-4 border-l border-amber-200/50">
            <Link to="/dashboard/settings" className="text-sm font-bold text-amber-700 hover:text-amber-800 hover:underline">
              Renew Now &rarr;
            </Link>
          </div>
        </div>

        <div className="flex gap-3">
          {openShift ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600/80">
                  Active Shift
                </p>
                <p className="mt-0.5 text-sm font-black text-emerald-900">
                  Opened {new Date(openShift.opened_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ) : (
             <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 shadow-sm flex items-center gap-3">
              <div className="bg-rose-100 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600/80">
                  No Active Shift
                </p>
                <Link to="/dashboard/shifts" className="mt-0.5 text-sm font-black text-rose-900 hover:underline">
                  Open Shift Now &rarr;
                </Link>
              </div>
            </div>
          )}
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Today
            </p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {commandCards.map((card) => {
          const toneClasses: Record<string, string> = {
            blue: "bg-blue-50 text-blue-700 border-blue-200",
            emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
            orange: "bg-orange-50 text-orange-700 border-orange-200",
            rose: "bg-rose-50 text-rose-700 border-rose-200",
            violet: "bg-violet-50 text-violet-700 border-violet-200",
          };
          return (
          <Card key={card.label} className="border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{card.label}</p>
                  <p className="mt-3 text-2xl font-black text-slate-950">{card.value}</p>
                </div>

                <div className={`rounded-2xl border p-3 ${toneClasses[card.tone]}`}>
                  <card.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        )})}
      </div>

      {/* Alerts & Recent Sales */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Alerts */}
        <div className="xl:col-span-1 space-y-4">
          <h2 className="text-lg font-black text-slate-900">Inventory Alerts</h2>
          {alertCards.map((alert, idx) => (
             <div key={idx} className={`rounded-2xl border p-4 flex items-center justify-between ${alert.bg}`}>
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`h-5 w-5 ${alert.color}`} />
                  <span className={`font-bold ${alert.color}`}>{alert.label}</span>
                </div>
                <span className={`text-xl font-black ${alert.color}`}>{alert.count}</span>
             </div>
          ))}
        </div>

        {/* Recent Sales List */}
        <Card className="border-slate-200 bg-white shadow-sm xl:col-span-2">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-black text-slate-950 flex justify-between items-center">
              <span>Recent Sales</span>
              <Link to="/dashboard/pos" className="text-sm text-[#0aa9ad] hover:underline">New Sale</Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {recentSales.map((sale, idx) => (
                <div key={idx} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{sale.invoice_number || sale.ebm_receipt_no || sale.id.split('-')[0].toUpperCase()}</p>
                    <p className="text-xs text-slate-500">{new Date(sale.timestamp || sale.created_at || new Date()).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600 text-sm">{formatCurrency(sale.total_amount || sale.total || 0)}</p>
                    <p className="text-xs font-semibold text-slate-500 uppercase">{sale.payment_method}</p>
                  </div>
                </div>
              ))}
              {recentSales.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  No sales recorded yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { localDB } from "@/data/localStorageDB";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Package, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  const { organizationId, userRole, user } = useAuth();
  const [sales, setSales] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    if (!organizationId) return;
    const saleItems = localDB.sales.getByOrganizationId(organizationId);
    const invItems = localDB.inventoryItems.getByOrganizationId(organizationId);
    const custItems = localDB.customers.getByOrganizationId(organizationId);
    const expItems = localDB.expenses.getByOrganizationId(organizationId);
    
    setSales(saleItems);
    setInventory(invItems);
    setCustomers(custItems);
    setExpenses(expItems);
  }, [organizationId]);

  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total_amount || sale.total || 0), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-500">Business performance overview across Weekly, Monthly, and Yearly periods</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-200" onClick={() => window.print()}>Print Report</Button>
        </div>
      </div>

      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-900">{totalRevenue.toLocaleString()} RWF</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-900">Total Expenses</p>
                <p className="text-2xl font-bold text-red-900">{totalExpenses.toLocaleString()} RWF</p>
              </div>
              <div className="p-3 bg-red-200 rounded-full">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900">Net Profit</p>
                <p className="text-2xl font-bold text-green-900">{netProfit.toLocaleString()} RWF</p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-900">Customers</p>
                <p className="text-2xl font-bold text-purple-900">{customers.length}</p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sales.slice(0, 5).map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-4 border-b">
                  <div>
                    <p className="font-medium">{sale.invoice_number || sale.id.split('-')[0].toUpperCase()}</p>
                    <p className="text-sm text-slate-500">{new Date(sale.timestamp || sale.created_at || new Date()).toLocaleDateString()}</p>
                  </div>
                  <p className="font-bold text-emerald-600">{(sale.total_amount || sale.total || 0).toLocaleString()} RWF</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cashbook Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               <div className="flex items-center justify-between p-4 border-b">
                 <p className="font-medium text-slate-600">Total Money IN</p>
                 <p className="font-bold text-emerald-600">+{totalRevenue.toLocaleString()} RWF</p>
               </div>
               <div className="flex items-center justify-between p-4 border-b">
                 <p className="font-medium text-slate-600">Total Money OUT</p>
                 <p className="font-bold text-rose-600">-{totalExpenses.toLocaleString()} RWF</p>
               </div>
               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                 <p className="font-bold text-slate-900">Net Cash Position</p>
                 <p className={`font-black ${netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                   {netProfit >= 0 ? "+" : ""}{netProfit.toLocaleString()} RWF
                 </p>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

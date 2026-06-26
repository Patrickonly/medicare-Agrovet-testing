import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { localDB, now } from "@/data/localStorageDB";
import { useAuth } from "@/hooks/useAuth";
import { CreditCard, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function CreditPaymentsPage() {
  const { organizationId, user } = useAuth();
  const { toast } = useToast();
  const [payments, setPayments] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ customer_id: "", amount_paid: 0, payment_method: "Cash" });

  useEffect(() => {
    if (!organizationId) return;
    fetchData();
  }, [organizationId]);

  const fetchData = () => {
    const all = localDB.creditPayments.getByOrganizationId(organizationId!);
    all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setPayments(all);
    setCustomers(localDB.customers.getByOrganizationId(organizationId!));
  };

  const handleSave = () => {
    if (!formData.customer_id || formData.amount_paid <= 0) {
      return toast({ title: "Error", description: "Select a customer and enter a valid amount.", variant: "destructive" });
    }

    // Record Payment
    localDB.creditPayments.create({
      organization_id: organizationId!,
      customer_id: formData.customer_id,
      amount_paid: formData.amount_paid,
      payment_method: formData.payment_method,
      received_by: user?.id || "unknown",
      date: now()
    });

    // Add to Cashbook
    const cust = customers.find(c => c.id === formData.customer_id);
    localDB.cashbook.create({
      organization_id: organizationId!,
      transaction_type: "IN",
      category: "Credit Payment",
      description: `Payment from ${cust?.name || "Customer"}`,
      amount: formData.amount_paid,
      date: now()
    });

    // Update Customer Balance (Simulated reduction in credit limit consumed)
    if (cust) {
      localDB.customers.update(cust.id, {
        current_balance: Math.max(0, (cust.current_balance || 0) - formData.amount_paid)
      });
    }

    toast({ title: "Payment Received", description: "Payment logged and cashbook updated.", variant: "success" });
    setIsDialogOpen(false);
    fetchData();
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this payment? (Cashbook entry will not be automatically reversed)")) {
      localDB.creditPayments.delete(id);
      toast({ title: "Deleted", description: "Payment removed." });
      fetchData();
    }
  };

  const getCustomerName = (id: string) => {
    const c = customers.find(c => c.id === id);
    return c ? c.name : "Unknown";
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Credit Payments</h1>
          <p className="text-slate-500">Record payments received from customers for outstanding credit balances.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-[#0aa9ad] hover:bg-[#07969a] rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> Receive Payment
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-2xl">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#0aa9ad]" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{new Date(payment.date).toLocaleString()}</TableCell>
                  <TableCell className="font-semibold">{getCustomerName(payment.customer_id)}</TableCell>
                  <TableCell className="font-bold text-emerald-600">+{payment.amount_paid.toLocaleString()} RWF</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">{payment.payment_method}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(payment.id)} className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">No credit payments recorded.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Receive Credit Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Customer</Label>
              <Select 
                value={formData.customer_id} 
                onValueChange={(val) => setFormData({...formData, customer_id: val})}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select Customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name} {c.current_balance > 0 ? `(Owes: ${c.current_balance} RWF)` : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount Paid (RWF) *</Label>
              <Input 
                type="number"
                value={formData.amount_paid} 
                onChange={(e) => setFormData({...formData, amount_paid: Number(e.target.value)})}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select 
                value={formData.payment_method} 
                onValueChange={(val) => setFormData({...formData, payment_method: val})}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleSave} className="bg-[#0aa9ad] hover:bg-[#07969a] rounded-xl">Save Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

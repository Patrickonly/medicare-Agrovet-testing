import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { localDB } from "@/data/localStorageDB";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Edit2, FileText, Plus, Trash2, UserSquare2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CustomersPage() {
  const { organizationId, userRole, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isStatementDialogOpen, setIsStatementDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerToDelete, setCustomerToDelete] = useState<any>(null);

  useEffect(() => {
    if (!organizationId) return;
    const customerItems = localDB.customers.getByOrganizationId(organizationId);
    
    const enrichedCustomers = customerItems.map(c => {
      return {
        ...c,
        outstanding_balance: c.current_balance || 0
      };
    });

    setCustomers(enrichedCustomers);
  }, [organizationId]);

  const handleDeleteCustomer = (id: string) => {
    localDB.customers.delete(id);
    toast({ title: "Customer Deleted", description: `Customer has been removed successfully.` });
    setCustomers(customers.filter(customer => customer.id !== id));
    setCustomerToDelete(null);
  };

  const openStatement = (customer: any) => {
    setSelectedCustomer(customer);
    setIsStatementDialogOpen(true);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.phone && c.phone.includes(searchQuery))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customer Management</h1>
          <p className="text-slate-500">Track profiles, credit limits, and outstanding balances</p>
        </div>
        <Button onClick={() => navigate("/dashboard/customers/add")} className="bg-[#0aa9ad] hover:bg-[#07969a]">
          <Plus className="w-4 h-4 mr-2" /> Add Customer
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3">
          <CardTitle className="text-lg">Customer Directory</CardTitle>
          <div className="w-full sm:w-72">
            <Input 
              placeholder="Search by name, email, or phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700">Customer</TableHead>
                <TableHead className="font-semibold text-slate-700">Contact Info</TableHead>
                <TableHead className="font-semibold text-slate-700">Credit Limit</TableHead>
                <TableHead className="font-semibold text-orange-600">Outstanding Balance</TableHead>
                <TableHead className="font-semibold text-slate-700">Total Purchases</TableHead>
                <TableHead className="font-semibold text-right text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => {
                  const limitRatio = customer.credit_limit > 0 ? (customer.outstanding_balance / customer.credit_limit) * 100 : 0;
                  const isOverdue = limitRatio > 90;
                  
                  return (
                    <TableRow key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <UserSquare2 className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{customer.name}</p>
                            <p className="text-xs text-slate-400">ID: {customer.id.slice(0,8)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-slate-700">{customer.phone}</p>
                        <p className="text-xs text-slate-500">{customer.email || "No email"}</p>
                      </TableCell>
                      <TableCell className="font-medium">{customer.credit_limit.toLocaleString()} RWF</TableCell>
                      <TableCell>
                        <span className={`font-bold ${isOverdue ? 'text-red-600' : 'text-slate-900'}`}>
                          {customer.outstanding_balance.toLocaleString()} RWF
                        </span>
                        {customer.credit_limit > 0 && (
                          <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                            <div className={`h-1.5 rounded-full ${isOverdue ? 'bg-red-500' : 'bg-orange-400'}`} style={{ width: `${Math.min(limitRatio, 100)}%` }}></div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{customer.total_purchases}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openStatement(customer)} className="text-slate-500 hover:text-[#0aa9ad]">
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/customers/edit/${customer.id}`)} className="text-slate-500 hover:text-blue-600">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => setCustomerToDelete(customer)} className="text-slate-500 hover:text-red-600">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete {customer.name}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteCustomer(customer.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredCustomers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                      {searchQuery ? "No customers found matching search." : "No customers found. Click 'Add Customer'."}
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Customer Statement Dialog */}
      <Dialog open={isStatementDialogOpen} onOpenChange={setIsStatementDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Customer Statement</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="py-4 space-y-6">
              <div className="flex justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Account Name</p>
                  <p className="text-lg font-black text-slate-900">{selectedCustomer.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Outstanding Balance</p>
                  <p className="text-xl font-black text-orange-600">{selectedCustomer.outstanding_balance.toLocaleString()} RWF</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-3 border-b border-slate-200 pb-2">Recent Transactions</h4>
                <div className="space-y-3">
                  {/* Mocked Transactions */}
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-semibold">Invoice #INV-9821</p>
                      <p className="text-xs text-slate-500">Oct 24, 2026 - Credit Sale</p>
                    </div>
                    <div className="text-right">
                      <p className="text-orange-600 font-medium">+15,000 RWF</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-semibold">Payment Received</p>
                      <p className="text-xs text-slate-500">Oct 10, 2026 - MoMo Transfer</p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-600 font-medium">-10,000 RWF</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsStatementDialogOpen(false)}>Close</Button>
            <Button className="bg-[#09111f]">Print Statement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

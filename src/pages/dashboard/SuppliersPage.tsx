import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { localDB } from "@/data/localStorageDB";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Building2, Edit2, FileText, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SuppliersPage() {
  const { organizationId, userRole, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPODialogOpen, setIsPODialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<any>(null);

  useEffect(() => {
    if (!organizationId) return;
    const items = localDB.suppliers.getByOrganizationId(organizationId);
    
    // Enrich with outstanding balances (mock)
    const enriched = items.map(s => ({
      ...s,
      outstanding_balance: s.outstanding_balance || 0,
      payment_terms: s.payment_terms || "Net 30"
    }));
    
    setSuppliers(enriched);
  }, [organizationId]);

  const handleDeleteSupplier = (id: string) => {
    localDB.suppliers.delete(id);
    toast({ title: "Supplier Deleted", description: `Supplier has been removed successfully.` });
    setSuppliers(suppliers.filter(s => s.id !== id));
    setSupplierToDelete(null);
  };

  const openPO = (supplier: any) => {
    setSelectedSupplier(supplier);
    setIsPODialogOpen(true);
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.phone && s.phone.includes(searchQuery))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Supplier Management</h1>
          <p className="text-slate-500">Manage vendors, purchase orders, and payables</p>
        </div>
        <Button onClick={() => navigate("/dashboard/suppliers/add")} className="bg-[#0aa9ad] hover:bg-[#07969a]">
          <Plus className="w-4 h-4 mr-2" /> Add Supplier
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3">
          <CardTitle className="text-lg">Supplier Directory</CardTitle>
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
                <TableHead className="font-semibold text-slate-700">Supplier Details</TableHead>
                <TableHead className="font-semibold text-slate-700">Contact Info</TableHead>
                <TableHead className="font-semibold text-slate-700">Payment Terms</TableHead>
                <TableHead className="font-semibold text-orange-600">Outstanding Payable</TableHead>
                <TableHead className="font-semibold text-right text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{supplier.name}</p>
                        <p className="text-xs text-slate-400">Rep: {supplier.contact_person}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-slate-700">{supplier.phone}</p>
                    <p className="text-xs text-slate-500">{supplier.email || "No email"}</p>
                  </TableCell>
                  <TableCell>
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-semibold">
                      {supplier.payment_terms}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`font-bold ${supplier.outstanding_balance > 0 ? 'text-orange-600' : 'text-slate-900'}`}>
                      {supplier.outstanding_balance.toLocaleString()} RWF
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openPO(supplier)} className="text-slate-500 hover:text-[#0aa9ad]" title="Create Purchase Order">
                        <ShoppingBag className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-slate-500 hover:text-teal-600" title="Supplier Statement">
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/suppliers/edit/${supplier.id}`)} className="text-slate-500 hover:text-blue-600">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSupplierToDelete(supplier)} className="text-slate-500 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the supplier {supplier.name}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteSupplier(supplier.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredSuppliers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                    {searchQuery ? "No suppliers found matching search." : "No suppliers found. Click 'Add Supplier'."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create PO Dialog */}
      <Dialog open={isPODialogOpen} onOpenChange={setIsPODialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
          </DialogHeader>
          {selectedSupplier && (
            <div className="py-4 space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 mb-4">
                Ordering from: <span className="font-bold text-slate-900">{selectedSupplier.name}</span>
              </div>
              <div className="space-y-2">
                <Label>Items to Order</Label>
                <Input placeholder="e.g. Paracetamol 500mg, Amoxil" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Expected Delivery Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Estimated Total (RWF)</Label>
                  <Input type="number" placeholder="0" />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsPODialogOpen(false)}>Cancel</Button>
            <Button className="bg-[#09111f]">Generate PO Document</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { localDB, now } from "@/data/localStorageDB";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ClipboardList, Edit2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PurchaseOrdersPage() {
  const { organizationId, user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [formData, setFormData] = useState({ supplier_id: "", total_amount: 0, status: "Draft" });

  useEffect(() => {
    if (!organizationId) return;
    fetchData();
  }, [organizationId]);

  const fetchData = () => {
    const all = localDB.purchaseOrders.getByOrganizationId(organizationId!);
    all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setOrders(all);
    setSuppliers(localDB.suppliers.getByOrganizationId(organizationId!));
  };

  const handleOpenDialog = (order: any = null) => {
    setEditingOrder(order);
    setFormData({
      supplier_id: order ? order.supplier_id : "",
      total_amount: order ? order.total_amount : 0,
      status: order ? order.status : "Draft"
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.supplier_id) return toast({ title: "Error", description: "Supplier is required", variant: "destructive" });
    
    if (editingOrder) {
      localDB.purchaseOrders.update(editingOrder.id, { ...formData });
      toast({ title: "Success", description: "Purchase order updated.", variant: "success" });
    } else {
      localDB.purchaseOrders.create({
        organization_id: organizationId!,
        supplier_id: formData.supplier_id,
        status: formData.status,
        total_amount: formData.total_amount,
        created_by: user?.id || "unknown",
        created_at: now()
      });
      toast({ title: "Success", description: "Purchase order created.", variant: "success" });
    }
    
    setIsDialogOpen(false);
    fetchData();
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this purchase order?")) {
      localDB.purchaseOrders.delete(id);
      toast({ title: "Deleted", description: "Order removed." });
      fetchData();
    }
  };

  const getSupplierName = (id: string) => {
    const sup = suppliers.find(s => s.id === id);
    return sup ? sup.name : "Unknown";
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Purchase Orders</h1>
          <p className="text-slate-500">Manage orders placed to your suppliers.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-[#0aa9ad] hover:bg-[#07969a] rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> Create PO
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-2xl">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#0aa9ad]" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{new Date(order.created_at).toLocaleString()}</TableCell>
                  <TableCell className="font-semibold">{getSupplierName(order.supplier_id)}</TableCell>
                  <TableCell className="font-bold text-emerald-600">{order.total_amount} RWF</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={order.status === "Draft" ? "bg-slate-100" : "bg-blue-50 text-blue-700 border-blue-200"}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(order)} className="text-blue-600">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(order.id)} className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">No purchase orders found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingOrder ? "Edit Order" : "New Purchase Order"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Supplier *</Label>
              <Select 
                value={formData.supplier_id} 
                onValueChange={(val) => setFormData({...formData, supplier_id: val})}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select Supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Amount (RWF)</Label>
                <Input 
                  type="number"
                  value={formData.total_amount} 
                  onChange={(e) => setFormData({...formData, total_amount: Number(e.target.value)})}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(val) => setFormData({...formData, status: val})}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Sent">Sent</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleSave} className="bg-[#0aa9ad] hover:bg-[#07969a] rounded-xl">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

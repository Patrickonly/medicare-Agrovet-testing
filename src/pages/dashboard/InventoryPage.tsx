import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { localDB, generateId, now } from "@/data/localStorageDB";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { AlertTriangle, Download, Edit2, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function InventoryPage() {
  const { organizationId, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [batches, setBatches] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [selectedBatchForAdjust, setSelectedBatchForAdjust] = useState<any>(null);
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustReason, setAdjustReason] = useState("damage");

  useEffect(() => {
    loadInventory();
  }, [organizationId]);

  const loadInventory = () => {
    if (!organizationId) return;
    const b = localDB.productBatches.getByOrganizationId(organizationId);
    const p = localDB.products.getByOrganizationId(organizationId);
    const c = localDB.categories.getByOrganizationId(organizationId);
    
    // Sort by FEFO
    b.sort((a, b) => {
      if (!a.expiry_date) return 1;
      if (!b.expiry_date) return -1;
      return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
    });

    setBatches(b);
    setProducts(p);
    setCategories(c);
  };

  const getFullItem = (batch: any) => {
    const product = products.find(p => p.id === batch.product_id) || { name: "Unknown Product", category_id: "", reorder_level: 10 };
    const category = categories.find(c => c.id === product.category_id) || { name: "Unknown Category" };
    return {
      ...batch,
      product_name: product.name,
      category_name: category.name,
      reorder_level: product.reorder_level
    };
  };

  const handleDeleteBatch = (id: string) => {
    localDB.productBatches.delete(id);
    toast({ title: "Batch Deleted", description: `Product batch has been removed.` });
    loadInventory();
  };

  const handleAdjustStock = () => {
    if (!selectedBatchForAdjust || !user) return;
    
    const newQty = selectedBatchForAdjust.quantity_remaining + adjustQty;
    if (newQty < 0) {
      toast({ title: "Invalid Adjustment", description: "Stock cannot be negative.", variant: "destructive" });
      return;
    }

    localDB.productBatches.update(selectedBatchForAdjust.id, {
      quantity_remaining: newQty
    });

    // Determine movement type
    const mTypes = localDB.movementTypes.getByOrganizationId(organizationId!);
    let mType = mTypes.find(m => m.name.toLowerCase().includes("adjustment"));
    if (!mType) {
      mType = localDB.movementTypes.create({ organization_id: organizationId!, name: "ADJUSTMENT" });
    }

    // Record Movement
    localDB.inventoryMovements.create({
      organization_id: organizationId!,
      product_id: selectedBatchForAdjust.product_id,
      batch_id: selectedBatchForAdjust.id,
      movement_type_id: mType.id,
      quantity: adjustQty,
      reference_id: adjustReason,
      user_id: user.id,
      timestamp: now()
    });

    toast({ title: "Stock Adjusted", description: `Inventory updated by ${adjustQty > 0 ? '+' : ''}${adjustQty}.` });
    setIsAdjustDialogOpen(false);
    loadInventory();
  };

  const openAdjustDialog = (item: any) => {
    setSelectedBatchForAdjust(item);
    setAdjustQty(0);
    setAdjustReason("damage");
    setIsAdjustDialogOpen(true);
  };

  const checkExpiryStatus = (dateStr: string) => {
    if (!dateStr) return { label: "N/A", color: "text-slate-500" };
    const days = Math.ceil((new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    if (days < 0) return { label: "Expired", color: "text-red-600 font-bold" };
    if (days <= 30) return { label: `${days} days left`, color: "text-orange-600 font-bold" };
    return { label: new Date(dateStr).toLocaleDateString(), color: "text-slate-600" };
  };

  const enrichedItems = batches.map(getFullItem);
  const filteredItems = enrichedItems.filter(item => 
    item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.category_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.batch_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
          <p className="text-slate-500">Real-time stock monitoring, Batch/Lot & FEFO tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white">
            <Download className="w-4 h-4 mr-2" /> Audit Trail
          </Button>
          <Button onClick={() => navigate("/dashboard/inventory/add")} className="bg-[#0aa9ad] hover:bg-[#07969a]">
            <Plus className="w-4 h-4 mr-2" /> Receive Stock (GRN)
          </Button>
        </div>
      </div>

      <div className="grid gap-6 mb-8">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3">
            <CardTitle className="text-lg flex flex-col sm:flex-row sm:items-center gap-3">
              <span>Stock Levels (Batches)</span>
              <span className="text-[10px] font-normal text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200 uppercase tracking-wider">Sorted by FEFO</span>
            </CardTitle>
            <div className="w-full sm:w-72">
              <Input 
                placeholder="Search products or batches..." 
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
                  <TableHead className="font-semibold text-slate-700">Product</TableHead>
                  <TableHead className="font-semibold text-slate-700">Batch & Expiry</TableHead>
                  <TableHead className="font-semibold text-slate-700">Quantity</TableHead>
                  <TableHead className="font-semibold text-slate-700">Value</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="font-semibold text-right text-slate-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const expiryInfo = checkExpiryStatus(item.expiry_date);
                  const status = item.quantity_remaining === 0 ? "out_of_stock" : 
                                 item.quantity_remaining <= item.reorder_level ? "low_stock" : "in_stock";
                  
                  return (
                    <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell>
                        <p className="font-bold text-slate-900">{item.product_name}</p>
                        <p className="text-xs text-slate-400">{item.category_name}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-slate-700 font-medium">Batch: {item.batch_number}</p>
                        <p className={`text-xs mt-0.5 ${expiryInfo.color} flex items-center gap-1`}>
                          {expiryInfo.label === "Expired" || expiryInfo.label.includes("days left") ? <AlertTriangle className="w-3 h-3" /> : null}
                          Exp: {expiryInfo.label}
                        </p>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold">{item.quantity_remaining}</span>
                        <span className="text-xs text-slate-400 ml-1">units</span>
                      </TableCell>
                      <TableCell>
                        <p>{item.selling_price.toLocaleString()} RWF</p>
                        <p className="text-xs text-slate-400">Total: {(item.quantity_remaining * item.selling_price).toLocaleString()} RWF</p>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          status === "in_stock" ? "bg-emerald-100 text-emerald-700" :
                          status === "low_stock" ? "bg-orange-100 text-orange-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {status.replace("_", " ")}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openAdjustDialog(item)} className="text-slate-500 hover:text-blue-600">
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-slate-500 hover:text-red-600">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete batch {item.batch_number}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteBatch(item.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                      {searchQuery ? "No batches found matching search." : "No inventory found. Click 'Receive Stock' to add batches."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Adjust Stock Dialog */}
      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Adjust Batch Level</DialogTitle>
          </DialogHeader>
          {selectedBatchForAdjust && (
            <div className="py-4 space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">{selectedBatchForAdjust.product_name}</p>
                <p className="text-xs text-slate-500">Batch {selectedBatchForAdjust.batch_number} - Current Stock: {selectedBatchForAdjust.quantity_remaining}</p>
              </div>
              <div className="space-y-2">
                <Label>Adjustment Quantity (+ or -)</Label>
                <Input 
                  type="number" 
                  value={adjustQty} 
                  onChange={(e) => setAdjustQty(Number(e.target.value))} 
                  placeholder="-5 or +10"
                />
                <p className="text-xs text-slate-400">New Total will be: {selectedBatchForAdjust.quantity_remaining + adjustQty}</p>
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Select value={adjustReason} onValueChange={setAdjustReason}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="damage">Damaged/Spoiled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="audit">Audit Correction</SelectItem>
                    <SelectItem value="internal">Internal Use</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAdjustDialogOpen(false)}>Cancel</Button>
            <Button className="bg-[#09111f]" onClick={handleAdjustStock}>Save Adjustment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

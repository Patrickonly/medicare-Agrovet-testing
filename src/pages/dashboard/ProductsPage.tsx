import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { localDB } from "@/data/localStorageDB";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Edit2, Package, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function ProductsPage() {
  const { organizationId } = useAuth();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  const [formData, setFormData] = useState({ 
    name: "", 
    category_id: "",
    barcode: "",
    unit_of_measure: "Piece",
    reorder_level: 10,
    is_active: true
  });

  useEffect(() => {
    if (!organizationId) return;
    setProducts(localDB.products.getByOrganizationId(organizationId));
    setCategories(localDB.categories.getByOrganizationId(organizationId));
  }, [organizationId]);

  const handleOpenDialog = (prod: any = null) => {
    setEditingProduct(prod);
    setFormData({ 
      name: prod ? prod.name : "",
      category_id: prod ? prod.category_id : "",
      barcode: prod ? prod.barcode : "",
      unit_of_measure: prod ? prod.unit_of_measure : "Piece",
      reorder_level: prod ? prod.reorder_level : 10,
      is_active: prod ? prod.is_active : true
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!organizationId) return;
    if (!formData.name || !formData.category_id) {
      toast({ title: "Error", description: "Name and Category are required", variant: "destructive" });
      return;
    }

    if (editingProduct) {
      localDB.products.update(editingProduct.id, { ...formData });
      toast({ title: "Success", description: "Product updated.", variant: "success" });
    } else {
      localDB.products.create({ 
        organization_id: organizationId, 
        ...formData 
      });
      toast({ title: "Success", description: "Product added.", variant: "success" });
    }

    setProducts(localDB.products.getByOrganizationId(organizationId));
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product? This could affect inventory batches and sales history.")) {
      localDB.products.delete(id);
      toast({ title: "Deleted", description: "Product removed." });
      setProducts(localDB.products.getByOrganizationId(organizationId!));
    }
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.barcode && p.barcode.includes(searchQuery))
  );

  const getCategoryName = (id: string) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : "Unknown Category";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products Master List</h1>
          <p className="text-slate-500">Define the core products before receiving batches in inventory.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-[#0aa9ad] hover:bg-[#07969a] rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-2xl">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5 text-[#0aa9ad]" />
            Products Dictionary
          </CardTitle>
          <div className="w-64">
            <Input 
              placeholder="Search by name or barcode..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 rounded-xl"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>UoM</TableHead>
                <TableHead>Reorder Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[150px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((prod) => (
                <TableRow key={prod.id}>
                  <TableCell className="font-bold text-slate-900">{prod.name}</TableCell>
                  <TableCell className="text-slate-500">{prod.barcode || "-"}</TableCell>
                  <TableCell className="text-slate-500">{getCategoryName(prod.category_id)}</TableCell>
                  <TableCell className="text-slate-500">{prod.unit_of_measure}</TableCell>
                  <TableCell className="text-slate-500">{prod.reorder_level}</TableCell>
                  <TableCell>
                    {prod.is_active ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
                    ) : (
                      <Badge className="bg-slate-50 text-slate-500 border-slate-200">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(prod)} className="text-blue-600">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(prod.id)} className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">No products found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
            <DialogDescription>
              Define the master product record. Batches and pricing will be handled in inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Product Name *</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Amoxil 500mg"
                className="rounded-xl"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Barcode</Label>
                <Input 
                  value={formData.barcode} 
                  onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                  placeholder="Optional"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Unit of Measure *</Label>
                <Select 
                  value={formData.unit_of_measure} 
                  onValueChange={(val) => setFormData({...formData, unit_of_measure: val})}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select UoM" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Piece">Piece</SelectItem>
                    <SelectItem value="Box">Box</SelectItem>
                    <SelectItem value="Bottle">Bottle</SelectItem>
                    <SelectItem value="Kg">Kg</SelectItem>
                    <SelectItem value="Liter">Liter</SelectItem>
                    <SelectItem value="Pack">Pack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select 
                  value={formData.category_id} 
                  onValueChange={(val) => setFormData({...formData, category_id: val})}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                    {categories.length === 0 && (
                      <SelectItem value="none" disabled>No Categories available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reorder Level</Label>
                <Input 
                  type="number"
                  value={formData.reorder_level} 
                  onChange={(e) => setFormData({...formData, reorder_level: parseInt(e.target.value) || 0})}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch 
                checked={formData.is_active} 
                onCheckedChange={(val) => setFormData({...formData, is_active: val})}
                id="active"
              />
              <Label htmlFor="active">Product is Active</Label>
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

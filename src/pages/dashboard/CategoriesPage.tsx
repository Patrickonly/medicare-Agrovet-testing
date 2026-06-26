import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { localDB } from "@/data/localStorageDB";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Edit2, ListTree, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CategoriesPage() {
  const { organizationId } = useAuth();
  const { toast } = useToast();
  
  const [categories, setCategories] = useState<any[]>([]);
  const [productTypes, setProductTypes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", product_type_id: "" });

  useEffect(() => {
    if (!organizationId) return;
    setCategories(localDB.categories.getByOrganizationId(organizationId));
    setProductTypes(localDB.productTypes.getByOrganizationId(organizationId));
  }, [organizationId]);

  const handleOpenDialog = (cat: any = null) => {
    setEditingCategory(cat);
    setFormData({ 
      name: cat ? cat.name : "",
      product_type_id: cat ? cat.product_type_id : ""
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!organizationId) return;
    if (!formData.name || !formData.product_type_id) {
      toast({ title: "Error", description: "Name and Product Type are required", variant: "destructive" });
      return;
    }

    if (editingCategory) {
      localDB.categories.update(editingCategory.id, { 
        name: formData.name, 
        product_type_id: formData.product_type_id 
      });
      toast({ title: "Success", description: "Category updated.", variant: "success" });
    } else {
      localDB.categories.create({ 
        organization_id: organizationId, 
        name: formData.name,
        product_type_id: formData.product_type_id 
      });
      toast({ title: "Success", description: "Category added.", variant: "success" });
    }

    setCategories(localDB.categories.getByOrganizationId(organizationId));
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this category? Products under it might be orphaned.")) {
      localDB.categories.delete(id);
      toast({ title: "Deleted", description: "Category removed." });
      setCategories(localDB.categories.getByOrganizationId(organizationId!));
    }
  };

  const filtered = categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const getProductTypeName = (id: string) => {
    const type = productTypes.find(t => t.id === id);
    return type ? type.name : "Unknown Type";
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="text-slate-500">Manage sub-categories linked to Master Product Types.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-[#0aa9ad] hover:bg-[#07969a] rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> Add Category
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-2xl">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ListTree className="w-5 h-5 text-[#0aa9ad]" />
            Categories
          </CardTitle>
          <div className="w-64">
            <Input 
              placeholder="Search categories..." 
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
                <TableHead>Category Name</TableHead>
                <TableHead>Product Type</TableHead>
                <TableHead className="w-[150px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-semibold text-slate-900">{cat.name}</TableCell>
                  <TableCell className="text-slate-500">{getProductTypeName(cat.product_type_id)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(cat)} className="text-blue-600">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(cat.id)} className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-slate-500">No categories found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
            <DialogDescription>
              Assign this category to a master Product Type.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Antibiotics"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Parent Product Type</Label>
              <Select 
                value={formData.product_type_id} 
                onValueChange={(val) => setFormData({...formData, product_type_id: val})}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select Product Type" />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map(pt => (
                    <SelectItem key={pt.id} value={pt.id}>{pt.name}</SelectItem>
                  ))}
                  {productTypes.length === 0 && (
                    <SelectItem value="none" disabled>No Product Types available</SelectItem>
                  )}
                </SelectContent>
              </Select>
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

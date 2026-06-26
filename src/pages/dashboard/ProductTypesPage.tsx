import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { localDB } from "@/data/localStorageDB";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Edit2, Plus, Tags, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function ProductTypesPage() {
  const { organizationId } = useAuth();
  const { toast } = useToast();
  const [productTypes, setProductTypes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "" });

  useEffect(() => {
    if (!organizationId) return;
    setProductTypes(localDB.productTypes.getByOrganizationId(organizationId));
  }, [organizationId]);

  const handleOpenDialog = (type: any = null) => {
    setEditingType(type);
    setFormData({ name: type ? type.name : "" });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!organizationId) return;
    if (!formData.name) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" });
      return;
    }

    if (editingType) {
      localDB.productTypes.update(editingType.id, { name: formData.name });
      toast({ title: "Success", description: "Product type updated.", variant: "success" });
    } else {
      localDB.productTypes.create({ organization_id: organizationId, name: formData.name });
      toast({ title: "Success", description: "Product type added.", variant: "success" });
    }

    setProductTypes(localDB.productTypes.getByOrganizationId(organizationId));
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product type? Categories under it might be orphaned.")) {
      localDB.productTypes.delete(id);
      toast({ title: "Deleted", description: "Product type removed." });
      setProductTypes(localDB.productTypes.getByOrganizationId(organizationId!));
    }
  };

  const filtered = productTypes.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Product Types</h1>
          <p className="text-slate-500">Manage high-level product classifications (e.g. Agro Inputs, Vet Medicine).</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-[#0aa9ad] hover:bg-[#07969a] rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> Add Type
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-2xl">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Tags className="w-5 h-5 text-[#0aa9ad]" />
            Master Types
          </CardTitle>
          <div className="w-64">
            <Input 
              placeholder="Search types..." 
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
                <TableHead>Type Name</TableHead>
                <TableHead className="w-[150px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="font-semibold text-slate-900">{type.name}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(type)} className="text-blue-600">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(type.id)} className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8 text-slate-500">No product types found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingType ? "Edit Product Type" : "Add Product Type"}</DialogTitle>
            <DialogDescription>
              A product type is a top-level classification above categories.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Consumables"
                className="rounded-xl"
              />
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

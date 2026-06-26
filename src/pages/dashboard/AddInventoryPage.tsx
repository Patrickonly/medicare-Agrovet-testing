import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { localDB, now } from "@/data/localStorageDB";
import { ArrowLeft, PackagePlus, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AddInventoryPage() {
  const navigate = useNavigate();

  const { organizationId, user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [categories, setCategories] = useState<any[]>([]);
  
  useEffect(() => {
    if (organizationId) {
      setCategories(localDB.categories.getByOrganizationId(organizationId));
    }
  }, [organizationId]);

  const [formData, setFormData] = useState({
    product_name: "",
    category_id: "new",
    new_category_name: "",
    unit_of_measure: "Pieces",
    reorder_level: 10,
    batch_number: "",
    expiry_date: "",
    quantity: 0,
    unit_cost: 0,
    selling_price: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId || !user) return;

    setLoading(true);

    try {
      // 1. Resolve Category
      let catId = formData.category_id;
      if (catId === "new") {
        if (!formData.new_category_name) {
          toast.error("Category name required");
          setLoading(false);
          return;
        }
        // Just create a default product type if none exists
        let pTypes = localDB.productTypes.getByOrganizationId(organizationId);
        let pType = pTypes[0];
        if (!pType) {
          pType = localDB.productTypes.create({ organization_id: organizationId, name: "General Goods" });
        }
        
        const newCat = localDB.categories.create({
          organization_id: organizationId,
          product_type_id: pType.id,
          name: formData.new_category_name
        });
        catId = newCat.id;
      }

      // 2. Resolve Product (Find or Create)
      let products = localDB.products.getByOrganizationId(organizationId);
      let product = products.find(p => p.name.toLowerCase() === formData.product_name.toLowerCase());
      
      if (!product) {
        product = localDB.products.create({
          organization_id: organizationId,
          category_id: catId,
          name: formData.product_name,
          unit_of_measure: formData.unit_of_measure,
          reorder_level: formData.reorder_level,
          is_active: true
        });
      }

      // 3. Create Product Batch
      const batch = localDB.productBatches.create({
        organization_id: organizationId,
        product_id: product.id,
        batch_number: formData.batch_number || `B-${Date.now().toString().slice(-6)}`,
        expiry_date: formData.expiry_date,
        quantity_remaining: formData.quantity,
        unit_cost: formData.unit_cost,
        selling_price: formData.selling_price
      });

      // 4. Create Movement Type if needed & Record Movement
      let mTypes = localDB.movementTypes.getByOrganizationId(organizationId);
      let mType = mTypes.find(m => m.name === "IN - Purchase");
      if (!mType) {
        mType = localDB.movementTypes.create({ organization_id: organizationId, name: "IN - Purchase" });
      }

      localDB.inventoryMovements.create({
        organization_id: organizationId,
        product_id: product.id,
        batch_id: batch.id,
        movement_type_id: mType.id,
        quantity: formData.quantity,
        reference_id: "Manual Entry",
        user_id: user.id,
        timestamp: now()
      });

      toast.success("Stock Received", {
        description: `Successfully added ${formData.quantity} units of ${product.name}.`,
      });
      navigate("/dashboard/inventory");
    } catch (error) {
      toast.error("Error", {
        description: "Failed to record inventory.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/inventory")}
          className="mb-4 text-slate-500 hover:text-slate-900 -ml-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Inventory
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">Goods Received Note (GRN)</h1>
        <p className="text-sm text-slate-500">Record new stock batches arriving from suppliers.</p>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-2xl">
        <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50 rounded-t-2xl">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <PackagePlus className="h-5 w-5 text-[#0aa9ad]" />
            Product Details
          </CardTitle>
          <CardDescription>Enter product tracking and pricing details.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
              <h3 className="font-semibold text-slate-700">1. Product Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="product_name" className="text-slate-700 font-medium">Product Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="product_name"
                    required
                    placeholder="e.g. Paracetamol 500mg"
                    className="rounded-xl border-slate-200 bg-white"
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="category" className="text-slate-700 font-medium">Category <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(val) => setFormData({ ...formData, category_id: val })}
                  >
                    <SelectTrigger className="rounded-xl border-slate-200 bg-white">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">+ Create New Category</SelectItem>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {formData.category_id === "new" && (
                    <Input 
                      placeholder="Enter new category name..."
                      className="mt-2 rounded-xl bg-white"
                      value={formData.new_category_name}
                      onChange={e => setFormData({ ...formData, new_category_name: e.target.value })}
                    />
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="uom" className="text-slate-700 font-medium">Unit of Measure</Label>
                  <Input
                    id="uom"
                    placeholder="e.g. Kgs, Bottles, Pieces"
                    className="rounded-xl border-slate-200 bg-white"
                    value={formData.unit_of_measure}
                    onChange={(e) => setFormData({ ...formData, unit_of_measure: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="reorder" className="text-slate-700 font-medium">Reorder Level</Label>
                  <Input
                    id="reorder"
                    type="number"
                    className="rounded-xl border-slate-200 bg-white"
                    value={formData.reorder_level}
                    onChange={(e) => setFormData({ ...formData, reorder_level: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-4">
              <h3 className="font-semibold text-slate-700">2. Batch Tracking & Costing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="batch_number" className="text-slate-700 font-medium">Batch / Lot Number</Label>
                  <Input
                    id="batch_number"
                    placeholder="Auto-generated if empty"
                    className="rounded-xl border-emerald-200 bg-white"
                    value={formData.batch_number}
                    onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="expiry_date" className="text-slate-700 font-medium">Expiry Date <span className="text-red-500">*</span></Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    required
                    className="rounded-xl border-emerald-200 bg-white"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="quantity" className="text-slate-700 font-medium">Quantity Received <span className="text-red-500">*</span></Label>
                  <Input
                    id="quantity"
                    type="number"
                    required
                    min="1"
                    className="rounded-xl border-emerald-200 bg-white"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="unit_price" className="text-slate-700 font-medium">Unit Cost (RWF)</Label>
                  <Input
                    id="unit_price"
                    type="number"
                    className="rounded-xl border-emerald-200 bg-white"
                    value={formData.unit_cost}
                    onChange={(e) => setFormData({ ...formData, unit_cost: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-3 md:col-span-2">
                  <Label htmlFor="selling_price" className="text-slate-700 font-medium">Selling Price (RWF) <span className="text-red-500">*</span></Label>
                  <Input
                    id="selling_price"
                    type="number"
                    required
                    className="rounded-xl border-emerald-200 bg-white"
                    value={formData.selling_price}
                    onChange={(e) => setFormData({ ...formData, selling_price: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => navigate("/dashboard/inventory")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-[#0aa9ad] hover:bg-[#07969a] text-white shadow-md shadow-teal-900/10"
                disabled={loading}
              >
                {loading ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Product & Batch</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

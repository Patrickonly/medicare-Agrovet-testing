import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { localDB } from "@/data/localStorageDB";
import { ArrowLeft, Edit, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function EditInventoryPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(false);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    product_name: "",
    reorder_level: 10,
    batch_number: "",
    expiry_date: "",
    unit_cost: 0,
    selling_price: 0,
  });

  useEffect(() => {
    if (id) {
      const batch = localDB.productBatches.getById(id);
      if (batch) {
        setBatchId(batch.id);
        setProductId(batch.product_id);
        const product = localDB.products.getById(batch.product_id);
        
        setFormData({
          product_name: product ? product.name : "",
          reorder_level: product ? product.reorder_level : 10,
          batch_number: batch.batch_number || "",
          expiry_date: batch.expiry_date ? batch.expiry_date.split('T')[0] : "",
          unit_cost: batch.unit_cost || 0,
          selling_price: batch.selling_price || 0,
        });
      } else {
        toast.error("Error", { description: "Batch not found." });
        navigate("/dashboard/inventory");
      }
    }
  }, [id, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchId || !productId) return;

    setLoading(true);

    try {
      // Update Product
      localDB.products.update(productId, {
        name: formData.product_name,
        reorder_level: formData.reorder_level
      });

      // Update Batch
      localDB.productBatches.update(batchId, {
        batch_number: formData.batch_number,
        expiry_date: formData.expiry_date,
        unit_cost: formData.unit_cost,
        selling_price: formData.selling_price
      });

      toast.success("Inventory Updated", {
        description: `${formData.product_name} batch details have been updated.`,
      });
      navigate("/dashboard/inventory");
    } catch (error) {
      toast.error("Error", {
        description: "Failed to update inventory.",
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
        <h1 className="text-2xl font-bold text-slate-900">Edit Batch & Product</h1>
        <p className="text-sm text-slate-500">Update pricing and details for this batch.</p>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-2xl">
        <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50 rounded-t-2xl">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Edit className="h-5 w-5 text-[#0aa9ad]" />
            Batch Details
          </CardTitle>
          <CardDescription>Note: Editing the product name updates it for all batches.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-3">
                <Label htmlFor="product_name" className="text-slate-700 font-medium">Product Name <span className="text-red-500">*</span></Label>
                <Input
                  id="product_name"
                  required
                  className="rounded-xl border-slate-200 focus-visible:ring-[#0aa9ad]"
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="reorder_level" className="text-slate-700 font-medium">Reorder Level (Product-wide)</Label>
                <Input
                  id="reorder_level"
                  type="number"
                  className="rounded-xl border-slate-200 focus-visible:ring-[#0aa9ad]"
                  value={formData.reorder_level}
                  onChange={(e) => setFormData({ ...formData, reorder_level: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="batch_number" className="text-slate-700 font-medium">Batch / Lot Number</Label>
                <Input
                  id="batch_number"
                  className="rounded-xl border-slate-200 focus-visible:ring-[#0aa9ad]"
                  value={formData.batch_number}
                  onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="expiry_date" className="text-slate-700 font-medium">Expiry Date</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  className="rounded-xl border-slate-200 focus-visible:ring-[#0aa9ad]"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="unit_cost" className="text-slate-700 font-medium">Unit Cost</Label>
                <Input
                  id="unit_cost"
                  type="number"
                  className="rounded-xl border-slate-200 focus-visible:ring-[#0aa9ad]"
                  value={formData.unit_cost}
                  onChange={(e) => setFormData({ ...formData, unit_cost: Number(e.target.value) })}
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="selling_price" className="text-slate-700 font-medium">Selling Price (RWF) <span className="text-red-500">*</span></Label>
                <Input
                  id="selling_price"
                  type="number"
                  required
                  className="rounded-xl border-slate-200 focus-visible:ring-[#0aa9ad]"
                  value={formData.selling_price}
                  onChange={(e) => setFormData({ ...formData, selling_price: Number(e.target.value) })}
                />
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
                {loading ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { localDB } from "@/data/localStorageDB";
import { ArrowLeft, Building2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function EditSupplierPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    payment_terms: "",
  });

  useEffect(() => {
    if (id) {
      const supplier = localDB.suppliers.getById(id);
      if (supplier) {
        setFormData({
          name: supplier.name || "",
          contact_person: (supplier as any).contact_person || "",
          email: supplier.email || "",
          phone: supplier.phone || "",
          payment_terms: (supplier as any).payment_terms || "",
        });
      } else {
        toast.error("Error", { description: "Supplier not found." });
        navigate("/dashboard/suppliers");
      }
    }
  }, [id, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setLoading(true);

    try {
      localDB.suppliers.update(id, formData);
      toast.success("Supplier Updated", {
        description: `${formData.name}'s details have been updated.`,
      });
      navigate("/dashboard/suppliers");
    } catch (error) {
      toast.error("Error", {
        description: "Failed to update supplier.",
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
          onClick={() => navigate("/dashboard/suppliers")}
          className="mb-4 text-slate-500 hover:text-slate-900 -ml-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Suppliers
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">Edit Supplier</h1>
        <p className="text-sm text-slate-500">Update supplier company information and terms.</p>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-2xl">
        <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50 rounded-t-2xl">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#0aa9ad]" />
            Supplier Details
          </CardTitle>
          <CardDescription>Modify the company and contact information below.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-slate-700 font-medium">Company Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  required
                  placeholder="e.g. Global Pharma Ltd"
                  className="rounded-xl border-slate-200 focus-visible:ring-[#0aa9ad]"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="contact_person" className="text-slate-700 font-medium">Contact Person <span className="text-red-500">*</span></Label>
                <Input
                  id="contact_person"
                  required
                  placeholder="e.g. Alice Manager"
                  className="rounded-xl border-slate-200 focus-visible:ring-[#0aa9ad]"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-slate-700 font-medium">Phone Number <span className="text-red-500">*</span></Label>
                <Input
                  id="phone"
                  required
                  placeholder="e.g. +250 788 000 000"
                  className="rounded-xl border-slate-200 focus-visible:ring-[#0aa9ad]"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="sales@company.com"
                  className="rounded-xl border-slate-200 focus-visible:ring-[#0aa9ad]"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-3 md:col-span-2">
                <Label htmlFor="payment_terms" className="text-slate-700 font-medium">Payment Terms</Label>
                <Input
                  id="payment_terms"
                  placeholder="e.g. Net 30, Cash on Delivery"
                  className="rounded-xl border-slate-200 focus-visible:ring-[#0aa9ad]"
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => navigate("/dashboard/suppliers")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-[#0aa9ad] hover:bg-[#07969a] text-white shadow-md shadow-teal-900/10"
                disabled={loading}
              >
                {loading ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Update Supplier</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

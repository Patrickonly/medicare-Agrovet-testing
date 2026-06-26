import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { localDB } from "@/data/localStorageDB";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, UserPlus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddUserPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { organizationId, userRole, user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    branch: "",
    phone: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId) return;

    setLoading(true);

    try {
      localDB.users.create({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        role: formData.role,
        branch: formData.branch,
        phone: formData.phone,
        is_active: true,
        status: "active",
        organization_id: organizationId,
      });

      toast({
        title: "User Created",
        description: `${formData.firstName} ${formData.lastName} has been added successfully.`,
      });
      navigate("/dashboard/users");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create user.",
        variant: "destructive",
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
          onClick={() => navigate("/dashboard/users")}
          className="mb-4 text-slate-500 hover:text-slate-900 -ml-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">Add New Staff</h1>
        <p className="text-sm text-slate-500">Create a new user account and assign roles</p>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-2xl">
        <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50 rounded-t-2xl">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-[#0aa9ad]" />
            User Details
          </CardTitle>
          <CardDescription>Enter the personal and access details for the new staff member.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="firstName" className="text-slate-700 font-medium">First Name <span className="text-red-500">*</span></Label>
                <Input
                  id="firstName"
                  required
                  placeholder="e.g. John"
                  className="rounded-xl border-slate-200 focus-visible:ring-[#0aa9ad]"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="lastName" className="text-slate-700 font-medium">Last Name <span className="text-red-500">*</span></Label>
                <Input
                  id="lastName"
                  required
                  placeholder="e.g. Doe"
                  className="rounded-xl border-slate-200 focus-visible:ring-[#0aa9ad]"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="email" className="text-slate-700 font-medium">Email Address <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="john.doe@example.com"
                  className="rounded-xl border-slate-200 focus-visible:ring-[#0aa9ad]"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-slate-700 font-medium">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+250 788 000 000"
                  className="rounded-xl border-slate-200 focus-visible:ring-[#0aa9ad]"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="role" className="text-slate-700 font-medium">System Role <span className="text-red-500">*</span></Label>
                <Select
                  required
                  value={formData.role}
                  onValueChange={(val) => setFormData({ ...formData, role: val })}
                >
                  <SelectTrigger className="rounded-xl border-slate-200 focus:ring-[#0aa9ad]">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="org_owner">Owner / Admin</SelectItem>
                    <SelectItem value="accountant">Accountant</SelectItem>
                    <SelectItem value="cashier_agro">Cashier (Agro)</SelectItem>
                    <SelectItem value="cashier_vet">Cashier (Vet)</SelectItem>
                    <SelectItem value="pharmacist">Pharmacist</SelectItem>
                    <SelectItem value="storekeeper">Store Keeper</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="branch" className="text-slate-700 font-medium">Branch / Assignment <span className="text-red-500">*</span></Label>
                <Select
                  required
                  value={formData.branch}
                  onValueChange={(val) => setFormData({ ...formData, branch: val })}
                >
                  <SelectTrigger className="rounded-xl border-slate-200 focus:ring-[#0aa9ad]">
                    <SelectValue placeholder="Assign to a branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Main Branch">Main Branch</SelectItem>
                    <SelectItem value="Agro Store">Agro Store</SelectItem>
                    <SelectItem value="Vet Pharmacy">Vet Pharmacy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => navigate("/dashboard/users")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-[#0aa9ad] hover:bg-[#07969a] text-white shadow-md shadow-teal-900/10"
                disabled={loading}
              >
                {loading ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save User</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

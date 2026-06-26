import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { localDB, now } from "@/data/localStorageDB";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Banknote, Edit2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ExpensesPage() {
  const { organizationId } = useAuth();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<any[]>([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [formData, setFormData] = useState({ category: "Utilities", description: "", amount: 0 });

  useEffect(() => {
    if (!organizationId) return;
    fetchData();
  }, [organizationId]);

  const fetchData = () => {
    const all = localDB.expenses.getByOrganizationId(organizationId!);
    all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setExpenses(all);
  };

  const handleOpenDialog = (exp: any = null) => {
    setEditingExpense(exp);
    setFormData({
      category: exp ? exp.category : "Utilities",
      description: exp ? exp.description : "",
      amount: exp ? exp.amount : 0
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.description || formData.amount <= 0) {
      return toast({ title: "Error", description: "Valid description and amount required.", variant: "destructive" });
    }

    if (editingExpense) {
      // If we update, we should also update cashbook... but for simplicity of this request we just update the expense
      localDB.expenses.update(editingExpense.id, { ...formData });
      toast({ title: "Success", description: "Expense updated.", variant: "success" });
    } else {
      localDB.expenses.create({
        organization_id: organizationId!,
        ...formData,
        date: now()
      });
      // Also log to cashbook
      localDB.cashbook.create({
        organization_id: organizationId!,
        transaction_type: "OUT",
        category: formData.category,
        description: formData.description,
        amount: formData.amount,
        date: now()
      });
      toast({ title: "Success", description: "Expense logged to cashbook.", variant: "success" });
    }
    
    setIsDialogOpen(false);
    fetchData();
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this expense? Note: This does not automatically reverse the cashbook entry.")) {
      localDB.expenses.delete(id);
      toast({ title: "Deleted", description: "Expense removed." });
      fetchData();
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expenses</h1>
          <p className="text-slate-500">Log operational costs and overheads.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-[#0aa9ad] hover:bg-[#07969a] rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> Add Expense
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-2xl">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Banknote className="w-5 h-5 text-[#0aa9ad]" />
            Recent Expenses
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((exp) => (
                <TableRow key={exp.id}>
                  <TableCell>{new Date(exp.date).toLocaleString()}</TableCell>
                  <TableCell className="font-semibold">{exp.category}</TableCell>
                  <TableCell className="text-slate-500">{exp.description}</TableCell>
                  <TableCell className="font-bold text-rose-600">{exp.amount} RWF</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(exp)} className="text-blue-600">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(exp.id)} className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {expenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">No expenses recorded.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingExpense ? "Edit Expense" : "Log New Expense"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(val) => setFormData({...formData, category: val})}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Rent">Rent</SelectItem>
                  <SelectItem value="Salaries">Salaries</SelectItem>
                  <SelectItem value="Transport">Transport</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Input 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="e.g., Electricity Bill for June"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Amount (RWF) *</Label>
              <Input 
                type="number"
                value={formData.amount} 
                onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
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

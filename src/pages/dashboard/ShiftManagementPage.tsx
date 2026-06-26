import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { localDB, now } from "@/data/localStorageDB";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Clock, Plus, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function ShiftManagementPage() {
  const { organizationId, user } = useAuth();
  const { toast } = useToast();
  
  const [shifts, setShifts] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isClosingDialog, setIsClosingDialog] = useState(false);
  const [activeShift, setActiveShift] = useState<any>(null);
  const [startingCash, setStartingCash] = useState("");
  const [closingCash, setClosingCash] = useState("");

  useEffect(() => {
    if (!organizationId) return;
    fetchShifts();
  }, [organizationId]);

  const fetchShifts = () => {
    const all = localDB.shifts.getByOrganizationId(organizationId!);
    // Sort descending by start time
    all.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
    setShifts(all);
  };

  const handleOpenShift = () => {
    if (!startingCash) return toast({ title: "Error", description: "Starting cash is required.", variant: "destructive" });
    
    localDB.shifts.create({
      organization_id: organizationId!,
      user_id: user?.id!,
      start_time: now(),
      starting_cash: Number(startingCash),
      status: "Open"
    });
    
    toast({ title: "Success", description: "Shift opened successfully.", variant: "success" });
    setIsDialogOpen(false);
    setStartingCash("");
    fetchShifts();
  };

  const handleCloseShift = () => {
    if (!closingCash) return toast({ title: "Error", description: "Closing cash is required.", variant: "destructive" });
    
    localDB.shifts.update(activeShift.id, {
      end_time: now(),
      closing_cash: Number(closingCash),
      status: "Closed"
    });
    
    toast({ title: "Success", description: "Shift closed successfully.", variant: "success" });
    setIsClosingDialog(false);
    setActiveShift(null);
    setClosingCash("");
    fetchShifts();
  };

  const hasOpenShift = shifts.some(s => s.status === "Open");

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Shift Management</h1>
          <p className="text-slate-500">Open and close cashier shifts.</p>
        </div>
        {!hasOpenShift && (
          <Button onClick={() => setIsDialogOpen(true)} className="bg-[#0aa9ad] hover:bg-[#07969a] rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Open Shift
          </Button>
        )}
      </div>

      <Card className="border-slate-200 shadow-sm rounded-2xl">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#0aa9ad]" />
            Shift History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Starting Cash</TableHead>
                <TableHead>Closing Cash</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shifts.map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell>{new Date(shift.start_time).toLocaleString()}</TableCell>
                  <TableCell>{shift.end_time ? new Date(shift.end_time).toLocaleString() : "-"}</TableCell>
                  <TableCell className="font-semibold">{shift.starting_cash} RWF</TableCell>
                  <TableCell className="font-semibold">{shift.closing_cash !== undefined ? `${shift.closing_cash} RWF` : "-"}</TableCell>
                  <TableCell>
                    {shift.status === "Open" ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Open</Badge>
                    ) : (
                      <Badge className="bg-slate-50 text-slate-500 border-slate-200">Closed</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {shift.status === "Open" && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-orange-600 border-orange-200 hover:bg-orange-50"
                        onClick={() => { setActiveShift(shift); setIsClosingDialog(true); }}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" /> Close Shift
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {shifts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">No shifts recorded.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Open New Shift</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Starting Cash (RWF)</Label>
              <Input 
                type="number"
                value={startingCash} 
                onChange={(e) => setStartingCash(e.target.value)}
                placeholder="Amount in cash drawer"
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleOpenShift} className="bg-[#0aa9ad] hover:bg-[#07969a] rounded-xl">Open Shift</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isClosingDialog} onOpenChange={setIsClosingDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Close Shift</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Closing Cash (RWF)</Label>
              <Input 
                type="number"
                value={closingCash} 
                onChange={(e) => setClosingCash(e.target.value)}
                placeholder="Final amount in cash drawer"
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsClosingDialog(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleCloseShift} className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl">Close Shift</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

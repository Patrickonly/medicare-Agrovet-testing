import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { localDB } from "@/data/localStorageDB";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Percent, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function DiscountRequestsPage() {
  const { organizationId, userRole } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    if (!organizationId) return;
    fetchRequests();
  }, [organizationId]);

  const fetchRequests = () => {
    const all = localDB.discountRequests.getByOrganizationId(organizationId!);
    setRequests(all);
  };

  const handleApprove = (id: string) => {
    localDB.discountRequests.update(id, { status: "Approved" });
    toast({ title: "Approved", description: "Discount approved successfully.", variant: "success" });
    fetchRequests();
  };

  const handleReject = (id: string) => {
    localDB.discountRequests.update(id, { status: "Rejected" });
    toast({ title: "Rejected", description: "Discount request rejected." });
    fetchRequests();
  };

  const canApprove = userRole === "admin" || userRole === "org_owner" || userRole === "super_admin" || userRole === "director";

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Discount Requests</h1>
          <p className="text-slate-500">Manage cashier requests for applying discounts to sales.</p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-2xl">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Percent className="w-5 h-5 text-[#0aa9ad]" />
            Pending & Past Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sale ID</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-mono text-xs">{req.sale_id}</TableCell>
                  <TableCell className="font-mono text-xs">{req.requested_by}</TableCell>
                  <TableCell className="font-bold text-emerald-600">{req.amount} RWF</TableCell>
                  <TableCell>
                    {req.status === "Pending" && <Badge className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>}
                    {req.status === "Approved" && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Approved</Badge>}
                    {req.status === "Rejected" && <Badge className="bg-rose-50 text-rose-700 border-rose-200">Rejected</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    {req.status === "Pending" && canApprove && (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => handleApprove(req.id)}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50" onClick={() => handleReject(req.id)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">No discount requests found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

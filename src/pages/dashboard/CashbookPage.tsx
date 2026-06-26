import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { localDB } from "@/data/localStorageDB";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function CashbookPage() {
  const { organizationId } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!organizationId) return;
    const all = localDB.cashbook.getByOrganizationId(organizationId);
    all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTransactions(all);
  }, [organizationId]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cashbook</h1>
          <p className="text-slate-500">Automatically tracking all money coming in and going out.</p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-2xl">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#0aa9ad]" />
            Transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{new Date(tx.date).toLocaleString()}</TableCell>
                  <TableCell>
                    {tx.transaction_type === "IN" ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">IN</Badge>
                    ) : (
                      <Badge className="bg-rose-50 text-rose-700 border-rose-200">OUT</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-700">{tx.category}</TableCell>
                  <TableCell className="text-slate-500">{tx.description || "-"}</TableCell>
                  <TableCell className={`text-right font-bold ${tx.transaction_type === "IN" ? "text-emerald-600" : "text-rose-600"}`}>
                    {tx.transaction_type === "IN" ? "+" : "-"}{tx.amount} RWF
                  </TableCell>
                </TableRow>
              ))}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">No cashbook transactions found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

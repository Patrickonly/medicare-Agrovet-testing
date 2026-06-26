import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { localDB } from "@/data/localStorageDB";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Edit, Plus, Search, ShieldAlert, ShieldCheck, Trash2, UserCog, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UsersPage() {
  const navigate = useNavigate();
  const { organizationId, userRole, user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [userToDelete, setUserToDelete] = useState<any>(null);

  useEffect(() => {
    if (!organizationId) return;
    const orgUsers = localDB.users.getByOrganizationId(organizationId);
    setUsers(orgUsers);
  }, [organizationId]);

  const handleDeleteUser = () => {
    if (!userToDelete) return;
    localDB.users.delete(userToDelete.id);
    toast({ title: "User Deleted", description: `${userToDelete.first_name} ${userToDelete.last_name} has been removed successfully.` });
    setUsers(users.filter(u => u.id !== userToDelete.id));
    setUserToDelete(null);
  };

  const filteredUsers = users.filter(
    (u) =>
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.role && u.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "org_owner":
      case "super_admin":
      case "admin":
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-none flex gap-1 items-center"><ShieldAlert size={12}/> {role}</Badge>;
      case "accountant":
      case "finance_manager":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none flex gap-1 items-center"><ShieldCheck size={12}/> {role}</Badge>;
      case "cashier_agro":
      case "cashier_vet":
      case "cashier":
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none flex gap-1 items-center"><UserCog size={12}/> {role}</Badge>;
      default:
        return <Badge variant="outline" className="text-slate-600">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "active") return <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>;
    return <Badge variant="secondary" className="bg-slate-100 text-slate-500">Inactive</Badge>;
  };

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500">Manage staff access and permissions</p>
        </div>

        <Button onClick={() => navigate("/dashboard/users/add")} className="bg-[#0aa9ad] hover:bg-[#07969a] text-white">
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-2xl">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-[#0aa9ad]" />
              Staff Directory
            </CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-[#0aa9ad]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="w-[250px]">User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Branch/Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <TableRow key={u.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="text-slate-900 font-semibold">{u.first_name} {u.last_name}</span>
                        <span className="text-xs text-slate-500">{u.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(u.role || "")}</TableCell>
                    <TableCell className="text-slate-600 text-sm">{u.branch || "Main Branch"}</TableCell>
                    <TableCell>{getStatusBadge(u.status || u.is_active ? "active" : "inactive")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/dashboard/users/edit/${u.id}`)}
                          className="text-slate-400 hover:text-[#0aa9ad] hover:bg-[#e8fbfb] rounded-xl"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setUserToDelete(u)}
                              className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the user {u.first_name} {u.last_name}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

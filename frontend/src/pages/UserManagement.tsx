import { useState } from 'react';
import { useGetCallerUserRole } from '../hooks/useQueries';
import UserList from '../components/users/UserList';
import AddUserModal from '../components/users/AddUserModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, Users as UsersIcon, AlertTriangle } from 'lucide-react';
import { UserRole } from '../backend';

export default function UserManagement() {
  const { data: userRole } = useGetCallerUserRole();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const isAdmin = userRole === UserRole.admin;

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access Denied: Only administrators can manage users.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage access credentials and permissions</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 bg-accent hover:bg-accent/90">
          <UserPlus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      <Card className="border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-accent" />
            Authorized Users
          </CardTitle>
          <CardDescription>Manage registered users and their access windows</CardDescription>
        </CardHeader>
        <CardContent>
          <UserList />
        </CardContent>
      </Card>

      <AddUserModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
    </div>
  );
}

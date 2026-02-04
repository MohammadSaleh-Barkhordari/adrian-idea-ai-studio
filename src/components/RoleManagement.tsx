import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, Trash2, Search } from 'lucide-react';

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'general_user';
  created_at: string;
  user_email?: string;
}

interface AuthUser {
  id: string;
  email: string;
}

const RoleManagement = () => {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'general_user'>('general_user');
  
  const { toast } = useToast();

  useEffect(() => {
    fetchUserRoles();
    fetchAuthUsers();
  }, []);

  const fetchUserRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Enrich with user emails
      const enrichedRoles = await Promise.all(
        (data || []).map(async (role) => {
          try {
            const { data: userData, error: userError } = await supabase.auth.admin.getUserById(role.user_id);
            return {
              ...role,
              user_email: userData.user?.email || 'Unknown'
            };
          } catch {
            return {
              ...role,
              user_email: 'Unknown'
            };
          }
        })
      );
      
      setUserRoles(enrichedRoles);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user roles",
        variant: "destructive",
      });
    }
  };

  const fetchAuthUsers = async () => {
    try {
      // Use the edge function to get auth users
      const { data, error } = await supabase.functions.invoke('get-auth-users');
      
      if (error) throw error;
      
      setAuthUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching auth users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUserId || !selectedRole) {
      toast({
        title: "Error",
        description: "Please select a user and role",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: selectedUserId,
          role: selectedRole,
        }, {
          onConflict: 'user_id,role'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Role assigned successfully",
      });

      setSelectedUserId('');
      setSelectedRole('general_user');
      fetchUserRoles();
    } catch (error) {
      console.error('Error assigning role:', error);
      toast({
        title: "Error",
        description: "Failed to assign role",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Role removed successfully",
      });

      fetchUserRoles();
    } catch (error) {
      console.error('Error removing role:', error);
      toast({
        title: "Error",
        description: "Failed to remove role",
        variant: "destructive",
      });
    }
  };

  const filteredRoles = userRoles.filter(role => 
    role.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter out users who already have roles
  const usersWithoutRoles = authUsers.filter(user => 
    !userRoles.some(role => role.user_id === user.id)
  );

  return (
    <div className="space-y-6">
      {/* Assign New Role */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Assign Role
          </CardTitle>
          <CardDescription>
            Assign roles to users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="user-select">Select User</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user" />
                </SelectTrigger>
                <SelectContent>
                  {usersWithoutRoles.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="role-select">Select Role</Label>
              <Select value={selectedRole} onValueChange={(value: 'admin' | 'general_user') => setSelectedRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general_user">General User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleAssignRole} 
                disabled={loading || !selectedUserId}
                className="w-full"
              >
                {loading ? 'Assigning...' : 'Assign Role'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Current User Roles
          </CardTitle>
          <CardDescription>
            Manage existing user role assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Table */}
          {filteredRoles.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No user roles found</p>
              <p className="text-muted-foreground">
                {userRoles.length === 0 
                  ? "Start by assigning roles to users"
                  : "Try adjusting your search"
                }
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Assigned Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoles.map((userRole) => (
                    <TableRow key={userRole.id}>
                      <TableCell className="font-medium">
                        {userRole.user_email}
                      </TableCell>
                      <TableCell>
                        <Badge variant={userRole.role === 'admin' ? 'default' : 'secondary'}>
                          {userRole.role === 'admin' ? 'Admin' : 'General User'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(userRole.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveRole(userRole.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleManagement;
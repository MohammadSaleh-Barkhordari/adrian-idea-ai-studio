import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface AuthUser {
  id: string;
  email: string;
}

interface UserSelectorProps {
  value: string;
  onValueChange: (value: string, email?: string) => void;
  required?: boolean;
}

const UserSelector = ({ value, onValueChange, required = false }: UserSelectorProps) => {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-auth-users');
      
      if (error) throw error;
      
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (userId: string) => {
    const selectedUser = users.find(user => user.id === userId);
    onValueChange(userId, selectedUser?.email);
  };

  return (
    <div>
      <Label htmlFor="user_id">
        Associated User {required && <span className="text-red-500">*</span>}
      </Label>
      <Select value={value} onValueChange={handleValueChange} required={required}>
        <SelectTrigger>
          <SelectValue placeholder={loading ? "Loading users..." : "Select a user"} />
        </SelectTrigger>
        <SelectContent>
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm">Loading users...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              No users found
            </div>
          ) : (
            users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.email}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default UserSelector;
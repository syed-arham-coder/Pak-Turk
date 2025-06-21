import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import * as permissions from '@/lib/permissions';

export function usePermissions() {
  const { user } = useAuth();
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPermissions() {
      if (user?.role) {
        const perms = await permissions.getUserPermissions(user.role as permissions.UserRole);
        setUserPermissions(perms);
      }
      setLoading(false);
    }

    loadPermissions();
  }, [user?.role]);

  const hasPermission = async (permission: string) => {
    if (!user?.role) return false;
    return await permissions.hasPermission(user.role as permissions.UserRole, permission);
  };

  return {
    permissions: userPermissions,
    hasPermission,
    loading,
    isAdmin: user?.role === 'Admin',
    isManager: user?.role === 'Manager',
    isUser: user?.role === 'User',
  };
}

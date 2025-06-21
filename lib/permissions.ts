import { getConnection } from './db';

export type UserRole = 'Admin' | 'Manager' | 'User';

interface Permission {
  id: number;
  role: UserRole;
  permission: string;
  description: string;
}

// Cache permissions in memory for better performance
let permissionsCache: Permission[] | null = null;

export async function getPermissions(): Promise<Permission[]> {
  if (permissionsCache) {
    return permissionsCache;
  }

  const connection = await getConnection();
  try {
    const [rows] = await connection.execute('SELECT * FROM role_permissions');
    permissionsCache = rows as Permission[];
    return permissionsCache;
  } finally {
    connection.release();
  }
}

export async function hasPermission(userRole: UserRole, requiredPermission: string): Promise<boolean> {
  const permissions = await getPermissions();
  return permissions.some(
    (p) => p.role === userRole && p.permission === requiredPermission
  );
}

export async function getUserPermissions(userRole: UserRole): Promise<string[]> {
  const permissions = await getPermissions();
  return permissions
    .filter((p) => p.role === userRole)
    .map((p) => p.permission);
}

// Common permission checks
export const canManageCompany = async (userRole: UserRole) => 
  await hasPermission(userRole, 'manage_company_settings');

export const canManageUsers = async (userRole: UserRole) => 
  await hasPermission(userRole, 'manage_users');

export const canAssignRoles = async (userRole: UserRole) => 
  await hasPermission(userRole, 'assign_roles');

export const canManageProducts = async (userRole: UserRole) => 
  await hasPermission(userRole, 'manage_products');

export const canManageOrders = async (userRole: UserRole) => 
  await hasPermission(userRole, 'manage_orders');

export const canViewReports = async (userRole: UserRole) => 
  await hasPermission(userRole, 'view_reports');

// Admin specific checks
export const isAdmin = (userRole: UserRole) => userRole === 'Admin';

// Manager specific checks
export const isManager = (userRole: UserRole) => userRole === 'Manager';

// User specific checks
export const isUser = (userRole: UserRole) => userRole === 'User';

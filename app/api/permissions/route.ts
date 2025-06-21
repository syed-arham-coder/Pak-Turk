import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
const DEFAULT_PERMISSIONS = {
  Admin: [
    'manage_users',
    'manage_roles',
    'manage_company',
    'manage_products',
    'manage_vendors',
    'view_dashboard',
    'manage_settings'
  ],
  Manager: [
    'manage_products',
    'manage_vendors',
    'view_dashboard',
    'manage_settings'
  ],
  User: [
    'view_dashboard',
    'view_products',
    'view_vendors'
  ]
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    if (!role) {
      return NextResponse.json(
        { error: 'Role parameter is required' },
        { status: 400 }
      );
    }
    const validRoles = ['Admin', 'Manager', 'User'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    await query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role VARCHAR(50) NOT NULL,
        permission VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_role_permission (role, permission)
      )
    `);

    const existingPermissions = await query(
      'SELECT permission FROM role_permissions WHERE role = ?',
      [role]
    );

    if (!existingPermissions || (Array.isArray(existingPermissions) && existingPermissions.length === 0)) {
      const defaultPermissions = DEFAULT_PERMISSIONS[role as keyof typeof DEFAULT_PERMISSIONS];
      for (const permission of defaultPermissions) {
        await query(
          'INSERT IGNORE INTO role_permissions (role, permission) VALUES (?, ?)',
          [role, permission]
        );
      }
    }

    const permissions = await query(
      'SELECT permission FROM role_permissions WHERE role = ?',
      [role]
    );

    return NextResponse.json({ permissions });
  } catch (error) {
    console.error('Error in permissions route:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

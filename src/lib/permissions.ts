// Permission system for role-based access control

export type UserRole = 'admin' | 'manager' | 'agent';

export const permissions = {
  // Admin permissions (Owner)
  admin: {
    canViewAllEmails: true,
    canViewTeamPerformance: true,
    canAddTeamMembers: true,
    canDeleteTeamMembers: true,
    canAssignEmails: true,
    canConfigureSLA: true,
    canConnectProviders: true,
    canViewAnalytics: true,
    canManageSettings: true,
  },
  
  // Manager permissions
  manager: {
    canViewAllEmails: true,
    canViewTeamPerformance: true,
    canAddTeamMembers: false,
    canDeleteTeamMembers: false,
    canAssignEmails: true,
    canConfigureSLA: false,
    canConnectProviders: false,
    canViewAnalytics: true,
    canManageSettings: false,
  },
  
  // Agent permissions (most restricted)
  agent: {
    canViewAllEmails: false, // Only assigned emails
    canViewTeamPerformance: false,
    canAddTeamMembers: false,
    canDeleteTeamMembers: false,
    canAssignEmails: false,
    canConfigureSLA: false,
    canConnectProviders: false,
    canViewAnalytics: false, // Only own stats
    canManageSettings: false,
  },
};

export function hasPermission(role: UserRole, permission: keyof typeof permissions.admin): boolean {
  return permissions[role]?.[permission] ?? false;
}

export function canAccessSection(role: UserRole, section: string): boolean {
  switch (section) {
    case 'dashboard':
      return true; // Everyone can see dashboard (but filtered)
    case 'analytics':
      return role === 'admin' || role === 'manager';
    case 'alerts':
      return true; // Everyone sees their own alerts
    case 'team':
      return role === 'admin' || role === 'manager';
    case 'settings':
      return role === 'admin';
    default:
      return false;
  }
}

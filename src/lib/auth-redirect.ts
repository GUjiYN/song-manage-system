import { UserRole } from "@/types/auth";

const ADMIN_ROLES = new Set<UserRole>([UserRole.ADMIN, UserRole.MANAGER]);

export function getDefaultRedirectPath(role: UserRole): string {
    if (ADMIN_ROLES.has(role)) {
        return "/admin";
    }
    return "/library";
}

export function isRedirectAllowedForRole(role: UserRole, targetPath: string): boolean {
    if (!targetPath.startsWith("/")) {
        return false;
    }

    if (targetPath.startsWith("/admin")) {
        return ADMIN_ROLES.has(role);
    }

    return true;
}

export function isAdminRole(role: UserRole): boolean {
    return ADMIN_ROLES.has(role);
}

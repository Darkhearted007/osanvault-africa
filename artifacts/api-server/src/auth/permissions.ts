import type { RequestPrincipal } from "./principal";

export function hasPermission(
  principal: RequestPrincipal | undefined,
  permission: string,
): boolean {
  if (!principal) return false;
  return principal.permissions.includes(permission);
}

export function requirePermission(
  principal: RequestPrincipal | undefined,
  permission: string,
): void {
  if (!hasPermission(principal, permission)) {
    const error = new Error(`Missing permission: ${permission}`);
    error.name = "AuthorizationError";
    throw error;
  }
}

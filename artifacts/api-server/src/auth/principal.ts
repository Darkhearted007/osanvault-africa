export type PrincipalType = "person" | "organization" | "service";

export type RequestPrincipal = {
  id: string;
  type: PrincipalType;
  roles: readonly string[];
  permissions: readonly string[];
  jurisdictionCodes: readonly string[];
  assuranceLevel?: string;
};

export type AuthContext = {
  principal: RequestPrincipal;
};

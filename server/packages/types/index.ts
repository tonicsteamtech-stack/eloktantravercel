export enum UserRole {
  CITIZEN = "CITIZEN",
  ADMIN = "ADMIN",
  CANDIDATE = "CANDIDATE",
}

export interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
}

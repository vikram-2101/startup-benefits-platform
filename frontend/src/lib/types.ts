export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  isVerified: boolean;
  createdAt: string;
}

export interface Deal {
  _id: string;
  title: string;
  description: string;
  category: string;
  value: string;
  discount: string;
  partner: {
    name: string;
    logo?: string;
    website?: string;
  };
  requirements: string[];
  isLocked: boolean;
  expiresAt?: string;
  createdAt: string;
}

export interface Claim {
  _id: string;
  deal: Deal;
  user: string;
  status: "pending" | "approved" | "rejected";
  claimedAt: string;
  approvedAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface DealsResponse {
  deals: Deal[];
  total: number;
  page: number;
  totalPages: number;
}

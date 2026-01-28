import Cookies from "js-cookie";
import { api } from "./api";
import { User, AuthResponse } from "./types";

export const authService = {
  async register(
    email: string,
    password: string,
    name: string,
  ): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>("/auth/register", {
      email,
      password,
      name,
    });

    const data = res.data;

    this.setTokens(data.accessToken, data.refreshToken);
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });

    const data = res.data;
    this.setTokens(data.accessToken, data.refreshToken);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } finally {
      this.clearTokens();
    }
  },

  async getCurrentUser(): Promise<User> {
    return api.get<User>("/auth/me");
  },

  async refreshToken(): Promise<string> {
    const refreshToken = Cookies.get("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await api.post<{ accessToken: string }>("/auth/refresh", {
      refreshToken,
    });

    Cookies.set("accessToken", response.accessToken, { expires: 7 });
    return response.accessToken;
  },

  setTokens(accessToken: string, refreshToken: string): void {
    Cookies.set("accessToken", accessToken, { expires: 7 });
    Cookies.set("refreshToken", refreshToken, { expires: 30 });
  },

  clearTokens(): void {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
  },

  getAccessToken(): string | undefined {
    return Cookies.get("accessToken");
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },
};

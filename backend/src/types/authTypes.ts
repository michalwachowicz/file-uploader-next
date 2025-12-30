export interface AuthResponse {
  user: {
    id: string;
    username: string;
    createdAt: Date;
  };
  token: string;
}

export interface JwtPayload {
  userId: string;
  username: string;
}

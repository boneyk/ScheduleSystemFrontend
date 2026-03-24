export type LoginDTO = {
  username: string;
  password: string;
};

export interface AuthDto {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  user_id: number | string;
  authorities: string[];
}

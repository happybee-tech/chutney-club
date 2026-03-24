import type { UUID } from './common';

export type OtpRequest = {
  phone?: string;
  email?: string;
};

export type OtpRequestResponse = {
  request_id: UUID;
  expires_in: number;
};

export type OtpVerifyRequest = {
  request_id: UUID;
  otp: string;
};

export type AuthUser = {
  id: UUID;
  phone: string;
  email?: string | null;
  name?: string | null;
};

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: AuthUser;
};

export type RefreshRequest = {
  refresh_token: string;
};

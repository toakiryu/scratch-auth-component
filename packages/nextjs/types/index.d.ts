export interface ScratchAuthComponentConfigType {
  cookie_name?: string;
  redirect_url?: string;
  title?: string;
  expiration?: number;
  cn?: Function;
  debug?: boolean;
}

export interface ScratchAuthComponentResult<T> {
  status: boolean;
  message: string;
  body: T | null;
  error?: unknown;
}

export type ScratchAuthSessionType = string | null;

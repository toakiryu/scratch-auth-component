export interface ScratchAuthComponentConfigType {
  cookie_name?: string;
  redirect_url?: string;
  title?: string;
  expiration?: number;
  cn: Function;
  debug?: boolean;
}

export type ResponseType = { status: number; code: string; message: string };
export type ResponseErrorType = {
  status: number;
  code: string;
  message: string;
};

export type ScratchAuthSessionType = string | null | undefined;

export type ScratchUserType = {
  id: number;
  username: string;
  scratchteam: boolean;
  history: {
    joined: string;
  };
  profile: {
    id: number;
    images: {
      "90x90": string;
      "60x60": string;
      "55x55": string;
      "50x50": string;
      "32x32": string;
    };
    status: string;
    bio: string;
    country: string;
  };
};

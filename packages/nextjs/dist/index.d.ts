import type { ScratchAuthComponentResult, ScratchAuthSessionType } from "../types/index.d.ts";
export declare function setScratchAuthSession(privateCode: ScratchAuthSessionType): Promise<ScratchAuthComponentResult<string>>;
export declare const scratchAuthLogin: (redirect_url?: string) => Promise<boolean>;

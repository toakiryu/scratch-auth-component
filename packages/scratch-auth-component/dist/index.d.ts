export interface ScratchAuthComponentActionResult<T> {
    status: boolean;
    message: string;
    body: T | null;
    error?: unknown;
}
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
declare const ScratchAuthComponent: {
    action: {
        calculateHmac: (text: string) => Promise<ScratchAuthComponentActionResult<string>>;
        encrypt: (text: string) => Promise<ScratchAuthComponentActionResult<string>>;
        decrypt: (text: string) => Promise<ScratchAuthComponentActionResult<string>>;
        verifyToken: (privateCode: string) => Promise<ScratchAuthComponentActionResult<{
            sessionId: string;
            data: {
                valid: boolean;
                username: string | null;
                redirect: string | null;
            };
        }>>;
        encryptedData: (content: string, value: string, days: number) => Promise<ScratchAuthComponentActionResult<{
            name: string;
            value: string;
            options: {
                expires: Date;
                path: string;
            };
        }>>;
        getUserName: (session: string) => Promise<ScratchAuthComponentActionResult<string>>;
    };
};
export { ScratchAuthComponent };

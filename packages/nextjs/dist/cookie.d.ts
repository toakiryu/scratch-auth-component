import { RequestCookie, ResponseCookie, ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies";
export declare function getAllCookie(): Promise<RequestCookie[]>;
export declare function getCookie(name: string): Promise<RequestCookie | undefined>;
export declare function setCookie(...args: [key: string, value: string, cookie?: Partial<ResponseCookie>] | [options: ResponseCookie]): Promise<ResponseCookies>;
export declare function hasCookie(name: string): Promise<boolean>;
export declare function deleteCookie(name: string): Promise<ResponseCookies>;

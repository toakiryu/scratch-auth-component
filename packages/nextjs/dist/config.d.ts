interface ScratchAuthComponentConfigResType {
    cookie_name: string;
    redirect_url: string;
    title: string;
    expiration: number;
    cn?: Function;
    debug?: boolean;
}
declare const config: ScratchAuthComponentConfigResType;
export default config;

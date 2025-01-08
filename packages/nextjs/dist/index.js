"use server";
import { ScratchAuthComponent } from "scratch-auth-component";
import config from "./config";
import { redirect } from "next/navigation";
import { getCookie } from "./cookie.js";
// セッションが存在するか確認
async function checkSession() {
    const session = await getCookie(config.cookie_name);
    if (session) {
        const res = await ScratchAuthComponent.action.decrypt(session.value);
        return res.body ? res.body : null;
    }
    else {
        return null;
    }
}
// セッションを設定
export async function setScratchAuthSession(privateCode) {
    if (!privateCode) {
        return {
            status: false,
            message: "privateCode is required.",
            body: null,
        };
    }
    try {
        const res = await ScratchAuthComponent.action.verifyToken(privateCode);
        if (res.body) {
            if (!res.body.data?.username) {
                return {
                    status: false,
                    message: "Username missing from token response.",
                    body: null,
                };
            }
            await ScratchAuthComponent.action.encryptedData(config.cookie_name, res.body.data.username, config.expiration);
            return {
                status: true,
                message: "Invalid token response during session setup.",
                body: null,
            };
        }
        else {
            return {
                status: false,
                message: "Invalid token response during session setup.",
                body: null,
            };
        }
    }
    catch (error) {
        return {
            status: false,
            message: `${error}`,
            body: null,
        };
    }
}
export const scratchAuthLogin = async (redirect_url) => {
    const session = await checkSession();
    if (session) {
        return false;
    }
    const redirectLocation = btoa(redirect_url || config.redirect_url);
    redirect(`https://auth.itinerary.eu.org/auth/?redirect=${redirectLocation}&name=${config.title}`);
};

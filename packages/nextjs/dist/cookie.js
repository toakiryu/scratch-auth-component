"use server";
import { cookies } from "next/headers";
export async function getAllCookie() {
    const cookieStore = await cookies();
    let res = cookieStore.getAll();
    return res;
}
export async function getCookie(name) {
    const cookieStore = await cookies();
    return cookieStore.get(name);
}
export async function setCookie(...args) {
    const cookieStore = await cookies();
    return cookieStore.set(...args);
}
export async function hasCookie(name) {
    const cookieStore = await cookies();
    return cookieStore.has(name);
}
export async function deleteCookie(name) {
    const cookieStore = await cookies();
    return cookieStore.delete(name);
}

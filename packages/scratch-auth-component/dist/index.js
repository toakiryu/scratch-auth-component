import crypto from "crypto";
const SCRATCH_AUTH_COMPONENT_SECRET_KEY = process.env.SCRATCH_AUTH_COMPONENT_SECRET_KEY;
if (!SCRATCH_AUTH_COMPONENT_SECRET_KEY) {
    throw new Error("SCRATCH_AUTH_COMPONENT_SECRET_KEY is not defined!");
}
const ScratchAuthComponent = {
    action: {
        calculateHmac: async (text) => {
            return {
                status: true,
                message: "Successfully calculated.",
                body: crypto
                    .createHmac("sha256", SCRATCH_AUTH_COMPONENT_SECRET_KEY)
                    .update(text)
                    .digest("hex"),
            };
        },
        encrypt: async (text) => {
            try {
                const iv = crypto.randomBytes(12);
                const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(SCRATCH_AUTH_COMPONENT_SECRET_KEY, "hex"), iv);
                let encrypted = cipher.update(text, "utf8", "hex");
                encrypted += cipher.final("hex");
                const authTag = cipher.getAuthTag().toString("hex");
                return {
                    status: true,
                    message: "Encryption succeeded.",
                    body: `${iv.toString("hex")}:${encrypted}:${authTag}`,
                };
            }
            catch (error) {
                return {
                    status: false,
                    message: "Encryption failed.",
                    error: error,
                    body: null,
                };
            }
        },
        decrypt: async (text) => {
            try {
                const [iv, encrypted, authTag] = text.split(":");
                const decipher = crypto.createDecipheriv("aes-256-gcm", Buffer.from(SCRATCH_AUTH_COMPONENT_SECRET_KEY, "hex"), Buffer.from(iv, "hex"));
                decipher.setAuthTag(Buffer.from(authTag, "hex"));
                let decrypted = decipher.update(encrypted, "hex", "utf8");
                decrypted += decipher.final("utf8");
                return {
                    status: true,
                    message: "Successfully decrypted.",
                    body: decrypted,
                };
            }
            catch (error) {
                return {
                    status: false,
                    message: "Decryption failed",
                    error: error,
                    body: null,
                };
            }
        },
        verifyToken: async (privateCode) => {
            try {
                const res = await fetch(`https://auth.itinerary.eu.org/api/auth/verifyToken?privateCode=${privateCode}`);
                const data = await res.json();
                if (data.valid === true) {
                    let sessionId = crypto.randomUUID();
                    console.log(data);
                    return {
                        status: true,
                        message: "Token authentication succeeded.",
                        body: {
                            sessionId: sessionId,
                            data: data,
                        },
                    };
                }
                else {
                    return {
                        status: false,
                        message: "VerifyToken Error",
                        body: null,
                    };
                }
            }
            catch (error) {
                return {
                    status: false,
                    message: "VerifyToken Error",
                    error: error,
                    body: null,
                };
            }
        },
        encryptedData: async (content, value, days) => {
            try {
                const hmac = await ScratchAuthComponent.action.calculateHmac(value);
                const encryptedRes = await ScratchAuthComponent.action.encrypt(value + "|" + hmac);
                const encryptedValue = encryptedRes.body;
                if (encryptedValue) {
                    const expires = new Date();
                    if (days === -1) {
                        expires.setFullYear(expires.getFullYear() + 200);
                    }
                    else {
                        expires.setDate(expires.getDate() + days);
                    }
                    return {
                        status: true,
                        message: "Encryption succeeded.",
                        body: {
                            name: content,
                            value: encryptedValue,
                            options: {
                                expires: expires,
                                path: "/",
                            },
                        },
                    };
                }
                else {
                    return {
                        status: false,
                        message: "Encryption failed.",
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
        },
        getUserName: async (session) => {
            if (session) {
                const decryptedRes = await ScratchAuthComponent.action.decrypt(session);
                const decrypted = decryptedRes.body;
                if (decrypted) {
                    const [username] = decrypted.split("|");
                    return {
                        status: false,
                        message: "Decryption failed.",
                        body: username,
                    };
                }
                else {
                    return {
                        status: false,
                        message: "Decryption failed.",
                        body: null,
                    };
                }
            }
            return {
                status: false,
                message: "session is required.",
                body: null,
            };
        },
    },
};
export { ScratchAuthComponent };

"use strict";

var _promises = _interopRequireDefault(require("fs/promises"));
var _path = _interopRequireDefault(require("path"));
var _crypto = _interopRequireDefault(require("crypto"));
var _cookie = require("./cookie.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; } // action
const SCRATCH_AUTH_COMPONENT_SECRET_KEY = process.env.SCRATCH_AUTH_COMPONENT_SECRET_KEY;
if (!SCRATCH_AUTH_COMPONENT_SECRET_KEY) {
  throw new Error("SCRATCH_AUTH_COMPONENT_SECRET_KEY is not defined!");
}
async function loadConfig() {
  try {
    // ファイルパスの生成
    const configTsPath = _path.default.resolve("./scratch-auth-component.config.ts");
    const configJsPath = _path.default.resolve("./scratch-auth-component.config.js");

    // 設定ファイルが存在するかを確認
    if (await fileExists(configTsPath)) {
      const {
        default: configTs
      } = await (specifier => new Promise(r => r(`${specifier}`)).then(s => _interopRequireWildcard(require(s))))(configTsPath);
      return configTs;
    } else if (await fileExists(configJsPath)) {
      const {
        default: configJs
      } = await (specifier => new Promise(r => r(`${specifier}`)).then(s => _interopRequireWildcard(require(s))))(configJsPath);
      return configJs;
    } else {
      console.warn("Config file not found. Using default configuration.");
      return {}; // デフォルト設定のベース
    }
  } catch (error) {
    console.error("Error loading configuration:", error);
    throw new Error("Failed to load configuration.");
  }
}

// ファイルの存在を非同期に確認するヘルパー関数
async function fileExists(filePath) {
  try {
    await _promises.default.access(filePath);
    return true;
  } catch {
    return false;
  }
}
const ScratchAuthComponent = {
  config: null,
  action: {},
  set: {},
  auth: {},
  api: {}
};

// 初期化と設定
(async () => {
  const userConfig = await loadConfig();

  /**
   * パッケージの設定
   * @returns {import("../types/types.js").ScratchAuthComponentConfigType}
   */
  ScratchAuthComponent.config = {
    cookie_name: userConfig.cookie_name || "_scratch-auth-session",
    redirect_url: userConfig.redirect_url || "https://localhost:3000/api/auth",
    title: userConfig.title || "Scratch Auth",
    expiration: userConfig.expiration || 30,
    cn: userConfig.cn || null,
    debug: userConfig.debug || false
  };
})();

//
// Action Functions
//

ScratchAuthComponent.action.calculateHmac = async function (text) {
  if (!text) {
    throw new Error("Text is required");
  }
  return _crypto.default.createHmac("sha256", SCRATCH_AUTH_COMPONENT_SECRET_KEY).update(text).digest("hex");
};

/**
 * 暗号化関数
 * @param {string} text
 * @returns {string|Error}
 */
ScratchAuthComponent.action.encrypt = async function (text) {
  if (!text) {
    throw new Error("Text is required");
  }
  try {
    const iv = _crypto.default.randomBytes(12);
    const cipher = _crypto.default.createCipheriv("aes-256-gcm", Buffer.from(SCRATCH_AUTH_COMPONENT_SECRET_KEY, "hex"), iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag().toString("hex");
    return `${iv.toString("hex")}:${encrypted}:${authTag}`;
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * 値の復号をする関数 - もし失敗したらクッキーから値を削除する
 * @param {string} text
 * @returns {string|null} - 失敗した場合は null
 */
ScratchAuthComponent.action.decrypt = async function (text) {
  if (!text) {
    throw new Error("Text is required");
  }
  try {
    const [iv, encrypted, authTag] = text.split(":");
    const decipher = _crypto.default.createDecipheriv("aes-256-gcm", Buffer.from(SCRATCH_AUTH_COMPONENT_SECRET_KEY, "hex"), Buffer.from(iv, "hex"));
    decipher.setAuthTag(Buffer.from(authTag, "hex"));
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    if (ScratchAuthComponent.config.debug) {
      console.warn("Decryption failed:", error);
    }
    (0, _cookie.deleteCookie)(ScratchAuthComponent.config.cookie_name);
    return null;
  }
};

/**
 * トークンの有効性を確認する
 * @param {string} privateCode
 * @returns
 */
ScratchAuthComponent.action.verifyToken = async function (privateCode) {
  if (!privateCode) {
    throw new Error("privateCode is required");
  }
  try {
    if (ScratchAuthComponent.config.debug) {
      console.log("Private Code:", privateCode);
    }
    const res = await fetch(`https://auth.itinerary.eu.org/api/auth/verifyToken?privateCode=${privateCode}`);
    const data = await res.json();
    if (ScratchAuthComponent.config.debug) {
      console.log("Token Verification Response:", data);
    }
    if (data.valid === true && data.redirect === ScratchAuthComponent.config.redirect_url) {
      let sessionId = _crypto.default.randomUUID();
      return JSON.stringify({
        sessionId,
        data
      });
    }
  } catch (error) {
    console.error("VerifyToken Error:", error);
  }
};

/**
 * 値を暗号化してクッキーに保存する
 * @param {string} content
 * @param {string} value
 * @param {number} days
 */
ScratchAuthComponent.action.encryptedData = async function (content, value, days) {
  if (!privateCode) {
    throw new Error("privateCode is required");
  }
  try {
    const hmac = await ScratchAuthComponent.action.calculateHmac(value);
    const encryptedValue = await ScratchAuthComponent.action.encrypt(value + "|" + hmac);
    const expires = new Date();
    if (days === -1) {
      expires.setFullYear(expires.getFullYear() + 200);
    } else {
      expires.setDate(expires.getDate() + days);
    }
    (0, _cookie.setCookie)({
      name: content,
      value: encryptedValue,
      options: {
        expires: expires,
        path: "/"
      }
    });
  } catch (error) {
    throw new Error(error);
  }
};
ScratchAuthComponent.action.decryptedSessionId = async function (content) {
  const encryptedValue = (0, _cookie.getCookie)(content);
  if (encryptedValue) {
    const decryptedValue = await ScratchAuthComponent.action.decrypt(encryptedValue);
    if (decryptedValue) {
      const [sessionId, hmac] = decryptedValue.split("|");
      const calculatedHmac = await ScratchAuthComponent.action.calculateHmac(sessionId);
      if (calculatedHmac === hmac) {
        return sessionId;
      } else {
        if (pkgConfig.debug) {
          console.warn("HMAC does not match. Deleting cookie.");
        }
        (0, _cookie.deleteCookie)(content);
      }
    } else {
      if (pkgConfig.debug) {
        console.warn("Decryption failed. Deleting cookie.");
      }
    }
  }
  return null;
};
ScratchAuthComponent.action.getUserName = async function (content = ScratchAuthComponent.config.cookie_name) {
  const encryptedValue = (0, _cookie.getCookie)(content);
  if (encryptedValue) {
    const decrypted = await ScratchAuthComponent.action.decrypt(encryptedValue);
    if (decrypted) {
      const [username] = decrypted.split("|");
      return username;
    } else {
      if (pkgConfig.debug) {
        console.warn("Decryption failed. Deleting cookie.");
      }
    }
  }
  (0, _cookie.deleteCookie)(content);
  return null;
};

/**
 * セッションの有無を確認する
 * @returns {string|null} - セッションが存在すれば復号化して返す
 */
ScratchAuthComponent.action.checkSession = async function () {
  const session = (0, _cookie.getCookie)(ScratchAuthComponent.config.cookie_name);
  return session ? ScratchAuthComponent.action.decrypt(session) : null;
};

//
// Set Functions
//

/**
 * セッションを認証してクッキーに保存する
 * @param {string} privateCode
 * @returns {object}
 */
ScratchAuthComponent.set.session = async function (privateCode) {
  if (!privateCode) {
    if (ScratchAuthComponent.config.debug) {
      console.warn("setScratchAuthSession: privateCode is null");
    }
    return {
      status: false,
      message: "privateCode is required"
    };
  }
  try {
    const res = await ScratchAuthComponent.action.verifyToken(privateCode);
    if (!res) {
      if (ScratchAuthComponent.config.debug) {
        console.error("Invalid token response during session setup.");
      }
      return {
        status: false,
        message: "Invalid token response during session setup."
      };
    }
    const obj = JSON.parse(res);
    if (!obj.data?.username) {
      if (ScratchAuthComponent.config.debug) {
        console.error("Username missing from token response.");
      }
      return {
        status: false,
        message: "Username missing from token response."
      };
    }
    await ScratchAuthComponent.action.encryptedData(ScratchAuthComponent.config.cookie_name, obj.data.username, ScratchAuthComponent.config.expiration);
    return {
      status: true
    };
  } catch (error) {
    console.error("setScratchAuthSession Error:", error);
    return {
      status: false,
      message: `${error}`
    };
  }
};

//
// Auth Functions
//

ScratchAuthComponent.auth.login = async function () {
  const session = await checkSession();
  if (session) {
    return false; // ログイン済みの場合はリダイレクトしない
  }
  const redirectLocation = btoa(ScratchAuthComponent.config.redirect_url); // Base64エンコード
  window.location.href = `https://auth.itinerary.eu.org/auth/?redirect=${redirectLocation}&name=${ScratchAuthComponent.config.title}`;
};
ScratchAuthComponent.auth.logout = async function () {
  (0, _cookie.deleteCookie)(ScratchAuthComponent.config.cookie_name);
  window.location.reload();
};
ScratchAuthComponent.auth.isLoggedIn = async function () {
  const session = await checkSession();
  return !!session;
};
ScratchAuthComponent.auth.session = async function () {
  const session = await checkSession();
  return session;
};
ScratchAuthComponent.auth.currentUser = async function () {
  const session = await ScratchAuthComponent.action.getUserName(); // セッションを取得

  if (!session) {
    return null; // セッションが存在しない場合はnullを返す
  }
  try {
    const user = await getUser(session); // ユーザー情報を取得
    return user; // ユーザーオブジェクトを返す
  } catch (error) {
    console.error("Error in currentUser:", error);
    return null; // エラーが発生した場合もnullを返す
  }
};

//
// API Functions
//

/**
 * Scratch アカウントのユーザー情報を取得する
 * @param {string} username - 取得する Scratch アカウントのユーザー名
 * @returns {Promise<import("../types/types.js").ScratchUserType | null>}
 */
ScratchAuthComponent.api.getUser = async function (username) {
  try {
    if (!username) {
      throw new Error("Username is required");
    }
    const response = await fetch(`https://api.scratch.mit.edu/users/${username}`);
    if (!response.ok) {
      console.error(`Failed to fetch user data. Status: ${response.status} - ${response.statusText}`);
      return null;
    }
    const user = await response.json();
    if (!user.username) {
      return null;
    }
    return user;
  } catch (error) {
    console.error("Error in getUser:", error);
    throw error;
  }
};
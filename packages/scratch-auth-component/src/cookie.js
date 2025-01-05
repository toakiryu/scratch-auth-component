// cookie.js

/**
 * クッキーを取得する
 * @param {string} name - 取得したいクッキーの名前
 * @returns {string|null} クッキーの値（存在しない場合は null）
 */
export function getCookie(name) {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [key, value] = cookie.split("=");
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

/**
 * クッキーを設定する
 * @param {string} name - 設定するクッキーの名前
 * @param {string} value - 設定するクッキーの値
 * @param {object} [options={}] - オプション (maxAge, path, domain, secure, sameSite)
 */
export function setCookie(name, value, options = {}) {
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (options.maxAge) {
    cookieString += `; max-age=${options.maxAge}`;
  }
  if (options.expires) {
    cookieString += `; expires=${options.expires.toUTCString()}`;
  }
  if (options.path) {
    cookieString += `; path=${options.path}`;
  }
  if (options.domain) {
    cookieString += `; domain=${options.domain}`;
  }
  if (options.secure) {
    cookieString += `; secure`;
  }
  if (options.sameSite) {
    cookieString += `; samesite=${options.sameSite}`;
  }

  document.cookie = cookieString;
}

/**
 * クッキーを削除する
 * @param {string} name - 削除するクッキーの名前
 * @param {string} [path="/"] - クッキーのパス（デフォルトは "/"）
 */
export function deleteCookie(name, path = "/") {
  document.cookie = `${encodeURIComponent(name)}=; max-age=0; path=${path}`;
}

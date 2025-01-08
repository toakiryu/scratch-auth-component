interface ScratchAuthComponentConfigResType {
  cookie_name: string;
  redirect_url: string;
  title: string;
  expiration: number;
  cn?: Function;
  debug?: boolean;
}

const { default: configTs } =
  require(`/scratch-auth-component.config.ts`).default;
const { default: configJs } =
  require(`/scratch-auth-component.config.js`).default;

function getConfig() {
  if (configTs) {
    return configTs;
  }
  if (configJs) {
    return configJs;
  }
  return {};
}
const userConfig = await getConfig();

const config: ScratchAuthComponentConfigResType = {
  cookie_name: userConfig.cookie_name || "_scratch-auth-session",
  redirect_url: userConfig.redirect_url || "https://localhost:3000/api/auth",
  title: userConfig.title || "Scratch Auth",
  expiration: userConfig.expiration || 30,
  cn: userConfig.cn || null,
  debug: userConfig.debug || false,
};

export default config;

const os = require("os");
const fse = require("fs-extra");
const path = require("path");
const setupConfig = {
  currentVersion: "1.8.5",
  // currentENV: "local",
  // currentENV: "dev",
  // currentENV: "staging",
  currentENV: "production",

  /**
   * Electron config
   */
  isElectronStarted: false,

  /**
   * initBrowserLocalApi
   */
  initBrowserPath: path.join(os.homedir(), "kiki-initBrowser"),
  initBrowserConnectionMethod: "file",
  // initBrowserConnectionMethod: "api",
  initBrowserDownloadPath: "",
  initBrowserStatus: "downloading", // downloaded, running, exited, crashed
  initBrowserPort: 8000,
  initBrowserVersion: "",

  profileDir: path.join(os.tmpdir(), "kiki_profiles"),
  pluginDir: path.join(os.homedir(), "kiki-data", "plugins"),
  profileTmpDir: path.join(os.tmpdir(), "kiki_profiles_temp"),
  homeDir: os.homedir(),
  mockFolder: "mockData",

  /**
   * Cấu hình Kiki Automation
   */
  kikiAutomationStatus: "downloading", // downloaded, running, exited, crashed
  kikiAutomationPath: path.join(os.homedir(), "kiki-automation"),
  kikiAutomationVersion: "",
  kikiAutomationPort: 8003,
  kikiAutomationDownloadPath: "",
  // kikiAutomationConnectionMethod: "api", // api hoặc file, nếu là API thì sẽ không start kikiautomation server mà call sang API của KikiAutomation
  kikiAutomationConnectionMethod: "file",

  electron: {
    devTools: false,
  },
  localWebsocketPort: 8001,

  // Logging config
  logLevel: 2, // 1: Log only message, 2: Log all stack trace
  localLogFolder: path.join(os.tmpdir(), "kiki_logs"),
  writeLogToLocalFile: process.env.SAVE_LOG_TO_LOCAL_FILE, // set this env to true to enable writing log to local files

  // File Lưu lại pid các browser đang chạy
  dataDir: path.join(os.tmpdir(), "kiki_data"),
  runningBrowserPid: path.join(
    os.tmpdir(),
    "kiki_data",
    "runningBrowserPid.json"
  ),
};

// Mở devtools nếu đang ở môi trường dev
setupConfig.electron.devTools = setupConfig.currentENV !== "production";

const endpointUrl = {
  local: {
    serverURL: "http://localhost:3301",
    ssoURL: "http://localhost:3302",
    webappURL: "http://localhost:3002",
  },
  dev: {
    serverURL: "https://api-dev.kikilogin.com",
    ssoURL: "https://sso-api-dev.kikisoftware.io",
    webappURL: "https://apps-v2-dev.kikilogin.com",
  },
  staging: {
    serverURL: "https://api-stg.kikilogin.net",
    ssoURL: "https://sso-api-stg.kikisoftware.io",
    webappURL: "https://apps-stg.kikilogin.net",
  },
  production: {
    serverURL: "https://api.kikilogin.com",
    ssoURL: "https://sso-api.kikisoftware.io",
    webappURL: "https://apps.kikilogin.com",
  },
};
const automationDownloadUrl = {
  local:
    "https://local-kikilogin-files.s3.ap-southeast-1.amazonaws.com/automation/bundle.js",
  dev: "https://dev-kikilogin-files.s3.ap-southeast-1.amazonaws.com/automation/bundle.js",
  staging:
    "https://staging-kikilogin-files.s3.ap-southeast-1.amazonaws.com/automation/bundle.js",
  production:
    "https://production-kikilogin-files.s3.ap-southeast-1.amazonaws.com/automation/bundle.js",
};
const initBrowserDownloadUrl = {
  local:
    "https://local-kikilogin-files.s3.ap-southeast-1.amazonaws.com/initBrowser/bundle.js",
  dev: "https://dev-kikilogin-files.s3.ap-southeast-1.amazonaws.com/initBrowser/bundle.js",
  staging:
    "https://staging-kikilogin-files.s3.ap-southeast-1.amazonaws.com/initBrowser/bundle.js",
  production:
    "https://production-kikilogin-files.s3.ap-southeast-1.amazonaws.com/initBrowser/bundle.js",
};
const apiUrl = {
  serverURL: endpointUrl[setupConfig.currentENV].serverURL,
  ssoURL: endpointUrl[setupConfig.currentENV].ssoURL,
  webappURL: endpointUrl[setupConfig.currentENV].webappURL,
};

/**
 * Cấu hình KikiAutomation
 */
// Set lại download path theo env
setupConfig.kikiAutomationDownloadPath =
  automationDownloadUrl[setupConfig.currentENV];
setupConfig.initBrowserDownloadPath =
  initBrowserDownloadUrl[setupConfig.currentENV];

// Set lại kikiAutomationConnectionMethod theo env, nếu là production thì luôn phải là file tránh quên.
// Nếu ko phải là production thì lấy theo cái hiện tại
if (setupConfig.currentENV === "production") {
  setupConfig.kikiAutomationConnectionMethod = "file";
  setupConfig.initBrowserConnectionMethod = "file";
}

/**
 * Check & tạo các folder bắt buộc
 */
fse.ensureDirSync(setupConfig.profileDir);
fse.ensureDirSync(setupConfig.pluginDir);
fse.ensureDirSync(setupConfig.profileTmpDir);
fse.ensureDirSync(setupConfig.localLogFolder);
fse.ensureDirSync(setupConfig.kikiAutomationPath);
fse.ensureDirSync(setupConfig.dataDir);
fse.ensureDirSync(setupConfig.initBrowserPath);
/**
 * Khởi tạo các biến global
 */

global.TUNNEL_MANAGER = {};

module.exports = {
  apiUrl,
  setupConfig,
};

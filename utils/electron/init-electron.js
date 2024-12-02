const os = require("os");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { app, BrowserWindow, Menu, dialog, ipcMain } = require("electron");

const { setupConfig, apiUrl } = require("../../config");
const { initUpdater } = require("./initUpdater");
const { handleOpenUrlFromApp } = require("./utils/handleOpenUrlFromApp");
const { menuItems } = require("../../const/electron");
const { LoggerService } = require("../../services/logger.service");
const { killBrowserProcess } = require("../process/killBrowserProcess");
const { PluginService } = require("../../services/plugin/PluginService");

const protocolLauncherArg = "--protocol-launcher";

/**
 * Global electron variable
 */
let pingInitBrowserInterval;
let splashBrowserWindow;
let mainBrowserWindow;

async function initElectron() {
  const additionalData = { key: "this is the only one instanceeee!" };
  const gotTheLock = app.requestSingleInstanceLock(additionalData);
  if (!gotTheLock) {
    process.exit();
  }

  initUpdater(app);
  app.on("open-url", function (event, url) {
    event.preventDefault();
    console.log(url, event);
  });
  app.on("second-instance", (event, args) => {
    event.preventDefault();
    dialog.showMessageBoxSync(BrowserWindow.getFocusedWindow(), {
      message:
        "KikiLogin is running, please do not run two KikiLogin windows at the same time to avoid data errors",
    });
  });
  const primaryInstance = app.requestSingleInstanceLock();
  if (!primaryInstance) {
    app.quit();
    return;
  }
  app.removeAsDefaultProtocolClient("kikilogin");
  app.setAsDefaultProtocolClient("kikilogin", process.execPath, [
    protocolLauncherArg,
  ]);

  ipcMain.on("close-app", (event) => {
    LoggerService.info(`Clicked close app on Splash screen!`);
    process.exit();
    return;
  });

  app.whenReady().then(async () => {
    /**
     * Clean running plugin
     */
    await PluginService.cleanPlugin();
    mainBrowserWindow = new BrowserWindow({
      // width: 1600,
      // height: 920,
      icon: process.cwd() + "/icon.ico",
      show: false,
      webPreferences: {
        // devTools: false,
        nodeIntegration: true,
        allowRunningInsecureContent: true,
      },
    });
    pingInitBrowserInterval = setInterval(checkAllApiStarted, 1000);

    mainBrowserWindow.webContents.session.clearCache();
    mainBrowserWindow.loadURL(apiUrl.webappURL);
    mainBrowserWindow.webContents.on("new-window", function (e, url) {
      e.preventDefault();
      handleOpenUrlFromApp(url);
    });
    if (setupConfig.electron.devTools) {
      mainBrowserWindow.webContents.openDevTools();
    }
    mainBrowserWindow.on("close", function (e) {
      const choice = require("electron").dialog.showMessageBoxSync(this, {
        type: "question",
        buttons: ["Yes", "No"],
        title: "Confirm",
        message:
          "All running browser will be closed. Are you sure you want to quit?",
      });
      if (choice === 1) {
        e.preventDefault();
      }
    });

    splashBrowserWindow = new BrowserWindow({
      width: 500,
      height: 310,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
    splashBrowserWindow.center();
    let localSpashFilePath = path.join(
      os.homedir(),
      "kiki-data",
      "splash",
      "splash.html"
    );
    if (fs.existsSync(localSpashFilePath)) {
      splashBrowserWindow.loadURL(localSpashFilePath);
    } else {
      splashBrowserWindow.loadURL(
        `file://${path.join(
          __dirname,
          "..",
          "..",
          "const",
          "ui",
          "splash",
          "splash.html"
        )}`
      );
    }

    const menu = Menu.buildFromTemplate(menuItems);
    Menu.setApplicationMenu(menu);

    setupConfig.isElectronStarted = true;
  });
  app.on("ready", () => {
    app.on("activate", function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
  app.on("window-all-closed", async (e) => {
    LoggerService.info("Closing KikiLogin");
    await killBrowserProcess();
    app.quit();
  });
}

async function checkAllApiStarted() {
  try {
    let initBrowserStatus = setupConfig.initBrowserStatus;
    let kikiAutomationStatus = setupConfig.kikiAutomationStatus;
    if (initBrowserStatus === "crashed" || kikiAutomationStatus === "crashed") {
      // Nếu một trong 2 service bị lỗi thì xoá interval không chờ nữa
      clearInterval(pingInitBrowserInterval);
    }
    let result = await axios.get("http://localhost:8000/ping");
    result = result.data.data;
    if (
      initBrowserStatus === "running" &&
      kikiAutomationStatus === "running" &&
      result.chromeStatus !== "downloaded"
    ) {
      LoggerService.info(
        `[INIT-BROWSER-ELECTRON] Downloading KikiBrowser: ${result.appDataChromeDownloadMessage}`
      );
      splashBrowserWindow.webContents.send("downloadingKikiBrowser", {
        statusMessage: result.appDataChromeDownloadMessage,
      });
    }
    if (
      kikiAutomationStatus === "running" &&
      initBrowserStatus === "running" &&
      result.chromeStatus === "downloaded"
    ) {
      clearInterval(pingInitBrowserInterval);
      splashBrowserWindow.close();
      mainBrowserWindow.show();
      mainBrowserWindow.maximize();
    }
  } catch (e) {
    LoggerService.error(
      `[INIT-BROWSER-ELECTRON] Failed to ping Init-Browser! Error ${e.message}`
    );
  }
}

// Để truy cập được splashWindows từ bên ngoài, cần tạo function get trả về splashWindows chứ không export thẳng splashWindows được
async function getSplashWindows() {
  return splashBrowserWindow;
}

module.exports = {
  initElectron,
  getSplashWindows,
};

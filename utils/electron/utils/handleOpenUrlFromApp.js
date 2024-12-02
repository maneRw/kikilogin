const { BrowserWindow } = require("electron");
const { setupConfig } = require("../../../config");
const { handleOpenPlugin } = require("./handleOpenPlugin");

async function handleOpenUrlFromApp(url) {
  if (url && url.includes("kikilogin-open-plugin")) {
    await handleOpenPlugin(url);
  } else if (url && url.includes("/device-management/")) {
    // Nếu là link xem liveview thì bật trong cửa sổ mới
    const newWindows = new BrowserWindow({
      width: 1500,
      height: 768,
      icon: process.cwd() + "/icon.ico",
      show: true,
      webPreferences: {
        allowRunningInsecureContent: true,
      },
    });
    newWindows.loadURL(url);
    if (setupConfig.electron.devTools) {
      newWindows.webContents.openDevTools();
    }
  } else {
    // Không phải link xem liveview thì bật trong trình duyệt
    require("electron").shell.openExternal(url);
  }
}
module.exports = {
  handleOpenUrlFromApp,
};

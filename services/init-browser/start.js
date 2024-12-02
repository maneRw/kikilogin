const { setupConfig } = require("../../config");
const { LoggerService } = require("../logger.service");
const path = require("path");
const axios = require("axios");
const fs = require("fs");
const { getSplashWindows } = require("../../utils/electron/init-electron");

async function startInitBrowser() {
  LoggerService.info("Starting Init-Browser server...");
  let splashBrowserWindow = await getSplashWindows();

  try {
    let initBrowserFileName = "initBrowser.js";
    let initBrowserFilePath = path.join(
      setupConfig.initBrowserPath,
      initBrowserFileName
    );
    if (fs.existsSync(initBrowserFilePath)) {
      let { startLocalApi } = require(initBrowserFilePath);
      startLocalApi()
        .then(async (res) => {
          LoggerService.info("Checking version...");
          let response = await axios.get(
            `http://localhost:${setupConfig.initBrowserPort}/ping`
          );
          response = response.data.data;
          let { currentVersion } = response;
          // Set kikiAutomation status
          setupConfig.initBrowserVersion = currentVersion;
          setupConfig.initBrowserStatus = "running";
          LoggerService.info("Init-Browser server started!");
        })
        .catch((err) => {
          setupConfig.initBrowserStatus = "crashed";
          LoggerService.error(err);
          throw new Error(err);
        });
    } else {
      splashBrowserWindow.webContents.send("showErrorMessage", {
        statusMessage: "Failed to start Local-API. Restart and try again!",
      });
      throw new Error("INIT_BROWSER_FILE_NOT_FOUND");
    }
  } catch (e) {
    setupConfig.initBrowserStatus = "crashed";
    splashBrowserWindow.webContents.send("showErrorMessage", {
      statusMessage: "Failed to start Local-API. Restart and try again!",
    });
    LoggerService.error("Init-Browser server failed to start! " + e.message);
  }
}
module.exports = {
  startInitBrowser,
};

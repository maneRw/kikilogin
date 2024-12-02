const { setupConfig } = require("../../config");
const { LoggerService } = require("../logger.service");
const path = require("path");
const axios = require("axios");
const fs = require("fs");
const { getSplashWindows } = require("../../utils/electron/init-electron");
async function startAutomationServer() {
  LoggerService.info("[AUTOMATION] Starting automation server...");
  let splashBrowserWindow = await getSplashWindows();
  try {
    let automationName = "automation.js";
    let automationFile = path.join(
      setupConfig.kikiAutomationPath,
      automationName
    );
    if (fs.existsSync(automationFile)) {
      let { startLocalApi } = require(automationFile);
      startLocalApi()
        .then(async (res) => {
          LoggerService.info("[AUTOMATION] Checking version...");
          let response = await axios.get(
            `http://localhost:${setupConfig.kikiAutomationPort}/api/local-api/ping`
          );
          response = response.data.data;
          let { currentVersion } = response;
          // Set kikiAutomation status
          setupConfig.kikiAutomationVersion = currentVersion;
          setupConfig.kikiAutomationStatus = "running";
          LoggerService.info("[AUTOMATION] Automation server started!");
        })
        .catch((err) => {
          setupConfig.kikiAutomationStatus = "crashed";
          LoggerService.error(err);
          throw new Error(err);
        });
    } else {
      splashBrowserWindow.webContents.send("showErrorMessage", {
        statusMessage: "Failed to start KikiAutomation. Restart and try again!",
      });
      throw new Error("KIKI_AUTOMATION_FILE_NOT_FOUND");
    }
  } catch (e) {
    setupConfig.kikiAutomationStatus = "crashed";
    splashBrowserWindow.webContents.send("showErrorMessage", {
      statusMessage: "Failed to start KikiAutomation. Restart and try again!",
    });
    LoggerService.error("[AUTOMATION] Automation server failed to start!");
  }
}
module.exports = {
  startAutomationServer,
};

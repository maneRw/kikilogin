const axios = require("axios");
const fs = require("fs");
const { setupConfig } = require("../../config");
const path = require("path");
var md5 = require("md5");
const { LoggerService } = require("../logger.service");
const { getSplashWindows } = require("../../utils/electron/init-electron");

async function downloadAutomationServer() {
  let splashBrowserWindow = await getSplashWindows();
  let automationName = "automation.js";
  let automationFile = path.join(
    setupConfig.kikiAutomationPath,
    automationName
  );
  try {
    splashBrowserWindow.webContents.send("downloadComponent", {
      statusMessage: "Checking KikiAutomation",
    });
    LoggerService.info("[AUTOMATION] Checking KikiAutomation...");

    let shouldDownload = true;
    let downloadLink = setupConfig.kikiAutomationDownloadPath;
    // Check etag
    let remoteFileHash = await axios.head(downloadLink);
    remoteFileHash = remoteFileHash?.headers?.etag || "";

    if (fs.existsSync(automationFile)) {
      // Nếu có file rồi thì check xem file automation mới có update gì không? Nếu hash md5 không đổi thì không cần tải về

      let currentFileData = fs.readFileSync(automationFile);
      let currentVersionHash = md5(currentFileData);
      if (remoteFileHash.includes(currentVersionHash)) {
        shouldDownload = false;
        LoggerService.info("[AUTOMATION] Not found new version!");
      } else {
        LoggerService.info("[AUTOMATION] Hash Different! Download new version");
      }
    } else {
      LoggerService.info("[AUTOMATION] KikiAutomation not installed!");
    }
    console.log({ shouldDownload });
    if (shouldDownload) {
      LoggerService.info(
        `[AUTOMATION] Starting download new KikiAutomation version ${remoteFileHash}...`
      );
      try {
        let downloadBinaryFile = await axios.get(downloadLink, {
          responseType: "arraybuffer",
        });
        if (downloadBinaryFile.data) {
          await fs.writeFileSync(automationFile, downloadBinaryFile.data);
          setupConfig.kikiAutomationStatus = "downloaded";
          LoggerService.info(
            "[AUTOMATION] New KikiAutomation version downloaded!"
          );
        } else {
          throw new Error("MISSING_DATA");
        }
      } catch (e) {
        LoggerService.error(
          `[AUTOMATION] Failed to download automation from ${downloadLink}`
        );
        throw new Error("FAILED_TO_DOWNLOAD_KIKI_AUTOMATION");
      }
    } else {
      splashBrowserWindow.webContents.send("downloadComponent", {
        statusMessage: "Downloading KikiAutomation done!",
      });
    }
  } catch (e) {
    if (!fs.existsSync(automationFile)) {
      setupConfig.kikiAutomationStatus = "crashed";
      splashBrowserWindow.webContents.send("showErrorMessage", {
        statusMessage:
          "Failed to download KikiAutomation. Restart and try again!",
      });
      throw new Error(e);
    } else {
      LoggerService.info(`Old automation file exists => Use old file`);
    }
  }
}
module.exports = {
  downloadAutomationServer,
};

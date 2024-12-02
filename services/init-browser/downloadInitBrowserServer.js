const axios = require("axios");
const fs = require("fs");
const { setupConfig } = require("../../config");
const path = require("path");
var md5 = require("md5");
const { LoggerService } = require("../logger.service");
const { getSplashWindows } = require("../../utils/electron/init-electron");

async function downloadInitBrowserServer() {
  let splashBrowserWindow = await getSplashWindows();
  let initBrowserFileName = "initBrowser.js";
  let initBrowserFilePath = path.join(
    setupConfig.initBrowserPath,
    initBrowserFileName
  );
  try {
    splashBrowserWindow.webContents.send("downloadComponent", {
      statusMessage: "Checking Local-API",
    });
    LoggerService.info("Checking Init Browser...");

    let shouldDownload = true;
    let downloadLink = setupConfig.initBrowserDownloadPath;
    // Check etag
    let remoteFileHash = await axios.head(downloadLink);
    remoteFileHash = remoteFileHash?.headers?.etag || "";

    if (fs.existsSync(initBrowserFilePath)) {
      let currentFileData = fs.readFileSync(initBrowserFilePath);
      let currentVersionHash = md5(currentFileData);
      if (remoteFileHash.includes(currentVersionHash)) {
        shouldDownload = false;
        LoggerService.info("[INIT-BROWSER] Not found new version!");
      } else {
        LoggerService.info(
          "[INIT-BROWSER] Hash Different! Download new version"
        );
      }
    } else {
      LoggerService.info("Init-Browser not installed!");
    }
    console.log({ shouldDownload });
    if (shouldDownload) {
      LoggerService.info(
        `[INIT-BROWSER] Starting download new Init-Browser version ${remoteFileHash}...`
      );
      try {
        let downloadBinaryFile = await axios.get(downloadLink, {
          responseType: "arraybuffer",
        });
        if (downloadBinaryFile.data) {
          await fs.writeFileSync(initBrowserFilePath, downloadBinaryFile.data);
          setupConfig.initBrowserStatus = "downloaded";
          LoggerService.info(
            "[INIT-BROWSER] New Init-Browser version downloaded!"
          );
        } else {
          throw new Error("MISSING_DATA");
        }
      } catch (e) {
        LoggerService.error(
          `Failed to download Init-Browser from ${downloadLink}`
        );
        throw new Error("FAILED_TO_DOWNLOAD_LOCAL_API");
      }
    } else {
      splashBrowserWindow.webContents.send("downloadComponent", {
        statusMessage: "Downloading Local-API done!",
      });
    }
  } catch (e) {
    if (!fs.existsSync(initBrowserFilePath)) {
      setupConfig.initBrowserStatus = "crashed";
      LoggerService.error(e);
      splashBrowserWindow.webContents.send("showErrorMessage", {
        statusMessage: "Failed to download Local-API. Restart and try again!",
      });
      throw new Error(e);
    } else {
      LoggerService.info(`Old InitBrowser file exists => Use old file`);
    }
  }
}
module.exports = {
  downloadInitBrowserServer,
};

const { LoggerService } = require("./services/logger.service");
const { setupConfig } = require("./config");
const { initElectron } = require("./utils/electron/init-electron");
const { startAutomationServer } = require("./services/automation/start");
const { startInitBrowser } = require("./services/init-browser/start");
const {
  downloadAutomationServer,
} = require("./services/automation/downloadAutomationServer");
const {
  downloadInitBrowserServer,
} = require("./services/init-browser/downloadInitBrowserServer");
const { watchProcessList } = require("./utils/process/watchProcessList");

let waitForElectronStartedInterval;

try {
  initElectron()
    .then(async (res) => {
      waitForElectronStartedInterval = setInterval(
        waitForElectronStarted,
        1000
      );
    })
    .catch((err) => {
      LoggerService.error(err);
    });
  watchProcessList();
} catch (e) {
  LoggerService.error(e);
}
async function waitForElectronStarted() {
  let isStarted = setupConfig.isElectronStarted;
  if (isStarted) {
    LoggerService.info(`Init-Browser-Electron started!`);
    clearInterval(waitForElectronStartedInterval);

    // Download required components
    await downloadAutomationServer();
    await downloadInitBrowserServer();

    // Start required components
    if (setupConfig.kikiAutomationConnectionMethod === "file") {
      // Nếu phương thức kết nối là file thì sẽ kết nối qua call function
      startAutomationServer()
        .then(async (res) => {
          LoggerService.info("Automation server started!");
        })
        .catch((err) => {
          console.log(err);
          LoggerService.error("Automation server failed to start!");
        });
    } else {
      // Không phải start = file => set mode running để có thể test được
      setupConfig.kikiAutomationStatus = "running";
    }
    if (setupConfig.initBrowserConnectionMethod === "file") {
      startInitBrowser()
        .then(async (res) => {
          LoggerService.info("Init-Browser server started!");
        })
        .catch((err) => {
          console.log(err);
          LoggerService.error("Init-Browser server failed to start!");
        });
    } else {
      // Không phải start = file => set mode running để có thể test được
      setupConfig.initBrowserStatus = "running";
    }
  }
}

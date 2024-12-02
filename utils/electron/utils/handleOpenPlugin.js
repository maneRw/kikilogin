const { BrowserWindow } = require("electron");
const path = require("path");
const axios = require("axios");
const { apiUrl, setupConfig } = require("../../../config");
const { getPluginInfo } = require("./getPluginInfo");
const fs = require("fs");
const { LoggerService } = require("../../../services/logger.service");
const getPort = require("../../process/getPort");
const { PluginService } = require("../../../services/plugin/PluginService");
const os = require("os");
const { getPluginIcon } = require("../../plugin/getPluginIcon");

async function handleOpenPlugin(url) {
  let loadingAndErrorWindows = new BrowserWindow({
    width: 500,
    height: 310,
    transparent: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  renderLoadingScreen(loadingAndErrorWindows);
  // if is open plugin => Check lan luot cac api sau
  // Calling local-api to check plugin permissions
  // Calling local-api to check plugin update
  // Calling local-api to check plugin url and then redirect to this url
  // Mục tiêu là init-browser chỉ dùng để check, còn lại xử lý sẽ ở tất cả bên local-api để sau có thể update dễ dàng được
  /**
   * Step 1: Open an splash with loading screen
   * Step 2: Waiting for plugin loaded from local-api
   * Step 3: Replace loading screen with real url of plugin
   */
  let { pluginId, sessionId } = parsePluginIdAndSessionId(url);
  // let pluginId = url.split("=")[1];
  // Check plugin + update
  let checkPluginUpdateResult = await axios.post(
    `http://localhost:8000/api/plugin/check-and-update`,
    {
      pluginId,
    },
    {
      headers: {
        Authorization: sessionId,
      },
    }
  );
  if (!checkPluginUpdateResult.data.success) {
    // Return luôn để không bị tạo thêm cửa sổ cho plugin
    return renderFailedScreen(loadingAndErrorWindows);
  }

  let pluginSlug = checkPluginUpdateResult.data.data.slug;

  // Load plugin

  /**
   * If plugin spawnMethod = file => Load js file here
   * If not => Calling local-api to spawn
   */
  let { pluginConfig, localAPIFilePath } = await getPluginInfo(pluginSlug);
  let pluginWindowConfig = {
    width: 500,
    height: 310,
    transparent: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  };
  if (fs.existsSync(getPluginIcon({ pluginSlug }))) {
    pluginWindowConfig.icon = getPluginIcon({ pluginSlug });
  }
  let pluginBrowserWindow = new BrowserWindow(pluginWindowConfig);
  if (os.platform() === "win32") {
    // Set lại app id để mở trong cửa sổ mới hoàn toàn
    pluginBrowserWindow.setAppDetails({
      appId: pluginSlug,
    });
  }
  if (pluginConfig.localAPIConfig.startupMethod === "require") {
    try {
      // Startup method = require => Start js file here
      let runningPluginInfo = await PluginService.checkRunningPlugin(
        pluginSlug
      );
      if (runningPluginInfo) {
        // Plugin da load roi, render lai voi thong tin cua plugin va dong cua so loading
        let defaultUrlParams = `?sessionId=${sessionId}&localPort=${runningPluginInfo.localAPIPort}&kikiloginApiEndpoint=${apiUrl.serverURL}&kikiSSOApiEndpoint=${apiUrl.ssoURL}`;
        pluginBrowserWindow.setSize(1500, 900, false);
        pluginBrowserWindow.loadURL(
          `${runningPluginInfo.frontendUrl}${defaultUrlParams}`
        );
        if (setupConfig.electron.devTools) {
          pluginBrowserWindow.webContents.openDevTools();
        }
        loadingAndErrorWindows.close();
      } else {
        LoggerService.info(`Plugin ${pluginSlug} is not loaded!`);
        // Plugin chua duoc load, load full
        // Check xem plugin da duoc load hay chua, neu load roi thi lay thong tin ra con chua load thi moi load plugin va luu thong tin lai
        const freePort = await getPort();

        let fileContent = fs.readFileSync(localAPIFilePath).toString();
        fileContent = fileContent.replace("%LOCAL_API_PORT%", freePort);
        fs.writeFileSync(localAPIFilePath, fileContent);

        let { startLocalApi } = require(localAPIFilePath);
        startLocalApi()
          .then(async (res) => {
            LoggerService.info(
              `Plugin ${pluginSlug} loaded at port ${freePort}`
            );

            let frontendUrl = await PluginService.getPluginFrontendUrl(
              pluginSlug
            );
            let defaultUrlParams = `?sessionId=${sessionId}&localPort=${freePort}&kikiloginApiEndpoint=${apiUrl.serverURL}&kikiSSOApiEndpoint=${apiUrl.ssoURL}`;
            pluginBrowserWindow.setSize(1000, 600, false);
            pluginBrowserWindow.loadURL(`${frontendUrl}${defaultUrlParams}`);
            if (setupConfig.electron.devTools) {
              pluginBrowserWindow.webContents.openDevTools();
            }
            loadingAndErrorWindows.close();
            // Write running plugin to file
            let moreInfo = {
              frontendUrl,
              localAPIPort: freePort,
            };
            await PluginService.addRunningPlugin({ pluginSlug, moreInfo });
          })
          .catch(async (err) => {
            console.log(err);

            // Xoa khoi plugin dang chay
            await PluginService.removeRunningPlugin(pluginSlug);
          });

        // Load xong thì phải replace lai port cũ để sau còn tìm dđược mà sửa
        fileContent = fileContent.replace(freePort, "%LOCAL_API_PORT%");
        fs.writeFileSync(localAPIFilePath, fileContent);
      }
    } catch (e) {
      LoggerService.error(e);
      renderFailedScreen(loadingAndErrorWindows);
      pluginBrowserWindow.close();
      await PluginService.removeRunningPlugin(pluginSlug);
    }
  } else {
    // Calling local-api to spawn exe file
  }
}
function parsePluginIdAndSessionId(url) {
  let pluginId = "";
  let sessionId = "";

  url = url.split("kikilogin-open-plugin?");
  url = url[1];
  url = url.split("&");
  if (url[0].includes("sessionId")) {
    pluginId = url[1].split("=")[1];
    sessionId = url[0].split("=")[1];
  } else if (url[1].includes("sessionId")) {
    pluginId = url[0].split("=")[1];
    sessionId = url[1].split("=")[1];
  }

  return { pluginId, sessionId };
}
function renderFailedScreen(loadingAndErrorWindows) {
  loadingAndErrorWindows.loadURL(
    `file://${path.join(
      __dirname,
      "..",
      "..",
      "..",
      "const",
      "ui",
      "loading",
      "loadingFailed.html"
    )}`
  );
}
function renderLoadingScreen(loadingAndErrorWindows) {
  loadingAndErrorWindows.loadURL(
    `file://${path.join(
      __dirname,
      "..",
      "..",
      "..",
      "const",
      "ui",
      "loading",
      "loading.html"
    )}`
  );
}
module.exports = {
  handleOpenPlugin,
};

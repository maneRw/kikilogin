const path = require("path");
const { setupConfig } = require("../../../config");
const fs = require("fs");
const { LoggerService } = require("../../../services/logger.service");

async function getPluginInfo(pluginSlug) {
  let pluginConfigFilePath = path.join(
    setupConfig.pluginDir,
    pluginSlug,
    "kikiPluginConfig.json"
  );
  if (!fs.existsSync(pluginConfigFilePath))
    throw new Error("LOCAL_API.PLUGIN.PLUGIN_NOT_FOUND_TO_LOAD");

  try {
    let pluginConfig = JSON.parse(
      fs.readFileSync(pluginConfigFilePath).toString()
    );
    let localAPIFilePath = path.join(
      setupConfig.pluginDir,
      pluginSlug,
      "local-api",
      "local-api.js"
    );
    return { pluginConfig, localAPIFilePath };
  } catch (e) {
    LoggerService.error(e);
    throw new Error("LOCAL_API.PLUGIN.FAILED_TO_LOAD_PLUGIN");
  }
}
module.exports = {
  getPluginInfo,
};

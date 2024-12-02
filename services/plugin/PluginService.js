const path = require("path");
const fs = require("fs");
const { setupConfig } = require("../../config");
const runningPluginFilePath = path.join(
  setupConfig.pluginDir,
  "runningPlugin.json"
);
class PluginService {
  static async cleanPlugin() {
    this.writeRunningPlugin({});
  }
  static async addRunningPlugin({ pluginSlug, moreInfo }) {
    let runningPluginInfo = this.getRunningPlugin();
    runningPluginInfo[pluginSlug] = moreInfo;
    this.writeRunningPlugin(runningPluginInfo);
  }
  static async getPluginFrontendUrl(pluginSlug) {
    let pluginConfig = this.getPluginConfig(pluginSlug);
    if (pluginConfig?.frontendConfig?.loadMethod === "url") {
      return pluginConfig.frontendConfig.url;
    } else {
      // Load local file
      let htmlFilePath = path.join(
        setupConfig.pluginDir,
        pluginSlug,
        "frontend",
        "index.html"
      );
      return `file://${htmlFilePath}`;
    }
  }
  static async checkRunningPlugin(pluginSlug) {
    let runningPluginInfo = this.getRunningPlugin();
    return runningPluginInfo[pluginSlug];
  }
  static async removeRunningPlugin(pluginSlug) {
    let runningPluginInfo = this.getRunningPlugin();
    delete runningPluginInfo[pluginSlug];
    this.writeRunningPlugin(runningPluginInfo);
  }
  static getRunningPlugin() {
    if (fs.existsSync(runningPluginFilePath)) {
      let runningPlugin = fs.readFileSync(runningPluginFilePath).toString();
      return JSON.parse(runningPlugin);
    } else return {};
  }
  static writeRunningPlugin(runningPlugin) {
    fs.writeFileSync(runningPluginFilePath, JSON.stringify(runningPlugin));
  }
  static getPluginConfig(pluginSlug) {
    let pluginConfigFilePath = path.join(
      setupConfig.pluginDir,
      pluginSlug,
      "kikiPluginConfig.json"
    );
    if (fs.existsSync(pluginConfigFilePath)) {
      return JSON.parse(fs.readFileSync(pluginConfigFilePath));
    } else return {};
  }
}
module.exports = {
  PluginService,
};

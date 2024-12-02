const path = require("path");
const { setupConfig } = require("../../config");

function getPluginIcon({ pluginSlug }) {
  return path.join(setupConfig.pluginDir, pluginSlug, "assets", "logo.png");
}
module.exports = {
  getPluginIcon,
};

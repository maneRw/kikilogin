const exec = require("child_process").exec;
const os = require("os");
const { setupConfig } = require("../../config");
let processWatchInterval;
if (setupConfig.currentENV === "production") {
  processWatchInterval = setInterval(watchProcessList, 5000);
}
function watchProcessList() {
  if (os.platform() === "win32") {
    const blacklistProcessName = [
      "Fiddler.exe",
      "Proxyfier.exe",
      "BurpSuiteCommunity.exe",
    ];
    exec("tasklist", function (err, stdout, stderr) {
      blacklistProcessName.map((eachP) => {
        if (stdout.includes(eachP)) {
          console.log("Have app in blacklist => Exit");
          process.exit(1);
        }
      });
    });
  }
}
module.exports = {
  watchProcessList,
};

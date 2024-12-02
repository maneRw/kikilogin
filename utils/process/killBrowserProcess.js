const path = require("path");
const os = require("os");
const { LoggerService } = require("../../services/logger.service");
const fs = require("fs");
const treeKill = require("tree-kill");

async function killBrowserProcess() {
  const runningBrowserPidFile = path.join(
    os.tmpdir(),
    "kiki_data",
    "runningBrowserPid.json"
  );
  if (fs.existsSync(runningBrowserPidFile)) {
    try {
      let fileContent = JSON.parse(
        fs.readFileSync(runningBrowserPidFile).toString()
      );
      Object.keys(fileContent).map((eachProfile) => {
        let pid = fileContent[eachProfile];
        treeKill(pid);
      });
    } catch (e) {
      LoggerService.info(`Error killing process!`);
    }
  }
}
module.exports = {
  killBrowserProcess,
};

const { setupConfig } = require("../config");
const fs = require("fs");
const path = require("path");
const moment = require("moment");

class LoggerService {
  static currentENV = setupConfig.currentENV;
  static logLevel = setupConfig.logLevel;
  static writeLogToLocalFile = setupConfig.writeLogToLocalFile;
  static todayLogFileName = path.join(
    setupConfig.localLogFolder,
    `${moment(new Date()).format("DD-MM-YYYY")}.log`
  );
  static error(error) {
    if (this.logLevel === 1) {
      console.log(
        "[ERROR] [KIKILOGIN-ELECTRON]",
        error.message ? error.message : error
      );
    } else if (this.logLevel === 2) {
      console.log("[ERROR] [KIKILOGIN-ELECTRON]", error);
    }
  }
  static warning(error) {
    if (this.currentENV === "production") {
    }
    if (this.logLevel === 1) {
      console.log(
        "[WARNING] [KIKILOGIN-ELECTRON]",
        error.message ? error.message : error
      );
    } else if (this.logLevel === 2) {
      console.log("[WARNING] [KIKILOGIN-ELECTRON]", error);
    }
  }
  static info(data) {
    if (this.logLevel === 1) {
      console.log(
        "[INFO] [KIKILOGIN-ELECTRON]",
        data.message ? data.message : data
      );
      this.writeLogToFile("INFO", data);
    } else if (this.logLevel === 2) {
      console.log("[INFO] [KIKILOGIN-ELECTRON]", data);
      this.writeLogToFile("INFO", data);
    }
  }
  static writeLogToFile(type, data) {
    let logTime = moment(new Date()).format("DD-MM-YYYY HH:mm:ss");
    if (this.writeLogToLocalFile) {
      fs.appendFileSync(
        this.todayLogFileName,
        `[${logTime}] [${type}] ${data} \n`
      );
    }
  }
}
module.exports = {
  LoggerService,
};

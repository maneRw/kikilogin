const { shell } = require("electron");
const { setupConfig } = require("../config");
const isMac = process.platform === "darwin";

const menuItems = [
  {
    label: `KikiLogin Galaxy ${setupConfig.currentVersion} ${setupConfig.currentENV}`,
  },
  {
    label: "File",
    submenu: [isMac ? { role: "close" } : { role: "quit" }],
  },
  {
    label: "Edit",
    submenu: [
      { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
      {
        label: "Redo",
        accelerator: "Shift+CmdOrCtrl+Z",
        selector: "redo:",
      },
      { type: "separator" },
      { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
      { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
      { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
      {
        label: "Select All",
        accelerator: "CmdOrCtrl+A",
        selector: "selectAll:",
      },
    ],
  },
  {
    label: "View",
    submenu: [{ role: "reload" }, { role: "forceReload" }],
  },
  {
    role: "help",
    submenu: [
      {
        label: "KikiLogin Help (EN)",
        click: async () => {
          await shell.openExternal("https://docs.kikilogin.com/");
        },
      },
      {
        label: "KikiLogin Help (VI)",
        click: async () => {
          await shell.openExternal("https://tailieu.kikilogin.com/");
        },
      },
    ],
  },
];
module.exports = {
  menuItems,
};

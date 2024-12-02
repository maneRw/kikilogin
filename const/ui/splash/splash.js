const { ipcRenderer } = require("electron");
const progressStatuses = [
  "Downloading new KikiBrowser version: ", // Circle loader
  "Error: ",
];
function handleClose() {
  ipcRenderer.send("close-app");
}
ipcRenderer.on("downloadingKikiBrowser", (event, message) => {
  const progressDescription = document.getElementById("circle-preloader-text");
  progressDescription.style.color = "";
  progressDescription.style.backgroundColor = "";
  progressDescription.innerText =
    progressStatuses[0] + message?.statusMessage || "";
});
ipcRenderer.on("showErrorMessage", (event, message) => {
  const progressDescription = document.getElementById("circle-preloader-text");
  const loadingIcon = document.getElementsByClassName("loader")[0];
  loadingIcon.style.visibility = "hidden";
  progressDescription.style.color = "red";
  progressDescription.style.backgroundColor = "yellow";
  progressDescription.innerText =
    progressStatuses[1] + message?.statusMessage || "";
});
ipcRenderer.on("downloadComponent", (event, message) => {
  const progressDescription = document.getElementById("circle-preloader-text");
  progressDescription.innerText = message?.statusMessage || "";
  progressDescription.style.color = "";
  progressDescription.style.backgroundColor = "";
});
document
  .getElementById("close-icon-wrapper")
  .addEventListener("click", handleClose);

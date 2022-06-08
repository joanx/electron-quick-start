// Modules to control application life and create native browser window
const { app, pushNotifications, BrowserWindow, Notification, dialog } = require("electron");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      webSecurity: false,
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(`${app.getAppPath()}/src/index.html`);

  // Emitted when the window is closed.
  mainWindow.on("closed", function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", (event, launch_info) => {
  if (launch_info != null && Object.keys(launch_info).length > 0) {
    launchInfoString = JSON.stringify(launch_info);
  }
  createWindow();
  pushNotifications.registerForAPNSNotifications();
});

// Quit when all windows are closed.
app.on("window-all-closed", function() {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function() {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

pushNotifications.on("registered-for-apns-notifications", (event, token) => {
  dialog.showMessageBox({title: "Registered for APNS", detail: token})
});

pushNotifications.on(
  "failed-to-register-for-apns-notifications",
  (event, error) => {
    dialog.showMessageBox({title: "Failed to register for APNS", detail: `failed to register: ${error}`})
  }
);

pushNotifications.on("received-apns-notification", (event, user_info) => {
  const title = user_info["aps"]["alert"]["title"]
  const body = user_info["aps"]["alert"]["body"]
  new Notification({ title, body}).show()
});

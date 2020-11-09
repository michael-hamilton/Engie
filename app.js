const { app, BrowserWindow } = require('electron');

function createWindow () {
    let win = new BrowserWindow({
        width: 640,
        height: 480,
        webPreferences: {
            nodeIntegration: true
        }
    });

    win.loadURL("http://localhost:1234");
}

app.on('ready', createWindow);

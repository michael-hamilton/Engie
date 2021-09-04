/*
 * Engie
 * © 2020-2021 Mike Hamilton
 */

const { app, BrowserWindow, globalShortcut } = require('electron');

const createWindow = async () => {
    const window = new BrowserWindow({
        autoHideMenuBar: true,
        width: 640,
        height: 480,
        webPreferences: {
            nodeIntegration: true,
        }
    });

    if (process.env.NODE_ENV === 'development') {
        window.openDevTools({mode: 'detach'});
        await window.loadURL('http://localhost:1234');
    }
    else {
        globalShortcut.register('Command+R', () => false);
        globalShortcut.register('Control+R', () => false);
        await window.loadURL(`file://${__dirname}/dist/index.html`);
    }
}

app.on('ready', createWindow);

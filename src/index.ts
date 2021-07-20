import {app, BrowserWindow} from 'electron';


app.on('ready', () => {
    app.allowRendererProcessReuse = false;
    new BrowserWindow({
        backgroundColor: "#fff",
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false,
            contextIsolation: false,
        }
    }).loadFile("resources/index.html");
});

import {app, BrowserWindow} from 'electron'
import SerialPort from 'serialport'

new SerialPort("COM1")
app.on('ready', () => {
    new BrowserWindow({
        backgroundColor: "#fff",
        webPreferences: {
            nodeIntegration: true
        }
    }).loadFile("resources/index.html")
})

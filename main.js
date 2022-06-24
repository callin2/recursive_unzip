// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron')
const {dialog} = require('electron')
const extract = require('extract-zip')
const fs = require("fs")
const path = require('path')

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 400,
        autoHideMenuBar: true,
        icon:"zip.png",

        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    // and load the index.html of the app.
    mainWindow.loadFile('index.html')

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    return mainWindow
}

async function extractAFile(mainWindow,  fullFilePath) {
    // extract filename from path string
    let file =  path.basename(fullFilePath)
    let dirPath =  path.dirname(fullFilePath)

    mainWindow.send('traverse-log', 'Extraction start: ' + file)

    const folderName = file.toUpperCase().replace(".ZIP", "");

    try {
        console.log('-------')
        console.log(dirPath, folderName, path.join(dirPath, folderName))

        await extract(fullFilePath, {dir: path.join(dirPath, folderName)})
        mainWindow.send('traverse-log', 'Extract  into: ' + path.join(dirPath, folderName))
    } catch (e) {
        console.error(e)
    }


    // unzip nested zip files if exists
    await extractAllZipInDir(path.join(dirPath, folderName), mainWindow);
}

async function* travers(dirPath) {
    const files = fs.readdirSync(dirPath);

    for(let i = 0 ; i < files.length ; i++) {
        let file = files[i]

        let subDir = path.join(dirPath, file)
        if (fs.statSync(subDir).isDirectory()) {
            yield* travers(subDir)
        } else {
            const fullFilePath = path.join(dirPath, file);

            if (file.toLowerCase().endsWith(".zip")) {
                yield path.join(dirPath, file)
            }
        }
    }
}

async function extractAllZipInDir(dirPath, mainWindow) {
    console.info('dirPath', dirPath)

    for await (const zipFile of travers(dirPath)) {
        await extractAFile(mainWindow, zipFile);
    }
}


function handleOpenDir(mainWindow, event, title) {

    dialog.showOpenDialog({properties: ['openDirectory']}).then(async (rslt) => {
        // console.log('rslt', rslt)

        if (!rslt.canceled) {
            await extractAllZipInDir(rslt.filePaths[0], mainWindow)

            mainWindow.send('traverse-log', '작업을 모두 완료했습니다.')
        }
    })
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {


    let mainWindow = createWindow()

    ipcMain.on('openDirPopup', handleOpenDir.bind(null, mainWindow))

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
            mainWindow = createWindow()
        }
    })

    // mainWindow.webContents.openDevTools()

    // console.log(dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] }))
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

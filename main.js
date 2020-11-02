const path = require('path');
const os = require('os');
const {
    app,
    BrowserWindow,
    Menu,
    globalShortcut,
    ipcMain,
    shell,
} = require('electron');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const slash = require('slash');
const log = require('electron-log');
const { electron } = require('process');

process.env.NODE_ENV = 'development';

const isDev = process.env.NODE_ENV !== 'production' ? true : false;
const isWin = process.platform === 'win32' ? true : false;
// console.log(process.platform);
// process.platform for windows is win32 and for mac is darwin
let mainWindow;
let aboutWindow;

let createMainWindow = () => {
    mainWindow = new BrowserWindow({
        width: isDev ? 800 : 500,
        height: 700,
        title: 'Image Shrink',
        icon: `${__dirname}/assets/icons/Icon_256x256.png`,
        resizable: isDev,
        webPreferences: {
            nodeIntegration: true,
        },
        // icon: './assets/icons/Icon_256x256.png',
    });
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }
    // mainWindow.setMenuBarVisibility(false);
    mainWindow.loadURL(`file://${__dirname}/app/index.html`);
    // OR
    // mainWindow.loadFile('./app/index.html');
};

let createAboutWindow = () => {
    aboutWindow = new BrowserWindow({
        width: 300,
        height: 300,
        title: 'About Image Shrink',
        icon: `${__dirname}/assets/icons/Icon_256x256.png`,
        resizable: false,
        // icon: './assets/icons/Icon_256x256.png',
    });
    aboutWindow.setMenuBarVisibility(false);
    aboutWindow.loadURL(`file://${__dirname}/app/about.html`);
    // OR
    // mainWindow.loadFile('./app/index.html');
};

const menu = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Quit',
                accelerator: isWin ? 'Ctrl+W' : 'Command+W',
                // OR accelerator: 'CmdOrCtrl+W
                click: () => app.quit(),
            },
        ],
        // role: 'fileMenu',
    },
    ...(isDev
        ? [
              {
                  label: 'Developer',
                  submenu: [
                      { role: 'reload' },
                      { role: 'forcereload' },
                      { type: 'separator' },
                      { role: 'toggleDevtools' },
                  ],
              },
          ]
        : []),
    ...(isWin
        ? [
              {
                  label: 'Image Shrink',
                  submenu: [
                      {
                          label: 'About',
                          accelerator: 'CmdOrCtrl+H',
                          click: createAboutWindow,
                      },
                  ],
              },
          ]
        : []),
];

app.on('ready', () => {
    createMainWindow();
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);
    // globalShortcut.register('CmdOrCtrl+R', () => mainWindow.reload());
    // globalShortcut.register(isWin ? 'Ctrl+Shift+I' : 'Command+Shift+I', () =>
    // mainWindow.toggleDevTools()
    // );
    mainWindow.on('ready', () => (mainWindow = null));
});

ipcMain.on('image:minimize', (event, options) => {
    options.dest = path.join(os.homedir(), 'Image Shrink');
    shrinkImage(options);
    console.log('Options: ', options);
});

let shrinkImage = async ({ imgPath, quality, dest }) => {
    try {
        const pngQuality = quality / 100;
        // console.log('Image Path, Quality, Dest: ', imgPath, quality, dest);
        const files = await imagemin([slash(imgPath)], {
            destination: dest,
            plugins: [
                imageminMozjpeg({ quality }),
                imageminPngquant({ quality: [pngQuality, pngQuality] }),
            ],
        });
        // console.log('Files: ', files);
        log.info('Info: ', files);
        shell.openPath(dest);

        mainWindow.webContents.send('image:done');
    } catch (error) {
        // console.log('Error: ', error);
        log.error('Error', error);
    }
};

/*app.on('window-all-closed', () => {
    // On macOS, it is common for applications and their menu bar to stay active until the user quits explicitly with Cmd + Q
    if (!isWin) {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS, it is common to re-create a window in the app when the dock icon is clicked and there are not windows open
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});*/

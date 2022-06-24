const electronInstaller = require('electron-winstaller');

async function inst() {
    try {
        await electronInstaller.createWindowsInstaller({
            appDirectory: '/Users/calli/WebstormProjects/xxx/electron-quick-start/smart_unzip-win32-x64',
            outputDirectory: '/Users/calli/WebstormProjects/xxx/electron-quick-start/installer',
            authors: 'callin',
            exe: 'smart_unzip.exe'
        });
        console.log('It worked!');
    } catch (e) {
        console.log(`No dice: ${e.message}`);
    }
}

inst()
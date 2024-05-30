/**
 * 本项目使用 electron@22.3.27  + node 18.18.0 版本开发桌面应用测试项目（2024-05-22：electron 最新稳定版本 30.0.6）
 * 【注意】22.3.27 版本是最后一个支持 Windows 7/8/8.1/Server 2012 的版本，也是 electron v22 的最后一个稳定版本，
 * 经测试多次，安装 v22 以上版本，在 Win Server 2012 上启动无效果，不会弹出窗口。
 * 【安装 v22 及之前低版本方法】：
 *    1.1、先在 cmd 或 PowerShell 命令提示符执行如下命令临时设置 electron 的淘宝安装镜像源：
 *        $env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
 *    或执行如下命令永久设置 electron 的淘宝安装镜像源：
 *        npm config set ELECTRON_MIRROR https://npmmirror.com/mirrors/electron/
 *        
 *    1.2、再执行 npm i electron@22.3.27 -D 安装。
 * 否则，直接安装会失败
 * 
 * electron 进程分为一个主进程和若干个渲染进程，main.js 入口脚本即为主进程，一个运行中的 html 页面对应一个渲染进程；
 */

const path = require('node:path');

const fs = require('node:fs');

// 从 electron 中解析出 app 对象和浏览器窗口对象 BrowserWindow，
// ipcMain 对象：从主进程到渲染进程的异步通信，用于接收从渲染进程(html dom事件等)传过来的数据。
// 5-导入 webContents，演示 getAllWebContents() 方法的使用
// 9、dialog 对话框对象
// 10、globalShortcut 监听键盘按键事件
// 11、导入菜单操作对象 Menu
const { app, BrowserWindow, ipcMain, webContents, dialog, globalShortcut, Menu } = require('electron');

// 3-导入监听子窗口移动事件自定义函数，不让子窗口拖出父窗口外
const { childWinOnMove } = require('./appjs/child-win-on-move.js');

// 4-导入监听父窗口移动事件自定义函数，让子窗口始终在父窗口内的相对位置不变
const { mainWinOnMove } = require('./appjs/main-win-on-move.js');

// 2-保存上一次关闭应用前的窗口位置和大小状态，可安装使用第三方插件包 electron-win-state 实现
const WinState = require('electron-win-state').default;
const winState = new WinState({
    defaultWidth: 1000,
    defaultHeight: 600,
});
// console.log('winState.winOptions:', winState.winOptions); // { width: 1000, height: 600, x: 2, y: 31 }

// 初始化主窗口变量，以便在以下调用创建窗口函数 createWindow 之后引用
let mainWin = null;
// 初始化子窗口变量，以便在以下调用创建窗口函数 createWindow 之后引用
let childWin = null;

// 定义创建浏览器窗口对象函数
const createWindow = () => {
    mainWin = new BrowserWindow({
        // 2-不设置 width 和 height 参数，直接解构以上 ...winState.winOptions，使用 electron-win-state 第三方插件包
        // 管理和记录上一次关闭应用前的窗口大小和位置状态
        ...winState.winOptions,

        // 窗口宽度
        // width: 1000,
        // 窗口高度
        // height: 600,
        // 窗口位置 x 坐标，默认 50%，居中
        // x: '50%',
        // 窗口位置 y 坐标，默认 50% 居中
        // y: '50%',

        // 设置 web 首选项特性
        webPreferences: {
            // 渲染进程执行 node 方式一(强烈推荐：安全)
            // 在渲染进程渲染 html 页面前先执行可以执行 node 操作的预加载脚本（必须是绝对路径）
            preload: path.resolve(__dirname, './appjs/preload.js'),

            // 渲染进程执行 node 方式二(不推荐：不安全)：这样，在 html 页面中也可以执行 node 环境变量，容易被注入，极不安全
            // nodeIntegration: true,
            // contextIsolation: false,
        },
        // 窗口是否显示，默认 true
        // 设为 true 如果是 mainWin.loadURL('https://github.com/') 加载较慢的网页，会显示空白窗口无内容，
        // 可以设置为 false，然后设置 mainWin.once('ready-to-show', ()=>{mainWin.show()} )，等获取完成网页内容，再显示窗口，
        // 这样可解决窗口内容短暂空白的问题，不过如果窗口时装载本地页面，如 mainWin.loadFile('index.html'); ，建议设置为 true
        show: true,
        // 隐藏菜单栏，默认 false
        autoHideMenuBar: false,
        // app 图标
        icon: './assets/images/app-icon.png',
        // 窗体标题，index.html 没有配置<title>标签时，才有用
        title: '第一个 electron 应用',
        // 标题栏样式，默认 'default'，设置为 'hidden'，不显示标题栏和最小化/最大化/关闭按钮，并且无边框，窗口无法拖动
        titleBarStyle: 'default',
        // 窗口背景颜色，会被 css body 的背景色覆盖，全局背景色可通过 css body 设置
        backgroundColor: '#eee',
        // 窗口是否显示在屏幕中央位置，默认 false
        center: true,
        // 窗口是否可改变大小，默认 true
        resizable: false,
        // 窗口是否可移动，默认 true
        movable: true,
        // 窗口是否可关闭，默认 true
        closable: true,
        // 窗口可否可最小化，默认 true
        minimizable: true,
        // 窗口是否可最大化，默认 true，当  resizable 设置为 false 时，无法最大化，该项无效
        maximizable: true,
        // 窗口是否最前面（置顶），默认 false
        alwaysOnTop: false,
        // 是否显示，默认 flase
        fullscreen: false,
        // 设置为 false 创建一个类似  titleBarStyle:'hidden' 无标题栏和无最小化/最大化/关闭按钮并且无边框的窗口，默认值 true，
        // 设置为 false 后，窗口无法拖动，但可设置 index.css body 的 -webkit-app-region:drag; 按住窗口即可进行拖动
        // frame: false,
    });

    // 1-浏览器窗口对象可以加载 http 页面，也可以加载本地页面
    // 1-1 加载 http 页面
    // mainWin.loadURL('https://github.com/');
    // 将以上 new BrowserWindow 创建窗口对象时的 show: false，再执行如下窗口 'ready-to-show' 事件等获取完成网页内容，
    // 再显示窗口，这样可解决窗口内容短暂空白的问题，
    // mainWin.once('ready-to-show', () => {
    //     mainWin.show();
    // })

    // 1-2 加载本地页面
    mainWin.loadFile('index.html');

    // 获取 webContents（wc） 对象
    const wc = mainWin.webContents;
    // 打开窗体的开发调试工具栏（类似浏览器F12的测试工具栏）
    wc.openDevTools({
        // 调试工具栏位置，默认：right
        mode: 'bottom',
        activate: true
    });

    // 关闭开发调试工具栏的 Content-Security-Policy（CSP）安全提示
    // 方法一（不推荐，这样将完全禁止了其它CSP相关的安全提示）：
    // process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;
    // 方法二（推荐）：在 html 页面<head></head>标签内加入如下标签：
    // <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'">

    wc.send('recevie-event', `主进程主动发送数据给渲染进程的数据: ${new Date()}`);

    // 创建包含在 mainWin 窗口中的子窗口 ChildWin
    childWin = new BrowserWindow({
        width: 600,
        height: 400,
        // 不设置 parent 父窗口参数，会启动多个两个窗口，设置 parent 父窗口后，
        // 此窗口才会包含在父窗口 mainWin 中
        parent: mainWin,
        minimizable: false,
        maximizable: false,
        autoHideMenuBar: true,
    });
    childWin.loadURL('https://www.baidu.com/');

    // 3-调用监听子窗口移动事件自定义函数，不让子窗口拖出父窗口外
    childWinOnMove(childWin);

    // 4-调用监听父窗口移动事件自定义函数，让子窗口始终在父窗口内的相对位置不变
    mainWinOnMove(mainWin);


    // 监听窗口获得焦点事件
    childWin.on('focus', (e) => {
        console.log('childWin 窗口获得了焦点');
    })

    // 监听窗口失去焦点事件
    childWin.on('blur', (e) => {
        console.log('childWin 窗口失去了焦点');
    })


    // 2-执行如下，将 minWin 窗口状态交给 winState 管理即可（放到这里最后才能生效保存窗口状态）：
    winState.manage(mainWin);

    // 5-webContents.getAllWebContents() 方法的使用：
    // 返回 WebContents[] - 所有 WebContents 实例的数组。
    // 包含所有 Windows、webviews、opened devtools 和 devtools 扩展背景页面的 web 内容。
    // console.log('webContents.getAllWebContents():', webContents.getAllWebContents());

    /****** BrowserWindow.webContents 实例事件或方法 - start ******/
    // 6.1、did-finish-load 事件：页面所有内容加载完成后触发（包括图片、视频、js、css等资源），晚于 dom-ready 事件触发
    mainWin.webContents.on('did-finish-load', (e) => {
        console.log('主窗口did-finish-load事件触发：页面所有内容加载完成（包括图片、视频、js、css等资源）');
    });
    // 6.2、dom-ready 事件：页面所有 dom 节点加载完成后触发，早于 did-finish-load 事件触发
    mainWin.webContents.on('dom-ready', (e) => {
        console.log('主窗口dom-ready事件触发：页面所有 dom 节点加载完成');
    });
    // 6.3、new-window 使用 <a> 链接标签等打开新窗口事件：测试该事件无效
    mainWin.webContents.on('new-window', (e) => {
        console.log('打开了新窗口');
    });

    // 7、获取窗口鼠标右键上下文信息（注释，放到 11.2 实现）
    /* mainWin.webContents.on('context-menu', async (e, params) => {  // params 获取鼠标右键上下文参数
        // console.log('鼠标右键上下文信息:', params);
        console.log(`Context menu opened on: ${params.mediaType} at x:${params.x}, y:${params.y}`);
        console.log(`鼠标右键主要信息: 
        srcURL:${params.srcURL}, 
        linkURL:${params.linkURL}, 
        linkText:${params.linkText}, 
        pageURL:${params.pageURL},
        inError:${params.mediaFlags.inError},
        canSave:${params.mediaFlags.canSave},
        canCopy:${params.editFlags.canCopy},
        selectionText:${params.selectionText}
        `);

        // 9.2、如果是右击图片，显示保存对话框 dialog.showSaveDialogSync
        if (params.mediaType === 'image') {
            const saveFileName = dialog.showSaveDialogSync({
                // 对话框标题
                title: '保存图片',
                // 保存按钮提示文本
                buttonLabel: '保存',
                // 打开对话所在的默认目录位置
                defaultPath: app.getPath('desktop'),
                // 文件类型过滤配置项
                filters: [
                    // 保存填定的文件时，如果不写扩展名，默认以下第一个扩展名保存
                    { name: 'JPEG Files', extensions: ['jpg', 'jpeg'] },
                    { name: 'Image Files', extensions: ['gif', 'bmp', 'png'] }
                ]
            });
            console.log('9.2、showSaveDialogSync saveFileName:', saveFileName);
            // 同步方法 showSaveDialogSync，如果点击[取消]按钮 ，saveRes 返回 undefined
            if (saveFileName) {
                // 用 axios 下载保存图片
                const axios = require('axios');
                // 以流的形式下载图片，流形式请求，必须指定 { responseType: 'arraybuffer' } 参数，告诉服务器以流的形式返回
                const { data: buffer } = await axios.get(params.srcURL, { responseType: 'arraybuffer' });
                // 创建写文件流对象
                const ws = fs.createWriteStream(saveFileName);
                ws.write(buffer);
                ws.close();
                // mainWin.webContents.executeJavaScript(`alert("文件 ${path.basename(saveFileName)} 保存成功")`);

                // 9.3、保存成功，显示消息提示对话框 dialog.showMessageBox
                const tipsRes = dialog.showMessageBoxSync({
                    // 提示框标题
                    title: '提示',
                    // 提示框类型，为以下值之一："none"`, `"info"`, `"error"`, `"question"` or `"warning"
                    type: 'info',
                    message: `保存 ${path.basename(saveFileName)} 文件成功！`,
                    // detail: '保存成功',  // message 提示消息下的摘要小文字
                    // icon: 'assets/images/app-icon.png',  // 自定义提示图标
                    buttons: ['知道了', '取消']
                });
                // dialog.showMessageBoxSync 返回的结果变量 tipsRes 的值是点击消息对话框按钮的索引号
                console.log('9.3、dialog.showMessageBoxSync tipsRes:', tipsRes);  // 0 or 1
            }
        }
    }); */

    // 8、executeJavaScript() 方法执行 js 脚本
    // 这个是在渲染进程浏览器窗口内执行，所以有 alert 方法
    // mainWin.webContents.executeJavaScript("alert(`您好：${new Date()}`)");

    /****** BrowserWindow.webContents 实例事件或方法 - end ******/
};


// app 就绪异步函数，就绪后，才能创建窗口等操作，或在就绪监听事件里 app.on('ready',()=>{}) 里写也行
app.whenReady().then(res => {
    // 调用创建主窗口和子窗口函数
    createWindow();

    // 获取系统的一些关键目录
    // App 项目根目录：E:\wwwroot\study_projects\electron_projects\first-electron-project
    console.log('App root path:', app.getAppPath());
    console.log('desktop:', app.getPath('desktop'));  // C:\Users\Administrator\Desktop
    console.log('music:', app.getPath('music'));  // C:\Users\Administrator\Music
    console.log('temp:', app.getPath('temp'));  // C:\Users\ADMINI~1\AppData\Local\Temp\2
    console.log('userData:', app.getPath('userData'));  // C:\Users\Administrator\AppData\Roaming\first-electron-project

    // 10、快捷键是全局的，即使应用程序没有键盘焦点，它也仍然在持续监听键盘事件，需在 app.whenReady() 后监听和注册键盘事件。
    // 监听 G 键
    /* globalShortcut.register('G', (e) => {
        console.log('user pressed [G] key');
    }); */
    // 监听 Ctrl + Q 键
    globalShortcut.register('CommandOrControl+Shift+Q', (e) => {
        console.log('user pressed [Ctrl + Shift + Q] key');
        // 注销快捷键，注销后，再按快捷键无效，只能在应用关闭重新运行才会重新注册快捷键
        globalShortcut.unregister('CommandOrControl+Shift+Q');
        console.log('已注销快捷键 Ctrl + Shift + Q');
    });


    // 11、自定义菜单（应用菜单栏或右键快捷菜单）
    // 11.1、自定义窗口应用菜单
    // 根据自定义菜单配置文件创建菜单
    const { mainMenuObj } = require('./appjs/app-menu-config.js');
    const mainMenu = Menu.buildFromTemplate(mainMenuObj);
    // 方法一（全局所有窗口设置）：设置生效菜单（必须注释掉创建 mainWin 窗口时参数 autoHideMenuBar，或改为 false，否则不会显示菜单）
    // Menu.setApplicationMenu(mainMenu);
    // 方法二（为指定窗口设置）：设置生效菜单（必须注释掉创建 mainWin 窗口时参数 autoHideMenuBar，或改为 false，否则不会显示菜单）
    mainWin.setMenu(mainMenu);

    // 11.2、自定义窗口右键快捷菜单
    // 根据自定义菜单配置文件创建菜单
    const { contextMenuObj } = require('./appjs/app-menu-config.js');
    // 添加右键菜单
    mainWin.webContents.on('context-menu', (e, params) => {
        // 构造传送给菜单配置项的自定义控制参数
        const menuCtrlOpts = {
            canUseSaveImg: params.srcURL ? true : false,
            canUseCopy: params.selectionText ? true : false,
        };
        // 构建菜单
        const contextMenu = Menu.buildFromTemplate(contextMenuObj(menuCtrlOpts, params));
        // 弹出菜单
        contextMenu.popup();
    });


    // 12、设置托盘图标、提示内容、点击事件、快捷菜单
    const { Tray } = require('electron');
    // 12.1、设置托盘图标：Tray 构造函数参数传托盘图片路径或 nativeImage 对象，但不能为空，否则报错
    const tray = new Tray('./assets/images/app-icon.png');
    // 12.2、设置鼠标移上托盘图标显示的提示内容
    tray.setToolTip('Electron App');
    // 12.3、设置点击托盘图标事件处理函数
    tray.on('click', (e) => {
        // 如果当前应用显示，则隐藏，否则显示
        // mainWin.isVisible() ? mainWin.hide() : mainWin.show();  // 这个是隐藏窗口，其它窗口还是显示
        // app.isHidden() ? app.show() : app.hide();  // 官网显示，这三个 app 方法只适用 MacOS系统

        // Windows 系统，应循环隐藏所有窗口
        const AllWins = BrowserWindow.getAllWindows();
        AllWins.forEach((win, i) => {
            if (win.getParentWindow() === null) {  // 经测试不能用 i===0 判断为主窗口, 0 可能是子窗口
                win.isVisible() ? win.hide() : win.show();
            } else {
                win.hide();
            }
        });
    });
    // 12.4、设置右击托盘菜单 
    // 根据自定义菜单配置文件创建菜单
    const { trayMenuObj } = require('./appjs/app-menu-config.js');
    // 传递 mainWin 参数给"最小化"菜单项使用
    const trayMenu = Menu.buildFromTemplate(trayMenuObj(mainWin));
    // 设置托盘菜单
    tray.setContextMenu(trayMenu);


    // 14、desktopCapturer 桌面图片/视频流抓取对象的使用（须在主进程中使用 desktopCapturer），
    // 抓取当前正在前台运行的程序界面
    const { desktopCapturer } = require('electron');
    // 在主进程这里定义一个 ipc 事件 capture-event，供渲染进程页面的按钮调用
    ipcMain.handle('capture-event', (e) => {
        return desktopCapturer.getSources({
            types: ['window', 'screen'],  // 抓取窗口及屏幕的图片
            // 设置要抓取的图片的大小，默认 width: 150 太小，省略 height 会报错，为 0 图片不显示，
            // 设置 height 和 width 一样大小， height 会自动调整
            thumbnailSize: { width: 800, height: 800 },
        }).then(sources => {
            // sources 返回抓取到的当前正在前台运行的程序界面的一个数组
            return sources;
        });
    });
});


/********** app 生命周期事件函数 **********/
// app 窗口关闭事件，优先级高于 before-quit 和 quit，
// 执行了此事件，将不再执行 before-quit 和 quit 事件
/* app.on('window-all-closed', (e) => {
    // 对于 MacOS 系统，关闭窗口时，不会退出应用，要判断处理
    if (process.platform === 'darwin') {
        app.quit();
    }
    console.log('window-all-closed');
}); */

// 退出应用前事件
app.on('before-quit', (e) => {
    console.log('before-quit');
    // e.preventDefault();
});

// 退出应用事件
app.on('quit', (e) => {
    console.log('app quit');
});

// app激活事件
app.on('activate', (e) => {
    // 在 MacOS 下，当全部窗口关闭，点击 dock 图标，窗口要再次打开，不添加下面，MacOS 不能正常再次打开
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// 任一窗口失去焦点事件
app.on('browser-window-blur', (e) => {
    // console.log('browser-window-blur');
})

// 任一窗口获得焦点事件
app.on('browser-window-focus', (e) => {
    // console.log('browser-window-focus');
})


/********** 主进程监听事件 **********/
// 定义一个 send-event 的 channel 监听，用于接收从渲染进程(html dom事件等)传过来的数据，
// 可用 icpMain 的 on 方法、once 方法、和 handle 方法，建议用 handle 方法，可接收同步或异步数据
ipcMain.handle('send-event', (e, data) => {  // 这里的 e 指向 ipcRenderer 事件对象 EventEmitter
    console.log('ipcMain.handle event,data:', data);
    // 可返回数据给 icpRenderer
    return 'ok';
});

// 9、使用 dialog 对象显示打开对话框(showOpenDialog)、保存对话框(showSaveDialog)、弹出消息框(showMessageBox)
// 【注】dialog 对象，只能在 app.whenReady() 里使用或 app 实例挂载后，由事件之后调用
// 9.1、打开对话框(showOpenDialog)
ipcMain.handle('open-dialog', (e, data) => {
    // 异步的 showOpenDialog 方法
    /* const openRes = dialog.showOpenDialog({
        buttonLabel: '请选择',
        defaultPath: app.getPath('desktop'),
        properties: ['multiSelections', 'createDirectory', 'openFile', 'openDirectory']
    }).then(res => {
        // 异步方法 showOpenDialog，按取消选择，返回 res: { canceled: true, filePaths: [] }
        console.log("ipcMain.handle('open-dialog') res:", res);

        // 这是 promise 异步的 dialog.showOpenDialog() 方法，不能直接 return 结果给 ipcRenderer，
        // 可改用同步的 dialog.showOpenDialogSync() 方法
        // return res;
    }); */


    // 改为用同步的 showOpenDialogSync 方法
    const openRes = dialog.showOpenDialogSync({
        // 对话框标题
        title: '请选择要打开的文件',
        // 选择文件提示按钮显示文本
        buttonLabel: '请选择',
        // 打开对话框显示所在的默认目录位置
        defaultPath: app.getPath('desktop'),
        // 选择文件过滤项配置
        filters: [
            // name 属性是底部右侧的文件类型下拉选择框的文件类型提示文本
            // extensions 属性是底部右侧的文件类型下拉选择框可选择的文件类型
            { name: '文本文件', extensions: ['txt'] },
            { name: 'Image Files', extensions: ['jpg', 'png', 'gif'] }
        ],
        /****** 配置功能属性项 ******/
        // multiSelections 可选择多个文件，默认只能选择一个文件；
        // createDirectory 显示[新建文件夹]，允许在对话框内新建文件夹；
        // openFile 允许选择文件，默认项；
        // openDirectory 允许选择目录，非默认项，指定该项，以上 filters 文件过滤配置项会失效，即使也指定 'openFile' 也无效，
        // 经测试openFile 和 openDirectory 互斥，如果同时指定，只能选择目录
        properties: ['multiSelections', 'createDirectory', 'openFile'/* , 'openDirectory' */]
    });
    // 同步方法 showOpenDialogSync，按取消按钮后，openRes 会返回 undefined，和异步方法不同，
    // 选择成功，会返回选择文件的数组，如 openRes: [ 'C:\\Users\\Administrator\\Desktop\\test' ]
    console.log("ipcMain.handle('open-dialog') openRes:", openRes);
    return openRes;
});
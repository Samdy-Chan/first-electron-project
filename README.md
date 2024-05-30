### 1、electron 主进程 (main.js) 在 vscode 控制台窗口输出的中文乱码解决方法：
已经在 package.json 中的 start 命令中加入 chcp 65001 解决，同时使用 nodemon 命令结合 --watch、--ext 选项监控相关文件的更改，实时自动重新运行 electron，命令如下：
"start": "chcp 65001 && nodemon --exec \"electron .\" --watch . --ext js,ts,json,html,css,scss"


### 2、保存上一次关闭应用前的窗口位置和大小状态，可安装使用第三方插件包 electron-win-state 实现
* npm install electron-win-state
##### 使用方法
const WinState = require('electron-win-state');
const winState = new WinState({
    defaultWidth: 1000,
    defaultHeight: 600,
});
* 然后，在使用 new BrowserWindow 创建窗口对象的时候，不设置 width 和 height 参数，直接解构以上 ...winState.winOptions 即可，如下：
const mainWin = new BrowserWindow({
    ...winState.winOptions,
    ...其它BrowserWindow配置参数...
});
* 最后，将执行如下，将 minWin 窗口状态交给 winState 管理即可：
winState.manage(mainWin);


### 3、自定义了 childWinOnMove 和 mainWinOnMove 子窗口和父窗口移动事件函数


### 5、webContents.getAllWebContents() 方法的使用
返回 WebContents[] - 所有 WebContents 实例的数组。包含所有 Windows、webviews、opened devtools 和 devtools 扩展背景页面的 web 内容。


### 6、BrowserWindow.webContents 实例事件
#### 6.1、did-finish-load 事件：页面所有内容加载完成后触发（包括图片、视频、js、css等资源），晚于 dom-ready 事件触发；
mainWin.webContents.on('did-finish-load',(e)=>{});
#### 6.2、dom-ready 事件：页面所有 dom 节点加载完成后触发，早于 did-finish-load 事件触发；
mainWin.webContents.on('dom-ready',(e)=>{});


### 7、获取窗口鼠标右键上下文信息
mainWin.webContents.on('context-menu',(e, params)=>{});  // params 获取鼠标右键上下文参数
mainWin.webContents.on('context-menu', (e, params) => {  // params 获取鼠标右键上下文参数
        // console.log('鼠标右键上下文信息:', params);
        console.log(`Context menu opened on: ${params.mediaType} at x:${params.x}, y:${params.y}`);
        console.log(`鼠标右键主要信息: 
        srcURL:${params.srcURL}, 
        linkURL:${params.linkURL}, 
        linkText:${params.linkText}, 
        pageURL:${params.pageURL},
        inError:${params.mediaFlags.inError},
        canSave:${params.mediaFlags.canSave},
        selectionText:${params.selectionText}
        `);
    });

### 8、executeJavaScript() 方法执行 js 脚本（在渲染进程浏览器窗口执行，所以有 alert 方法）
mainWin.webContents.executeJavaScript("alert(`您好：${new Date()}`)");


### 9、使用 dialog 对象显示打开对话框(9.1、showOpenDialog)、保存对话框(9.2、showSaveDialog)、弹出消息框(9.3、showMessageBox)


### 10、注册和捕获快捷键
快捷键是全局的，即使应用程序没有键盘焦点，它也仍然在持续监听键盘事件，需在 app.whenReady() 后监听和注册键盘事件。
const {globalShortcut} = require('electron');
// 监听 G 键
globalShortcut.register('G', (e) => {
    console.log('user pressed [G] key');
});
// 监听 Ctrl + Q 键
globalShortcut.register('CommandOrControl+Q', (e) => {
    console.log('user pressed [Ctrl + Q] key');
});

### 11、自定义菜单（应用菜单栏或右键快捷菜单），在 app.whenReady() 或 app.on('ready',()=>{}) 中定义菜单
#### 11.1、自定义应用菜单栏
// 定义菜单配置文件
<app-menu-config.js>
exports.mainMenuObj = [
    {
        label: '文件',
        accelerator:'Alt+F',
        submenu: [
            {
                label: ' 退出',
                accelerator: 'CommandOrCtrl+Q',
                click: () => { app.quit() }
            }
        ]
    },
    {
        label: '编辑',
        accelerator: 'Alt+E',
        submenu: [
            {
                label: '撤销',
                role: 'undo'
            },
            {
                label: '复制',
                role: 'copy',
                accelerator: 'CommandOrCtrl+C'
            }
        ]
    }
]
// 导入菜单操作对象 Menu
const {Menu} = require('electron');
// 根据自定义菜单配置文件创建菜单
const { mainMenuObj } = require('./appjs/app-menu-config.js');
const mainMenu = Menu.buildFromTemplate(mainMenuObj);
// 设置应用菜单
// 方法一（全局所有窗口设置）：设置生效菜单（必须注释掉创建窗口时参数 autoHideMenuBar，或改为 false，否则不会显示菜单）
// Menu.setApplicationMenu(mainMenu);
// 方法二（为指定窗口设置）：设置生效菜单（必须注释掉创建窗口时参数 autoHideMenuBar，或改为 false，否则不会示菜单）
mainWin.setMenu(mainMenu);

#### 11.2、自定义右键快捷菜单
// 根据自定义菜单配置文件创建菜单
const { contextMenuObj } = require('./appjs/app-menu-config.js');
const contextMenu = Menu.buildFromTemplate(contextMenuObj);
// 监听点击鼠标右键事件
mainWin.webContents.on('context-menu',(e, params)=>{
    // 弹出右键菜单
    contextMenu.popup();
})



### 12、设置托盘：图标、提示内容、快捷菜单
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


### 13、clipboard 剪贴板对象的使用
// 导入 clipboard 剪贴板对象
const { clipboard } = require('electron');
// 复制纯文本内容进剪贴板
clipboard.writeText('复制的内容');
// 读取剪贴板的纯文本内容
const content = clipboard.readText();


### 14、desktopCapturer 桌面图片/视频流抓取对象的使用（须在主进程中使用 desktopCapturer）
抓取当前正在前台运行的程序界面
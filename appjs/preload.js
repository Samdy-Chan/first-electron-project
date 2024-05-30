/**
 * 此文件定义渲染进程渲染 html 页面前先执行可以执行 node 操作的预加载脚本，
 * 然后 使用 contextBridge.exposeInMainWorld() 方法将预执行的结果暴露给
 * 渲染进程的  html 页面的 js 脚本中
 */


// 导入上下文连接桥对象 contextBridge（用于主进程与渲染进行之间进行安全的数据交互等操作），
// ipcRenderer 对象：从渲染器进程到主进程的异步通信，用于将数据传给主进程 ipcMain 的 channel 监听
const { contextBridge, ipcRenderer } = require('electron');

// 定义代理 dom 事件传送数据给主进程的函数
const sendHandler = async (data) => {
    // 这里 channel 名 send-event 要与 main.js 使用 ipcMain.handle() 定义的 channel 名一致，
    // ipcRenderer 是一个 EventEmitter 的实例，ipcMain 返回的结果是 promise，要用 async + await 接收
    const res = await ipcRenderer.invoke('send-event', data);
    // 在 app 窗口浏览器调试工具控制台输出 ipcMain 返回的结果
    console.log('ipcRenderer sendHandler 从 ipcMain 接收的返回结果是：', res);
}


// 定义接收主进程在 app.whenReady() 里 BrowserWindow.webContents.send('recevie-event', data) 过来的数据
ipcRenderer.on('recevie-event', (e, data) => {
    console.log('ipcRenderer recevie-event data:', data);
})

// 9.1、定义点击[打开选择文件对话框]按钮的事件处理函数
const showOpenDialog = async (e) => {
    const res = await ipcRenderer.invoke('open-dialog', e);
    console.log("ipcRenderer.invoke('open-dialog') res:", res);
}


// 14、定义点击[抓取屏幕]按钮事件处理函数，调用主进程抓取屏幕事件 capture-event
const capture = async () => {
    const sources = await ipcRenderer.invoke('capture-event');
    // console.log('desktopCapturer sources:', sources);
    // sources 返回抓取到的当前正在前台运行的程序界面的一个数组，
    // 我们这里判断只返回一张"整个屏幕"的图片即可
    let screenImg = null;
    for (let source of sources) {
        if (source.name === 'Entire Screen' || source.name === '整个屏幕') {
            // console.log('source:', source.thumbnail.getSize());
            // 获取抓取到的屏幕图片，source.thumbnail 是一个 nativeImage crop 是裁剪图片方法，
            // toDataURL 方法将图片转换为 base64 编码
            // screenImg = source.thumbnail.crop({ x: 0, y: 30, width: 800, height: 450 }).toDataURL();
            screenImg = source.thumbnail.resize({ width: 800, quality: 'best' }).toDataURL();
        }
    }
    // 返回抓取到的裁剪后的屏幕图片
    return screenImg;
}

/****** 使用 node 的方法获取系统信息传递给渲染进程 *******/
// 1-获取当前运行的操作系统平台
const platformInfo = process.platform;

// 2-使用 contextBridge.exposeInMainWorld() 方法暴露数据给渲染程，
// 前端 html 引用的 js 中通过 window.apiData.platform 访问该数据
contextBridge.exposeInMainWorld('apiData', {
    appTitle: '我的第一个 electron 项目 App',
    platform: platformInfo,
    // 暴露以上传送数据给主进程的方法给渲染进程的 html js 中
    sendHandler,
    // 9.1、暴露以上传给主进程的点击[打开选择文件对话框]按钮的事件处理函数给渲染进程的 html js 中
    showOpenDialog,
    // 14、暴露以上传给主进程的点击[抓取界面]按钮的事件处理函数给渲染进程的  html js 中
    capture,
});





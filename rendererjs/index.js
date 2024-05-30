// 打印 preload.js 通过 contextBridge.exposeInMainWorld 注入的 window.apiData 对象数据
console.log('index.html 打印 preload.js 注入的 apiData 对象数据: ', window.apiData)

// 设置页面 App 标题
document.title = window.apiData.appTitle;

// 点击按钮，通过 ipc 从渲染进程传数据给主进程
let btn = document.getElementById('btn');
btn.addEventListener('click', (e) => {
    // 调用 appjs/preload.js 中定义的函数
    window.apiData.sendHandler(`我是来自html页面的数据：${new Date()}`);
});

// 9.1、点击[打开选择文件对话框]按钮事件处理函数
let btnChoiceFile = document.querySelector('#btnChoiceFile');
btnChoiceFile.addEventListener('click', (e) => {
    // 调用 appjs/preload.js 中定义的函数
    window.apiData.showOpenDialog();
});

// 14、点击[抓取界面]按钮事件处理函数
let btnCapture = document.getElementById('btnCapture');
btnCapture.addEventListener('click', async (e) => {
    // 调用 appjs/preload.js 中定义的函数
    const screenImgBase64 = await window.apiData.capture();
    // console.log('screenImgBase64:', screenImgBase64);
    const showCaptureBox = document.querySelector('.show-capture');
    showCaptureBox.style.display = 'block';
    showCaptureBox.querySelector('img').setAttribute('src', screenImgBase64);
});
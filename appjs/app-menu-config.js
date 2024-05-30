/**
 * 自定义应用顶部菜单栏配置文件
 */

// 菜单项 icon 属性可以指定图片路径字符串 或 NativeImage 对象，但如果图片较大，
// 可以导入 NativeImage 类，创建一个图像对象，修改图像的大小后，再作为菜单项的图标
// 13、导入 clipboard 剪贴板对象
const { app, dialog, nativeImage, clipboard } = require("electron");
/* 
let quitIcon = nativeImage.createFromPath('./assets/images/app-icon.png');
// quitIcon = nativeImage.createFromBuffer(quitIcon.toPNG(), { width: 16, height: 16 });
quitIcon.resize({ width: 16, height: 16 });  // 测试无法改变其大小，以上转换为 buffer 也无法改变其大小
// console.log('nativeImage:', quitIcon.getSize());
 */

// 分别暴露方式定义主窗口菜单配置
exports.mainMenuObj = [
    {
        label: '文件(&F)(F)',  // 顶级菜单的快捷键用这种方式设置，快捷键是 Alt+F
        // accelerator: 'Alt+F',  // 顶级菜单的快捷键，不能通过 accelerator 设置
        submenu: [  // 定义子菜单项
            {
                label: '退出',
                accelerator: 'CommandOrControl+Q',
                click: () => {
                    const resIndex = dialog.showMessageBoxSync({
                        title: '退出提示',
                        message: '确定要退出吗？',
                        // 点击按钮返回按钮的索引号，从0开始
                        buttons: ['确定', '取消'],
                        // defaultId 表示，默认选中哪个索引的按钮，然后直接按回车，即相当于点击该按钮，默认值0
                        defaultId: 0,
                        // 按 ESC 键或点击提示框右上角关闭按钮返回的值。如 defaultId = 0，默认值为 1，否则默认值为 0
                        // cancelId: 99,
                        type: 'info',
                    });
                    // console.log('resIndex:', resIndex);
                    if (resIndex === 0) app.quit();
                },
                // 菜单项图标
                icon: './assets/images/app-icon@16x16.png',
                // 是否可用，默认 true
                enabled: true,
            }
        ]
    },
    {
        label: '编辑(&E)(E)',
        submenu: [
            {
                label: '撤销',
                // role 是调用系统功能
                role: 'undo',
                accelerator: 'CommandOrControl+Z'
            },
            {
                label: '重做',
                role: 'redo',
                accelerator: 'CommandOrControl+Y'
            },
            {
                label: '复制',
                role: 'copy',
                accelerator: 'CommandOrControl+C'
            },
            {
                label: '粘贴',
                role: 'paste',
                accelerator: 'CommandOrControl+V'
            },
        ]
    },
    {
        label: '工具(&T)(T)',
        submenu: [
            {
                label: '打开/关闭调试工具栏',
                role: 'toggleDevTools'
            },
            {
                label: '切换全屏',
                role: 'toggleFullScreen',
                enabled: false
            }
        ]
    },
    {
        label: '帮助(&H)(H)',
        submenu: [
            { label: '使用帮助' },
            { type: 'separator' },  // 分隔线
            { label: '关于(&A)(A)' }
        ]
    }
];


// 分别暴露方式定义鼠标右键，使用函数柯里化，接受参数，使用参数判断相应菜单项是否可用
// menuCtrlOpts: 自定义参数项，控制某些菜单项是否可用
// params: 11.2、 mainWin.webContents.on('context-menu', (e, params)=>{}) 传过来的右键上下文参数对象
exports.contextMenuObj = (menuCtrlOpts = {
    canUseSaveImg: false,
    canUseCopy: false,
}, params) => {
    return [
        {
            label: '复制',
            accelerator: 'CommandOrControl+C',
            // role: 'copy',  // 不使用系统内置的复制功能，click 事件中使用 clipboard 剪贴板对象实现
            // 菜单是否可用，默认值 true
            enabled: menuCtrlOpts.canUseCopy,
            click: () => {
                // 13.1、读取窗口选择的文本内容
                let content = params.selectionText;
                // 13.2、复制纯文本内容进剪贴板，对应的复制内容方法还有 writeHTML()、writeImage()、writeBuffer() 等
                clipboard.writeText(content);
            }
        },
        {
            label: '粘贴',
            accelerator: 'CommandOrControl+V',
            // role: 'paste',  // 不使用系统内置的粘贴功能，click 事件中使用 clipboard 剪贴板对象实现
            click: () => {
                // 13.3、读取剪贴板的内容，对应的读取内容方法还有 readHTML()、readImage()、readBuffer() 等
                let content = clipboard.readText();
                dialog.showMessageBoxSync({
                    title: '剪贴板操作',
                    message: `读取到剪贴板的纯文本内容是：${content}`,
                    buttons: ['确定'],
                    type: 'info'
                });
            }
        },
        {
            label: '全选',
            accelerator: 'CommandOrControl+A',
            role: 'selectAll',
        },
        {
            label: '图片另存为...',
            // 菜单是否可见，默认值 true
            visible: menuCtrlOpts.canUseSaveImg,
            click: async (e) => {
                const fs = require('node:fs');
                const path = require('node:path');
                const { dialog } = require('electron');

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
                            buttons: ['知道了']
                        });
                        // dialog.showMessageBoxSync 返回的结果变量 tipsRes 的值是点击消息对话框按钮的索引号
                        console.log('9.3、dialog.showMessageBoxSync tipsRes:', tipsRes);  // 0 or 1
                    }
                }
            }
        }
    ];
};


// 分别暴露方式定义托盘鼠标右键菜单，使用函数柯里化，接受参数
exports.trayMenuObj = (mainWin) => {
    return [
        {
            label: '最小化(&M)(M)',
            click: () => {
                mainWin.minimize();
            }
        },
        {
            label: '退出(&X)(X)',
            click: () => {
                app.quit();
            }
        }
    ];
};

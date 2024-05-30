/**
 * 监听父窗口移动事件自定义函数，让子窗口始终在父窗口内的相对位置不变
 */


exports.mainWinOnMove = (mainWin) => {
    // 保存父窗口上一次移动的位置
    let parentPrevPos = { x: mainWin.getBounds().x, y: mainWin.getBounds().y };

    mainWin.on('move', (e) => {
        // 获取父窗口拖动后的新的边界位置
        const parentNewPos = { x: mainWin.getBounds().x, y: mainWin.getBounds().y };
        // 获取所有子窗口
        const allChildWins = mainWin.getChildWindows();
        allChildWins.forEach(win => {
            // 获取子窗口当前边界值
            const { x: winX, y: winY } = win.getBounds();
            if (parentNewPos.x < parentPrevPos.x) {  // 如果比上一次左边界小，为向左拖动
                win.setBounds({ x: winX - (parentPrevPos.x - parentNewPos.x) });
            } else {
                win.setBounds({ x: winX + (parentNewPos.x - parentPrevPos.x) });
            }

            if (parentNewPos.y < parentPrevPos.y) {  // 如果比上一次上边界小，为向上拖动
                win.setBounds({ y: winY - (parentPrevPos.y - parentNewPos.y) });
            } else {
                win.setBounds({ y: winY + (parentNewPos.y - parentPrevPos.y) });
            }

            // 【必须设置】将当前父窗口的边界位置值保存为上一次位置值，以便下次拖动后进行比较
            parentPrevPos = { x: parentNewPos.x, y: parentNewPos.y };
        });
    });
}
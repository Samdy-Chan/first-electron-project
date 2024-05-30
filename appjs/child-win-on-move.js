/**
 * 监听子窗口移动事件自定义函数，不让子窗口拖出父窗口外
 */


exports.childWinOnMove = (childWin) => {
    childWin.on('move', (e) => {
        // 获取子窗口的父窗口
        const parentWin = childWin.getParentWindow();
        if (parentWin) {
            // 获取子窗口和父窗口包括标题栏的边界对象，包括 width、height、x 坐标、y 坐标
            const childBounds = childWin.getBounds();
            const parentBounds = parentWin.getBounds();
            // 获取父窗口内容边界对象（包括父窗口除标题栏外的高度，除边框的宽度，x坐标，y坐标）
            const parentContentBounds = parentWin.getContentBounds();
            // console.log('childBounds, parentBounds, parentContentBounds:', childBounds, parentBounds, parentContentBounds);

            // 检查子窗口 x 坐标位置是否已拖超出父窗口边界，
            // 用 parentContentBounds 比较，不用 parentBounds 比较，是因为 parentBounds 不包括内边框
            if (childBounds.x < parentContentBounds.x) {
                // 如果子窗口的左边界小于父窗口左边界，则子窗口的左边界 = 父窗口的左边界
                childWin.setBounds({ x: parentContentBounds.x });
            } else if (childBounds.x + childBounds.width > parentContentBounds.x + parentContentBounds.width) {
                // 如果子窗口的右边界大于父窗口右边界，则子窗口的右边界 = 父窗口的右边界
                let childMaxRightX = parentContentBounds.x + parentContentBounds.width - childBounds.width;
                childWin.setBounds({ x: childMaxRightX });
            }


            // 检查子窗口 y 坐标位置是否已拖超出父窗口边界
            // 用 parentContentBounds 比较，不用 parentBounds 比较，是因为 parentBounds 不包括内边框
            if (childBounds.y < parentContentBounds.y) {
                // 获取父窗口的标题栏高度
                const parentTitleHeight = parentBounds.height - parentContentBounds.height; // 29px
                // 设置子窗口的最顶边框，不能超过父窗口标题栏
                childWin.setBounds({ y: parentBounds.y + parentTitleHeight });
            } else if (childBounds.y + childBounds.height > parentContentBounds.y + parentContentBounds.height) {
                let childMaxBottomY = parentContentBounds.y + parentContentBounds.height - childBounds.height;
                childWin.setBounds({ y: childMaxBottomY });
            }
        }

    });
}
// 开场动画
$('.opening-animation').ready(function () {
    setTimeout(function () {
        // 持续1秒淡出，然后删除元素
        $('.opening-animation').fadeOut(1000, function () {
            $(this).remove(); // 可选：删除元素本身
        });
    }, 3000); // 3秒后执行
});

// 视频背景
$('.mp').ready(function () {
    var video = document.getElementById('myVideo');
    var canvas = document.getElementById('overlayCanvas');
    var ctx = canvas.getContext('2d');
    // 设置画布大小与视频一致
    function resizeCanvas() {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    }
    // 当视频尺寸改变时调整画布大小
    video.addEventListener('loadedmetadata', resizeCanvas);
    video.addEventListener('resize', resizeCanvas);
    // 用户绘制矩形区域
    var isDrawing = false;
    var startX, startY;
    $('#overlayCanvas').on('mousedown', function (e) {
        isDrawing = true;
        startX = e.offsetX;
        startY = e.offsetY;
    });
    $('#overlayCanvas').on('mousemove', function (e) {
        if (!isDrawing) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeRect(startX, startY, e.offsetX - startX, e.offsetY - startY);
    });
    $('#overlayCanvas').on('mouseup', function () {
        isDrawing = false;
    });
});

// 头像
// 文件：js/avatar.js
// js/avatar.js
// avatar.js
$(document).ready(function () {
    const $img = $('.avatar img');          // 头像图片
    const $container = $('.avatar');        // 头像容器（用于插入面板）
    const $button = $('.switch-btn');       // 独立按钮

    // 确保 avatarList 已定义（来自 avatars-data.js）
    if (typeof avatarList === 'undefined') {
        console.error('avatarList 未定义，请检查 avatars-data.js 是否加载！');
        return;
    }

    // 创建头像选择面板
    function createAvatarPanel() {
        const $panel = $('<div class="avatar-panel"></div>');
        avatarList.forEach((src, index) => {
            $panel.append(
                `<img src="${src}" alt="头像 ${index + 1}" data-src="${src}" class="avatar-option">`
            );
        });
        return $panel;
    }

    // 显示面板
    function showAvatarPanel() {
        // 防止重复显示
        if ($('.avatar-panel').length > 0) return;

        const $panel = createAvatarPanel();
        $panel.hide().appendTo($container).fadeIn(200);

        // 点击任一头像进行切换
        $panel.on('click', '.avatar-option', function () {
            const newSrc = $(this).data('src');
            $img.fadeOut(150, function () {
                $img.attr('src', newSrc).fadeIn(150);
                hideAvatarPanel();
            });
        });

        // 点击外部关闭（使用命名空间避免事件冲突）
        $(document).on('click.avatarPanel', function (e) {
            if (!$(e.target).closest('.avatar-panel').length &&
                !$(e.target).is($img) &&
                !$(e.target).is($button) &&
                !$(e.target).closest('.avatar-panel').length) {
                hideAvatarPanel();
            }
        });
    }

    // 关闭面板
    function hideAvatarPanel() {
        $('.avatar-panel').fadeOut(200, function () {
            $(this).remove();
        });
        $(document).off('click.avatarPanel'); // 移除命名空间事件
    }

    //  正确绑定事件：同时监听图片和外部按钮
    $img.add($button).on('click', function (e) {
        e.stopPropagation();
        showAvatarPanel();
    });

    // ESC 键关闭面板
    $(document).on('keydown', function (e) {
        if (e.key === 'Escape') {
            hideAvatarPanel();
        }
    });
});

// 搜索框
import { searchData } from './searchData.js';
$('.search').ready(function () {
    let selectedIndex = -1;
    // 存储当前过滤后的结果列表
    let currentResults = [];
    function performSearch() {
        const keyword = $('#searchInput').val().toLowerCase();
        currentResults = [];

        if (keyword.length === 0) {
            $('#results')
                .empty()
                .hide();
            $('.search').css({
                'border-bottom': '',
                'border-top-left-radius': '',
                'border-top-right-radius': ''
            });

            $('.search').css('border-radius', '10px'); // 恢复原始值
            selectedIndex = -1;
            return;
        }

        $.each(searchData, function (i, item) {
            if (item.title.toLowerCase().includes(keyword)) {
                currentResults.push(item);
            }
        });

        const resultsHtml = currentResults.map((item, index) => {
            return `<li data-index="${index}">${item.title}</li>`;
        });

        $('#results')
            .empty()
            .append(resultsHtml.join(""))
            .show()
            .css({
                'border-bottom-left-radius': '10px',
                'border-bottom-right-radius': '10px',
                'border-top': 'none'
            })
        $('.search').css({
            'border-bottom': 'none',
            'border-top-left-radius': '10px',
            'border-top-right-radius': '10px'
        });
        $('.search').css('border-radius', '0');
        selectedIndex = -1;
        highlightSelected();
    }

    // 输入事件触发搜索
    $('#searchInput').on('input', performSearch);

    // 点击搜索按钮跳转第一个结果
    $('#searchBtn').on('click', function () {
        if (currentResults.length === 1) {
            window.location.href = currentResults[0].url;
        }
    });

    // 键盘事件处理
    $('#searchInput').on('keydown', function (e) {
        const $results = $('#results');
        const $items = $results.find('li');

        if ($items.length === 0) return;

        let scrollToItem = false;
        let shouldScrollToVisibleTop = false; // 是否需要滚动到顶部可视区域
        let shouldScrollToVisibleBottom = false; // 是否需要滚动到底部可视区域

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex++;

            if (selectedIndex >= $items.length) {
                // 超出最后一个 → 回到顶部可视区域
                selectedIndex = 0;
                shouldScrollToVisibleTop = true;
            }

            scrollToItem = true;

        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex--;

            if (selectedIndex < 0) {
                // 回到底部可视区域
                selectedIndex = $items.length - 1;
                const lastItem = $items.last();
                const containerHeight = $results.height();
                const itemHeight = lastItem.outerHeight();

                // 强制滚动到底部可视区域
                $results.scrollTop(lastItem[0].offsetTop - containerHeight + itemHeight);
            } else {
                // 新增：如果当前项不在可视区域顶部，则自动贴顶
                const selectedItem = $items.eq(selectedIndex);
                const itemTop = selectedItem.position().top;
                const scrollTop = $results.scrollTop();
                const itemScrollTop = itemTop + scrollTop;

                if (itemScrollTop < scrollTop) {
                    $results.scrollTop(itemScrollTop); // 自动贴顶
                }
            }

            scrollToItem = true;
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (currentResults.length === 1) {
                window.location.href = currentResults[0].url;
            } else if (selectedIndex >= 0) {
                const selectedUrl = currentResults[selectedIndex].url;
                window.location.href = selectedUrl;
            }
        }

        if (scrollToItem && selectedIndex >= 0) {
            const selectedItem = $items.eq(selectedIndex);
            const containerHeight = $results.height();
            const itemTop = selectedItem.position().top;
            const itemHeight = selectedItem.outerHeight();

            const scrollTop = $results.scrollTop();
            const scrollBottom = scrollTop + containerHeight;

            const itemScrollTop = itemTop + scrollTop;
            const itemScrollBottom = itemScrollTop + itemHeight;

            // 根据按键判断是否要贴顶、贴底，或跳转到顶部/底部可视区域
            if (shouldScrollToVisibleTop) {
                // 滚动到顶部可视区域
                $results.scrollTop(0);
            } else if (shouldScrollToVisibleBottom) {
                // 滚动到底部可视区域
                $results.scrollTop($items[$items.length - 1].offsetTop - containerHeight + itemHeight);
            } else if (itemScrollBottom > scrollBottom) {
                // 贴底
                $results.scrollTop(itemScrollBottom - containerHeight);
            } else if (itemScrollTop < scrollTop) {
                // 贴顶
                $results.scrollTop(itemScrollTop);
            }

            $('#searchInput').val(selectedItem.text());
            highlightSelected();
        }
    });

    // 鼠标悬停和点击事件
    $('#results').on('mouseenter', 'li', function () {
        $(this).addClass('selected').siblings().removeClass('selected');
        selectedIndex = parseInt($(this).data('index'));
        // 设置 input 值为当前 li 的内容
        $('#searchInput').val($(this).text());
    });

    $('#results').on('click', 'li', function () {
        const index = parseInt($(this).data('index'));
        if (index >= 0) {
            window.location.href = currentResults[index].url;
        }
    });
    // 鼠标移出 ul 区域时取消选中高亮
    $('#results').on('mouseleave', function () {
        $('#results li').removeClass('selected');
    });
    function highlightSelected() {
        $('#results li').removeClass('selected');
        if (selectedIndex >= 0) {
            $('#results li').eq(selectedIndex).addClass('selected');
        }
    }
});
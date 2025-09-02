$(document).ready(function () {
    let inactivityTimer = null;

    // 保存 .large-header 原始 display 样式
    const $largeHeader = $('.large-header');
    const originalDisplay = $largeHeader.css('display');

    function createVideoContainer() {
        return $(`
            <div id="videoContainer">
                <video id="video1" class="active" autoplay loop x-webkit-airplay webkit-playsinline muted>
                    <source src="./secondDimension/turnOffTheScreen/mp4/白天雪狐_2.mp4" type="video/mp4">
                </video>
                <video id="video2" class="hidden" autoplay loop x-webkit-airplay webkit-playsinline muted>
                    <source src="./secondDimension/turnOffTheScreen/mp4/夜晚雪狐.mp4" type="video/mp4">
                </video>
            </div>
        `);
    }

    function showVideoContainer() {
        document.body.classList.add('screensaver-mode');

        if ($('#videoContainer').length === 0) {
            const $container = createVideoContainer();
            $('.turnOffTheScreen').append($container);

            // 隐藏 large-header
            $largeHeader.show();

            $('#video1')[0].play();
            $('#video2')[0].play();

            // 创建提示框（如果不存在）
            if ($('#exitHint').length === 0) {
                $('<div>', {
                    id: 'exitHint',
                    text: '按空格键退出息屏',
                    css: {
                        position: 'fixed',
                        top: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(0,0,0,0.7)',
                        color: '#fff',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontSize: '16px',
                        zIndex: '9999',
                        display: 'none'
                    }
                }).appendTo('body');
            }

            $('#exitHint').show().delay(2000).fadeOut();
        }

        // 进入息屏模式时：隐藏 #app，显示 .turnOffTheScreen
        $('#app').hide();
        $('.turnOffTheScreen').show();
    }

    function hideAllScreensaverElements() {
        document.body.classList.remove('screensaver-mode');
        $('#videoContainer').remove();
        $('#exitHint').fadeOut();

        // 恢复 large-header 的显示
        $largeHeader.hide();

        // 退出息屏模式时：显示 #app，隐藏 .turnOffTheScreen
        $('#app').show();
        $('.turnOffTheScreen').hide();
    }

    function startInactivityTimer() {
        clearTimeout(inactivityTimer);
        // inactivityTimer = setTimeout(showVideoContainer, 3000); // 调试用 3 秒
        inactivityTimer = setTimeout(showVideoContainer, 5 * 60 * 1000); // 正式用
    }

    function handleUserInteraction(e) {
        // 空格键退出息屏
        if (e.type === 'keydown' && e.keyCode === 32) {
            hideAllScreensaverElements();
            startInactivityTimer();
            return;
        }

        startInactivityTimer();

        // 鼠标移动不做任何事
        if (e.type === 'mousemove') {
            return;
        }

        // 其它交互显示提示框
        const $hint = $('#exitHint');
        if ($hint.length && $('#videoContainer').length) {
            $hint.show().delay(2000).fadeOut();
        }
    }

    // 初始化：默认隐藏 .turnOffTheScreen，显示 #app
    $('.turnOffTheScreen').hide();
    $('#app').show();

    // 启动定时器
    startInactivityTimer();
    function switchVideoBasedOnTime() {
        const currentHour = new Date().getHours();
        const isNight = currentHour >= 20 || currentHour < 8; // 假设晚上8点到早上8点为夜间模式

        if (isNight) {
            $('#video1').removeClass('active').addClass('hidden');
            $('#video2').removeClass('hidden').addClass('active');
        } else {
            $('#video1').removeClass('hidden').addClass('active');
            $('#video2').removeClass('active').addClass('hidden');
        }
    }

    function scheduleNextSwitchAtEightPM() {
        const now = new Date();
        let nextSwitchTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0, 0); // 设置为今天的晚上8点

        if (now > nextSwitchTime) { // 如果已经过了今天的晚上8点，则设置为明天的晚上8点
            nextSwitchTime.setDate(nextSwitchTime.getDate() + 1);
        }

        const timeUntilNextSwitch = nextSwitchTime.getTime() - now.getTime();

        setTimeout(() => {
            switchVideoBasedOnTime(); // 在晚上8点时切换视频
            scheduleNextSwitchAtEightPM(); // 安排下一次切换（第二天）
        }, timeUntilNextSwitch);
    }

    // 初始化调用
    scheduleNextSwitchAtEightPM();
    $(document).on('mousemove keydown click touchstart', handleUserInteraction);
});
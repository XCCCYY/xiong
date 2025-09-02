  // 使用立即执行函数 (IIFE) 避免全局变量污染
  (function () {
    'use strict';

    // 第一部分：时间显示与鼠标交互动画（RxJS）
    var timeElm = document.getElementById('time');
    var doc = document.documentElement;
    var clientWidth = doc.clientWidth;
    var clientHeight = doc.clientHeight;

    var pad = function pad(val) {
      return val < 10 ? '0' + val : val;
    };

    // 时间更新逻辑
    var time$ = Rx.Observable.interval(1000).map(function () {
      var time = new Date();
      return {
        hours: time.getHours(),
        minutes: time.getMinutes(),
        seconds: time.getSeconds()
      };
    }).subscribe(function (_ref) {
      var hours = _ref.hours;
      var minutes = _ref.minutes;
      var seconds = _ref.seconds;

      timeElm.setAttribute('data-hours', pad(hours));
      timeElm.setAttribute('data-minutes', pad(minutes));
      timeElm.setAttribute('data-seconds', pad(seconds));
    });

    // 鼠标移动监听
    var mouse$ = Rx.Observable.fromEvent(document, 'mousemove').map(function (_ref2) {
      var clientX = _ref2.clientX;
      var clientY = _ref2.clientY;
      return {
        x: -(clientWidth / 2 - clientX) / clientWidth,
        y: (clientHeight / 2 - clientY) / clientHeight
      };
    });

    // RxCSS 动画应用（假设已定义）
    RxCSS({
      mouse: RxCSS.animationFrame.withLatestFrom(mouse$, function (_, m) {
        return m;
      }).scan(RxCSS.lerp(0.1))
    }, timeElm);

  })(); // 第一部分结束

  // 第二部分：Canvas 粒子动画（jQuery 版本）
  (function ($) {
    var width, height, largeHeader, canvas, ctx, points, target, animateHeader = true;

    // 初始化入口
    $(document).ready(function () {
      initHeader();
      initAnimation();
      addListeners();
    });

    function initHeader() {
      width = $(window).width();
      height = $(window).height();
      target = { x: width / 2, y: height / 2 };

      largeHeader = $('#large-header');
      largeHeader.css('height', height + 'px');

      canvas = $('#demo-canvas')[0];
      canvas.width = width;
      canvas.height = height;
      ctx = canvas.getContext('2d');

      // 创建点
      points = [];
      for (var x = 0; x < width; x += width / 20) {
        for (var y = 0; y < height; y += height / 20) {
          var px = x + Math.random() * width / 20;
          var py = y + Math.random() * height / 20;
          var p = { x: px, originX: px, y: py, originY: py };
          points.push(p);
        }
      }

      // 找出每个点最近的五个点
      for (var i = 0; i < points.length; i++) {
        var closest = [];
        var p1 = points[i];
        for (var j = 0; j < points.length; j++) {
          var p2 = points[j];
          if (p1 !== p2) {
            var placed = false;
            for (var k = 0; k < 5; k++) {
              if (!placed) {
                if (!closest[k]) {
                  closest[k] = p2;
                  placed = true;
                } else if (getDistance(p1, p2) < getDistance(p1, closest[k])) {
                  closest[k] = p2;
                  placed = true;
                }
              }
            }
          }
        }
        p1.closest = closest;
      }

      // 为每个点分配一个圆圈
      $.each(points, function (i, p) {
        var c = new Circle(p, 2 + Math.random() * 2, 'rgba(255, 255, 255, 0.54)');
        p.circle = c;
      });
    }

    // 添加事件监听器（jQuery 风格）
    function addListeners() {
      if (!('ontouchstart' in window)) {
        $(document).on('mousemove', mouseMove);
      }
      $(window).on('scroll', scrollCheck);
      $(window).on('resize', resize);
    }

    function mouseMove(e) {
      var posx = e.pageX || e.clientX + $('body').scrollLeft() + $('html').scrollLeft();
      var posy = e.pageY || e.clientY + $('body').scrollTop() + $('html').scrollTop();
      target.x = posx;
      target.y = posy;
    }

    function scrollCheck() {
      if ($('body').scrollTop() > height) {
        animateHeader = false;
      } else {
        animateHeader = true;
      }
    }

    function resize() {
      width = $(window).width();
      height = $(window).height();
      $('#large-header').css('height', height + 'px');
      $('#demo-canvas')[0].width = width;
      $('#demo-canvas')[0].height = height;
    }

    // 动画初始化
    function initAnimation() {
      animate();
      $.each(points, function (i, p) {
        shiftPoint(p);
      });
    }

    function animate() {
      if (animateHeader) {
        ctx.clearRect(0, 0, width, height);
        $.each(points, function (i, p) {
          var dist = getDistance(target, p);
          if (dist < 4000) {
            p.active = 0.3;
            p.circle.active = 0.6;
          } else if (dist < 20000) {
            p.active = 0.1;
            p.circle.active = 0.3;
          } else if (dist < 40000) {
            p.active = 0.02;
            p.circle.active = 0.1;
          } else {
            p.active = 0;
            p.circle.active = 0;
          }

          drawLines(p);
          p.circle.draw();
        });
      }
      requestAnimationFrame(animate);
    }

    function shiftPoint(p) {
      gsap.to(p, {
        duration: 1 + Math.random(),
        x: p.originX - 50 + Math.random() * 100,
        y: p.originY - 50 + Math.random() * 100,
        ease: "power1.inOut",
        onComplete: function () {
          shiftPoint(p);
        }
      });
    }

    // Canvas 绘图函数
    function drawLines(p) {
      if (!p.active) return;
      $.each(p.closest, function (i, closePoint) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(closePoint.x, closePoint.y);
        ctx.strokeStyle = 'rgba(4, 4, 243,' + p.active + ')';
        ctx.stroke();
      });
    }

    function Circle(pos, rad, color) {
      this.pos = pos;
      this.radius = rad;
      this.color = color;
      this.active = 0;

      var _this = this;
      this.draw = function () {
        if (!_this.active) return;
        ctx.beginPath();
        ctx.arc(_this.pos.x, _this.pos.y, _this.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'rgba(156,217,249,' + _this.active + ')';
        ctx.fill();
      };
    }

    // 工具函数：计算两点之间距离（平方）
    function getDistance(p1, p2) {
      return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
    }

  })(jQuery); // 第二部分结束
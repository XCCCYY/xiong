(function ($) {
    var width, height, largeHeader, canvas, ctx, points, target, animateHeader = true;

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
            var c = new Circle(p, 2 + Math.random() * 2, 'rgba(255,255,255,0.3)');
            p.circle = c;
        });
    }

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
        largeHeader.css('height', height + 'px');
        canvas.width = width;
        canvas.height = height;
    }

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
        TweenLite.to(p, 1 + Math.random(), {
            x: p.originX - 50 + Math.random() * 100,
            y: p.originY - 50 + Math.random() * 100,
            ease: Circ.easeInOut,
            onComplete: function () {
                shiftPoint(p);
            }
        });
    }

    function drawLines(p) {
        if (!p.active) return;
        $.each(p.closest, function (i, closePoint) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(closePoint.x, closePoint.y);
            ctx.strokeStyle = 'rgba(156,217,249,' + p.active + ')';
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

    function getDistance(p1, p2) {
        return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
    }

    // 初始化入口
    $(document).ready(function () {
        initHeader();
        initAnimation();
        addListeners();
    });

})(jQuery);
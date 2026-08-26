/*
 * 움직이는 불꽃 favicon (가루슈파 스타일).
 *
 * Chrome/Edge/Opera 는 SVG favicon 을 정적 모드로 렌더링해서 CSS/SMIL 애니메이션을
 * 무시하고, favicon 으로 쓰인 APNG/GIF 도 애니메이션하지 않는다.
 * 유일하게 모든 브라우저에서 통하는 방법은 canvas 로 프레임을 그려
 * <link rel="icon"> 의 href 를 교체하는 것.
 */
(function () {
    "use strict";

    var SIZE = 64;          // canvas 해상도 (레티나 대응)
    var FPS = 12.5;         // 프레임 간격 80ms — 탭 아이콘엔 충분
    var FRAME_MS = 1000 / FPS;

    var canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var scale = SIZE / 64;  // 아래 좌표계는 64x64 기준

    // 그라디언트는 fill 시점의 CTM 으로 변환되므로 한 번만 만들어 재사용한다.
    var glow = ctx.createRadialGradient(32, 36, 0, 32, 36, 28);
    glow.addColorStop(0, "rgba(255, 123, 0, 0.8)");
    glow.addColorStop(1, "rgba(255, 59, 0, 0)");

    var outerGrad = ctx.createLinearGradient(0, 60, 0, 4);
    outerGrad.addColorStop(0, "#ffcc00");
    outerGrad.addColorStop(0.4, "#ff5500");
    outerGrad.addColorStop(1, "#ff2255");

    var innerGrad = ctx.createLinearGradient(0, 54, 0, 16);
    innerGrad.addColorStop(0, "#ffff55");
    innerGrad.addColorStop(1, "#ffaa00");

    function outerFlamePath() {
        ctx.beginPath();
        ctx.moveTo(32, 4);
        ctx.bezierCurveTo(32, 4, 12, 24, 12, 40);
        ctx.bezierCurveTo(12, 53, 21, 60, 32, 60);
        ctx.bezierCurveTo(43, 60, 52, 53, 52, 40);
        ctx.bezierCurveTo(52, 24, 32, 4, 32, 4);
        ctx.closePath();
    }

    function innerFlamePath() {
        ctx.beginPath();
        ctx.moveTo(32, 16);
        ctx.bezierCurveTo(32, 16, 20, 30, 20, 42);
        ctx.bezierCurveTo(20, 50, 25, 54, 32, 54);
        ctx.bezierCurveTo(39, 54, 44, 50, 44, 42);
        ctx.bezierCurveTo(44, 30, 32, 16, 32, 16);
        ctx.closePath();
    }

    // 눈: (cx, cy) 기준, blinkY 로 세로 눌림 표현
    function drawEye(cx, cy, pupilDx, blinkY) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1, blinkY);

        ctx.beginPath();
        ctx.ellipse(0, 0, 3.5, 4.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(pupilDx, 0, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#111111";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(pupilDx - 1.5, -1.5, 0.8, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();

        ctx.restore();
    }

    var TAU = Math.PI * 2;

    function draw(t) {
        // t: 초 단위 경과 시간
        var wobble = Math.sin((t / 1.8) * TAU);
        var sx = 1 + 0.045 * wobble;
        var sy = 1 - 0.045 * wobble;
        var tx = -1.2 * Math.sin((t / 1.1) * TAU);
        var ty = 1.5 * Math.sin((t / 1.4) * TAU);
        var rot = 0.05 * Math.sin((t / 1.6) * TAU);

        var innerLift = -2 * (0.5 - 0.5 * Math.cos((t / 0.9) * TAU));
        var innerScale = 1 + 0.05 * (0.5 - 0.5 * Math.cos((t / 0.9) * TAU));

        // 3초 주기로 120ms 동안 깜빡임
        var blinkPhase = t % 3;
        var blinkY = blinkPhase > 2.88 ? 0.12 : 1;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, SIZE, SIZE);
        ctx.scale(scale, scale);

        // 글로우 (몸통 흔들림과 무관하게 고정)
        ctx.beginPath();
        ctx.arc(32, 36, 28, 0, TAU);
        ctx.fillStyle = glow;
        ctx.fill();

        // 몸통 흔들림: transform-origin (32, 50)
        ctx.save();
        ctx.translate(32 + tx, 50 + ty);
        ctx.rotate(rot);
        ctx.scale(sx, sy);
        ctx.translate(-32, -50);

        outerFlamePath();
        ctx.fillStyle = outerGrad;
        ctx.fill();
        ctx.strokeStyle = "#991100";
        ctx.lineWidth = 1.5;
        ctx.lineJoin = "round";
        ctx.stroke();

        // 안쪽 밝은 불꽃: transform-origin (32, 42)
        ctx.save();
        ctx.translate(32, 42 + innerLift);
        ctx.scale(innerScale, innerScale);
        ctx.translate(-32, -42);
        innerFlamePath();
        ctx.fillStyle = innerGrad;
        ctx.fill();
        ctx.restore();

        drawEye(24, 38, 0.5, blinkY);
        drawEye(40, 38, -0.5, blinkY);

        // 미소
        ctx.beginPath();
        ctx.moveTo(28, 47);
        ctx.quadraticCurveTo(32, 51, 36, 47);
        ctx.strokeStyle = "#111111";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.stroke();

        ctx.restore();
    }

    // 애니메이션용 link 엘리먼트 확보 (정적 SVG 링크는 제거해 우선순위 충돌 방지)
    var head = document.head || document.getElementsByTagName("head")[0];
    var links = head.querySelectorAll('link[rel~="icon"]');
    for (var i = 0; i < links.length; i++) head.removeChild(links[i]);

    var link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    head.appendChild(link);

    function render(t) {
        draw(t);
        link.href = canvas.toDataURL("image/png");
    }

    // 백그라운드 탭에서 로드돼도 아이콘이 비어 있지 않도록 첫 프레임은 무조건 그린다.
    render(0);

    // 백그라운드 탭에서는 Chrome 이 requestAnimationFrame 을 정지시키므로 타이머로 구동한다.
    // (숨은 탭의 타이머는 1s 로 스로틀되지만, 그때는 어차피 그리지 않는다.)
    var start = Date.now();

    setInterval(function () {
        if (document.hidden) return;
        render((Date.now() - start) / 1000);
    }, FRAME_MS);

    document.addEventListener("visibilitychange", function () {
        if (!document.hidden) render((Date.now() - start) / 1000);
    });
})();

// ==========================================
// DRAGON ANIMATION - Background Canvas
// ==========================================
(function() {
    // Buat canvas full background
    var canvas = document.createElement('canvas');
    canvas.id = 'dragonCanvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:-1;';
    document.body.insertBefore(canvas, document.body.firstChild);

    var ctx = canvas.getContext('2d');
    var W, H;

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // ── State naga ──
    var SEGMENTS = 40;       // panjang tubuh
    var body = [];           // tiap segment: {x,y}
    var angle = 0;           // arah kepala
    var speed = 2.2;

    // Orbit elips mengelilingi viewport
    var orbitA, orbitB, orbitCX, orbitCY, orbitT;
    function initOrbit() {
        orbitA  = W * 0.42;
        orbitB  = H * 0.38;
        orbitCX = W * 0.5;
        orbitCY = H * 0.5;
        orbitT  = 0;
    }
    initOrbit();
    window.addEventListener('resize', initOrbit);

    // Inisialisasi posisi tubuh
    for (var i = 0; i < SEGMENTS; i++) {
        var t0 = -(i * 0.06);
        body.push({
            x: orbitCX + orbitA * Math.cos(t0),
            y: orbitCY + orbitB * Math.sin(t0)
        });
    }

    // ── Warna ──
    var neonColor  = '#00f7ff';
    var colorTimer = 0;
    var colorIndex = 0;
    var COLORS = [
        '#00f7ff','#00ff88','#ff2d9b',
        '#ffaa00','#a855f7','#ff4444',
        '#00ff00','#ff8800','#0088ff'
    ];

    // Ikuti warna neon pilihan user sebagai base, random setiap detik
    function updateColor(dt) {
        colorTimer += dt;
        if (colorTimer >= 1000) {
            colorTimer = 0;
            // 40% chance ikuti warna neon, 60% random
            if (Math.random() < 0.4) {
                var stored = localStorage.getItem('neonColor') || 'blue';
                var map = { blue:'#00f7ff', green:'#00ff88', pink:'#ff2d9b' };
                neonColor = map[stored] || '#00f7ff';
            } else {
                colorIndex = Math.floor(Math.random() * COLORS.length);
                neonColor = COLORS[colorIndex];
            }
        }
    }

    // ── Gambar segitiga sisik ──
    function drawScale(x, y, dir, size, alpha) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(dir + Math.PI / 2);
        ctx.globalAlpha = alpha * 0.6;
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.8);
        ctx.lineTo(-size * 0.5, size * 0.5);
        ctx.lineTo(size * 0.5,  size * 0.5);
        ctx.closePath();
        ctx.fillStyle = neonColor;
        ctx.fill();
        ctx.restore();
    }

    // ── Gambar sayap ──
    function drawWing(x, y, dir, size, side, flap) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(dir);
        ctx.globalAlpha = 0.55;
        var sy = side * (1 + flap * 0.5);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(
            side * size * 1.8, -size * (1.2 + flap),
            side * size * 2.8, -size * (0.5 + flap * 0.5),
            side * size * 2.2,  size * 0.8
        );
        ctx.bezierCurveTo(
            side * size * 1.4,  size * 0.3,
            side * size * 0.6, -size * 0.2,
            0, 0
        );
        ctx.closePath();

        var grd = ctx.createLinearGradient(0, 0, side * size * 2.5, 0);
        grd.addColorStop(0,   neonColor);
        grd.addColorStop(0.5, neonColor + 'aa');
        grd.addColorStop(1,   neonColor + '22');
        ctx.fillStyle = grd;
        ctx.fill();
        ctx.strokeStyle = neonColor;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    }

    // ── Gambar kepala naga ──
    function drawHead(x, y, dir, size, flap) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(dir);

        // Badan kepala
        ctx.globalAlpha = 0.95;
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 1.6, size * 1.0, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#111';
        ctx.fill();
        ctx.strokeStyle = neonColor;
        ctx.lineWidth = 2;
        ctx.shadowColor = neonColor;
        ctx.shadowBlur  = 12;
        ctx.stroke();

        // Moncong
        ctx.beginPath();
        ctx.ellipse(size * 1.3, 0, size * 0.9, size * 0.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#1a1a1a';
        ctx.fill();
        ctx.strokeStyle = neonColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Lubang hidung
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(size * 1.9,  size * 0.15, size * 0.12, 0, Math.PI * 2);
        ctx.arc(size * 1.9, -size * 0.15, size * 0.12, 0, Math.PI * 2);
        ctx.fillStyle = neonColor;
        ctx.fill();

        // Mata
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(-size * 0.2, -size * 0.5, size * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.strokeStyle = neonColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Pupil
        ctx.beginPath();
        ctx.arc(-size * 0.2, -size * 0.5, size * 0.18, 0, Math.PI * 2);
        ctx.fillStyle = neonColor;
        ctx.shadowBlur = 8;
        ctx.fill();

        // Tanduk
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.moveTo(-size * 0.4, -size * 0.9);
        ctx.lineTo(-size * 0.1, -size * 1.7);
        ctx.lineTo( size * 0.0, -size * 0.85);
        ctx.closePath();
        ctx.fillStyle = neonColor;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-size * 0.9, -size * 0.75);
        ctx.lineTo(-size * 0.7, -size * 1.45);
        ctx.lineTo(-size * 0.5, -size * 0.7);
        ctx.closePath();
        ctx.fillStyle = neonColor + 'cc';
        ctx.fill();

        // Api dari mulut
        ctx.globalAlpha = 0.7 + Math.random() * 0.3;
        var fireGrd = ctx.createRadialGradient(size * 2.1, 0, 0, size * 2.1, 0, size * 1.2);
        fireGrd.addColorStop(0,   '#ffffff');
        fireGrd.addColorStop(0.3, neonColor);
        fireGrd.addColorStop(1,   neonColor + '00');
        ctx.beginPath();
        ctx.moveTo(size * 1.9,  size * 0.25);
        ctx.bezierCurveTo(
            size * 2.5, size * 0.1,
            size * 3.2 + Math.random() * size, size * (0.3 + Math.random() * 0.3),
            size * 3.5 + Math.random() * size * 0.5, size * (Math.random() * 0.2)
        );
        ctx.bezierCurveTo(
            size * 3.2 + Math.random() * size, -size * (0.2 + Math.random() * 0.3),
            size * 2.5, -size * 0.1,
            size * 1.9, -size * 0.25
        );
        ctx.closePath();
        ctx.fillStyle = fireGrd;
        ctx.fill();

        ctx.restore();
    }

    // ── Gambar ekor ──
    function drawTail(x, y, dir, size) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(dir + Math.PI);
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(size * 1.5, -size, size * 2.5, size * 0.5, size * 3, 0);
        ctx.bezierCurveTo(size * 2.5, -size * 0.5, size * 1.5, -size * 0.2, 0, 0);
        ctx.fillStyle = neonColor + 'aa';
        ctx.fill();
        ctx.restore();
    }

    // ── Main loop ──
    var last = 0;
    function loop(ts) {
        var dt = ts - last; last = ts;
        if (dt > 100) dt = 100;

        ctx.clearRect(0, 0, W, H);

        updateColor(dt);

        // Gerakkan kepala lewat orbit elips
        orbitT += speed * dt * 0.0008;
        var headX = orbitCX + orbitA * Math.cos(orbitT);
        var headY = orbitCY + orbitB * Math.sin(orbitT);

        // Arah kepala = tangent orbit
        angle = Math.atan2(
            orbitB * Math.cos(orbitT),
           -orbitA * Math.sin(orbitT)
        );

        // Geser tubuh mengikuti kepala (chain)
        body[0].x = headX;
        body[0].y = headY;
        var SEG_LEN = 18;
        for (var i = 1; i < SEGMENTS; i++) {
            var dx = body[i].x - body[i-1].x;
            var dy = body[i].y - body[i-1].y;
            var dist = Math.sqrt(dx*dx + dy*dy) || 1;
            body[i].x = body[i-1].x + dx/dist * SEG_LEN;
            body[i].y = body[i-1].y + dy/dist * SEG_LEN;
        }

        // Hitung arah tiap segmen
        var dirs = [];
        dirs[0] = angle;
        for (var i = 1; i < SEGMENTS; i++) {
            dirs[i] = Math.atan2(body[i].y - body[i-1].y, body[i].x - body[i-1].x);
        }

        var flap = Math.sin(orbitT * 3) * 0.4;
        var WING_SEG = 6; // segmen ke-6 tempat sayap

        // Gambar glow trail dulu
        for (var i = SEGMENTS - 1; i >= 0; i--) {
            var progress = i / SEGMENTS;
            var sz = 10 - progress * 7;
            ctx.beginPath();
            ctx.arc(body[i].x, body[i].y, sz, 0, Math.PI * 2);
            ctx.fillStyle = neonColor;
            ctx.globalAlpha = (1 - progress) * 0.08;
            ctx.shadowColor = neonColor;
            ctx.shadowBlur  = 20;
            ctx.fill();
        }
        ctx.shadowBlur = 0;

        // Gambar tubuh
        for (var i = SEGMENTS - 1; i >= 1; i--) {
            var progress = i / SEGMENTS;
            var sz = 10 - progress * 6.5;
            if (sz < 1.5) sz = 1.5;
            var alpha = 0.85 - progress * 0.4;

            // Badan
            ctx.beginPath();
            ctx.arc(body[i].x, body[i].y, sz, 0, Math.PI * 2);
            ctx.fillStyle = '#111';
            ctx.globalAlpha = alpha;
            ctx.fill();
            ctx.strokeStyle = neonColor;
            ctx.lineWidth = 1.2;
            ctx.globalAlpha = alpha * 0.8;
            ctx.shadowColor = neonColor;
            ctx.shadowBlur  = 8;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Sisik setiap 2 segmen
            if (i % 2 === 0 && sz > 3) {
                drawScale(body[i].x, body[i].y, dirs[i], sz * 0.9, alpha * 0.7);
            }
        }

        // Sayap di segmen ke-6
        if (WING_SEG < SEGMENTS) {
            drawWing(body[WING_SEG].x, body[WING_SEG].y, dirs[WING_SEG], 13, -1, flap);
            drawWing(body[WING_SEG].x, body[WING_SEG].y, dirs[WING_SEG], 13,  1, flap);
        }

        // Ekor di ujung
        drawTail(body[SEGMENTS-1].x, body[SEGMENTS-1].y, dirs[SEGMENTS-1], 8);

        // Kepala di segmen 0
        drawHead(body[0].x, body[0].y, angle, 10, flap);

        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
})();
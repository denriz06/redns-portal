// ==========================================
// SEMUA FUNGSI GLOBAL DIDEKLARASI DULU
// supaya inline onclick di HTML bisa akses
// ==========================================

// --- STATE GLOBAL ---
var _calc = { display: '0', expr: '', operator: null, prev: null, freshNum: true, memory: 0 };
var _calcKeyHandler = null;

// --- KALKULATOR FUNCTIONS ---
function syncCalcDisplay() {
    var d = document.getElementById('calcDisplay');
    var e = document.getElementById('calcExpr');
    if (!d || !e) return;
    var len = _calc.display.length;
    d.style.fontSize = len > 14 ? '16px' : len > 9 ? '22px' : '30px';
    d.innerText = _calc.display;
    e.innerText  = _calc.expr;
}

function calcNum(n) {
    if (n === '.' && _calc.display.includes('.')) return;
    if (_calc.freshNum || _calc.display === '0') {
        _calc.display = (n === '.') ? '0.' : n;
        _calc.freshNum = false;
    } else {
        if (_calc.display.replace('-','').length >= 15) return;
        _calc.display += n;
    }
    syncCalcDisplay();
}

function calcOp(op) {
    var cur = parseFloat(_calc.display);
    if (_calc.operator !== null && !_calc.freshNum) {
        var res = applyOp(_calc.prev, cur, _calc.operator);
        _calc.display = formatCalc(res);
        _calc.prev = res;
    } else {
        _calc.prev = cur;
    }
    var labels = { '+': '+', '-': '\u2212', '*': '\u00d7', '/': '\u00f7' };
    _calc.expr = _calc.display + ' ' + (labels[op] || op);
    _calc.operator = op;
    _calc.freshNum = true;
    syncCalcDisplay();
}

function calcEqual() {
    if (_calc.operator === null || _calc.prev === null) return;
    var cur = parseFloat(_calc.display);
    var labels = { '+': '+', '-': '\u2212', '*': '\u00d7', '/': '\u00f7' };
    var opLabel = labels[_calc.operator] || _calc.operator;
    _calc.expr = formatCalc(_calc.prev) + ' ' + opLabel + ' ' + formatCalc(cur) + ' =';
    var result = applyOp(_calc.prev, cur, _calc.operator);
    _calc.display = formatCalc(result);
    _calc.operator = null;
    _calc.prev = null;
    _calc.freshNum = true;
    syncCalcDisplay();
}

function calcFn(fn) {
    var v = parseFloat(_calc.display) || 0;
    if (fn === 'C') {
        _calc.display = '0'; _calc.expr = ''; _calc.operator = null; _calc.prev = null; _calc.freshNum = true;
    } else if (fn === 'CE') {
        _calc.display = '0'; _calc.freshNum = true;
    } else if (fn === 'back') {
        if (_calc.freshNum) { _calc.display = '0'; }
        else { _calc.display = _calc.display.length > 1 ? _calc.display.slice(0,-1) : '0'; }
        if (_calc.display === '-') _calc.display = '0';
    } else if (fn === '%') {
        _calc.expr = formatCalc(v) + ' %';
        _calc.display = formatCalc(v / 100);
        _calc.freshNum = true;
    } else if (fn === '1/x') {
        if (v === 0) { _calc.display = 'Error: \u00f7 0'; _calc.freshNum = true; }
        else { _calc.expr = '1/(' + formatCalc(v) + ')'; _calc.display = formatCalc(1/v); _calc.freshNum = true; }
    } else if (fn === 'x2') {
        _calc.expr = '(' + formatCalc(v) + ')\u00b2';
        _calc.display = formatCalc(v * v);
        _calc.freshNum = true;
    } else if (fn === 'sqrt') {
        if (v < 0) { _calc.display = 'Error'; _calc.freshNum = true; }
        else { _calc.expr = '\u221a(' + formatCalc(v) + ')'; _calc.display = formatCalc(Math.sqrt(v)); _calc.freshNum = true; }
    } else if (fn === 'negate') {
        if (_calc.display !== '0') {
            _calc.display = _calc.display.startsWith('-') ? _calc.display.slice(1) : '-' + _calc.display;
        }
    }
    syncCalcDisplay();
}

function calcMem(btn) {
    var v = parseFloat(_calc.display) || 0;
    if (btn === 'MC') { _calc.memory = 0; }
    else if (btn === 'MR') { _calc.display = formatCalc(_calc.memory); _calc.freshNum = true; syncCalcDisplay(); }
    else if (btn === 'M+') { _calc.memory += v; }
    else if (btn === 'M\u2212') { _calc.memory -= v; }
    else if (btn === 'MS') { _calc.memory = v; }
}

function applyOp(a, b, op) {
    if (op === '+') return a + b;
    if (op === '-') return a - b;
    if (op === '*') return a * b;
    if (op === '/') return b === 0 ? NaN : a / b;
    return b;
}

function formatCalc(n) {
    if (isNaN(n) || !isFinite(n)) return 'Error';
    return parseFloat(n.toPrecision(12)).toString();
}

function addCalcKeyboard() {
    if (_calcKeyHandler) document.removeEventListener('keydown', _calcKeyHandler);
    _calcKeyHandler = function(e) {
        if (['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) return;
        var k = e.key;
        if (k >= '0' && k <= '9')          { e.preventDefault(); calcNum(k); }
        else if (k === '.')                  { e.preventDefault(); calcNum('.'); }
        else if (k === '+')                  { e.preventDefault(); calcOp('+'); }
        else if (k === '-')                  { e.preventDefault(); calcOp('-'); }
        else if (k === '*')                  { e.preventDefault(); calcOp('*'); }
        else if (k === '/')                  { e.preventDefault(); calcOp('/'); }
        else if (k === 'Enter' || k === '=') { e.preventDefault(); calcEqual(); }
        else if (k === 'Backspace')          { e.preventDefault(); calcFn('back'); }
        else if (k === 'Escape')             { e.preventDefault(); calcFn('C'); }
        else if (k === 'Delete')             { e.preventDefault(); calcFn('CE'); }
        else if (k === '%')                  { e.preventDefault(); calcFn('%'); }
    };
    document.addEventListener('keydown', _calcKeyHandler);
}

function removeCalcKeyboard() {
    if (_calcKeyHandler) { document.removeEventListener('keydown', _calcKeyHandler); _calcKeyHandler = null; }
}


// ==========================================
// NEON COLOR PICKER
// ==========================================
var NEON_COLORS = {
    'blue':  { neon:'#00f7ff', rgb:'0,247,255',   border:'rgba(0,247,255,0.25)',   dim:'rgba(0,247,255,0.08)'  },
    'green': { neon:'#00ff88', rgb:'0,255,136',    border:'rgba(0,255,136,0.25)',   dim:'rgba(0,255,136,0.08)'  },
    'pink':  { neon:'#ff2d9b', rgb:'255,45,155',   border:'rgba(255,45,155,0.25)',  dim:'rgba(255,45,155,0.08)' },
};

function applyNeonColor(colorKey) {
    var col = NEON_COLORS[colorKey] || NEON_COLORS['blue'];
    var root = document.documentElement;
    root.style.setProperty('--neon',        col.neon);
    root.style.setProperty('--neon-rgb',    col.rgb);
    root.style.setProperty('--neon-border', col.border);
    root.style.setProperty('--neon-dim',    col.dim);

    // Override semua inline style #00f7ff via injected stylesheet
    var st = document.getElementById('neonOverride');
    if (!st) { st = document.createElement('style'); st.id = 'neonOverride'; document.head.appendChild(st); }
    // Warna neon aktif dari pilihan user
    var n = col.neon, r = col.rgb;
    st.textContent =
        // ── LAMPU ON: semua elemen dapat warna neon ──
        '.neon-on [style*="color:#00f7ff"],.neon-on [style*="color: #00f7ff"]{color:'+n+'!important;}' +
        '.neon-on [style*="border:1px solid #00f7ff"],.neon-on [style*="border: 1px solid #00f7ff"]{border-color:'+n+'!important;}' +
        '.neon-on [style*="border-color:#00f7ff"]{border-color:'+n+'!important;}' +
        '.neon-on [style*="background:#00f7ff"],.neon-on [style*="background: #00f7ff"]{background:'+n+'!important;}' +
        '.neon-on [style*="box-shadow"][style*="#00f7ff"]{box-shadow:0 0 15px '+n+'!important;}' +
        '.neon-on [style*="text-shadow"][style*="#00f7ff"]{text-shadow:0 0 10px '+n+'!important;}' +
        '.neon-on [style*="border-left:3px solid #00f7ff"]{border-left-color:'+n+'!important;}' +
        '.neon-on [style*="color:var(--neon"],.neon-on [style*="color: var(--neon"]{color:'+n+'!important;}' +
        // ── LAMPU OFF: semua elemen jadi abu/putih ──
        ':not(.neon-on) [style*="color:#00f7ff"],:not(.neon-on) [style*="color: #00f7ff"]{color:#aaa!important;}' +
        ':not(.neon-on) [style*="border:1px solid #00f7ff"],:not(.neon-on) [style*="border: 1px solid #00f7ff"]{border-color:#444!important;}' +
        ':not(.neon-on) [style*="background:#00f7ff"],:not(.neon-on) [style*="background: #00f7ff"]{background:#888!important;}' +
        ':not(.neon-on) [style*="box-shadow"][style*="#00f7ff"]{box-shadow:none!important;}' +
        ':not(.neon-on) [style*="text-shadow"][style*="#00f7ff"]{text-shadow:none!important;}' +
        ':not(.neon-on) [style*="color:var(--neon"],:not(.neon-on) [style*="color: var(--neon"]{color:#aaa!important;}' +
        ':not(.neon-on) [style*="background:var(--neon"],:not(.neon-on) [style*="background: var(--neon"]{background:#888!important;}' +
        ':not(.neon-on) [style*="border-color:var(--neon"],:not(.neon-on) [style*="border-color: var(--neon"]{border-color:#444!important;}' +
        // ── Kalkulator ──
        '.neon-on .cbtn-op{color:'+n+'!important;} :not(.neon-on) .cbtn-op{color:#aaa!important;}' +
        '.neon-on .cbtn-mem:hover,.neon-on .cbtn-mem:active{color:'+n+'!important;}' +
        '.neon-on .cbtn-eq{background:'+n+'!important;color:#000!important;} :not(.neon-on) .cbtn-eq{background:#555!important;color:#fff!important;}' +
        '.neon-on #calcExpr{color:'+n+'!important;} :not(.neon-on) #calcExpr{color:#777!important;}' +
        // ── Aritmatika ──
        '.neon-on .ariNum{background:'+n+'!important;} :not(.neon-on) .ariNum{background:#555!important;}' +
        '.neon-on .ariTitle{color:'+n+'!important;} :not(.neon-on) .ariTitle{color:#aaa!important;}' +
        '.neon-on .ariBtn{background:'+n+'!important;} :not(.neon-on) .ariBtn{background:#555!important;color:#fff!important;}' +
        '.neon-on .ariResVal{color:'+n+'!important;} :not(.neon-on) .ariResVal{color:#aaa!important;}' +
        '.neon-on .ariCode .kw{color:'+n+'!important;} :not(.neon-on) .ariCode .kw{color:#888!important;}' +
        // ── Score/title ──
        '.neon-on #scoreDisplay{color:'+n+'!important;} :not(.neon-on) #scoreDisplay{color:#aaa!important;}' +
        '.neon-on #content-area h3,.neon-on #content-area h4{color:'+n+'!important;} :not(.neon-on) #content-area h3,:not(.neon-on) #content-area h4{color:#aaa!important;}' +
        '#calcDisplay{color:#fff;}';

    // Update active dot
    document.querySelectorAll('.color-dot').forEach(function(d) {
        d.classList.toggle('active', d.getAttribute('data-color') === colorKey);
    });
    
    // Re-render tab aktif supaya warna baru langsung keliatan
    if (window._activeTab && window.showTab) {
        window.showTab(window._activeTab);
    }
}

window.setNeonColor = function(colorKey) {
    localStorage.setItem('neonColor', colorKey);
    applyNeonColor(colorKey);
};

// Terapkan warna tersimpan saat halaman load
(function() {
    var saved = localStorage.getItem('neonColor') || 'blue';
    applyNeonColor(saved);
})();


// ==========================================
// OPERASI ARITMATIKA — random soal + hitung
// ==========================================
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// Generate nilai random untuk setiap soal, simpan di window agar bisa di-reset
window._ariRandom = function() {
    // Soal 1: BBM — jarak 200-800km, konsumsi 8-20km/L, harga 10000-20000
    window._s1 = {
        jarak:   randInt(200, 800),
        km:      randInt(8, 20),
        harga:   randInt(10, 20) * 1000
    };
    // Soal 2: Laptop — total 50-300, lab 3-12
    window._s2 = {
        total: randInt(50, 300),
        lab:   randInt(3, 12)
    };
    // Soal 3: Kelulusan — nilai random, campuran lulus/tidak
    window._s3 = {
        uas:   randInt(50, 100),
        tugas: randInt(40, 100),
        hadir: randInt(50, 100)
    };
};

// Panggil sekali untuk init
if (!window._s1) window._ariRandom();

window.ariNewSoal = function() {
    window._ariRandom();
    // Reset hasil ke "?"
    ['s1_resLiter','s1_resBiaya','s2_resPerLab','s2_resSisa','s3_resLulus','s3_resStatus'].forEach(function(id){
        var el = document.getElementById(id);
        if (el) { el.textContent = '?'; el.style.color = '#333'; el.className = el.className.replace(/ariResVal[GR]/g,'ariResVal'); }
    });
    ['s3_vUAS','s3_vTugas','s3_vHadir'].forEach(function(id){
        var el = document.getElementById(id); if(el){ el.textContent='?'; el.style.color='#333'; }
    });
    ['s3_bUAS','s3_bTugas','s3_bHadir'].forEach(function(id){
        var el = document.getElementById(id); if(el){ el.innerHTML='&#x25CF;'; el.style.color='#333'; }
    });
    ['s3_boxLulus','s3_boxStatus'].forEach(function(id){
        var el = document.getElementById(id); if(el) el.className = 'ariRes';
    });
    // Update input fields
    function setVal(id, v) { var e = document.getElementById(id); if(e) e.value = v; }
    setVal('s1_jarak', window._s1.jarak);
    setVal('s1_km',    window._s1.km);
    setVal('s1_harga', window._s1.harga);
    setVal('s2_total', window._s2.total);
    setVal('s2_lab',   window._s2.lab);
    setVal('s3_uas',   window._s3.uas);
    setVal('s3_tugas', window._s3.tugas);
    setVal('s3_hadir', window._s3.hadir);
    window.hitungBBM(); window.hitungLaptop(); window.hitungLulus();
};

window.hitungBBM = function() {
    var jarak  = parseFloat(document.getElementById('s1_jarak') ? document.getElementById('s1_jarak').value : 0) || 0;
    var km     = parseFloat(document.getElementById('s1_km')    ? document.getElementById('s1_km').value    : 1) || 1;
    var harga  = parseFloat(document.getElementById('s1_harga') ? document.getElementById('s1_harga').value : 0) || 0;
    var totalLiter = km > 0 ? jarak / km : 0;
    var totalBiaya = totalLiter * harga;
    var neon = getComputedStyle(document.documentElement).getPropertyValue('--neon').trim() || '#00f7ff';
    var el1 = document.getElementById('s1_resLiter');
    var el2 = document.getElementById('s1_resBiaya');
    if (el1) { el1.textContent = totalLiter.toFixed(2); el1.style.color = neon; }
    if (el2) { el2.textContent = 'Rp ' + Math.round(totalBiaya).toLocaleString('id-ID'); el2.style.color = neon; }
};

window.hitungLaptop = function() {
    var total = parseInt(document.getElementById('s2_total') ? document.getElementById('s2_total').value : 0) || 0;
    var lab   = parseInt(document.getElementById('s2_lab')   ? document.getElementById('s2_lab').value   : 1) || 1;
    var perLab = lab > 0 ? Math.floor(total / lab) : 0;
    var sisa   = lab > 0 ? total % lab : total;
    var neon = getComputedStyle(document.documentElement).getPropertyValue('--neon').trim() || '#00f7ff';
    var el1 = document.getElementById('s2_resPerLab');
    var el2 = document.getElementById('s2_resSisa');
    if (el1) { el1.textContent = perLab; el1.style.color = neon; }
    if (el2) { el2.textContent = sisa;   el2.style.color = '#ff0055'; }
};

window.hitungLulus = function() {
    var uas   = parseFloat(document.getElementById('s3_uas')   ? document.getElementById('s3_uas').value   : 0) || 0;
    var tugas = parseFloat(document.getElementById('s3_tugas') ? document.getElementById('s3_tugas').value : 0) || 0;
    var hadir = parseFloat(document.getElementById('s3_hadir') ? document.getElementById('s3_hadir').value : 0) || 0;
    var lulus  = uas >= 70 && tugas >= 60 && hadir >= 75;
    var status = +lulus;
    var ok = function(x) { return x ? '#00cc66' : '#ff0055'; };
    var ic = function(x) { return x ? '&#x2713;' : '&#x2717;'; };
    var el;
    el = document.getElementById('s3_vUAS');   if(el){ el.textContent = uas;        el.style.color = getComputedStyle(document.documentElement).getPropertyValue('--neon').trim(); }
    el = document.getElementById('s3_vTugas'); if(el){ el.textContent = tugas;      el.style.color = getComputedStyle(document.documentElement).getPropertyValue('--neon').trim(); }
    el = document.getElementById('s3_vHadir'); if(el){ el.textContent = hadir + '%'; el.style.color = getComputedStyle(document.documentElement).getPropertyValue('--neon').trim(); }
    el = document.getElementById('s3_bUAS');   if(el){ el.style.color=ok(uas>=70);   el.innerHTML=ic(uas>=70)  +' &ge;70';  }
    el = document.getElementById('s3_bTugas'); if(el){ el.style.color=ok(tugas>=60); el.innerHTML=ic(tugas>=60)+' &ge;60';  }
    el = document.getElementById('s3_bHadir'); if(el){ el.style.color=ok(hadir>=75); el.innerHTML=ic(hadir>=75)+' &ge;75%'; }
    el = document.getElementById('s3_resLulus');  if(el){ el.textContent = lulus+'';  el.style.color=''; el.className = lulus  ? 'ariResValG' : 'ariResValR'; }
    el = document.getElementById('s3_resStatus'); if(el){ el.textContent = status+''; el.style.color=''; el.className = status ? 'ariResValG' : 'ariResValR'; }
    el = document.getElementById('s3_boxLulus');  if(el) el.className = lulus  ? 'ariResG' : 'ariResR';
    el = document.getElementById('s3_boxStatus'); if(el) el.className = status ? 'ariResG' : 'ariResR';
};


// ==========================================
// 1. INITIAL STATE & SESSION GUARD
// ==========================================
const area = document.getElementById('content-area');
const title = document.getElementById('login-title');

const sessionRole = localStorage.getItem('sessionRole') || 'admin';
// Guard dinonaktifkan — akses bebas untuk kemudahan pengembangan lokal
if (false) {
}

let currentUser = localStorage.getItem('sessionUser') || "Admin Fariz";
let bestScore = localStorage.getItem('adminBestScore') ? parseInt(localStorage.getItem('adminBestScore')) : null;
let showScore = localStorage.getItem('adminShowScore') !== 'false';
let secretNumber = 0;
let attempts = 0;

function getBestDisplay() {
    return !showScore ? '••••' : (bestScore != null ? bestScore : '-');
}

window.onload = () => {
    if (title) title.innerText = "ADMIN PANEL";
    initNeonToggle();
    showTab('home');
};

// ==========================================
// 2. NEON TOGGLE
// ==========================================
function initNeonToggle() {
    const checkbox = document.getElementById('input-check');
    const box = document.querySelector('.login-box');
    if (!checkbox || !box) return;
    if (checkbox.checked) box.classList.add('neon-on');
    function applyLampState(on) {
        box.classList.toggle('neon-on', on);
        // Lampu gantung
        var light = document.querySelector('.login-light');
        if (light) {
            var neon = getComputedStyle(document.documentElement).getPropertyValue('--neon').trim();
            light.style.background   = on ? neon : '#333';
            light.style.boxShadow    = on ? '0 0 20px ' + neon : 'none';
        }
        localStorage.setItem('neonState', on ? 'on' : 'off');
        if (window._activeTab && window.showTab) window.showTab(window._activeTab);
    }
    checkbox.addEventListener('change', () => applyLampState(checkbox.checked));
    // Restore state
    var savedState = localStorage.getItem('neonState');
    var initOn = savedState ? savedState === 'on' : checkbox.checked;
    checkbox.checked = initOn;
    applyLampState(initOn);
}

// ==========================================
// 3. SCORE TOGGLE
// ==========================================
window.toggleScoreVisibility = () => {
    showScore = !showScore;
    localStorage.setItem('adminShowScore', showScore);
    showTab(window._activeTab || 'home');
};

// ==========================================
// 4. TAB NAVIGATION
// ==========================================
window.showTab = (tabName) => {
    if (!area) return;
    window._activeTab = tabName;
    area.innerHTML = "";

    // Kembalikan lebar box & matikan keyboard kalkulator saat pindah tab
    const box = document.querySelector('.login-box');
    if (tabName !== 'diskon' && box) { box.style.width = ''; box.style.maxWidth = ''; }
    if (tabName !== 'calc') removeCalcKeyboard();

    const eyeIcon = showScore
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

    const scoreWidget = '<div style="display:flex;align-items:center;gap:8px;background:rgba(0,247,255,0.07);border:1px solid rgba(0,247,255,0.2);border-radius:8px;padding:8px 14px;margin-top:14px;"><span style="font-size:11px;opacity:0.7;flex:1;">Best Score</span><span id="scoreDisplay" style="font-size:16px;font-weight:bold;color:#00f7ff;letter-spacing:2px;">' + getBestDisplay() + '</span><button onclick="toggleScoreVisibility()" style="width:26px;height:26px;background:rgba(0,247,255,0.15);border:1px solid rgba(0,247,255,0.3);border-radius:6px;color:#00f7ff;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;">' + eyeIcon + '</button></div>';

    if (tabName === 'home') {
        area.innerHTML = '<div style="padding:15px;border-left:3px solid #00f7ff;background:rgba(0,247,255,0.05);border-radius:0 10px 10px 0;"><h3 style="color:#00f7ff;margin-bottom:5px;">Welcome, Master!</h3><p style="font-size:13px;color:#fff;">ID: <span style="color:#00f7ff;">' + currentUser + '</span></p><p style="font-size:11px;margin-top:8px;opacity:0.8;">Status: System Administrator</p><p style="font-size:11px;opacity:0.8;">Akses: Full Permissions granted.</p>' + scoreWidget + '</div>';
    }

    else if (tabName === 'calc') {
        // Gunakan data-action attribute, BUKAN onclick string
        // Supaya tidak ada masalah quote escaping dan works di mobile
        area.innerHTML =
            '<div id="calcWrap" style="display:flex;flex-direction:column;gap:0;width:100%;">' +
            // Display
            '<div style="background:#0d0d0d;border:1px solid #1a1a1a;border-radius:10px 10px 0 0;padding:10px 14px 8px;text-align:right;min-height:72px;display:flex;flex-direction:column;justify-content:flex-end;">' +
                '<div id="calcExpr" style="font-size:10px;color:#00f7ff;opacity:0.5;min-height:14px;word-break:break-all;margin-bottom:2px;"></div>' +
                '<div id="calcDisplay" style="font-size:30px;font-weight:300;color:#fff;letter-spacing:-1px;word-break:break-all;">0</div>' +
            '</div>' +
            // Memory bar
            '<div style="display:grid;grid-template-columns:repeat(6,1fr);background:#111;border:1px solid #1a1a1a;border-top:none;">' +
                '<button data-action="mem-MC" class="cbtn-mem">MC</button>' +
                '<button data-action="mem-MR" class="cbtn-mem">MR</button>' +
                '<button data-action="mem-M+" class="cbtn-mem">M+</button>' +
                '<button data-action="mem-M−" class="cbtn-mem">M−</button>' +
                '<button data-action="mem-MS" class="cbtn-mem">MS</button>' +
                '<button data-action="mem-M▾" class="cbtn-mem">M▾</button>' +
            '</div>' +
            // Row 1: % CE C backspace
            '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#1a1a1a;border:1px solid #1a1a1a;border-top:none;">' +
                '<button data-action="fn-%" class="cbtn-fn">%</button>' +
                '<button data-action="fn-CE" class="cbtn-fn">CE</button>' +
                '<button data-action="fn-C" class="cbtn-fn">C</button>' +
                '<button data-action="fn-back" class="cbtn-fn" style="color:#00f7ff;">⌫</button>' +
            '</div>' +
            // Row 2: 1/x x² √x ÷
            '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#1a1a1a;border:1px solid #1a1a1a;border-top:none;">' +
                '<button data-action="fn-1/x" class="cbtn-fn2">¹/x</button>' +
                '<button data-action="fn-x2" class="cbtn-fn2">x²</button>' +
                '<button data-action="fn-sqrt" class="cbtn-fn2">²√x</button>' +
                '<button data-action="op-/" class="cbtn-fn2" style="color:#00f7ff;">÷</button>' +
            '</div>' +
            // Rows 7 8 9 ×
            '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#1a1a1a;border:1px solid #1a1a1a;border-top:none;">' +
                '<button data-action="num-7" class="cbtn-num">7</button>' +
                '<button data-action="num-8" class="cbtn-num">8</button>' +
                '<button data-action="num-9" class="cbtn-num">9</button>' +
                '<button data-action="op-*" class="cbtn-op">×</button>' +
            '</div>' +
            // Rows 4 5 6 −
            '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#1a1a1a;border:1px solid #1a1a1a;border-top:none;">' +
                '<button data-action="num-4" class="cbtn-num">4</button>' +
                '<button data-action="num-5" class="cbtn-num">5</button>' +
                '<button data-action="num-6" class="cbtn-num">6</button>' +
                '<button data-action="op--" class="cbtn-op">−</button>' +
            '</div>' +
            // Rows 1 2 3 +
            '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#1a1a1a;border:1px solid #1a1a1a;border-top:none;">' +
                '<button data-action="num-1" class="cbtn-num">1</button>' +
                '<button data-action="num-2" class="cbtn-num">2</button>' +
                '<button data-action="num-3" class="cbtn-num">3</button>' +
                '<button data-action="op-+" class="cbtn-op">+</button>' +
            '</div>' +
            // Row +/- 0 . =
            '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#1a1a1a;border:1px solid #1a1a1a;border-top:none;">' +
                '<button data-action="fn-negate" class="cbtn-num">+/−</button>' +
                '<button data-action="num-0" class="cbtn-num">0</button>' +
                '<button data-action="num-." class="cbtn-num">.</button>' +
                '<button data-action="eq" class="cbtn-eq">=</button>' +
            '</div>' +
            '<div style="height:4px;background:#1e1e1e;border:1px solid #1a1a1a;border-top:none;border-radius:0 0 10px 10px;"></div>' +
            '</div>';

        // Inject CSS sekali
        if (!document.getElementById('calcStyle')) {
            var st = document.createElement('style');
            st.id = 'calcStyle';
            st.textContent =
                '.cbtn-mem{height:28px;background:transparent;border:none;border-right:1px solid #1a1a1a;color:#666;font-size:10px;font-weight:600;cursor:pointer;touch-action:manipulation;}' +
                '.cbtn-mem:hover,.cbtn-mem:active{color:#00f7ff;background:rgba(0,247,255,0.05);}' +
                '.cbtn-fn{height:42px;background:#333;border:none;color:#ccc;font-size:14px;font-weight:500;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;}' +
                '.cbtn-fn:hover,.cbtn-fn:active{background:#444;}' +
                '.cbtn-fn2{height:42px;background:#252525;border:none;color:#ccc;font-size:14px;font-weight:500;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;}' +
                '.cbtn-fn2:hover,.cbtn-fn2:active{background:#333;}' +
                '.cbtn-num{height:46px;background:#1e1e1e;border:none;color:#fff;font-size:15px;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;}' +
                '.cbtn-num:hover,.cbtn-num:active{background:#2a2a2a;}' +
                '.cbtn-op{height:46px;background:#252525;border:none;color:#00f7ff;font-size:16px;font-weight:600;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;}' +
                '.cbtn-op:hover,.cbtn-op:active{background:#333;}' +
                '.cbtn-eq{height:46px;background:#007a87;border:none;color:#fff;font-size:22px;font-weight:700;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;box-shadow:inset 0 0 20px rgba(0,247,255,0.15);}' +
                '.cbtn-eq:hover,.cbtn-eq:active{background:#009ab0;}';
            document.head.appendChild(st);
        }

        // Single event listener via event delegation (works mouse & touch)
        var calcWrap = document.getElementById('calcWrap');
        calcWrap.addEventListener('click', function(e) {
            var btn = e.target.closest('[data-action]');
            if (!btn) return;
            var action = btn.getAttribute('data-action');
            if (action.startsWith('num-'))      calcNum(action.slice(4));
            else if (action.startsWith('op-'))  calcOp(action.slice(3));
            else if (action.startsWith('fn-'))  calcFn(action.slice(3));
            else if (action.startsWith('mem-')) calcMem(action.slice(4));
            else if (action === 'eq')           calcEqual();
        });

        _calc = { display: '0', expr: '', operator: null, prev: null, freshNum: true, memory: _calc.memory };
        syncCalcDisplay();
        addCalcKeyboard();
    }

    else if (tabName === 'game') {
        startGame();
    }
    else if (tabName === 'grade') {
        area.innerHTML = '<div style="text-align:center;padding:10px;"><h4 style="color:#00f7ff;margin-bottom:10px;">GRADE SCANNER</h4><input type="number" id="scoreInput" placeholder="Input Nilai (0-100)" oninput="scanGrade()" style="width:80%;padding:8px;background:#222;border:1px solid #00f7ff;color:#fff;text-align:center;border-radius:5px;"><div style="margin-top:20px;font-size:20px;">Grade: <span id="gradeResult" style="color:#00f7ff;font-weight:bold;">-</span></div><p id="gradeStatus" style="font-size:12px;margin-top:5px;"></p></div>';
    }

    else if (tabName === 'tugas') {
        // Inject CSS sekali
        if (!document.getElementById('ariStyle')) {
            var as = document.createElement('style');
            as.id = 'ariStyle';
            as.textContent =
                '.ariWrap{display:flex;flex-direction:column;gap:12px;}' +
                '.ariCard{background:#111;border:1px solid #222;border-radius:12px;overflow:hidden;}' +
                '.ariHead{display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid #1a1a1a;}' +
                '.ariNum{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#000;flex-shrink:0;background:var(--neon);}' +
                '.ariTitle{font-size:11px;font-weight:700;color:var(--neon);letter-spacing:0.5px;}' +
                '.ariBody{padding:12px;}' +
                '.ariDesc{font-size:10px;color:#666;line-height:1.6;margin-bottom:10px;}' +
                '.ariInputs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;}' +
                '@media(max-width:400px){.ariInputs{grid-template-columns:1fr;}}' +
                '.ariField{display:flex;flex-direction:column;gap:4px;}' +
                '.ariLabel{font-size:9px;color:#666;letter-spacing:0.5px;font-family:monospace;}' +
                '.ariInp{height:32px;padding:0 8px;background:#0d0d0d;border:1px solid #2a2a2a;color:#fff;border-radius:6px;font-size:13px;font-weight:600;outline:none;width:100%;box-sizing:border-box;transition:border-color .2s;}' +
                '.ariInp:focus{border-color:var(--neon);}' +
                '.ariBtn{width:100%;height:32px;background:var(--neon);border:none;border-radius:6px;color:#000;font-size:11px;font-weight:800;cursor:pointer;letter-spacing:1px;margin-bottom:10px;touch-action:manipulation;}' +
                '.ariResults{display:grid;grid-template-columns:1fr 1fr;gap:8px;}' +
                '@media(max-width:400px){.ariResults{grid-template-columns:1fr;}}' +
                '.ariRes{border-radius:8px;padding:10px;text-align:center;border:1px solid rgba(var(--neon-rgb),0.2);background:rgba(var(--neon-rgb),0.06);}' +
                '.ariResR{border-radius:8px;padding:10px;text-align:center;border:1px solid rgba(255,0,85,0.2);background:rgba(255,0,85,0.06);}' +
                '.ariResG{border-radius:8px;padding:10px;text-align:center;border:1px solid rgba(0,204,102,0.25);background:rgba(0,204,102,0.07);}' +
                '.ariResLabel{font-size:9px;color:#666;letter-spacing:1px;margin-bottom:4px;font-family:monospace;}' +
                '.ariResVal{font-size:20px;font-weight:800;color:var(--neon);}' +
                '.ariResValR{font-size:20px;font-weight:800;color:#ff0055;}' +
                '.ariResValG{font-size:20px;font-weight:800;color:#00cc66;}' +
                '.ariResSub{font-size:9px;color:#444;margin-top:3px;}' +
                '.ariCode{font-family:monospace;font-size:9px;background:#0a0a0a;border-radius:6px;padding:8px;color:#555;line-height:1.7;margin-top:8px;border:1px solid #1a1a1a;}' +
                '.ariCode .kw{color:var(--neon);}' +
                '.ariCode .val{color:#ffaa00;}' +
                '.ariCode .op{color:#ff6b6b;}' +
                '.ariCode .cmt{color:#333;}' +
                '.ariChks{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px;}' +
                '.ariChk{background:#0d0d0d;border-radius:8px;padding:8px;text-align:center;}' +
                '.ariChkLbl{font-size:9px;color:#555;margin-bottom:3px;}' +
                '.ariChkVal{font-size:16px;font-weight:700;color:var(--neon);}' +
                '.ariChkBadge{font-size:9px;margin-top:2px;}';
            document.head.appendChild(as);
        }

        area.innerHTML =
        '<div style="display:flex;justify-content:flex-end;margin-bottom:8px;">' +'<button onclick="ariNewSoal()" style="height:28px;padding:0 14px;background:transparent;border:1px solid var(--neon);color:var(--neon);border-radius:20px;font-size:10px;font-weight:700;cursor:pointer;letter-spacing:1px;">&#x27F3; SOAL BARU</button>' +'</div>' +'<div class="ariWrap">' +

        // ── SOAL 1: BBM ──
        '<div class="ariCard">' +
            '<div class="ariHead">' +
                '<div class="ariNum">1</div>' +
                '<div>' +
                    '<div class="ariTitle">Konsumsi BBM Perjalanan</div>' +
                    '<div style="font-size:9px;color:#555;">Operator Aritmatika &mdash; <code style="color:#444;">/ *</code></div>' +
                '</div>' +
            '</div>' +
            '<div class="ariBody">' +
                '<p class="ariDesc">Hitung jumlah bensin yang dibutuhkan dan total biaya perjalanan dari Bogor ke Yogyakarta menggunakan operator aritmatika.</p>' +
                '<div class="ariInputs">' +
                    '<div class="ariField"><div class="ariLabel">let jarak</div><input class="ariInp" id="s1_jarak" type="number" value="' + window._s1.jarak + '"></div>' +
                    '<div class="ariField"><div class="ariLabel">let konsumsiMobil</div><input class="ariInp" id="s1_km" type="number" value="' + window._s1.km + '"></div>' +
                    '<div class="ariField" style="grid-column:1/-1"><div class="ariLabel">let hargaBensin</div><input class="ariInp" id="s1_harga" type="number" value="' + window._s1.harga + '"></div>' +
                '</div>' +
                '<button class="ariBtn" onclick="hitungBBM()">&#9654; HITUNG</button>' +
                '<div class="ariResults">' +
                    '<div class="ariRes"><div class="ariResLabel">totalLiter</div><div class="ariResVal" id="s1_resLiter" style="color:#333;">?</div><div class="ariResSub">liter</div></div>' +
                    '<div class="ariRes"><div class="ariResLabel">totalBiaya</div><div class="ariResVal" style="font-size:13px;color:#333;" id="s1_resBiaya">?</div><div class="ariResSub">rupiah</div></div>' +
                '</div>' +
                '<div class="ariCode">' +
                    '<span class="kw">let</span> totalLiter = jarak <span class="op">/</span> konsumsiMobil<br>' +
                    '<span class="kw">let</span> totalBiaya = totalLiter <span class="op">*</span> hargaBensin' +
                '</div>' +
            '</div>' +
        '</div>' +

        // ── SOAL 2: Laptop ──
        '<div class="ariCard">' +
            '<div class="ariHead">' +
                '<div class="ariNum">2</div>' +
                '<div>' +
                    '<div class="ariTitle">Distribusi Laptop Laboratorium</div>' +
                    '<div style="font-size:9px;color:#555;">Operator Aritmatika &mdash; <code style="color:#444;">Math.floor() %</code></div>' +
                '</div>' +
            '</div>' +
            '<div class="ariBody">' +
                '<p class="ariDesc">Hitung jumlah laptop per laboratorium dan sisa laptop yang tidak bisa dibagi rata menggunakan operator pembagian dan modulus.</p>' +
                '<div class="ariInputs">' +
                    '<div class="ariField"><div class="ariLabel">let totalLaptop</div><input class="ariInp" id="s2_total" type="number" value="' + window._s2.total + '"></div>' +
                    '<div class="ariField"><div class="ariLabel">let jumlahLab</div><input class="ariInp" id="s2_lab" type="number" value="' + window._s2.lab + '"></div>' +
                '</div>' +
                '<button class="ariBtn" onclick="hitungLaptop()">&#9654; HITUNG</button>' +
                '<div class="ariResults">' +
                    '<div class="ariRes"><div class="ariResLabel">laptopPerLab</div><div class="ariResVal" id="s2_resPerLab" style="color:#333;">?</div><div class="ariResSub">unit/lab</div></div>' +
                    '<div class="ariResR"><div class="ariResLabel">sisaLaptop</div><div class="ariResValR" id="s2_resSisa" style="color:#333;">?</div><div class="ariResSub">unit sisa</div></div>' +
                '</div>' +
                '<div class="ariCode">' +
                    '<span class="kw">let</span> laptopPerLab = Math.floor(totalLaptop <span class="op">/</span> jumlahLab)<br>' +
                    '<span class="kw">let</span> sisaLaptop &nbsp;= totalLaptop <span class="op">%</span> jumlahLab' +
                '</div>' +
            '</div>' +
        '</div>' +

        // ── SOAL 3: Kelulusan ──
        '<div class="ariCard">' +
            '<div class="ariHead">' +
                '<div class="ariNum">3</div>' +
                '<div>' +
                    '<div class="ariTitle">Syarat Kelulusan Mata Kuliah</div>' +
                    '<div style="font-size:9px;color:#555;">Operator Logika &mdash; <code style="color:#444;">&gt;= &amp;&amp; +</code></div>' +
                '</div>' +
            '</div>' +
            '<div class="ariBody">' +
                '<p class="ariDesc">Tentukan apakah mahasiswa lulus berdasarkan nilai UAS, Tugas, dan Kehadiran. Bonus: ubah boolean ke angka tanpa <code style="color:#555;">if</code>.</p>' +
                '<div class="ariInputs">' +
                    '<div class="ariField"><div class="ariLabel">let nilaiUAS <span style="color:#444;">(min 70)</span></div><input class="ariInp" id="s3_uas" type="number" value="72" min="0" max="100"></div>' +
                    '<div class="ariField"><div class="ariLabel">let nilaiTugas <span style="color:#444;">(min 60)</span></div><input class="ariInp" id="s3_tugas" type="number" value="68" min="0" max="100"></div>' +
                    '<div class="ariField" style="grid-column:1/-1"><div class="ariLabel">let kehadiran <span style="color:#444;">(min 75%)</span></div><input class="ariInp" id="s3_hadir" type="number" value="80" min="0" max="100"></div>' +
                '</div>' +
                '<button class="ariBtn" onclick="hitungLulus()">&#9654; CEK KELULUSAN</button>' +
                '<div class="ariChks">' +
                    '<div class="ariChk"><div class="ariChkLbl">nilaiUAS</div><div class="ariChkVal" id="s3_vUAS" style="color:#333;">?</div><div class="ariChkBadge" id="s3_bUAS" style="color:#333;">&#x25CF;</div></div>' +
                    '<div class="ariChk"><div class="ariChkLbl">nilaiTugas</div><div class="ariChkVal" id="s3_vTugas" style="color:#333;">?</div><div class="ariChkBadge" id="s3_bTugas" style="color:#333;">&#x25CF;</div></div>' +
                    '<div class="ariChk"><div class="ariChkLbl">kehadiran</div><div class="ariChkVal" id="s3_vHadir" style="color:#333;">?</div><div class="ariChkBadge" id="s3_bHadir" style="color:#333;">&#x25CF;</div></div>' +
                '</div>' +
                '<div class="ariResults">' +
                    '<div id="s3_boxLulus" class="ariRes"><div class="ariResLabel">lulus</div><div class="ariResVal" id="s3_resLulus" style="color:#333;">?</div></div>' +
                    '<div id="s3_boxStatus" class="ariRes"><div class="ariResLabel">statusKelulusan <span style="color:#333;font-style:italic;font-size:8px;">(+lulus)</span></div><div class="ariResVal" id="s3_resStatus" style="color:#333;">?</div></div>' +
                '</div>' +
                '<div class="ariCode">' +
                    '<span class="kw">let</span> lulus = nilaiUAS <span class="op">&gt;=</span> 70 <span class="op">&amp;&amp;</span> nilaiTugas <span class="op">&gt;=</span> 60 <span class="op">&amp;&amp;</span> kehadiran <span class="op">&gt;=</span> 75<br>' +
                    '<span class="cmt">// bonus &mdash; tanpa if</span><br>' +
                    '<span class="kw">let</span> statusKelulusan = <span class="op">+</span>lulus' +
                '</div>' +
            '</div>' +
        '</div>' +

        '</div>';

        // Init hitung semua
        window._ariRandom();
    }

    else if (tabName === 'typer') {
        if (window._typerCleanup) { window._typerCleanup(); window._typerCleanup = null; }

        // Container full-height, game engine yang urus rendernya
        area.innerHTML =
            '<div id="typerCanvas" style="position:relative;width:100%;height:460px;' +
            'border-radius:10px;overflow:hidden;background:#040408;"></div>';

        setTimeout(function() {
            var div = document.getElementById('typerCanvas');
            if (!div || typeof window.buildNeonTyperGame !== 'function') return;
            window.buildNeonTyperGame(div, function(s) {
                try {
                    var b = parseInt(localStorage.getItem('neonTyperBest')||'0');
                    if (s > b) localStorage.setItem('neonTyperBest', s);
                } catch(e) {}
            });
            window._typerCleanup = function() {
                if (div && div._cleanupGame) div._cleanupGame();
            };
        }, 60);
    }

    else if (tabName === 'diskon') {
        // Layout single-column, box tidak perlu diperlebar
        kasirItems = []; membershipActive = false;
        renderKasir();
    }
};

// ==========================================
// 5. GAME
// ==========================================
function startGame() {
    secretNumber = Math.floor(Math.random() * 100) + 1;
    attempts = 0;
    const eyeIcon = showScore
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
    area.innerHTML = '<div style="text-align:center;padding:10px;"><h4 style="color:#00f7ff;margin-bottom:4px;">TEBAK ANGKA (1\u2013100)</h4><div style="display:flex;align-items:center;justify-content:center;gap:8px;background:rgba(0,247,255,0.07);border:1px solid rgba(0,247,255,0.2);border-radius:8px;padding:7px 14px;margin:10px auto;width:fit-content;"><span style="font-size:11px;opacity:0.7;">Best Score</span><span id="scoreDisplay" style="font-size:15px;font-weight:bold;color:#00f7ff;letter-spacing:2px;">' + getBestDisplay() + '</span><button onclick="toggleScoreVisibility()" style="width:26px;height:26px;background:rgba(0,247,255,0.15);border:1px solid rgba(0,247,255,0.3);border-radius:6px;color:#00f7ff;cursor:pointer;padding:0;">' + eyeIcon + '</button></div><div style="display:flex;justify-content:center;gap:8px;margin-top:10px;"><input type="number" id="guessInput" min="1" max="100" placeholder="1-100" style="width:75px;height:34px;text-align:center;background:#222;border:1px solid #00f7ff;color:#fff;border-radius:5px;font-size:14px;"><button onclick="checkGuess()" style="width:55px;height:34px;background:#00f7ff;color:#000;font-weight:bold;border-radius:5px;font-size:12px;border:none;cursor:pointer;">CEK</button><button onclick="startGame()" style="width:65px;height:34px;background:transparent;border:1px solid #ff0055;color:#ff0055;border-radius:5px;font-size:11px;font-weight:600;cursor:pointer;">RESET</button></div><p id="gameHint" style="margin-top:12px;font-weight:bold;font-size:12px;min-height:18px;"></p><p style="font-size:10px;margin-top:4px;opacity:0.6;">Tebakan ke: <span id="attemptCount">0</span></p></div>';
}
window.startGame = startGame;

window.checkGuess = () => {
    const input = document.getElementById('guessInput');
    const hint = document.getElementById('gameHint');
    const guess = parseInt(input.value);
    if (isNaN(guess)||guess<1||guess>100) { hint.innerText='Masukkan angka 1\u2013100!'; hint.style.color='#ffaa00'; return; }
    attempts++;
    document.getElementById('attemptCount').innerText = attempts;
    if (guess === secretNumber) {
        hint.innerText = 'TEPAT! Angkanya ' + secretNumber + '. Admin Jago! \uD83C\uDF89';
        hint.style.color = '#00f7ff';
        if (bestScore == null || attempts < bestScore) { bestScore = attempts; localStorage.setItem('adminBestScore', bestScore); }
        const sd = document.getElementById('scoreDisplay');
        if (sd) sd.innerText = getBestDisplay();
    } else {
        hint.innerText = guess < secretNumber ? '\u2B06 Terlalu KECIL!' : '\u2B07 Terlalu BESAR!';
        hint.style.color = guess < secretNumber ? '#00f7ff' : '#ff0055';
    }
    input.value = '';
};

// ==========================================
// 6. GRADE SCANNER
// ==========================================
window.scanGrade = () => {
    const score = parseInt(document.getElementById('scoreInput').value);
    const result = document.getElementById('gradeResult');
    const status = document.getElementById('gradeStatus');
    if (isNaN(score)) { result.innerText='-'; status.innerText=''; return; }
    if (score>=85)      { result.innerText='A'; status.innerText='Excellent!';  status.style.color='#00f7ff'; }
    else if (score>=75) { result.innerText='B'; status.innerText='Good Job';    status.style.color='#00f7ff'; }
    else if (score>=60) { result.innerText='C'; status.innerText='Cukup';       status.style.color='#ffaa00'; }
    else                { result.innerText='D'; status.innerText='Gagal';       status.style.color='#ff0055'; }
};

// ==========================================
// 7. KASIR / DISKON TAB
// ==========================================
var kasirItems = [];
var membershipActive = false;
var MEMBERSHIP_PCT = 12;

function fRp(n) { return 'Rp ' + parseInt(n||0).toLocaleString('id-ID'); }

function renderKasir() {
    var totalHarga    = kasirItems.reduce(function(s,i){ return s + i.harga * i.qty; }, 0);
    var elPct         = document.getElementById('diskonPct');
    var diskonPct     = Math.min(Math.max(parseFloat(elPct ? elPct.value : 0)||0, 0), 100);
    var nominalDiskon = Math.floor(totalHarga * diskonPct / 100);
    var nominalMember = membershipActive ? Math.floor(totalHarga * MEMBERSHIP_PCT / 100) : 0;
    var totalDiskon   = Math.min(nominalDiskon + nominalMember, totalHarga);
    var totalBayar    = totalHarga - totalDiskon;

    var itemsHtml = kasirItems.length === 0
        ? '<p style="font-size:11px;opacity:0.3;text-align:center;padding:16px 0;">Belum ada barang</p>'
        : kasirItems.map(function(item, i) {
            return '<div style="display:flex;align-items:center;gap:6px;padding:5px 0;border-bottom:1px solid #1e1e1e;">' +
                '<div style="flex:1;min-width:0;"><div style="font-size:11px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + item.nama + '</div>' +
                '<div style="font-size:10px;color:#888;">' + fRp(item.harga) + ' \u00d7 ' + item.qty + '</div></div>' +
                '<div style="font-size:11px;font-weight:700;color:#00f7ff;white-space:nowrap;">' + fRp(item.harga * item.qty) + '</div>' +
                '<button onclick="hapusItem(' + i + ')" style="width:20px;height:20px;background:transparent;border:1px solid #ff0055;color:#ff0055;border-radius:4px;font-size:11px;cursor:pointer;padding:0;flex-shrink:0;">\u00d7</button></div>';
          }).join('');

    var diskonRowHtml = diskonPct > 0
        ? '<div style="display:flex;justify-content:space-between;margin-bottom:5px;"><span style="font-size:11px;opacity:0.6;">Diskon ' + diskonPct + '%</span><span style="font-size:12px;color:#ff0055;font-weight:600;">- ' + fRp(nominalDiskon) + '</span></div>' : '';
    var memberRowHtml = membershipActive
        ? '<div style="display:flex;justify-content:space-between;margin-bottom:5px;"><span style="font-size:11px;opacity:0.6;">\uD83D\uDCB3 Member ' + MEMBERSHIP_PCT + '%</span><span style="font-size:12px;color:#ff0055;font-weight:600;">- ' + fRp(nominalMember) + '</span></div>' : '';
    var hematHtml = totalDiskon > 0
        ? '<div style="text-align:center;margin-top:8px;"><span style="font-size:10px;background:rgba(var(--neon-rgb,0,247,255),0.1);border:1px solid rgba(var(--neon-rgb,0,247,255),0.3);border-radius:20px;padding:3px 10px;color:var(--neon,#00f7ff);">\uD83C\uDF89 Hemat ' + fRp(totalDiskon) + '!</span></div>' : '';

    var mbBorder = membershipActive ? '#00f7ff' : '#2a2a2a';
    var mbColor  = membershipActive ? '#00f7ff' : '#aaa';
    var mbDesc   = membershipActive ? '<span style="color:#00f7ff;font-weight:700;">-' + MEMBERSHIP_PCT + '%</span> aktif' : 'Aktifkan untuk hemat ' + MEMBERSHIP_PCT + '%';
    var toggleBg = membershipActive ? '#00f7ff' : '#333';
    var knobLeft = membershipActive ? '24px' : '2px';

    var shortcutBtns = ''; // dihapus

    area.innerHTML =
        '<div style="display:flex;flex-direction:column;gap:10px;width:100%;">' +

        // ── TAMBAH BARANG ──
        '<div style="background:#111;border:1px solid #222;border-radius:10px;padding:10px;">' +
            '<p style="font-size:10px;color:var(--neon,#00f7ff);letter-spacing:1px;margin-bottom:8px;font-weight:700;">\u2795 TAMBAH BARANG</p>' +
            '<div style="display:flex;flex-direction:column;gap:6px;margin-bottom:8px;">' +
                '<input id="itemNama" type="text" placeholder="Nama barang..." style="width:100%;height:36px;padding:0 10px;background:#0d0d0d;border:1px solid #2a2a2a;color:#fff;border-radius:8px;font-size:12px;outline:none;box-sizing:border-box;" onfocus="this.style.borderColor=\'var(--neon,#00f7ff)\'" onblur="this.style.borderColor=\'#2a2a2a\'">' +
                '<div style="display:grid;grid-template-columns:1fr 52px;gap:6px;">' +
                    '<input id="itemHarga" type="number" placeholder="Harga (Rp)" min="0" style="height:36px;padding:0 10px;background:#0d0d0d;border:1px solid #2a2a2a;color:#fff;border-radius:8px;font-size:12px;outline:none;width:100%;" onfocus="this.style.borderColor=\'var(--neon,#00f7ff)\'" onblur="this.style.borderColor=\'#2a2a2a\'">' +
                    '<input id="itemQty" type="number" placeholder="1" min="1" value="1" style="height:36px;padding:0 4px;background:#0d0d0d;border:1px solid #2a2a2a;color:#fff;border-radius:8px;font-size:13px;font-weight:700;outline:none;text-align:center;width:100%;" onfocus="this.style.borderColor=\'var(--neon,#00f7ff)\'" onblur="this.style.borderColor=\'#2a2a2a\'">' +
                '</div>' +
            '</div>' +
            '<button onclick="tambahItem()" style="width:100%;height:34px;background:var(--neon,#00f7ff);border:none;border-radius:8px;color:#000;font-size:12px;font-weight:700;cursor:pointer;letter-spacing:0.5px;">+ TAMBAH</button>' +
        '</div>' +

        // ── DISKON ──
        '<div style="background:#111;border:1px solid #222;border-radius:10px;padding:10px;">' +
            '<p style="font-size:10px;color:var(--neon,#00f7ff);letter-spacing:1px;margin-bottom:10px;font-weight:700;">\uD83C\uDFF7\uFE0F DISKON</p>' +
            '<div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;">' +
                '<div style="position:relative;flex:1;">' +
                    '<input id="diskonPct" type="text" inputmode="numeric" placeholder="0" oninput="updateStruk()" onfocus="this.style.borderColor=\'var(--neon,#00f7ff)\'" onblur="clampDiskon();updateStruk();this.style.borderColor=\'#2a2a2a\'" style="width:100%;height:44px;padding:0 36px 0 12px;background:#0d0d0d;border:1px solid #2a2a2a;color:var(--neon,#00f7ff);border-radius:8px;font-size:22px;font-weight:800;outline:none;text-align:center;box-sizing:border-box;">' +
                    '<span style="position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:16px;font-weight:800;color:var(--neon,#00f7ff);pointer-events:none;">%</span>' +
                '</div>' +
                '<button onclick="setDiskon(0)" style="height:44px;padding:0 14px;background:rgba(255,0,85,0.1);border:1px solid rgba(255,0,85,0.3);color:#ff0055;border-radius:8px;font-size:18px;font-weight:700;cursor:pointer;flex-shrink:0;">\u00d7</button>' +
            '</div>' +
        '</div>' +

        // ── MEMBERSHIP ──
        '<div style="background:#111;border:1px solid ' + mbBorder + ';border-radius:10px;padding:10px;transition:border-color .3s;">' +
            '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">' +
                '<div style="flex:1;min-width:0;">' +
                    '<p style="font-size:10px;color:' + mbColor + ';letter-spacing:1px;margin-bottom:2px;font-weight:700;">\uD83D\uDCB3 MEMBERSHIP</p>' +
                    '<p style="font-size:10px;color:#666;">' + mbDesc + '</p>' +
                '</div>' +
                '<div onclick="toggleMembership()" style="width:46px;height:26px;background:' + toggleBg + ';border-radius:13px;position:relative;cursor:pointer;flex-shrink:0;transition:background .3s;">' +
                    '<div style="width:22px;height:22px;background:#fff;border-radius:50%;position:absolute;top:2px;left:' + knobLeft + ';transition:left .3s;box-shadow:0 1px 4px rgba(0,0,0,.5);"></div>' +
                '</div>' +
            '</div>' +
        '</div>' +

        // ── LOG BELANJA ──
        '<div style="background:#111;border:1px solid #222;border-radius:10px;padding:10px;">' +
            '<p style="font-size:10px;color:var(--neon,#00f7ff);letter-spacing:1px;margin-bottom:8px;font-weight:700;">\uD83D\uDED2 BELANJA (' + kasirItems.length + ' item)</p>' +
            (kasirItems.length === 0
                ? '<p style="font-size:11px;color:#333;text-align:center;padding:12px 0;">Belum ada barang</p>'
                : itemsHtml) +
        '</div>' +

        // ── STRUK ──
        '<div id="kasirStruk" style="background:rgba(0,0,0,0.4);border:1px solid rgba(var(--neon-rgb,0,247,255),0.25);border-radius:10px;padding:12px;">' +
            '<p style="font-size:10px;color:var(--neon,#00f7ff);letter-spacing:1px;margin-bottom:10px;font-weight:700;">\uD83E\uDDFE STRUK</p>' +
            '<div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="font-size:11px;color:#666;">Subtotal</span><span style="font-size:12px;color:#fff;font-weight:600;">' + fRp(totalHarga) + '</span></div>' +
            diskonRowHtml + memberRowHtml +
            '<div style="height:1px;background:rgba(255,255,255,0.08);margin:8px 0;"></div>' +
            '<div style="display:flex;justify-content:space-between;align-items:center;">' +
                '<span style="font-size:13px;font-weight:800;color:var(--neon,#00f7ff);">TOTAL BAYAR</span>' +
                '<span style="font-size:18px;font-weight:900;color:var(--neon,#00f7ff);text-shadow:0 0 12px var(--neon,#00f7ff)44;">' + fRp(totalBayar) + '</span>' +
            '</div>' +
            hematHtml +
        '</div>' +

        // ── RESET ──
        '<button onclick="resetKasir()" style="width:100%;height:36px;background:transparent;border:1px solid #ff0055;color:#ff0055;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;letter-spacing:0.5px;">\uD83D\uDDD1 RESET BELANJA</button>' +

        '</div>';
}


window.updateStruk = function() {
    var elPct = document.getElementById('diskonPct');
    var raw = elPct ? elPct.value.replace(/[^0-9]/g,'') : '0';
    var diskonPct = Math.min(Math.max(parseInt(raw)||0, 0), 100);

    var totalHarga = kasirItems.reduce(function(s,i){ return s + i.harga * i.qty; }, 0);
    var nominalDiskon = Math.floor(totalHarga * diskonPct / 100);
    var nominalMember = membershipActive ? Math.floor(totalHarga * MEMBERSHIP_PCT / 100) : 0;
    var totalDiskon   = Math.min(nominalDiskon + nominalMember, totalHarga);
    var totalBayar    = totalHarga - totalDiskon;

    var diskonRowHtml = diskonPct > 0
        ? '<div style="display:flex;justify-content:space-between;margin-bottom:5px;"><span style="font-size:11px;opacity:0.6;">Diskon ' + diskonPct + '%</span><span style="font-size:12px;color:#ff0055;font-weight:600;">- ' + fRp(nominalDiskon) + '</span></div>' : '';
    var memberRowHtml = membershipActive
        ? '<div style="display:flex;justify-content:space-between;margin-bottom:5px;"><span style="font-size:11px;opacity:0.6;">\uD83D\uDCB3 Member ' + MEMBERSHIP_PCT + '%</span><span style="font-size:12px;color:#ff0055;font-weight:600;">- ' + fRp(nominalMember) + '</span></div>' : '';
    var hematHtml = totalDiskon > 0
        ? '<div style="text-align:center;margin-top:8px;"><span style="font-size:10px;background:rgba(var(--neon-rgb,0,247,255),0.1);border:1px solid rgba(var(--neon-rgb,0,247,255),0.3);border-radius:20px;padding:3px 10px;color:var(--neon,#00f7ff);">\uD83C\uDF89 Hemat ' + fRp(totalDiskon) + '!</span></div>' : '';

    var struk = document.getElementById('kasirStruk');
    if (struk) {
        struk.innerHTML =
            '<p style="font-size:10px;color:var(--neon,#00f7ff);letter-spacing:1px;margin-bottom:10px;font-weight:700;">\uD83E\uDDFE STRUK</p>' +
            '<div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="font-size:11px;color:#666;">Subtotal</span><span style="font-size:12px;color:#fff;font-weight:600;">' + fRp(totalHarga) + '</span></div>' +
            diskonRowHtml + memberRowHtml +
            '<div style="height:1px;background:rgba(255,255,255,0.08);margin:8px 0;"></div>' +
            '<div style="display:flex;justify-content:space-between;align-items:center;">' +
                '<span style="font-size:13px;font-weight:800;color:var(--neon,#00f7ff);">TOTAL BAYAR</span>' +
                '<span style="font-size:18px;font-weight:900;color:var(--neon,#00f7ff);text-shadow:0 0 12px var(--neon,#00f7ff)44;">' + fRp(totalBayar) + '</span>' +
            '</div>' +
            hematHtml;
    }
};
// slider dihapus, syncSlider/syncDiskonFromSlider tidak diperlukan
window.syncSlider = function() {};
window.syncDiskonFromSlider = function() {};
window.tambahItem = () => {
    var nama  = (document.getElementById('itemNama').value||'').trim();
    var harga = parseInt(document.getElementById('itemHarga').value)||0;
    var qty   = parseInt(document.getElementById('itemQty').value)||1;
    if (!nama||harga<=0) { alert('Nama dan harga wajib diisi!'); return; }
    kasirItems.push({ nama:nama, harga:harga, qty:qty });
    renderKasir();
};
window.hapusItem   = (i) => { kasirItems.splice(i,1); renderKasir(); };
window.setDiskon   = (p) => { var el=document.getElementById('diskonPct'); if(el){el.value=p>0?String(p):'';} updateStruk(); };
window.clampDiskon = () => { var el=document.getElementById('diskonPct'); if(!el||el.value==='') return; var v=parseInt(el.value.replace(/[^0-9]/g,''))||0; if(v>100)el.value='100'; else if(v<1)el.value=''; else el.value=String(v); };
window.toggleMembership = () => { membershipActive=!membershipActive; renderKasir(); };
window.resetKasir  = () => { kasirItems=[]; membershipActive=false; var el=document.getElementById('diskonPct'); if(el)el.value=''; renderKasir(); };
// ============================================================
//  NEON TYPER — Typing Space Shooter  (full rewrite)
//  Features: New Game, Highscore, Reset, Pause, Quit
//  Mobile: virtual keyboard + tap-to-target
// ============================================================
(function() {

function getNeon() {
    return getComputedStyle(document.documentElement).getPropertyValue('--neon').trim() || '#00f7ff';
}
function getNeonRGB() {
    var c = getNeon().replace('#','');
    if (c.length===3) c=c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
    return [parseInt(c.slice(0,2),16),parseInt(c.slice(2,4),16),parseInt(c.slice(4,6),16)];
}

var WORDS = [
    'neon','pixel','cyber','laser','orbit','spark','blaze','flash','surge','pulse',
    'storm','frost','glyph','prism','drift','nova','vortex','phase','zenith','apex',
    'flux','code','bit','byte','loop','func','null','void','true','false','class',
    'async','fetch','array','index','stack','hash','grep','sudo','root','bash',
    'html','css','api','git','push','fork','node','json','debug','error','scope',
    'admin','login','user','panel','score','game','wave','fire','blaze','turbo',
];
function randWord() { return WORDS[Math.floor(Math.random()*WORDS.length)]; }

// ── Global arrays (reset per game) ──
var particles=[], bullets=[], enemies=[], lasers=[], stars=[];
var enemyId=0;

function initStars(W,H) {
    stars=[];
    for(var i=0;i<130;i++) stars.push({
        x:Math.random()*W, y:Math.random()*H,
        r:Math.random()*1.5, spd:0.2+Math.random()*0.5, op:0.15+Math.random()*0.55
    });
}
function spawnExplosion(x,y,color,n) {
    for(var i=0;i<(n||18);i++){
        var a=Math.random()*Math.PI*2, s=1.5+Math.random()*3.5;
        particles.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,
            life:1,decay:0.022+Math.random()*0.03,size:2+Math.random()*3,color:color});
    }
}
function fireBullet(sx,sy,tx,ty){
    var dx=tx-sx,dy=ty-sy,d=Math.sqrt(dx*dx+dy*dy)||1;
    bullets.push({x:sx,y:sy,vx:dx/d*10,vy:dy/d*10,life:1});
}
function fireLaser(sx,sy,tx,ty){ lasers.push({sx:sx,sy:sy,tx:tx,ty:ty,life:1.4,fresh:true}); }
function spawnEnemy(W){
    var word=randWord();
    enemies.push({
        id:enemyId++, word:word, typed:0,
        x:55+Math.random()*(W-110), y:-45,
        vy:0.38+Math.random()*0.48, vx:(Math.random()-0.5)*0.45,
        size:20+word.length*2.5,
        pulse:Math.random()*Math.PI*2, shakeX:0, shakeTimer:0
    });
}

// ══════════════════════════════════════════
window.buildNeonTyperGame = function(container, saveScoreFn) {
    // cleanup old
    if(container._cleanupGame){ container._cleanupGame(); }
    container.innerHTML='';
    container.style.position='relative';
    container.style.overflow='hidden';
    container.style.userSelect='none';

    var W=container.clientWidth||360;
    var H=container.offsetHeight||container.clientHeight||460;
    if(H<400) H=460;

    var highscore = parseInt(localStorage.getItem('neonTyperBest')||'0');

    // ── Canvas ──
    var canvas=document.createElement('canvas');
    canvas.width=W; canvas.height=H;
    canvas.style.cssText='display:block;width:100%;height:100%;touch-action:none;';
    container.appendChild(canvas);
    var ctx=canvas.getContext('2d');

    // ── Control Bar (HTML overlay) ──
    var bar=document.createElement('div');
    bar.style.cssText='position:absolute;bottom:0;left:0;width:100%;display:flex;align-items:center;' +
        'justify-content:center;gap:6px;padding:6px 8px;background:rgba(0,0,0,0.7);' +
        'border-top:1px solid #222;box-sizing:border-box;z-index:10;flex-wrap:wrap;';
    container.appendChild(bar);

    function makeBtn(label, onclick) {
        var b=document.createElement('button');
        b.textContent=label;
        b.style.cssText='height:28px;padding:0 10px;background:transparent;border:1px solid #444;' +
            'color:#aaa;border-radius:5px;font-size:10px;font-weight:700;cursor:pointer;' +
            'font-family:monospace;letter-spacing:1px;touch-action:manipulation;' +
            '-webkit-tap-highlight-color:transparent;flex-shrink:0;';
        b.addEventListener('click', onclick);
        b.addEventListener('touchstart', function(e){ e.stopPropagation(); }, {passive:true});
        bar.appendChild(b);
        return b;
    }

    var hsLabel=document.createElement('span');
    hsLabel.style.cssText='font-size:9px;font-family:monospace;color:#555;letter-spacing:1px;flex:1;text-align:left;';
    hsLabel.textContent='BEST: '+(highscore||'---');
    bar.appendChild(hsLabel);

    var btnNew   = makeBtn('NEW',   function(){ doNewGame(); });
    var btnReset = makeBtn('RESET', function(){ doReset(); });
    var btnPause = makeBtn('PAUSE', function(){ doTogglePause(); });
    var btnQuit  = makeBtn('QUIT',  function(){ doQuit(); });

    function refreshBtnColors() {
        var n=getNeon();
        [btnNew,btnReset,btnPause,btnQuit].forEach(function(b){
            b.style.borderColor=n+'66';
            b.style.color=n;
        });
        hsLabel.style.color=n+'99';
        btnPause.textContent = (state==='paused') ? 'RESUME' : 'PAUSE';
    }

    // ── Mobile virtual input ──
    var mobileInput=document.createElement('input');
    mobileInput.type='text';
    mobileInput.autocomplete='off'; mobileInput.autocorrect='off';
    mobileInput.autocapitalize='none'; mobileInput.spellcheck=false;
    mobileInput.style.cssText='position:absolute;opacity:0;width:1px;height:1px;top:0;left:0;pointer-events:none;';
    container.appendChild(mobileInput);

    // Tap canvas di mobile → fokus input virtual keyboard
    canvas.addEventListener('touchstart', function(e){
        if(state==='menu'||state==='gameover') return;
        e.preventDefault();
        mobileInput.focus();
        // Tap to target: cari enemy terdekat ke titik tap
        var rect=canvas.getBoundingClientRect();
        var tx=(e.touches[0].clientX-rect.left)*(W/rect.width);
        var ty=(e.touches[0].clientY-rect.top)*(H/rect.height);
        var best=null, bestDist=9999;
        enemies.forEach(function(en){
            var d=Math.sqrt((en.x-tx)*(en.x-tx)+(en.y-ty)*(en.y-ty));
            if(d<bestDist&&d<en.size*3){ bestDist=d; best=en; }
        });
        if(best){ target=best; typedStr=''; }
    },{passive:false});

    // Input dari virtual keyboard mobile
    mobileInput.addEventListener('input', function(){
        var val=mobileInput.value.toLowerCase();
        mobileInput.value='';
        if(!val) return;
        for(var i=0;i<val.length;i++) processChar(val[i]);
    });

    // ── Game State ──
    var state='menu'; // menu | playing | paused | gameover
    var score=0, lives=3, wave=1;
    var target=null, typedStr='';
    var spawnTimer=0, spawnInterval=3200;
    var waveKills=0, waveGoal=8, maxEnemies=5;
    var combo=0, comboTimer=0;
    var waveBanner='', waveBannerTimer=0;
    var ship={x:W/2, y:H-70, tilt:0, thruster:0};
    var shipTrail=[];
    particles=[]; bullets=[]; enemies=[]; lasers=[]; stars=[];
    initStars(W,H);

    function resetAllState() {
        score=0; lives=3; wave=1; target=null; typedStr='';
        spawnTimer=0; spawnInterval=3200;
        waveKills=0; waveGoal=8; maxEnemies=5;
        combo=0; comboTimer=0; waveBanner=''; waveBannerTimer=0;
        ship={x:W/2, y:H-70, tilt:0, thruster:0};
        shipTrail=[];
        particles=[]; bullets=[]; enemies=[]; lasers=[];
        initStars(W,H);
    }

    function doNewGame() {
        resetAllState();
        state='playing';
        refreshBtnColors();
        mobileInput.focus();
    }
    function doReset() {
        resetAllState();
        state='playing';
        refreshBtnColors();
    }
    function doTogglePause() {
        if(state==='playing') { state='paused'; }
        else if(state==='paused') { state='playing'; last=performance.now(); }
        refreshBtnColors();
    }
    function doQuit() {
        if(state==='playing'||state==='paused'){
            if(score>0) { saveScore(score); }
        }
        resetAllState();
        state='menu';
        refreshBtnColors();
    }
    function saveScore(s) {
        if(s>highscore){
            highscore=s;
            localStorage.setItem('neonTyperBest', highscore);
            hsLabel.textContent='BEST: '+highscore;
            saveScoreFn && saveScoreFn(highscore);
        }
    }

    // ── Keyboard input ──
    function processChar(ch) {
        if(state!=='playing') return;
        if(!/[a-z0-9]/.test(ch)) return;

        if(target) {
            var expected=target.word[target.typed];
            if(ch===expected){
                target.typed++;
                target.shakeX=4; target.shakeTimer=6;
                fireLaser(ship.x, ship.y-20, target.x, target.y);
                fireBullet(ship.x, ship.y-20, target.x, target.y);
                ship.tilt=(target.x-ship.x)*0.03;
                if(target.typed>=target.word.length){
                    score+=target.word.length*10*(combo>2?2:1);
                    combo++; comboTimer=120;
                    spawnExplosion(target.x, target.y, getNeon());
                    enemies=enemies.filter(function(e){ return e.id!==target.id; });
                    waveKills++;
                    target=null; typedStr='';
                }
            } else {
                target.shakeX=8; target.shakeTimer=10;
                typedStr=''; combo=0;
            }
            return;
        }

        typedStr+=ch;
        var match=null;
        enemies.forEach(function(e){
            if(e.word.startsWith(typedStr))
                if(!match||e.y>match.y) match=e;
        });
        if(match){
            target=match;
            for(var j=0;j<typedStr.length;j++){
                if(target.word[target.typed]===typedStr[j]){
                    target.typed++;
                    fireLaser(ship.x, ship.y-20, target.x, target.y);
                }
            }
            if(target.typed>=target.word.length){
                score+=target.word.length*10*(combo>2?2:1);
                combo++; comboTimer=120;
                spawnExplosion(target.x, target.y, getNeon());
                enemies=enemies.filter(function(e){ return e.id!==target.id; });
                waveKills++;
                target=null; typedStr='';
            }
        } else {
            typedStr=ch;
        }
    }

    function onKey(e) {
        if(e.key==='Escape'){
            if(state==='playing'&&target){ target=null; typedStr=''; return; }
            if(state==='playing'||state==='paused'){ doTogglePause(); return; }
            target=null; typedStr=''; return;
        }
        if(e.key==='Enter'&&state==='menu') { doNewGame(); return; }
        if(e.key==='Enter'&&state==='gameover') { doNewGame(); return; }
        if(e.key.length!==1) return;
        processChar(e.key.toLowerCase());
    }
    document.addEventListener('keydown', onKey);

    // ── Draw helpers ──
    function drawShip(x,y,tilt){
        var neon=getNeon();
        ctx.save(); ctx.translate(x,y); ctx.rotate(tilt);
        if(ship.thruster>0){
            var tg=ctx.createLinearGradient(0,10,0,10+30*ship.thruster);
            tg.addColorStop(0,neon); tg.addColorStop(1,'transparent');
            ctx.globalAlpha=ship.thruster*0.8;
            ctx.beginPath(); ctx.moveTo(-8,14); ctx.lineTo(8,14);
            ctx.lineTo(0,14+30*ship.thruster); ctx.closePath();
            ctx.fillStyle=tg; ctx.fill();
        }
        ctx.globalAlpha=1;
        ctx.shadowColor=neon; ctx.shadowBlur=14;
        ctx.beginPath(); ctx.moveTo(0,-22); ctx.lineTo(14,14);
        ctx.lineTo(6,8); ctx.lineTo(-6,8); ctx.lineTo(-14,14); ctx.closePath();
        ctx.strokeStyle=neon; ctx.lineWidth=2; ctx.fillStyle='#0a0a0a';
        ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(0,-4,5,0,Math.PI*2);
        ctx.fillStyle=neon+'55'; ctx.fill();
        ctx.strokeStyle=neon; ctx.lineWidth=1; ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-14,14); ctx.lineTo(-10,0);
        ctx.moveTo(14,14);  ctx.lineTo(10,0);
        ctx.strokeStyle=neon+'88'; ctx.lineWidth=1; ctx.stroke();
        ctx.restore();
    }

    function drawEnemy(e){
        var neon=getNeon(), rgb=getNeonRGB();
        e.pulse+=0.05;
        var glow=8+Math.sin(e.pulse)*4;
        var sx=e.x+(e.shakeTimer>0?(Math.random()-0.5)*e.shakeX:0);
        if(e.shakeTimer>0) e.shakeTimer--;
        ctx.save(); ctx.translate(sx,e.y);
        ctx.beginPath();
        for(var i=0;i<6;i++){
            var a=(i/6)*Math.PI*2-Math.PI/6;
            var r=e.size*(0.92+Math.sin(e.pulse+i)*0.04);
            if(i===0) ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r);
            else       ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);
        }
        ctx.closePath();
        ctx.fillStyle='rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+',0.09)';
        ctx.strokeStyle=(e===target)?neon:neon+'66';
        ctx.lineWidth=(e===target)?2.5:1.5;
        ctx.shadowColor=neon; ctx.shadowBlur=(e===target)?glow:5;
        ctx.fill(); ctx.stroke();
        // HP bar
        ctx.shadowBlur=0;
        ctx.fillStyle='#1a1a1a';
        ctx.fillRect(-e.size*.7,e.size*.65,e.size*1.4,4);
        ctx.fillStyle=neon;
        ctx.fillRect(-e.size*.7,e.size*.65,e.size*1.4*(e.typed/e.word.length),4);
        // Word
        var typed_part=e.word.slice(0,e.typed);
        var rest_part=e.word.slice(e.typed);
        var fs=Math.min(13,Math.max(9,e.size*0.52));
        ctx.font='bold '+fs+'px monospace';
        ctx.textAlign='center'; ctx.textBaseline='middle';
        var totalW=ctx.measureText(e.word).width;
        var typedW=ctx.measureText(typed_part).width;
        var restW=ctx.measureText(rest_part).width;
        var startX=-totalW/2;
        if(typed_part){
            ctx.fillStyle='#ffffff'; ctx.shadowColor='#fff'; ctx.shadowBlur=4;
            ctx.fillText(typed_part, startX+typedW/2, 0);
        }
        ctx.fillStyle=(e===target)?neon:neon+'88';
        ctx.shadowColor=neon; ctx.shadowBlur=(e===target)?8:3;
        ctx.fillText(rest_part, startX+typedW+restW/2, 0);
        ctx.restore();
    }

    function drawHUD(){
        var neon=getNeon();
        ctx.save();
        // Score
        ctx.font='bold 11px monospace'; ctx.fillStyle=neon;
        ctx.shadowColor=neon; ctx.shadowBlur=8;
        ctx.textAlign='left'; ctx.textBaseline='top';
        ctx.fillText('SCORE '+score, 10, 10);
        ctx.textAlign='right';
        ctx.fillText('WAVE '+wave, W-10, 10);
        // Lives
        ctx.textAlign='left';
        ctx.fillText('LIVES', 10, 26);
        for(var i=0;i<3;i++){
            ctx.fillStyle=i<lives?neon:'#2a2a2a';
            ctx.shadowColor=i<lives?neon:'transparent';
            ctx.beginPath();
            ctx.moveTo(60+i*18,26); ctx.lineTo(66+i*18,38); ctx.lineTo(54+i*18,38);
            ctx.closePath(); ctx.fill();
        }
        // Highscore
        ctx.textAlign='center'; ctx.font='bold 9px monospace';
        ctx.fillStyle=neon+'77'; ctx.shadowBlur=0;
        ctx.fillText('BEST '+highscore, W/2, 10);
        // Combo
        if(combo>1&&comboTimer>0){
            ctx.globalAlpha=comboTimer/120;
            ctx.font='bold '+(11+Math.min(combo,8))+'px monospace';
            ctx.fillStyle='#fff'; ctx.shadowColor=neon; ctx.shadowBlur=18;
            ctx.fillText('COMBO x'+combo+'!', W/2, 42);
        }
        // Typing indicator
        if(typedStr&&!target){
            ctx.globalAlpha=0.6; ctx.font='11px monospace';
            ctx.fillStyle=neon; ctx.shadowBlur=6;
            ctx.fillText(typedStr+'_', W/2, H-50);
        }
        // Wave progress bar
        ctx.globalAlpha=0.5; ctx.shadowBlur=0;
        ctx.fillStyle='#1a1a1a'; ctx.fillRect(0,H-44,W,3);
        ctx.fillStyle=neon; ctx.globalAlpha=0.8;
        ctx.fillRect(0,H-44,W*Math.min(waveKills/waveGoal,1),3);
        ctx.restore();
    }

    function drawPause(){
        var neon=getNeon();
        ctx.save();
        ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(0,0,W,H);
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.font='bold 24px monospace'; ctx.fillStyle=neon;
        ctx.shadowColor=neon; ctx.shadowBlur=25;
        ctx.fillText('PAUSED', W/2, H/2-20);
        ctx.font='11px monospace'; ctx.fillStyle='#666'; ctx.shadowBlur=0;
        ctx.fillText('tekan P atau tombol RESUME', W/2, H/2+14);
        ctx.restore();
    }

    function drawMenu(){
        var neon=getNeon();
        ctx.save();
        ctx.fillStyle='rgba(0,0,0,0.82)'; ctx.fillRect(0,0,W,H);
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.shadowColor=neon; ctx.shadowBlur=30;
        ctx.fillStyle=neon;
        ctx.font='bold 26px monospace'; ctx.fillText('NEON TYPER', W/2, H/2-60);
        ctx.shadowBlur=0;
        ctx.font='11px monospace'; ctx.fillStyle='#555';
        ctx.fillText('Ketik kata di musuh untuk menembak', W/2, H/2-28);
        ctx.fillText('ESC = pause / lepas target', W/2, H/2-10);
        ctx.fillText('Tap musuh (HP) untuk target di HP', W/2, H/2+8);
        // big new game button
        var bw=160,bh=38,bx=W/2-bw/2,by=H/2+30;
        ctx.shadowColor=neon; ctx.shadowBlur=15;
        ctx.strokeStyle=neon; ctx.lineWidth=2;
        ctx.strokeRect(bx,by,bw,bh);
        ctx.fillStyle=neon+'22'; ctx.fillRect(bx,by,bw,bh);
        ctx.font='bold 13px monospace'; ctx.fillStyle=neon; ctx.shadowBlur=10;
        ctx.fillText('NEW GAME', W/2, by+bh/2);
        // highscore
        ctx.font='10px monospace'; ctx.fillStyle=neon+'88'; ctx.shadowBlur=0;
        ctx.fillText('HIGHSCORE: '+(highscore||'---'), W/2, H/2+90);
        ctx.font='9px monospace'; ctx.fillStyle='#333';
        ctx.fillText('[ ENTER atau klik NEW GAME ]', W/2, H/2+112);
        ctx.restore();
    }

    function drawGameOver(){
        var neon=getNeon();
        ctx.save();
        ctx.fillStyle='rgba(0,0,0,0.78)'; ctx.fillRect(0,0,W,H);
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.shadowColor='#ff2244'; ctx.shadowBlur=30;
        ctx.fillStyle='#ff2244';
        ctx.font='bold 26px monospace'; ctx.fillText('GAME OVER', W/2, H/2-55);
        ctx.shadowColor=neon; ctx.shadowBlur=15;
        ctx.fillStyle=neon;
        ctx.font='bold 15px monospace'; ctx.fillText('SCORE: '+score, W/2, H/2-18);
        var isNew=(score>0&&score>=highscore);
        if(isNew){
            ctx.fillStyle='#ffdd00'; ctx.shadowColor='#ffdd00'; ctx.shadowBlur=20;
            ctx.font='bold 12px monospace'; ctx.fillText('NEW HIGHSCORE!', W/2, H/2+6);
        }
        ctx.font='10px monospace'; ctx.fillStyle=neon+'88'; ctx.shadowBlur=0;
        ctx.fillText('BEST: '+highscore, W/2, H/2+26);
        // Buttons hint
        ctx.font='10px monospace'; ctx.fillStyle='#444';
        ctx.fillText('tekan NEW untuk main lagi', W/2, H/2+54);
        ctx.restore();
    }

    function drawWaveBanner(txt){
        var neon=getNeon();
        ctx.save(); ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.font='bold 18px monospace'; ctx.fillStyle=neon;
        ctx.shadowColor=neon; ctx.shadowBlur=20;
        ctx.globalAlpha=Math.min(waveBannerTimer/30,1);
        ctx.fillText(txt, W/2, H/2); ctx.restore();
    }

    // ── Click on canvas (menu new game button) ──
    canvas.addEventListener('click', function(e){
        if(state==='menu'||state==='gameover'){
            doNewGame(); return;
        }
    });

    // ── Update ──
    function update(dt){
        if(state!=='playing') return;
        // Stars
        stars.forEach(function(s){
            s.y+=s.spd; if(s.y>H){s.y=0;s.x=Math.random()*W;}
        });
        // Ship trail
        shipTrail.push({x:ship.x,y:ship.y});
        if(shipTrail.length>14) shipTrail.shift();
        ship.tilt*=0.9;
        ship.thruster=Math.min(Math.abs(ship.tilt)*2,1);
        // Spawn
        spawnTimer+=dt;
        if(spawnTimer>=spawnInterval&&enemies.length<maxEnemies){
            spawnTimer=0; spawnEnemy(W);
            if(spawnInterval>900) spawnInterval-=28;
        }
        // Move enemies
        for(var i=enemies.length-1;i>=0;i--){
            var en=enemies[i];
            en.x+=en.vx; en.y+=en.vy;
            if(en.x<en.size){en.x=en.size;en.vx*=-1;}
            if(en.x>W-en.size){en.x=W-en.size;en.vx*=-1;}
            if(en.y>H+10){
                spawnExplosion(en.x,H-20,'#ff3355',10);
                enemies.splice(i,1);
                if(en===target){target=null;typedStr='';}
                lives--; combo=0;
                if(lives<=0){ state='gameover'; saveScore(score); refreshBtnColors(); }
            }
        }
        // Bullets
        for(var i=bullets.length-1;i>=0;i--){
            bullets[i].x+=bullets[i].vx; bullets[i].y+=bullets[i].vy;
            bullets[i].life-=0.03;
            if(bullets[i].life<=0||bullets[i].y<0) bullets.splice(i,1);
        }
        // Lasers
        for(var i=lasers.length-1;i>=0;i--){
            if(lasers[i].fresh){ lasers[i].fresh=false; continue; } // skip decay frame pertama
            lasers[i].life-=0.14;
            if(lasers[i].life<=0) lasers.splice(i,1);
        }
        // Particles
        for(var i=particles.length-1;i>=0;i--){
            var p=particles[i];
            p.x+=p.vx; p.y+=p.vy; p.vy+=0.04;
            p.life-=p.decay;
            if(p.life<=0) particles.splice(i,1);
        }
        // Combo
        if(comboTimer>0){comboTimer--;if(comboTimer<=0)combo=0;}
        // Wave
        if(waveKills>=waveGoal){
            waveKills=0; wave++;
            waveGoal=8+wave*2;
            maxEnemies=Math.min(10,4+wave);
            spawnInterval=Math.max(850,3200-wave*170);
            waveBanner='— WAVE '+wave+' —'; waveBannerTimer=90;
        }
        if(waveBannerTimer>0) waveBannerTimer--;
    }

    // ── Render ──
    function render(){
        ctx.clearRect(0,0,W,H);
        ctx.fillStyle='#040408'; ctx.fillRect(0,0,W,H);
        // Stars
        stars.forEach(function(s){
            ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
            ctx.fillStyle='rgba(255,255,255,'+s.op+')'; ctx.fill();
        });
        if(state==='menu'){ drawMenu(); return; }
        // Ship trail
        var neon=getNeon();
        shipTrail.forEach(function(t,i){
            ctx.beginPath(); ctx.arc(t.x,t.y,(i/shipTrail.length)*3,0,Math.PI*2);
            ctx.fillStyle=neon; ctx.globalAlpha=(i/shipTrail.length)*0.18; ctx.fill();
        });
        ctx.globalAlpha=1;
        // Lasers
        lasers.forEach(function(l){
            ctx.save(); ctx.globalAlpha=Math.min(l.life*0.95, 1);
            ctx.strokeStyle=neon; ctx.lineWidth=2.5;
            ctx.shadowColor=neon; ctx.shadowBlur=18;
            ctx.beginPath(); ctx.moveTo(l.sx,l.sy); ctx.lineTo(l.tx,l.ty); ctx.stroke();
            ctx.restore();
        });
        // Bullets
        ctx.shadowColor=neon; ctx.shadowBlur=10; ctx.fillStyle='#fff';
        bullets.forEach(function(b){
            ctx.beginPath(); ctx.arc(b.x,b.y,2.5,0,Math.PI*2); ctx.fill();
        });
        ctx.shadowBlur=0;
        // Particles
        particles.forEach(function(p){
            ctx.save(); ctx.globalAlpha=p.life*0.85;
            ctx.fillStyle=p.color; ctx.shadowColor=p.color; ctx.shadowBlur=8;
            ctx.beginPath(); ctx.arc(p.x,p.y,p.size*p.life,0,Math.PI*2); ctx.fill();
            ctx.restore();
        });
        enemies.forEach(drawEnemy);
        drawShip(ship.x,ship.y,ship.tilt);
        drawHUD();
        if(waveBannerTimer>0) drawWaveBanner(waveBanner);
        if(state==='paused') drawPause();
        if(state==='gameover') drawGameOver();
    }

    // ── Loop ──
    var last=performance.now(), animId;
    function loop(ts){
        var dt=ts-last; last=ts;
        if(dt>100) dt=100;
        render(); update(dt);
        animId=requestAnimationFrame(loop);
    }
    animId=requestAnimationFrame(loop);

    refreshBtnColors();

    // ── Cleanup ──
    function cleanupGame(){
        cancelAnimationFrame(animId);
        document.removeEventListener('keydown',onKey);
        particles=[]; bullets=[]; enemies=[]; lasers=[]; stars=[];
        container.innerHTML='';
        container._cleanupGame=null;
    }
    container._cleanupGame=cleanupGame;
};

})();
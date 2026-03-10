// ==========================================
// 1. ELEMEN GLOBAL
// ==========================================
const loginForm = document.getElementById('login-form');
const regContent = document.getElementById('register-content');
const forgotContent = document.getElementById('forgot-content');
const title = document.getElementById('login-title');

// Helper: ambil & simpan DB users (format: { username: { pass, bestScore } })
function getDB() {
    return JSON.parse(localStorage.getItem('usersDB')) || {};
}
function saveDB(db) {
    localStorage.setItem('usersDB', JSON.stringify(db));
}

// ==========================================
// 2. LOGIKA LOGIN
// ==========================================
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const user = (loginForm.querySelector('input[type="text"]') || loginForm.querySelectorAll('input')[1]).value.trim();
    const pass = (loginForm.querySelector('input[type="password"]') || loginForm.querySelectorAll('input')[2]).value.trim();
    const db = getDB();

    if (user.toLowerCase() === "admin" && pass === "12345") {
        localStorage.setItem('sessionUser', "Admin Fariz");
        localStorage.setItem('sessionRole', "admin");
        alert("Welcome Back, Admin!");
        window.location.href = 'admin.html';
    }
    else if (db[user] && db[user].pass === pass) {
        localStorage.setItem('sessionUser', user);
        localStorage.setItem('sessionRole', "user");
        alert("Login Berhasil!");
        window.location.href = 'user.html';
    }
    else {
        alert("ID atau Password Salah!");
    }
});

// ==========================================
// 3. LOGIKA REGISTRASI
// ==========================================
window.handleRegister = () => {
    const u = document.getElementById('reg-user').value.trim();
    const p = document.getElementById('reg-pass').value.trim();

    if (!u || !p) return alert("Jangan dikosongin!");
    if (u.toLowerCase() === "admin") return alert("ID 'admin' tidak bisa dipakai!");

    let db = getDB();
    if (db[u]) return alert("ID sudah terdaftar!");

    db[u] = { pass: p, bestScore: null };
    saveDB(db);

    alert("Registrasi Berhasil! Silahkan Login.");
    window.backToLogin();
};

// ==========================================
// 4. NAVIGASI UI
// ==========================================
window.showRegister = () => {
    document.querySelectorAll('.auth-field').forEach(el => el.style.display = 'none');
    forgotContent.style.display = 'none';
    regContent.style.display = 'flex';
    title.innerText = "SIGN UP";
};

window.showForgot = () => {
    document.querySelectorAll('.auth-field').forEach(el => el.style.display = 'none');
    regContent.style.display = 'none';
    forgotContent.style.display = 'flex';
    title.innerText = "RECOVERY";
};

window.backToLogin = () => {
    regContent.style.display = 'none';
    forgotContent.style.display = 'none';
    document.querySelectorAll('.auth-field').forEach(el => el.style.display = 'flex');
    title.innerText = "Login";
};

// ==========================================
// 5. RECOVERY PASSWORD
// ==========================================
window.handleRecover = () => {
    const u = document.getElementById('forgot-user').value.trim();
    const db = getDB();

    if (db[u]) {
        alert("Password lu adalah: " + db[u].pass);
        window.backToLogin();
    } else {
        alert("ID tidak ditemukan!");
    }
};

// ==========================================
// 6. NEON TOGGLE (LOGIN PAGE)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const checkbox = document.getElementById('input-check');
    const box = document.querySelector('.login-box');
    if (!checkbox || !box) return;
    // State sudah di-restore oleh inline script di index.html
    // Script ini hanya listen perubahan desktop checkbox
    checkbox.addEventListener('change', () => {
        box.classList.toggle('neon-on', checkbox.checked);
        localStorage.setItem('neonState', checkbox.checked ? 'on' : 'off');
    });
});
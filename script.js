/* ============================================================
   ГЛОБАЛЬНАЯ НАВИГАЦИЯ: сайт ↔ успеваемость
   ============================================================ */
function showPerfApp() {
  document.getElementById('publicSite').style.display = 'none';
  document.getElementById('perfApp').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'auto' });
}
function showPublicSite() {
  if (window.__dtpaExitAdmin) window.__dtpaExitAdmin();
  document.getElementById('perfApp').style.display = 'none';
  document.getElementById('publicSite').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'auto' });
}

/* ============================================================
   ПУБЛИЧНЫЙ САЙТ
   ============================================================ */
(function () {
document.addEventListener('DOMContentLoaded', function () {

  const STORAGE_KEY = 'dontpa-theme';
  const toggleBtns = document.querySelectorAll('.theme-toggle');

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  } catch (e) {}

  function updateIcons() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    toggleBtns.forEach(btn => {
      btn.title = isDark ? 'Светлая тема' : 'Тёмная тема';
      btn.setAttribute('aria-label', btn.title);
    });
  }
  updateIcons();

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      const cur = document.documentElement.getAttribute('data-theme');
      const next = cur === 'dark' ? 'light' : 'dark';
      if (next === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
      else document.documentElement.removeAttribute('data-theme');
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
      updateIcons();
    });
  });

  const pushArea = document.getElementById('push-area');
  const PUSH_ICONS = { success:'✅', error:'❌', info:'ℹ️', code:'🔐' };
  function push(message, type, duration) {
    if (!pushArea) return;
    const el = document.createElement('div');
    el.className = 'push push--' + (type || 'info');
    el.innerHTML =
      '<span class="push__icon">' + (PUSH_ICONS[type] || 'ℹ️') + '</span>' +
      '<span class="push__text">' + message + '</span>';
    pushArea.appendChild(el);
    setTimeout(() => {
      el.classList.add('push--out');
      setTimeout(() => el.remove(), 350);
    }, duration || 3200);
  }
  window.__dtpaPush = push;

  const pages = document.querySelectorAll('#publicSite .page');
  const navLinks = document.querySelectorAll('#mainNav a');

  function showPage(name) {
    pages.forEach(p => p.classList.toggle('active', p.id === 'page-' + name));
    navLinks.forEach(a => a.classList.toggle('active', a.dataset.page === name));
    window.scrollTo({ top: 0, behavior: 'auto' });
    requestAnimationFrame(() => {
      document.querySelectorAll('#publicSite .page.active .fade-in').forEach(el => {
        el.classList.remove('visible');
        void el.offsetWidth;
        el.classList.add('visible');
      });
    });
  }
  window.DTPA_navigate = showPage;

  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      showPage(this.dataset.page);
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('#publicSite .fade-in').forEach(el => observer.observe(el));

  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', function () {
      const item = this.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  const loadMoreBtn = document.getElementById('load-more');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function () {
      this.textContent = 'Загрузка...';
      this.disabled = true;
      setTimeout(() => {
        this.textContent = 'Показать ещё новости';
        this.disabled = false;
      }, 800);
    });
  }

  const scheduleTabs = document.querySelectorAll('.schedule-tab');
  const schedulePanes = document.querySelectorAll('.schedule-pane');
  scheduleTabs.forEach(tab => {
    tab.addEventListener('click', function () {
      const course = this.dataset.course;
      scheduleTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      schedulePanes.forEach(p => p.classList.remove('active'));
      const activePane = document.getElementById('course-' + course);
      if (activePane) activePane.classList.add('active');
    });
  });

  const docForm = document.getElementById('doc-form');
  if (docForm) {
    docForm.addEventListener('submit', function (e) {
      e.preventDefault();
      let valid = true;
      this.querySelectorAll('[required]').forEach(field => {
        if (field.type === 'checkbox') {
          if (!field.checked) { valid = false; field.style.outline = '2px solid red'; }
          else field.style.outline = '';
        } else if (field.type === 'file') {
          if (!field.files || field.files.length === 0) { valid = false; field.style.borderColor = 'red'; }
          else field.style.borderColor = '';
        } else {
          if (!field.value.trim()) { valid = false; field.style.borderColor = 'red'; }
          else field.style.borderColor = '';
        }
      });
      if (!valid) { push('Заполните все обязательные поля и прикрепите документы.', 'error'); return; }
      let tooLarge = false;
      this.querySelectorAll('input[type="file"]').forEach(input => {
        if (input.files) {
          for (let f of input.files) {
            if (f.size > 5 * 1024 * 1024) { tooLarge = true; input.style.borderColor = 'red'; }
          }
        }
      });
      if (tooLarge) { push('Один или несколько файлов больше 5 МБ.', 'error'); return; }
      push('Документы успешно отправлены! Приёмная комиссия свяжется с вами в течение 3 рабочих дней.', 'success');
    });
    docForm.querySelectorAll('input, select, textarea').forEach(el => {
      el.addEventListener('input', function () { this.style.borderColor = ''; this.style.outline = ''; });
      el.addEventListener('change', function () { this.style.borderColor = ''; this.style.outline = ''; });
    });
  }

  document.querySelectorAll('#publicSite a[href^="#"], #publicSite [data-scroll]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href') || '';
      if (!href.startsWith('#') || href.length < 2) return;
      const target = document.querySelector(href);
      if (target && target.closest('#publicSite')) {
        e.preventDefault();
        const headerOffset = 90;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    });
  });

  const sections = document.querySelectorAll('#page-info .content-block');
  const subnavLinks = document.querySelectorAll('.subnav a');
  const sidebarLinks = document.querySelectorAll('#page-info .sidebar-card nav a[href^="#"]');

  function updateActiveLink() {
    const infoPage = document.getElementById('page-info');
    if (!infoPage || !infoPage.classList.contains('active')) return;
    if (document.getElementById('publicSite').style.display === 'none') return;
    let current = '';
    const scrollPos = window.scrollY + 180;
    sections.forEach(section => {
      if (section.offsetTop <= scrollPos) current = section.getAttribute('id');
    });
    subnavLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === '#' + current));
    sidebarLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === '#' + current));
  }
  window.addEventListener('scroll', updateActiveLink);
  updateActiveLink();

  const views = {
    register: document.getElementById('register-view'),
    login: document.getElementById('login-view'),
    forgot: document.getElementById('forgot-view'),
    code: document.getElementById('code-view'),
    success: document.getElementById('success-view')
  };

  function showView(name) {
    Object.keys(views).forEach(k => {
      if (views[k]) views[k].hidden = (k !== name);
    });
  }

  const bindClick = (id, view) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', function (e) {
      e.preventDefault();
      showView(view);
    });
  };
  bindClick('show-login', 'login');
  bindClick('show-register', 'register');
  bindClick('show-forgot', 'forgot');
  bindClick('back-to-login-1', 'login');
  bindClick('back-to-phone', 'forgot');
  bindClick('go-to-login', 'login');

  const AUTH_USERS_KEY = 'dontpa-accounts-v1';
  const CURRENT_USER_KEY = 'dontpa-user';
  const profileOverlay = document.getElementById('profileOverlay');
  const profileBody = document.getElementById('profileBody');
  const profileClose = document.getElementById('profileClose');

  let memoryAccounts = [];
  let memorySession = null;
  let authStorageWarningShown = false;
  function readAccounts() {
    try {
      const raw = localStorage.getItem(AUTH_USERS_KEY);
      if (raw == null) return memoryAccounts;
      const value = JSON.parse(raw);
      if (Array.isArray(value)) { memoryAccounts = value; return value; }
      return memoryAccounts;
    } catch (e) { return memoryAccounts; }
  }
  function writeAccounts(accounts) {
    try {
      const serialized = JSON.stringify(accounts);
      localStorage.setItem(AUTH_USERS_KEY, serialized);
      const saved = JSON.parse(localStorage.getItem(AUTH_USERS_KEY) || 'null');
      if (!Array.isArray(saved) || saved.length !== accounts.length) {
        throw new Error('Проверка сохранённых аккаунтов не пройдена.');
      }
      memoryAccounts = saved;
      return true;
    } catch (e) {
      if (!authStorageWarningShown) {
        push('Не удалось сохранить регистрацию в браузере.', 'error', 7000);
        authStorageWarningShown = true;
      }
      return false;
    }
  }
  function getCurrentUser() {
    try {
      const value = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null');
      if (value && value.registered) { memorySession = value; return value; }
      return memorySession;
    } catch (e) { return memorySession; }
  }
  function setCurrentUser(account) {
    const session = {
      registered: true,
      name: account.name || account.email,
      email: account.email || '',
      phone: account.phone || '',
      role: account.role || 'student',
      group: account.group || '',
      avatar: account.avatar || '🧑‍🎓',
      registeredAt: account.registeredAt || Date.now(),
      lastLogin: Date.now()
    };
    memorySession = session;
    try { localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(session)); }
    catch (e) {
      if (!authStorageWarningShown) {
        push('Вход действует только до закрытия страницы.', 'error', 6000);
        authStorageWarningShown = true;
      }
    }
    updateUserStatus();
    return true;
  }
  function clearCurrentUser() {
    memorySession = null;
    try { localStorage.removeItem(CURRENT_USER_KEY); } catch (e) {}
    updateUserStatus();
  }
  function normalizePhone(value) { return String(value || '').replace(/\D/g, ''); }
  function createSalt() {
    const bytes = new Uint8Array(16);
    if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(bytes);
    else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    return Array.from(bytes, n => n.toString(16).padStart(2, '0')).join('');
  }
  async function hashPassword(password, salt) {
    const payload = String(salt) + ':' + String(password);
    if (window.crypto && window.crypto.subtle && window.TextEncoder) {
      const bytes = new TextEncoder().encode(payload);
      const digest = await window.crypto.subtle.digest('SHA-256', bytes);
      return 'sha256:' + Array.from(new Uint8Array(digest), n => n.toString(16).padStart(2, '0')).join('');
    }
    let h1 = 2166136261, h2 = 2246822519, h3 = 3266489917, h4 = 668265263;
    for (let i = 0; i < payload.length; i++) {
      const c = payload.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 16777619) >>> 0;
      h2 = Math.imul(h2 ^ (c + i), 3266489917) >>> 0;
      h3 = Math.imul(h3 ^ (c * 3), 668265263) >>> 0;
      h4 = Math.imul(h4 ^ (c + 17), 2246822519) >>> 0;
    }
    return 'demo:' + [h1,h2,h3,h4].map(n => n.toString(16).padStart(8, '0')).join('');
  }
  function safeProfileText(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }
  function updateUserStatus() {
    const user = getCurrentUser();
    document.querySelectorAll('[data-user-status]').forEach(btn => {
      const icon = btn.querySelector('.user-status__icon');
      const label = btn.querySelector('.user-status__label');
      btn.classList.toggle('registered', !!user);
      if (icon) icon.textContent = user ? (user.avatar || '✅') : '👤';
      if (label) label.textContent = user ? ((user.name || 'Профиль').trim().split(/\s+/)[0] || 'Профиль') : 'Войти';
      btn.title = user ? ('Вы вошли как ' + (user.name || user.email || 'пользователь')) : 'Войти или зарегистрироваться';
      btn.setAttribute('aria-label', btn.title);
    });
  }
  function closeProfile() {
    if (profileOverlay) profileOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  function openProfile() {
    if (!profileOverlay || !profileBody) return;
    const user = getCurrentUser();
    if (!user) {
      profileBody.innerHTML = `
        <p style="text-align:center;line-height:1.6;margin:0;">Вы ещё не вошли в аккаунт. Войдите или зарегистрируйтесь, чтобы открыть личный профиль.</p>
        <div class="profile-actions">
          <button type="button" class="btn-cta" data-profile-action="register">Регистрация</button>
          <button type="button" class="btn-cta btn-cta-secondary" data-profile-action="login">Войти</button>
        </div>
        <p class="profile-dialog__note">Это демонстрационная версия: аккаунты хранятся в браузере на этом устройстве.</p>`;
      profileBody.querySelectorAll('[data-profile-action]').forEach(btn => btn.addEventListener('click', () => {
        const view = btn.dataset.profileAction;
        closeProfile();
        showPage('register');
        showView(view);
      }));
    } else {
      const roleNames = {student:'Студент', teacher:'Преподаватель', admin:'Администратор'};
      profileBody.innerHTML = `
        <div style="text-align:center;margin-bottom:18px;">
          <div style="font-size:2.6rem;margin-bottom:8px;">${safeProfileText(user.avatar || '🧑‍🎓')}</div>
          <div style="font-weight:800;font-size:1.15rem;color:var(--color-primary);">${safeProfileText(user.name || 'Пользователь')}</div>
          <div style="font-size:.92rem;opacity:.75;">${safeProfileText(user.email || '')}</div>
          ${user.phone ? `<div style="font-size:.88rem;opacity:.75;">${safeProfileText(user.phone)}</div>` : ''}
        </div>
        <div style="border-radius:12px;background:rgba(46,139,46,.08);border:1px solid rgba(46,139,46,.22);padding:12px 14px;line-height:1.7;">
          <div><strong>Статус:</strong> аккаунт активен</div>
          <div><strong>Роль:</strong> ${safeProfileText(roleNames[user.role] || roleNames.student)}</div>
          ${user.group ? `<div><strong>Группа:</strong> ${safeProfileText(user.group)}</div>` : ''}
        </div>
        <div class="profile-actions"><button type="button" class="btn-cta" id="profilePerfBtn">📊 Перейти к успеваемости</button><button type="button" class="btn-cta btn-cta-secondary" id="profileLogoutBtn">🚪 Выйти</button></div>
        <p class="profile-dialog__note">Профиль работает локально.</p>`;
      const perfBtn = document.getElementById('profilePerfBtn');
      if (perfBtn) perfBtn.addEventListener('click', () => { closeProfile(); showPerfApp(); });
      const logoutBtn = document.getElementById('profileLogoutBtn');
      if (logoutBtn) logoutBtn.addEventListener('click', () => { clearCurrentUser(); closeProfile(); push('Вы вышли из аккаунта.', 'info'); });
    }
    profileOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  /* ==== ИСПРАВЛЕНИЕ: делегирование клика для кнопки «Войти» ==== */
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-user-status]');
    if (btn) {
      e.preventDefault();
      openProfile();
    }
  });

  if (profileClose) profileClose.addEventListener('click', closeProfile);
  if (profileOverlay) profileOverlay.addEventListener('click', e => { if (e.target === profileOverlay) closeProfile(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && profileOverlay && profileOverlay.classList.contains('open')) closeProfile(); });
  updateUserStatus();

  let recoveryCode = '';
  let recoveryPhone = '';
  function generateRecoveryCode() { return String(Math.floor(1000 + Math.random() * 9000)); }
  function sendRecoveryCode(phone, code) {
    const html =
      '<strong>Код подтверждения</strong>' +
      '<div style="font-size:0.82rem;opacity:0.7;margin-top:2px;">для номера ' + phone + '</div>' +
      '<div style="margin-top:10px;font-size:1.7rem;font-weight:800;letter-spacing:8px;' +
      'color:#0066CC;text-align:center;background:rgba(0,102,204,0.08);' +
      'border-radius:10px;padding:10px 0;font-family:monospace;">' + code + '</div>';
    push(html, 'code', 10000);
  }

  const phoneForm = document.getElementById('phone-form');
  const codePhone = document.getElementById('code-phone');
  if (phoneForm) {
    phoneForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const phone = document.getElementById('recover-phone').value.trim();
      if (!phone) { push('Введите номер телефона.', 'error'); return; }
      const account = readAccounts().find(a => normalizePhone(a.phone) === normalizePhone(phone) && normalizePhone(phone));
      if (!account) { push('Аккаунт с таким номером не найден.', 'error', 5000); return; }
      recoveryPhone = phone;
      if (codePhone) codePhone.textContent = phone;
      recoveryCode = generateRecoveryCode();
      sendRecoveryCode(phone, recoveryCode);
      setTimeout(() => showView('code'), 400);
    });
  }

  const codeForm = document.getElementById('code-form');
  if (codeForm) {
    codeForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const code = ['d1','d2','d3','d4']
        .map(id => (document.getElementById(id) || {}).value || '')
        .join('');
      const p1 = document.getElementById('new-password').value;
      const p2 = document.getElementById('new-password2').value;
      if (code.length !== 4) { push('Введите 4-значный код полностью.', 'error'); return; }
      if (code !== recoveryCode) { push('Неверный код подтверждения.', 'error'); return; }
      if (p1.length < 8) { push('Пароль должен содержать минимум 8 символов.', 'error'); return; }
      if (p1 !== p2) { push('Пароли не совпадают.', 'error'); return; }
      const accounts = readAccounts();
      const accountIndex = accounts.findIndex(a => normalizePhone(a.phone) === normalizePhone(recoveryPhone) && normalizePhone(recoveryPhone));
      if (accountIndex < 0) { push('Не удалось найти аккаунт для восстановления.', 'error'); showView('forgot'); return; }
      try {
        const salt = createSalt();
        const passwordHash = await hashPassword(p1, salt);
        accounts[accountIndex].salt = salt;
        accounts[accountIndex].passwordHash = passwordHash;
        if (!writeAccounts(accounts)) return;
        push('Пароль успешно изменён.', 'success');
        recoveryCode = '';
        recoveryPhone = '';
        showView('success');
      } catch (err) { push(err.message || 'Не удалось обновить пароль.', 'error', 5000); }
    });
  }

  const resendBtn = document.getElementById('resend-code');
  if (resendBtn) {
    resendBtn.addEventListener('click', function () {
      if (!recoveryPhone) { push('Сначала укажите номер телефона.', 'error'); showView('forgot'); return; }
      recoveryCode = generateRecoveryCode();
      sendRecoveryCode(recoveryPhone, recoveryCode);
    });
  }

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const ln = document.getElementById('lastname').value.trim();
      const fn = document.getElementById('firstname').value.trim();
      const email = document.getElementById('email').value.trim().toLowerCase();
      const phone = document.getElementById('phone').value.trim();
      const pwd = document.getElementById('password').value;
      const pwd2 = document.getElementById('password2').value;
      if (!ln || !fn || !email) { push('Заполните фамилию, имя и email.', 'error'); return; }
      if (pwd.length < 8) { push('Пароль должен содержать минимум 8 символов.', 'error'); return; }
      if (pwd !== pwd2) { push('Пароли не совпадают.', 'error'); return; }
      const accounts = readAccounts();
      if (accounts.some(a => String(a.email || '').toLowerCase() === email)) { push('Аккаунт с таким email уже существует.', 'error', 4500); showView('login'); return; }
      try {
        const salt = createSalt();
        const passwordHash = await hashPassword(pwd, salt);
        accounts.push({name: (fn + ' ' + ln).trim(), email, phone, role:'student', group:'', avatar:'🧑‍🎓', salt, passwordHash, registeredAt:Date.now()});
        if (!writeAccounts(accounts)) return;
        push('Регистрация прошла успешно! Теперь войдите в аккаунт.', 'success');
        registerForm.reset();
        const loginEmail = document.getElementById('login-email');
        if (loginEmail) loginEmail.value = email;
        setTimeout(() => showView('login'), 600);
      } catch (err) { push(err.message || 'Не удалось создать аккаунт.', 'error', 5000); }
    });
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim().toLowerCase();
      const pwd = document.getElementById('login-password').value;
      if (!email || !pwd) { push('Заполните email и пароль.', 'error'); return; }
      const account = readAccounts().find(a => String(a.email || '').toLowerCase() === email);
      if (!account) { push('Аккаунт с таким email не найден.', 'error', 4500); return; }
      try {
        const passwordHash = await hashPassword(pwd, account.salt || '');
        if (passwordHash !== account.passwordHash) { push('Неверный email или пароль.', 'error'); return; }
        if (!setCurrentUser(account)) return;
        push('Вы успешно вошли в аккаунт!', 'success');
        loginForm.reset();
      } catch (err) { push(err.message || 'Не удалось выполнить вход.', 'error', 5000); }
    });
  }

  const codeInputs = ['d1','d2','d3','d4'].map(id => document.getElementById(id)).filter(Boolean);
  codeInputs.forEach((input, i) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '').slice(0, 1);
      if (input.value && i < codeInputs.length - 1) codeInputs[i + 1].focus();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && i > 0) codeInputs[i - 1].focus();
    });
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = ((e.clipboardData || window.clipboardData).getData('text') || '').replace(/\D/g, '');
      if (!text) return;
      const digits = text.slice(0, 4).split('');
      digits.forEach((d, idx) => { if (codeInputs[idx]) codeInputs[idx].value = d; });
      const last = Math.min(digits.length, codeInputs.length) - 1;
      if (last >= 0) codeInputs[last].focus();
    });
  });
});
})();

/* ============================================================
   СИСТЕМА УСПЕВАЕМОСТИ
   ============================================================ */
(function () {
const ADMIN_PASSWORD = 'admin1234';

const SafeStorage = (function () {
  let available = false;
  try { localStorage.setItem('__t','1'); localStorage.removeItem('__t'); available = true; } catch(e) { available = false; }
  return {
    available,
    get(k, d) { if (!available) return d; try { const r = localStorage.getItem(k); if (r == null) return d; const p = JSON.parse(r); return p === null ? d : p; } catch(e) { return d; } },
    set(k, v) { if (!available) return false; try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch(e) { return false; } }
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  if (!SafeStorage.available) {
    const w = document.getElementById('storageWarning');
    if (w) w.classList.add('show');
  }
});

const TEACHER_ROLES = {
  director:{label:'Директор',short:'Директор',icon:'👑',color:'#7A5C00',bg:'rgba(184,134,11,0.22)'},
  deputy_uvr:{label:'Заместитель директора по УВР',short:'Зам. УВР',icon:'📚',color:'#6A0080',bg:'rgba(139,0,139,0.18)'},
  deputy_vr:{label:'Заместитель директора по ВР',short:'Зам. ВР',icon:'🎭',color:'#005B5B',bg:'rgba(0,107,107,0.18)'},
  deputy_ahr:{label:'Заместитель директора по АХР',short:'Зам. АХР',icon:'🔧',color:'#4E342E',bg:'rgba(93,64,55,0.18)'},
  methodist:{label:'Методист',short:'Методист',icon:'📋',color:'#00695C',bg:'rgba(0,121,107,0.15)'},
  head_ck:{label:'Председатель ЦК',short:'Пред. ЦК',icon:'🎯',color:'#AD1457',bg:'rgba(194,24,91,0.15)'},
  head_dept:{label:'Заведующий отделением',short:'Зав. отделением',icon:'🏢',color:'#1A237E',bg:'rgba(40,53,147,0.18)'},
  social:{label:'Социальный педагог',short:'Соц. педагог',icon:'🤝',color:'#00574B',bg:'rgba(0,105,92,0.15)'},
  psych:{label:'Педагог-психолог',short:'Психолог',icon:'🧠',color:'#4A148C',bg:'rgba(106,27,154,0.15)'},
  organizer:{label:'Педагог-организатор',short:'Организатор',icon:'🎉',color:'#BF360C',bg:'rgba(230,81,0,0.15)'},
  librarian:{label:'Библиотекарь',short:'Библиотекарь',icon:'📖',color:'#3E2723',bg:'rgba(78,52,46,0.15)'},
  teacher:{label:'Преподаватель',short:'Преподаватель',icon:'👨‍🏫',color:'#0066CC',bg:'rgba(0,102,204,0.1)'}
};
const ROLE_AVATARS = {
  director:{m:'👨‍💼',f:'👩‍💼'},deputy_uvr:{m:'👨‍💼',f:'👩‍💼'},deputy_vr:{m:'👨‍💼',f:'👩‍💼'},
  deputy_ahr:{m:'👨‍🔧',f:'👩‍🔧'},methodist:{m:'👨‍🏫',f:'👩‍🏫'},head_ck:{m:'👨‍🏫',f:'👩‍🏫'},
  head_dept:{m:'👨‍💼',f:'👩‍💼'},social:{m:'👨‍🏫',f:'👩‍🏫'},psych:{m:'🧑‍⚕️',f:'🧑‍⚕️'},
  organizer:{m:'🧑‍🎤',f:'🧑‍🎤'},librarian:{m:'👨‍💼',f:'👩‍💼'},teacher:{m:'👨‍🏫',f:'👩‍🏫'}
};
function getRoleAvatar(role, gender) { const a = ROLE_AVATARS[role] || ROLE_AVATARS.teacher; return gender === 'f' ? a.f : a.m; }
function getRoleInfo(role) { return TEACHER_ROLES[role] || TEACHER_ROLES.teacher; }
function getRoleAvatarClass(role) {
  if (role === 'director') return 'role-director';
  if (role && role.startsWith('deputy')) return 'role-deputy';
  if (role === 'head_ck' || role === 'head_dept') return 'role-head';
  return '';
}

const SUBJECTS_GENERAL = ['Русский язык','Литература','Математика','История','Обществознание','Физика','Химия','Биология','География','Иностранный язык','Информатика','Физическая культура','ОБЖ'];
const SUBJECTS_COURSE2 = {
  'ПРОГ':['Математика (проф.)','Информатика (проф.)','Иностранный язык (проф.)','Основы программирования','Архитектура ЭВМ','Операционные системы'],
  'ОИС':['Математика (проф.)','Информатика (проф.)','Иностранный язык (проф.)','Основы информационных систем','Документационное обеспечение','Пакеты прикладных программ'],
  'ССА':['Математика (проф.)','Информатика (проф.)','Иностранный язык (проф.)','Основы сетей','Аппаратное обеспечение','Операционные системы'],
  'КСК':['Математика (проф.)','Информатика (проф.)','Иностранный язык (проф.)','Электротехника','Микропроцессорная техника','Схемотехника'],
  'ИБТС':['Математика (проф.)','Информатика (проф.)','Иностранный язык (проф.)','Основы криптографии','Сетевые технологии','Безопасность жизнедеятельности'],
  'ТЭРП':['Математика (проф.)','Физика (проф.)','Иностранный язык (проф.)','Техническая механика','Электротехника','Материаловедение'],
  'РЕК':['Математика (проф.)','Информатика (проф.)','Иностранный язык (проф.)','Основы маркетинга','История рекламы','Рисунок и композиция'],
  'БД':['Математика (проф.)','Информатика (проф.)','Иностранный язык (проф.)','Основы экономики','Банковское дело','Документационное обеспечение'],
  'ЭБУ':['Математика (проф.)','Информатика (проф.)','Иностранный язык (проф.)','Основы экономики','Бухгалтерский учёт','Документационное обеспечение'],
  'ОПС':['Математика (проф.)','Информатика (проф.)','Иностранный язык (проф.)','Основы почтовой связи','Документационное обеспечение','Пакеты прикладных программ']
};
const SUBJECTS_COURSE3 = {
  'ПРОГ':['Программирование на Python','Базы данных','Web-разработка','ООП','Проектирование ИС','Тестирование ПО','Учебная практика'],
  'ОИС':['Информационные системы','Базы данных','Офисные технологии','Web-технологии','Документоведение','Учебная практика'],
  'ССА':['Администрирование Windows','Администрирование Linux','Маршрутизация и коммутация','Сетевые протоколы','Облачные технологии','Учебная практика'],
  'КСК':['Цифровая схемотехника','Микроконтроллеры','Периферийные устройства','Диагностика компьютерных систем','Сборка и монтаж','Учебная практика'],
  'ИБТС':['Криптография','Сетевая безопасность','Защита информации','Технические средства защиты','Аудит безопасности','Учебная практика'],
  'ТЭРП':['Робототехника','Автоматизация производств','Программирование ПЛК','Мехатроника','Техническая диагностика','Учебная практика'],
  'РЕК':['Копирайтинг','Дизайн в рекламе','Digital-маркетинг','Психология рекламы','Брендинг','Учебная практика'],
  'БД':['Банковские операции','Учёт в банках','Финансовый анализ','Банковское право','1С: Банк','Учебная практика'],
  'ЭБУ':['Бухгалтерский учёт','Налоги и налогообложение','Анализ отчётности','1С: Бухгалтерия','Аудит','Учебная практика'],
  'ОПС':['Организация почтовой связи','Почтовые операции','Автоматизация почтовых процессов','Документационное обеспечение','Учебная практика']
};
const SUBJECTS_COURSE4 = {
  'ПРОГ':['ПМ.01 Разработка ПО','ПМ.02 Веб-приложения','ПМ.03 Проектирование БД','Производственная практика','Преддипломная практика','Дипломное проектирование'],
  'ОИС':['ПМ.01 Ввод и обработка данных','ПМ.02 Поддержка ИС','ПМ.03 Web-контент','Производственная практика','Преддипломная практика','Дипломное проектирование'],
  'ССА':['ПМ.01 Администрирование сетей','ПМ.02 Серверные системы','ПМ.03 Безопасность сетей','Производственная практика','Преддипломная практика','Дипломное проектирование'],
  'КСК':['ПМ.01 Проектирование цифровых устройств','ПМ.02 Обслуживание КС','ПМ.03 Микропроцессорные системы','Производственная практика','Преддипломная практика','Дипломное проектирование'],
  'ИБТС':['ПМ.01 Системы защиты','ПМ.02 Безопасность сетей','ПМ.03 Криптозащита','Производственная практика','Преддипломная практика','Дипломное проектирование'],
  'ТЭРП':['ПМ.01 Монтаж робототехнических комплексов','ПМ.02 Наладка и обслуживание','ПМ.03 Программирование роботов','Производственная практика','Преддипломная практика','Дипломное проектирование'],
  'РЕК':['ПМ.01 Рекламный продукт','ПМ.02 Продвижение бренда','ПМ.03 Digital-проекты','Производственная практика','Преддипломная практика','Дипломное проектирование'],
  'БД':['ПМ.01 Ведение банковских операций','ПМ.02 Кредитование','ПМ.03 Банковский учёт','Производственная практика','Преддипломная практика','Дипломное проектирование'],
  'ЭБУ':['ПМ.01 Ведение бухучёта','ПМ.02 Налогообложение','ПМ.03 Финансовый анализ','Производственная практика','Преддипломная практика','Дипломное проектирование'],
  'ОПС':['ПМ.01 Обработка почты','ПМ.02 Обслуживание клиентов','ПМ.03 Автоматизация почтовых процессов','Производственная практика','Преддипломная практика','Дипломное проектирование']
};
function getSubjectsFor(spec, course) {
  if (course === 1) return SUBJECTS_GENERAL;
  if (course === 2) return SUBJECTS_COURSE2[spec] || [];
  if (course === 3) return SUBJECTS_COURSE3[spec] || [];
  if (course === 4) return SUBJECTS_COURSE4[spec] || [];
  return [];
}
function getAllUniqueSubjects() {
  const s = new Set(SUBJECTS_GENERAL);
  Object.values(SUBJECTS_COURSE2).forEach(a => a.forEach(x => s.add(x)));
  Object.values(SUBJECTS_COURSE3).forEach(a => a.forEach(x => s.add(x)));
  Object.values(SUBJECTS_COURSE4).forEach(a => a.forEach(x => s.add(x)));
  return [...s];
}
function getCycleInfo(course) {
  if (course === 1) return { label:'Общеобразовательный цикл', cls:'cycle-general' };
  if (course === 2) return { label:'Общепрофессиональный цикл', cls:'cycle-preprofile' };
  if (course === 3) return { label:'Профильный цикл', cls:'cycle-profile' };
  return { label:'Профессиональные модули', cls:'cycle-pm' };
}
const SPECIALTIES = {
  'ПРОГ':'Разработка и управление программным обеспечением',
  'ОИС':'Оператор информационных систем и ресурсов',
  'ССА':'Сетевое и системное администрирование',
  'КСК':'Компьютерные системы и комплексы',
  'ИБТС':'Обеспечение информационной безопасности телекоммуникационных систем',
  'ТЭРП':'Техническая эксплуатация и обслуживание роботизированного производства',
  'РЕК':'Реклама','БД':'Банковское дело','ЭБУ':'Экономика и бухгалтерский учёт','ОПС':'Оператор почтовой связи'
};
const SPEC_CODES = ['ПРОГ','ОИС','ССА','КСК','ИБТС','ТЭРП','РЕК','БД','ЭБУ','ОПС'];
const BASE_LEVELS = { 'ПРОГ':0.82,'ОИС':0.75,'ССА':0.78,'КСК':0.76,'ИБТС':0.79,'ТЭРП':0.74,'РЕК':0.80,'БД':0.77,'ЭБУ':0.81,'ОПС':0.72 };
const GROUPS_META = [];
SPEC_CODES.forEach(spec => {
  for (let course = 1; course <= 4; course++) {
    GROUPS_META.push({ code:`${spec}-${course}1`, course, spec, base:BASE_LEVELS[spec] + (course - 1) * 0.02 });
  }
});

const SURNAMES_BASE = (function () {
  const out = [], seen = new Set();
  const add = s => { if (s && !seen.has(s) && out.length < 1000) { seen.add(s); out.push(s); } };
  const common = ['Иванов','Петров','Сидоров','Кузнецов','Смирнов','Волков','Морозов','Новиков','Козлов','Лебедев','Соколов','Павлов','Семёнов','Голубев','Виноградов','Богданов','Орлов','Фёдоров','Михайлов','Белов','Тарасов','Беляев','Комаров','Киселёв','Макаров','Андреев','Ковалёв','Ильин','Гусев','Титов','Кудрявцев','Баранов','Куликов','Алексеев','Степанов','Яковлев','Сорокин','Сергеев','Романов','Захаров','Борисов','Королёв','Герасимов','Пономарёв','Григорьев','Лазарев','Медведев','Ершов','Никитин','Соболев','Родионов','Коновалов','Воробьёв','Филиппов','Марков','Большаков','Суворов','Денисов','Воронин','Мясников','Фомин','Гаврилов','Савельев','Трофимов','Калинин','Исаев','Митрофанов','Филимонов','Тихонов','Абрамов','Ефимов','Емельянов','Дмитриев','Константинов','Антонов','Афанасьев','Мельников','Грибков','Логинов','Горбунов','Егоров','Зуев','Фролов','Крылов','Рогов','Аксёнов','Артемьев','Архипов','Балашов','Блинов','Бобров','Быков','Васильев','Вдовин','Веселов','Власов','Галкин','Гончаров','Гордеев','Горшков','Гришин','Громов','Гуляев','Гурьев','Давыдов','Данилов','Дегтярёв','Дементьев','Дроздов','Дьячков','Евдокимов','Евсеев','Жуков','Журавлёв','Зайцев','Зимин','Зиновьев','Зотов','Зыков','Игнатов','Игнатьев','Измайлов','Кабанов','Казаков','Калмыков','Капустин','Карасёв','Карпов','Касаткин','Кириллов','Князев','Колесников','Колосов','Кондратьев','Кононов','Корнеев','Костин','Красильников','Круглов','Крюков','Кузьмин','Кулагин','Лаврентьев','Лапин','Ларионов','Леонов','Литвинов','Лобанов','Лукин','Лукьянов','Лыткин','Максимов','Мамонтов','Маркелов','Мартынов','Масленников','Матвеев','Меркулов','Мещеряков','Миронов','Митрохин','Моргунов','Муравьёв','Мухин','Назаров','Наумов','Некрасов','Нестеров','Никифоров','Николаев','Носов','Овсянников','Овчинников','Одинцов','Орехов','Осипов','Панкратов','Пантелеев','Пахомов','Перов','Пирогов','Платонов','Плотников','Поздняков','Поляков','Попов','Потапов','Прохоров','Пушкарёв','Разумов','Родин','Рожков','Рубцов','Рудаков','Румянцев','Русаков','Рыбаков','Рыжов','Рябов','Савин','Савинов','Самойлов','Сапожников','Сафонов','Селезнёв','Селиванов','Серебряков','Серов','Синицын','Ситников','Скворцов','Смолин','Снегирёв','Соловьёв','Сотников','Софронов','Спиридонов','Стариков','Старостин','Столяров','Стрельцов','Субботин','Судаков','Суханов','Сысоев','Терентьев','Тимофеев','Тихомиров','Токарев','Толкачёв','Туманов','Туров','Тюрин','Уваров','Ульянов','Усов','Устинов','Фадеев','Фатеев','Федин','Феоктистов','Филатов','Фирсов','Хабаров','Харламов','Хомяков','Хохлов','Хромов','Худяков','Царёв','Цветков','Чеботарёв','Чекалин','Черепанов','Черкасов','Чернов','Чесноков','Чистяков','Чижов','Шапошников','Шаров','Шашков','Швецов','Шевелёв','Шевцов','Шестаков','Шилов','Ширяев','Шишкин','Шмелёв','Шубин','Шульгин','Щеглов','Щербаков','Щукин','Юдин','Ярцев','Яшин'];
  common.forEach(add);
  const roots = ['Антон','Арсений','Афанасий','Вадим','Валерий','Виталий','Владислав','Вячеслав','Глеб','Захар','Игнат','Кузьма','Лука','Мирон','Пахом','Платон','Прохор','Родион','Трофим','Филипп','Фома','Тарас','Савва','Ростислав','Святослав','Станислав','Давид','Герман','Гаврила','Клим','Иосиф','Эдуард','Ян','Богдан','Владлен','Добрыня','Мирослав','Мстислав','Светозар','Ярослав','Андрон','Аникей','Антип','Артемий','Варлаам','Влас','Всеволод','Галактион','Гедеон','Геннадий','Георгий','Герасим','Гордей','Даниил','Дементий','Демид','Дорофей','Евдоким','Евсей','Евстафий','Егор','Елизар','Елисей','Емельян','Кондрат','Ксенофонт','Лаврентий','Макар','Мартын','Мефодий','Мина','Митрофан','Михай','Мокей','Назар','Онуфрий','Осип','Панкрат','Парамон','Пимен','Потап','Савватий','Самсон','Себастьян','Сергий','Созонт','Софрон','Спиридон','Терентий','Тимофей','Трифон','Ульян','Федосей','Федот','Феофан','Филат','Фотий','Фрол','Харитон','Хома','Яким','Якуб','Аврам','Агафон','Адам','Аким','Аксён','Алексей','Анатолий'];
  for (const r of roots) {
    if (out.length >= 1000) break;
    if (r.endsWith('ь')) { add(r.slice(0,-1)+'ев'); add(r.slice(0,-1)+'ин'); }
    else if (r.endsWith('й')) { add(r.slice(0,-1)+'ев'); add(r.slice(0,-1)+'ин'); }
    else if (r.endsWith('а')) { add(r.slice(0,-1)+'ин'); add(r+'ин'); }
    else { add(r+'ов'); add(r+'ев'); add(r+'ин'); }
  }
  return out;
})();
const FIRST_M = ['Иван','Александр','Дмитрий','Максим','Сергей','Андрей','Алексей','Артём','Илья','Кирилл','Михаил','Никита','Матвей','Роман','Егор','Арсений','Игорь','Денис','Владислав','Павел','Глеб','Даниил','Тимур','Олег','Виктор'];
const FIRST_F = ['Анна','Мария','Елена','Ольга','Дарья','София','Виктория','Полина','Алина','Ксения','Анастасия','Екатерина','Наталья','Ирина','Светлана','Татьяна','Юлия','Валерия','Вероника','Кристина','Милана','Арина','Ульяна','Алиса','Василиса'];
const PATR_M = ['Иванович','Александрович','Дмитриевич','Сергеевич','Андреевич','Алексеевич','Михайлович','Николаевич','Владимирович','Петрович','Викторович','Олегович','Игоревич','Павлович','Романович','Денисович','Максимович','Артёмович','Валерьевич','Геннадьевич'];
const PATR_F = ['Ивановна','Александровна','Дмитриевна','Сергеевна','Андреевна','Алексеевна','Михайловна','Николаевна','Владимировна','Петровна','Викторовна','Олеговна','Игоревна','Павловна','Романовна','Денисовна','Максимовна','Артёмовна','Валерьевна','Геннадьевна'];
const AVATARS = {
  'ПРОГ':['🧑‍💻','👩‍💻'],'ОИС':['🧑‍💻','👩‍💻'],'ССА':['🧑‍🔧','👩‍🔧'],'КСК':['🧑‍🔧','👩‍🔧'],
  'ИБТС':['🧑‍💻','👩‍💻'],'ТЭРП':['🧑‍🔧','👩‍🔧'],'РЕК':['🧑‍🎨','👩‍🎨'],'БД':['🧑‍💼','👩‍💼'],
  'ЭБУ':['🧑‍💼','👩‍💼'],'ОПС':['🧑‍💼','👩‍💼']
};

const EDITS_KEY = 'dontpa-grade-edits-v4';
const INFO_KEY = 'dontpa-student-info-v4';
const CUSTOM_KEY = 'dontpa-custom-students-v4';
const HIDDEN_KEY = 'dontpa-hidden-ids-v4';
const TRASH_KEY = 'dontpa-trash-v4';
const TEACHERS_KEY = 'dontpa-teachers-v4';
const CLASS_TEACHER_KEY = 'dontpa-class-teacher-v4';
const SUBJ_TEACHER_KEY = 'dontpa-subject-teacher-v4';
const CLAIMS_KEY = 'dontpa-claims-v4';

let savedEdits = SafeStorage.get(EDITS_KEY, {});
let savedInfo = SafeStorage.get(INFO_KEY, {});
let customStudents = SafeStorage.get(CUSTOM_KEY, {});
let hiddenIds = new Set(SafeStorage.get(HIDDEN_KEY, []));
let trash = SafeStorage.get(TRASH_KEY, []); if (!Array.isArray(trash)) trash = [];
let customTeachers = SafeStorage.get(TEACHERS_KEY, {});
let classTeacherMap = SafeStorage.get(CLASS_TEACHER_KEY, {});
let subjectTeacherMap = SafeStorage.get(SUBJ_TEACHER_KEY, {});

function normalizeClaims(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(c => {
    let resitPassed;
    if (c.resitPassed !== undefined && c.resitPassed !== null) resitPassed = c.resitPassed;
    else if (c.resitExecuted && c.resitGrade != null) resitPassed = Number(c.resitGrade) >= 3;
    else resitPassed = null;
    return {
      ...c, adminNote:c.adminNote || '', resolvedAt:c.resolvedAt || null,
      subject:c.subject || '', teacherId:c.teacherId || null,
      resitDate:c.resitDate || '', resitGrade:c.resitGrade || null,
      targetGroup:c.targetGroup || '', resitExecuted:c.resitExecuted || false,
      transferExecuted:c.transferExecuted || false, resitPassed
    };
  });
}
let claims = normalizeClaims(SafeStorage.get(CLAIMS_KEY, []));

const PAGE_SIZE = 24;
const RING_CIRCUMFERENCE = 2 * Math.PI * 26;
const state = { course:'all', group:'all', search:'', sort:'gpa-desc', page:1 };
const teacherState = { search:'', role:'all' };
let currentStudent = null;
let currentGroupCodeForJournal = null;
let journalEditMode = false;
let journalSemesterView = 'all';
const adminState = { status:'all', type:'all', group:'all', search:'', sort:'date-desc' };
const adminSelectedIds = new Set();
let isAdminView = false;
let isAdminAuthed = false;
let adminOrigin = 'public'; // 'public' | 'perf'

let saveStatusTimer = null;
function setSaveStatus(status) {
  const el = document.getElementById('saveStatus');
  const txt = document.getElementById('saveStatusText');
  if (!el || !txt) return;
  el.classList.remove('saving','error');
  if (status === 'saving') { el.classList.add('saving'); txt.textContent = 'Сохранение…'; clearTimeout(saveStatusTimer); }
  else if (status === 'error') { el.classList.add('error'); txt.textContent = 'Не сохранено'; }
  else { txt.textContent = 'Сохранено'; clearTimeout(saveStatusTimer); saveStatusTimer = setTimeout(() => el.classList.remove('saving','error'), 1500); }
}
function saveAll() {
  if (!SafeStorage.available) { setSaveStatus('error'); return false; }
  setSaveStatus('saving');
  const ok = [
    SafeStorage.set(EDITS_KEY, savedEdits),
    SafeStorage.set(INFO_KEY, savedInfo),
    SafeStorage.set(CUSTOM_KEY, customStudents),
    SafeStorage.set(HIDDEN_KEY, [...hiddenIds]),
    SafeStorage.set(TRASH_KEY, trash),
    SafeStorage.set(TEACHERS_KEY, customTeachers),
    SafeStorage.set(CLASS_TEACHER_KEY, classTeacherMap),
    SafeStorage.set(SUBJ_TEACHER_KEY, subjectTeacherMap),
    SafeStorage.set(CLAIMS_KEY, claims)
  ];
  if (ok.every(x => x)) { setSaveStatus('saved'); return true; }
  setSaveStatus('error'); return false;
}

function seededRandom(seed) { let s = seed * 9301 + 49297; return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
function femaleSurname(s) { return s.endsWith('а') ? s : s + 'а'; }
function generateGrades(seed, level, spec, course) {
  const rng = seededRandom(seed * 137 + 7);
  const subjects = getSubjectsFor(spec, course);
  const grades = {};
  for (const subject of subjects) {
    const count = 3 + Math.floor(rng() * 3);
    const arr = [];
    for (let i = 0; i < count; i++) {
      const r = rng(); let g;
      if (level >= 0.9) g = r < 0.7 ? 5 : (r < 0.95 ? 4 : 3);
      else if (level >= 0.78) g = r < 0.45 ? 5 : (r < 0.88 ? 4 : 3);
      else if (level >= 0.6) g = r < 0.18 ? 5 : (r < 0.72 ? 4 : 3);
      else g = r < 0.08 ? 5 : (r < 0.38 ? 4 : (r < 0.9 ? 3 : 2));
      arr.push(g);
    }
    grades[subject] = arr;
  }
  return grades;
}
function generateAttendance(seed, level) {
  const rng = seededRandom(seed * 211 + 3);
  const base = 74 + level * 24;
  return Math.max(55, Math.min(100, Math.round(base + (rng() - 0.5) * 8)));
}
function generateSubjectAttendance(seed, baseAttendance, subjects) {
  const sRng = seededRandom(seed * 571 + 41);
  const result = {};
  for (const subj of subjects) result[subj] = Math.max(55, Math.min(100, Math.round(baseAttendance + (sRng() - 0.5) * 16)));
  return result;
}

function computeAutoSemester(grades, semester) {
  if (!grades || !grades.length) return null;
  if (grades.length === 1) return grades[0];
  const half = Math.ceil(grades.length / 2);
  const arr = semester === 1 ? grades.slice(0, half) : grades.slice(half);
  if (!arr.length) return grades[grades.length - 1];
  return Math.max(2, Math.min(5, Math.round(arr.reduce((a,b) => a + b, 0) / arr.length)));
}
function getSemesterGrade(student, subject, semester) {
  const se = savedEdits[student.id];
  const sg = se && se.semesterGrades && se.semesterGrades[subject];
  if (semester === 'year') {
    if (sg && sg.final != null) return { value: sg.final, manual: true };
    const s1 = getSemesterGrade(student, subject, 1);
    const s2 = getSemesterGrade(student, subject, 2);
    if (s1 && s2) return { value: Math.round((s1.value + s2.value) / 2), manual: !s1.manual && !s2.manual ? false : true };
    if (s1) return { value: s1.value, manual: s1.manual };
    if (s2) return { value: s2.value, manual: s2.manual };
    return null;
  }
  if (sg && sg['s' + semester] != null) return { value: sg['s' + semester], manual: true };
  const grades = student.grades[subject] || [];
  const auto = computeAutoSemester(grades, semester);
  return auto != null ? { value: auto, manual: false } : null;
}
function setSemesterGrade(student, subject, semester, value) {
  const se = savedEdits[student.id] || {};
  if (!se.semesterGrades) se.semesterGrades = {};
  if (!se.semesterGrades[subject]) se.semesterGrades[subject] = {};
  if (semester === 'year' || semester === 'final') se.semesterGrades[subject].final = value;
  else se.semesterGrades[subject]['s' + semester] = value;
  savedEdits[student.id] = se;
}

function recomputeStudent(student) {
  let total = 0, count = 0;
  Object.values(student.grades).forEach(a => a.forEach(g => { total += g; count++; }));
  const gpa = count > 0 ? total / count : 0;
  student.gpaRaw = gpa; student.gpa = Math.round(gpa * 100) / 100; student.totalGrades = count;
  const all = Object.values(student.grades).flat();
  student.distribution = { 5:all.filter(g => g === 5).length, 4:all.filter(g => g === 4).length, 3:all.filter(g => g === 3).length, 2:all.filter(g => g === 2).length };
  student.levelClass = gpa >= 4.5 ? 'excellent' : gpa >= 4.0 ? 'good' : gpa >= 3.5 ? 'average' : 'low';
  student.statusText = gpa >= 4.5 ? 'Отличник' : gpa >= 4.0 ? 'Хорошист' : gpa >= 3.5 ? 'Успевает' : 'Требует внимания';
}
function recomputeGroup(group) {
  const arr = group.students;
  if (arr.length === 0) { group.avgGpa = 0; group.avgAtt = 0; group.counts = { excellent:0, good:0, average:0, low:0 }; return; }
  group.avgGpa = arr.reduce((s,x) => s + x.gpaRaw, 0) / arr.length;
  group.avgAtt = Math.round(arr.reduce((s,x) => s + x.attendance, 0) / arr.length);
  group.counts = { excellent:0, good:0, average:0, low:0 };
  arr.forEach(s => group.counts[s.levelClass]++);
}

const BASE_STUDENTS = [];
let uid = 1;
GROUPS_META.forEach((meta, gi) => {
  for (let i = 0; i < 25; i++) {
    const id = uid++;
    const seed = (gi + 1) * 100003 + (i + 1) * 7919;
    const rng = seededRandom(seed);
    const male = rng() < 0.5;
    const surnameBase = SURNAMES_BASE[gi * 25 + i] || SURNAMES_BASE[i];
    const ln = male ? surnameBase : femaleSurname(surnameBase);
    const fn = male ? FIRST_M[Math.floor(rng() * FIRST_M.length)] : FIRST_F[Math.floor(rng() * FIRST_F.length)];
    const mn = male ? PATR_M[Math.floor(rng() * PATR_M.length)] : PATR_F[Math.floor(rng() * PATR_F.length)];
    const level = Math.min(0.99, Math.max(0.45, meta.base + (rng() - 0.5) * 0.3));
    const avatar = AVATARS[meta.spec][male ? 0 : 1];
    const grades = generateGrades(id, level, meta.spec, meta.course);
    const attendance = generateAttendance(id, level);
    const subjects = getSubjectsFor(meta.spec, meta.course);
    const subjectAttendance = generateSubjectAttendance(id, attendance, subjects);
    BASE_STUDENTS.push({
      id, ln, fn, mn, group:meta.code, course:meta.course, spec:meta.spec,
      gender:male ? 'm' : 'f', avatar, level,
      fullName:`${ln} ${fn} ${mn}`, shortName:`${fn} ${ln}`,
      grades, attendance, subjectAttendance,
      gpa:0, gpaRaw:0, totalGrades:0, distribution:{5:0,4:0,3:0,2:0},
      levelClass:'low', statusText:'Требует внимания',
      specialtyName:SPECIALTIES[meta.spec], isCustom:false, isEdited:false
    });
  }
});

const BASE_TEACHERS = [];
const TEACHER_LAST_M = SURNAMES_BASE.slice(0, 120);
const TEACHER_LAST_F = SURNAMES_BASE.slice(120, 240).map(femaleSurname);
const ALL_SUBJECTS = getAllUniqueSubjects();
function generateBaseTeachers() {
  const teachers = [];
  const usedNames = new Set();
  let tid = 1;
  ALL_SUBJECTS.forEach((subject, idx) => {
    const count = 1 + (idx % 2);
    for (let c = 0; c < count; c++) {
      const male = (idx + c) % 2 === 0;
      const ln = male ? TEACHER_LAST_M[(idx * 7 + c * 3) % TEACHER_LAST_M.length] : TEACHER_LAST_F[(idx * 5 + c * 11) % TEACHER_LAST_F.length];
      const fn = male ? FIRST_M[(idx * 3 + c) % FIRST_M.length] : FIRST_F[(idx * 3 + c * 2) % FIRST_F.length];
      const mn = male ? PATR_M[(idx + c * 5) % PATR_M.length] : PATR_F[(idx + c * 5) % PATR_F.length];
      const fullName = `${ln} ${fn} ${mn}`;
      if (usedNames.has(fullName)) continue;
      usedNames.add(fullName);
      const extra = [];
      const extraCount = (idx + c) % 3;
      for (let e = 0; e < extraCount; e++) {
        const sub = ALL_SUBJECTS[(idx * 13 + c * 7 + e * 3 + 5) % ALL_SUBJECTS.length];
        if (sub !== subject && !extra.includes(sub)) extra.push(sub);
      }
      teachers.push({ id:tid++, ln, fn, mn, fullName, gender:male ? 'm' : 'f', subjects:[subject, ...extra], isCustom:false, avatar:male ? '👨‍🏫' : '👩‍🏫', role:'teacher' });
    }
  });
  return teachers;
}
BASE_TEACHERS.push(...generateBaseTeachers());
(function assignBaseRoles() {
  const plan = ['director','deputy_uvr','deputy_vr','deputy_ahr','methodist','methodist','head_ck','head_ck','head_ck','head_dept','head_dept','social','psych','organizer','librarian'];
  const indices = BASE_TEACHERS.map((_, i) => i);
  let s = 20240115;
  for (let i = indices.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  plan.forEach((role, k) => {
    if (k < indices.length) {
      const t = BASE_TEACHERS[indices[k]];
      t.role = role;
      t.avatar = getRoleAvatar(role, t.gender);
    }
  });
})();

let STUDENTS = [];
let GROUPS = [];
let TEACHERS = [];

function buildAll() {
  STUDENTS = [];
  BASE_STUDENTS.forEach(base => {
    if (hiddenIds.has(base.id)) return;
    const s = { ...base, grades:JSON.parse(JSON.stringify(base.grades)), subjectAttendance:{ ...base.subjectAttendance } };
    const ie = savedInfo[base.id];
    if (ie) {
      s.ln = ie.ln; s.fn = ie.fn; s.mn = ie.mn;
      s.group = ie.group; s.course = ie.course; s.spec = ie.spec;
      s.gender = ie.gender; s.avatar = ie.avatar;
      s.fullName = `${s.ln} ${s.fn} ${s.mn}`; s.shortName = `${s.fn} ${s.ln}`;
      s.specialtyName = SPECIALTIES[s.spec] || s.specialtyName;
    }
    const se = savedEdits[base.id];
    if (se) {
      if (se.grades) s.grades = JSON.parse(JSON.stringify(se.grades));
      if (typeof se.attendance === 'number') s.attendance = se.attendance;
      if (se.subjectAttendance) Object.assign(s.subjectAttendance, se.subjectAttendance);
    }
    recomputeStudent(s);
    s.isEdited = !!(ie || se);
    STUDENTS.push(s);
  });
  Object.values(customStudents).forEach(cs => {
    const s = JSON.parse(JSON.stringify(cs));
    const ie = savedInfo[cs.id];
    if (ie) {
      s.ln = ie.ln; s.fn = ie.fn; s.mn = ie.mn;
      s.group = ie.group; s.course = ie.course; s.spec = ie.spec;
      s.gender = ie.gender; s.avatar = ie.avatar;
      s.fullName = `${s.ln} ${s.fn} ${s.mn}`; s.shortName = `${s.fn} ${s.ln}`;
      s.specialtyName = SPECIALTIES[s.spec] || s.specialtyName;
    }
    recomputeStudent(s);
    s.isEdited = !!(ie || savedEdits[cs.id]);
    s.isCustom = true;
    STUDENTS.push(s);
  });

  const map = {};
  STUDENTS.forEach(s => {
    if (!map[s.group]) {
      map[s.group] = {
        code:s.group, course:s.course, spec:s.spec,
        specialtyName:SPECIALTIES[s.spec] || 'Группа',
        students:[], avgGpa:0, avgAtt:0,
        counts:{ excellent:0, good:0, average:0, low:0 }
      };
    }
    map[s.group].students.push(s);
  });
  GROUPS = Object.values(map);
  GROUPS.forEach(recomputeGroup);
  GROUPS.sort((a,b) => a.course !== b.course ? a.course - b.course : a.code.localeCompare(b.code));

  TEACHERS = [];
  const hiddenBaseTeachers = customTeachers['__hidden_base_teachers__'] || [];
  BASE_TEACHERS.forEach(t => {
    if (hiddenBaseTeachers.includes(t.id)) return;
    const override = customTeachers[t.id];
    if (override && override.__override) {
      const role = override.role || t.role || 'teacher';
      TEACHERS.push({ ...override, subjects:[...(override.subjects || [])], role, avatar:getRoleAvatar(role, override.gender || t.gender) });
    } else {
      TEACHERS.push({ ...t, subjects:[...t.subjects], role:t.role || 'teacher' });
    }
  });
  Object.values(customTeachers).forEach(t => {
    if (!t || typeof t !== 'object' || Array.isArray(t) || t.__override) return;
    if (t.id === undefined) return;
    const role = t.role || 'teacher';
    TEACHERS.push({ ...t, subjects:[...(t.subjects || [])], role, avatar:getRoleAvatar(role, t.gender), isCustom:true });
  });

  GROUPS.forEach(g => {
    if (!classTeacherMap[g.code]) {
      const groupSubjects = getSubjectsFor(g.spec, g.course);
      const candidates = TEACHERS.filter(t => t.subjects.some(sub => groupSubjects.includes(sub)));
      if (candidates.length > 0) classTeacherMap[g.code] = candidates[Math.floor(Math.random() * candidates.length)].id;
      else if (TEACHERS.length > 0) classTeacherMap[g.code] = TEACHERS[Math.floor(Math.random() * TEACHERS.length)].id;
    }
  });
  GROUPS.forEach(g => {
    const groupSubjects = getSubjectsFor(g.spec, g.course);
    groupSubjects.forEach(subj => {
      const key = g.code + '|' + subj;
      if (!subjectTeacherMap[key]) {
        const candidates = TEACHERS.filter(t => t.subjects.includes(subj));
        if (candidates.length > 0) subjectTeacherMap[key] = candidates[Math.floor(Math.random() * candidates.length)].id;
      }
    });
  });
  renderDashboard();
}
buildAll();
function findTeacherById(id) { return TEACHERS.find(t => t.id === id) || null; }
function getClassTeacherOf(groupCode) { return findTeacherById(classTeacherMap[groupCode]); }
function getSubjectTeacher(groupCode, subject) { return findTeacherById(subjectTeacherMap[groupCode + '|' + subject]); }
function getGroupsOfTeacher(teacherId) { return GROUPS.filter(g => classTeacherMap[g.code] === teacherId).map(g => g.code); }
function getTeachersForSubject(subject, groupCode) {
  if (!subject) return [];
  let list = TEACHERS.filter(t => (t.subjects || []).includes(subject));
  if (groupCode) {
    const assignedId = subjectTeacherMap[groupCode + '|' + subject];
    if (assignedId) {
      list = list.slice().sort((a, b) => (a.id === assignedId ? -1 : b.id === assignedId ? 1 : 0));
    }
  }
  return list;
}

function escapeHtml(str) { return String(str).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
const pushArea = document.getElementById('push-area');
const PUSH_ICONS = { success:'✅', error:'❌', info:'ℹ️' };
function push(message, type, duration) {
  if (!pushArea) return;
  const el = document.createElement('div');
  el.className = 'push push--' + (type || 'info');
  el.innerHTML = '<span class="push__icon">' + (PUSH_ICONS[type] || 'ℹ️') + '</span><span class="push__text">' + message + '</span>';
  pushArea.appendChild(el);
  setTimeout(() => { el.classList.add('push--out'); setTimeout(() => el.remove(), 350); }, duration || 3000);
}
function anyModalOpen() {
  const ids = ['modalOverlay','studentFormOverlay','transferOverlay','journalOverlay','teacherFormOverlay','trashOverlay','pickerOverlay','claimFormOverlay','claimsAdminOverlay','passwordOverlay'];
  return ids.some(id => { const el = document.getElementById(id); return el && el.classList.contains('open'); });
}
function releaseBodyScroll() { if (!anyModalOpen()) document.body.style.overflow = ''; }

function renderDashboard() {
  const root = document.getElementById('dashTotalStudents');
  if (!root) return;
  const totalStudents = STUDENTS.length;
  const totalGroups = GROUPS.filter(g => g.students.length > 0).length;
  const totalTeachers = TEACHERS.length;
  const avgGpa = totalStudents > 0 ? STUDENTS.reduce((s,x) => s + x.gpaRaw, 0) / totalStudents : 0;
  const avgAtt = totalStudents > 0 ? Math.round(STUDENTS.reduce((s,x) => s + x.attendance, 0) / totalStudents) : 0;
  const newClaims = claims.filter(c => c.status === 'new').length;
  document.getElementById('dashTotalStudents').textContent = totalStudents;
  document.getElementById('dashTotalGroups').textContent = totalGroups;
  document.getElementById('dashTotalTeachers').textContent = totalTeachers;
  document.getElementById('dashAvgGpa').textContent = avgGpa.toFixed(2);
  document.getElementById('dashAvgAtt').textContent = avgAtt + '%';
  document.getElementById('dashClaims').textContent = newClaims;
  const dist = { excellent:0, good:0, average:0, low:0 };
  STUDENTS.forEach(s => { dist[s.levelClass] = (dist[s.levelClass] || 0) + 1; });
  const distItems = [
    { key:'excellent', label:'Отличники', color:'#2E8B2E' },
    { key:'good', label:'Хорошисты', color:'#0066CC' },
    { key:'average', label:'Успевают', color:'#E67E00' },
    { key:'low', label:'Требуют внимания', color:'#E64646' }
  ];
  const maxDist = Math.max(...Object.values(dist), 1);
  document.getElementById('dashDistribution').innerHTML = distItems.map(it => {
    const count = dist[it.key] || 0;
    const barWidth = (count / maxDist) * 100;
    return `<div class="dash-dist-row"><span class="dash-dist-dot" style="background:${it.color};"></span><span class="dash-dist-name">${it.label}</span><div class="dash-dist-bar"><div class="dash-dist-fill" style="width:${barWidth}%;background:${it.color};"></div></div><span class="dash-dist-count">${count}</span></div>`;
  }).join('');
  const topGroups = GROUPS.filter(g => g.students.length > 0).slice().sort((a,b) => b.avgGpa - a.avgGpa).slice(0, 5);
  document.getElementById('dashTopGroups').innerHTML = topGroups.map((g, i) => `
    <div class="dash-top-row"><span class="dash-top-rank rank-${i+1}">${i+1}</span><span class="dash-top-code">${g.code}</span><span class="dash-top-spec">${g.course} курс</span><span class="dash-top-gpa">${g.avgGpa.toFixed(2)}</span></div>
  `).join('') || '<div style="text-align:center;padding:20px;opacity:0.5;">Нет данных</div>';
}
const refreshDashboardBtn = document.getElementById('refreshDashboardBtn');
if (refreshDashboardBtn) refreshDashboardBtn.addEventListener('click', () => { renderDashboard(); push('Дашборд обновлён', 'success', 1500); });

function renderGroups() {
  const grid = document.getElementById('groupsGrid');
  grid.innerHTML = GROUPS.map(g => {
    const total = g.students.length;
    if (total === 0) return '';
    const pct = c => (c / total * 100).toFixed(1);
    const ct = getClassTeacherOf(g.code);
    const ctName = ct ? `${ct.ln} ${ct.fn.charAt(0)}.${ct.mn ? ct.mn.charAt(0) + '.' : ''}` : 'не назначен';
    return `
    <div class="group-card" data-group="${g.code}" data-course="${g.course}">
      <div class="group-card-head"><span class="group-code">${g.code}</span><span class="group-course">${g.course} курс</span></div>
      <div class="group-spec">${escapeHtml(g.specialtyName)}</div>
      <div class="group-teacher"><span class="group-teacher-icon">👨‍🏫</span><div class="group-teacher-label"><small>Классный руководитель</small><div class="group-teacher-name">${escapeHtml(ctName)}</div></div><button class="group-teacher-edit" data-group="${g.code}" title="Сменить" type="button">✏️</button></div>
      <div class="group-att-head"><span>Посещаемость</span><span>${g.avgAtt}%</span></div>
      <div class="group-att-bar"><div style="width:0%" data-target="${g.avgAtt}%"></div></div>
      <div class="group-stats"><div><strong>${total}</strong><span>студентов</span></div><div><strong>${g.avgGpa.toFixed(2)}</strong><span>средний балл</span></div><div><strong>${g.counts.excellent}</strong><span>отличников</span></div></div>
      <div class="group-dist-bar" title="Отличники: ${g.counts.excellent} · Хорошисты: ${g.counts.good} · Успевают: ${g.counts.average} · Требуют внимания: ${g.counts.low}">
        <div class="seg seg-excellent" style="width:${pct(g.counts.excellent)}%"></div>
        <div class="seg seg-good" style="width:${pct(g.counts.good)}%"></div>
        <div class="seg seg-average" style="width:${pct(g.counts.average)}%"></div>
        <div class="seg seg-low" style="width:${pct(g.counts.low)}%"></div>
      </div>
      <div class="group-actions">
        <button class="group-btn" data-action="students" data-group="${g.code}" data-course="${g.course}">Студенты →</button>
        <button class="group-btn journal-btn" data-action="journal" data-group="${g.code}" data-course="${g.course}">📖 Журнал</button>
        <button class="group-btn excel-btn" data-action="group-excel" data-group="${g.code}">📊 Excel-отчёт</button>
      </div>
    </div>`;
  }).join('');
  requestAnimationFrame(() => {
    grid.querySelectorAll('.group-att-bar > div').forEach((bar, i) => {
      setTimeout(() => { bar.style.width = bar.dataset.target; }, 60 + i * 35);
    });
  });
  grid.querySelectorAll('[data-action="students"]').forEach(btn => { btn.addEventListener('click', (e) => { e.stopPropagation(); goToGroupStudents(btn.dataset.group, btn.dataset.course); }); });
  grid.querySelectorAll('[data-action="journal"]').forEach(btn => { btn.addEventListener('click', (e) => { e.stopPropagation(); openJournal(btn.dataset.group); }); });
  grid.querySelectorAll('[data-action="group-excel"]').forEach(btn => { btn.addEventListener('click', (e) => { e.stopPropagation(); generateGroupExcelReport(btn.dataset.group); }); });
  grid.querySelectorAll('.group-teacher-edit').forEach(btn => { btn.addEventListener('click', (e) => { e.stopPropagation(); openTeacherPicker(btn.dataset.group, 'class'); }); });
}
function goToGroupStudents(code, course) {
  state.course = course; state.page = 1;
  document.querySelectorAll('.course-tab').forEach(t => t.classList.toggle('active', t.dataset.course === course));
  updateGroupOptions();
  state.group = code;
  document.getElementById('groupFilter').value = code;
  updateQuickJournalBtn();
  renderStudents();
  scrollToElement('students');
}

function renderTeachers() {
  const grid = document.getElementById('teachersGrid');
  let list = TEACHERS.slice();
  if (teacherState.search) {
    const q = teacherState.search.toLowerCase();
    list = list.filter(t => t.fullName.toLowerCase().includes(q) || t.subjects.some(s => s.toLowerCase().includes(q)));
  }
  const ctIds = new Set(Object.values(classTeacherMap));
  if (teacherState.role === 'director') list = list.filter(t => t.role === 'director');
  else if (teacherState.role === 'deputy') list = list.filter(t => t.role && t.role.startsWith('deputy'));
  else if (teacherState.role === 'head') list = list.filter(t => t.role === 'head_ck' || t.role === 'head_dept');
  else if (teacherState.role === 'methodist') list = list.filter(t => t.role === 'methodist');
  else if (teacherState.role === 'support') list = list.filter(t => t.role && ['social','psych','organizer','librarian'].includes(t.role));
  else if (teacherState.role === 'ct') list = list.filter(t => ctIds.has(t.id));
  else if (teacherState.role === 'teacher') list = list.filter(t => (!t.role || t.role === 'teacher') && !ctIds.has(t.id));
  if (list.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><div class="empty-state-icon">🔍</div><h3>Преподаватели не найдены</h3></div>`;
    return;
  }
  const roleOrder = ['director','deputy_uvr','deputy_vr','deputy_ahr','head_dept','head_ck','methodist','social','psych','organizer','librarian','teacher'];
  list.sort((a, b) => {
    const ra = roleOrder.indexOf(a.role || 'teacher');
    const rb = roleOrder.indexOf(b.role || 'teacher');
    if (ra !== rb) return ra - rb;
    return a.fullName.localeCompare(b.fullName);
  });
  grid.innerHTML = list.map(t => {
    const groups = getGroupsOfTeacher(t.id);
    const isCT = groups.length > 0;
    const roleInfo = getRoleInfo(t.role);
    const isAdmin = t.role && t.role !== 'teacher';
    const avatarClass = getRoleAvatarClass(t.role);
    const avatar = (t.role && t.role !== 'teacher') ? getRoleAvatar(t.role, t.gender) : (t.avatar || (t.gender === 'm' ? '👨‍🏫' : '👩‍🏫'));
    const subjectTags = t.subjects.slice(0, 5).map(s => `<span class="teacher-subjects-tag">${escapeHtml(s)}</span>`).join('') + (t.subjects.length > 5 ? `<span class="teacher-subjects-tag">+${t.subjects.length - 5}</span>` : '');
    const badges = `<span class="teacher-role-badge role" style="background:${roleInfo.bg};color:${roleInfo.color}">${roleInfo.icon} ${escapeHtml(roleInfo.short)}</span>${isCT && isAdmin ? '<span class="teacher-role-badge ct">+ Классрук</span>' : ''}${isCT && !isAdmin ? '<span class="teacher-role-badge ct">Классрук</span>' : ''}`;
    return `
    <div class="teacher-card${isCT ? ' is-class-teacher' : ''}${isAdmin ? ' is-admin' : ''}" data-teacher-id="${t.id}">
      <div class="teacher-head"><div class="teacher-avatar ${isAdmin ? avatarClass : (isCT ? '' : 'regular')}">${avatar}</div><div class="teacher-info"><div class="teacher-name">${escapeHtml(t.ln)} ${escapeHtml(t.fn)}</div><div class="teacher-role">${escapeHtml(t.mn || '')}</div><div style="margin-top:4px;">${badges}</div></div></div>
      <div class="teacher-subjects">${subjectTags || '<span style="opacity:0.5;">Дисциплины не указаны</span>'}</div>
      ${isCT ? `<div class="teacher-groups-info">Классрук групп: <strong>${groups.map(escapeHtml).join(', ')}</strong></div>` : ''}
    </div>`;
  }).join('');
  grid.querySelectorAll('.teacher-card').forEach(card => {
    card.addEventListener('click', () => {
      const t = TEACHERS.find(x => x.id === Number(card.dataset.teacherId));
      if (t) openTeacherForm(t);
    });
  });
}

function updateGroupOptions() {
  const groupSelect = document.getElementById('groupFilter');
  const current = groupSelect.value;
  const groups = new Set();
  STUDENTS.forEach(s => { if (state.course === 'all' || s.course === Number(state.course)) groups.add(s.group); });
  const sorted = [...groups].sort();
  groupSelect.innerHTML = '<option value="all">Все группы</option>' + sorted.map(g => `<option value="${g}">${g}</option>`).join('');
  if (sorted.includes(current)) groupSelect.value = current;
  else if (sorted.includes(state.group)) groupSelect.value = state.group;
  else { groupSelect.value = 'all'; state.group = 'all'; }
  updateQuickJournalBtn();
}
function updateQuickJournalBtn() {
  const btn = document.getElementById('quickJournalBtn');
  if (!btn) return;
  btn.disabled = state.group === 'all';
  btn.title = state.group === 'all' ? 'Сначала выберите группу' : `Открыть журнал ${state.group}`;
}

function getFilteredStudents() {
  let list = STUDENTS.slice();
  if (state.course !== 'all') list = list.filter(s => s.course === Number(state.course));
  if (state.group !== 'all') list = list.filter(s => s.group === state.group);
  if (state.search) {
    const q = state.search.toLowerCase();
    list = list.filter(s => s.fullName.toLowerCase().includes(q) || s.group.toLowerCase().includes(q));
  }
  switch (state.sort) {
    case 'gpa-desc': list.sort((a,b) => b.gpaRaw - a.gpaRaw); break;
    case 'gpa-asc': list.sort((a,b) => a.gpaRaw - b.gpaRaw); break;
    case 'name-asc': list.sort((a,b) => a.fullName.localeCompare(b.fullName)); break;
    case 'name-desc': list.sort((a,b) => b.fullName.localeCompare(a.fullName)); break;
    case 'attendance-desc': list.sort((a,b) => b.attendance - a.attendance); break;
  }
  return list;
}

function updatePagination(page, totalPages, total, start, count) {
  document.getElementById('pageInfo').innerHTML = `Страница <strong>${page}</strong> из <strong>${totalPages}</strong>`;
  document.getElementById('prevPage').disabled = page <= 1;
  document.getElementById('nextPage').disabled = page >= totalPages;
  const info = document.getElementById('resultsInfo');
  if (total === 0) info.textContent = 'Ничего не найдено';
  else info.textContent = `Показано ${start + 1}–${start + count} из ${total}`;
}
function scrollToElement(id) {
  const target = document.getElementById(id);
  if (!target) return;
  const offset = target.getBoundingClientRect().top + window.pageYOffset - 80;
  window.scrollTo({ top:offset, behavior:'smooth' });
}

function renderStudents() {
  const grid = document.getElementById('studentsGrid');
  const list = getFilteredStudents();
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (state.page > totalPages) state.page = totalPages;
  if (state.page < 1) state.page = 1;
  const start = (state.page - 1) * PAGE_SIZE;
  const pageItems = list.slice(start, start + PAGE_SIZE);
  if (total === 0) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🔍</div><h3>Студенты не найдены</h3><p>Попробуйте изменить параметры фильтрации.</p></div>`;
    updatePagination(0, 1, 0, 0, 0); return;
  }
  grid.innerHTML = pageItems.map(s => `
    <div class="student-card level-${s.levelClass}" data-id="${s.id}">
      <div class="student-card-head"><div class="student-avatar">${s.avatar}</div><div class="student-info"><div class="student-name">${escapeHtml(s.ln)} ${escapeHtml(s.fn)}${s.isCustom ? '<span class="custom-badge">➕ добавлен</span>' : ''}${s.isEdited && !s.isCustom ? '<span class="edited-badge">✏️ изменено</span>' : ''}</div><div class="student-meta"><strong>${s.group}</strong> · ${s.course} курс</div></div></div>
      <div class="student-body">
        <div class="gpa-ring-wrap"><svg class="gpa-ring" viewBox="0 0 60 60"><circle class="gpa-ring-bg" cx="30" cy="30" r="26"></circle><circle class="gpa-ring-fill" cx="30" cy="30" r="26" style="stroke-dasharray:${RING_CIRCUMFERENCE};stroke-dashoffset:${RING_CIRCUMFERENCE};"></circle></svg><div class="gpa-text"><div class="gpa-value">${s.gpa.toFixed(2)}</div><div class="gpa-label">средний балл</div></div></div>
        <div class="attendance-block"><div class="attendance-head"><span>Посещаемость</span><span>${s.attendance}%</span></div><div class="attendance-bar"><div class="attendance-fill" style="width:0%" data-target="${s.attendance}%"></div></div></div>
      </div>
      <div class="student-footer"><span class="status-badge status-${s.levelClass}">${s.statusText}</span><span class="student-subjects">${s.totalGrades} оценок · ${Object.keys(s.grades).length} предметов</span></div>
    </div>
  `).join('');
  requestAnimationFrame(() => {
    grid.querySelectorAll('.gpa-ring-fill').forEach((ring, i) => {
      const card = ring.closest('.student-card');
      const s = STUDENTS.find(x => x.id === Number(card.dataset.id));
      if (!s) return;
      const offset = RING_CIRCUMFERENCE * (1 - s.gpaRaw / 5);
      setTimeout(() => { ring.style.strokeDashoffset = offset; }, 40 + i * 25);
    });
    grid.querySelectorAll('.attendance-fill').forEach((bar, i) => {
      setTimeout(() => { bar.style.width = bar.dataset.target; }, 80 + i * 25);
    });
  });
  grid.querySelectorAll('.student-card').forEach(card => {
    card.addEventListener('click', () => {
      const s = STUDENTS.find(x => x.id === Number(card.dataset.id));
      if (s) openModal(s);
    });
  });
  updatePagination(state.page, totalPages, total, start, pageItems.length);
}

const modalOverlay = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');
const modalEditBtn = document.getElementById('modalEditBtn');
const modalResetBtn = document.getElementById('modalResetBtn');
let editMode = false;
function openModal(student) {
  currentStudent = student;
  editMode = false;
  modalContent.classList.remove('edit-mode');
  modalEditBtn.classList.remove('active');
  modalEditBtn.textContent = '✏️';
  document.getElementById('modalAvatar').textContent = student.avatar;
  document.getElementById('modalName').textContent = student.fullName;
  document.getElementById('modalMeta').innerHTML = `<strong>${student.group}</strong> · ${student.course} курс · ${escapeHtml(student.specialtyName)}`;
  renderModalBody(student);
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function renderModalBody(student) {
  const subjectCount = Object.keys(student.grades).length;
  const excellentSubjects = Object.values(student.grades).filter(arr => arr.length > 0 && arr.reduce((a,b)=>a+b,0)/arr.length >= 4.5).length;
  document.getElementById('modalStats').innerHTML = `
    <div class="modal-stat"><div class="modal-stat-value">${student.gpa.toFixed(2)}</div><div class="modal-stat-label">Средний балл</div></div>
    <div class="modal-stat"><div class="modal-stat-value">${student.attendance}%</div><div class="modal-stat-label">Посещаемость</div></div>
    <div class="modal-stat"><div class="modal-stat-value">${subjectCount}</div><div class="modal-stat-label">Предметов</div></div>
    <div class="modal-stat"><div class="modal-stat-value">${excellentSubjects}/${subjectCount}</div><div class="modal-stat-label">На «5»</div></div>`;
  const cycle = getCycleInfo(student.course);
  document.getElementById('modalSubjectsTitle').innerHTML = `📚 Оценки и посещаемость <span class="cycle-badge ${cycle.cls}">${cycle.label}</span>`;
  const total = student.totalGrades || 1;
  const dist = student.distribution;
  document.getElementById('modalChart').innerHTML = [5,4,3,2].map(g => {
    const count = dist[g], pct = Math.round((count / total) * 100);
    return `<div class="chart-row"><div class="chart-label g${g}">${g}</div><div class="chart-bar-bg"><div class="chart-bar-fill g${g}" style="width:0%" data-target="${Math.max(pct, count > 0 ? 8 : 0)}%">${count}</div></div></div>`;
  }).join('');
  document.getElementById('modalGradesBody').innerHTML = Object.entries(student.grades).map(([subject, arr]) => {
    const avg = arr.length > 0 ? arr.reduce((a,b)=>a+b,0)/arr.length : 0;
    const cls = avg >= 4.5 ? 'high' : avg >= 4.0 ? 'mid' : 'low';
    const subjEsc = escapeHtml(subject);
    const chips = arr.map((g, idx) => `<span class="grade-chip-wrap"><span class="grade-chip g${g}" data-subject="${subjEsc}" data-idx="${idx}">${g}</span><button class="grade-chip-remove" data-subject="${subjEsc}" data-idx="${idx}" title="Удалить">×</button></span>`).join('');
    const addBtn = `<button class="grade-add-btn" data-subject="${subjEsc}" title="Добавить">+</button>`;
    const att = student.subjectAttendance[subject] ?? student.attendance;
    const attCls = att >= 90 ? '' : att >= 75 ? 'mid' : 'low';
    let attHTML;
    if (editMode) attHTML = `<div class="att-edit-wrap"><input type="range" min="0" max="100" step="1" value="${att}" class="att-slider" data-subject="${subjEsc}"><span class="att-value">${att}%</span></div>`;
    else attHTML = `<div class="att-cell"><div class="att-mini-bar"><div class="att-mini-fill ${attCls}" style="width:${att}%"></div></div><span class="att-value">${att}%</span></div>`;
    return `<tr><td>${subjEsc}</td><td><div class="grades-inline">${chips}${addBtn}</div></td><td>${attHTML}</td><td><span class="subject-avg ${cls}">${avg > 0 ? avg.toFixed(2) : '—'}</span></td></tr>`;
  }).join('');
  setTimeout(() => { document.querySelectorAll('#modalChart .chart-bar-fill').forEach(bar => { bar.style.width = bar.dataset.target; }); }, 50);
  if (editMode) attachEditHandlers(student);
}
function attachEditHandlers(student) {
  const tbody = document.getElementById('modalGradesBody');
  tbody.querySelectorAll('.grade-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const subject = chip.dataset.subject, idx = parseInt(chip.dataset.idx, 10);
      if (!student.grades[subject] || !student.grades[subject][idx]) return;
      const cur = student.grades[subject][idx];
      student.grades[subject][idx] = cur === 5 ? 2 : cur + 1;
      afterGradeEdit(student);
    });
  });
  tbody.querySelectorAll('.grade-chip-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const subject = btn.dataset.subject, idx = parseInt(btn.dataset.idx, 10);
      if (!student.grades[subject]) return;
      if (student.grades[subject].length <= 1) { push('Нельзя удалить последнюю оценку', 'error', 2200); return; }
      student.grades[subject].splice(idx, 1);
      afterGradeEdit(student);
    });
  });
  tbody.querySelectorAll('.grade-add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const subject = btn.dataset.subject;
      if (!student.grades[subject]) student.grades[subject] = [];
      student.grades[subject].push(4);
      afterGradeEdit(student);
    });
  });
  tbody.querySelectorAll('.att-slider').forEach(slider => {
    slider.addEventListener('change', () => {
      const subject = slider.dataset.subject, val = parseInt(slider.value, 10);
      student.subjectAttendance[subject] = val;
      const vals = Object.values(student.subjectAttendance);
      student.attendance = Math.round(vals.reduce((a,b)=>a+b,0)/vals.length);
      afterGradeEdit(student);
    });
  });
}
function afterGradeEdit(student) {
  recomputeStudent(student);
  student.isEdited = true;
  savedEdits[student.id] = { ...(savedEdits[student.id] || {}), grades:student.grades, attendance:student.attendance, subjectAttendance:student.subjectAttendance };
  saveAll(); buildAll();
  const fresh = STUDENTS.find(s => s.id === student.id);
  if (fresh) { currentStudent = fresh; renderModalBody(fresh); }
  renderGroups(); renderTeachers(); updateGroupOptions(); renderStudents();
  if (journalEditMode && currentGroupCodeForJournal) renderJournal();
  push('Изменения сохранены', 'success', 1200);
}
function closeModal() {
  modalOverlay.classList.remove('open');
  editMode = false;
  modalContent.classList.remove('edit-mode');
  modalEditBtn.classList.remove('active');
  modalEditBtn.textContent = '✏️';
  currentStudent = null;
  releaseBodyScroll();
}
document.getElementById('modalClose').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
modalEditBtn.addEventListener('click', () => {
  if (!currentStudent) return;
  editMode = !editMode;
  modalContent.classList.toggle('edit-mode', editMode);
  modalEditBtn.classList.toggle('active', editMode);
  modalEditBtn.textContent = editMode ? '💾' : '✏️';
  renderModalBody(currentStudent);
  if (!editMode) push('Режим редактирования выключен', 'success', 2000);
});
modalResetBtn.addEventListener('click', () => {
  if (!currentStudent) return;
  if (!confirm('Сбросить все изменения?')) return;
  const id = currentStudent.id;
  delete savedEdits[id]; delete savedInfo[id];
  saveAll(); buildAll();
  const fresh = STUDENTS.find(s => s.id === id);
  if (fresh) { currentStudent = fresh; renderModalBody(fresh); }
  renderGroups(); renderTeachers(); updateGroupOptions(); renderStudents();
  push('Все изменения сброшены', 'info', 2200);
});

const studentFormOverlay = document.getElementById('studentFormOverlay');
const studentForm = document.getElementById('studentForm');
const studentFormTitle = document.getElementById('studentFormTitle');
const formLn = document.getElementById('formLn');
const formFn = document.getElementById('formFn');
const formMn = document.getElementById('formMn');
const formGroup = document.getElementById('formGroup');
const formDeleteBtn = document.getElementById('formDeleteBtn');
let formMode = 'add';
let formEditId = null;
function populateFormGroups(selectedCode) {
  const sorted = GROUPS.filter(g => g.students.length > 0).sort((a,b) => a.course !== b.course ? a.course - b.course : a.code.localeCompare(b.code));
  formGroup.innerHTML = sorted.map(g => `<option value="${g.code}">${g.code} · ${g.course} курс · ${escapeHtml(g.specialtyName)}</option>`).join('');
  if (selectedCode && sorted.some(g => g.code === selectedCode)) formGroup.value = selectedCode;
}
function openAddStudentForm() {
  formMode = 'add'; formEditId = null;
  studentFormTitle.textContent = '➕ Добавить студента';
  formLn.value = ''; formFn.value = ''; formMn.value = '';
  formDeleteBtn.style.display = 'none';
  populateFormGroups(state.group !== 'all' ? state.group : null);
  const dg = document.querySelector('input[name="formGender"][value="m"]'); if (dg) dg.checked = true;
  studentFormOverlay.classList.add('open');
  setTimeout(() => formLn.focus(), 100);
}
function openEditStudentForm(student) {
  formMode = 'edit'; formEditId = student.id;
  studentFormTitle.textContent = '✏️ Редактировать данные';
  formLn.value = student.ln; formFn.value = student.fn; formMn.value = student.mn;
  formDeleteBtn.style.display = 'inline-flex';
  populateFormGroups(student.group);
  const gi = document.querySelector(`input[name="formGender"][value="${student.gender || 'm'}"]`); if (gi) gi.checked = true;
  studentFormOverlay.classList.add('open');
  setTimeout(() => formLn.focus(), 100);
}
function closeStudentForm() { studentFormOverlay.classList.remove('open'); releaseBodyScroll(); }
document.getElementById('studentFormClose').addEventListener('click', closeStudentForm);
document.getElementById('formCancelBtn').addEventListener('click', closeStudentForm);
studentFormOverlay.addEventListener('click', (e) => { if (e.target === studentFormOverlay) closeStudentForm(); });
document.getElementById('addStudentBtn').addEventListener('click', openAddStudentForm);
document.getElementById('modalInfoBtn').addEventListener('click', () => { if (currentStudent) openEditStudentForm(currentStudent); });
formDeleteBtn.addEventListener('click', () => { if (formMode === 'edit' && formEditId !== null) deleteStudentById(formEditId); });
document.getElementById('modalDeleteBtn').addEventListener('click', () => { if (currentStudent) deleteStudentById(currentStudent.id); });
studentForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const ln = formLn.value.trim(), fn = formFn.value.trim(), mn = formMn.value.trim();
  const groupCode = formGroup.value;
  const gender = document.querySelector('input[name="formGender"]:checked')?.value || 'm';
  if (!ln || !fn) { push('Заполните фамилию и имя', 'error', 2200); return; }
  if (!groupCode) { push('Выберите группу', 'error', 2200); return; }
  const groupMeta = GROUPS.find(g => g.code === groupCode);
  if (!groupMeta) return;
  const spec = groupMeta.spec, course = groupMeta.course;
  const avatar = (AVATARS[spec] || ['🧑','👩'])[gender === 'm' ? 0 : 1];
  if (formMode === 'add') {
    let newId = 1001;
    const usedIds = new Set([...STUDENTS.map(s => s.id), ...Object.keys(customStudents).map(Number), ...trash.filter(t => t.type === 'custom').map(t => t.id)]);
    while (usedIds.has(newId)) newId++;
    const level = 0.7 + Math.random() * 0.18;
    const grades = generateGrades(newId, level, spec, course);
    const att = generateAttendance(newId, level);
    const student = { id:newId, ln, fn, mn, group:groupCode, course, spec, gender, avatar, level, fullName:`${ln} ${fn} ${mn}`, shortName:`${fn} ${ln}`, grades, attendance:att, subjectAttendance:generateSubjectAttendance(newId, att, getSubjectsFor(spec, course)), gpa:0, gpaRaw:0, totalGrades:0, distribution:{5:0,4:0,3:0,2:0}, levelClass:'low', statusText:'Требует внимания', specialtyName:SPECIALTIES[spec] || 'Группа', isCustom:true, isEdited:false };
    recomputeStudent(student);
    customStudents[newId] = student;
    saveAll(); buildAll();
    renderGroups(); renderTeachers(); updateGroupOptions(); renderStudents();
    closeStudentForm();
    push(`«${ln} ${fn}» добавлен в ${groupCode}`, 'success', 3000);
  } else {
    const student = STUDENTS.find(s => s.id === formEditId);
    if (!student) return;
    const oldGroup = student.group;
    savedInfo[student.id] = { ln, fn, mn, group:groupCode, course, spec, gender, avatar };
    if (oldGroup !== groupCode && (student.course !== course || student.spec !== spec)) {
      const level = student.level || 0.75;
      const seed = student.id * 777 + Date.now() % 100000;
      const newAtt = generateAttendance(seed, level);
      savedEdits[student.id] = { grades:generateGrades(seed, level, spec, course), attendance:newAtt, subjectAttendance:generateSubjectAttendance(seed, newAtt, getSubjectsFor(spec, course)), semesterGrades:{} };
    }
    saveAll(); buildAll();
    renderGroups(); renderTeachers(); updateGroupOptions(); renderStudents();
    closeStudentForm();
    const fresh = STUDENTS.find(s => s.id === formEditId);
    if (fresh && currentStudent && currentStudent.id === fresh.id) openModal(fresh);
    push('Данные обновлены', 'success', 2500);
  }
});

function addToTrash(entry) { trash.unshift(entry); if (trash.length > 100) trash.length = 100; }
function updateTrashButton() {
  const btn = document.getElementById('trashBtn');
  const lbl = document.getElementById('trashLabel');
  if (!btn || !lbl) return;
  const n = trash.length;
  lbl.textContent = n > 0 ? `Корзина (${n})` : 'Корзина';
  btn.classList.toggle('has-items', n > 0);
}
function deleteStudentById(id) {
  const student = STUDENTS.find(s => s.id === id);
  if (!student) return;
  if (!confirm(`Удалить студента «${student.fullName}»?`)) return;
  const editsSnapshot = savedEdits[id] ? JSON.parse(JSON.stringify(savedEdits[id])) : null;
  if (student.isCustom || customStudents[id]) {
    const snap = JSON.parse(JSON.stringify(customStudents[id]));
    addToTrash({ id, type:'custom', name:student.fullName, group:student.group, deletedAt:Date.now(), snapshot:snap, editsSnapshot });
    delete customStudents[id];
  } else {
    addToTrash({ id, type:'base', name:student.fullName, group:student.group, deletedAt:Date.now(), editsSnapshot });
    hiddenIds.add(id);
  }
  delete savedInfo[id]; delete savedEdits[id];
  saveAll(); buildAll();
  if (state.group !== 'all' && !GROUPS.some(g => g.code === state.group)) {
    state.group = 'all';
    const gf = document.getElementById('groupFilter'); if (gf) gf.value = 'all';
  }
  renderGroups(); renderTeachers(); updateGroupOptions(); renderStudents(); updateTrashButton();
  closeStudentForm(); closeModal();
  push(`«${student.fullName}» удалён`, 'info', 2500);
}

const trashOverlay = document.getElementById('trashOverlay');
const trashList = document.getElementById('trashList');
function renderTrash() {
  if (trash.length === 0) {
    trashList.innerHTML = `<div class="trash-empty"><div class="trash-empty-icon">✨</div><div>Корзина пуста</div></div>`;
    return;
  }
  trashList.innerHTML = trash.map((t, i) => {
    const dt = new Date(t.deletedAt || Date.now());
    const dateStr = dt.toLocaleDateString('ru-RU') + ' ' + dt.toLocaleTimeString('ru-RU', {hour:'2-digit',minute:'2-digit'});
    return `<div class="trash-item"><div class="trash-item-info"><div class="trash-item-name">${escapeHtml(t.name)}</div><div class="trash-item-meta">${escapeHtml(t.group || '—')} · удалён ${dateStr}</div></div><div class="trash-item-actions"><button class="trash-restore" data-trash-idx="${i}" type="button">↩ Восстановить</button><button class="trash-delete" data-trash-idx="${i}" type="button">🗑️ Удалить</button></div></div>`;
  }).join('');
  trashList.querySelectorAll('.trash-restore').forEach(btn => {
    btn.addEventListener('click', () => restoreFromTrash(parseInt(btn.dataset.trashIdx, 10)));
  });
  trashList.querySelectorAll('.trash-delete').forEach(btn => {
    btn.addEventListener('click', () => deleteFromTrash(parseInt(btn.dataset.trashIdx, 10)));
  });
}

function deleteFromTrash(idx) {
  const entry = trash[idx];
  if (!entry) return;
  if (!confirm(`Удалить «${entry.name}» из корзины навсегда? Восстановить будет невозможно.`)) return;
  trash.splice(idx, 1);
  saveAll();
  renderTrash();
  updateTrashButton();
  push(`«${entry.name}» удалён из корзины навсегда`, 'info', 2500);
}
function restoreFromTrash(idx) {
  const entry = trash[idx];
  if (!entry) return;
  if (entry.type === 'custom') customStudents[entry.id] = JSON.parse(JSON.stringify(entry.snapshot));
  else hiddenIds.delete(entry.id);
  if (entry.editsSnapshot) savedEdits[entry.id] = JSON.parse(JSON.stringify(entry.editsSnapshot));
  trash.splice(idx, 1);
  saveAll(); buildAll();
  renderGroups(); renderTeachers(); updateGroupOptions(); renderStudents(); renderTrash(); updateTrashButton();
  push(`«${entry.name}» восстановлен`, 'success', 2500);
}
function openTrashModal() { renderTrash(); trashOverlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeTrashModal() { trashOverlay.classList.remove('open'); releaseBodyScroll(); }
document.getElementById('trashBtn').addEventListener('click', openTrashModal);
document.getElementById('trashClose').addEventListener('click', closeTrashModal);
trashOverlay.addEventListener('click', (e) => { if (e.target === trashOverlay) closeTrashModal(); });

const transferOverlay = document.getElementById('transferOverlay');
const transferGroupSelect = document.getElementById('transferGroup');
const transferHint = document.getElementById('transferHint');
let transferStudent = null;
function populateTransferGroups(currentCode) {
  const byCourse = {};
  GROUPS_META.forEach(g => { if (!byCourse[g.course]) byCourse[g.course] = []; byCourse[g.course].push(g); });
  let html = '<option value="">— Выберите —</option>';
  [1,2,3,4].forEach(c => {
    if (!byCourse[c]) return;
    html += `<optgroup label="${c} курс">`;
    byCourse[c].forEach(g => {
      const isCur = g.code === currentCode;
      html += `<option value="${g.code}"${isCur ? ' disabled' : ''}>${g.code} · ${escapeHtml(SPECIALTIES[g.spec] || g.spec)}${isCur ? ' · текущая' : ''}</option>`;
    });
    html += '</optgroup>';
  });
  transferGroupSelect.innerHTML = html;
}
function openTransferModal(student) {
  transferStudent = student;
  document.getElementById('transferStudentName').textContent = student.fullName;
  document.getElementById('transferCurrentGroup').textContent = student.group;
  transferHint.style.display = 'none';
  populateTransferGroups(student.group);
  transferGroupSelect.value = '';
  transferOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeTransferModal() { transferOverlay.classList.remove('open'); transferStudent = null; releaseBodyScroll(); }
document.getElementById('modalTransferBtn').addEventListener('click', () => { if (currentStudent) openTransferModal(currentStudent); });
document.getElementById('transferClose').addEventListener('click', closeTransferModal);
document.getElementById('transferCancel').addEventListener('click', closeTransferModal);
transferOverlay.addEventListener('click', (e) => { if (e.target === transferOverlay) closeTransferModal(); });
transferGroupSelect.addEventListener('change', () => {
  const code = transferGroupSelect.value;
  if (!code || !transferStudent) { transferHint.style.display = 'none'; return; }
  const meta = GROUPS_META.find(g => g.code === code);
  if (!meta) return;
  if (meta.course !== transferStudent.course || meta.spec !== transferStudent.spec) {
    transferHint.style.display = 'block';
    transferHint.textContent = '⚠️ Смена курса/специальности приведёт к перегенерации предметов и оценок.';
  } else transferHint.style.display = 'none';
});
document.getElementById('transferConfirm').addEventListener('click', () => {
  if (!transferStudent) return;
  const newGroupCode = transferGroupSelect.value;
  if (!newGroupCode) { push('Выберите группу', 'error', 2200); return; }
  if (newGroupCode === transferStudent.group) { push('Уже в этой группе', 'error', 2200); return; }
  const newMeta = GROUPS_META.find(g => g.code === newGroupCode);
  if (!newMeta) return;
  const student = transferStudent;
  const oldGroup = student.group;
  const courseChanged = newMeta.course !== student.course;
  const specChanged = newMeta.spec !== student.spec;
  savedInfo[student.id] = { ...(savedInfo[student.id] || {}), ln:student.ln, fn:student.fn, mn:student.mn, group:newGroupCode, course:newMeta.course, spec:newMeta.spec, gender:student.gender, avatar:(AVATARS[newMeta.spec] || ['🧑','👩'])[student.gender === 'm' ? 0 : 1] };
  if (courseChanged || specChanged) {
    const level = student.level || 0.75;
    const seed = student.id * 777 + Date.now() % 100000;
    const newGrades = generateGrades(seed, level, newMeta.spec, newMeta.course);
    const newAtt = generateAttendance(seed, level);
    savedEdits[student.id] = { grades:newGrades, attendance:newAtt, subjectAttendance:generateSubjectAttendance(seed, newAtt, getSubjectsFor(newMeta.spec, newMeta.course)), semesterGrades:{} };
  }
  saveAll(); buildAll();
  renderGroups(); renderTeachers(); updateGroupOptions(); renderStudents();
  closeTransferModal(); closeModal();
  push(courseChanged || specChanged ? `«${student.fullName}» переведён в ${newGroupCode}` : `«${student.fullName}» переведён из ${oldGroup} в ${newGroupCode}`, 'success', 3200);
});

const teacherFormOverlay = document.getElementById('teacherFormOverlay');
const teacherForm = document.getElementById('teacherForm');
const teacherFormTitle = document.getElementById('teacherFormTitle');
const tFormLn = document.getElementById('tFormLn');
const tFormFn = document.getElementById('tFormFn');
const tFormMn = document.getElementById('tFormMn');
const tFormSubjects = document.getElementById('tFormSubjects');
const tFormRole = document.getElementById('tFormRole');
const teacherFormDeleteBtn = document.getElementById('teacherFormDeleteBtn');
let teacherFormEditId = null;
function openTeacherForm(teacher) {
  if (teacher) {
    teacherFormEditId = teacher.id;
    teacherFormTitle.textContent = '✏️ Редактировать преподавателя';
    tFormLn.value = teacher.ln; tFormFn.value = teacher.fn; tFormMn.value = teacher.mn;
    tFormSubjects.value = (teacher.subjects || []).join(', ');
    tFormRole.value = teacher.role || 'teacher';
    teacherFormDeleteBtn.style.display = 'inline-flex';
    const gi = document.querySelector(`input[name="tFormGender"][value="${teacher.gender || 'm'}"]`); if (gi) gi.checked = true;
  } else {
    teacherFormEditId = null;
    teacherFormTitle.textContent = '➕ Добавить преподавателя';
    tFormLn.value = ''; tFormFn.value = ''; tFormMn.value = ''; tFormSubjects.value = '';
    tFormRole.value = 'teacher';
    teacherFormDeleteBtn.style.display = 'none';
    const dg = document.querySelector('input[name="tFormGender"][value="m"]'); if (dg) dg.checked = true;
  }
  teacherFormOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => tFormLn.focus(), 100);
}
function closeTeacherForm() { teacherFormOverlay.classList.remove('open'); releaseBodyScroll(); }
document.getElementById('teacherFormClose').addEventListener('click', closeTeacherForm);
document.getElementById('teacherFormCancel').addEventListener('click', closeTeacherForm);
teacherFormOverlay.addEventListener('click', (e) => { if (e.target === teacherFormOverlay) closeTeacherForm(); });
document.getElementById('addTeacherBtn').addEventListener('click', () => openTeacherForm(null));
teacherFormDeleteBtn.addEventListener('click', () => {
  if (teacherFormEditId === null) return;
  if (!confirm('Удалить преподавателя?')) return;
  const t = TEACHERS.find(x => x.id === teacherFormEditId);
  if (!t) return;
  if (t.isCustom || (customTeachers[t.id] && !customTeachers[t.id].__override)) delete customTeachers[t.id];
  else {
    if (!customTeachers['__hidden_base_teachers__']) customTeachers['__hidden_base_teachers__'] = [];
    customTeachers['__hidden_base_teachers__'].push(t.id);
    delete customTeachers[t.id];
  }
  Object.keys(classTeacherMap).forEach(code => { if (classTeacherMap[code] === t.id) delete classTeacherMap[code]; });
  Object.keys(subjectTeacherMap).forEach(k => { if (subjectTeacherMap[k] === t.id) delete subjectTeacherMap[k]; });
  saveAll(); buildAll();
  renderGroups(); renderTeachers(); updateGroupOptions(); renderStudents();
  closeTeacherForm();
  push(`Преподаватель «${t.fullName}» удалён`, 'info', 2500);
});
teacherForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const ln = tFormLn.value.trim(), fn = tFormFn.value.trim(), mn = tFormMn.value.trim();
  const gender = document.querySelector('input[name="tFormGender"]:checked')?.value || 'm';
  const subjects = tFormSubjects.value.split(',').map(s => s.trim()).filter(Boolean);
  const role = tFormRole.value || 'teacher';
  if (!ln || !fn) { push('Заполните фамилию и имя', 'error', 2200); return; }
  if (teacherFormEditId !== null) {
    const t = TEACHERS.find(x => x.id === teacherFormEditId);
    if (!t) return;
    const base = { ...t, ln, fn, mn, gender, subjects, role, fullName:`${ln} ${fn} ${mn}`, avatar:getRoleAvatar(role, gender) };
    if (t.isCustom) customTeachers[t.id] = base;
    else customTeachers[t.id] = { ...base, __override:true };
    saveAll(); buildAll();
    renderGroups(); renderTeachers(); updateGroupOptions(); renderStudents();
    closeTeacherForm();
    push('Данные преподавателя обновлены', 'success', 2500);
  } else {
    let newId = 5000;
    const usedIds = new Set([...TEACHERS.map(t => t.id), ...Object.keys(customTeachers).filter(k => !isNaN(Number(k))).map(Number)]);
    while (usedIds.has(newId)) newId++;
    customTeachers[newId] = { id:newId, ln, fn, mn, fullName:`${ln} ${fn} ${mn}`, gender, subjects, role, isCustom:true, avatar:getRoleAvatar(role, gender) };
    saveAll(); buildAll();
    renderGroups(); renderTeachers(); updateGroupOptions(); renderStudents();
    closeTeacherForm();
    push(`Преподаватель «${ln} ${fn}» добавлен`, 'success', 2800);
  }
});

const pickerOverlay = document.getElementById('pickerOverlay');
const pickerList = document.getElementById('pickerList');
const pickerSearch = document.getElementById('pickerSearch');
const pickerTitle = document.getElementById('pickerTitle');
let pickerContext = null;
function openTeacherPicker(groupCode, mode, subject) {
  pickerContext = { groupCode, mode, subject };
  const group = GROUPS.find(g => g.code === groupCode);
  if (!group) return;
  if (mode === 'class') pickerTitle.textContent = `Классный руководитель для ${groupCode}`;
  else pickerTitle.textContent = `Преподаватель по «${subject}» в ${groupCode}`;
  pickerSearch.value = '';
  renderPickerList();
  pickerOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function renderPickerList() {
  if (!pickerContext) return;
  const q = pickerSearch.value.trim().toLowerCase();
  const group = GROUPS.find(g => g.code === pickerContext.groupCode);
  if (!group) return;
  const groupSubjects = getSubjectsFor(group.spec, group.course);
  let list = TEACHERS.slice();
  if (q) list = list.filter(t => t.fullName.toLowerCase().includes(q));
  if (pickerContext.mode === 'subject' && pickerContext.subject) {
    const preferred = list.filter(t => t.subjects.includes(pickerContext.subject));
    const others = list.filter(t => !t.subjects.includes(pickerContext.subject));
    list = [...preferred, ...others];
  } else {
    const preferred = list.filter(t => t.subjects.some(s => groupSubjects.includes(s)));
    const others = list.filter(t => !t.subjects.some(s => groupSubjects.includes(s)));
    list = [...preferred, ...others];
  }
  const currentId = pickerContext.mode === 'class' ? classTeacherMap[pickerContext.groupCode] : subjectTeacherMap[pickerContext.groupCode + '|' + pickerContext.subject];
  pickerList.innerHTML = list.map(t => {
    const roleInfo = getRoleInfo(t.role);
    const roleBadge = (t.role && t.role !== 'teacher') ? `<span style="display:inline-block;font-size:0.65rem;padding:1px 7px;border-radius:60px;margin-left:4px;background:${roleInfo.bg};color:${roleInfo.color};font-weight:700;">${roleInfo.icon} ${escapeHtml(roleInfo.short)}</span>` : '';
    return `<div class="picker-item${t.id === currentId ? ' current' : ''}" data-tid="${t.id}" style="${t.id === currentId ? 'border:2px solid var(--color-accent)' : ''}"><div><div class="picker-item-name">${escapeHtml(t.ln)} ${escapeHtml(t.fn)} ${escapeHtml(t.mn || '')}${t.id === currentId ? ' ✓' : ''}${roleBadge}</div><div class="picker-item-meta">${t.subjects.slice(0, 3).map(escapeHtml).join(', ')}${t.subjects.length > 3 ? '…' : ''}</div></div></div>`;
  }).join('') || '<div style="text-align:center;padding:30px;opacity:0.6;">Ничего не найдено</div>';
  pickerList.querySelectorAll('.picker-item').forEach(item => {
    item.addEventListener('click', () => {
      const tid = Number(item.dataset.tid);
      if (pickerContext.mode === 'class') {
        classTeacherMap[pickerContext.groupCode] = tid;
        push(`Классный руководитель ${pickerContext.groupCode} назначен`, 'success', 2200);
      } else {
        subjectTeacherMap[pickerContext.groupCode + '|' + pickerContext.subject] = tid;
        push(`Преподаватель по «${pickerContext.subject}» назначен`, 'success', 2200);
      }
      saveAll(); buildAll();
      renderGroups(); renderTeachers();
      if (journalOverlay.classList.contains('open')) renderJournal();
      closePicker();
    });
  });
}
function closePicker() { pickerOverlay.classList.remove('open'); pickerContext = null; releaseBodyScroll(); }
document.getElementById('pickerClose').addEventListener('click', closePicker);
pickerOverlay.addEventListener('click', (e) => { if (e.target === pickerOverlay) closePicker(); });
pickerSearch.addEventListener('input', renderPickerList);

const journalOverlay = document.getElementById('journalOverlay');
const journalEditBtn = document.getElementById('journalEditBtn');
const journalTable = document.getElementById('journalTable');
function openJournal(groupCode) {
  const group = GROUPS.find(g => g.code === groupCode);
  if (!group) return;
  currentGroupCodeForJournal = groupCode;
  journalEditMode = false;
  journalSemesterView = 'all';
  document.querySelectorAll('.journal-sem-tab').forEach(t => t.classList.toggle('active', t.dataset.sem === 'all'));
  journalEditBtn.classList.remove('active');
  journalEditBtn.textContent = '✏️';
  renderJournal();
  journalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeJournal() { journalOverlay.classList.remove('open'); currentGroupCodeForJournal = null; journalEditMode = false; releaseBodyScroll(); }
document.getElementById('journalClose').addEventListener('click', closeJournal);
journalOverlay.addEventListener('click', (e) => { if (e.target === journalOverlay) closeJournal(); });
journalEditBtn.addEventListener('click', () => {
  journalEditMode = !journalEditMode;
  journalEditBtn.classList.toggle('active', journalEditMode);
  journalEditBtn.textContent = journalEditMode ? '💾' : '✏️';
  renderJournal();
});
document.querySelectorAll('.journal-sem-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.journal-sem-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    journalSemesterView = tab.dataset.sem;
    renderJournal();
  });
});
function shortSubject(s) {
  const map = { 'Математика':'Матем.','Литература':'Лит.','Русский язык':'Рус.яз','Иностранный язык':'Ин.яз','Физическая культура':'Физра','Обществознание':'Общ.','Информатика':'Информ.','Информационные системы':'ИС','Базы данных':'БД','Учебная практика':'Практика','Производственная практика':'Пр.пр.','Преддипломная практика':'Предд.пр.','Дипломное проектирование':'Диплом','Экономика':'Экон.' };
  if (map[s]) return map[s];
  if (s.length > 14) return s.slice(0, 12) + '…';
  return s;
}
function renderJournal() {
  const group = GROUPS.find(g => g.code === currentGroupCodeForJournal);
  if (!group) return;
  const subjects = getSubjectsFor(group.spec, group.course);
  const students = group.students.slice().sort((a,b) => a.fullName.localeCompare(b.fullName));
  const ct = getClassTeacherOf(group.code);
  const ctName = ct ? `${ct.ln} ${ct.fn} ${ct.mn || ''}`.trim() : 'не назначен';
  document.getElementById('journalTitle').textContent = `📖 Журнал ${group.code}`;
  document.getElementById('journalSubtitle').textContent = `${group.specialtyName} · ${group.course} курс · ${students.length} студентов · ${subjects.length} предметов`;
  const infoEl = document.getElementById('journalInfo');
  infoEl.innerHTML = `<span style="font-size:1.4rem;">👨‍🏫</span><div style="flex:1;min-width:200px;"><strong style="display:block;margin-bottom:2px;">Классный руководитель</strong><span style="font-size:0.92rem;">${escapeHtml(ctName)}</span></div><button class="journal-info-btn" id="journalChangeCT">Сменить</button>`;
  document.getElementById('journalChangeCT').addEventListener('click', () => openTeacherPicker(group.code, 'class'));
  if (students.length === 0) {
    journalTable.innerHTML = `<tbody><tr><td style="text-align:center;padding:40px;opacity:0.6;">Нет студентов</td></tr></tbody>`;
    return;
  }
  if (journalSemesterView === 'all') renderJournalAllView(group, subjects, students);
  else renderJournalSemesterView(group, subjects, students);
}
function renderJournalAllView(group, subjects, students) {
  let head = '<thead><tr><th>Студент</th>';
  subjects.forEach(s => {
    const st = getSubjectTeacher(group.code, s);
    const stName = st ? `${st.ln} ${st.fn.charAt(0)}.` : '—';
    head += `<th title="${escapeHtml(s)} — преподаватель: ${escapeHtml(st ? st.fullName : 'не назначен')}"><div class="journal-subject-header"><span>${escapeHtml(shortSubject(s))}</span><span class="journal-subject-teacher">${escapeHtml(stName)}</span></div></th>`;
  });
  head += '<th>Ср.</th></tr></thead>';
  let body = '<tbody>';
  students.forEach(stu => {
    body += `<tr><td class="student-name-cell" data-student-id="${stu.id}">${escapeHtml(stu.ln)} ${escapeHtml(stu.fn)}</td>`;
    subjects.forEach(sub => {
      const grades = stu.grades[sub] || [];
      const subEsc = escapeHtml(sub);
      let cell = '<div class="journal-cell-wrap">';
      grades.forEach((g, idx) => {
        cell += `<span class="journal-grade-chip g${g}" data-student-id="${stu.id}" data-subject="${subEsc}" data-idx="${idx}">${g}</span>`;
        cell += `<button class="journal-mini-remove" data-student-id="${stu.id}" data-subject="${subEsc}" data-idx="${idx}" title="Удалить">×</button>`;
      });
      cell += `<button class="journal-mini-add" data-student-id="${stu.id}" data-subject="${subEsc}" title="Добавить">+</button>`;
      cell += '</div>';
      body += `<td>${cell}</td>`;
    });
    body += `<td style="font-weight:800;">${stu.gpa.toFixed(2)}</td></tr>`;
  });
  body += '</tbody>';
  let foot = '<tfoot><tr><td>Средний по предмету</td>';
  subjects.forEach(s => {
    const vals = students.flatMap(s2 => s2.grades[s] || []);
    const avg = vals.length > 0 ? vals.reduce((a,b)=>a+b,0)/vals.length : 0;
    foot += `<td>${avg > 0 ? avg.toFixed(2) : '—'}</td>`;
  });
  const overallAvg = students.reduce((s,x) => s + x.gpaRaw, 0) / students.length;
  foot += `<td>${overallAvg.toFixed(2)}</td></tr></tfoot>`;
  journalTable.innerHTML = head + body + foot;
  journalTable.classList.toggle('journal-edit-mode', journalEditMode);
  attachJournalAllHandlers();
}
function attachJournalAllHandlers() {
  journalTable.querySelectorAll('.student-name-cell').forEach(cell => {
    cell.addEventListener('click', () => {
      const student = STUDENTS.find(x => x.id === Number(cell.dataset.studentId));
      if (student) { closeJournal(); openModal(student); }
    });
  });
  if (!journalEditMode) return;
  journalTable.querySelectorAll('.journal-grade-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const stuId = Number(chip.dataset.studentId);
      const subject = chip.dataset.subject;
      const idx = parseInt(chip.dataset.idx, 10);
      const student = STUDENTS.find(x => x.id === stuId);
      if (!student || !student.grades[subject]) return;
      const cur = student.grades[subject][idx];
      student.grades[subject][idx] = cur === 5 ? 2 : cur + 1;
      afterJournalGradeEdit(student);
    });
  });
  journalTable.querySelectorAll('.journal-mini-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const stuId = Number(btn.dataset.studentId);
      const subject = btn.dataset.subject;
      const idx = parseInt(btn.dataset.idx, 10);
      const student = STUDENTS.find(x => x.id === stuId);
      if (!student || !student.grades[subject]) return;
      if (student.grades[subject].length <= 1) { push('Нельзя удалить последнюю оценку', 'error', 2200); return; }
      student.grades[subject].splice(idx, 1);
      afterJournalGradeEdit(student);
    });
  });
  journalTable.querySelectorAll('.journal-mini-add').forEach(btn => {
    btn.addEventListener('click', () => {
      const stuId = Number(btn.dataset.studentId);
      const subject = btn.dataset.subject;
      const student = STUDENTS.find(x => x.id === stuId);
      if (!student) return;
      if (!student.grades[subject]) student.grades[subject] = [];
      student.grades[subject].push(4);
      afterJournalGradeEdit(student);
    });
  });
}
function renderJournalSemesterView(group, subjects, students) {
  const semLabel = journalSemesterView === '1' ? '1 семестр' : journalSemesterView === '2' ? '2 семестр' : 'Год';
  const semKey = journalSemesterView;
  let head = `<thead><tr><th>Студент · ${semLabel}</th>`;
  subjects.forEach(s => {
    const st = getSubjectTeacher(group.code, s);
    const stName = st ? `${st.ln} ${st.fn.charAt(0)}.` : '—';
    head += `<th title="${escapeHtml(s)} — ${escapeHtml(st ? st.fullName : 'не назначен')}"><div class="journal-subject-header"><span>${escapeHtml(shortSubject(s))}</span><span class="journal-subject-teacher">${escapeHtml(stName)}</span></div></th>`;
  });
  head += '<th>Ср.сем.</th></tr></thead>';
  let body = '<tbody>';
  students.forEach(stu => {
    body += `<tr><td class="student-name-cell" data-student-id="${stu.id}">${escapeHtml(stu.ln)} ${escapeHtml(stu.fn)}</td>`;
    let sum = 0, count = 0;
    subjects.forEach(sub => {
      const g = getSemesterGrade(stu, sub, semKey);
      const subEsc = escapeHtml(sub);
      if (g) {
        const cls = g.manual ? '' : ' auto';
        body += `<td><span class="journal-sem-grade g${g.value}${cls}" data-student-id="${stu.id}" data-subject="${subEsc}" data-sem="${semKey}" title="${g.manual ? 'Вручную' : 'Авто'}">${g.value}</span></td>`;
        sum += g.value; count++;
      } else {
        body += `<td><span class="journal-sem-empty">—</span></td>`;
      }
    });
    const avg = count > 0 ? (sum / count).toFixed(2) : '—';
    body += `<td style="font-weight:800;">${avg}</td></tr>`;
  });
  body += '</tbody>';
  let foot = '<tfoot><tr><td>Средний семестровый</td>';
  subjects.forEach(sub => {
    let sum = 0, count = 0;
    students.forEach(stu => { const g = getSemesterGrade(stu, sub, semKey); if (g) { sum += g.value; count++; } });
    foot += `<td>${count > 0 ? (sum/count).toFixed(2) : '—'}</td>`;
  });
  foot += '<td>—</td></tr></tfoot>';
  journalTable.innerHTML = head + body + foot;
  journalTable.classList.toggle('journal-edit-mode', journalEditMode);
  journalTable.querySelectorAll('.student-name-cell').forEach(cell => {
    cell.addEventListener('click', () => {
      const student = STUDENTS.find(x => x.id === Number(cell.dataset.studentId));
      if (student) { closeJournal(); openModal(student); }
    });
  });
  if (journalEditMode) {
    journalTable.querySelectorAll('.journal-sem-grade').forEach(chip => {
      chip.addEventListener('click', () => {
        const stuId = Number(chip.dataset.studentId);
        const subject = chip.dataset.subject;
        const sem = chip.dataset.sem;
        const student = STUDENTS.find(x => x.id === stuId);
        if (!student) return;
        const cur = parseInt(chip.textContent.trim(), 10) || 3;
        const next = cur >= 5 ? 2 : cur + 1;
        setSemesterGrade(student, subject, sem === 'year' ? 'final' : sem, next);
        saveAll(); buildAll();
        renderGroups(); renderStudents(); renderJournal();
        push('Семестровая оценка обновлена', 'success', 900);
      });
    });
  }
}
function afterJournalGradeEdit(student) {
  recomputeStudent(student);
  student.isEdited = true;
  savedEdits[student.id] = { ...(savedEdits[student.id] || {}), grades:student.grades, attendance:student.attendance, subjectAttendance:student.subjectAttendance };
  saveAll(); buildAll();
  renderGroups(); renderStudents(); renderJournal();
  push('Оценка обновлена', 'success', 900);
}

function generateGroupExcelReport(groupCode) {
  if (typeof window.XLSX === 'undefined') { push('❌ XLSX-библиотека не загружена.', 'error', 5000); return; }
  const group = GROUPS.find(g => g.code === groupCode);
  if (!group) { push('Группа не найдена', 'error', 2200); return; }
  if (group.students.length === 0) { push('В группе нет студентов', 'error', 2200); return; }
  try {
    const today = new Date().toLocaleDateString('ru-RU');
    const ct = getClassTeacherOf(group.code);
    const sorted = group.students.slice().sort((a, b) => a.fullName.localeCompare(b.fullName));
    const rows = [];
    rows.push(['ДТПА им. А.В. Захарченко']);
    rows.push([`Отчёт по группе ${group.code}`]);
    rows.push([`Специальность: ${group.specialtyName}`]);
    rows.push([`Курс: ${group.course} · Студентов: ${group.students.length}`]);
    rows.push([ct ? `Классный руководитель: ${ct.fullName}` : 'Классный руководитель: не назначен']);
    rows.push([`Дата формирования: ${today}`]);
    rows.push([]);
    rows.push(['Средний балл группы', group.avgGpa.toFixed(2), 'Посещаемость', `${group.avgAtt}%`]);
    rows.push(['Отличники', group.counts.excellent, 'Хорошисты', group.counts.good, 'Успевают', group.counts.average, 'Требуют внимания', group.counts.low]);
    rows.push([]);
    rows.push(['№', 'ФИО студента', 'Ср. балл', 'Посещаемость', '«5»', '«4»', '«3»', '«2»', 'Статус']);
    sorted.forEach((s, i) => {
      rows.push([i + 1, s.fullName, s.gpa.toFixed(2), `${s.attendance}%`, s.distribution[5], s.distribution[4], s.distribution[3], s.distribution[2], s.statusText]);
    });
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch:5 }, { wch:38 }, { wch:12 }, { wch:14 }, { wch:6 }, { wch:6 }, { wch:6 }, { wch:6 }, { wch:22 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Группа ${group.code}`);
    XLSX.writeFile(wb, `Отчёт_${group.code}_${new Date().toISOString().slice(0,10)}.xlsx`);
    push(`📊 Excel-отчёт сохранён`, 'success', 3500);
  } catch (err) { console.error(err); push(`Ошибка Excel: ${err.message || 'неизвестно'}`, 'error', 5000); }
}

function exportJournalToExcel() {
  if (typeof window.XLSX === 'undefined') { push('❌ XLSX-библиотека не загружена', 'error', 5000); return; }
  const group = GROUPS.find(g => g.code === currentGroupCodeForJournal);
  if (!group) return;
  const subjects = getSubjectsFor(group.spec, group.course);
  const students = group.students.slice().sort((a,b) => a.fullName.localeCompare(b.fullName));
  if (students.length === 0) { push('В группе нет студентов', 'error', 2200); return; }
  try {
    const rows = [];
    const view = journalSemesterView;
    const viewLabel = view === 'all' ? 'Все оценки' : view === '1' ? 'Семестр 1' : view === '2' ? 'Семестр 2' : 'Год';
    rows.push([`Журнал ${group.code} — ${viewLabel}`]);
    rows.push([`Специальность: ${group.specialtyName} · ${group.course} курс · Студентов: ${students.length}`]);
    rows.push([`Дата: ${new Date().toLocaleDateString('ru-RU')}`]);
    rows.push([]);
    if (view === 'all') {
      rows.push(['ФИО студента', ...subjects, 'Средний балл']);
      students.forEach(stu => {
        const row = [`${stu.ln} ${stu.fn}`];
        subjects.forEach(sub => { row.push((stu.grades[sub] || []).join(' ')); });
        row.push(stu.gpa.toFixed(2));
        rows.push(row);
      });
    } else {
      rows.push(['ФИО студента', ...subjects, 'Средний сем.']);
      students.forEach(stu => {
        const row = [`${stu.ln} ${stu.fn}`];
        let sum = 0, count = 0;
        subjects.forEach(sub => {
          const g = getSemesterGrade(stu, sub, view);
          if (g) { row.push(`${g.value}${g.manual ? '' : ' (авто)'}`); sum += g.value; count++; }
          else row.push('—');
        });
        row.push(count > 0 ? (sum / count).toFixed(2) : '—');
        rows.push(row);
      });
    }
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const cols = [{ wch:30 }];
    subjects.forEach(() => cols.push({ wch:18 }));
    cols.push({ wch:14 });
    ws['!cols'] = cols;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, viewLabel);
    XLSX.writeFile(wb, `Журнал_${group.code}_${viewLabel}_${new Date().toISOString().slice(0,10)}.xlsx`);
    push(`📊 Журнал сохранён`, 'success', 3500);
  } catch (err) { console.error(err); push(`Ошибка Excel: ${err.message || 'неизвестно'}`, 'error', 5000); }
}

function exportToExcel() {
  if (typeof window.XLSX === 'undefined') { push('❌ XLSX-библиотека не загружена', 'error', 5000); return; }
  if (STUDENTS.length === 0) { push('Нет студентов для экспорта', 'error', 2200); return; }
  try {
    const data = STUDENTS.map(s => ({ 'ФИО':s.fullName, 'Группа':s.group, 'Курс':s.course, 'Специальность':s.specialtyName, 'Средний балл':s.gpa, 'Посещаемость':`${s.attendance}%`, 'Оценок «5»':s.distribution[5], 'Оценок «4»':s.distribution[4], 'Оценок «3»':s.distribution[3], 'Оценок «2»':s.distribution[2], 'Всего оценок':s.totalGrades, 'Статус':s.statusText }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [{ wch:32 }, { wch:12 }, { wch:7 }, { wch:48 }, { wch:14 }, { wch:14 }, { wch:12 }, { wch:12 }, { wch:12 }, { wch:12 }, { wch:14 }, { wch:22 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Успеваемость");
    XLSX.writeFile(wb, `Успеваемость_всех_студентов_${new Date().toISOString().slice(0,10)}.xlsx`);
    push(`📊 Excel-файл сохранён`, 'success', 3500);
  } catch (err) { console.error(err); push(`Ошибка Excel: ${err.message || 'неизвестно'}`, 'error', 5000); }
}
document.getElementById('exportExcelBtn').addEventListener('click', exportToExcel);
document.getElementById('journalExcelBtn').addEventListener('click', exportJournalToExcel);

/* ==================== ЗАЯВКИ ==================== */
const CLAIM_TYPE_LABELS = { transfer:'🚚 Перевод в другую группу', resit:'📝 Пересдать предмет', question:'❓ Вопрос по оценке', other:'📌 Другое' };
const CLAIM_STATUS_LABELS = {
  new:{ label:'Новая', color:'#0066CC', bg:'rgba(0,102,204,0.12)', icon:'🆕' },
  in_progress:{ label:'В работе', color:'#E67E00', bg:'rgba(230,126,0,0.12)', icon:'⚙️' },
  done:{ label:'Решена', color:'#2E8B2E', bg:'rgba(46,139,46,0.12)', icon:'✅' },
  rejected:{ label:'Отклонена', color:'#E64646', bg:'rgba(230,70,70,0.12)', icon:'❌' }
};

const claimFormOverlay = document.getElementById('claimFormOverlay');
const claimForm = document.getElementById('claimForm');
const claimFormTitle = document.getElementById('claimFormTitle');
const claimStudentInfo = document.getElementById('claimStudentInfo');
const claimType = document.getElementById('claimType');
const claimText = document.getElementById('claimText');
let claimFormStudentId = null;

function updateClaimTypeFields() {
  const type = claimType.value;
  const resitFields = document.getElementById('claimResitFields');
  const transferFields = document.getElementById('claimTransferFields');
  if (resitFields) resitFields.style.display = type === 'resit' ? 'block' : 'none';
  if (transferFields) transferFields.style.display = type === 'transfer' ? 'block' : 'none';
  if (type === 'resit') populateClaimResitFields();
  if (type === 'transfer') populateClaimTransferFields();
}

function populateClaimResitFields() {
  const subjectSel = document.getElementById('claimSubject');
  const teacherSel = document.getElementById('claimTeacher');
  if (!subjectSel || !teacherSel) return;
  if (claimFormStudentId) {
    const student = STUDENTS.find(s => s.id === claimFormStudentId);
    if (student) {
      const subs = Object.keys(student.grades);
      subjectSel.innerHTML = subs.length ? subs.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('') : '<option value="">— нет предметов —</option>';
    } else { subjectSel.innerHTML = '<option value="">— студент не найден —</option>'; }
  } else { subjectSel.innerHTML = '<option value="">— выберите студента —</option>'; }
  populateClaimTeachersForSubject();
  subjectSel.onchange = populateClaimTeachersForSubject;
}

function populateClaimTeachersForSubject() {
  const subjectSel = document.getElementById('claimSubject');
  const teacherSel = document.getElementById('claimTeacher');
  const hintEl = document.getElementById('claimTeacherHint');
  if (!subjectSel || !teacherSel) return;
  const subject = subjectSel.value;
  const student = claimFormStudentId ? STUDENTS.find(s => s.id === claimFormStudentId) : null;
  const groupCode = student ? student.group : null;
  if (!subject) { teacherSel.innerHTML = '<option value="">— Сначала выберите предмет —</option>'; if (hintEl) { hintEl.style.display = 'none'; hintEl.textContent = ''; } return; }
  const teachers = getTeachersForSubject(subject, groupCode);
  if (teachers.length === 0) { teacherSel.innerHTML = '<option value="">— нет преподавателей —</option>'; if (hintEl) { hintEl.style.display = 'block'; hintEl.textContent = '⚠️ Ни у одного преподавателя не указан этот предмет.'; } return; }
  const assignedId = groupCode ? subjectTeacherMap[groupCode + '|' + subject] : null;
  teacherSel.innerHTML = '<option value="">— Выберите преподавателя —</option>' + teachers.map(t => { const isA = assignedId === t.id; return `<option value="${t.id}"${isA ? ' selected' : ''}>${escapeHtml(t.fullName)}${isA ? ' · ✓ ведёт у группы' : ''}</option>`; }).join('');
  if (hintEl) { hintEl.style.display = 'block'; hintEl.textContent = `Показаны только преподаватели, ведущие «${subject}»`; }
}

function populateClaimTransferFields() {
  const sel = document.getElementById('claimTargetGroup');
  const info = document.getElementById('claimTargetGroupInfo');
  if (!sel) return;
  const currentGroup = claimFormStudentId ? (STUDENTS.find(s => s.id === claimFormStudentId)?.group) : null;
  const byCourse = {};
  GROUPS_META.forEach(g => { if (!byCourse[g.course]) byCourse[g.course] = []; byCourse[g.course].push(g); });
  let html = '<option value="">— Выберите группу —</option>';
  [1,2,3,4].forEach(c => {
    if (!byCourse[c]) return;
    html += `<optgroup label="${c} курс">`;
    byCourse[c].forEach(g => {
      const isCur = g.code === currentGroup;
      html += `<option value="${g.code}"${isCur ? ' disabled' : ''}>${g.code} · ${escapeHtml(SPECIALTIES[g.spec] || g.spec)}${isCur ? ' · текущая' : ''}</option>`;
    });
    html += '</optgroup>';
  });
  sel.innerHTML = html;
  const updateInfo = () => {
    if (!info) return;
    const code = sel.value;
    if (!code) { info.style.display = 'none'; return; }
    const meta = GROUPS_META.find(g => g.code === code);
    if (!meta) { info.style.display = 'none'; return; }
    info.style.display = 'block';
    info.innerHTML = `<strong>${escapeHtml(SPECIALTIES[meta.spec] || meta.spec)}</strong><br><span style="opacity:0.75;">${meta.course} курс · ${meta.code}</span>`;
  };
  sel.onchange = updateInfo;
  updateInfo();
}
if (claimType) claimType.addEventListener('change', updateClaimTypeFields);

function openClaimForm(student) {
  if (student) {
    claimFormStudentId = student.id;
    claimFormTitle.textContent = '📩 Заявка от студента';
    claimStudentInfo.style.display = 'block';
    claimStudentInfo.innerHTML = `<strong>${escapeHtml(student.fullName)}</strong> · ${escapeHtml(student.group)} · ${student.course} курс`;
  } else {
    claimFormStudentId = null;
    claimFormTitle.textContent = '📩 Новая заявка';
    claimStudentInfo.style.display = 'none';
  }
  claimType.value = 'transfer';
  claimText.value = '';
  updateClaimTypeFields();
  claimFormOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => claimText.focus(), 150);
}
function closeClaimForm() { claimFormOverlay.classList.remove('open'); claimFormStudentId = null; releaseBodyScroll(); }

document.getElementById('claimFormClose').addEventListener('click', closeClaimForm);
document.getElementById('claimCancelBtn').addEventListener('click', closeClaimForm);
claimFormOverlay.addEventListener('click', (e) => { if (e.target === claimFormOverlay) closeClaimForm(); });
document.getElementById('modalClaimBtn').addEventListener('click', () => { if (currentStudent) openClaimForm(currentStudent); });

claimForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const type = claimType.value;
  const text = claimText.value.trim();
  if (!text) { push('Напишите текст заявки', 'error', 2200); return; }
  const student = claimFormStudentId ? STUDENTS.find(s => s.id === claimFormStudentId) : null;
  const claim = { id:Date.now(), studentId:student ? student.id : null, studentName:student ? student.fullName : null, studentGroup:student ? student.group : null, type, text, status:'new', createdAt:Date.now(), adminNote:'', resolvedAt:null, subject:'', teacherId:null, resitDate:'', resitGrade:null, targetGroup:'', resitExecuted:false, transferExecuted:false, resitPassed:null };
  if (type === 'resit') {
    const subjectVal = document.getElementById('claimSubject').value;
    const teacherVal = document.getElementById('claimTeacher').value;
    if (claimFormStudentId) {
      if (!subjectVal) { push('Выберите предмет', 'error', 2200); return; }
      if (!teacherVal) { push('Выберите преподавателя', 'error', 2200); return; }
    }
    claim.subject = subjectVal || '';
    claim.teacherId = Number(teacherVal) || null;
  }
  if (type === 'transfer') {
    claim.targetGroup = document.getElementById('claimTargetGroup').value;
    if (!claim.targetGroup) { push('Выберите группу', 'error', 2200); return; }
  }
  claims.unshift(claim);
  if (claims.length > 200) claims.length = 200;
  saveAll();
  updateClaimsBadge();
  if (isAdminView) renderAdminAll();
  closeClaimForm();
  push('✅ Заявка отправлена!', 'success', 2800);
});

function updateClaimsBadge() {
  const badge = document.getElementById('claimsBadge');
  if (badge) {
    const unread = claims.filter(c => c.status === 'new').length;
    if (unread > 0) { badge.textContent = unread > 99 ? '99+' : unread; badge.style.display = 'inline-flex'; }
    else badge.style.display = 'none';
  }
  renderDashboard();
}

const claimsAdminOverlay = document.getElementById('claimsAdminOverlay');
const claimsAdminList = document.getElementById('claimsAdminList');
const claimsStats = document.getElementById('claimsStats');

function openClaimsAdmin() { renderClaimsAdmin(); claimsAdminOverlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeClaimsAdmin() { claimsAdminOverlay.classList.remove('open'); releaseBodyScroll(); }

function renderClaimsAdmin() {
  const counts = { new:0, in_progress:0, done:0, rejected:0 };
  claims.forEach(c => { if (counts[c.status] != null) counts[c.status]++; });
  claimsStats.innerHTML = `Всего: <strong>${claims.length}</strong> · Новых: <strong style="color:#E64646;">${counts.new}</strong> · В работе: <strong style="color:#E67E00;">${counts.in_progress}</strong> · Решено: <strong style="color:#2E8B2E;">${counts.done}</strong>`;
  if (claims.length === 0) { claimsAdminList.innerHTML = `<div class="trash-empty"><div class="trash-empty-icon">📭</div><div>Заявок пока нет</div></div>`; return; }
  claimsAdminList.innerHTML = claims.map((c, i) => {
    const st = CLAIM_STATUS_LABELS[c.status] || CLAIM_STATUS_LABELS.new;
    const dt = new Date(c.createdAt);
    const dateStr = dt.toLocaleDateString('ru-RU') + ' ' + dt.toLocaleTimeString('ru-RU', {hour:'2-digit',minute:'2-digit'});
    const studentInfo = c.studentName ? `${escapeHtml(c.studentName)}${c.studentGroup ? ' <span style="opacity:0.65;">(' + escapeHtml(c.studentGroup) + ')</span>' : ''}` : '<em style="opacity:0.6;">без привязки</em>';
    let resitBadge = '';
    if (c.type === 'resit' && c.resitExecuted) {
      resitBadge = c.resitPassed ? `<span class="resit-result-badge passed">✅ Пересдал(а)${c.resitGrade ? ' · ' + c.resitGrade : ''}</span>` : `<span class="resit-result-badge failed">❌ Не пересдал(а)</span>`;
    }
    return `<div class="claim-card"><div class="claim-header"><div style="flex:1;min-width:200px;"><div class="claim-type">${CLAIM_TYPE_LABELS[c.type] || c.type}${resitBadge}</div><div class="claim-meta">${studentInfo} · ${dateStr}</div></div><span class="claim-status" style="background:${st.bg};color:${st.color};">${st.icon} ${st.label}</span></div><div class="claim-text">${escapeHtml(c.text).replace(/\n/g, '<br>')}</div>${c.adminNote ? `<div style="margin-bottom:8px;font-size:0.82rem;padding:8px 10px;background:rgba(0,102,204,0.06);border-radius:8px;border-left:3px solid var(--color-accent);"><strong>💬 Админ:</strong> ${escapeHtml(c.adminNote)}</div>` : ''}<div class="claim-actions"><button class="claim-action-btn" data-claim-idx="${i}" data-status="in_progress" style="background:#E67E00;" type="button">⚙️ В работу</button><button class="claim-action-btn" data-claim-idx="${i}" data-status="done" style="background:#2E8B2E;" type="button">✓ Решена</button><button class="claim-action-btn" data-claim-idx="${i}" data-status="rejected" style="background:#E64646;" type="button">✕ Отклонить</button><button class="claim-action-btn" data-claim-idx="${i}" data-status="delete" style="background:#666;" type="button">🗑 Удалить</button></div></div>`;
  }).join('');
  claimsAdminList.querySelectorAll('button[data-claim-idx]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.claimIdx, 10);
      const status = btn.dataset.status;
      const claim = claims[idx];
      if (!claim) return;
      if (status === 'delete') { if (!confirm('Удалить заявку?')) return; claims.splice(idx, 1); }
      else { claim.status = status; if (status === 'done' || status === 'rejected') claim.resolvedAt = Date.now(); else claim.resolvedAt = null; }
      saveAll(); updateClaimsBadge(); renderClaimsAdmin();
      if (isAdminView) renderAdminAll();
    });
  });
}
document.getElementById('claimsAdminClose').addEventListener('click', closeClaimsAdmin);
claimsAdminOverlay.addEventListener('click', (e) => { if (e.target === claimsAdminOverlay) closeClaimsAdmin(); });
document.getElementById('claimsAdminNewBtn').addEventListener('click', () => { closeClaimsAdmin(); openClaimForm(null); });
document.getElementById('navClaimsLink').addEventListener('click', (e) => { e.preventDefault(); openClaimsAdmin(); });
document.getElementById('openFullAdminBtn').addEventListener('click', () => { closeClaimsAdmin(); tryEnterAdmin(); });

function executeResit(claimId) {
  const claim = claims.find(c => c.id === claimId);
  if (!claim) return;
  if (!claim.studentId) { push('Заявка не привязана к студенту', 'error', 2400); return; }
  const student = STUDENTS.find(s => s.id === claim.studentId);
  if (!student) { push('Студент не найден', 'error', 2400); return; }
  if (!claim.subject) { push('Не указан предмет', 'error', 2400); return; }
  if (claim.resitPassed === null || claim.resitPassed === undefined) { push('Укажите результат', 'error', 2600); return; }
  const dateInput = document.querySelector(`[data-resit-date="${claimId}"]`);
  if (dateInput && dateInput.value) claim.resitDate = dateInput.value;
  if (claim.resitPassed) {
    const gradeSelect = document.querySelector(`[data-resit-grade="${claimId}"]`);
    const grade = gradeSelect && gradeSelect.value ? Number(gradeSelect.value) : claim.resitGrade;
    if (!grade || grade < 3 || grade > 5) { push('Выберите оценку (3/4/5)', 'error', 2400); return; }
    if (!student.grades[claim.subject]) student.grades[claim.subject] = [];
    student.grades[claim.subject].push(grade);
    claim.resitGrade = grade;
    recomputeStudent(student);
    student.isEdited = true;
    savedEdits[student.id] = { ...(savedEdits[student.id] || {}), grades:student.grades, attendance:student.attendance, subjectAttendance:student.subjectAttendance };
  } else {
    claim.resitGrade = null;
  }
  claim.resitExecuted = true;
  claim.status = 'done';
  claim.resolvedAt = Date.now();
  saveAll(); buildAll();
  renderGroups(); renderStudents(); renderAdminAll(); updateClaimsBadge();
  if (claim.resitPassed) push(`✅ Пересдал(а): «${claim.subject}» — оценка ${claim.resitGrade}`, 'success', 3500);
  else push(`❌ Не пересдал(а): «${claim.subject}»`, 'error', 3500);
}

function executeTransfer(claimId) {
  const claim = claims.find(c => c.id === claimId);
  if (!claim) return;
  if (!claim.studentId) { push('Заявка не привязана к студенту', 'error', 2400); return; }
  const student = STUDENTS.find(s => s.id === claim.studentId);
  if (!student) { push('Студент не найден', 'error', 2400); return; }
  const groupSelect = document.querySelector(`[data-transfer-group="${claimId}"]`);
  const newGroupCode = (groupSelect && groupSelect.value) ? groupSelect.value : claim.targetGroup;
  if (!newGroupCode) { push('Выберите целевую группу', 'error', 2400); return; }
  if (newGroupCode === student.group) { push('Студент уже в этой группе', 'error', 2400); return; }
  const newMeta = GROUPS_META.find(g => g.code === newGroupCode);
  if (!newMeta) return;
  const oldGroup = student.group;
  const courseChanged = newMeta.course !== student.course;
  const specChanged = newMeta.spec !== student.spec;
  savedInfo[student.id] = { ...(savedInfo[student.id] || {}), ln:student.ln, fn:student.fn, mn:student.mn, group:newGroupCode, course:newMeta.course, spec:newMeta.spec, gender:student.gender, avatar:(AVATARS[newMeta.spec] || ['🧑','👩'])[student.gender === 'm' ? 0 : 1] };
  if (courseChanged || specChanged) {
    const level = student.level || 0.75;
    const seed = student.id * 777 + Date.now() % 100000;
    const newAtt = generateAttendance(seed, level);
    savedEdits[student.id] = { grades:generateGrades(seed, level, newMeta.spec, newMeta.course), attendance:newAtt, subjectAttendance:generateSubjectAttendance(seed, newAtt, getSubjectsFor(newMeta.spec, newMeta.course)), semesterGrades:{} };
  }
  claim.targetGroup = newGroupCode;
  claim.transferExecuted = true;
  claim.status = 'done';
  claim.resolvedAt = Date.now();
  saveAll(); buildAll();
  renderGroups(); renderStudents(); renderAdminAll(); updateClaimsBadge();
  push(`✅ Студент переведён из ${oldGroup} в ${newGroupCode}`, 'success', 3500);
}

const passwordOverlay = document.getElementById('passwordOverlay');
const passwordForm = document.getElementById('passwordForm');
const passwordInput = document.getElementById('passwordInput');
const passwordError = document.getElementById('passwordError');

function openPasswordModal() {
  passwordInput.value = '';
  passwordError.classList.remove('show');
  passwordOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => passwordInput.focus(), 150);
}
function closePasswordModal() { passwordOverlay.classList.remove('open'); passwordInput.value = ''; passwordError.classList.remove('show'); releaseBodyScroll(); }
document.getElementById('passwordClose').addEventListener('click', closePasswordModal);
document.getElementById('passwordCancel').addEventListener('click', closePasswordModal);
passwordOverlay.addEventListener('click', (e) => { if (e.target === passwordOverlay) closePasswordModal(); });

passwordForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const pwd = passwordInput.value;
  if (pwd === ADMIN_PASSWORD) {
    isAdminAuthed = true;
    closePasswordModal();
    switchToAdmin();
    push('✅ Добро пожаловать в админ-панель', 'success', 2500);
  } else {
    passwordError.classList.add('show');
    passwordInput.select();
  }
});

/* ==== АДМИН-ПАНЕЛЬ: открытие/закрытие через Ctrl+Shift+A ==== */
function switchToAdmin() {
  if (adminOrigin === 'public') {
    document.getElementById('publicSite').style.display = 'none';
    document.getElementById('perfApp').style.display = 'block';
  }
  document.getElementById('mainApp').style.display = 'none';
  document.getElementById('adminApp').style.display = 'block';
  const perfNav = document.getElementById('perfNav');
  if (perfNav) perfNav.style.display = 'none';
  isAdminView = true;
  window.dispatchEvent(new CustomEvent('dtpa:admin-auth-state', { detail: { authorized: !!isAdminAuthed } }));
  renderAdminAll();
  window.scrollTo({ top:0, behavior:'smooth' });
}
function switchToMain() {
  document.getElementById('adminApp').style.display = 'none';
  isAdminView = false;
  window.dispatchEvent(new CustomEvent('dtpa:admin-auth-state', { detail: { authorized: !!isAdminAuthed } }));
  if (adminOrigin === 'public') {
    document.getElementById('perfApp').style.display = 'none';
    document.getElementById('publicSite').style.display = 'block';
  } else {
    document.getElementById('mainApp').style.display = 'block';
    const perfNav = document.getElementById('perfNav');
    if (perfNav) perfNav.style.display = 'block';
  }
  updateClaimsBadge();
  window.scrollTo({ top:0, behavior:'smooth' });
}
function tryEnterAdmin() {
  if (isAdminView) { switchToMain(); return; }
  const publicVisible = document.getElementById('publicSite').style.display !== 'none';
  adminOrigin = publicVisible ? 'public' : 'perf';
  if (isAdminAuthed) { switchToAdmin(); return; }
  openPasswordModal();
}

// Делаем выход доступным из глобального showPublicSite
window.__dtpaExitAdmin = function () {
  if (isAdminView) switchToMain();
};

// Горячая клавиша Ctrl+Shift+A (и Cmd+Shift+A на macOS, а также русская «ф»)
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.code === 'KeyA' || e.key === 'A' || e.key === 'a' || e.key === 'ф' || e.key === 'Ф')) {
    e.preventDefault();
    tryEnterAdmin();
  }
});

function readRegisteredAccounts() {
  try {
    const raw = localStorage.getItem('dontpa-accounts-v1');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function escapeRegisteredText(value) {
  return String(value == null ? '' : value).replace(/[&<>\"']/g, (ch) => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', "'":'&#39;'
  }[ch]));
}

function formatRegisteredDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('ru-RU');
}

function renderRegisteredUsers() {
  const tbody = document.getElementById('registeredUsersBody');
  const summary = document.getElementById('registeredUsersSummary');
  const empty = document.getElementById('registeredUsersEmpty');
  const search = document.getElementById('registeredUsersSearch');
  if (!tbody || !summary || !empty) return;

  const accounts = readRegisteredAccounts().slice().sort((a, b) => Number(b.registeredAt || 0) - Number(a.registeredAt || 0));
  const query = String(search && search.value || '').trim().toLowerCase();
  const roleLabels = { student:'Студент', teacher:'Преподаватель', admin:'Администратор' };
  const filtered = accounts.filter(account => {
    const haystack = [account.name, account.email, account.phone, account.group, roleLabels[account.role] || account.role]
      .join(' ').toLowerCase();
    return !query || haystack.includes(query);
  });

  summary.textContent = `Всего зарегистрировано: ${accounts.length}. Отображается: ${filtered.length}.`;
  tbody.innerHTML = filtered.map((account, index) => {
    const safeEmail = String(account.email || '').replace(/[&<>"'`]/g, c => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;', '`':'&#96;'
    }[c]));
    return `
    <tr>
      <td>${index + 1}</td>
      <td>${escapeRegisteredText(account.name || '—')}</td>
      <td>${escapeRegisteredText(account.email || '—')}</td>
      <td>${escapeRegisteredText(account.phone || '—')}</td>
      <td>${escapeRegisteredText(roleLabels[account.role] || account.role || 'Студент')}</td>
      <td>${escapeRegisteredText(account.group || '—')}</td>
      <td>${escapeRegisteredText(formatRegisteredDate(account.registeredAt))}</td>
      <td><button type="button" class="user-delete-btn" data-email="${safeEmail}" title="Удалить аккаунт">🗑️ Удалить</button></td>
    </tr>`;
  }).join('');
  tbody.querySelectorAll('.user-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteRegisteredUser(btn.getAttribute('data-email') || ''));
  });
  empty.hidden = filtered.length > 0;
  const table = tbody.closest('table');
  if (table) table.style.display = filtered.length ? '' : 'none';
  if (accounts.length === 0 && query) empty.textContent = 'В локальном хранилище браузера пока нет регистраций.';
  else if (query && filtered.length === 0) empty.textContent = 'По вашему запросу ничего не найдено.';
  else empty.textContent = 'Пока нет зарегистрированных аккаунтов в хранилище этого браузера.';
}

function deleteRegisteredUser(email) {
  const accountEmail = String(email || '').trim().toLowerCase();
  if (!accountEmail) { push('Не удалось определить аккаунт для удаления', 'error', 2400); return; }
  if (!confirm(`Удалить аккаунт «${email}»? Это действие необратимо.`)) return;
  try {
    const raw = localStorage.getItem('dontpa-accounts-v1');
    const accounts = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(accounts)) { push('Не удалось прочитать список аккаунтов', 'error', 2400); return; }
    const idx = accounts.findIndex(a => String(a.email || '').toLowerCase() === accountEmail);
    if (idx < 0) { push('Аккаунт не найден', 'error', 2400); return; }
    const removed = accounts.splice(idx, 1)[0];
    localStorage.setItem('dontpa-accounts-v1', JSON.stringify(accounts));
    push(`Аккаунт «${removed.name || removed.email}» удалён`, 'success', 2400);
    renderRegisteredUsers();
  } catch (e) {
    push('Не удалось удалить аккаунт: ' + (e.message || 'ошибка'), 'error', 3000);
  }
}

function exportRegisteredUsers() {
  const accounts = readRegisteredAccounts().slice().sort((a, b) => Number(b.registeredAt || 0) - Number(a.registeredAt || 0));
  if (!accounts.length) {
    push('Список пуст: пока нечего экспортировать.', 'info', 3000);
    return;
  }
  const rows = [['ФИО', 'Email', 'Телефон', 'Роль', 'Группа', 'Дата регистрации']];
  const roleLabels = { student:'Студент', teacher:'Преподаватель', admin:'Администратор' };
  accounts.forEach(account => rows.push([
    account.name || '', account.email || '', account.phone || '',
    roleLabels[account.role] || account.role || 'Студент', account.group || '',
    formatRegisteredDate(account.registeredAt)
  ]));
  const csv = '\uFEFF' + rows.map(row => row.map(value => '"' + String(value == null ? '' : value).replace(/"/g, '""') + '"').join(';')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'зарегистрированные-пользователи.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  push('Список зарегистрированных пользователей экспортирован.', 'success', 3500);
}

function renderAdminAll() { renderAdminStats(); renderAdminGroupFilter(); renderAdminClaims(); renderRegisteredUsers(); }

const registeredUsersSearch = document.getElementById('registeredUsersSearch');
if (registeredUsersSearch) registeredUsersSearch.addEventListener('input', renderRegisteredUsers);
const refreshRegisteredUsersBtn = document.getElementById('refreshRegisteredUsersBtn');
if (refreshRegisteredUsersBtn) refreshRegisteredUsersBtn.addEventListener('click', renderRegisteredUsers);
const exportRegisteredUsersBtn = document.getElementById('exportRegisteredUsersBtn');
if (exportRegisteredUsersBtn) exportRegisteredUsersBtn.addEventListener('click', exportRegisteredUsers);
window.addEventListener('storage', event => {
  if (event.key === 'dontpa-accounts-v1') renderRegisteredUsers();
});

function renderAdminStats() {
  const counts = { all:claims.length, new:0, in_progress:0, done:0, rejected:0 };
  claims.forEach(c => { if (counts[c.status] != null) counts[c.status]++; });
  const items = [
    { key:'all', label:'Всего заявок', icon:'📋', color:'#002D62', bg:'rgba(0,45,98,0.06)' },
    { key:'new', label:'Новых', icon:'🆕', color:'#0066CC', bg:'rgba(0,102,204,0.08)' },
    { key:'in_progress', label:'В работе', icon:'⚙️', color:'#E67E00', bg:'rgba(230,126,0,0.08)' },
    { key:'done', label:'Решено', icon:'✅', color:'#2E8B2E', bg:'rgba(46,139,46,0.08)' },
    { key:'rejected', label:'Отклонено', icon:'❌', color:'#E64646', bg:'rgba(230,70,70,0.08)' }
  ];
  const grid = document.getElementById('adminStatsGrid');
  grid.innerHTML = items.map(it => `
    <div class="stat-card ${adminState.status === it.key ? 'active' : ''}" style="border-left-color:${it.color};background:${it.bg};" data-stat-key="${it.key}">
      <div class="stat-icon">${it.icon}</div><div class="stat-info"><div class="stat-value" style="color:${it.color};">${counts[it.key]}</div><div class="stat-label">${it.label}</div></div>
    </div>
  `).join('');
  grid.querySelectorAll('.stat-card').forEach(card => {
    card.addEventListener('click', () => {
      const key = card.dataset.statKey;
      document.querySelectorAll('#adminStatusTabs .status-tab').forEach(t => t.classList.remove('active'));
      const target = document.querySelector(`#adminStatusTabs .status-tab[data-status="${key}"]`);
      if (target) target.classList.add('active');
      adminState.status = key;
      renderAdminAll();
    });
  });
}

function renderAdminGroupFilter() {
  const groups = new Set();
  claims.forEach(c => { if (c.studentGroup) groups.add(c.studentGroup); });
  const sel = document.getElementById('adminGroupFilter');
  const sorted = [...groups].sort();
  const cur = sel.value;
  sel.innerHTML = '<option value="all">Все группы</option>' + sorted.map(g => `<option value="${escapeHtml(g)}">${escapeHtml(g)}</option>`).join('');
  if (sorted.includes(cur)) sel.value = cur;
  else if (sorted.includes(adminState.group)) sel.value = adminState.group;
  else { sel.value = 'all'; adminState.group = 'all'; }
}

function getFilteredAdminClaims() {
  let list = claims.slice();
  if (adminState.status !== 'all') list = list.filter(c => c.status === adminState.status);
  if (adminState.type !== 'all') list = list.filter(c => c.type === adminState.type);
  if (adminState.group !== 'all') list = list.filter(c => c.studentGroup === adminState.group);
  if (adminState.search) {
    const q = adminState.search.toLowerCase();
    list = list.filter(c => (c.text && c.text.toLowerCase().includes(q)) || (c.studentName && c.studentName.toLowerCase().includes(q)) || (c.studentGroup && c.studentGroup.toLowerCase().includes(q)) || (c.subject && c.subject.toLowerCase().includes(q)));
  }
  const statusOrder = { new:0, in_progress:1, done:2, rejected:3 };
  switch (adminState.sort) {
    case 'date-desc': list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)); break;
    case 'date-asc': list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)); break;
    case 'status': list.sort((a, b) => { const sa = statusOrder[a.status] ?? 99; const sb = statusOrder[b.status] ?? 99; if (sa !== sb) return sa - sb; return (b.createdAt || 0) - (a.createdAt || 0); }); break;
  }
  return list;
}

function buildResolutionHTML(c) {
  if (c.type === 'resit') {
    const student = c.studentId ? STUDENTS.find(s => s.id === c.studentId) : null;
    const groupCode = student ? student.group : null;
    let subjectSelHTML;
    if (student) {
      const subs = Object.keys(student.grades);
      subjectSelHTML = subs.length ? subs.map(s => `<option value="${escapeHtml(s)}" ${c.subject === s ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('') : '<option value="">— нет предметов —</option>';
    } else { subjectSelHTML = `<option value="${escapeHtml(c.subject || '')}">${escapeHtml(c.subject || '—')}</option>`; }
    const teachersForSubject = getTeachersForSubject(c.subject, groupCode);
    let teacherSelHTML;
    if (teachersForSubject.length === 0) { teacherSelHTML = '<option value="">— нет преподавателей —</option>'; }
    else { teacherSelHTML = '<option value="">— Выберите —</option>' + teachersForSubject.map(t => `<option value="${t.id}" ${c.teacherId === t.id ? 'selected' : ''}>${escapeHtml(t.fullName)}</option>`).join(''); }
    const resultSelHTML = `<select data-resit-result="${c.id}" ${c.resitExecuted ? 'disabled' : ''}><option value="">— Укажите результат —</option><option value="passed" ${c.resitPassed === true ? 'selected' : ''}>✅ Пересдал(а)</option><option value="failed" ${c.resitPassed === false ? 'selected' : ''}>❌ Не пересдал(а)</option></select>`;
    const gradeDisplay = c.resitPassed === false ? 'display:none;' : '';
    const gradeSelHTML = `<select data-resit-grade="${c.id}" ${c.resitExecuted ? 'disabled' : ''}><option value="">—</option><option value="5" ${c.resitGrade == 5 ? 'selected' : ''}>5</option><option value="4" ${c.resitGrade == 4 ? 'selected' : ''}>4</option><option value="3" ${c.resitGrade == 3 ? 'selected' : ''}>3</option></select>`;
    let executedHTML;
    if (c.resitExecuted) {
      if (c.resitPassed) executedHTML = `<div class="claim-resolution-executed">✅ Пересдал(а) · оценка ${c.resitGrade}${c.resitDate ? ' · ' + escapeHtml(c.resitDate) : ''}</div>`;
      else executedHTML = `<div class="claim-resolution-executed" style="background:rgba(230,70,70,0.14);color:#E64646;">❌ Не пересдал(а)${c.resitDate ? ' · ' + escapeHtml(c.resitDate) : ''}</div>`;
    } else { executedHTML = `<button class="exec-btn resit" data-execute-resit="${c.id}" type="button">✓ Зафиксировать результат</button>`; }
    const warningHTML = !c.studentId ? `<div class="claim-resolution-warning">⚠️ Заявка без привязки к студенту — выставить оценку нельзя.</div>` : '';
    return `<div class="claim-resolution"><div class="claim-resolution-title">📚 Пересдача предмета</div>${warningHTML}<div class="claim-resolution-row"><div class="filter-control"><label>Предмет</label><select data-resit-subject="${c.id}" ${c.resitExecuted ? 'disabled' : ''}>${subjectSelHTML}</select></div><div class="filter-control"><label>Преподаватель</label><select data-resit-teacher="${c.id}" ${c.resitExecuted ? 'disabled' : ''}>${teacherSelHTML}</select></div></div><div class="claim-resolution-row"><div class="filter-control"><label>Дата пересдачи</label><input type="date" data-resit-date="${c.id}" value="${c.resitDate || ''}" ${c.resitExecuted ? 'disabled' : ''}></div><div class="filter-control"><label>Результат</label>${resultSelHTML}</div></div><div class="claim-resolution-row" id="resit-grade-wrap-${c.id}" style="${gradeDisplay}"><div class="filter-control"><label>Итоговая оценка</label>${gradeSelHTML}</div></div>${executedHTML}</div>`;
  }
  if (c.type === 'transfer') {
    const targetMeta = c.targetGroup ? GROUPS_META.find(g => g.code === c.targetGroup) : null;
    const student = c.studentId ? STUDENTS.find(s => s.id === c.studentId) : null;
    let groupOptions = '<option value="">— Выберите группу —</option>';
    const byCourse = {};
    GROUPS_META.forEach(g => { if (!byCourse[g.course]) byCourse[g.course] = []; byCourse[g.course].push(g); });
    [1,2,3,4].forEach(cr => {
      if (!byCourse[cr]) return;
      groupOptions += `<optgroup label="${cr} курс">`;
      byCourse[cr].forEach(g => {
        const isCur = student && g.code === student.group;
        groupOptions += `<option value="${g.code}" ${c.targetGroup === g.code ? 'selected' : ''} ${isCur ? 'disabled' : ''}>${g.code} · ${escapeHtml(SPECIALTIES[g.spec] || g.spec)}${isCur ? ' · текущая' : ''}</option>`;
      });
      groupOptions += '</optgroup>';
    });
    const specValue = targetMeta ? (SPECIALTIES[targetMeta.spec] || targetMeta.spec) : '—';
    const executedHTML = c.transferExecuted ? `<div class="claim-resolution-executed">✅ Студент переведён в ${escapeHtml(c.targetGroup)}</div>` : `<button class="exec-btn transfer" data-execute-transfer="${c.id}" type="button">🚚 Выполнить перевод</button>`;
    const warningHTML = !c.studentId ? `<div class="claim-resolution-warning">⚠️ Заявка без привязки к студенту.</div>` : '';
    return `<div class="claim-resolution"><div class="claim-resolution-title">🚚 Перевод в другую группу</div>${warningHTML}<div class="claim-resolution-row"><div class="filter-control"><label>Целевая группа</label><select data-transfer-group="${c.id}" ${c.transferExecuted ? 'disabled' : ''}>${groupOptions}</select></div><div class="filter-control"><label>Специальность</label><input type="text" id="transfer-spec-${c.id}" value="${escapeHtml(specValue)}" readonly class="claim-resolution-readonly"></div></div><div class="claim-resolution-row"><div class="filter-control"><label>Курс</label><input type="text" id="transfer-course-${c.id}" value="${targetMeta ? targetMeta.course + ' курс' : '—'}" readonly class="claim-resolution-readonly"></div><div class="filter-control"><label>Текущая группа</label><input type="text" value="${student ? escapeHtml(student.group) : '—'}" readonly class="claim-resolution-readonly"></div></div>${executedHTML}</div>`;
  }
  return '';
}

function renderAdminClaims() {
  const list = getFilteredAdminClaims();
  const container = document.getElementById('adminClaimsList');
  const info = document.getElementById('adminResultsInfo');
  const bulk = document.getElementById('adminBulkActions');
  if (claims.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📭</div><h3>Заявок пока нет</h3><p>Когда появятся новые заявки, они отобразятся здесь.</p></div>`;
    info.textContent = ''; bulk.style.display = 'none';
    return;
  }
  if (list.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🔍</div><h3>Ничего не найдено</h3><p>Попробуйте изменить фильтры.</p></div>`;
    info.textContent = `Показано 0 из ${claims.length}`; bulk.style.display = 'none';
    return;
  }
  const listIds = new Set(list.map(c => c.id));
  adminSelectedIds.forEach(id => { if (!listIds.has(id)) adminSelectedIds.delete(id); });
  container.innerHTML = list.map(c => {
    const st = CLAIM_STATUS_LABELS[c.status] || CLAIM_STATUS_LABELS.new;
    const ty = (function () {
      const types = { transfer:{ label:'Перевод в другую группу', icon:'🚚', color:'#0066CC' }, resit:{ label:'Пересдать предмет', icon:'📝', color:'#E67E00' }, question:{ label:'Вопрос по оценке', icon:'❓', color:'#8B008B' }, other:{ label:'Другое', icon:'📌', color:'#5F6A6A' } };
      return types[c.type] || types.other;
    })();
    const dt = new Date(c.createdAt);
    const dateStr = dt.toLocaleDateString('ru-RU') + ' ' + dt.toLocaleTimeString('ru-RU', {hour:'2-digit',minute:'2-digit'});
    const resolvedStr = c.resolvedAt ? new Date(c.resolvedAt).toLocaleDateString('ru-RU') + ' ' + new Date(c.resolvedAt).toLocaleTimeString('ru-RU', {hour:'2-digit',minute:'2-digit'}) : null;
    const studentInfo = c.studentName ? `<strong>${escapeHtml(c.studentName)}</strong>${c.studentGroup ? ' · <span class="group-tag">' + escapeHtml(c.studentGroup) + '</span>' : ''}` : '<em style="opacity:0.6;">Без привязки</em>';
    const isSelected = adminSelectedIds.has(c.id);
    const resolutionHTML = buildResolutionHTML(c);
    let resitBadge = '';
    if (c.type === 'resit' && c.resitExecuted) {
      resitBadge = c.resitPassed ? `<span class="resit-result-badge passed">✅ Пересдал(а)${c.resitGrade ? ' · ' + c.resitGrade : ''}</span>` : `<span class="resit-result-badge failed">❌ Не пересдал(а)</span>`;
    }
    return `<div class="claim-card ${isSelected ? 'is-selected' : ''}" data-claim-id="${c.id}"><div class="claim-head"><label class="claim-check" title="Выбрать заявку"><input type="checkbox" data-claim-check="${c.id}" ${isSelected ? 'checked' : ''}></label><div class="claim-head-main"><div class="claim-type" style="color:${ty.color};"><span style="font-size:1.2rem;">${ty.icon}</span> ${ty.label}${resitBadge}</div><div class="claim-meta">${studentInfo}<span class="claim-time">📅 ${dateStr}</span>${resolvedStr ? `<span class="claim-time">✓ Решено ${resolvedStr}</span>` : ''}</div></div><span class="claim-status" style="background:${st.bg};color:${st.color};">${st.icon} ${st.label}</span></div><div class="claim-text">${escapeHtml(c.text).replace(/\n/g, '<br>')}</div>${resolutionHTML}<div class="claim-note"><label for="note_${c.id}">💬 Комментарий администратора</label><textarea id="note_${c.id}" data-claim-note="${c.id}" placeholder="Ответ или пометка по заявке..." maxlength="500">${escapeHtml(c.adminNote || '')}</textarea></div><div class="claim-actions">${c.status !== 'in_progress' && c.status !== 'done' ? `<button class="action-btn" data-action="in_progress" data-claim-id="${c.id}" style="background:#E67E00;" type="button">⚙️ В работу</button>` : ''}${c.status !== 'done' ? `<button class="action-btn" data-action="done" data-claim-id="${c.id}" style="background:#2E8B2E;" type="button">✅ Решить</button>` : ''}${c.status !== 'rejected' ? `<button class="action-btn" data-action="rejected" data-claim-id="${c.id}" style="background:#E64646;" type="button">❌ Отклонить</button>` : ''}${c.status !== 'new' ? `<button class="action-btn" data-action="new" data-claim-id="${c.id}" style="background:#0066CC;" type="button">↩ В новые</button>` : ''}<button class="action-btn" data-action="delete" data-claim-id="${c.id}" style="background:#666;" type="button">🗑 Удалить</button></div></div>`;
  }).join('');
  info.textContent = `Показано ${list.length} из ${claims.length} заявок`;
  container.querySelectorAll('[data-claim-check]').forEach(cb => {
    cb.addEventListener('change', () => {
      const id = Number(cb.dataset.claimCheck);
      if (cb.checked) adminSelectedIds.add(id); else adminSelectedIds.delete(id);
      updateAdminBulkUI();
      cb.closest('.claim-card').classList.toggle('is-selected', cb.checked);
    });
  });
  container.querySelectorAll('.action-btn[data-action]').forEach(btn => {
    btn.addEventListener('click', () => handleAdminAction(btn.dataset.action, Number(btn.dataset.claimId)));
  });
  container.querySelectorAll('[data-claim-note]').forEach(ta => {
    let timer;
    ta.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const id = Number(ta.dataset.claimNote);
        const claim = claims.find(c => c.id === id);
        if (claim) { claim.adminNote = ta.value; saveAll(); }
      }, 800);
    });
  });
  container.querySelectorAll('[data-resit-subject]').forEach(sel => {
    sel.addEventListener('change', () => {
      const id = Number(sel.dataset.resitSubject);
      const claim = claims.find(c => c.id === id);
      if (!claim) return;
      claim.subject = sel.value;
      const teacherSel = container.querySelector(`[data-resit-teacher="${id}"]`);
      if (teacherSel) {
        const student = claim.studentId ? STUDENTS.find(s => s.id === claim.studentId) : null;
        const groupCode = student ? student.group : null;
        const teachers = getTeachersForSubject(sel.value, groupCode);
        if (claim.teacherId && !teachers.some(t => t.id === claim.teacherId)) claim.teacherId = null;
        if (teachers.length === 0) teacherSel.innerHTML = '<option value="">— нет преподавателей —</option>';
        else teacherSel.innerHTML = '<option value="">— Выберите —</option>' + teachers.map(t => `<option value="${t.id}" ${claim.teacherId === t.id ? 'selected' : ''}>${escapeHtml(t.fullName)}</option>`).join('');
      }
      saveAll();
    });
  });
  container.querySelectorAll('[data-resit-teacher]').forEach(sel => {
    sel.addEventListener('change', () => {
      const id = Number(sel.dataset.resitTeacher);
      const claim = claims.find(c => c.id === id);
      if (claim) { claim.teacherId = Number(sel.value) || null; saveAll(); }
    });
  });
  container.querySelectorAll('[data-resit-date]').forEach(inp => {
    inp.addEventListener('change', () => {
      const id = Number(inp.dataset.resitDate);
      const claim = claims.find(c => c.id === id);
      if (claim) { claim.resitDate = inp.value; saveAll(); }
    });
  });
  container.querySelectorAll('[data-resit-result]').forEach(sel => {
    sel.addEventListener('change', () => {
      const id = Number(sel.dataset.resitResult);
      const claim = claims.find(c => c.id === id);
      if (!claim) return;
      if (sel.value === 'passed') claim.resitPassed = true;
      else if (sel.value === 'failed') claim.resitPassed = false;
      else claim.resitPassed = null;
      const gradeWrap = document.getElementById('resit-grade-wrap-' + id);
      if (gradeWrap) gradeWrap.style.display = claim.resitPassed === false ? 'none' : '';
      saveAll();
    });
  });
  container.querySelectorAll('[data-resit-grade]').forEach(sel => {
    sel.addEventListener('change', () => {
      const id = Number(sel.dataset.resitGrade);
      const claim = claims.find(c => c.id === id);
      if (claim) { claim.resitGrade = Number(sel.value) || null; saveAll(); }
    });
  });
  container.querySelectorAll('[data-execute-resit]').forEach(btn => {
    btn.addEventListener('click', () => executeResit(Number(btn.dataset.executeResit)));
  });
  container.querySelectorAll('[data-transfer-group]').forEach(sel => {
    sel.addEventListener('change', () => {
      const id = Number(sel.dataset.transferGroup);
      const claim = claims.find(c => c.id === id);
      if (!claim) return;
      claim.targetGroup = sel.value;
      saveAll();
      const meta = GROUPS_META.find(g => g.code === sel.value);
      const specInput = document.getElementById('transfer-spec-' + id);
      const courseInput = document.getElementById('transfer-course-' + id);
      if (specInput) specInput.value = meta ? (SPECIALTIES[meta.spec] || meta.spec) : '—';
      if (courseInput) courseInput.value = meta ? meta.course + ' курс' : '—';
    });
  });
  container.querySelectorAll('[data-execute-transfer]').forEach(btn => {
    btn.addEventListener('click', () => executeTransfer(Number(btn.dataset.executeTransfer)));
  });
  updateAdminBulkUI();
}

function updateAdminBulkUI() {
  const bulk = document.getElementById('adminBulkActions');
  const info = document.getElementById('adminBulkInfo');
  if (adminSelectedIds.size === 0) bulk.style.display = 'none';
  else { bulk.style.display = 'flex'; info.textContent = `Выбрано: ${adminSelectedIds.size}`; }
}

function handleAdminAction(action, id) {
  const claim = claims.find(c => c.id === id);
  if (!claim) return;
  if (action === 'delete') {
    if (!confirm(`Удалить заявку?`)) return;
    claims = claims.filter(c => c.id !== id);
    adminSelectedIds.delete(id);
    saveAll(); updateClaimsBadge(); renderAdminAll();
    push('Заявка удалена', 'info', 2000);
    return;
  }
  claim.status = action;
  if (action === 'done' || action === 'rejected') claim.resolvedAt = Date.now();
  else claim.resolvedAt = null;
  saveAll(); updateClaimsBadge(); renderAdminAll();
  const labels = { new:'возвращена в новые', in_progress:'взята в работу', done:'решена', rejected:'отклонена' };
  push(`Заявка ${labels[action] || 'обновлена'}`, 'success', 1800);
}

document.querySelectorAll('#adminStatusTabs .status-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('#adminStatusTabs .status-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    adminState.status = tab.dataset.status;
    renderAdminAll();
  });
});
let adminSearchTimer;
document.getElementById('adminSearchInput').addEventListener('input', (e) => {
  clearTimeout(adminSearchTimer);
  adminSearchTimer = setTimeout(() => { adminState.search = e.target.value.trim(); renderAdminClaims(); }, 200);
});
document.getElementById('adminTypeFilter').addEventListener('change', (e) => { adminState.type = e.target.value; renderAdminClaims(); });
document.getElementById('adminGroupFilter').addEventListener('change', (e) => { adminState.group = e.target.value; renderAdminClaims(); });
document.getElementById('adminSortSelect').addEventListener('change', (e) => { adminState.sort = e.target.value; renderAdminClaims(); });

document.querySelectorAll('#adminBulkActions .bulk-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    if (action === 'clear') { adminSelectedIds.clear(); renderAdminClaims(); return; }
    if (adminSelectedIds.size === 0) return;
    const n = adminSelectedIds.size;
    if (action === 'delete') {
      if (!confirm(`Удалить ${n} заявок?`)) return;
      claims = claims.filter(c => !adminSelectedIds.has(c.id));
    } else {
      claims.forEach(c => {
        if (adminSelectedIds.has(c.id)) {
          c.status = action;
          if (action === 'done' || action === 'rejected') c.resolvedAt = Date.now();
          else c.resolvedAt = null;
        }
      });
    }
    adminSelectedIds.clear();
    saveAll(); updateClaimsBadge(); renderAdminAll();
    push(`Применено к ${n} заявкам`, 'success', 2000);
  });
});

document.getElementById('adminNewClaimBtn').addEventListener('click', () => openClaimForm(null));
document.getElementById('adminRefreshBtn').addEventListener('click', () => {
  claims = normalizeClaims(SafeStorage.get(CLAIMS_KEY, []));
  adminSelectedIds.clear();
  renderAdminAll(); updateClaimsBadge();
  push('Данные обновлены из хранилища', 'info', 1800);
});
document.getElementById('adminExportBtn').addEventListener('click', () => {
  if (typeof window.XLSX === 'undefined') { push('XLSX не загружена', 'error', 4000); return; }
  if (claims.length === 0) { push('Нет заявок для экспорта', 'error', 2200); return; }
  try {
    const list = getFilteredAdminClaims();
    const data = list.map(c => ({
      'ID':c.id, 'Дата создания':new Date(c.createdAt).toLocaleString('ru-RU'),
      'Тип':CLAIM_TYPE_LABELS[c.type] || c.type, 'Студент':c.studentName || '—',
      'Группа':c.studentGroup || '—', 'Текст заявки':c.text,
      'Предмет':c.subject || '—', 'Преподаватель':(c.teacherId && TEACHERS.find(t => t.id === c.teacherId)?.fullName) || '—',
      'Дата пересдачи':c.resitDate || '—',
      'Результат пересдачи':c.type === 'resit' && c.resitExecuted ? (c.resitPassed ? '✅ Пересдал(а)' : '❌ Не пересдал(а)') : '—',
      'Итоговая оценка':c.resitGrade || '—', 'Целевая группа':c.targetGroup || '—',
      'Статус':(CLAIM_STATUS_LABELS[c.status] || CLAIM_STATUS_LABELS.new).label,
      'Комментарий':c.adminNote || '', 'Дата решения':c.resolvedAt ? new Date(c.resolvedAt).toLocaleString('ru-RU') : ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [{ wch:16 }, { wch:20 }, { wch:28 }, { wch:28 }, { wch:12 }, { wch:50 }, { wch:24 }, { wch:30 }, { wch:16 }, { wch:20 }, { wch:14 }, { wch:16 }, { wch:14 }, { wch:30 }, { wch:20 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Заявки');
    XLSX.writeFile(wb, `Заявки_${new Date().toISOString().slice(0,10)}.xlsx`);
    push('📊 Excel-файл сохранён', 'success', 3000);
  } catch (err) { console.error(err); push('Ошибка экспорта: ' + err.message, 'error', 4000); }
});

document.querySelectorAll('.course-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.course-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    state.course = tab.dataset.course;
    state.group = 'all'; state.page = 1;
    updateGroupOptions(); renderStudents();
  });
});
document.getElementById('groupFilter').addEventListener('change', (e) => { state.group = e.target.value; state.page = 1; updateQuickJournalBtn(); renderStudents(); });
document.getElementById('quickJournalBtn').addEventListener('click', () => { if (state.group && state.group !== 'all') openJournal(state.group); });
let searchTimer;
document.getElementById('searchInput').addEventListener('input', (e) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { state.search = e.target.value.trim(); state.page = 1; renderStudents(); }, 200);
});
document.getElementById('sortSelect').addEventListener('change', (e) => { state.sort = e.target.value; state.page = 1; renderStudents(); });
document.getElementById('prevPage').addEventListener('click', () => { if (state.page > 1) { state.page--; renderStudents(); scrollToElement('students'); } });
document.getElementById('nextPage').addEventListener('click', () => {
  const list = getFilteredStudents();
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  if (state.page < totalPages) { state.page++; renderStudents(); scrollToElement('students'); }
});
let teacherSearchTimer;
document.getElementById('teacherSearch').addEventListener('input', (e) => {
  clearTimeout(teacherSearchTimer);
  teacherSearchTimer = setTimeout(() => { teacherState.search = e.target.value.trim(); renderTeachers(); }, 200);
});
document.getElementById('teacherRoleFilter').addEventListener('change', (e) => { teacherState.role = e.target.value; renderTeachers(); });

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (passwordOverlay.classList.contains('open')) closePasswordModal();
    else if (pickerOverlay.classList.contains('open')) closePicker();
    else if (claimFormOverlay.classList.contains('open')) closeClaimForm();
    else if (claimsAdminOverlay.classList.contains('open')) closeClaimsAdmin();
    else if (studentFormOverlay.classList.contains('open')) closeStudentForm();
    else if (transferOverlay.classList.contains('open')) closeTransferModal();
    else if (trashOverlay.classList.contains('open')) closeTrashModal();
    else if (teacherFormOverlay.classList.contains('open')) closeTeacherForm();
    else if (journalOverlay.classList.contains('open')) closeJournal();
    else if (modalOverlay.classList.contains('open')) closeModal();
    else if (isAdminView) switchToMain();
  }
});
document.querySelectorAll('#perfApp a[data-scroll]').forEach(a => {
  a.addEventListener('click', (e) => { e.preventDefault(); scrollToElement(a.getAttribute('href').replace('#', '')); });
});

window.addEventListener('storage', (e) => {
  if (e.key === CLAIMS_KEY) {
    claims = normalizeClaims(SafeStorage.get(CLAIMS_KEY, []));
    updateClaimsBadge();
    if (isAdminView) renderAdminAll();
    if (claimsAdminOverlay.classList.contains('open')) renderClaimsAdmin();
  }
});

renderGroups();
renderTeachers();
updateGroupOptions();
renderStudents();
updateTrashButton();
updateClaimsBadge();
setSaveStatus(SafeStorage.available ? 'saved' : 'error');

setTimeout(() => {
  if (!SafeStorage.available) { push('⚠️ Хранилище недоступно — изменения не сохранятся!', 'error', 6000); return; }
  const admins = TEACHERS.filter(t => t.role && t.role !== 'teacher').length;
  push(`Загружено: ${STUDENTS.length} студентов, ${TEACHERS.length} преподавателей (${admins} с должностями)`, 'success', 4000);
  const newCount = claims.filter(c => c.status === 'new').length;
  if (newCount > 0) setTimeout(() => push(`📩 Новых заявок: ${newCount}`, 'info', 4000), 1200);
}, 600);

})();

/* ============================================================
   КНОПКА-«ГЛАЗ» ДЛЯ ВСЕХ ПОЛЕЙ ПАРОЛЯ
   ============================================================ */
(function () {
  function initPasswordToggles() {
    document.querySelectorAll('input[type="password"]').forEach(input => {
      if (input.dataset.pwToggle === '1') return;
      input.dataset.pwToggle = '1';
      const wrap = document.createElement('span');
      wrap.className = 'pw-wrap';
      input.parentNode.insertBefore(wrap, input);
      wrap.appendChild(input);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pw-toggle';
      btn.innerHTML = '👁';
      btn.title = 'Показать пароль';
      btn.setAttribute('aria-label', 'Показать пароль');
      wrap.appendChild(btn);
      btn.addEventListener('click', () => {
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.innerHTML = show ? '🙈' : '👁';
        btn.title = show ? 'Скрыть пароль' : 'Показать пароль';
        btn.setAttribute('aria-label', btn.title);
        input.focus();
      });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPasswordToggles);
  } else {
    initPasswordToggles();
  }
})();

/* ============================================================
   НОВОСТИ: расширенный редактор публикаций ДТПА
   Совместимость: старые записи с полем image поддерживаются.
   Хранилище: localStorage (клиентский режим без сервера).
   ============================================================ */
(function () {
  'use strict';
  const STORAGE_KEY = 'dtpa-admin-news-posts-v1';
  const DRAFT_KEY = 'dtpa-admin-news-draft-v2';
  const NOTIFICATION_KEY = 'dtpa-student-notifications-v1';
  const MAX_IMAGES = 6;
  const MAX_ATTACHMENTS = 4;
  const MAX_ATTACHMENT_BYTES = 450 * 1024;
  const MAX_HISTORY = 30;
  const escapeHTML = value => String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));

  function readPosts() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(value) ? value.filter(p => p && typeof p === 'object' && p.id != null && p.body) : [];
    } catch (_) { return []; }
  }
  function writePosts(posts) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
      return true;
    } catch (_) {
      showStatus('Не удалось сохранить публикации: в хранилище браузера недостаточно места. Уменьшите размер фото или документов.', 'error');
      return false;
    }
  }
  function readNotifications() {
    try {
      const value = JSON.parse(localStorage.getItem(NOTIFICATION_KEY) || '[]');
      return Array.isArray(value) ? value.filter(item => item && typeof item === 'object') : [];
    } catch (_) { return []; }
  }
  function writeNotifications(items) {
    try { localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(items.slice(-200))); return true; }
    catch (_) { return false; }
  }

  const tools = document.getElementById('newsAdminTools');
  const form = document.getElementById('newsAdminForm');
  const feed = document.getElementById('feed');
  const status = document.getElementById('newsAdminStatus');
  const composePrompt = document.getElementById('newsComposePrompt');
  const titleInput = document.getElementById('newsPostTitle');
  const summaryInput = document.getElementById('newsPostSummary');
  const bodyInput = document.getElementById('newsPostBody');
  const imageInput = document.getElementById('newsPostImage');
  const imageFileInput = document.getElementById('newsPostImageFile');
  const imagesPreview = document.getElementById('newsPostImagesPreview');
  const attachmentInput = document.getElementById('newsPostAttachmentFiles');
  const attachmentsPreview = document.getElementById('newsPostAttachmentsPreview');
  const scheduleInput = document.getElementById('newsPostScheduleAt');
  const pinnedInput = document.getElementById('newsPostPinned');
  const notifyInput = document.getElementById('newsPostNotifyStudents');
  const draftStatus = document.getElementById('newsDraftStatus');
  const formTitle = document.getElementById('newsAdminFormTitle');
  const saveButton = document.getElementById('newsPostSaveBtn');
  const bodyPreview = document.getElementById('newsBodyPreview');
  const bodyPreviewToggle = document.getElementById('newsBodyPreviewToggle');
  const historyModal = document.getElementById('newsHistoryModal');
  const historyTitle = document.getElementById('newsHistoryTitle');
  const historyList = document.getElementById('newsHistoryList');
  const notificationsToggle = document.getElementById('studentNotificationsToggle');
  const notificationsPanel = document.getElementById('studentNotificationsPanel');
  const notificationsList = document.getElementById('studentNotificationsList');
  const notificationsCount = document.getElementById('studentNotificationsCount');
  let selectedImages = [];
  let selectedAttachments = [];
  let draftTimer = 0;
  let historyPostId = '';
  if (!tools || !form || !feed || !status || !composePrompt) return;

  function showStatus(message, kind) {
    status.textContent = message || '';
    status.className = 'news-admin-status' + (kind ? ' ' + kind : '');
  }
  function updateDraftStatus(message) {
    if (draftStatus) draftStatus.textContent = message || '';
  }
  function safeImageURL(value) {
    if (!value) return '';
    const raw = String(value).trim();
    if (raw.length < 950000 && /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(raw)) return raw;
    try {
      const url = new URL(raw);
      return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '';
    } catch (_) { return ''; }
  }
  function safeExternalURL(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    try {
      const url = new URL(raw);
      return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : '';
    } catch (_) { return ''; }
  }
  function normalizeImages(post) {
    const values = Array.isArray(post && post.images) ? post.images : (post && post.image ? [post.image] : []);
    return values.map(safeImageURL).filter(Boolean).slice(0, MAX_IMAGES);
  }
  const FILE_MIME = {
    pdf:'application/pdf', doc:'application/msword', docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls:'application/vnd.ms-excel', xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    odt:'application/vnd.oasis.opendocument.text', ods:'application/vnd.oasis.opendocument.spreadsheet',
    txt:'text/plain', csv:'text/csv'
  };
  function safeAttachmentData(item) {
    if (!item || typeof item !== 'object') return '';
    const data = String(item.data || '');
    const allowedMimes = Object.values(FILE_MIME).map(v => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const pattern = new RegExp('^data:(?:' + allowedMimes + ');base64,[A-Za-z0-9+/=\\r\\n]+$', 'i');
    return data.length < 750000 ? (pattern.test(data) ? data : '') : '';
  }
  function normalizeAttachments(post) {
    return (Array.isArray(post && post.attachments) ? post.attachments : []).map(file => ({
      name: String(file.name || 'Документ').replace(/[\\/<>:"|?*\x00-\x1F]/g, '_').slice(0, 120),
      type: String(file.type || ''), size: Math.max(0, Number(file.size) || 0), data: safeAttachmentData(file)
    })).filter(file => file.data && file.name).slice(0, MAX_ATTACHMENTS);
  }

  // Стабильный идентификатор для старых статичных карточек нужен, чтобы
  // после переноса в localStorage не потерять их реакции и комментарии.
  function legacySocialId(article) {
    const seed = (article.dataset.category || '') + '|' + (article.querySelector('.post-author')?.textContent || '') + '|' + (article.querySelector('.post-content')?.textContent || '').slice(0, 160);
    let hash = 2166136261;
    for (let i = 0; i < seed.length; i++) hash = Math.imul(hash ^ seed.charCodeAt(i), 16777619) >>> 0;
    return 'static-' + hash.toString(36);
  }
  function legacyNodeToMarkdown(node) {
    if (node.nodeType === Node.TEXT_NODE) return node.nodeValue.replace(/\u00a0/g, ' ');
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    const tag = node.tagName.toLowerCase();
    if (tag === 'br') return '\n';
    const inner = Array.from(node.childNodes).map(legacyNodeToMarkdown).join('');
    if (tag === 'strong' || tag === 'b') return '**' + inner + '**';
    if (tag === 'em' || tag === 'i') return '*' + inner + '*';
    if (tag === 'u') return '__' + inner + '__';
    if (tag === 'del' || tag === 's' || tag === 'strike') return '~~' + inner + '~~';
    if (tag === 'a') {
      const href = safeExternalURL(node.getAttribute('href') || '');
      return href ? '[' + inner + '](' + href + ')' : inner;
    }
    if (tag === 'blockquote') return inner.split('\n').map(line => line ? '> ' + line : '>').join('\n') + '\n\n';
    if (tag === 'li') return '- ' + inner.trim() + '\n';
    if (tag === 'p' || tag === 'div' || tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4') return inner + '\n\n';
    return inner;
  }
  function legacyContentToMarkdown(element) {
    if (!element) return '';
    return legacyNodeToMarkdown(element).replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  }
  function migrateLegacyStaticPosts() {
    // Карточки, которые раньше были прописаны прямо в HTML, не имели кнопки
    // редактирования. Переносим их в тот же реестр, что и новые публикации.
    const legacyArticles = Array.from(feed.querySelectorAll('.post:not([data-news-admin-post="true"]):not([data-news-post-id])'));
    if (!legacyArticles.length) return;
    const posts = readPosts();
    let changed = false;
    const now = Date.now();
    legacyArticles.forEach((article, index) => {
      const socialId = legacySocialId(article);
      if (posts.some(post => post.socialId === socialId || post.legacySourceId === socialId)) return;
      const contentElement = article.querySelector('.post-content');
      const titleElement = contentElement && contentElement.querySelector('h3');
      const title = titleElement ? titleElement.textContent.trim().slice(0, 150) : '';
      const bodyClone = contentElement ? contentElement.cloneNode(true) : null;
      if (bodyClone && titleElement) {
        const clonedHeading = bodyClone.querySelector('h3');
        if (clonedHeading) clonedHeading.remove();
      }
      const body = legacyContentToMarkdown(bodyClone) || title || 'Публикация администрации ДТПА';
      const authorNode = article.querySelector('.post-author');
      const author = authorNode ? authorNode.textContent.replace(/✓/g, '').trim() : 'Администрация ДТПА';
      const avatarNode = article.querySelector('.post-avatar');
      const avatarClass = avatarNode ? Array.from(avatarNode.classList).find(name => ['green','orange','purple','red','teal'].includes(name)) || '' : '';
      const mediaNode = article.querySelector('.post-media .media-emoji');
      const timeLabelNode = article.querySelector('.post-time');
      const migratedAt = now - index * 1000;
      posts.push({
        id: 'legacy-' + socialId,
        legacySourceId: socialId,
        socialId,
        title,
        summary: '',
        body,
        images: [],
        image: '',
        attachments: [],
        isPinned: false,
        notifyStudents: false,
        scheduledAt: 0,
        status: 'published',
        author: author || 'Администрация ДТПА',
        legacyTimeLabel: timeLabelNode ? timeLabelNode.textContent.trim() : '',
        legacyMediaEmoji: mediaNode ? mediaNode.textContent.trim() : '',
        legacyAvatar: avatarNode ? avatarNode.textContent.trim() : '',
        legacyAvatarClass: avatarClass,
        createdAt: migratedAt,
        updatedAt: 0,
        publishedAt: migratedAt,
        notificationSentAt: 0,
        history: []
      });
      changed = true;
    });
    // Не удаляем исходную HTML-разметку, если браузер не дал сохранить записи.
    const persisted = changed ? writePosts(posts) : true;
    if (persisted) legacyArticles.forEach(article => article.remove());
  }
  function formatDate(value) {
    const date = new Date(Number(value) || value);
    return Number.isNaN(date.getTime()) ? 'Дата не указана' : date.toLocaleString('ru-RU');
  }
  function formatShortDate(value) {
    const date = new Date(Number(value) || value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('ru-RU', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
  }
  function formatFileSize(bytes) {
    const size = Number(bytes) || 0;
    return size < 1024 ? size + ' Б' : (size < 1024 * 1024 ? (size / 1024).toFixed(0) + ' КБ' : (size / (1024 * 1024)).toFixed(1) + ' МБ');
  }
  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Не удалось прочитать файл «' + file.name + '».'));
      reader.onload = () => resolve(String(reader.result || ''));
      reader.readAsDataURL(file);
    });
  }
  function compressImageFile(file) {
    return new Promise((resolve, reject) => {
      if (!file || !/^image\/(jpeg|png|webp)$/.test(file.type)) {
        reject(new Error('Выберите изображение JPG, PNG или WEBP.')); return;
      }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Не удалось прочитать изображение «' + file.name + '».'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('Файл «' + file.name + '» не удалось открыть как изображение.'));
        img.onload = () => {
          const maxSide = 1100;
          const scale = Math.min(1, maxSide / img.width, maxSide / img.height);
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          const ctx = canvas.getContext('2d');
          if (!ctx) { reject(new Error('Браузер не поддерживает обработку изображений.')); return; }
          ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          let data = canvas.toDataURL('image/jpeg', 0.70);
          if (data.length > 300000) data = canvas.toDataURL('image/jpeg', 0.54);
          if (data.length > 330000) data = canvas.toDataURL('image/jpeg', 0.42);
          if (data.length > 360000) { reject(new Error('Фото «' + file.name + '» слишком большое. Выберите фото меньшего размера.')); return; }
          resolve(data);
        };
        img.src = String(reader.result || '');
      };
      reader.readAsDataURL(file);
    });
  }
  function safeHtmlForBody(value) {
    let text = escapeHTML(value);
    text = text.replace(/\[([^\]]{1,200})\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/~~(.+?)~~/g, '<del>$1</del>');
    text = text.replace(/__([^_\n]+)__/g, '<u>$1</u>');
    text = text.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
    return text;
  }
  function renderFormattedBody(value) {
    const lines = String(value || '').replace(/\r/g, '').split('\n');
    const output = [];
    let paragraph = [];
    let listType = '';
    let listItems = [];
    const flushParagraph = () => {
      if (paragraph.length) output.push('<p>' + paragraph.map(safeHtmlForBody).join('<br>') + '</p>');
      paragraph = [];
    };
    const flushList = () => {
      if (listType && listItems.length) output.push('<' + listType + '>' + listItems.map(item => '<li>' + safeHtmlForBody(item) + '</li>').join('') + '</' + listType + '>');
      listType = ''; listItems = [];
    };
    for (const rawLine of lines) {
      const line = rawLine.trimEnd();
      const bullet = line.match(/^\s*[-•]\s+(.+)$/);
      const numbered = line.match(/^\s*\d+[.)]\s+(.+)$/);
      const quote = line.match(/^\s*>\s?(.*)$/);
      if (!line.trim()) { flushParagraph(); flushList(); continue; }
      if (quote) { flushParagraph(); flushList(); output.push('<blockquote>' + safeHtmlForBody(quote[1]) + '</blockquote>'); continue; }
      if (bullet || numbered) {
        flushParagraph(); const nextType = bullet ? 'ul' : 'ol';
        if (listType && listType !== nextType) flushList();
        listType = nextType; listItems.push((bullet || numbered)[1]); continue;
      }
      flushList(); paragraph.push(line);
    }
    flushParagraph(); flushList();
    return output.join('');
  }

  function currentImages() {
    const images = selectedImages.slice();
    const remote = safeImageURL(imageInput ? imageInput.value : '');
    if (remote && !images.includes(remote) && images.length < MAX_IMAGES) images.push(remote);
    return images.slice(0, MAX_IMAGES);
  }
  function renderImagePreviews() {
    if (!imagesPreview) return;
    const items = selectedImages.map((src, index) => ({ src, index, remote:false }));
    const remote = safeImageURL(imageInput ? imageInput.value : '');
    if (remote && !selectedImages.includes(remote) && items.length < MAX_IMAGES) items.push({ src:remote, index:-1, remote:true });
    imagesPreview.innerHTML = items.length ? items.map(item => `
      <div class="news-image-thumb">
        <img src="${escapeHTML(item.src)}" alt="Предпросмотр фотографии ${item.index + 1}" loading="lazy">
        <span class="news-image-thumb-number">${item.remote ? 'Ссылка' : (item.index + 1)}</span>
        <button type="button" data-remove-post-image="${item.remote ? 'remote' : item.index}" aria-label="Убрать фотографию">×</button>
      </div>`).join('') : '<div class="news-file-empty">Фотографии ещё не добавлены.</div>';
  }
  function renderAttachmentPreviews() {
    if (!attachmentsPreview) return;
    attachmentsPreview.innerHTML = selectedAttachments.length ? selectedAttachments.map((file, index) => `
      <div class="news-attachment-preview-item">
        <span class="news-file-icon">${escapeHTML((file.name.split('.').pop() || 'FILE').toUpperCase().slice(0,4))}</span>
        <span class="news-attachment-preview-name"><strong>${escapeHTML(file.name)}</strong><small>${escapeHTML(formatFileSize(file.size))}</small></span>
        <button type="button" data-remove-post-attachment="${index}" aria-label="Убрать документ">×</button>
      </div>`).join('') : '<div class="news-file-empty">Документы не прикреплены.</div>';
  }
  function localDateTimeValue(timestamp) {
    if (!timestamp) return '';
    const date = new Date(Number(timestamp));
    if (Number.isNaN(date.getTime())) return '';
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0,16);
  }
  function captureEditorData() {
    const scheduleValue = scheduleInput && scheduleInput.value ? new Date(scheduleInput.value).getTime() : 0;
    return {
      title: titleInput ? titleInput.value.trim().slice(0,150) : '',
      summary: summaryInput ? summaryInput.value.trim().slice(0,240) : '',
      body: bodyInput ? bodyInput.value.slice(0,12000) : '',
      images: selectedImages.slice(0, MAX_IMAGES), imageUrlDraft: imageInput ? imageInput.value : '',
      attachments: selectedAttachments.slice(0, MAX_ATTACHMENTS),
      isPinned: !!(pinnedInput && pinnedInput.checked), notifyStudents: !!(notifyInput && notifyInput.checked),
      scheduledAt: Number.isFinite(scheduleValue) ? scheduleValue : 0,
      editingId: form.dataset.editingId || '', savedAt: Date.now()
    };
  }
  function meaningfulDraft(draft) {
    return !!(draft && (draft.title || draft.summary || draft.body || (draft.images && draft.images.length) || (draft.attachments && draft.attachments.length) || draft.scheduledAt || draft.isPinned || draft.notifyStudents));
  }
  function saveDraftNow() {
    const draft = captureEditorData();
    if (!meaningfulDraft(draft)) {
      try { localStorage.removeItem(DRAFT_KEY); } catch (_) {}
      updateDraftStatus('Автосохранение включено');
      return;
    }
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      updateDraftStatus('Черновик сохранён в ' + new Date().toLocaleTimeString('ru-RU', {hour:'2-digit', minute:'2-digit'}));
    } catch (_) {
      updateDraftStatus('Не удалось сохранить черновик: заполнено хранилище браузера');
    }
  }
  function scheduleDraftSave() {
    if (draftTimer) clearTimeout(draftTimer);
    updateDraftStatus('Сохранение черновика…');
    draftTimer = setTimeout(saveDraftNow, 650);
  }
  function readDraft() {
    try {
      const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
      if (!draft || typeof draft !== 'object') return null;
      draft.images = Array.isArray(draft.images) ? draft.images.map(safeImageURL).filter(Boolean).slice(0,MAX_IMAGES) : (draft.image ? [safeImageURL(draft.image)].filter(Boolean) : []);
      draft.attachments = normalizeAttachments({ attachments:draft.attachments });
      return draft;
    } catch (_) { return null; }
  }
  function removeDraft() {
    if (draftTimer) clearTimeout(draftTimer);
    draftTimer = 0;
    try { localStorage.removeItem(DRAFT_KEY); } catch (_) {}
    updateDraftStatus('Автосохранение включено');
  }
  function createStudentNotification(post) {
    const notifications = readNotifications();
    notifications.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2,7),
      postId: String(post.id), title: String(post.title || 'Новая публикация администрации').slice(0,150),
      text: String(post.summary || post.body || '').replace(/\s+/g,' ').slice(0,220),
      createdAt: Date.now(), read:false
    });
    const saved = writeNotifications(notifications);
    renderNotifications();
    return saved;
  }
  function renderNotifications() {
    if (!notificationsList || !notificationsCount) return;
    const items = readNotifications().sort((a,b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
    const unread = items.filter(item => !item.read).length;
    notificationsCount.textContent = String(unread);
    notificationsCount.setAttribute('aria-label', 'Непрочитанных уведомлений: ' + unread);
    notificationsList.innerHTML = items.length ? items.slice(0,30).map(item => `
      <button type="button" class="student-notification-item${item.read ? '' : ' unread'}" data-student-notification-post="${escapeHTML(item.postId || '')}" data-student-notification-id="${escapeHTML(item.id || '')}">
        <span class="student-notification-dot" aria-hidden="true"></span>
        <span class="student-notification-copy"><strong>${escapeHTML(item.title || 'Новая публикация')}</strong><span>${escapeHTML(item.text || '')}</span><small>${escapeHTML(formatShortDate(item.createdAt))}</small></span>
      </button>`).join('') : '<div class="student-notifications-empty">Новых уведомлений пока нет.</div>';
  }
  window.addEventListener('storage', event => {
    if (event.key === NOTIFICATION_KEY) renderNotifications();
    if (event.key === STORAGE_KEY) { activateScheduledPosts(); renderPublicPosts(); }
  });

  function activateScheduledPosts() {
    const posts = readPosts();
    let changed = false;
    posts.forEach(post => {
      if (post.status === 'scheduled' && Number(post.scheduledAt) && Number(post.scheduledAt) <= Date.now()) {
        post.status = 'published'; post.publishedAt = Date.now(); changed = true;
        if (post.notifyStudents && !post.notificationSentAt) {
          if (createStudentNotification(post)) post.notificationSentAt = Date.now();
        }
      }
    });
    if (changed) { writePosts(posts); renderPublicPosts(); }
  }

  function renderPublicPosts() {
    feed.querySelectorAll('[data-news-admin-post="true"]').forEach(node => node.remove());
    const marker = feed.querySelector('.load-more-wrapper');
    const authorized = !!window.__dtpaNewsAdminAuthorized;
    const posts = readPosts()
      .filter(post => post.status !== 'scheduled' || authorized)
      .sort((a,b) => (Number(!!b.isPinned) - Number(!!a.isPinned)) || (Number(b.createdAt || 0) - Number(a.createdAt || 0)));
    const firstStaticPost = feed.querySelector('.post:not([data-news-admin-post="true"])');
    posts.forEach(post => {
      const images = normalizeImages(post);
      const attachments = normalizeAttachments(post);
      const body = renderFormattedBody(post.body);
      const summary = escapeHTML(post.summary || '').replace(/\r?\n/g, '<br>');
      const isScheduled = post.status === 'scheduled' && Number(post.scheduledAt) > Date.now();
      const article = document.createElement('article');
      article.className = 'post';
      article.dataset.newsAdminPost = 'true';
      article.dataset.newsPostId = String(post.id);
      if (post.socialId) article.dataset.socialPostId = String(post.socialId);
      const avatarClass = ['green','orange','purple','red','teal'].includes(post.legacyAvatarClass) ? ' ' + post.legacyAvatarClass : '';
      const avatarContent = escapeHTML(post.legacyAvatar || '🏛️');
      const adminControls = authorized ? `
        <div class="news-post-admin-actions" aria-label="Управление публикацией">
          <button type="button" data-news-edit="${escapeHTML(post.id)}" title="Редактировать публикацию">✏️ Изменить</button>
          <button type="button" data-news-history="${escapeHTML(post.id)}" title="История изменений">🕘 История</button>
          <button type="button" data-news-pin="${escapeHTML(post.id)}" title="${post.isPinned ? 'Открепить публикацию' : 'Закрепить публикацию'}">${post.isPinned ? '📌 Открепить' : '📌 Закрепить'}</button>
          <button type="button" class="news-post-delete" data-news-delete="${escapeHTML(post.id)}" title="Удалить публикацию">🗑 Удалить</button>
        </div>` : '';
      const badges = (post.isPinned ? '<span class="post-pinned">📌 Закреплено</span>' : '') + (isScheduled ? `<span class="post-scheduled">⏰ Запланирована на ${escapeHTML(formatDate(post.scheduledAt))}</span>` : '');
      const imageGallery = images.length ? `<div class="news-post-gallery${images.length > 1 ? ' multiple' : ''}">${images.map((image, index) => `<a class="news-post-gallery-item" href="${escapeHTML(image)}" target="_blank" rel="noopener noreferrer" aria-label="Открыть фотографию ${index+1}"><img class="news-admin-post-image" src="${escapeHTML(image)}" alt="${escapeHTML(post.title || 'Фотография к публикации')} — ${index+1}" loading="lazy" referrerpolicy="no-referrer"></a>`).join('')}</div>` : '';
      const filesHTML = attachments.length ? `<div class="news-post-attachments">${attachments.map(file => `<a class="news-post-attachment" href="${escapeHTML(file.data)}" download="${escapeHTML(file.name)}"><span class="news-file-icon">${escapeHTML((file.name.split('.').pop() || 'FILE').toUpperCase().slice(0,4))}</span><span class="news-post-attachment-copy"><strong>${escapeHTML(file.name)}</strong><small>${escapeHTML(formatFileSize(file.size))}</small></span><span class="news-attachment-download">↓</span></a>`).join('')}</div>` : '';
      const legacyMediaHTML = !images.length && post.legacyMediaEmoji ? `<div class="post-media"><span class="media-emoji">${escapeHTML(post.legacyMediaEmoji)}</span></div>` : '';
      const displayTime = post.legacyTimeLabel || formatDate(post.createdAt);
      article.innerHTML = `
        <div class="post-header">
          <div class="post-avatar${avatarClass}" aria-label="Автор публикации">${avatarContent}</div>
          <div class="post-meta">
            <div class="post-author">${escapeHTML(post.author || 'Администрация ДТПА')} <span class="post-verified" title="Публикация администрации">✓</span></div>
            <div class="post-time">${escapeHTML(displayTime)}${post.updatedAt && post.updatedAt !== post.createdAt ? ' · изменено' : ''}</div>
            ${badges ? `<div class="news-post-badges">${badges}</div>` : ''}
          </div>
          ${adminControls}
        </div>
        ${post.title ? `<div class="post-content"><h3>${escapeHTML(post.title)}</h3></div>` : ''}
        ${summary ? `<div class="news-post-summary">${summary}</div>` : ''}
        <div class="post-content">${body}</div>
        ${imageGallery}
        ${legacyMediaHTML}
        ${filesHTML}
      `;
      if (firstStaticPost && firstStaticPost.parentNode === feed) feed.insertBefore(article, firstStaticPost);
      else if (marker) feed.insertBefore(article, marker); else feed.appendChild(article);
    });
  }
  function renderAll() { renderPublicPosts(); renderNotifications(); }
  function populateEditor(post, values) {
    const source = values || post || {};
    form.reset();
    form.dataset.editingId = post ? String(post.id) : (source.editingId || '');
    titleInput.value = source.title || '';
    if (summaryInput) summaryInput.value = source.summary || '';
    bodyInput.value = source.body || '';
    selectedImages = Array.isArray(source.images) ? source.images.map(safeImageURL).filter(Boolean).slice(0,MAX_IMAGES) : normalizeImages(source);
    // При редактировании поста изображения уже находятся в списке; в черновике сохраняем незавершённую ссылку отдельно.
    imageInput.value = values && values.imageUrlDraft ? String(values.imageUrlDraft) : '';
    selectedAttachments = normalizeAttachments(source);
    if (scheduleInput) scheduleInput.value = localDateTimeValue(source.scheduledAt || 0);
    if (pinnedInput) pinnedInput.checked = !!source.isPinned;
    if (notifyInput) notifyInput.checked = !!source.notifyStudents;
    if (imageFileInput) imageFileInput.value = '';
    if (attachmentInput) attachmentInput.value = '';
    renderImagePreviews(); renderAttachmentPreviews(); updateBodyPreview();
    formTitle.textContent = post ? 'Редактировать публикацию' : 'Создать публикацию';
    saveButton.textContent = post ? 'Сохранить изменения' : 'Опубликовать';
    composePrompt.hidden = true;
    form.hidden = false;
    form.scrollIntoView({ behavior:'smooth', block:'nearest' });
  }
  function openEditor(post, values) {
    if (!window.__dtpaNewsAdminAuthorized) { showStatus('Для управления новостями войдите в админ-панель.', 'error'); return; }
    populateEditor(post, values);
    if (values && values.savedAt) showStatus('Восстановлен черновик, автоматически сохранённый ' + formatDate(values.savedAt) + '.', 'ok');
    else showStatus('');
    bodyInput.focus();
  }
  function closeEditor(clearDraft) {
    if (clearDraft) removeDraft();
    form.reset(); form.dataset.editingId = ''; form.hidden = true; composePrompt.hidden = false;
    selectedImages = []; selectedAttachments = [];
    if (imageFileInput) imageFileInput.value = '';
    if (attachmentInput) attachmentInput.value = '';
    if (imageInput) imageInput.value = '';
    renderImagePreviews(); renderAttachmentPreviews();
    if (bodyPreview) bodyPreview.hidden = true;
    if (bodyPreviewToggle) bodyPreviewToggle.setAttribute('aria-expanded','false');
    updateDraftStatus('Автосохранение включено');
  }
  function updateBodyPreview() {
    if (!bodyPreview) return;
    bodyPreview.innerHTML = renderFormattedBody(bodyInput.value) || '<p class="news-preview-empty">Здесь появится форматированный текст публикации.</p>';
  }
  function applyFormatting(action) {
    const start = bodyInput.selectionStart, end = bodyInput.selectionEnd;
    const value = bodyInput.value;
    const selected = value.slice(start,end);
    let replacement = selected, cursorStart = start, cursorEnd = end;
    if (action === 'link') {
      const address = prompt('Введите ссылку (http:// или https://):', 'https://');
      if (address == null) return;
      const safe = safeExternalURL(address);
      if (!safe) { showStatus('Ссылка должна начинаться с http:// или https://.', 'error'); return; }
      const label = selected || 'текст ссылки'; replacement = '[' + label + '](' + safe + ')';
      cursorStart = start; cursorEnd = start + replacement.length;
    } else if (action === 'list' || action === 'quote') {
      const base = selected || 'текст';
      replacement = base.split('\n').map(line => action === 'list' ? (line.trim() ? '- ' + line : line) : '> ' + line).join('\n');
      cursorStart = start; cursorEnd = start + replacement.length;
    } else {
      const wrappers = { bold:['**','**'], italic:['*','*'], underline:['__','__'], strike:['~~','~~'] };
      const pair = wrappers[action]; if (!pair) return;
      replacement = pair[0] + (selected || 'текст') + pair[1];
      cursorStart = start + pair[0].length; cursorEnd = cursorStart + (selected || 'текст').length;
    }
    bodyInput.setRangeText(replacement, start, end, 'select');
    bodyInput.focus();
    if (action !== 'link' && action !== 'list' && action !== 'quote' && !selected) bodyInput.setSelectionRange(cursorStart,cursorEnd);
    bodyInput.dispatchEvent(new Event('input', { bubbles:true }));
  }
  function snapshotPost(post) {
    return {
      title:post.title || '', summary:post.summary || '', body:post.body || '',
      images:normalizeImages(post), attachments:normalizeAttachments(post),
      scheduledAt:Number(post.scheduledAt) || 0, isPinned:!!post.isPinned,
      notifyStudents:!!post.notifyStudents, status:post.status || 'published',
      createdAt:Number(post.createdAt) || Date.now(), updatedAt:Number(post.updatedAt) || 0,
      author:post.author || 'Администрация ДТПА', versionAt:Date.now()
    };
  }
  function contentSignature(post) {
    return JSON.stringify({ title:post.title || '', summary:post.summary || '', body:post.body || '', images:normalizeImages(post), attachments:normalizeAttachments(post).map(f => ({name:f.name,size:f.size,data:f.data})), scheduledAt:Number(post.scheduledAt)||0, isPinned:!!post.isPinned, notifyStudents:!!post.notifyStudents, status:post.status || 'published' });
  }
  function showHistory(post) {
    if (!historyModal || !historyList) return;
    historyPostId = String(post.id);
    historyTitle.textContent = 'История изменений публикации' + (post.title ? ': ' + post.title : '');
    const history = Array.isArray(post.history) ? post.history.slice().sort((a,b) => Number(b.versionAt || b.updatedAt || 0) - Number(a.versionAt || a.updatedAt || 0)) : [];
    historyList.innerHTML = history.length ? history.map((item,index) => `
      <article class="news-history-entry">
        <div class="news-history-entry-head"><strong>Версия ${history.length-index}</strong><time>${escapeHTML(formatDate(item.versionAt || item.updatedAt))}</time></div>
        <h4>${escapeHTML(item.title || 'Без заголовка')}</h4>
        <p>${escapeHTML(String(item.body || '').slice(0,420))}${String(item.body || '').length > 420 ? '…' : ''}</p>
        <button type="button" class="news-admin-secondary" data-history-restore="${index}">Восстановить эту версию</button>
      </article>`).join('') : '<div class="news-file-empty">История пока пуста. Сохранённые изменения будут появляться здесь после редактирования.</div>';
    historyModal.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeHistory() {
    if (historyModal) historyModal.hidden = true;
    document.body.style.overflow = '';
    historyPostId = '';
  }

  composePrompt.addEventListener('click', () => {
    const draft = readDraft();
    if (draft && meaningfulDraft(draft)) {
      const linkedPost = draft.editingId ? readPosts().find(post => String(post.id) === String(draft.editingId)) : null;
      openEditor(linkedPost || null, draft);
    } else openEditor(null);
  });
  document.getElementById('newsPostCancelBtn').addEventListener('click', () => {
    const hasDraft = meaningfulDraft(readDraft());
    closeEditor(false);
    showStatus(hasDraft ? 'Редактор закрыт. Черновик сохранён автоматически.' : 'Редактор закрыт.', 'ok');
  });
  const draftClearButton = document.getElementById('newsDraftClearBtn');
  if (draftClearButton) draftClearButton.addEventListener('click', () => {
    if (!confirm('Очистить автосохранённый черновик?')) return;
    const editingId = form.dataset.editingId;
    removeDraft();
    if (editingId) {
      const existing = readPosts().find(post => String(post.id) === editingId);
      populateEditor(existing || null);
    } else populateEditor(null);
    showStatus('Черновик очищен.', 'ok');
  });
  document.querySelectorAll('[data-news-format]').forEach(button => button.addEventListener('click', () => applyFormatting(button.dataset.newsFormat)));
  if (bodyPreviewToggle && bodyPreview) bodyPreviewToggle.addEventListener('click', () => {
    bodyPreview.hidden = !bodyPreview.hidden;
    bodyPreviewToggle.setAttribute('aria-expanded', String(!bodyPreview.hidden));
    if (!bodyPreview.hidden) updateBodyPreview();
  });
  form.addEventListener('input', event => {
    if (event.target === bodyInput && bodyPreview && !bodyPreview.hidden) updateBodyPreview();
    if (!event.target.matches('input[type="file"]')) scheduleDraftSave();
  });
  form.addEventListener('change', event => {
    if (!event.target.matches('input[type="file"]')) scheduleDraftSave();
  });

  if (imageFileInput) imageFileInput.addEventListener('change', async () => {
    const files = Array.from(imageFileInput.files || []);
    imageFileInput.value = '';
    if (!files.length) return;
    const room = MAX_IMAGES - selectedImages.length;
    if (room <= 0) { showStatus('Можно прикрепить не более ' + MAX_IMAGES + ' фотографий.', 'error'); return; }
    const batch = files.slice(0, room);
    if (files.length > room) showStatus('Добавлены только первые ' + room + ' фото: максимум — ' + MAX_IMAGES + '.', 'error');
    let addedImages = 0;
    for (const file of batch) {
      try {
        showStatus('Подготавливаем фото ' + (selectedImages.length + 1) + ' из ' + MAX_IMAGES + '…');
        const image = await compressImageFile(file);
        if (!selectedImages.includes(image)) { selectedImages.push(image); addedImages++; }
      } catch (error) { showStatus(error.message || 'Не удалось добавить фотографию.', 'error'); }
      renderImagePreviews();
    }
    if (addedImages) { showStatus('Добавлено фотографий: ' + addedImages + '. Предпросмотр доступен ниже.', 'ok'); saveDraftNow(); }
  });
  if (imageInput) imageInput.addEventListener('input', () => { renderImagePreviews(); scheduleDraftSave(); });
  if (imagesPreview) imagesPreview.addEventListener('click', event => {
    const button = event.target.closest('[data-remove-post-image]');
    if (!button) return;
    if (button.dataset.removePostImage === 'remote') imageInput.value = '';
    else selectedImages.splice(Number(button.dataset.removePostImage), 1);
    renderImagePreviews(); scheduleDraftSave();
  });
  if (attachmentInput) attachmentInput.addEventListener('change', async () => {
    const files = Array.from(attachmentInput.files || []);
    attachmentInput.value = '';
    if (!files.length) return;
    const room = MAX_ATTACHMENTS - selectedAttachments.length;
    if (room <= 0) { showStatus('Можно прикрепить не более ' + MAX_ATTACHMENTS + ' документов.', 'error'); return; }
    const batch = files.slice(0, room);
    if (files.length > room) showStatus('Добавлены только первые ' + room + ' документа(ов).', 'error');
    let addedAttachments = 0;
    for (const file of batch) {
      const extension = (file.name.split('.').pop() || '').toLowerCase();
      if (!FILE_MIME[extension]) { showStatus('Формат «' + extension + '» не поддерживается. Поддерживаются PDF, DOC/DOCX, XLS/XLSX, ODT/ODS, TXT и CSV.', 'error'); continue; }
      if (file.size > MAX_ATTACHMENT_BYTES) { showStatus('Документ «' + file.name + '» больше 450 КБ. Для локального хранения выберите файл меньшего размера.', 'error'); continue; }
      try {
        const result = await readFileAsDataURL(file);
        const base64 = result.includes(',') ? result.slice(result.indexOf(',') + 1) : '';
        const attachment = { name:file.name.replace(/[\\/<>:"|?*\x00-\x1F]/g,'_').slice(0,120), type:FILE_MIME[extension], size:file.size, data:'data:' + FILE_MIME[extension] + ';base64,' + base64 };
        if (!selectedAttachments.some(item => item.name === attachment.name && item.size === attachment.size)) { selectedAttachments.push(attachment); addedAttachments++; }
      } catch (error) { showStatus(error.message || 'Не удалось добавить документ.', 'error'); }
      renderAttachmentPreviews();
    }
    if (addedAttachments) { showStatus('Документов добавлено: ' + addedAttachments + '.', 'ok'); saveDraftNow(); }
  });
  if (attachmentsPreview) attachmentsPreview.addEventListener('click', event => {
    const button = event.target.closest('[data-remove-post-attachment]');
    if (!button) return;
    selectedAttachments.splice(Number(button.dataset.removePostAttachment), 1);
    renderAttachmentPreviews(); scheduleDraftSave();
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!window.__dtpaNewsAdminAuthorized) { showStatus('Нет доступа. Сначала войдите в админ-панель.', 'error'); return; }
    if (saveButton.disabled) return;
    const title = titleInput.value.trim().slice(0,150);
    const body = bodyInput.value.trim();
    const rawImage = imageInput.value.trim();
    if (!body) { showStatus('Напишите текст публикации.', 'error'); bodyInput.focus(); return; }
    if (rawImage && !safeImageURL(rawImage)) { showStatus('Укажите ссылку на изображение, начинающуюся с http:// или https://.', 'error'); imageInput.focus(); return; }
    const safeRemoteImage = safeImageURL(rawImage);
    if (safeRemoteImage && !selectedImages.includes(safeRemoteImage) && selectedImages.length >= MAX_IMAGES) { showStatus('Можно прикрепить не более ' + MAX_IMAGES + ' фотографий. Уберите одно фото перед добавлением ссылки.', 'error'); imageInput.focus(); return; }
    const images = currentImages();
    if (images.length > MAX_IMAGES) { showStatus('Можно прикрепить не более ' + MAX_IMAGES + ' фотографий.', 'error'); return; }
    const scheduledAt = scheduleInput && scheduleInput.value ? new Date(scheduleInput.value).getTime() : 0;
    if (scheduleInput && scheduleInput.value && (!Number.isFinite(scheduledAt) || scheduledAt <= Date.now())) {
      showStatus('Дата и время отложенной публикации должны быть в будущем.', 'error'); scheduleInput.focus(); return;
    }
    const editingId = form.dataset.editingId;
    const posts = readPosts();
    const oldPost = editingId ? posts.find(post => String(post.id) === editingId) : null;
    const statusValue = scheduledAt ? 'scheduled' : 'published';
    const now = Date.now();
    const newPost = {
      id:oldPost ? oldPost.id : (Date.now().toString(36) + Math.random().toString(36).slice(2,8)),
      title, body,
      summary:summaryInput ? summaryInput.value.trim().slice(0,240) : '',
      images, image:images[0] || '',
      attachments:selectedAttachments.slice(0,MAX_ATTACHMENTS),
      isPinned:!!(pinnedInput && pinnedInput.checked),
      notifyStudents:!!(notifyInput && notifyInput.checked),
      scheduledAt:scheduledAt || 0,
      status:statusValue,
      author:'Администрация ДТПА',
      createdAt:oldPost ? oldPost.createdAt : now,
      updatedAt:now,
      publishedAt:statusValue === 'published' ? (oldPost && oldPost.publishedAt ? oldPost.publishedAt : now) : 0,
      notificationSentAt:oldPost ? (Number(oldPost.notificationSentAt) || 0) : 0,
      socialId:oldPost ? (oldPost.socialId || '') : '',
      legacySourceId:oldPost ? (oldPost.legacySourceId || '') : '',
      legacyTimeLabel:oldPost ? (oldPost.legacyTimeLabel || '') : '',
      legacyMediaEmoji:oldPost ? (oldPost.legacyMediaEmoji || '') : '',
      legacyAvatar:oldPost ? (oldPost.legacyAvatar || '') : '',
      legacyAvatarClass:oldPost ? (oldPost.legacyAvatarClass || '') : '',
      history:oldPost && Array.isArray(oldPost.history) ? oldPost.history.slice(-MAX_HISTORY) : []
    };
    const changed = !oldPost || contentSignature(oldPost) !== contentSignature(newPost);
    if (oldPost && changed) {
      const oldVersion = snapshotPost(oldPost);
      oldVersion.versionAt = now;
      newPost.history.push(oldVersion);
      newPost.history = newPost.history.slice(-MAX_HISTORY);
    }
    const next = oldPost ? posts.map(post => String(post.id) === editingId ? newPost : post) : [newPost, ...posts];
    saveButton.disabled = true; saveButton.textContent = 'Сохраняем…';
    if (!writePosts(next)) { saveButton.disabled = false; saveButton.textContent = oldPost ? 'Сохранить изменения' : 'Опубликовать'; return; }
    if (statusValue === 'published' && newPost.notifyStudents && !newPost.notificationSentAt) {
      if (createStudentNotification(newPost)) { newPost.notificationSentAt = Date.now(); writePosts(next); }
    }
    if (draftTimer) clearTimeout(draftTimer);
    removeDraft(); closeEditor(false); renderAll();
    if (statusValue === 'scheduled') showStatus('Публикация запланирована на ' + formatDate(scheduledAt) + '.', 'ok');
    else if (oldPost && !changed) showStatus('Изменений нет. Публикация оставлена без изменений.', 'ok');
    else showStatus(oldPost ? 'Изменения сохранены. История версии обновлена.' : 'Публикация опубликована в единой ленте.', 'ok');
    saveButton.disabled = false; saveButton.textContent = 'Опубликовать';
  });

  feed.addEventListener('click', event => {
    const editButton = event.target.closest('[data-news-edit]');
    const deleteButton = event.target.closest('[data-news-delete]');
    const pinButton = event.target.closest('[data-news-pin]');
    const historyButton = event.target.closest('[data-news-history]');
    if (!editButton && !deleteButton && !pinButton && !historyButton) return;
    if (!window.__dtpaNewsAdminAuthorized) return;
    if (editButton) {
      const post = readPosts().find(item => String(item.id) === editButton.dataset.newsEdit);
      if (post) openEditor(post);
      return;
    }
    if (historyButton) {
      const post = readPosts().find(item => String(item.id) === historyButton.dataset.newsHistory);
      if (post) showHistory(post);
      return;
    }
    if (pinButton) {
      const id = pinButton.dataset.newsPin;
      const posts = readPosts();
      const post = posts.find(item => String(item.id) === id);
      if (!post) return;
      const now = Date.now();
      const oldVersion = snapshotPost(post); oldVersion.versionAt = now;
      post.history = Array.isArray(post.history) ? post.history : [];
      post.history.push(oldVersion); post.history = post.history.slice(-MAX_HISTORY);
      post.isPinned = !post.isPinned; post.updatedAt = now;
      if (writePosts(posts)) { renderAll(); showStatus(post.isPinned ? 'Публикация закреплена вверху ленты.' : 'Публикация откреплена.', 'ok'); }
      return;
    }
    if (deleteButton) {
      const id = deleteButton.dataset.newsDelete;
      const posts = readPosts();
      const post = posts.find(item => String(item.id) === id);
      if (!post || !confirm('Удалить публикацию' + (post.title ? ' «' + post.title + '»' : '') + '?')) return;
      if (writePosts(posts.filter(item => String(item.id) !== id))) {
        const savedDraft = readDraft();
        if (savedDraft && String(savedDraft.editingId || '') === id) removeDraft();
        if (form.dataset.editingId === id) closeEditor(false);
        renderAll(); showStatus('Публикация удалена.', 'ok');
      }
    }
  });
  if (historyModal) historyModal.addEventListener('click', event => {
    if (event.target === historyModal || event.target.closest('[data-news-history-close]')) { closeHistory(); return; }
    const restoreButton = event.target.closest('[data-history-restore]');
    if (!restoreButton) return;
    const posts = readPosts();
    const post = posts.find(item => String(item.id) === historyPostId);
    if (!post) { closeHistory(); return; }
    const history = Array.isArray(post.history) ? post.history.slice().sort((a,b) => Number(b.versionAt || b.updatedAt || 0) - Number(a.versionAt || a.updatedAt || 0)) : [];
    const version = history[Number(restoreButton.dataset.historyRestore)];
    if (!version) return;
    closeHistory(); openEditor(post, { ...version, editingId:String(post.id) });
    showStatus('Загружена старая версия. Нажмите «Сохранить изменения», чтобы восстановить её.', 'ok');
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && historyModal && !historyModal.hidden) closeHistory(); });

  if (notificationsToggle && notificationsPanel) notificationsToggle.addEventListener('click', () => {
    notificationsPanel.hidden = !notificationsPanel.hidden;
    notificationsToggle.setAttribute('aria-expanded', String(!notificationsPanel.hidden));
  });
  const markReadButton = document.getElementById('studentNotificationsMarkRead');
  if (markReadButton) markReadButton.addEventListener('click', () => {
    const items = readNotifications().map(item => ({ ...item, read:true }));
    if (writeNotifications(items)) renderNotifications();
  });
  if (notificationsList) notificationsList.addEventListener('click', event => {
    const button = event.target.closest('[data-student-notification-id]');
    if (!button) return;
    const items = readNotifications().map(item => item.id === button.dataset.studentNotificationId ? { ...item, read:true } : item);
    writeNotifications(items); renderNotifications();
    const postId = button.dataset.studentNotificationPost;
    const article = Array.from(feed.querySelectorAll('[data-news-post-id]')).find(node => node.dataset.newsPostId === postId);
    if (article) article.scrollIntoView({ behavior:'smooth', block:'center' });
    if (notificationsPanel) notificationsPanel.hidden = true;
    if (notificationsToggle) notificationsToggle.setAttribute('aria-expanded','false');
  });

  window.addEventListener('dtpa:admin-auth-state', event => {
    const authorized = !!(event.detail && event.detail.authorized);
    window.__dtpaNewsAdminAuthorized = authorized;
    tools.hidden = !authorized;
    if (authorized) renderAll();
    else { closeEditor(false); renderAll(); }
  });
  window.__dtpaNewsAdminAuthorized = (typeof isAdminAuthed !== 'undefined' && !!isAdminAuthed);
  migrateLegacyStaticPosts();
  tools.hidden = !window.__dtpaNewsAdminAuthorized;
  if (window.__dtpaNewsAdminAuthorized) renderAll();
  else renderNotifications();
  activateScheduledPosts();
  renderPublicPosts();
  setInterval(activateScheduledPosts, 15000);
  renderImagePreviews(); renderAttachmentPreviews();
})();

/* ============================================================
   СОЦИАЛЬНАЯ ЛЕНТА НОВОСТЕЙ: реакции и комментарии в стиле Telegram
   Все данные сохраняются локально в этом браузере.
   ============================================================ */
(function () {
  'use strict';
  const feed = document.getElementById('feed');
  if (!feed) return;
  const STORAGE_KEY = 'dtpa-news-social-v1';
  const VISITOR_KEY = 'dtpa-news-visitor-id-v1';
  const GUEST_NAME_KEY = 'dtpa-news-comment-name-v1';
  const REACTIONS = ['👍', '❤️', '🔥', '👏', '😁', '🎉'];
  const openComments = new Set();

  function escapeHTML(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
  }
  function getVisitorId() {
    try {
      let id = localStorage.getItem(VISITOR_KEY);
      if (!id) {
        id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : ('v-' + Date.now().toString(36) + Math.random().toString(36).slice(2));
        localStorage.setItem(VISITOR_KEY, id);
      }
      return id;
    } catch (_) { return 'session-' + Math.random().toString(36).slice(2); }
  }
  const visitorId = getVisitorId();
  function readSocial() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
    } catch (_) { return {}; }
  }
  let socialData = readSocial();
  function saveSocial() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(socialData));
      return true;
    } catch (_) {
      alert('Не удалось сохранить реакцию или комментарий. Возможно, в хранилище браузера закончилось место.');
      return false;
    }
  }
  function getPostId(article, index) {
    if (article.dataset.socialPostId) return article.dataset.socialPostId;
    if (article.dataset.newsPostId) return 'admin-' + article.dataset.newsPostId;
    const seed = (article.dataset.category || '') + '|' + (article.querySelector('.post-author')?.textContent || '') + '|' + (article.querySelector('.post-content')?.textContent || '').slice(0, 160);
    let hash = 2166136261;
    for (let i = 0; i < seed.length; i++) hash = Math.imul(hash ^ seed.charCodeAt(i), 16777619) >>> 0;
    article.dataset.socialPostId = 'static-' + hash.toString(36);
    return article.dataset.socialPostId;
  }
  function getPostSocial(id) {
    if (!socialData[id] || typeof socialData[id] !== 'object') socialData[id] = { reactions: {}, comments: [], views: 0, viewedBy: [] };
    const item = socialData[id];
    if (!item.reactions || typeof item.reactions !== 'object') item.reactions = {};
    if (!Array.isArray(item.comments)) item.comments = [];
    if (!Number.isFinite(Number(item.views)) || Number(item.views) < 0) item.views = 0;
    item.views = Number(item.views) || 0;
    if (!Array.isArray(item.viewedBy)) item.viewedBy = [];
    return item;
  }
  function formatCommentDate(value) {
    const date = new Date(Number(value) || Date.now());
    return date.toLocaleString('ru-RU', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
  }
  function renderSocial(article, index) {
    const id = getPostId(article, index);
    const data = getPostSocial(id);
    let social = article.querySelector(':scope > .news-social');
    if (!social) {
      social = document.createElement('div');
      social.className = 'news-social';
      article.appendChild(social);
    }
    const selectedReaction = REACTIONS.find(emoji => Array.isArray(data.reactions[emoji]) && data.reactions[emoji].includes(visitorId));
    const reactionHTML = REACTIONS.map(emoji => {
      const users = Array.isArray(data.reactions[emoji]) ? data.reactions[emoji] : [];
      const active = users.includes(visitorId);
      return `<button type="button" class="news-reaction${active ? ' active' : ''}" data-news-reaction="${emoji}" aria-pressed="${active}" aria-label="Реакция ${emoji}"><span class="news-reaction-emoji">${emoji}</span>${users.length ? `<span class="news-reaction-count">${users.length}</span>` : ''}</button>`;
    }).join('');
    const comments = data.comments.slice().sort((a,b) => Number(a.createdAt || 0) - Number(b.createdAt || 0));
    const reactionTotal = REACTIONS.reduce((sum, emoji) => sum + (Array.isArray(data.reactions[emoji]) ? data.reactions[emoji].length : 0), 0);
    const commentsHTML = comments.length ? comments.map(comment => `
      <div class="news-comment">
        <div class="news-comment-avatar">${escapeHTML(comment.avatar || '🙂')}</div>
        <div class="news-comment-main"><span class="news-comment-author">${escapeHTML(comment.author || 'Гость')}</span><div class="news-comment-text">${escapeHTML(comment.text || '')}</div><span class="news-comment-date">${escapeHTML(formatCommentDate(comment.createdAt))}</span></div>
      </div>`).join('') : '<div class="news-comments-empty">Комментариев пока нет. Будьте первым!</div>';
    const expanded = openComments.has(id);
    social.dataset.socialId = id;
    social.innerHTML = `
      <div class="news-social-metrics" aria-label="Статистика публикации"><span>👁 Просмотров <strong>${data.views}</strong></span><span>👍 Реакций <strong>${reactionTotal}</strong></span><span>💬 Комментариев <strong>${comments.length}</strong></span></div>
      <div class="news-social-reactions" aria-label="Реакции">${reactionHTML}</div>
      <div class="news-social-actions"><button type="button" class="news-comment-toggle" data-news-toggle-comments aria-expanded="${expanded}">💬 Комментарии <span>${comments.length}</span></button></div>
      <div class="news-comment-panel" ${expanded ? '' : 'hidden'}>
        <div class="news-comments-list">${commentsHTML}</div>
        <form class="news-comment-form" data-news-comment-form>
          <textarea name="comment" data-news-comment-text maxlength="2000" rows="1" required placeholder="Написать комментарий…" aria-label="Текст комментария"></textarea>
          <button class="news-comment-send" type="submit" aria-label="Отправить комментарий" title="Отправить">➤</button>
        </form>
      </div>`;
    if (selectedReaction) {
      const activeButton = social.querySelector('.news-reaction.active');
      if (activeButton) activeButton.title = 'Нажмите ещё раз, чтобы убрать реакцию';
    }
  }
  const observedPosts = new WeakSet();
  let viewObserver = null;
  function countPostView(article) {
    const index = Array.from(feed.querySelectorAll('.post')).indexOf(article);
    const id = getPostId(article, index);
    const data = getPostSocial(id);
    if (data.viewedBy.includes(visitorId)) return;
    data.viewedBy.push(visitorId);
    data.views = (Number(data.views) || 0) + 1;
    if (saveSocial()) renderSocial(article, index);
  }
  if ('IntersectionObserver' in window) {
    viewObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
          countPostView(entry.target);
          viewObserver.unobserve(entry.target);
        }
      });
    }, { threshold:[0.25, 0.5] });
  }
  function renderAllSocial() {
    const articles = Array.from(feed.querySelectorAll('.post'));
    articles.forEach((article, index) => renderSocial(article, index));
    articles.forEach(article => {
      if (observedPosts.has(article)) return;
      observedPosts.add(article);
      if (viewObserver) viewObserver.observe(article);
      else countPostView(article);
    });
  }
  function getCommentIdentity() {
    try {
      const session = JSON.parse(localStorage.getItem('dontpa-user') || 'null');
      if (session && session.registered && (session.name || session.email)) {
        return { name: String(session.name || session.email).slice(0, 80), avatar: String(session.avatar || '🙂').slice(0, 8) };
      }
    } catch (_) {}
    let name = '';
    try { name = localStorage.getItem(GUEST_NAME_KEY) || ''; } catch (_) {}
    if (!name) {
      name = prompt('Как подписать ваш комментарий?', 'Гость');
      if (name == null) return null;
      name = name.trim().slice(0, 80);
      if (!name) name = 'Гость';
      try { localStorage.setItem(GUEST_NAME_KEY, name); } catch (_) {}
    }
    return { name, avatar:'🙂' };
  }

  feed.addEventListener('click', event => {
    const reactionButton = event.target.closest('[data-news-reaction]');
    const toggleButton = event.target.closest('[data-news-toggle-comments]');
    const article = event.target.closest('.post');
    if (!article) return;
    const index = Array.from(feed.querySelectorAll('.post')).indexOf(article);
    const id = getPostId(article, index);
    const data = getPostSocial(id);
    if (reactionButton) {
      const emoji = reactionButton.dataset.newsReaction;
      if (!REACTIONS.includes(emoji)) return;
      const currentlyActive = Array.isArray(data.reactions[emoji]) && data.reactions[emoji].includes(visitorId);
      REACTIONS.forEach(reaction => {
        if (!Array.isArray(data.reactions[reaction])) data.reactions[reaction] = [];
        data.reactions[reaction] = data.reactions[reaction].filter(voter => voter !== visitorId);
      });
      if (!currentlyActive) data.reactions[emoji].push(visitorId);
      if (saveSocial()) renderSocial(article, index);
      return;
    }
    if (toggleButton) {
      if (openComments.has(id)) openComments.delete(id); else openComments.add(id);
      renderSocial(article, index);
    }
  });

  feed.addEventListener('submit', event => {
    const form = event.target.closest('[data-news-comment-form]');
    if (!form) return;
    event.preventDefault();
    const article = form.closest('.post');
    const textarea = form.querySelector('[data-news-comment-text]');
    const text = (textarea && textarea.value || '').trim();
    if (!article || !text) return;
    if (text.length > 2000) { alert('Комментарий не должен превышать 2000 символов.'); return; }
    const identity = getCommentIdentity();
    if (!identity) return;
    const index = Array.from(feed.querySelectorAll('.post')).indexOf(article);
    const id = getPostId(article, index);
    const data = getPostSocial(id);
    data.comments.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2,6), author:identity.name, avatar:identity.avatar, text, createdAt:Date.now(), visitorId });
    openComments.add(id);
    if (saveSocial()) renderSocial(article, index);
  });

  // Админ-публикации создаются скриптом выше; наблюдатель добавляет для них реакции и комментарии.
  const observer = new MutationObserver(() => renderAllSocial());
  observer.observe(feed, { childList:true });
  renderAllSocial();
})();
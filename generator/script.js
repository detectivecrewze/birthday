/**
 * Generator — script.js
 * Standalone link generator, separated from admin panel.
 */

'use strict';

const WORKER_URL = 'https://birthday-retro.aldoramadhan16.workers.dev';
let generatorSecret = '';

document.addEventListener('DOMContentLoaded', () => {
  initLogin();
  initGenerator();
});

/* ═══════════════════════════════════════════════
   LOGIN
═══════════════════════════════════════════════ */
function initLogin() {
  const loginScreen = document.getElementById('login-screen');
  const app = document.getElementById('app');
  const btnLogin = document.getElementById('btn-login');
  const pwInput = document.getElementById('gen-password');
  const loginError = document.getElementById('login-error');

  async function doLogin() {
    const pw = pwInput.value.trim();
    if (!pw) return;
    loginError.classList.add('hidden');
    btnLogin.disabled = true;
    btnLogin.textContent = '...';

    try {
      const res = await fetch(`${WORKER_URL}/generator-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      const data = await res.json();
      if (data.success) {
        generatorSecret = pw;
        loginScreen.classList.add('hidden');
        app.classList.remove('hidden');
      } else {
        loginError.textContent = 'Password salah.';
        loginError.classList.remove('hidden');
      }
    } catch (e) {
      loginError.textContent = 'Connection error.';
      loginError.classList.remove('hidden');
    } finally {
      btnLogin.disabled = false;
      btnLogin.textContent = 'Login';
    }
  }

  btnLogin?.addEventListener('click', doLogin);
  pwInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });

  // Logout
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    generatorSecret = '';
    app.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    pwInput.value = '';
  });
}

/* ═══════════════════════════════════════════════
   GENERATOR
═══════════════════════════════════════════════ */
function initGenerator() {
  // Auto ID
  document.getElementById('btn-auto-id')?.addEventListener('click', () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let rand = '';
    for (let i = 0; i < 8; i++) rand += chars[Math.floor(Math.random() * chars.length)];
    document.getElementById('gen-id').value = `retro-${rand}`;
  });

  // Generate link
  document.getElementById('btn-generate')?.addEventListener('click', async () => {
    const id = document.getElementById('gen-id').value.trim();
    const studioPass = document.getElementById('gen-studio-pass').value.trim();
    const isPremium = document.getElementById('gen-premium').checked;
    const errorEl = document.getElementById('gen-error');
    const result = document.getElementById('gen-result');

    errorEl.classList.add('hidden');
    result.classList.add('hidden');

    if (!id || id.length < 3) {
      errorEl.textContent = 'ID minimal 3 karakter.';
      errorEl.classList.remove('hidden');
      return;
    }

    const btn = document.getElementById('btn-generate');
    btn.disabled = true;
    btn.textContent = 'Generating...';

    try {
      const res = await fetch(`${WORKER_URL}/generate-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${generatorSecret}`,
        },
        body: JSON.stringify({ id, studioPassword: studioPass || null, isPremium }),
      });
      const data = await res.json();

      if (data.success) {
        const studioEl = document.getElementById('gen-studio-url');
        const giftEl   = document.getElementById('gen-gift-url');

        studioEl.href = data.studioUrl;
        studioEl.textContent = data.studioUrl;
        giftEl.href = data.giftUrl;
        giftEl.textContent = data.giftUrl;

        result.classList.remove('hidden');
      } else {
        errorEl.textContent = data.error || 'Unknown error.';
        errorEl.classList.remove('hidden');
      }
    } catch (e) {
      errorEl.textContent = 'Error: ' + e.message;
      errorEl.classList.remove('hidden');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Generate Link';
    }
  });

  // Copy buttons
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const el = document.getElementById(targetId);
      if (!el) return;

      const text = el.href || el.textContent;
      navigator.clipboard.writeText(text).then(() => {
        const toast = document.getElementById('copy-toast');
        toast.classList.remove('hidden');
        btn.textContent = '✔ Copied!';
        setTimeout(() => {
          toast.classList.add('hidden');
          btn.textContent = '📋 Copy';
        }, 2000);
      }).catch(() => {
        // Fallback for non-secure context
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        btn.textContent = '✔ Copied!';
        setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000);
      });
    });
  });

  // Change ID
  document.getElementById('btn-change-id')?.addEventListener('click', async () => {
    const oldId = document.getElementById('change-old-id').value.trim();
    const newId = document.getElementById('change-new-id').value.trim();
    const result = document.getElementById('change-result');
    result.classList.add('hidden');

    if (!oldId || !newId) {
      result.textContent = 'Isi kedua ID.';
      result.style.color = 'red';
      result.classList.remove('hidden');
      return;
    }

    try {
      const res = await fetch(`${WORKER_URL}/change-id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${generatorSecret}`,
        },
        body: JSON.stringify({ oldId, newId }),
      });
      const data = await res.json();
      if (data.success) {
        result.textContent = `✅ Changed: ${oldId} → ${newId}`;
        result.style.color = 'green';
      } else {
        result.textContent = data.error || 'Error.';
        result.style.color = 'red';
      }
      result.classList.remove('hidden');
    } catch (e) {
      result.textContent = 'Error: ' + e.message;
      result.style.color = 'red';
      result.classList.remove('hidden');
    }
  });
}

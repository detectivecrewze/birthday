/**
 * Birthday Retro — script.js
 * State machine with 5 stages + typing animations + confetti
 */

'use strict';

const WORKER_URL = 'https://birthday-retro.aldoramadhan16.workers.dev';

/* ═══════════════════════════════════════════════
   TEMPLATE DEFAULTS
═══════════════════════════════════════════════ */
const TEMPLATE_DEFAULTS = {
  birthday: {
    stage1_titlebar: '🎂 birthday_card.exe',
    stage1_heading: 'Happy Birthday!',
    stage1_gif: 'https://media1.tenor.com/m/tPJaogUqo8wAAAAC/happy-birthday.gif',
    stage1_sparkle: '',
    stage2_question: 'i have a surprise for\nyou, wanna see it?',
    stage3_titlebar: '📁 C:\\birthday\\gift.exe',
    stage3_instruction: 'tap on the gift to open your present! 🎁',
    stage3_lid: '🎀',
    stage3_base: '🎁',
    stage3_statusbar: 'Stage 3 of 5 — Click the gift!',
    stage4_titlebar: '🎉 surprise.exe — CONGRATS!',
    stage4_reveal_text: "it's a birthday surprise!! :D",
    stage4_gif: 'https://media.tenor.com/63IENW605s0AAAAi/dudu-twisting-dance.gif',
    stage4_btn_text: 'my wishes',
    stage5_titlebar: '📝 wishes.txt — Notepad',
    stage5_wishes: 'Happy birthday! 🎂\n\nWith love ♡',
    taskbar_label: '🎂 Birthday Card',
  },
  apology: {
    stage1_titlebar: '💌 sorry_letter.exe',
    stage1_heading: "I'm sorry...",
    stage1_gif: 'https://media.tenor.com/SFy5Za0DyMEAAAAi/erm-fingers.gif',
    stage1_sparkle: '',
    stage2_question: 'i have something\nto say to you...',
    stage3_titlebar: '📁 C:\\letters\\open_me.exe',
    stage3_instruction: 'tap to open your gift! 🎁',
    stage3_lid: '🎀',
    stage3_base: '🎁',
    stage3_statusbar: 'Stage 3 of 5 — Open the letter!',
    stage4_titlebar: '🥺 please_forgive_me.exe',
    stage4_reveal_text: 'Would you please forgive me?',
    stage4_gif: 'https://media1.tenor.com/m/EW8DRbGzxDgAAAAC/im-sorry-forgive-me.gif',
    stage4_btn_text: 'read my letter',
    stage5_titlebar: '📝 letter.txt — Notepad',
    stage5_wishes: 'Dear kamu,\n\nAku mau minta maaf...\n\nWith love ♡',
    taskbar_label: '💌 Apology Letter',
  },
  general: {
    stage1_titlebar: '🎁 special_gift.exe',
    stage1_heading: 'This is for you!',
    stage1_gif: 'https://media1.tenor.com/m/tPJaogUqo8wAAAAC/happy-birthday.gif',
    stage1_sparkle: '',
    stage2_question: 'i have something\nspecial for you...',
    stage3_titlebar: '📁 C:\\gift\\open_me.exe',
    stage3_instruction: 'tap to open your gift! 🎁',
    stage3_lid: '🎀',
    stage3_base: '🎁',
    stage3_statusbar: 'Stage 3 of 5 — Open the gift!',
    stage4_titlebar: '🎉 surprise.exe',
    stage4_reveal_text: "surprise!! :D",
    stage4_gif: 'https://media.tenor.com/63IENW605s0AAAAi/dudu-twisting-dance.gif',
    stage4_btn_text: 'read my message',
    stage5_titlebar: '📝 message.txt — Notepad',
    stage5_wishes: 'Dear kamu,\n\nThis is for you...\n\nWith love ♡',
    taskbar_label: '🎁 Special Gift',
  },
};

function getTemplateDefault(cfg, key) {
  const tpl = TEMPLATE_DEFAULTS[cfg.template] || TEMPLATE_DEFAULTS.birthday;
  return tpl[key];
}

function applyTemplate(cfg) {
  const tpl = TEMPLATE_DEFAULTS[cfg.template] || TEMPLATE_DEFAULTS.birthday;

  // Stage 1
  const s1Title = document.getElementById('stage1-titlebar');
  if (s1Title) s1Title.textContent = tpl.stage1_titlebar;
  const s1Gif = document.getElementById('stage1-gif');
  if (s1Gif) s1Gif.src = cfg.stage1_gif || tpl.stage1_gif;
  const s1Sparkle = document.getElementById('stage1-sparkle');
  if (s1Sparkle) s1Sparkle.textContent = tpl.stage1_sparkle;

  // Stage 3
  const s3Title = document.getElementById('stage3-titlebar');
  if (s3Title) s3Title.textContent = tpl.stage3_titlebar;
  const s3Instr = document.getElementById('stage3-instruction');
  if (s3Instr) s3Instr.textContent = tpl.stage3_instruction;
  const s3Lid = document.getElementById('stage3-lid');
  if (s3Lid) s3Lid.textContent = tpl.stage3_lid;
  const s3Base = document.getElementById('stage3-base');
  if (s3Base) s3Base.textContent = tpl.stage3_base;
  const s3Status = document.getElementById('stage3-statusbar');
  if (s3Status) s3Status.textContent = tpl.stage3_statusbar;

  // Stage 4
  const s4Title = document.getElementById('stage4-titlebar');
  if (s4Title) s4Title.textContent = tpl.stage4_titlebar;
  const s4Gif = document.getElementById('stage4-gif');
  if (s4Gif) s4Gif.src = cfg.stage4_gif || tpl.stage4_gif;
  const s4Btn = document.getElementById('stage4-btn-text');
  if (s4Btn) s4Btn.textContent = tpl.stage4_btn_text;

  // Stage 5
  const s5Title = document.getElementById('stage5-titlebar');
  if (s5Title) s5Title.textContent = tpl.stage5_titlebar;

  // Taskbar
  const taskbar = document.getElementById('taskbar-win-label');
  if (taskbar) taskbar.textContent = tpl.taskbar_label;
}

/* ═══════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  initClock();

  // Check for ?to= parameter → load from Worker
  const params = new URLSearchParams(window.location.search);
  const giftId = params.get('to') || params.get('token') || params.get('id');
  let cfg = window.BIRTHDAY_CONFIG || {};

  // ── MAINTENANCE MODE CHECK ───────────────────────────────────
  // Jika maintenanceMode: true di config.js DAN tidak ada token di URL
  // → tampilkan halaman maintenance, hentikan semua eksekusi
  if (cfg.maintenanceMode === true && !giftId) {
    const overlay = document.getElementById('maintenance-overlay');
    if (overlay) overlay.style.display = 'flex';
    return; // Stop — tidak ada yang dijalankan lebih lanjut
  }
  // ────────────────────────────────────────────────────────────

  if (giftId) {
    try {
      const res = await fetch(`${WORKER_URL}/get-config?id=${encodeURIComponent(giftId)}&_cb=${Date.now()}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        cfg = { ...cfg, ...data };
      }
    } catch (e) {
      console.warn('[RetroGift] Failed to load config from Worker:', e);
    }
  } else {
    // Attempt to load standalone config (data.js) dynamically
    try {
      const script = document.createElement('script');
      script.src = 'data.js';
      document.head.appendChild(script);
      
      await new Promise((resolve) => {
        script.onload = resolve;
        script.onerror = resolve; // Ignore error (404) if not present
      });

      if (typeof GIFT_CONFIG !== 'undefined') {
        cfg = { ...cfg, ...GIFT_CONFIG };
      }
    } catch (e) {
      // Ignored
    }
  }

  function applyTheme(theme) {
    let color = '#008080';
    if (theme === 'rosepink') color = '#e8a8b8';
    else if (theme === 'y2k') color = '#c8bfe7';
    else if (theme === 'sky') color = '#99b4d1';
    else if (theme === 'midnight') color = '#1a252c';
    document.documentElement.style.setProperty('--desktop', color);
  }
  
  if (cfg.theme) {
    applyTheme(cfg.theme);
  }

  // Apply template-specific content
  applyTemplate(cfg);
  window._currentCfg = cfg;

  const skipAuth = params.get('skipAuth') === '1';
  const openMemory = params.get('openMemory') === '1';

  function initLoginStage(cfg, noPassword = false) {
    goToStage('stage-login');
    const hintText = document.getElementById('login-hint-text');
    if (!noPassword && cfg.giftHint && cfg.giftHint.trim() !== '') {
      hintText.textContent = `Hint: ${cfg.giftHint}`;
      hintText.style.display = 'block';
    } else {
      hintText.style.display = 'none';
    }

    const input = document.getElementById('login-password-input');
    const btn = document.getElementById('btn-login-submit');
    const errorMsg = document.getElementById('login-error-msg');
    
    const dialogMain = document.getElementById('login-dialog-main');
    const dialogSuccess = document.getElementById('login-dialog-success');
    const btnSuccessOk = document.getElementById('btn-login-success-ok');

    // Adapt UI for "No Password" mode (Welcome screen)
    if (noPassword) {
      const titleText = dialogMain.querySelector('.win-titlebar-text');
      const bodyText = dialogMain.querySelector('.win-body p');
      if (titleText) titleText.textContent = '👋 Welcome';
      if (bodyText) bodyText.textContent = 'Click OK to open your special gift! 🎁';
      if (input) input.style.display = 'none';
      if (hintText) hintText.style.display = 'none';
    }

    function checkPassword() {
      if (noPassword || input.value === cfg.giftPassword) {
        errorMsg.style.display = 'none';
        dialogMain.style.display = 'none';
        if (noPassword) {
          // Skip success dialog if no password, go straight to stage 1
          goToStage('stage-1');
          initStage1(cfg);
        } else {
          dialogSuccess.style.display = 'block';
        }
      } else {
        errorMsg.style.display = 'block';
        input.value = '';
        input.focus();
      }
    }

    btn.addEventListener('click', checkPassword);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') checkPassword();
    });
    
    btnSuccessOk.addEventListener('click', () => {
      goToStage('stage-1');
      initStage1(cfg);
    });

    if (!noPassword) input.focus();
  }

  // ?skipAuth=1 → skip login gate (studio preview mode)
  const hasPassword = cfg.giftPassword && cfg.giftPassword.trim().length > 0;
  if (!skipAuth) {
    initLoginStage(cfg, !hasPassword);
  } else if (openMemory) {
    // ?openMemory=1 → jump straight to stage-5, then auto-open secret modal
    goToStage('stage-5');
    initStage5(cfg).then(() => {
      // After wishes typing completes, open the secret modal automatically
      const secretMediaList = Array.isArray(cfg.secretMediaList) ? cfg.secretMediaList.filter(m => m && m.url) : [];
      if (secretMediaList.length > 0) {
        setTimeout(() => initStage6(cfg), 300);
      }
    });
  } else {
    initStage1(cfg);
  }

  bindNavigation(cfg);
  initCDPlayer(cfg);
});

/* ═══════════════════════════════════════════════
   CLOCK
═══════════════════════════════════════════════ */
function initClock() {
  const el = document.getElementById('taskbar-clock');
  function tick() {
    const now = new Date();
    el.textContent = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }
  tick();
  setInterval(tick, 30000);
}

/* ═══════════════════════════════════════════════
   STAGE MANAGEMENT
═══════════════════════════════════════════════ */
let _isTransitioning = false;

function goToStage(id) {
  if (_isTransitioning) return;
  const currentStage = document.querySelector('.stage.active');
  const target = document.getElementById(id);

  function updateTaskbarLocal(targetId) {
    const tpl = TEMPLATE_DEFAULTS[window._currentCfg?.template] || TEMPLATE_DEFAULTS.birthday;
    const labels = {
      'stage-login': '🔐 Security check',
      'stage-1': tpl.taskbar_label,
      'stage-2': '❓ Question',
      'stage-3': '📁 gift.exe',
      'stage-4': '🎉 surprise.exe',
      'stage-5': tpl.stage5_titlebar,
      'stage-6': '🖼️ secret_memory.exe',
      'no-dialog': '⚠️ Error',
    };
    const win = document.getElementById('taskbar-win-label');
    if (win && labels[targetId]) win.textContent = labels[targetId];
  }

  // Initial load or same stage
  if (!currentStage || currentStage.id === id) {
    if (target) target.classList.add('active');
    updateTaskbarLocal(id);
    return;
  }

  _isTransitioning = true;

  // 1. Minimize current stage (Zoom out to bottom taskbar)
  currentStage.style.transformOrigin = 'center bottom';
  currentStage.style.transition = 'transform 180ms ease-in, opacity 150ms ease-in';
  currentStage.style.transform = 'translateY(40vh) scale(0.1)';
  currentStage.style.opacity = '0';

  setTimeout(() => {
    currentStage.classList.remove('active');
    currentStage.style.transition = '';
    currentStage.style.transform = '';
    currentStage.style.opacity = '';

    updateTaskbarLocal(id);

    // 2. Maximize next stage (Zoom in from bottom taskbar)
    if (target) {
      target.classList.add('active');
      target.style.transformOrigin = 'center bottom';
      target.style.transform = 'translateY(40vh) scale(0.1)';
      target.style.opacity = '0';
      
      // Force reflow
      void target.offsetWidth;

      target.style.transition = 'transform 200ms ease-out, opacity 200ms ease-out';
      target.style.transform = 'translateY(0) scale(1)';
      target.style.opacity = '1';

      setTimeout(() => {
        target.style.transition = '';
        target.style.transform = '';
        target.style.opacity = '';
        _isTransitioning = false;
      }, 200);
    } else {
      _isTransitioning = false;
    }
  }, 180);
}

/* ═══════════════════════════════════════════════
   TYPING ENGINE
═══════════════════════════════════════════════ */
let typeAudioCtx;
function playTypingSound() {
  try {
    if (!typeAudioCtx) {
      typeAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (typeAudioCtx.state === 'suspended') {
      typeAudioCtx.resume().catch(() => {});
    }
    
    const osc = typeAudioCtx.createOscillator();
    const gainNode = typeAudioCtx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, typeAudioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, typeAudioCtx.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.1, typeAudioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, typeAudioCtx.currentTime + 0.05);
    
    osc.connect(gainNode);
    gainNode.connect(typeAudioCtx.destination);
    
    osc.start();
    osc.stop(typeAudioCtx.currentTime + 0.05);
  } catch (e) {
    console.warn("Typing sound failed:", e);
  }
}

function typeText(elementId, text, speed = 65, playAudio = false) {
  return new Promise(resolve => {
    const el = document.getElementById(elementId);
    if (!el) return resolve();
    el.textContent = '';
    let i = 0;

    // Add blinking cursor
    const cursor = document.createElement('span');
    cursor.className = 'notepad-cursor';
    el.appendChild(cursor);

    function type() {
      if (i < text.length) {
        // Insert char before cursor
        const char = text[i];
        if (char === '\n') {
          el.insertBefore(document.createElement('br'), cursor);
        } else {
          el.insertBefore(document.createTextNode(char), cursor);
          if (playAudio && char !== ' ') playTypingSound();
        }
        i++;
        setTimeout(type, speed);
      } else {
        // Remove cursor after done
        setTimeout(() => {
          cursor.remove();
          resolve();
        }, 400);
      }
    }
    type();
  });
}

/* ═══════════════════════════════════════════════
   STAGE 1 — Welcome
═══════════════════════════════════════════════ */
async function initStage1(cfg) {
  const heading = cfg.stage1_heading || getTemplateDefault(cfg, 'stage1_heading');
  const btn = document.getElementById('btn-next-1');
  const charEl = document.getElementById('stage1-char');

  // Start typing with audio
  await typeText('stage1-text', heading, 80, true);

  // Show character
  if (charEl) {
    charEl.classList.add('visible');
  }

  // Show button
  if (btn) {
    btn.style.opacity = '1';
    btn.classList.add('fade-in-up');
  }
}

/* ═══════════════════════════════════════════════
   STAGE 2 — Question
═══════════════════════════════════════════════ */
async function initStage2(cfg) {
  const question = cfg.stage2_question || getTemplateDefault(cfg, 'stage2_question');
  await typeText('stage2-text', question, 55, true);
}

/* ═══════════════════════════════════════════════
   STAGE 4 — Confetti
═══════════════════════════════════════════════ */
function launchConfetti(colors) {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = [];
  const TOTAL = 150;
  const GRAVITY = 0.15;

  for (let i = 0; i < TOTAL; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * -1,
      w: 6 + Math.random() * 6,
      h: 4 + Math.random() * 8,
      vx: (Math.random() - 0.5) * 4,
      vy: 1 + Math.random() * 4,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.15,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 1,
    });
  }

  let frame = 0;
  const MAX_FRAMES = 300; // ~5 seconds at 60fps

  function draw() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += GRAVITY;
      p.rot += p.rotV;

      // Fade out in last 60 frames
      if (frame > MAX_FRAMES - 60) {
        p.opacity = Math.max(0, p.opacity - 0.017);
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    if (frame < MAX_FRAMES) {
      requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  draw();
}

async function initStage4(cfg) {
  const text = cfg.stage4_reveal_text || getTemplateDefault(cfg, 'stage4_reveal_text');
  const colors = cfg.confetti_colors || ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6bb5'];
  launchConfetti(colors);
  await typeText('stage4-title', text, 50);
}

/* ═══════════════════════════════════════════════
   STAGE 5 — Personal Message (Notepad typing)
═══════════════════════════════════════════════ */
async function initStage5(cfg) {
  const wishes = cfg.stage5_wishes || getTemplateDefault(cfg, 'stage5_wishes');
  await typeText('stage5-message', wishes, 50, true);

  // Update line/col counter
  const lines = wishes.split('\n').length;
  const cols = wishes.split('\n').pop().length;
  const status = document.getElementById('stage5-status');
  if (status) status.textContent = `Ln ${lines}, Col ${cols}`;

  // Show 'secret_photo.exe' button OUTSIDE the Notepad if premium user has media
  const secretMediaList = Array.isArray(cfg.secretMediaList) ? cfg.secretMediaList.filter(m => m && m.url) : [];
  if (secretMediaList.length > 0) {
    const wrap = document.getElementById('stage5-secret-btn-wrap');
    if (wrap) wrap.style.display = 'block';
  }
}



/* ═══════════════════════════════════════════════
   STAGE 6 — Secret Media Modal
═══════════════════════════════════════════════ */
let _memoryModalInitialized = false;

function initStage6(cfg) {
  const mediaList = Array.isArray(cfg.secretMediaList) ? cfg.secretMediaList.filter(m => m && m.url) : [];
  if (!mediaList.length) return;

  const modal = document.getElementById('modal-secret-memory');
  const closeBtn = document.getElementById('btn-close-memory');
  const container = document.getElementById('stage6-media-container');
  const captionEl = document.getElementById('stage6-caption');
  const statusEl = document.getElementById('stage6-status');
  const prevBtn = document.getElementById('btn-memory-prev');
  const nextBtn = document.getElementById('btn-memory-next');
  const controlsEl = document.getElementById('stage6-controls');

  if (!modal) return;

  let currentIdx = 0;

  function renderMedia(idx) {
    if (!container) return;
    const item = mediaList[idx];

    // Pause any playing video
    const oldVid = container.querySelector('video');
    if (oldVid) oldVid.pause();
    container.innerHTML = '';

    const isVideo = /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(item.url);
    if (isVideo) {
      const video = document.createElement('video');
      video.src = item.url;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.style.cssText = 'max-width:100%;max-height:100%;object-fit:contain;display:block;';
      container.appendChild(video);
      video.play().catch(() => {});
    } else {
      const img = document.createElement('img');
      img.src = item.url;
      img.alt = item.caption || 'Secret';
      img.style.cssText = 'max-width:100%;max-height:100%;object-fit:contain;display:block;';
      container.appendChild(img);
    }

    if (captionEl) captionEl.textContent = item.caption || '';
    if (statusEl) statusEl.textContent = `${idx + 1} of ${mediaList.length}`;
    if (controlsEl) controlsEl.style.display = mediaList.length > 1 ? 'flex' : 'none';
  }

  function openModal() {
    currentIdx = 0;
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');

    // Backdrop fade in
    requestAnimationFrame(() => requestAnimationFrame(() => {
      modal.style.background = 'rgba(0,0,0,0.82)';
    }));

    // Render first slide after short delay
    setTimeout(() => renderMedia(0), 80);
  }

  function closeModal() {
    modal.style.background = 'rgba(0,0,0,0)';
    const vid = container ? container.querySelector('video') : null;
    if (vid) vid.pause();
    setTimeout(() => {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
      if (container) container.innerHTML = '';
    }, 400);
  }

  // Only bind listeners once
  if (!_memoryModalInitialized) {
    _memoryModalInitialized = true;

    prevBtn?.addEventListener('click', () => {
      currentIdx = (currentIdx - 1 + mediaList.length) % mediaList.length;
      renderMedia(currentIdx);
    });

    nextBtn?.addEventListener('click', () => {
      currentIdx = (currentIdx + 1) % mediaList.length;
      renderMedia(currentIdx);
    });

    closeBtn?.addEventListener('click', closeModal);

    // Click backdrop to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (modal.style.display === 'none' || !modal.style.display) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowRight') { currentIdx = (currentIdx + 1) % mediaList.length; renderMedia(currentIdx); }
      if (e.key === 'ArrowLeft') { currentIdx = (currentIdx - 1 + mediaList.length) % mediaList.length; renderMedia(currentIdx); }
    });
  }

  // Open the modal (called when user clicks the button)
  openModal();
}

/* ═══════════════════════════════════════════════
   NAVIGATION BINDINGS
═══════════════════════════════════════════════ */
function bindNavigation(cfg) {
  // Stage 1 → Stage 2
  // Stage 1 → Stage Music (handled dynamically by CD Player engine)
  // if no music, skips to Stage 2.

  // Stage 2 — Yes → Stage 3
  document.getElementById('btn-yes')?.addEventListener('click', () => {
    goToStage('stage-3');
  });

  // Stage 2 — No → Error dialog
  document.getElementById('btn-no')?.addEventListener('click', () => {
    goToStage('no-dialog');
  });

  // Error dialog → back to Stage 2
  document.getElementById('btn-no-ok')?.addEventListener('click', () => {
    goToStage('stage-2');
  });

  // Stage 3 → Stage 4
  document.getElementById('btn-open-gift')?.addEventListener('click', () => {
    goToStage('stage-4');
    initStage4(cfg);
  });

  // Stage 4 → Stage 5
  document.getElementById('btn-wishes')?.addEventListener('click', () => {
    goToStage('stage-5');
    initStage5(cfg).then(() => {
      // After typing finishes, auto-open secret media modal if available
      const secretMediaList = Array.isArray(cfg.secretMediaList) ? cfg.secretMediaList.filter(m => m && m.url) : [];
      if (secretMediaList.length > 0) {
        setTimeout(() => initStage6(cfg), 600);
      }
    });
  });

  // Stage 5 → Stage 6 (Secret Media — modal, only if available & premium)
  const secretMediaList = Array.isArray(cfg.secretMediaList) ? cfg.secretMediaList.filter(m => m && m.url) : [];
  const btnViewSecret = document.getElementById('btn-view-secret');
  if (secretMediaList.length > 0) {
    // Init the modal listeners (but don't open yet)
    // The modal will open when initStage6 is called from the button click
    if (btnViewSecret) {
      btnViewSecret.addEventListener('click', () => initStage6(cfg));
    }
  } else {
    const wrap = document.getElementById('stage5-secret-btn-wrap');
    if (wrap) wrap.style.display = 'none';
  }
}

/* ═══════════════════════════════════════════════
   CD PLAYER ENGINE
═══════════════════════════════════════════════ */
function initCDPlayer(cfg) {
  const playlist = Array.isArray(cfg.playlist) ? cfg.playlist.filter(t => t && (t.url || t.audioUrl || t.src)) : [];
  const audio = document.getElementById('bday-audio');
  let currentIdx = 0;
  
  // If no music, btn-next-1 goes straight to question
  if (playlist.length === 0) {
    document.getElementById('btn-next-1')?.addEventListener('click', () => {
      goToStage('stage-2');
      initStage2(cfg);
    });
    return;
  }

  // Bind btn-next-1 to open CD Player
  document.getElementById('btn-next-1')?.addEventListener('click', () => {
    goToStage('stage-music');
    // Auto play first track if browser allows
    if (audio.paused) playTrack(0);
  });

  // Next button inside CD player goes to question
  document.getElementById('btn-next-music')?.addEventListener('click', () => {
    goToStage('stage-2');
    initStage2(cfg);
  });

  const timeEl = document.getElementById('cd-time');
  const trackEl = document.getElementById('cd-track-num');
  const artistEl = document.getElementById('cd-artist');
  const titleEl = document.getElementById('cd-title');
  const discIcon = document.querySelector('.spinning-cd');

  // Volume control
  const volSlider = document.getElementById('cd-volume');
  const volPct    = document.getElementById('cd-vol-pct');
  const volIcon   = document.getElementById('cd-vol-icon');
  let lastVol = 0.8;

  // Set initial audio volume
  audio.volume = 0.8;

  function updateVolUI(val) {
    const pct = Math.round(val * 100);
    if (volPct) volPct.textContent = pct + '%';
    if (volIcon) {
      if (val === 0)       volIcon.textContent = '🔇';
      else if (val < 0.4)  volIcon.textContent = '🔉';
      else                 volIcon.textContent = '🔊';
    }
  }

  volSlider?.addEventListener('input', () => {
    const val = volSlider.value / 100;
    audio.volume = val;
    audio.muted = (val === 0);
    lastVol = val > 0 ? val : lastVol;
    updateVolUI(val);
  });

  // Click icon to toggle mute
  volIcon?.addEventListener('click', () => {
    if (audio.muted || audio.volume === 0) {
      audio.muted = false;
      audio.volume = lastVol || 0.8;
      if (volSlider) volSlider.value = Math.round((lastVol || 0.8) * 100);
      updateVolUI(audio.volume);
    } else {
      lastVol = audio.volume;
      audio.muted = true;
      if (volSlider) volSlider.value = 0;
      updateVolUI(0);
    }
  });

  function playTrack(idx) {
    const t = playlist[idx];
    if (!t) return;
    audio.src = t.url || t.audioUrl || t.src;
    
    // Reset time to 0 to ensure it plays from start if switching tracks
    audio.currentTime = 0;
    
    audio.play().catch(e => {
      console.warn('Autoplay blocked or load failed:', e);
    });
    
    trackEl.textContent = String(idx + 1).padStart(2, '0');
    artistEl.textContent = t.artist || 'Unknown Artist';
    titleEl.textContent = t.title || 'Track ' + (idx + 1);
  }

  // Use a function to get the element dynamically in case it wasn't ready or changed
  function getDiscIcon() {
    return document.querySelector('.spinning-cd');
  }

  audio.addEventListener('play', () => {
    getDiscIcon()?.classList.remove('paused');
    const toggleBtn = document.getElementById('cd-toggle');
    if (toggleBtn) toggleBtn.textContent = '⏸';
  });
  
  audio.addEventListener('pause', () => {
    getDiscIcon()?.classList.add('paused');
    const toggleBtn = document.getElementById('cd-toggle');
    if (toggleBtn) toggleBtn.textContent = '▶';
  });
  
  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const m = Math.floor(audio.currentTime / 60);
    const s = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');
    if(timeEl) timeEl.textContent = `${m.toString().padStart(2, '0')}:${s}`;
  });

  audio.addEventListener('ended', () => {
    currentIdx = (currentIdx + 1) % playlist.length;
    playTrack(currentIdx);
  });

  document.getElementById('cd-toggle')?.addEventListener('click', () => {
    if (audio.paused) {
      if (!audio.src || audio.src === window.location.href) {
        playTrack(currentIdx);
      } else {
        audio.play().catch(e => {
          console.error("Play failed:", e);
          playTrack(currentIdx);
        });
      }
    } else {
      audio.pause();
    }
  });

  document.getElementById('cd-loop')?.addEventListener('click', (e) => {
    audio.loop = !audio.loop;
    e.currentTarget.style.boxShadow = audio.loop ? 'var(--sink)' : 'var(--raise)';
  });

  document.getElementById('cd-stop')?.addEventListener('click', () => {
    audio.pause();
    audio.currentTime = 0;
  });

  document.getElementById('cd-prev')?.addEventListener('click', () => {
    currentIdx = (currentIdx - 1 + playlist.length) % playlist.length;
    playTrack(currentIdx);
  });

  document.getElementById('cd-next')?.addEventListener('click', () => {
    currentIdx = (currentIdx + 1) % playlist.length;
    playTrack(currentIdx);
  });

  // Initialize UI without playing
  const first = playlist[0];
  if(first) {
    trackEl.textContent = '01';
    artistEl.textContent = first.artist || 'Unknown Artist';
    titleEl.textContent = first.title || 'Track 1';
  }
}

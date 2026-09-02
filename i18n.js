/* Shared, deliberately small locale helper for Birthday Retro. */
(function (global) {
  'use strict';

  const supported = new Set(['id', 'en']);
  const copy = {
    en: {
      language: 'Language', start: 'Start', question: 'Question', next: 'next :3', yes: 'yes!!', no: 'no thanks.',
      stage: 'Stage {current} of 5', openGift: 'Open gift', prev: '< Prev', nextMedia: 'Next >',
      passwordProtected: '🔑 This gift is password-protected. Enter password to open:', passwordPlaceholder: 'Password...',
      incorrectPassword: '❌ Incorrect password!', passwordCorrect: 'Password correct!', welcome: '👋 Welcome',
      welcomeBody: 'Click OK to open your special gift! 🎁', accessDenied: 'ACCESS DENIED.',
      wrongAnswer: 'Wrong answer! You MUST see the surprise!', noEscape: '(there is no escape)', fine: 'OK, fine 😤',
      playing: 'Playing', paused: 'Paused', stopped: 'Stopped', secret: 'secret 🔒', withLove: '— with love ♡',
      lineColumn: 'Ln {lines}, Col {columns}', mediaOf: '{current} of {total}', systemLanguage: 'Gift language'
    },
    id: {
      language: 'Bahasa', start: 'Mulai', question: 'Pertanyaan', next: 'lanjut :3', yes: 'iya!!', no: 'nggak dulu.',
      stage: 'Tahap {current} dari 5', openGift: 'Buka kado', prev: '< Sebelumnya', nextMedia: 'Berikutnya >',
      passwordProtected: '🔑 Kado ini dilindungi password. Masukkan password untuk membukanya:', passwordPlaceholder: 'Password...',
      incorrectPassword: '❌ Password salah!', passwordCorrect: 'Password benar!', welcome: '👋 Selamat datang',
      welcomeBody: 'Klik OK untuk membuka kado spesialmu! 🎁', accessDenied: 'AKSES DITOLAK.',
      wrongAnswer: 'Jawaban salah! Kamu HARUS melihat kejutannya!', noEscape: '(tidak ada jalan keluar)', fine: 'OK, baiklah 😤',
      playing: 'Memutar', paused: 'Dijeda', stopped: 'Berhenti', secret: 'rahasia 🔒', withLove: '— penuh cinta ♡',
      lineColumn: 'Baris {lines}, Kolom {columns}', mediaOf: '{current} dari {total}', systemLanguage: 'Bahasa kado'
    }
  };

  let locale = 'en';
  function normalize(value, fallback = 'en') { return supported.has(value) ? value : fallback; }
  function t(key, params) {
    let value = copy[locale][key] || copy.en[key] || key;
    Object.entries(params || {}).forEach(([name, replacement]) => { value = value.replace(`{${name}}`, String(replacement)); });
    return value;
  }
  function set(value, fallback) {
    locale = normalize(value, fallback || 'en');
    document.documentElement.lang = locale;
    return locale;
  }
  function get() { return locale; }
  global.RetroI18n = { copy, normalize, t, set, get };
})(window);

/* Locale UI for Birthday Retro Studio. Customer-written fields are never translated. */
const StudioLocale = (() => {
  const supported = new Set(['id', 'en']);
  let locale = 'id';

  // Bi-directional pairs: [Indonesian, English]
  const phrasePairs = [
    // Taskbar & Window
    ['Memuat Studio...', 'Loading Studio...'],
    ['Terjadi kesalahan.', 'Something went wrong.'],
    ['Studio siap! 🎁', 'Studio ready! 🎁'],
    ['Retro Gift Studio', 'Retro Gift Studio'],
    ['Retro Gift Editor — Studio', 'Retro Gift Editor — Studio'],
    ['File', 'File'],
    ['Edit', 'Edit'],
    ['Tools', 'Tools'],
    ['Help', 'Help'],

    // Template Selector
    ['Template', 'Template'],
    ['🪟 Template', '🪟 Template'],
    ['Ulang tahun', 'Birthday'],
    ['Minta maaf', 'Apology'],
    ['Buat apa saja', 'For anything'],
    ['Pilih gaya kado yang sesuai. Template mengubah teks, emoji, dan GIF default.', 'Choose the gift style. Templates change only the default copy, emoji, and GIF.'],

    // Feature Toggles (Premium)
    ['Fitur Tambahan (Premium)', 'Additional Features (Premium)'],
    ['⚙️ Fitur Tambahan (Premium)', '⚙️ Additional Features (Premium)'],
    ['Aktifkan fitur yang kamu butuhkan. Fitur yang dimatikan akan disembunyikan dari editor.', 'Enable the features you need. Disabled features are hidden from the editor.'],
    ['Tema Warna', 'Color Theme'],
    ['Password', 'Password'],
    ['Musik', 'Music'],
    ['Secret Media', 'Secret Media'],

    // Theme & Background
    ['Theme & Background', 'Theme & Background'],
    ['✨ Theme & Background', '✨ Theme & Background'],
    ['Fitur Premium', 'Premium Feature'],
    ['Warna Desktop:', 'Desktop Color:'],
    ['Pilih warna background utama kado.', 'Choose the main gift background color.'],

    // Password & Hint
    ['Password & Hint', 'Password & Hint'],
    ['🔐 Password & Hint', '🔐 Password & Hint'],
    ['Hint / Petunjuk:', 'Hint:'],
    ['Password:', 'Password:'],
    ['Kunci kadomu dengan password. Penerima harus memasukkan password untuk melihat kado.', 'Lock your gift with a password. The recipient must enter the password to open the gift.'],

    // Recipient
    ['Penerima', 'Recipient'],
    ['👤 Penerima', '👤 Recipient'],
    ['Nama:', 'Name:'],
    ['Umur:', 'Age:'],

    // Stage 1
    ['Stage 1 — Welcome', 'Stage 1 — Welcome'],
    ['🎂 Stage 1 — Welcome', '🎂 Stage 1 — Welcome'],
    ['💌 Stage 1 — Welcome', '💌 Stage 1 — Welcome'],
    ['🎁 Stage 1 — Welcome', '🎁 Stage 1 — Welcome'],
    ['Heading:', 'Heading:'],
    ['GIF:', 'GIF:'],
    ['Pilih', 'Choose'],
    ['🖼️ Pilih', '🖼️ Choose'],
    ['Teks yang muncul dengan typing animation di Stage 1. GIF opsional — kosongkan untuk default template.', 'Text that appears with typing animation in Stage 1. GIF is optional — leave empty for template default.'],

    // Stage 2
    ['Stage 2 — Surprise Question', 'Stage 2 — Surprise Question'],
    ['❓ Stage 2 — Surprise Question', '❓ Stage 2 — Surprise Question'],
    ['Question:', 'Question:'],
    ['Teks pertanyaan. Gunakan Enter untuk baris baru.', 'Question text. Use Enter for a new line.'],

    // Music Section
    ['Musik / Lagu (Max 3)', 'Music / Songs (Max 3)'],
    ['🎵 Musik / Lagu (Max 3)', '🎵 Music / Songs (Max 3)'],
    ['Lihat Library', 'View Library'],
    ['👀 Lihat Library', '👀 View Library'],
    ['Pilih lagu kesukaannya. Bagian ini opsional — jika dikosongkan, musik tidak akan diputar.', 'Choose their favorite song. This is optional — no music will play if left empty.'],
    ['+ Tambah Lagu', '+ Add Song'],
    ['Tambah Lagu', 'Add Song'],
    ['Belum ada lagu dipilih', 'No song selected yet'],
    ['Pilih dari Library', 'Choose from Library'],
    ['Ganti', 'Change'],
    ['Clear', 'Clear'],
    ['Judul:', 'Title:'],
    ['Artis:', 'Artist:'],
    ['Ganti File', 'Change File'],
    ['📁 Klik untuk upload MP3', '📁 Click to upload MP3'],
    ['Klik untuk upload MP3', 'Click to upload MP3'],
    ['Mengupload lagu... ⏳', 'Uploading song... ⏳'],
    ['Upload MP3', 'Upload MP3'],
    ['Upload 🔒', 'Upload 🔒'],
    ['Pilih lagu dari library:', 'Choose a song from library:'],
    ['Kembali', 'Back'],

    // Stage 4
    ['Stage 4 — Reveal', 'Stage 4 — Reveal'],
    ['🎉 Stage 4 — Reveal', '🎉 Stage 4 — Reveal'],
    ['Reveal text:', 'Reveal text:'],
    ['Teks yang muncul setelah hadiah dibuka (dengan confetti!). GIF opsional.', 'Text that appears after the gift is opened (with confetti!). GIF is optional.'],

    // Stage 5
    ['Stage 5 — Personal Message', 'Stage 5 — Personal Message'],
    ['📝 Stage 5 — Personal Message', '📝 Stage 5 — Personal Message'],
    ['Stage 5 — Birthday Wishes', 'Stage 5 — Birthday Wishes'],
    ['📝 Stage 5 — Birthday Wishes', '📝 Stage 5 — Birthday Wishes'],
    ['Stage 5 — Apology Letter', 'Stage 5 — Apology Letter'],
    ['📝 Stage 5 — Apology Letter', '📝 Stage 5 — Apology Letter'],
    ['Pesan:', 'Message:'],
    ['Pesan ini muncul dalam Notepad dengan typing animation. Tidak ada batas kata!', 'This message appears in Notepad with typing animation. No word limit!'],

    // Stage 6 — Secret Media
    ['Stage 6 — Secret Media', 'Stage 6 — Secret Media'],
    ['📸 Stage 6 — Secret Media', '📸 Stage 6 — Secret Media'],
    ['Preview Foto', 'Preview Photos'],
    ['👁 Preview Foto', '👁 Preview Photos'],
    ['Tambah Foto / Video', 'Add Photo / Video'],
    ['Maks 10 File (JPG/PNG/MP4)', 'Max 10 Files (JPG/PNG/MP4)'],
    ['Media rahasia yang akan muncul di akhir kado (Setelah Notepad). Bisa diisi caption per foto.', 'Secret media that appears at the end of the gift (after Notepad). You can add a caption per photo.'],

    // Upgrade Premium
    ['Upgrade Premium', 'Upgrade Premium'],
    ['💎 Upgrade Premium', '💎 Upgrade Premium'],
    ['Buka semua fitur terkunci (Tema Spesial, Password Security, dan Secret Media) khusus buatmu!', 'Unlock all locked features (Special Themes, Password Security, and Secret Media) just for you!'],
    ['Upgrade ke Premium (+10K)', 'Upgrade to Premium (+10K)'],
    ['💎 Upgrade ke Premium (+10K)', '💎 Upgrade to Premium (+10K)'],

    // Standalone Section
    ['Link Pribadi (Standalone)', 'Custom Link (Standalone)'],
    ['🔗 Link Pribadi (Standalone)', '🔗 Custom Link (Standalone)'],
    ['Request Link Pribadi (+5K)', 'Request Custom Link (+5K)'],
    ['🔗 Request Link Pribadi (+5K)', '🔗 Request Custom Link (+5K)'],

    // Actions
    ['Preview Card', 'Preview Gift'],
    ['▶️ Preview Card', '▶️ Preview Gift'],
    ['Publikasikan Kado', 'Publish Gift'],
    ['🌐 Publikasikan Kado', '🌐 Publish Gift'],

    // Modal Success Publish
    ['Publikasi Berhasil!', 'Published Successfully!'],
    ['🎉 Publikasi Berhasil!', '🎉 Published Successfully!'],
    ['Kadomu sudah online!', 'Your gift is now online!'],
    ['Link Kado:', 'Gift Link:'],
    ['Salin Link', 'Copy Link'],
    ['📋 Salin Link', '📋 Copy Link'],
    ['Buka', 'Open'],
    ['👁 Buka', '👁 Open'],
    ['Download QR', 'Download QR'],
    ['💾 Download QR', '💾 Download QR'],
    ['Scan to Open Gift!', 'Scan to Open Gift!'],
    ['RETRO GIFT', 'RETRO GIFT'],

    // Standalone Modal
    ['Request Link Pribadi', 'Request Custom Link'],
    ['🔗 Request Link Pribadi', '🔗 Request Custom Link'],
    ['Masukkan nama domain yang kamu inginkan:', 'Enter your desired domain name:'],
    ['Kirim Request', 'Submit Request'],
    ['Mengirim data...', 'Sending data...'],
    ['Request berhasil dikirim!', 'Request sent successfully!'],
    ['✅ Request berhasil dikirim!', '✅ Request sent successfully!'],
    ['💬 Hubungi Admin via WhatsApp', '💬 Contact Admin via WhatsApp'],
    ['Hubungi Admin via WhatsApp', 'Contact Admin via WhatsApp'],

    // GIF Picker Modal
    ['Pilih GIF', 'Choose GIF'],
    ['🖼️ Pilih GIF', '🖼️ Choose GIF'],
    ['Klik GIF untuk memilih. Scroll untuk melihat lebih banyak.', 'Click a GIF to choose. Scroll to see more.'],
    ['Cari', 'Search'],
    ['🔍 Cari', '🔍 Search'],
    ['◀ Prev', '◀ Prev'],
    ['Next ▶', 'Next ▶'],
    ['✏️ Atau pakai URL GIF sendiri:', '✏️ Or use your own GIF URL:'],
    ['Pakai', 'Use'],

    // Status & Toasts
    ['Tersimpan Otomatis ✓', 'Saved automatically ✓'],
    ['Menyimpan...', 'Saving...'],
    ['Gagal Menyimpan', 'Failed to save'],
    ['Mempublish...', 'Publishing...'],
    ['Menyiapkan...', 'Preparing...'],
    ['TERSALIN ✓', 'COPIED ✓']
  ];

  // HTML content translations by element ID
  const htmlPhrases = {
    'standalone-desc': [
      'Dapatkan link kado dengan <strong>domain sendiri</strong> (contoh: <code>nama-kamu.vercel.app</code>). Jadikan kado ini kenangan abadi dengan link eksklusif yang cuma milik kalian berdua! ✨',
      'Get a gift link with your <strong>own custom domain</strong> (e.g. <code>your-name.vercel.app</code>). Make this gift a timeless memory with an exclusive link that belongs just to the two of you! ✨'
    ],
    'music-lock-desc': [
      'Upgrade ke Premium untuk <b>pilih lagu dari Library</b> atau <b>Upload file MP3 kamu sendiri</b>.',
      'Upgrade to Premium to <b>choose songs from Library</b> or <b>Upload your own MP3 files</b>.'
    ],
    'gif-live-search-hint': [
      '💡 <strong>Live Search:</strong> Ketik kata kunci (contoh: "cat cry", "birthday") lalu tekan <strong>Enter</strong> atau klik Cari.',
      '💡 <strong>Live Search:</strong> Type keywords (e.g. "cat cry", "birthday") then press <strong>Enter</strong> or click Search.'
    ],
    'standalone-step3-desc': [
      'Data konfigurasi sudah terkirim ke admin. Selanjutnya, <strong>hubungi admin via WhatsApp</strong> untuk konfirmasi pembayaran:',
      'Configuration data has been sent to admin. Next, <strong>contact admin via WhatsApp</strong> for payment confirmation:'
    ],
    'standalone-domain-hint': [
      'Hanya huruf kecil, angka, dan strip (-). Contoh: <code>kado-untuk-desy</code>',
      'Lowercase letters, numbers, and hyphens (-) only. Example: <code>gift-for-you</code>'
    ]
  };

  // Input placeholders by element ID
  const inputPlaceholders = {
    'input-recipient-name': ['Nama penerima...', 'Recipient name...'],
    'input-gift-hint': ['Contoh: Tanggal jadian kita', 'e.g. Our anniversary date'],
    'input-gift-password': ['Opsional (Kosongkan jika tidak perlu)', 'Optional (leave empty if not needed)'],
    'input-stage1-gif': ['https://media.giphy.com/... (opsional)', 'https://media.giphy.com/... (optional)'],
    'input-stage4-gif': ['https://media.giphy.com/... (opsional)', 'https://media.giphy.com/... (optional)'],
    'input-stage5-wishes': ['Dear kamu,\n\nTulis pesan spesialmu di sini...', 'Dear you,\n\nWrite your special message here...'],
    'gif-picker-search-input': ['Cari GIF di Giphy...', 'Search GIF on Giphy...'],
    'standalone-domain': ['nama-kamu', 'your-name']
  };

  // Build bi-directional lookup map
  const lookup = new Map();
  phrasePairs.forEach(([idText, enText]) => {
    lookup.set(idText, [idText, enText]);
    lookup.set(enText, [idText, enText]);
  });

  function normalize(value) {
    return supported.has(value) ? value : 'id';
  }

  function t(text) {
    const pair = lookup.get(text);
    if (pair) return locale === 'en' ? pair[1] : pair[0];
    return text;
  }

  function replaceText() {
    const isEn = locale === 'en';

    // Walk all visible text nodes except scripts, styles, and customer message textareas
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA') return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => {
      const raw = node.nodeValue;
      const trimmed = raw.trim();
      if (!trimmed) return;
      const pair = lookup.get(trimmed);
      if (pair) {
        const target = isEn ? pair[1] : pair[0];
        if (trimmed !== target) {
          node.nodeValue = raw.replace(trimmed, target);
        }
      }
    });

    // Update HTML blocks by ID
    Object.entries(htmlPhrases).forEach(([id, variants]) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = variants[isEn ? 1 : 0];
    });

    // Update placeholders by ID
    Object.entries(inputPlaceholders).forEach(([id, variants]) => {
      const el = document.getElementById(id);
      if (el) {
        el.placeholder = variants[isEn ? 1 : 0];
      }
    });

    document.documentElement.lang = locale;
  }

  function apply(nextLocale) {
    locale = normalize(nextLocale);
    const label = document.querySelector('.studio-language-picker > span');
    if (label) label.textContent = locale === 'en' ? 'Language' : 'Bahasa';
    const select = document.getElementById('studio-language');
    if (select && select.value !== locale) select.value = locale;
    replaceText();
    return locale;
  }

  function init(initialLocale, onChange) {
    locale = normalize(initialLocale);
    if (!document.getElementById('studio-language')) {
      const active = document.querySelector('.studio-taskbar .taskbar-active');
      if (active) {
        const wrap = document.createElement('label');
        wrap.className = 'studio-language-picker';
        wrap.innerHTML = '<span>Bahasa</span><select id="studio-language" aria-label="Studio language"><option value="id">Indonesia</option><option value="en">English</option></select>';
        active.insertAdjacentElement('afterend', wrap);
        wrap.querySelector('select').addEventListener('change', (event) => onChange(event.target.value));
      }
    }
    const select = document.getElementById('studio-language');
    if (select) select.value = locale;
    apply(locale);
  }

  return { init, apply, normalize, get: () => locale, t };
})();
if (typeof window !== 'undefined') window.StudioLocale = StudioLocale;
if (typeof globalThis !== 'undefined') globalThis.StudioLocale = StudioLocale;

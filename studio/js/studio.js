/**
 * studio.js — Main Studio controller
 * Birthday Retro Studio
 */
const Studio = (() => {
  let _isPremium = false;
  let _playlist = [];

  function isPremium() { return _isPremium; }
  function getPlaylistArray() { return typeof Music !== 'undefined' ? Music.getPlaylistArray() : _playlist; }

  function showToast(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');
    el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.classList.add('hidden'), 300); }, 2500);
  }

  async function init() {
    const ok = await Auth.init();
    if (ok) initPostAuth();
  }

  // ── Template Presets ──────────────────────────────────
  const TEMPLATE_PRESETS = {
    birthday: {
      stage1_legend: '🎂 Stage 1 — Welcome',
      stage1_heading_placeholder: 'Happy 20th Birthday!',
      stage1_heading_default: 'Happy Birthday!',
      stage2_question_placeholder: 'i have a surprise for\nyou, wanna see it?',
      stage2_question_default: 'i have a surprise for\nyou, wanna see it?',
      stage4_text_placeholder: "it's a birthday surprise!! :D",
      stage4_text_default: "it's a birthday surprise!! :D",
      stage5_legend: '📝 Stage 5 — Birthday Wishes',
      stage5_placeholder: 'Dear kamu,\n\nHappy birthday!! 🎂\n\nTulis pesan birthday kamu di sini...',
      showAge: true,
    },
    apology: {
      stage1_legend: '💌 Stage 1 — Welcome',
      stage1_heading_placeholder: "I'm sorry...",
      stage1_heading_default: "I'm sorry...",
      stage2_question_placeholder: 'i have something\nto say to you...',
      stage2_question_default: 'i have something\nto say to you...',
      stage4_text_placeholder: 'Would you please forgive me?',
      stage4_text_default: 'Would you please forgive me?',
      stage5_legend: '📝 Stage 5 — Apology Letter',
      stage5_placeholder: 'Dear kamu,\n\nAku mau minta maaf...\n\nTulis pesan kamu di sini...',
      showAge: false,
    },
    general: {
      stage1_legend: '🎁 Stage 1 — Welcome',
      stage1_heading_placeholder: 'This is for you!',
      stage1_heading_default: 'This is for you!',
      stage2_question_placeholder: 'i have something\nspecial for you...',
      stage2_question_default: 'i have a message\nfor you...',
      stage4_text_placeholder: "surprise!! :D",
      stage4_text_default: "surprise!! :D",
      stage5_legend: '📝 Stage 5 — Personal Message',
      stage5_placeholder: 'Dear kamu,\n\nTulis pesan spesialmu di sini...',
      showAge: false,
    },
  };

  let _currentTemplate = 'birthday';

  function _applyTemplatePlaceholders(templateId) {
    const preset = TEMPLATE_PRESETS[templateId];
    if (!preset) return;

    _currentTemplate = templateId;

    // Update legends
    const legendStage1 = document.getElementById('legend-stage1');
    const legendStage5 = document.getElementById('legend-stage5');
    if (legendStage1) legendStage1.textContent = preset.stage1_legend;
    if (legendStage5) legendStage5.textContent = preset.stage5_legend;

    // Update placeholders (does NOT overwrite user values)
    const headingInput = document.getElementById('input-stage1-heading');
    const questionInput = document.getElementById('input-stage2-question');
    const revealInput = document.getElementById('input-stage4-text');
    const wishesInput = document.getElementById('input-stage5-wishes');

    if (headingInput) headingInput.placeholder = preset.stage1_heading_placeholder;
    if (questionInput) questionInput.placeholder = preset.stage2_question_placeholder;
    if (revealInput) revealInput.placeholder = preset.stage4_text_placeholder;
    if (wishesInput) wishesInput.placeholder = preset.stage5_placeholder;

    // Show/hide age field
    const ageRow = document.getElementById('field-age-row');
    if (ageRow) ageRow.style.display = preset.showAge ? '' : 'none';

    // Update template card selection UI
    document.querySelectorAll('.template-card').forEach(card => {
      card.classList.toggle('selected', card.dataset.template === templateId);
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = card.dataset.template === templateId;
    });
  }

  function initPostAuth() {
    const cfg = Auth.getInitialConfig() || {};
    _isPremium = cfg.isPremium === true;

    // ── Template selection ──
    const savedTemplate = cfg.template || 'birthday';
    _currentTemplate = savedTemplate;
    _applyTemplatePlaceholders(savedTemplate);

    // Bind template selector
    document.querySelectorAll('.template-card').forEach(card => {
      card.addEventListener('click', () => {
        const tpl = card.dataset.template;
        _applyTemplatePlaceholders(tpl);

        // Auto-update fields if user hasn't edited them or they are empty
        const headingInput = document.getElementById('input-stage1-heading');
        const questionInput = document.getElementById('input-stage2-question');
        const revealInput = document.getElementById('input-stage4-text');
        const preset = TEMPLATE_PRESETS[tpl];

        if (headingInput && !headingInput.dataset.userEdited) {
          if (tpl === 'birthday') {
            autoHeading();
          } else {
            headingInput.value = preset.stage1_heading_default;
          }
        }

        // Fill question if empty or not edited
        if (questionInput && (!questionInput.dataset.userEdited || !questionInput.value.trim())) {
          questionInput.value = preset.stage2_question_default;
        }

        // Fill reveal text if empty or not edited
        if (revealInput && (!revealInput.dataset.userEdited || !revealInput.value.trim())) {
          revealInput.value = preset.stage4_text_default;
        }

        Autosave.trigger();
      });
    });

    // Populate fields from saved config
    _setVal('input-recipient-name', cfg.recipientName);
    _setVal('input-age', cfg.age);
    _setVal('input-stage1-heading', cfg.stage1_heading || TEMPLATE_PRESETS[savedTemplate].stage1_heading_default);
    _setVal('input-stage2-question', cfg.stage2_question || TEMPLATE_PRESETS[savedTemplate].stage2_question_default);
    _setVal('input-stage4-text', cfg.stage4_reveal_text || TEMPLATE_PRESETS[savedTemplate].stage4_text_default);
    _setVal('input-stage5-wishes', cfg.stage5_wishes);

    // GIF URL fields
    _setVal('input-stage1-gif', cfg.stage1_gif || '');
    _setVal('input-stage4-gif', cfg.stage4_gif || '');

    // GIF Live Previews
    function _updateGifPreview(inputId, previewId) {
      const input = document.getElementById(inputId);
      const preview = document.getElementById(previewId);
      if (!input || !preview) return;
      const url = input.value.trim();
      if (url) {
        preview.src = url;
        preview.style.display = 'block';
      } else {
        preview.src = '';
        preview.style.display = 'none';
      }
    }

    const s1GifInput = document.getElementById('input-stage1-gif');
    if (s1GifInput) {
      s1GifInput.addEventListener('input', () => _updateGifPreview('input-stage1-gif', 'preview-stage1-gif'));
      _updateGifPreview('input-stage1-gif', 'preview-stage1-gif'); // init on load
    }

    const s4GifInput = document.getElementById('input-stage4-gif');
    if (s4GifInput) {
      s4GifInput.addEventListener('input', () => _updateGifPreview('input-stage4-gif', 'preview-stage4-gif'));
      _updateGifPreview('input-stage4-gif', 'preview-stage4-gif'); // init on load
    }

    // Initialize Music Manager
    if (typeof Music !== 'undefined') {
      Music.setPremiumMode(_isPremium);
      Music.init(cfg);
    }

    // Theme & Premium Lock
    const themeOverlay = document.getElementById('theme-lock-overlay');
    const themeInput = document.getElementById('input-theme');
    
    _setVal('input-theme', cfg.theme || 'classic');
    
    function applyStudioTheme() {
      const val = themeInput?.value || 'classic';
      let color = '#008080';
      if (val === 'rosepink') color = '#e8a8b8';
      else if (val === 'y2k') color = '#c8bfe7';
      else if (val === 'sky') color = '#99b4d1';
      else if (val === 'midnight') color = '#1a252c';
      document.documentElement.style.setProperty('--desktop', color);
    }
    
    applyStudioTheme(); // Apply immediately
    themeInput?.addEventListener('change', applyStudioTheme);

    if (!_isPremium) {
      if (themeOverlay) themeOverlay.classList.remove('hidden');
      if (themeInput) themeInput.disabled = true;
    } else {
      if (themeOverlay) themeOverlay.classList.add('hidden');
      if (themeInput) themeInput.disabled = false;
    }
    
    // Login & Premium Lock
    const loginOverlay = document.getElementById('login-lock-overlay');
    const passwordInput = document.getElementById('input-gift-password');
    const hintInput = document.getElementById('input-gift-hint');
    
    _setVal('input-gift-password', cfg.giftPassword || '');
    _setVal('input-gift-hint', cfg.giftHint || '');
    
    const togglePasswordBtn = document.getElementById('btn-toggle-password');
    if (togglePasswordBtn && passwordInput) {
      togglePasswordBtn.addEventListener('click', () => {
        if (passwordInput.type === 'password') {
          passwordInput.type = 'text';
          togglePasswordBtn.textContent = '🙈';
          togglePasswordBtn.title = 'Sembunyikan password';
        } else {
          passwordInput.type = 'password';
          togglePasswordBtn.textContent = '👁️';
          togglePasswordBtn.title = 'Lihat password';
        }
      });
    }
    
    if (!_isPremium) {
      if (loginOverlay) loginOverlay.classList.remove('hidden');
      if (passwordInput) passwordInput.disabled = true;
      if (hintInput) hintInput.disabled = true;
    } else {
      if (loginOverlay) loginOverlay.classList.add('hidden');
      if (passwordInput) passwordInput.disabled = false;
      if (hintInput) hintInput.disabled = false;
    }

    // Music & Premium Lock
    const musicOverlay = document.getElementById('music-lock-overlay');
    if (!_isPremium) {
      if (musicOverlay) musicOverlay.classList.remove('hidden');
      // Tombol "Lihat Library" — buka modal library dalam mode preview-only (semua locked)
      document.getElementById('btn-music-preview-library')?.addEventListener('click', () => {
        if (typeof Music !== 'undefined') Music.openLibraryPreview();
      });
    } else {
      if (musicOverlay) musicOverlay.classList.add('hidden');
    }

    // Auto-generate heading when name/age changes
    const nameInput = document.getElementById('input-recipient-name');
    const ageInput = document.getElementById('input-age');
    const headingInput = document.getElementById('input-stage1-heading');
    const questionInput = document.getElementById('input-stage2-question');
    const revealInput = document.getElementById('input-stage4-text');

    function autoHeading() {
      const name = nameInput?.value.trim() || '';
      const age = ageInput?.value.trim() || '';
      if (headingInput && !headingInput.dataset.userEdited) {
        if (_currentTemplate === 'birthday') {
          const suffix = age ? `${age}th` : '';
          headingInput.value = `Happy ${suffix} Birthday${name ? ', ' + name : ''}!`;
        }
      }
    }
    nameInput?.addEventListener('input', () => { autoHeading(); Autosave.trigger(); });
    ageInput?.addEventListener('input', () => { autoHeading(); Autosave.trigger(); });

    headingInput?.addEventListener('input', () => { headingInput.dataset.userEdited = '1'; Autosave.trigger(); });
    questionInput?.addEventListener('input', () => { questionInput.dataset.userEdited = '1'; Autosave.trigger(); });
    revealInput?.addEventListener('input', () => { revealInput.dataset.userEdited = '1'; Autosave.trigger(); });

    // Bind autosave to all inputs and selects
    document.querySelectorAll('#studio-main textarea, #studio-main input[type="text"], #studio-main input[type="url"]').forEach(el => {
      el.addEventListener('input', () => Autosave.trigger());
    });
    document.querySelectorAll('#studio-main select').forEach(el => {
      el.addEventListener('change', () => Autosave.trigger());
    });

    // Secret Media (Premium Lock)
    const memoryOverlay = document.getElementById('memory-lock-overlay');
    const memoryFileInput = document.getElementById('input-memory-file');
    if (!_isPremium) {
      if (memoryOverlay) memoryOverlay.classList.remove('hidden');
      if (memoryFileInput) memoryFileInput.disabled = true;
    } else {
      if (memoryOverlay) memoryOverlay.classList.add('hidden');
      if (memoryFileInput) memoryFileInput.disabled = false;
    }
    
    _mediaList = cfg.secretMediaList || [];
    _renderGallery();
    _initMemoryUpload();

    // Premium badge
    const badge = document.getElementById('premium-badge');
    if (badge) badge.textContent = _isPremium ? '✨ Premium' : 'Free';

    // Premium Upgrade Offer
    const upgradeSection = document.getElementById('premium-upgrade-section');
    if (upgradeSection) {
      upgradeSection.style.display = _isPremium ? 'none' : 'block';
    }

    // ── Feature Toggles ──────────────────────────────────
    const featureToggles = document.querySelectorAll('.toggle-checkbox');
    const savedToggles = cfg.featureToggles || {};
    
    featureToggles.forEach(toggle => {
      const targetId = toggle.dataset.target;
      const targetSection = document.getElementById(targetId);
      if (!targetSection) return;

      // Restore saved state (default: OFF / hidden)
      const isOn = savedToggles[targetId] === true;
      toggle.checked = isOn;
      targetSection.classList.toggle('feature-section-hidden', !isOn);

      // Bind change event
      toggle.addEventListener('change', () => {
        const section = document.getElementById(targetId);
        if (section) {
          section.classList.toggle('feature-section-hidden', !toggle.checked);
        }
        Autosave.saveNow(); // Save immediately, don't wait for debounce
      });
    });

    // Init GIF Picker
    initGifPicker();

    // Show studio
    document.getElementById('loading-screen')?.classList.add('hidden');
    document.getElementById('studio-main')?.classList.remove('hidden');

    showToast('Studio siap! 🎁');
  }

  // ── GIF Picker ───────────────────────────────────────
  function initGifPicker() {
    const overlay   = document.getElementById('gif-picker-overlay');
    const grid      = document.getElementById('gif-picker-grid');
    const titleEl   = document.getElementById('gif-picker-title');
    const closeBtn  = document.getElementById('btn-gif-picker-close');
    const customUrl = document.getElementById('gif-picker-custom-url');
    const useCustom = document.getElementById('btn-gif-picker-use-custom');
    if (!overlay || !grid) return;

    let _targetInputId = null; // which input to fill

    // Open picker when any "Pilih GIF" button is clicked
    document.querySelectorAll('.gif-pick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        _targetInputId = btn.dataset.input;
        const stage    = btn.dataset.stage; // 'stage1' or 'stage4'
        const tpl      = _currentTemplate || 'birthday';
        const stageLabel = stage === 'stage1' ? 'Stage 1 — Welcome' : 'Stage 4 — Reveal';
        if (titleEl) titleEl.textContent = `🖼️ Pilih GIF — ${stageLabel}`;

        // Get current value of the target input to pre-select
        const currentVal = document.getElementById(_targetInputId)?.value.trim() || '';
        if (customUrl) customUrl.value = currentVal;

        // Build grid
        _renderGifGrid(tpl, stage, currentVal);

        overlay.classList.remove('hidden');
      });
    });

    // Close button
    closeBtn?.addEventListener('click', () => overlay.classList.add('hidden'));

    // Close on backdrop click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.add('hidden');
    });

    // Use custom URL
    useCustom?.addEventListener('click', () => {
      _applyGif(customUrl?.value.trim() || '');
    });
    customUrl?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') _applyGif(customUrl.value.trim());
    });

    const searchInput = document.getElementById('gif-picker-search-input');
    const searchBtn = document.getElementById('btn-gif-picker-search');

    searchBtn?.addEventListener('click', () => {
      const query = searchInput?.value.trim();
      if (query) _searchTenor(query, customUrl?.value.trim() || '');
    });

    searchInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) _searchTenor(query, customUrl?.value.trim() || '');
      }
    });

    // ── Pagination state ──────────────────────────────
    let _gifQuery     = '';
    let _gifPage      = 1;
    let _gifNextPos   = '';          // Tenor "next" cursor for forward
    let _gifPageStack = [''];        // stack of "pos" values: index = page-1
    let _gifSelectedUrl = '';

    const paginationBar = document.getElementById('gif-pagination');
    const pageLabel     = document.getElementById('gif-page-label');
    const btnPrev       = document.getElementById('btn-gif-prev');
    const btnNext       = document.getElementById('btn-gif-next');

    function _showPagination(show) {
      if (paginationBar) paginationBar.style.display = show ? 'flex' : 'none';
    }
    function _updatePageLabel() {
      if (pageLabel) pageLabel.textContent = `Hal. ${_gifPage}`;
      if (btnPrev) btnPrev.disabled = _gifPage <= 1;
      if (btnNext) btnNext.disabled = !_gifNextPos;
    }

    btnPrev?.addEventListener('click', () => {
      if (_gifPage <= 1) return;
      _gifPage--;
      const pos = _gifPageStack[_gifPage - 1] || '';
      _fetchTenor(_gifQuery, pos, false);
    });

    btnNext?.addEventListener('click', () => {
      if (!_gifNextPos) return;
      _gifPage++;
      if (_gifPageStack.length < _gifPage) _gifPageStack.push(_gifNextPos);
      _fetchTenor(_gifQuery, _gifNextPos, false);
    });

    async function _fetchTenor(query, pos, resetPage) {
      grid.innerHTML = '<p class="gif-picker-empty">Mencari GIF...</p>';
      _showPagination(false);
      try {
        let url = `https://g.tenor.com/v1/search?q=${encodeURIComponent(query)}&key=LIVDSRZULELA&limit=20`;
        if (pos) url += `&pos=${encodeURIComponent(pos)}`;
        const res  = await fetch(url);
        const data = await res.json();

        _gifNextPos = data.next || '';
        const urls = data.results.map(item => item.media[0].gif.url);
        _renderGridItems(urls, _gifSelectedUrl);

        _showPagination(urls.length > 0);
        _updatePageLabel();
        // Scroll grid back to top on page change
        const scrollBox = grid.closest('[style*="overflow-y"]') || grid.parentElement;
        if (scrollBox) scrollBox.scrollTop = 0;
      } catch (e) {
        grid.innerHTML = '<p class="gif-picker-empty">Gagal mengambil data dari Tenor. Coba lagi nanti.</p>';
      }
    }

    async function _searchTenor(query, selectedUrl) {
      _gifQuery      = query;
      _gifPage       = 1;
      _gifNextPos    = '';
      _gifPageStack  = [''];
      _gifSelectedUrl = selectedUrl;
      _fetchTenor(query, '', true);
    }

    function _renderGridItems(urls, selectedUrl) {
      grid.innerHTML = '';
      if (!urls.length) {
        grid.innerHTML = '<p class="gif-picker-empty">GIF tidak ditemukan.</p>';
        return;
      }
      urls.forEach(url => {
        const item = document.createElement('div');
        item.className = 'gif-picker-item' + (url === selectedUrl ? ' selected' : '');
        item.innerHTML = `<img class="gif-picker-img" src="${url}" alt="GIF" loading="lazy">`;
        item.addEventListener('click', () => {
          grid.querySelectorAll('.gif-picker-item').forEach(i => i.classList.remove('selected'));
          item.classList.add('selected');
          _gifSelectedUrl = url;
          _applyGif(url);
        });
        grid.appendChild(item);
      });
    }

    function _renderGifGrid(template, stage, selectedUrl) {
      if (searchInput) searchInput.value = ''; // Reset search input on open
      const lib  = (typeof GIF_LIBRARY !== 'undefined') ? GIF_LIBRARY : {};
      const gifs = lib[template] || []; // flat array of URL strings
      _renderGridItems(gifs, selectedUrl);
    }

    function _applyGif(url) {
      const input = document.getElementById(_targetInputId);
      if (input) {
        input.value = url;
        input.dispatchEvent(new Event('input')); // trigger autosave
      }
      overlay.classList.add('hidden');
      showToast(url ? 'GIF dipilih! ✓' : 'GIF dikosongkan.');
    }
  }

  // ── Secret Memory — Multi-Photo Gallery ─────────────────
  let _mediaList = [];
  const MAX_PHOTOS = 10;

  function _showWinConfirm(message, onConfirm) {
    const modal = document.createElement('div');
    modal.className = 'screen-overlay';
    modal.style.zIndex = '300';
    modal.innerHTML = `
    <div class="win-dialog" style="width:300px;">
      <div class="win-titlebar">
        <span class="win-title-text">Confirm</span>
        <button id="confirm-close" class="win-controls" style="background:none;border:none;color:#fff;cursor:pointer;">✕</button>
      </div>
      <div class="win-body" style="padding:15px; text-align:center;">
        <p style="margin-bottom:15px;">${message}</p>
        <div style="text-align:right;">
          <button id="confirm-yes" class="win-btn" style="min-width:60px; margin-right:8px;">Yes</button>
          <button id="confirm-no" class="win-btn" style="min-width:60px;">No</button>
        </div>
      </div>
    </div>`;
    document.body.appendChild(modal);

    const close = () => modal.remove();

    modal.querySelector('#confirm-close')?.addEventListener('click', close);
    modal.querySelector('#confirm-no')?.addEventListener('click', close);
    modal.querySelector('#confirm-yes')?.addEventListener('click', () => {
      onConfirm();
      close();
    });
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
  }

  function _renderGallery() {
    const listEl = document.getElementById('memory-gallery-list');
    const addWrap = document.getElementById('memory-add-wrap');
    const countEl = document.getElementById('memory-count-label');
    if (!listEl) return;

    listEl.innerHTML = '';

    _mediaList.forEach((item, idx) => {
      const isVideo = /\.(mp4|webm|mov|ogg)/i.test(item.url);
      const isFirst = idx === 0;
      const isLast  = idx === _mediaList.length - 1;

      const div = document.createElement('div');
      div.style.display = 'flex';
      div.style.alignItems = 'center';
      div.style.gap = '6px';
      div.style.background = '#fff';
      div.style.border = '2px inset #d4d0c8';
      div.style.padding = '6px 8px';
      
      div.innerHTML = `
        <!-- Reorder arrows -->
        <div style="display:flex;flex-direction:column;gap:2px;flex-shrink:0;">
          <button data-up="${idx}" class="win-btn" style="min-width:24px;padding:0 4px;font-size:0.7rem;line-height:1.4;${isFirst ? 'opacity:0.3;cursor:default;' : ''}" title="Geser ke atas" ${isFirst ? 'disabled' : ''}>▲</button>
          <button data-down="${idx}" class="win-btn" style="min-width:24px;padding:0 4px;font-size:0.7rem;line-height:1.4;${isLast ? 'opacity:0.3;cursor:default;' : ''}" title="Geser ke bawah" ${isLast ? 'disabled' : ''}>▼</button>
        </div>
        <!-- Thumbnail -->
        <div style="width:44px;height:44px;flex-shrink:0;background:#000;border:2px inset #fff;border-color:#808080 #fff #fff #808080;position:relative;">
          ${isVideo
          ? `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#fff;">▶</div>`
          : `<img src="${item.url}" alt="" style="width:100%;height:100%;object-fit:cover;">`
        }
          <span style="position:absolute;bottom:1px;right:2px;font-size:0.55rem;background:rgba(0,0,0,0.6);color:#fff;padding:0 2px;border-radius:1px;">${idx + 1}</span>
        </div>
        <!-- Caption input -->
        <input type="text" maxlength="60" placeholder="Caption..." value="${item.caption || ''}" class="win-input" style="flex:1;" data-idx="${idx}">
        <!-- Delete -->
        <button data-remove="${idx}" class="win-btn" style="min-width:28px;font-weight:bold;color:red;flex-shrink:0;">✕</button>
      `;

      // Caption
      const captionInput = div.querySelector(`input[data-idx="${idx}"]`);
      captionInput?.addEventListener('input', (e) => {
        _mediaList[idx].caption = e.target.value;
        Autosave.trigger();
      });

      // Move up
      div.querySelector(`[data-up="${idx}"]`)?.addEventListener('click', () => {
        if (idx === 0) return;
        [_mediaList[idx - 1], _mediaList[idx]] = [_mediaList[idx], _mediaList[idx - 1]];
        _renderGallery();
        Autosave.trigger();
      });

      // Move down
      div.querySelector(`[data-down="${idx}"]`)?.addEventListener('click', () => {
        if (idx >= _mediaList.length - 1) return;
        [_mediaList[idx], _mediaList[idx + 1]] = [_mediaList[idx + 1], _mediaList[idx]];
        _renderGallery();
        Autosave.trigger();
      });

      // Delete
      div.querySelector(`[data-remove="${idx}"]`)?.addEventListener('click', () => {
        _showWinConfirm('Are you sure you want to delete this media?', () => {
          _mediaList.splice(idx, 1);
          _renderGallery();
          Autosave.trigger();
        });
      });

      listEl.appendChild(div);
    });

    const count = _mediaList.length;
    if (countEl) {
      if (count > 0) {
        countEl.textContent = `${count} / ${MAX_PHOTOS} media`;
        countEl.style.display = 'block';
      } else {
        countEl.style.display = 'none';
      }
    }

    if (addWrap) addWrap.style.display = count >= MAX_PHOTOS ? 'none' : 'block';

    // Show/hide Preview Foto button
    const previewBtnWrap = document.getElementById('memory-preview-btn-wrap');
    if (previewBtnWrap) {
      previewBtnWrap.style.display = (_isPremium && count > 0) ? 'block' : 'none';
    }
  }

  function _initMemoryUpload() {
    const fileInput = document.getElementById('input-memory-file');
    if (!fileInput) return;

    fileInput.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files || []);
      fileInput.value = '';
      if (!files.length) return;

      const slots = MAX_PHOTOS - _mediaList.length;
      const toUpload = files.slice(0, slots);
      if (files.length > slots) showToast(`Max ${slots} media left!`);

      for (const file of toUpload) {
        const url = await _uploadOneToR2(file);
        if (url) {
          _mediaList.push({ url, caption: '' });
          _renderGallery();
        }
      }
      Autosave.trigger();
    });
  }

  async function _uploadOneToR2(file) {
    const workerUrl = Auth.getWorkerUrl();
    const token = Auth.getToken();
    if (!workerUrl || !token) { showToast('Auth error'); return null; }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowed.includes(file.type)) { showToast('Invalid file type'); return null; }
    if (file.size > 15 * 1024 * 1024) { showToast('File too large (> 15MB)'); return null; }

    const progressWrap = document.getElementById('memory-upload-progress-wrap');
    const progressBar = document.getElementById('memory-upload-progress-bar');
    const statusText = document.getElementById('memory-upload-status');

    if (progressWrap) progressWrap.classList.remove('hidden');
    if (progressBar) progressBar.style.width = '10%';
    if (statusText) statusText.textContent = `Uploading ${file.name}...`;

    try {
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const ext = file.name.split('.').pop().toLowerCase();
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')).replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const key = `letters/${timestamp}-${randomStr}-${baseName}.${ext}`;

      if (progressBar) progressBar.style.width = '40%';

      const res = await fetch(`${workerUrl}/upload-direct/${key}?id=${encodeURIComponent(token)}`, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!res.ok) throw new Error('Upload failed');

      if (progressBar) progressBar.style.width = '90%';
      const data = await res.json();
      const rawUrl = data.url || data.publicUrl || '';
      const cdnUrl = rawUrl + '?v=' + timestamp;

      if (progressBar) progressBar.style.width = '100%';
      if (statusText) statusText.textContent = `Success ✓`;
      showToast('Media uploaded!');

      setTimeout(() => {
        if (progressWrap) progressWrap.classList.add('hidden');
        if (progressBar) progressBar.style.width = '0%';
        if (statusText) statusText.textContent = '';
      }, 1000);

      return cdnUrl;
    } catch (err) {
      console.error(err);
      showToast('Upload failed');
      if (progressWrap) progressWrap.classList.add('hidden');
      return null;
    }
  }

  function getMediaList() { return _mediaList; }

  function _setVal(id, val) {
    const el = document.getElementById(id);
    if (el && val !== undefined && val !== null) el.value = val;
  }

  return { init, initPostAuth, isPremium, getPlaylistArray, showToast, getMediaList };
})();

document.addEventListener('DOMContentLoaded', Studio.init);

/**
 * publisher.js — Publish flow for Birthday Retro Studio
 */
const Publisher = (() => {
  let _isPublishing = false;

  function init() {
    document.getElementById('btn-publish')?.addEventListener('click', _handlePublishClick);

    // Premium Upgrade Direct WhatsApp
    document.getElementById('btn-upgrade-premium')?.addEventListener('click', () => {
      const token = Auth.getToken();
      const waMsg = encodeURIComponent(
        `REQUEST UPGRADE PREMIUM — BIRTHDAY RETRO EDITION (+10K)\n\n` +
        `ID Kado: ${token}\n\n` +
        `Halo admin, saya ingin request upgrade akun Premium untuk membuka fitur Tema Spesial, Password Security, dan Secret Media.`
      );
      window.open(`https://wa.me/6281936109076?text=${waMsg}`, '_blank');
    });

    // ── Standalone Request ──────────────────────────────────────
    document.getElementById('btn-request-standalone')?.addEventListener('click', () => {
      // Reset modal state
      document.getElementById('standalone-step1').classList.remove('hidden');
      document.getElementById('standalone-step2').classList.add('hidden');
      document.getElementById('standalone-step3').classList.add('hidden');
      document.getElementById('standalone-error').classList.add('hidden');
      document.getElementById('standalone-domain').value = '';
      document.getElementById('standalone-progress').style.width = '0%';
      document.getElementById('modal-standalone').classList.remove('hidden');
    });

    document.getElementById('btn-close-standalone')?.addEventListener('click', () => {
      document.getElementById('modal-standalone').classList.add('hidden');
    });

    document.getElementById('btn-standalone-submit')?.addEventListener('click', _handleStandaloneSubmit);

    document.getElementById('standalone-domain')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') _handleStandaloneSubmit();
    });

    // Success modal
    document.getElementById('btn-copy-link')?.addEventListener('click', _handleCopyLink);
    document.getElementById('btn-close-success')?.addEventListener('click', () => _toggleModal('modal-success', false));
  }

  function _toggleModal(id, show) {
    document.getElementById(id)?.classList.toggle('hidden', !show);
  }

  // ── Step 1: Validate & Do actual publish ──────────────────────────────
  async function _handlePublishClick() {
    if (_isPublishing) return;

    if (typeof Music !== 'undefined' && Music.isUploading()) {
      Studio.showToast('Tunggu upload musik selesai dulu ⏳');
      return;
    }

    _isPublishing = true;
    const submitBtn = document.getElementById('btn-publish');
    const originalText = submitBtn.textContent;
    if (submitBtn) {
      submitBtn.textContent = (typeof StudioLocale !== 'undefined' && StudioLocale.get() === 'en') ? 'Publishing...' : 'Mempublish...';
      submitBtn.disabled = true;
    }

    try {
      const token = Auth.getToken();
      const state = Autosave.buildState();
      state.status = 'published';
      state.publishedAt = new Date().toISOString();

      const res = await fetch(`${Auth.getWorkerUrl()}/save-config?id=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });
      
      let data = {};
      try {
        data = await res.json();
      } catch (e) {
        throw new Error('Server error: Could not parse response. Pastikan Worker sudah berjalan dengan benar.');
      }

      if (data.success) {
        Autosave.cancel();
        const url = `https://retro.for-you-always.my.id/?to=${encodeURIComponent(token)}`;
        _showSuccessModal(url);
      } else {
        throw new Error(data.error || 'Server error');
      }
    } catch (e) {
      Studio.showToast('Gagal publish: ' + e.message);
      console.error(e);
    } finally {
      _isPublishing = false;
      if (submitBtn) {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    }
  }

  function _showSuccessModal(url) {
    const urlEl = document.getElementById('modal-gift-url');
    const viewBtn = document.getElementById('btn-view-gift');
    const qrBox = document.getElementById('qr-code-box');

    if (urlEl) urlEl.textContent = url;
    if (viewBtn) viewBtn.href = url;

    // Generate QR Code
    if (qrBox && typeof QRCode !== 'undefined') {
      qrBox.innerHTML = '';
      new QRCode(qrBox, {
        text: url,
        width: 148,
        height: 148,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
      
      // Fix for mobile: qrcode.js might use canvas instead of img on some devices.
      const styleTag = document.createElement('style');
      styleTag.textContent = '#qr-code-box img, #qr-code-box canvas { margin: 0 auto !important; display: block; }';
      qrBox.appendChild(styleTag);
    }

    // Bind Download QR Button
    const downloadBtn = document.getElementById('btn-download-qr');
    if (downloadBtn) {
      const newBtn = downloadBtn.cloneNode(true);
      downloadBtn.parentNode.replaceChild(newBtn, downloadBtn);
      newBtn.addEventListener('click', _handleDownloadQR);
    }

    if (typeof StudioLocale !== 'undefined' && StudioLocale.apply) {
      StudioLocale.apply(StudioLocale.get());
    }

    _toggleModal('modal-success', true);
  }

  async function _handleDownloadQR() {
    const exportNode = document.getElementById('qr-export-container');
    const btn = document.getElementById('btn-download-qr');

    if (!exportNode || typeof html2canvas === 'undefined') {
      Studio.showToast((typeof StudioLocale !== 'undefined' && StudioLocale.get() === 'en') ? 'Download feature not ready. Please take a screenshot.' : 'Fitur download belum siap. Silakan screenshot manual.');
      return;
    }

    const originalText = btn.innerHTML;
    btn.innerHTML = (typeof StudioLocale !== 'undefined' && StudioLocale.get() === 'en') ? 'Preparing...' : 'Menyiapkan...';
    btn.style.opacity = '0.7';
    btn.disabled = true;

    try {
      const canvas = await html2canvas(exportNode, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#fff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Birthday_QR_${Math.floor(Date.now() / 1000)}.png`;
      link.href = imgData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error generating QR PNG:', err);
      Studio.showToast((typeof StudioLocale !== 'undefined' && StudioLocale.get() === 'en') ? 'Failed to download barcode.' : 'Gagal mendownload barcode.');
    } finally {
      requestAnimationFrame(() => {
        btn.innerHTML = originalText;
        btn.style.opacity = '1';
        btn.disabled = false;
      });
    }
  }

  function _handleCopyLink() {
    const url = document.getElementById('modal-gift-url')?.textContent?.trim();
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      const btn = document.getElementById('btn-copy-link');
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = (typeof StudioLocale !== 'undefined' && StudioLocale.get() === 'en') ? 'COPIED ✓' : 'TERSALIN ✓';
        setTimeout(() => btn.textContent = originalText, 2000);
      }
    }).catch(() => Studio.showToast((typeof StudioLocale !== 'undefined' && StudioLocale.get() === 'en') ? 'Failed to copy. Try manually.' : 'Gagal salin. Coba manual.'));
  }
  // ── Standalone Request Handler ─────────────────────────────
  async function _handleStandaloneSubmit() {
    const domainInput = document.getElementById('standalone-domain');
    const error = document.getElementById('standalone-error');
    const domain = domainInput.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    error.classList.add('hidden');

    if (!domain || domain.length < 3) {
      error.textContent = (typeof StudioLocale !== 'undefined' && StudioLocale.get() === 'en') ? 'Domain must be at least 3 characters (lowercase, numbers, hyphen).' : 'Domain minimal 3 karakter (huruf kecil, angka, strip).';
      error.classList.remove('hidden');
      return;
    }

    // Show loading
    document.getElementById('standalone-step1').classList.add('hidden');
    document.getElementById('standalone-step2').classList.remove('hidden');
    const progressBar = document.getElementById('standalone-progress');
    progressBar.style.width = '30%';

    try {
      // Build current config
      const state = Autosave.buildState();
      state.requestedDomain = domain + '.vercel.app';
      state.requestedAt = new Date().toISOString();

      progressBar.style.width = '60%';

      const res = await fetch(`${Auth.getWorkerUrl()}/request-standalone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, config: state }),
      });
      const data = await res.json();

      progressBar.style.width = '100%';

      if (data.success) {
        setTimeout(() => {
          document.getElementById('standalone-step2').classList.add('hidden');
          document.getElementById('standalone-step3').classList.remove('hidden');
          document.getElementById('standalone-result-domain').textContent = data.domain;

          // Build WhatsApp link
          const waMsg = encodeURIComponent(
            `REQUEST LINK PRIBADI — RETRO GIFT (+5K)\n\n` +
            `Domain: ${data.domain}\n` +
            `Nama Penerima: ${state.recipientName || '—'}\n` +
            `Template: ${state.template || 'birthday'}\n\n` +
            `Data sudah terkirim otomatis. Mohon diproses ya, terima kasih!`
          );
          document.getElementById('btn-standalone-wa').href = `https://wa.me/6281936109076?text=${waMsg}`;
        }, 500);
      } else {
        throw new Error(data.error || 'Gagal mengirim request.');
      }
    } catch (e) {
      document.getElementById('standalone-step2').classList.add('hidden');
      document.getElementById('standalone-step1').classList.remove('hidden');
      error.textContent = 'Error: ' + e.message;
      error.classList.remove('hidden');
    }
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
  // Wait for Studio to be ready before init
  setTimeout(() => Publisher.init(), 100);
});

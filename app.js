(() => {
  // --- DOM refs ---
  const welcome = document.getElementById('welcome');
  const enterBtn = document.getElementById('enter-btn');
  const desktop = document.getElementById('desktop');
  const camera = document.getElementById('camera');
  const captureBtn = document.getElementById('capture-btn');
  const captureCanvas = document.getElementById('capture-canvas');
  const collageCanvas = document.getElementById('collage-canvas');
  const countdownOverlay = document.getElementById('countdown-overlay');
  const flash = document.getElementById('flash');
  const filmstrip = document.getElementById('filmstrip');
  const placeholder = document.getElementById('camera-placeholder');
  const dock = document.getElementById('dock');
  const titlebar = document.getElementById('titlebar');
  const photobooth = document.getElementById('photobooth');
  const tlClose = document.getElementById('tl-close');
  const menubarTime = document.getElementById('menubar-time');
  const effectsToggle = document.getElementById('effects-toggle');
  const effectsGrid = document.getElementById('effects-grid');
  const pbViewport = document.getElementById('pb-viewport');
  const videoEasterEgg = document.getElementById('video-easter-egg');
  const collageProgress = document.getElementById('collage-progress');
  const settingsWindow = document.getElementById('settings-window');
  const settingsTitlebar = document.getElementById('settings-titlebar');
  const settingsTlClose = document.getElementById('settings-tl-close');
  const helpWindow = document.getElementById('help-window');
  const helpTitlebar = document.getElementById('help-titlebar');
  const helpTlClose = document.getElementById('help-tl-close');
  const menubarHelp = document.getElementById('menubar-help');
  const settingsHelpBtn = document.getElementById('settings-help-btn');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxDownload = document.getElementById('lightbox-download');
  const lightboxBackdrop = lightbox.querySelector('.lightbox-backdrop');

  let stream = null;
  let currentEffect = 'none';
  let currentMode = 'photo'; // photo, collage, video
  let effectsViewActive = false;
  let effectsAnimFrame = null;

  const EFFECTS = [
    { name: 'Mirror',    filter: 'none',                         special: 'mirror' },
    { name: 'Normal',    filter: 'none',                         special: null },
    { name: 'Thermal',   filter: 'hue-rotate(180deg) saturate(3) contrast(1.5)', special: null },
    { name: 'Sepia',     filter: 'sepia(100%)',                  special: null },
    { name: 'Normal',    filter: 'none',                         special: null }, // center = always normal
    { name: 'B&W',       filter: 'grayscale(100%)',              special: null },
    { name: 'Pop Art',   filter: 'contrast(200%) saturate(2)',   special: null },
    { name: 'Invert',    filter: 'invert(100%)',                 special: null },
    { name: 'Cool',      filter: 'hue-rotate(200deg) brightness(1.1)', special: null },
  ];

  // --- Clock ---
  function updateClock() {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, '0');
    const day = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    menubarTime.textContent = `${day}  ${hour}:${m} ${ampm}`;
  }
  updateClock();
  setInterval(updateClock, 10000);

  // --- Welcome ---
  enterBtn.addEventListener('click', () => {
    welcome.style.transition = 'opacity 0.6s ease';
    welcome.style.opacity = '0';
    setTimeout(() => {
      welcome.classList.add('hidden');
      desktop.classList.remove('hidden');
      desktop.style.animation = 'welcomeFadeIn 0.6s ease';
    }, 600);
  });

  // --- Camera ---
  async function startCamera() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false
      });
      camera.srcObject = stream;
      placeholder.classList.add('hidden');
      captureBtn.disabled = false;
    } catch (err) {
      console.error('Camera error:', err);
      placeholder.querySelector('p').textContent = 'Camera access denied';
    }
  }

  placeholder.addEventListener('click', startCamera);

  // --- Mode Switching ---
  document.querySelectorAll('.pb-mode').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      if (mode === currentMode) return;

      document.querySelector('.pb-mode.active').classList.remove('active');
      btn.classList.add('active');
      currentMode = mode;

      // Exit effects view if active
      if (effectsViewActive) toggleEffectsView(false);

      // Show/hide views
      videoEasterEgg.classList.add('hidden');

      if (mode === 'video') {
        videoEasterEgg.classList.remove('hidden');
        captureBtn.disabled = true;
      } else {
        captureBtn.disabled = !stream;
      }
    });
  });

  // --- Effects Grid View ---
  effectsToggle.addEventListener('click', () => {
    if (currentMode === 'video') return;
    toggleEffectsView(!effectsViewActive);
  });

  function toggleEffectsView(show) {
    effectsViewActive = show;
    effectsToggle.classList.toggle('active', show);

    if (show) {
      // Shrink camera, then show grid
      pbViewport.classList.add('shrunk');
      filmstrip.classList.add('hidden');
      setTimeout(() => {
        effectsGrid.classList.remove('hidden');
        effectsGrid.classList.add('fade-in');
        buildEffectsGrid();
        startEffectsLoop();
        setTimeout(() => effectsGrid.classList.remove('fade-in'), 350);
      }, 200);
    } else {
      // Hide grid, expand camera back
      effectsGrid.classList.add('hidden');
      stopEffectsLoop();
      pbViewport.classList.remove('shrunk');
      if (filmstrip.children.length) filmstrip.classList.remove('hidden');
    }
  }

  function buildEffectsGrid() {
    effectsGrid.innerHTML = '';
    EFFECTS.forEach((eff, i) => {
      const cell = document.createElement('div');
      cell.className = 'effects-grid-cell';
      const cvs = document.createElement('canvas');
      cell.appendChild(cvs);

      const label = document.createElement('span');
      label.className = 'effect-label';
      label.textContent = eff.name;
      cell.appendChild(label);

      cell.addEventListener('click', () => {
        currentEffect = eff.filter;
        camera.style.filter = eff.filter === 'none' ? '' : eff.filter;
        toggleEffectsView(false);
      });

      effectsGrid.appendChild(cell);
    });

    // Size canvases to match cell dimensions after layout
    requestAnimationFrame(sizeEffectCanvases);
  }

  function sizeEffectCanvases() {
    effectsGrid.querySelectorAll('.effects-grid-cell').forEach(cell => {
      const cvs = cell.querySelector('canvas');
      const r = cell.getBoundingClientRect();
      cvs.width = Math.round(r.width * devicePixelRatio);
      cvs.height = Math.round(r.height * devicePixelRatio);
    });
  }

  function startEffectsLoop() {
    function draw() {
      if (!effectsViewActive || !stream) return;
      const cells = effectsGrid.querySelectorAll('.effects-grid-cell canvas');
      const vw = camera.videoWidth;
      const vh = camera.videoHeight;

      cells.forEach((cvs, i) => {
        const ctx = cvs.getContext('2d');
        const cw = cvs.width;
        const ch = cvs.height;

        // Cover-crop: match cell aspect ratio from center of video
        const cellAR = cw / ch;
        const vidAR = vw / vh;
        let sx = 0, sy = 0, sw = vw, sh = vh;
        if (vidAR > cellAR) {
          sw = vh * cellAR;
          sx = (vw - sw) / 2;
        } else {
          sh = vw / cellAR;
          sy = (vh - sh) / 2;
        }

        ctx.save();
        ctx.translate(cw, 0);
        ctx.scale(-1, 1);

        if (EFFECTS[i].filter !== 'none') {
          ctx.filter = EFFECTS[i].filter;
        }

        ctx.drawImage(camera, sx, sy, sw, sh, 0, 0, cw, ch);
        ctx.restore();
      });
      effectsAnimFrame = requestAnimationFrame(draw);
    }
    draw();
  }

  function stopEffectsLoop() {
    if (effectsAnimFrame) {
      cancelAnimationFrame(effectsAnimFrame);
      effectsAnimFrame = null;
    }
  }

  // --- Capture ---
  captureBtn.addEventListener('click', () => {
    if (!stream || currentMode === 'video') return;

    if (currentMode === 'collage') {
      startCollage();
    } else {
      captureBtn.disabled = true;
      doCountdownThenCapture(() => {
        const dataUrl = captureFrame();
        addToFilmstrip(dataUrl);
        captureBtn.disabled = false;
      });
    }
  });

  function doCountdownThenCapture(callback) {
    let count = 3;
    countdownOverlay.classList.remove('hidden');
    countdownOverlay.textContent = count;

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        countdownOverlay.textContent = count;
        countdownOverlay.style.animation = 'none';
        countdownOverlay.offsetHeight;
        countdownOverlay.style.animation = 'countPulse 0.5s ease';
      } else {
        clearInterval(interval);
        countdownOverlay.classList.add('hidden');
        // Flash fires, then capture during the bright moment
        doFlash();
        setTimeout(callback, 120); // capture slightly after flash peak
      }
    }, 800);
  }

  function doFlash() {
    flash.classList.remove('hidden');
    flash.style.animation = 'none';
    flash.offsetHeight;
    flash.style.animation = 'flashAnim 0.5s ease-out forwards';
    setTimeout(() => flash.classList.add('hidden'), 500);
  }

  function captureFrame() {
    const ctx = captureCanvas.getContext('2d');
    captureCanvas.width = camera.videoWidth;
    captureCanvas.height = camera.videoHeight;
    ctx.save();
    ctx.translate(captureCanvas.width, 0);
    ctx.scale(-1, 1);
    if (currentEffect !== 'none') ctx.filter = currentEffect;
    ctx.drawImage(camera, 0, 0);
    ctx.restore();
    return captureCanvas.toDataURL('image/png');
  }

  // --- Collage Mode ---
  function startCollage() {
    captureBtn.disabled = true;

    // Show progress dots
    collageProgress.innerHTML = '';
    collageProgress.classList.remove('hidden');
    for (let i = 0; i < 4; i++) {
      const dot = document.createElement('div');
      dot.className = 'collage-dot';
      collageProgress.appendChild(dot);
    }

    const photos = [];
    let shotIndex = 0;

    function takeNext() {
      if (shotIndex >= 4) {
        // Compose 2x2 collage
        collageProgress.classList.add('hidden');
        composeCollage(photos);
        captureBtn.disabled = false;
        return;
      }

      doCountdownThenCapture(() => {
        photos.push(captureFrame());
        collageProgress.children[shotIndex].classList.add('taken');
        shotIndex++;

        if (shotIndex < 4) {
          setTimeout(takeNext, 600);
        } else {
          takeNext();
        }
      });
    }

    takeNext();
  }

  function composeCollage(photos) {
    const size = 640;
    const half = size / 2;
    const ctx = collageCanvas.getContext('2d');
    collageCanvas.width = size;
    collageCanvas.height = size;

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, size, size);

    let loaded = 0;
    photos.forEach((src, i) => {
      const img = new Image();
      img.onload = () => {
        const x = (i % 2) * half;
        const y = Math.floor(i / 2) * half;
        // Crop to fill square
        const s = Math.min(img.width, img.height);
        const sx = (img.width - s) / 2;
        const sy = (img.height - s) / 2;
        ctx.drawImage(img, sx, sy, s, s, x + 1, y + 1, half - 2, half - 2);
        loaded++;
        if (loaded === 4) {
          const dataUrl = collageCanvas.toDataURL('image/png');
          addToFilmstrip(dataUrl);
        }
      };
      img.src = src;
    });
  }

  // --- Filmstrip ---
  function addToFilmstrip(dataUrl) {
    const item = document.createElement('div');
    item.className = 'filmstrip-item';
    item.innerHTML = `
      <img src="${dataUrl}" alt="Photo">
      <div class="filmstrip-delete" title="Delete">&times;</div>
    `;

    // Open lightbox on thumbnail click
    item.addEventListener('click', () => {
      openLightbox(dataUrl);
    });

    // Delete on X click
    item.querySelector('.filmstrip-delete').addEventListener('click', (e) => {
      e.stopPropagation();
      item.remove();
    });

    filmstrip.appendChild(item);
  }

  // --- Lightbox ---
  function openLightbox(dataUrl) {
    lightboxImg.src = dataUrl;
    lightbox.classList.remove('hidden');
    lightboxDownload.onclick = () => downloadPhoto(dataUrl);
  }

  function closeLightbox() {
    lightbox.classList.add('hidden');
    lightboxImg.src = '';
  }

  function downloadPhoto(dataUrl) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `idonthaveamac-${Date.now()}.png`;
    a.click();
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxBackdrop.addEventListener('click', closeLightbox);

  // --- Window Focus (bring to front) ---
  let topZ = 100;

  function bringToFront(windowEl) {
    topZ++;
    windowEl.style.zIndex = topZ;
  }

  // --- Generic Window Drag ---
  function makeDraggable(titlebarEl, windowEl, defaultPos) {
    let isDragging = false;
    let dragOffsetX, dragOffsetY;

    // Click anywhere on the window brings it to front
    windowEl.addEventListener('mousedown', () => { bringToFront(windowEl); });

    titlebarEl.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('tl')) return;
      isDragging = true;
      const rect = windowEl.getBoundingClientRect();
      dragOffsetX = e.clientX - rect.left;
      dragOffsetY = e.clientY - rect.top;
      windowEl.style.transform = 'none';
      windowEl.style.left = rect.left + 'px';
      windowEl.style.top = rect.top + 'px';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      windowEl.style.left = (e.clientX - dragOffsetX) + 'px';
      windowEl.style.top = Math.max(28, e.clientY - dragOffsetY) + 'px';
    });

    document.addEventListener('mouseup', () => { isDragging = false; });

    return {
      resetPosition() {
        windowEl.style.transform = defaultPos.transform;
        windowEl.style.left = defaultPos.left;
        windowEl.style.top = defaultPos.top;
      }
    };
  }

  // Photo Booth drag
  const pbDrag = makeDraggable(titlebar, photobooth, {
    transform: 'translate(-50%, -52%)',
    left: '50%',
    top: '50%'
  });

  // Settings window drag
  makeDraggable(settingsTitlebar, settingsWindow, {
    transform: 'none',
    left: 'auto',
    top: '80px'
  });

  // Help window drag
  makeDraggable(helpTitlebar, helpWindow, {
    transform: 'translate(-50%, -50%)',
    left: '50%',
    top: '50%'
  });

  // Close buttons
  tlClose.addEventListener('click', () => { photobooth.style.display = 'none'; });

  settingsTlClose.addEventListener('click', () => {
    settingsWindow.classList.add('hidden');
    const dot = document.querySelector('#dock-settings .dock-dot');
    if (dot) dot.remove();
  });

  helpTlClose.addEventListener('click', () => { helpWindow.classList.add('hidden'); });

  // Open help window
  function openHelp() {
    helpWindow.classList.remove('hidden');
    bringToFront(helpWindow);
  }

  menubarHelp.addEventListener('click', openHelp);
  settingsHelpBtn.addEventListener('click', openHelp);

  // Dock — Photo Booth
  document.getElementById('dock-photobooth').addEventListener('click', () => {
    photobooth.style.display = '';
    pbDrag.resetPosition();
  });

  // Dock — Settings
  document.getElementById('dock-settings').addEventListener('click', () => {
    if (settingsWindow.classList.contains('hidden')) {
      settingsWindow.classList.remove('hidden');
      // Add dock dot
      if (!document.querySelector('#dock-settings .dock-dot')) {
        const dot = document.createElement('div');
        dot.className = 'dock-dot';
        document.getElementById('dock-settings').appendChild(dot);
      }
    } else {
      bringToFront(settingsWindow);
    }
  });

  // --- Dock Position ---
  document.querySelectorAll('.dock-pos-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.dock-pos-btn.active').classList.remove('active');
      btn.classList.add('active');
      dock.className = 'dock dock-' + btn.dataset.pos;
    });
  });

  // --- Wallpaper ---
  document.querySelectorAll('.wallpaper-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelector('.wallpaper-opt.active')?.classList.remove('active');
      opt.classList.add('active');
      desktop.style.background = '';
      desktop.style.backgroundImage = '';
      desktop.style.backgroundSize = '';
      desktop.style.backgroundPosition = '';
      desktop.className = desktop.className.replace(/wall-\S+/g, '').trim();
      desktop.classList.add('wall-' + opt.dataset.wall);
    });
  });

  document.getElementById('wallpaper-upload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      desktop.className = desktop.className.replace(/wall-\S+/g, '').trim();
      document.querySelector('.wallpaper-opt.active')?.classList.remove('active');
      desktop.style.background = `url(${ev.target.result}) center/cover no-repeat`;
    };
    reader.readAsDataURL(file);
  });
})();

const overlayHeader = document.querySelector('.nav-overlay');

if (overlayHeader) {
  const toggleScrolled = () => {
    overlayHeader.classList.toggle('scrolled', window.scrollY > 40);
  };
  toggleScrolled();
  window.addEventListener('scroll', toggleScrolled, { passive: true });
}

const lineMaine = document.getElementById('lineMaine');
const lineQueen = document.getElementById('lineQueen');
const heroTitleGroup = document.getElementById('heroTitleGroup');
const heroTagline = document.getElementById('heroTagline');

if (lineMaine && lineQueen && heroTitleGroup) {
  const matchLineWidths = () => {
    lineMaine.style.transform = 'none';
    lineQueen.style.transform = 'none';
    heroTitleGroup.style.width = 'max-content';

    const widthMaine = lineMaine.getBoundingClientRect().width;
    const widthQueen = lineQueen.getBoundingClientRect().width;
    const target = Math.min(widthMaine, widthQueen);

    lineMaine.style.transform = `scaleX(${target / widthMaine})`;
    lineQueen.style.transform = `scaleX(${target / widthQueen})`;
    heroTitleGroup.style.width = `${target}px`;

    // stretch the tagline to the same width via letter-spacing (no word-gap holes, no letter distortion)
    if (heroTagline) {
      heroTagline.style.letterSpacing = '0px';
      const w0 = heroTagline.getBoundingClientRect().width;
      heroTagline.style.letterSpacing = '10px';
      const w10 = heroTagline.getBoundingClientRect().width;
      const perPx = (w10 - w0) / 10;
      const neededSpacing = Math.max(-1.5, (target - w0) / perPx);
      heroTagline.style.letterSpacing = `${neededSpacing}px`;
    }
  };

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(matchLineWidths);
  } else {
    window.addEventListener('load', matchLineWidths);
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(matchLineWidths, 150);
  });
}

const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ==========================================================================
   Galerie portées — lightbox immersive
   ========================================================================== */
const galleryLightbox = document.getElementById('galleryLightbox');

if (galleryLightbox) {
  const galleryStage = document.getElementById('galleryStage');
  const galleryCounter = document.getElementById('galleryCounter');
  const galleryTitle = document.getElementById('galleryTitle');
  const galleryClose = document.getElementById('galleryClose');
  const galleryPrevBtn = document.getElementById('galleryPrev');
  const galleryNextBtn = document.getElementById('galleryNext');
  const galleryThumbsWrap = document.getElementById('galleryThumbs');

  const cameraIcon = '<path d="M4 20 L4 10 L12 4 L20 10 L20 20 Z" stroke="currentColor" stroke-width="1.4" fill="none"/><circle cx="12" cy="13" r="2.4" stroke="currentColor" stroke-width="1.4" fill="none"/>';
  const playIcon = '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.3" fill="none"/><path d="M10 8.5 L16 12 L10 15.5 Z" fill="currentColor"/>';

  // Structure de données pour chaque média :
  // image -> { type: 'image', src, alt, caption }
  // vidéo -> { type: 'video', src, poster, title }
  const buildPortee01Gallery = () => {
    const base = 'images/chatons/portee-01/';
    const media = [1, 2].map((i) => {
      const p = String(i).padStart(2, '0');
      return {
        type: 'image',
        src: `${base}portee-01-photo-${p}.jpg`,
        alt: `Chaton Maine Coon de la portée 2024 Maine Queen — photo ${p}`,
        caption: '',
      };
    });
    media.push({
      type: 'video',
      src: `${base}portee-01-video-01.mp4`,
      poster: '',
      title: 'Vidéo de la portée Maine Coon 2024',
    });
    media.push({
      type: 'video',
      src: `${base}portee-01-video-02.mp4`,
      poster: '',
      title: 'Vidéo de la portée Maine Coon 2024',
    });
    return { label: '01', media };
  };

  const buildPortee02Gallery = () => {
    const base = 'images/chatons/portee-02/';
    const media = [];
    for (let i = 2; i <= 10; i++) {
      const p = String(i).padStart(2, '0');
      const ext = i <= 6 ? 'jpg' : 'jpeg';
      media.push({
        type: 'image',
        src: `${base}portee-02-photo-${p}.${ext}`,
        alt: `Chaton Maine Coon de la portée 2025 Maine Queen — photo ${p}`,
        caption: '',
      });
    }
    media.push({
      type: 'video',
      src: `${base}portee-02-video.mp4`,
      poster: '',
      title: 'Vidéo de la portée Maine Coon 2025',
    });
    return { label: '02', media };
  };

  const buildPortee03Gallery = () => {
    const base = 'images/chatons/portee-03/';
    const photoExts = ['jpg', 'jpg', 'jpg', 'jpg', 'jpg', 'jpg', 'jpg', 'jpg', 'jpg', 'jpg', 'jpg', 'jpg'];
    const media = photoExts.map((ext, idx) => {
      const p = String(idx + 1).padStart(2, '0');
      return {
        type: 'image',
        src: `${base}portee-03-photo-${p}.${ext}`,
        alt: `Chaton Maine Coon de la portée 2025 Maine Queen — photo ${p}`,
        caption: '',
      };
    });
    media.push({
      type: 'video',
      src: `${base}portee-03-video-01.mp4`,
      poster: '',
      title: 'Vidéo de la portée Maine Coon 2025',
    });
    media.push({
      type: 'video',
      src: `${base}portee-03-video-02.mp4`,
      poster: '',
      title: 'Vidéo de la portée Maine Coon 2025',
    });
    return { label: '03', media };
  };

  const porteeGalleries = [buildPortee01Gallery(), buildPortee02Gallery(), buildPortee03Gallery()];

  let currentGalleryIndex = 0;
  let currentMediaIndex = 0;

  const renderMedia = () => {
    const gallery = porteeGalleries[currentGalleryIndex];
    const item = gallery.media[currentMediaIndex];
    galleryStage.innerHTML = '';

    if (item.src) {
      if (item.type === 'video') {
        const video = document.createElement('video');
        video.src = item.src;
        if (item.poster) video.poster = item.poster;
        video.controls = true;
        video.playsInline = true;
        video.muted = true;
        video.setAttribute('muted', '');
        video.className = 'gallery-video-silent';
        if (item.title) video.setAttribute('aria-label', item.title);
        galleryStage.appendChild(video);
      } else {
        const img = document.createElement('img');
        img.src = item.src;
        img.alt = item.alt || '';
        galleryStage.appendChild(img);
      }
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'gallery-placeholder';
      placeholder.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">${item.type === 'video' ? playIcon : cameraIcon}</svg><span>${item.placeholderLabel}</span>`;
      galleryStage.appendChild(placeholder);
    }

    galleryCounter.textContent = `${String(currentMediaIndex + 1).padStart(2, '0')} / ${String(gallery.media.length).padStart(2, '0')}`;
    galleryTitle.textContent = `Portée ${gallery.label}`;

    galleryThumbsWrap.querySelectorAll('.gallery-thumb').forEach((thumb, i) => {
      thumb.classList.toggle('active', i === currentMediaIndex);
    });
  };

  const buildThumbs = () => {
    const gallery = porteeGalleries[currentGalleryIndex];
    galleryThumbsWrap.innerHTML = '';
    gallery.media.forEach((item, i) => {
      const thumb = document.createElement('button');
      thumb.className = 'gallery-thumb';
      thumb.setAttribute('aria-label', item.placeholderLabel || `Média ${i + 1}`);
      thumb.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">${item.type === 'video' ? playIcon : cameraIcon}</svg>`;
      thumb.addEventListener('click', () => {
        currentMediaIndex = i;
        renderMedia();
      });
      galleryThumbsWrap.appendChild(thumb);
    });
  };

  const openGallery = (index) => {
    currentGalleryIndex = index;
    currentMediaIndex = 0;
    buildThumbs();
    renderMedia();
    galleryLightbox.classList.add('open');
    galleryLightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('gallery-open');
  };

  const closeGallery = () => {
    const video = galleryStage.querySelector('video');
    if (video) video.pause();
    galleryLightbox.classList.remove('open');
    galleryLightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('gallery-open');
  };

  const showNext = () => {
    const gallery = porteeGalleries[currentGalleryIndex];
    currentMediaIndex = (currentMediaIndex + 1) % gallery.media.length;
    renderMedia();
  };

  const showPrev = () => {
    const gallery = porteeGalleries[currentGalleryIndex];
    currentMediaIndex = (currentMediaIndex - 1 + gallery.media.length) % gallery.media.length;
    renderMedia();
  };

  document.querySelectorAll('[data-gallery-index]').forEach((el) => {
    const index = Number(el.dataset.galleryIndex);

    el.addEventListener('click', () => {
      openGallery(index);
    });

    if (el.tagName !== 'BUTTON') {
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openGallery(index);
        }
      });
    }
  });

  galleryClose.addEventListener('click', closeGallery);
  galleryPrevBtn.addEventListener('click', showPrev);
  galleryNextBtn.addEventListener('click', showNext);

  document.addEventListener('keydown', (e) => {
    if (!galleryLightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeGallery();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });

  // swipe tactile mobile
  let touchStartX = 0;
  galleryStage.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  galleryStage.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      if (dx < 0) showNext(); else showPrev();
    }
  });

  // drag souris desktop
  let stageDragStartX = 0;
  let isStageDragging = false;

  galleryStage.addEventListener('mousedown', (e) => {
    isStageDragging = true;
    stageDragStartX = e.clientX;
  });

  window.addEventListener('mouseup', (e) => {
    if (!isStageDragging) return;
    isStageDragging = false;
    const dx = e.clientX - stageDragStartX;
    if (Math.abs(dx) > 60) {
      if (dx < 0) showNext(); else showPrev();
    }
  });
}

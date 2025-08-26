// Bloom Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    const currentYear = new Date().getFullYear();
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = currentYear;
    }

    // Mobile navigation toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        // Accessibility attributes
        if (!navMenu.id) {
            navMenu.id = 'nav-menu';
        }
        hamburger.setAttribute('role', 'button');
        hamburger.setAttribute('tabindex', '0');
        hamburger.setAttribute('aria-controls', navMenu.id);
        hamburger.setAttribute('aria-expanded', 'false');

        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            const expanded = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.setAttribute('aria-expanded', String(!expanded));
        });

        // Keyboard support
        hamburger.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                hamburger.click();
            }
        });

        // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Terminal typing animation
    const typingElements = document.querySelectorAll('.typing-text');
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    typingElements.forEach(element => {
        const text = element.textContent;
        element.textContent = '';
        let i = 0;

        function typeWriter() {
            if (reduceMotion) {
                element.textContent = text;
                return;
            }
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            } else if (!reduceMotion) {
                // Wait 2 seconds then restart
                setTimeout(() => {
                    element.textContent = '';
                    i = 0;
                    typeWriter();
                }, 2000);
            }
        }

        // Start typing animation after a delay
        if (reduceMotion) {
            element.textContent = text;
        } else {
            setTimeout(typeWriter, 1000);
        }
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animations
    document.querySelectorAll('.feature-card, .faction-card, .update-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });

    // Add parallax effect to hero background
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            const rate = scrolled * -0.5;
            if (!window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                hero.style.transform = `translateY(${rate}px)`;
            }
        }
    });

    // Terminal status cycling
    const statusMessages = [
        { type: 'ok', message: 'Faction networks detected' },
        { type: 'ok', message: 'Asset pipeline operational' },
        { type: 'warning', message: 'Hostile territories identified' },
        { type: 'ok', message: 'Territorial scan complete' },
        { type: 'warning', message: 'Extraction zones contested' },
        { type: 'ok', message: 'Combat systems online' }
    ];

    const statusLines = document.querySelectorAll('.terminal-line:not(:first-child)');
    let currentStatusIndex = 0;

    function updateTerminalStatus() {
        statusLines.forEach((line, index) => {
            const status = statusMessages[(currentStatusIndex + index) % statusMessages.length];
            const statusElement = line.querySelector('[class^="status-"]');
            const messageElement = line.lastChild;
            
            if (statusElement && messageElement) {
                statusElement.className = `status-${status.type}`;
                statusElement.textContent = status.type === 'ok' ? '[OK]' : '[WARN]';
                messageElement.textContent = ` ${status.message}`;
            }
        });

        currentStatusIndex = (currentStatusIndex + 1) % statusMessages.length;
    }

    // Update terminal status every 3 seconds
    setInterval(updateTerminalStatus, 3000);

    // Add loading states for better UX
    window.addEventListener('beforeunload', () => {
        document.body.style.opacity = '0.5';
    });

    // Handle navigation state
    function updateActiveNavLink() {
        const currentPath = window.location.pathname;
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentPath || 
                (currentPath === '/' && link.getAttribute('href') === '/')) {
                link.classList.add('active');
            }
        });
    }

    updateActiveNavLink();

    // Add hover effects to faction cards
    document.querySelectorAll('.faction-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            const factionColor = this.querySelector('.faction-color');
            if (factionColor) {
                factionColor.style.width = '100%';
                factionColor.style.opacity = '0.1';
                factionColor.style.transition = 'all 0.3s ease';
            }
        });

        card.addEventListener('mouseleave', function() {
            const factionColor = this.querySelector('.faction-color');
            if (factionColor) {
                factionColor.style.width = '4px';
                factionColor.style.opacity = '1';
            }
        });
    });

    // Performance optimization: Debounce scroll events
    let scrollTimer = null;
    window.addEventListener('scroll', function() {
        if (scrollTimer !== null) {
            clearTimeout(scrollTimer);
        }
        scrollTimer = setTimeout(function() {
            // Scroll-based animations can be added here
        }, 150);
    });
});

// Utility functions
// Set element text after a delay (avoids deep inline nesting)
function setTextAfterDelay(element, text, delayMs) {
    if (!element) return;
    setTimeout(() => {
        element.textContent = text;
    }, delayMs);
}

// Temporarily replace a button's innerHTML, then revert after delay
function setTemporaryButtonLabel(btn, newHtml, delayMs) {
    if (!btn) return;
    const original = btn.innerHTML;
    btn.innerHTML = newHtml;
    setTimeout(() => {
        btn.innerHTML = original;
    }, delayMs);
}

function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
}

function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    }
    
    updateCounter();
}

// Initialize counter animations when stats come into view
const statsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const target = parseInt(stat.textContent.replace(/\D/g, ''));
                if (target && !isNaN(target)) {
                    stat.textContent = '0';
                    animateCounter(stat, target);
                }
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

// Observe hero stats for animation
document.addEventListener('DOMContentLoaded', function() {
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        statsObserver.observe(heroStats);
    }
});

    // Dynamic Gallery Loader + Filter (event delegation) + Lightbox bootstrap
    (function initGallery() {
        const assetGrid = document.getElementById('assetGrid');
        if (!assetGrid) return; // No gallery on this page

        const filters = document.querySelector('.filters');

        // Helper: apply filter to current items
        function filterAssets(category) {
            const items = assetGrid.querySelectorAll('.asset-item');
            items.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                const shouldShow = category === 'all' || itemCategory === category;
                if (shouldShow) {
                    item.classList.remove('hidden');
                    item.classList.add('visible');
                    item.style.display = 'block';
                } else {
                    item.classList.add('hidden');
                    item.classList.remove('visible');
                    setTimeout(() => {
                        if (item.classList.contains('hidden')) item.style.display = 'none';
                    }, 200);
                }
            });
        }

        // Filters via event delegation
        if (filters) {
            filters.addEventListener('click', (e) => {
                const btn = e.target.closest('.filter-btn');
                if (!btn) return;
                const category = btn.getAttribute('data-category') || 'all';
                filters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                filterAssets(category);

                if (typeof gtag !== 'undefined') {
                    gtag('event', 'filter_assets', { event_category: 'Gallery', event_label: category });
                }
            });
        }

        // Try to fetch generated snippet; fallback gracefully if missing/empty
        fetch('/assets/snippets/gallery-items.html', { cache: 'no-store' })
            .then(resp => resp.ok ? resp.text() : '')
            .then(html => {
                if (html && html.trim().length > 0) {
                    assetGrid.insertAdjacentHTML('afterbegin', html);
                }
                // Curation: remove low-quality or non-curated items and fix alt
                const disallowPatterns = [
                    /SWEEP/i, /ROLLBACK/i, /BASE720/i, /UPSCALE/i, /BICUBIC/i,
                    /NEAREST/i, /TEST/i, /TG_Style/i, /TG_VAR/i, /TG_UPSCALE/i,
                    /DPM/i, /CRISP_/i, /\b(HQ_|PROD_|LORE_)|[A-Z]{2,}[_\d]/
                ];
                const isDisallowed = (src) => disallowPatterns.some(r => r.test(src));
                const minW = 1200, minH = 700;

                assetGrid.querySelectorAll('.asset-item').forEach(async item => {
                    const img = item.querySelector('.asset-image');
                    if (!img?.src || isDisallowed(img.src)) {
                        item.remove();
                        return;
                    }
                    // Ensure alt text aligns with title
                    const title = item.querySelector('.asset-overlay h4')?.textContent?.trim();
                    if (title && !img.alt?.trim()) {
                        img.alt = title;
                    }
                    // Dimension check after load
                    const afterLoad = async () => {
                        if ((img.naturalWidth && img.naturalWidth < minW) || (img.naturalHeight && img.naturalHeight < minH)) {
                            item.remove();
                            return;
                        }
                        // Vision-based quality gate
                        const category = item.getAttribute('data-category') || '';
                        const q = await evaluateImageQuality(img, category);
                        if (!q.ok) item.remove();
                    };
                    if (img.complete) {
                        afterLoad();
                    } else {
                        img.addEventListener('load', afterLoad, { once: true });
                        img.addEventListener('error', () => item.remove(), { once: true });
                    }
                });
                // Initialize default filter state
                filterAssets('all');

                // Attach click handler for lightbox open on dynamically added items
        assetGrid.addEventListener('click', (e) => {
                    const item = e.target.closest('.asset-item');
                    if (!item) return;
                    // Lightbox expects .asset-image and .asset-overlay content
                    if (typeof window.__openAssetLightbox === 'function') {
                        window.__openAssetLightbox(item);
                    } else {
                        // Fallback: open image in new tab
                        const img = item.querySelector('.asset-image');
                        if (img?.src) window.open(img.src, '_blank');
                    }
                });
            })
            .catch(() => {
                // Snippet not available; just ensure default filter is applied
                filterAssets('all');
            });

        // Populate asset stats from manifest.json if present
        fetch('/assets/images/manifest.json', { cache: 'no-store' })
            .then(r => (r.ok ? r.json() : null))
            .then(manifest => {
                if (!manifest) return;
                const setText = (id, val) => {
                    const el = document.getElementById(id);
                    if (el) el.textContent = String(val);
                };
                setText('assetTotal', manifest.total ?? 0);
                setText('assetUpdated', manifest.lastUpdated ? new Date(manifest.lastUpdated).toLocaleString() : '—');
                setText('assetsEnvironments', Object.keys(manifest.environments || {}).length);
                setText('assetsFactions', Object.keys(manifest.factions || {}).length);
                setText('assetsRenders', Object.keys(manifest.renders || {}).length);
                setText('assetsVehicles', Object.keys(manifest.vehicles || {}).length);
                setText('assetsWeapons', Object.keys(manifest.weapons || {}).length);
            })
            .catch(() => {})
        ;
    })();

// Vision-based quality assessment (canvas) — sharpness, contrast, colorfulness
async function evaluateImageQuality(img, category) {
    try {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        if (!w || !h) return { ok: false, reason: 'no-dimensions' };

        const targetW = 128; // downscale for performance
        const scale = Math.min(1, targetW / w);
        const dw = Math.max(16, Math.round(w * scale));
        const dh = Math.max(16, Math.round(h * scale));

        const canvas = document.createElement('canvas');
        canvas.width = dw;
        canvas.height = dh;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return { ok: true }; // can't evaluate, don't block
        ctx.drawImage(img, 0, 0, dw, dh);
        const { data } = ctx.getImageData(0, 0, dw, dh);

        // Compute luminance, Sobel edges, and color components
        const lum = new Float32Array(dw * dh);
        const rg = new Float32Array(dw * dh);
        const yb = new Float32Array(dw * dh);
        let i = 0;
        for (let y = 0; y < dh; y++) {
            for (let x = 0; x < dw; x++) {
                const idx = (y * dw + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                const L = 0.2126 * r + 0.7152 * g + 0.0722 * b; // Rec. 709
                lum[i] = L;
                rg[i] = r - g;
                yb[i] = 0.5 * (r + g) - b;
                i++;
            }
        }

        // RMS contrast (std dev of luminance)
        const mean = lum.reduce((a, v) => a + v, 0) / lum.length;
        let sumSq = 0;
        for (const v of lum) {
            const d = v - mean;
            sumSq += d * d;
        }
        const contrast = Math.sqrt(sumSq / lum.length);

        // Colorfulness (Hasler–Süsstrunk proxy)
        const std = arr => {
            const m = arr.reduce((a, v) => a + v, 0) / arr.length;
            let s = 0; for (const val of arr) { const d = val - m; s += d * d; }
            return Math.sqrt(s / arr.length);
        };
        const stdRG = std(rg);
        const stdYB = std(yb);
        const colorfulness = Math.sqrt(stdRG * stdRG + stdYB * stdYB);

        // Sobel edge magnitude variance as sharpness proxy
        const sobel = (arr) => {
            const out = new Float32Array(arr.length);
            const sx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
            const sy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
            for (let y = 1; y < dh - 1; y++) {
                for (let x = 1; x < dw - 1; x++) {
                    let gx = 0, gy = 0;
                    let p = 0;
                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const v = arr[(y + ky) * dw + (x + kx)];
                            gx += v * sx[p];
                            gy += v * sy[p];
                            p++;
                        }
                    }
                    out[y * dw + x] = Math.hypot(gx, gy);
                }
            }
            return out;
        };
        const edges = sobel(lum);
        const emean = edges.reduce((a, v) => a + v, 0) / edges.length;
    let esum = 0; for (const ev of edges) { const d = ev - emean; esum += d * d; }
        const sharpness = Math.sqrt(esum / edges.length);

        // Category thresholds (tunable)
        const cat = (category || '').toLowerCase();
        const req = {
            environments: { contrast: 18, sharp: 9, color: 15 },
            renders:      { contrast: 18, sharp: 9, color: 12 },
            vehicles:     { contrast: 16, sharp: 8, color: 10 },
            weapons:      { contrast: 16, sharp: 8, color: 10 },
            factions:     { contrast: 8,  sharp: 4, color: 4  }, // emblems
            ui:           { contrast: 5,  sharp: 3, color: 2  }
        }[cat] || { contrast: 14, sharp: 7, color: 8 };

        const ok = (contrast >= req.contrast) && (sharpness >= req.sharp) && (colorfulness >= req.color);
        return { ok, contrast: Math.round(contrast), sharpness: Math.round(sharpness), colorfulness: Math.round(colorfulness) };
    } catch (err) {
        console.warn('quality-eval failed', err);
        return { ok: true, reason: 'eval-error' }; // fail open to avoid hiding legit images on errors
    }
}

// Site-wide image curation to ensure only high-quality, on-message visuals render
document.addEventListener('DOMContentLoaded', function() {
    const disallowPatterns = [
        /SWEEP/i, /ROLLBACK/i, /BASE720/i, /UPSCALE/i, /BICUBIC/i,
        /NEAREST/i, /TEST/i, /TG_Style/i, /TG_VAR/i, /TG_UPSCALE/i,
        /DPM/i, /CRISP_/i, /\b(HQ_|PROD_|LORE_)|[A-Z]{2,}[_\d]/
    ];
    const isDisallowed = (src) => disallowPatterns.some(r => r.test(src));

    function getThresholds(src) {
        if (/\/assets\/images\/ui\//i.test(src)) return { w: 64, h: 64 }; // icons are small by design
        if (/\/assets\/images\/factions\//i.test(src)) return { w: 256, h: 256 }; // emblems
        // Showcase imagery
        if (/\/assets\/images\/(environments|renders|vehicles|weapons)\//i.test(src)) return { w: 1200, h: 700 };
        return { w: 400, h: 300 }; // general fallback
    }

    // Skip items already handled in the gallery (#assetGrid)
    const imgs = Array.from(document.querySelectorAll('img'))
        .filter(img => !img.closest('#assetGrid'));

    // Track duplicates by semantic key (alt or normalized filename)
    const seen = new Set();

    imgs.forEach(img => {
        const src = img.getAttribute('src') || img.src || '';
        if (!src) return;
        if (isDisallowed(src)) {
            // Remove entire card/tile if possible; else remove the image
            const container = img.closest('.asset-item, .feature-card, .faction-card, .region, .card, figure') || img;
            container.remove();
            return;
        }

        // Ensure non-empty alt; prefer nearby heading/caption
        if (!img.alt?.trim()) {
            const heading = img.closest('.feature-card, .region, .faction-card, section')?.querySelector('h2, h3, h4');
            const caption = img.closest('figure')?.querySelector('figcaption');
            const label = caption?.textContent?.trim() || heading?.textContent?.trim();
            if (label) img.alt = label;
        }

        // Duplicate suppression by key
        const fileName = src.split('/').pop() || '';
        const baseKey = fileName
            .replace(/\.[^.]+$/, '')
            .replace(/\b(19|20)\d{2,}\b/g, '')
            .replace(/\b\d{3,4}x\d{3,4}\b/gi, '')
            .replace(/_?\d{5,}_?/g, '')
            .replace(/_?0000\d_?/g, '')
            .replace(/_?1920w_?/gi, '')
            .replace(/_?Toned_?/gi, '')
            .replace(/^(HQ_|LORE_|PROD_|REFINE_SHARP_)+/gi, '')
            .replace(/[_\s]+/g, '-')
            .toLowerCase();
        const key = (img.alt?.trim().toLowerCase()) || baseKey;
        if (key && seen.has(key)) {
            const container = img.closest('.asset-item, .feature-card, .faction-card, .region, .card, figure') || img;
            container.remove();
            return;
        }
        if (key) seen.add(key);

        // Dimension checks appropriate to category
        const { w: minW, h: minH } = getThresholds(src);
        const containerSel = '.asset-item, .feature-card, .faction-card, .region, .card, figure';
        const prune = async () => {
            const container = img.closest(containerSel) || img;
            if ((img.naturalWidth && img.naturalWidth < minW) || (img.naturalHeight && img.naturalHeight < minH)) {
                container.remove();
                return;
            }
            const category = src.match(/\/assets\/images\/(\w+)\//i)?.[1] || '';
            const q = await evaluateImageQuality(img, category);
            if (!q.ok) container.remove();
        };
        if (img.complete) {
            prune();
        } else {
            img.addEventListener('load', prune, { once: true });
            img.addEventListener('error', () => img.remove(), { once: true });
        }
    });
});

// Asset Lightbox System
document.addEventListener('DOMContentLoaded', function() {
    const assetItems = document.querySelectorAll('.asset-item');
    let lightbox = null;

    function createLightbox() {
        const lightboxHTML = `
            <div id="assetLightbox" class="asset-lightbox" style="display: none;">
                <div class="lightbox-overlay" id="lightboxOverlay"></div>
                <div class="lightbox-container">
                    <button class="lightbox-close" id="lightboxClose" aria-label="Close lightbox">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    <div class="lightbox-content">
                        <div class="lightbox-image-container">
                            <img id="lightboxImage" src="" alt="" class="lightbox-image">
                            <div class="lightbox-loading">
                                <div class="loading-spinner"></div>
                            </div>
                        </div>
                        <div class="lightbox-info">
                            <div class="lightbox-header">
                                <h3 id="lightboxTitle"></h3>
                                <div class="lightbox-badges" id="lightboxBadges"></div>
                            </div>
                            <p id="lightboxDescription"></p>
                            <div class="lightbox-metadata">
                                <div class="metadata-item">
                                    <span class="metadata-label">Category:</span>
                                    <span id="lightboxCategory"></span>
                                </div>
                                <div class="metadata-item">
                                    <span class="metadata-label">Style:</span>
                                    <span id="lightboxStyle"></span>
                                </div>
                                <div class="metadata-item">
                                    <span class="metadata-label">Pipeline:</span>
                                    <span>Chief Art Director Framework</span>
                                </div>
                            </div>
                            <div class="lightbox-actions">
                                <button class="lightbox-btn download-btn" id="downloadBtn">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="7,10 12,15 17,10"></polyline>
                                        <line x1="12" y1="15" x2="12" y2="3"></line>
                                    </svg>
                                    View Full Size
                                </button>
                                <button class="lightbox-btn share-btn" id="shareBtn">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="18" cy="5" r="3"></circle>
                                        <circle cx="6" cy="12" r="3"></circle>
                                        <circle cx="18" cy="19" r="3"></circle>
                                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                                    </svg>
                                    Share Asset
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="lightbox-navigation">
                        <button class="nav-btn prev-btn" id="prevBtn" aria-label="Previous asset">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="15,18 9,12 15,6"></polyline>
                            </svg>
                        </button>
                        <button class="nav-btn next-btn" id="nextBtn" aria-label="Next asset">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="9,18 15,12 9,6"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', lightboxHTML);
        lightbox = document.getElementById('assetLightbox');
        
        return lightbox;
    }

    let lastFocusedElement = null;
    function openLightbox(assetItem) {
        if (!lightbox) {
            lightbox = createLightbox();
            setupLightboxEvents();
        }

        // Save focus to restore on close
        lastFocusedElement = document.activeElement;

        const img = assetItem.querySelector('.asset-image');
        const overlay = assetItem.querySelector('.asset-overlay');
        const title = overlay?.querySelector('h4')?.textContent || img?.alt || 'Asset';
        const description = overlay?.querySelector('p')?.textContent || '';
        const category = assetItem.getAttribute('data-category') || 'unknown';
        const style = assetItem.getAttribute('data-style') || 'default';

        // Update lightbox content
        if (img) {
            document.getElementById('lightboxImage').src = img.src;
            document.getElementById('lightboxImage').alt = img.alt || title;
        }
        document.getElementById('lightboxTitle').textContent = title;
        document.getElementById('lightboxDescription').textContent = description;
        document.getElementById('lightboxCategory').textContent = (category.charAt(0).toUpperCase() + category.slice(1));
        document.getElementById('lightboxStyle').textContent = (style.charAt(0).toUpperCase() + style.slice(1));

        // Update badges
        const badges = assetItem.querySelectorAll('.quality-badge, .style-tag, .rarity-tag, .vehicle-class, .faction-tag');
        const badgesContainer = document.getElementById('lightboxBadges');
        if (badgesContainer) {
            badgesContainer.innerHTML = '';
            badges.forEach(badge => {
                badgesContainer.appendChild(badge.cloneNode(true));
            });
        }

        // Show lightbox
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
    // Focus management for accessibility
    const closeBtn = lightbox.querySelector('.lightbox-close');
    closeBtn.focus();

        // Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'view_asset', {
                event_category: 'Gallery',
                event_label: title
            });
        }
    }

        // Expose lightbox open function for dynamic galleries
        window.__openAssetLightbox = openLightbox;

    function closeLightbox() {
        if (lightbox) {
            lightbox.style.display = 'none';
            document.body.style.overflow = '';
            // Restore focus to the element that opened the lightbox
            if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
                lastFocusedElement.focus();
            }
        }
    }

    function setupLightboxEvents() {
        // Close button
        document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
        
        // Overlay click to close
        document.getElementById('lightboxOverlay').addEventListener('click', closeLightbox);
        
        // Keyboard navigation + focus trap
        document.addEventListener('keydown', function(e) {
            if (lightbox && lightbox.style.display === 'flex') {
                if (e.key === 'Escape') {
                    closeLightbox();
                    return;
                }
                if (e.key === 'Tab') {
                    const focusable = lightbox.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                    const firstEl = focusable[0];
                    const lastEl = focusable[focusable.length - 1];
                    if (e.shiftKey && document.activeElement === firstEl) {
                        e.preventDefault();
                        lastEl.focus();
                    } else if (!e.shiftKey && document.activeElement === lastEl) {
                        e.preventDefault();
                        firstEl.focus();
                    }
                }
            }
        });

        // Download button
        document.getElementById('downloadBtn').addEventListener('click', function() {
            const img = document.getElementById('lightboxImage');
            if (img?.src) window.open(img.src, '_blank');
        });

        // Share button
        document.getElementById('shareBtn').addEventListener('click', function() {
            const title = document.getElementById('lightboxTitle')?.textContent || 'Terminal Grounds';
            const url = window.location.href;
            
            if (navigator.share) {
                navigator.share({
                    title: `Terminal Grounds - ${title}`,
                    text: `Check out this asset from Terminal Grounds: ${title}`,
                    url: url
                });
            } else if (navigator.clipboard?.writeText) {
                // Fallback to clipboard when available
                navigator.clipboard.writeText(url)
                    .then(() => {
                        const btn = document.getElementById('shareBtn');
                        setTemporaryButtonLabel(btn, '<span>Copied!</span>', 2000);
                    })
                    .catch(() => { /* noop */ });
            }
        });
    }

    // Add click handlers to asset items
    assetItems.forEach(item => {
        item.addEventListener('click', function() {
            openLightbox(this);
        });

        // Keyboard accessibility
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', `View ${item.querySelector('.asset-overlay h4')?.textContent || 'asset'} in lightbox`);
        
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(this);
            }
        });
    });
});

// Progressive Asset Loading
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('.asset-image');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                // Add loading animation
                const container = img.closest('.asset-item');
                if (container) container.classList.add('loading');
                
                img.addEventListener('load', () => {
                    if (container) {
                        container.classList.remove('loading');
                        container.classList.add('loaded');
                    }
                }, { once: true });
                
                img.addEventListener('error', () => {
                    if (container) {
                        container.classList.remove('loading');
                        container.classList.add('error');
                    }
                }, { once: true });
                
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px'
    });

    images.forEach(img => imageObserver.observe(img));
});

// Asset Showcase Stats Animation
document.addEventListener('DOMContentLoaded', function() {
    const showcaseStats = document.querySelector('.showcase-stats');
    if (showcaseStats) {
        const statsObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const statValues = entry.target.querySelectorAll('.stat-value');
                    statValues.forEach(stat => {
                        const text = stat.textContent;
                        const number = parseInt(text.replace(/\D/g, ''));
                        if (number && !isNaN(number)) {
                            stat.textContent = '0';
                            animateCounter(stat, number, 2000);
                            // Keep the suffix (like +, %)
                            const suffix = text.replace(/\d/g, '');
                            setTextAfterDelay(stat, `${number}${suffix}`, 2000);
                        }
                    });
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statsObserver.observe(showcaseStats);
    }
});

// Style Comparison Slider
document.addEventListener('DOMContentLoaded', function() {
    const slider = document.getElementById('styleSlider');
    const grittyImage = document.querySelector('.comparison-image.gritty-style');
    
    if (!slider || !grittyImage) return;

    let isDragging = false;
    let currentPosition = 50; // Start at 50%

    function updateSliderPosition(percentage) {
        // Clamp between 5% and 95% for better UX
        percentage = Math.max(5, Math.min(95, percentage));
        
        // Update slider position
        slider.style.left = percentage + '%';
        
        // Update gritty image clip-path
        grittyImage.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
        
        currentPosition = percentage;
        
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'style_comparison_interact', {
                event_category: 'Gallery',
                event_label: 'slider_position',
                value: Math.round(percentage)
            });
        }
    }

    function getPositionFromEvent(e) {
        const rect = slider.parentElement.getBoundingClientRect();
        const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
        return ((clientX - rect.left) / rect.width) * 100;
    }

    function handleStart(e) {
        isDragging = true;
        slider.style.transition = 'none';
        document.body.style.userSelect = 'none';
        
        // Prevent default to avoid image dragging
        e.preventDefault();
    }

    function handleMove(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        const percentage = getPositionFromEvent(e);
        updateSliderPosition(percentage);
    }

    function handleEnd(e) {
        if (!isDragging) return;
        
        isDragging = false;
        slider.style.transition = 'all 0.2s ease';
        document.body.style.userSelect = '';
    }

    // Mouse events
    slider.addEventListener('mousedown', handleStart);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);

    // Touch events
    slider.addEventListener('touchstart', handleStart, { passive: false });
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);

    // Click to position
    slider.parentElement.addEventListener('click', function(e) {
        if (isDragging) return;
        
        const percentage = getPositionFromEvent(e);
        slider.style.transition = 'all 0.3s ease';
        updateSliderPosition(percentage);
        
        // Reset transition after animation
    const resetTransition = () => { slider.style.transition = 'all 0.2s ease'; };
    if (!window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setTimeout(resetTransition, 300);
    } else {
        resetTransition();
    }
    });

    // Keyboard accessibility
    slider.setAttribute('tabindex', '0');
    slider.setAttribute('role', 'slider');
    slider.setAttribute('aria-valuemin', '0');
    slider.setAttribute('aria-valuemax', '100');
    slider.setAttribute('aria-valuenow', currentPosition.toString());
    slider.setAttribute('aria-label', 'Style comparison slider');

    slider.addEventListener('keydown', function(e) {
        let newPosition;
        
        switch(e.key) {
            case 'ArrowLeft':
            case 'ArrowDown':
        newPosition = Math.max(5, currentPosition - 5);
                break;
            case 'ArrowRight':
            case 'ArrowUp':
        newPosition = Math.min(95, currentPosition + 5);
                break;
            case 'Home':
                newPosition = 5;
                break;
            case 'End':
                newPosition = 95;
                break;
            default:
                return;
        }
        
        e.preventDefault();
        slider.style.transition = 'all 0.2s ease';
    updateSliderPosition(newPosition);
    slider.setAttribute('aria-valuenow', Math.round(newPosition).toString());
    });

    // Auto-demonstration on first view
    const comparisonSection = document.querySelector('.style-comparison-showcase');
    if (comparisonSection) {
        const demoObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Auto-animate once when first viewed
                    const step1 = () => { slider.style.transition = 'all 2s ease'; updateSliderPosition(20); };
                    const step2 = () => { updateSliderPosition(80); };
                    const step3 = () => { updateSliderPosition(50); slider.style.transition = 'all 0.2s ease'; };
                    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                    if (reduced) {
                        slider.style.transition = 'all 0.2s ease';
                        updateSliderPosition(50);
                    } else {
                        setTimeout(step1, 500);
                        setTimeout(() => { step2(); setTimeout(step3, 1500); }, 1500);
                    }
                    
                    demoObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        demoObserver.observe(comparisonSection);
    }

    // Initialize position
    updateSliderPosition(50);
});
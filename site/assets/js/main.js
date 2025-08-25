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
    typingElements.forEach(element => {
        const text = element.textContent;
        element.textContent = '';
        let i = 0;

        function typeWriter() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            } else {
                // Wait 2 seconds then restart
                setTimeout(() => {
                    element.textContent = '';
                    i = 0;
                    typeWriter();
                }, 2000);
            }
        }

        // Start typing animation after a delay
        setTimeout(typeWriter, 1000);
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
            hero.style.transform = `translateY(${rate}px)`;
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

// Asset Showcase Filtering System
document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const assetItems = document.querySelectorAll('.asset-item');
    const assetGrid = document.getElementById('assetGrid');

    if (filterButtons.length === 0 || assetItems.length === 0) return;

    function filterAssets(category) {
        assetItems.forEach(item => {
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
                    if (item.classList.contains('hidden')) {
                        item.style.display = 'none';
                    }
                }, 300);
            }
        });

        // Update grid layout after filtering
        setTimeout(() => {
            if (assetGrid) {
                assetGrid.style.animation = 'none';
                assetGrid.offsetHeight; // Trigger reflow
                assetGrid.style.animation = null;
            }
        }, 100);
    }

    function updateActiveButton(activeButton) {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        activeButton.classList.add('active');
    }

    // Add click handlers for filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            updateActiveButton(this);
            filterAssets(category);
            
            // Analytics tracking
            if (typeof gtag !== 'undefined') {
                gtag('event', 'filter_assets', {
                    event_category: 'Gallery',
                    event_label: category
                });
            }
        });

        // Keyboard accessibility
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });

    // Initialize with 'all' category
    filterAssets('all');
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

    function openLightbox(assetItem) {
        if (!lightbox) {
            lightbox = createLightbox();
            setupLightboxEvents();
        }

        const img = assetItem.querySelector('.asset-image');
        const overlay = assetItem.querySelector('.asset-overlay');
        const title = overlay.querySelector('h4').textContent;
        const description = overlay.querySelector('p').textContent;
        const category = assetItem.getAttribute('data-category');
        const style = assetItem.getAttribute('data-style');

        // Update lightbox content
        document.getElementById('lightboxImage').src = img.src;
        document.getElementById('lightboxImage').alt = img.alt;
        document.getElementById('lightboxTitle').textContent = title;
        document.getElementById('lightboxDescription').textContent = description;
        document.getElementById('lightboxCategory').textContent = category.charAt(0).toUpperCase() + category.slice(1);
        document.getElementById('lightboxStyle').textContent = style.charAt(0).toUpperCase() + style.slice(1);

        // Update badges
        const badges = assetItem.querySelectorAll('.quality-badge, .style-tag, .rarity-tag, .vehicle-class, .faction-tag');
        const badgesContainer = document.getElementById('lightboxBadges');
        badgesContainer.innerHTML = '';
        badges.forEach(badge => {
            badgesContainer.appendChild(badge.cloneNode(true));
        });

        // Show lightbox
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Focus management for accessibility
        lightbox.querySelector('.lightbox-close').focus();

        // Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'view_asset', {
                event_category: 'Gallery',
                event_label: title
            });
        }
    }

    function closeLightbox() {
        if (lightbox) {
            lightbox.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    function setupLightboxEvents() {
        // Close button
        document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
        
        // Overlay click to close
        document.getElementById('lightboxOverlay').addEventListener('click', closeLightbox);
        
        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (lightbox && lightbox.style.display === 'flex') {
                if (e.key === 'Escape') {
                    closeLightbox();
                }
            }
        });

        // Download button
        document.getElementById('downloadBtn').addEventListener('click', function() {
            const img = document.getElementById('lightboxImage');
            window.open(img.src, '_blank');
        });

        // Share button
        document.getElementById('shareBtn').addEventListener('click', function() {
            const title = document.getElementById('lightboxTitle').textContent;
            const url = window.location.href;
            
            if (navigator.share) {
                navigator.share({
                    title: `Terminal Grounds - ${title}`,
                    text: `Check out this asset from Terminal Grounds: ${title}`,
                    url: url
                });
            } else {
                // Fallback to clipboard
                navigator.clipboard.writeText(url).then(() => {
                    // Show temporary feedback
                    const btn = document.getElementById('shareBtn');
                    const originalText = btn.innerHTML;
                    btn.innerHTML = '<span>Copied!</span>';
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                    }, 2000);
                });
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
                container.classList.add('loading');
                
                img.addEventListener('load', () => {
                    container.classList.remove('loading');
                    container.classList.add('loaded');
                }, { once: true });
                
                img.addEventListener('error', () => {
                    container.classList.remove('loading');
                    container.classList.add('error');
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
                            setTimeout(() => {
                                stat.textContent = number + suffix;
                            }, 2000);
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
    let startX = 0;
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
        const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        return ((clientX - rect.left) / rect.width) * 100;
    }

    function handleStart(e) {
        isDragging = true;
        startX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
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
        setTimeout(() => {
            slider.style.transition = 'all 0.2s ease';
        }, 300);
    });

    // Keyboard accessibility
    slider.setAttribute('tabindex', '0');
    slider.setAttribute('role', 'slider');
    slider.setAttribute('aria-valuemin', '0');
    slider.setAttribute('aria-valuemax', '100');
    slider.setAttribute('aria-valuenow', currentPosition.toString());
    slider.setAttribute('aria-label', 'Style comparison slider');

    slider.addEventListener('keydown', function(e) {
        let newPosition = currentPosition;
        
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
                    setTimeout(() => {
                        slider.style.transition = 'all 2s ease';
                        updateSliderPosition(20);
                        
                        setTimeout(() => {
                            updateSliderPosition(80);
                            
                            setTimeout(() => {
                                updateSliderPosition(50);
                                slider.style.transition = 'all 0.2s ease';
                            }, 1500);
                        }, 1500);
                    }, 500);
                    
                    demoObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        demoObserver.observe(comparisonSection);
    }

    // Initialize position
    updateSliderPosition(50);
});
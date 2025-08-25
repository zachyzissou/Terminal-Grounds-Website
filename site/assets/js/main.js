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
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
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
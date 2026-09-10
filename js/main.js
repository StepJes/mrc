/* ============================================
   MUMBAI REGIONAL CONFERENCE - MCI
   Interactive JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initScrollAnimations();
    initTimeline();
    initLegacyLine();
    initStatsCounter();
    initChurchFilters();
    initChurchDirectory();
    initMapModal();
    initSmoothScroll();
    initParallax();
    initHeroCarousel();
});

/* ============================================
   NAVIGATION
   ============================================ */
function initNavigation() {
    const header = document.querySelector('.header');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        navLinks.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.querySelectorAll('a').forEach(function(link) {
        var href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

/* ============================================
   SCROLL ANIMATIONS
   ============================================ */
function initScrollAnimations() {
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                if (entry.target.classList.contains('stat-number')) {
                    animateCounter(entry.target);
                }
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll(
        '.fade-in, .slide-in-left, .slide-in-right, .scale-in, .timeline-item, .legacy-marker, .stat-number'
    ).forEach(function(el) { observer.observe(el); });
}

/* ============================================
   TIMELINE
   ============================================ */
function initTimeline() {
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry, index) {
            if (entry.isIntersecting) {
                setTimeout(function() {
                    entry.target.classList.add('visible');
                }, index * 100);
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.timeline-item').forEach(function(item) {
        observer.observe(item);
    });
}

/* ============================================
   LEGACY LINE
   ============================================ */
function initLegacyLine() {
    var legacyLine = document.querySelector('.legacy-line');
    var legacyMarkers = document.querySelectorAll('.legacy-marker');
    if (!legacyLine) return;

    var container = document.querySelector('.legacy-line-container');
    if (!container) return;

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                setTimeout(function() { legacyLine.classList.add('animate'); }, 300);
                legacyMarkers.forEach(function(marker, index) {
                    setTimeout(function() { marker.classList.add('visible'); }, 500 + index * 200);
                });
            }
        });
    }, { threshold: 0.3 });

    observer.observe(container);
}

/* ============================================
   STATS COUNTER
   ============================================ */
function initStatsCounter() {
    document.querySelectorAll('.stat-number').forEach(function(counter) {
        var target = parseInt(counter.getAttribute('data-target'));
        var step = target / 125;
        var current = 0;
        counter.animateCounter = function() {
            current += step;
            if (current < target) {
                counter.textContent = Math.floor(current).toLocaleString();
                requestAnimationFrame(counter.animateCounter);
            } else {
                counter.textContent = target.toLocaleString();
            }
        };
    });
}

function animateCounter(counter) {
    if (counter.animateCounter && !counter.animated) {
        counter.animated = true;
        counter.animateCounter();
    }
}

/* ============================================
   CHURCH FILTERS (Language Tabs + District Dropdown + Search)
   ============================================ */
function initChurchFilters() {
    var filterTabs = document.querySelectorAll('.filter-tab');
    var districtSelect = document.getElementById('districtFilter');
    var searchInput = document.getElementById('churchSearch');

    function applyFilters() {
        var activeTab = document.querySelector('.filter-tab.active');
        var langFilter = activeTab ? activeTab.getAttribute('data-filter') : 'all';
        var districtFilter = districtSelect ? districtSelect.value : 'all';
        var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var visible = 0;

        document.querySelectorAll('.church-card').forEach(function(card) {
            var lang = card.getAttribute('data-language');
            var district = card.getAttribute('data-district');
            var name = (card.getAttribute('data-name') || '').toLowerCase();
            var addr = (card.getAttribute('data-address') || '').toLowerCase();

            var matchLang = (langFilter === 'all' || lang === langFilter);
            var matchDistrict = (districtFilter === 'all' || district === districtFilter);
            var matchSearch = !query || name.indexOf(query) !== -1 || addr.indexOf(query) !== -1;

            if (matchLang && matchDistrict && matchSearch) {
                card.style.display = 'flex';
                setTimeout(function() { card.style.opacity = '1'; card.style.transform = 'scale(1)'; }, 50);
                visible++;
            } else {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95)';
                setTimeout(function() { card.style.display = 'none'; }, 300);
            }
        });

        var count = document.getElementById('churchCount');
        if (count) count.textContent = visible + ' church' + (visible !== 1 ? 'es' : '');

        var empty = document.getElementById('churchesEmpty');
        if (empty) empty.style.display = visible === 0 ? 'block' : 'none';
    }

    filterTabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            filterTabs.forEach(function(t) { t.classList.remove('active'); });
            this.classList.add('active');
            applyFilters();
        });
    });

    if (districtSelect) {
        districtSelect.addEventListener('change', applyFilters);
    }

    if (searchInput) {
        var debounceTimer;
        searchInput.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(applyFilters, 200);
        });
    }
}

/* ============================================
   CHURCH DIRECTORY RENDER
   ============================================ */
function initChurchDirectory() {
    var grid = document.getElementById('churchesGrid');
    if (!grid) return;

    var data = (typeof window.MRC_CHURCHES !== 'undefined') ? window.MRC_CHURCHES : [];
    if (data.length === 0) return;

    var langNames = {
        tamil: 'Tamil', english: 'English', marathi: 'Marathi',
        kannada: 'Kannada', gujarati: 'Gujarati', hindi: 'Hindi'
    };
    var districtNames = {
        'south-mumbai': 'South Mumbai', 'north-mumbai': 'North Mumbai',
        'thane': 'Thane', 'navi-mumbai': 'Navi Mumbai',
        'pune': 'Pune', 'nagpur': 'Nagpur', 'nanded': 'Nanded'
    };

    var pinSvg = '<svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>';
    var navSvg = '<svg viewBox="0 0 24 24"><path d="M21.71 11.29l-9-9a1 1 0 0 0-1.42 0l-9 9a1 1 0 0 0 0 1.42l9 9a1 1 0 0 0 1.42 0l9-9a1 1 0 0 0 0-1.42zM7.5 15.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM8 14l1.5-1.5L17 5l-7.5 7.5L8 14zM14 8l-5.5 5.5L9 13l.5.5L14 8z"/></svg>';
    var locateSvg = '<svg viewBox="0 0 24 24"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>';

    grid.innerHTML = data.map(function(church) {
        var langLabel = langNames[church.language] || church.language;
        var districtLabel = districtNames[church.district] || '';
        var photo = church.photo ? church.photo : null;
        var mapsUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(church.mapsQuery);
        var embedUrl = 'https://www.google.com/maps?q=' + encodeURIComponent(church.mapsQuery) + '&output=embed';
        var photoHtml = photo
            ? '<img src="' + photo + '" alt="' + church.name + '" loading="lazy" onerror="this.style.display=\'none\'">'
            : '<img src="assets/images/church-building.svg" alt="' + church.name + '" loading="lazy">';

        return '<div class="church-card" data-language="' + church.language + '" data-district="' + church.district + '" data-name="' + church.name + '" data-address="' + church.address + '">' +
            '<div class="church-card-image">' +
                photoHtml +
                '<span class="church-language-badge">' + langLabel + '</span>' +
            '</div>' +
            '<div class="church-card-header">' +
                '<h3>' + church.name + '</h3>' +
                '<div class="church-subtitle">' + church.subtitle + (districtLabel ? ' · ' + districtLabel : '') + '</div>' +
            '</div>' +
            '<div class="church-card-body">' +
                '<p>' + pinSvg + church.address + '</p>' +
            '</div>' +
            '<div class="church-card-actions">' +
                '<button class="church-action-btn map-btn" data-embed="' + embedUrl + '" data-name="' + church.name + '" data-maps="' + mapsUrl + '">' +
                    navSvg + ' View Map' +
                '</button>' +
                '<a class="church-action-btn directions-btn" href="' + mapsUrl + '" target="_blank" rel="noopener">' +
                    locateSvg + ' Directions' +
                '</a>' +
            '</div>' +
        '</div>';
    }).join('');

    // Update count display
    var countEl = document.getElementById('churchCount');
    if (countEl) countEl.textContent = data.length + ' churches';
}

/* ============================================
   MAP MODAL
   ============================================ */
function initMapModal() {
    var modal = document.getElementById('mapModal');
    if (!modal) return;

    var frame = document.getElementById('mapModalFrame');
    var title = document.getElementById('mapModalTitle');
    var close = document.getElementById('mapModalClose');
    var directions = document.getElementById('mapModalDirections');

    document.addEventListener('click', function(e) {
        var btn = e.target.closest('.map-btn');
        if (!btn) return;
        frame.src = btn.getAttribute('data-embed');
        title.textContent = btn.getAttribute('data-name');
        directions.href = btn.getAttribute('data-maps');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    function closeModal() {
        modal.classList.remove('active');
        frame.src = '';
        document.body.style.overflow = '';
    }

    if (close) close.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });
}

/* ============================================
   SMOOTH SCROLL
   ============================================ */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                var offset = target.getBoundingClientRect().top + window.pageYOffset - 80;
                window.scrollTo({ top: offset, behavior: 'smooth' });
            }
        });
    });
}

/* ============================================
   PARALLAX
   ============================================ */
function initParallax() {
    var els = document.querySelectorAll('.parallax');
    if (els.length === 0) return;
    window.addEventListener('scroll', function() {
        var scrolled = window.pageYOffset;
        els.forEach(function(el) {
            var speed = el.getAttribute('data-speed') || 0.5;
            el.style.transform = 'translateY(' + (-(scrolled * speed)) + 'px)';
        });
    });
}

/* ============================================
   HERO CAROUSEL
   ============================================ */
function initHeroCarousel() {
    var carousel = document.querySelector('.hero-carousel');
    if (!carousel) return;
    var slides = carousel.querySelectorAll('.hero-slide');
    if (slides.length < 2) return;

    var index = 0;
    var timer = null;
    var INTERVAL = 16000;

    function show(n) {
        slides[index].classList.remove('active');
        index = (n + slides.length) % slides.length;
        slides[index].classList.add('active');
    }

    function start() {
        if (timer) return;
        timer = setInterval(function() { show(index + 1); }, INTERVAL);
    }

    function stop() {
        if (timer) { clearInterval(timer); timer = null; }
    }

    start();

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) stop(); else start();
    });
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function(entries) {
            if (entries[0].isIntersecting) start(); else stop();
        }, { threshold: 0 }).observe(carousel);
    }
}

/* ============================================
   UTILITIES
   ============================================ */
function debounce(func, wait) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function() { func.apply(context, args); }, wait);
    };
}

function throttle(func, limit) {
    var inThrottle;
    return function() {
        var args = arguments, context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(function() { inThrottle = false; }, limit);
        }
    };
}

window.addEventListener('scroll', throttle(function() {
    var header = document.querySelector('.header');
    if (header) {
        header.style.boxShadow = window.scrollY > 50 ? '0 4px 20px rgba(41,37,37,0.1)' : 'none';
    }
}, 100));

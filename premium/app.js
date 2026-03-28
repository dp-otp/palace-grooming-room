/* ============================================
   PALACE GROOMING ROOM - PREMIUM JAVASCRIPT
   Interactive Functionality & Animations
   ============================================ */

// ============================================
// 1. NAVIGATION
// ============================================
class Navigation {
    constructor() {
        this.nav = document.querySelector('.nav');
        this.hamburger = document.querySelector('.nav-hamburger');
        this.menu = document.querySelector('.nav-menu');
        this.links = document.querySelectorAll('.nav-link');

        this.init();
    }

    init() {
        // Scroll effect
        window.addEventListener('scroll', () => this.handleScroll());

        // Mobile menu toggle
        if (this.hamburger) {
            this.hamburger.addEventListener('click', () => this.toggleMenu());
        }

        // Close menu on link click
        this.links.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // Set active link based on current page
        this.setActiveLink();
    }

    handleScroll() {
        if (window.scrollY > 50) {
            this.nav.classList.add('scrolled');
        } else {
            this.nav.classList.remove('scrolled');
        }
    }

    toggleMenu() {
        this.hamburger.classList.toggle('active');
        this.menu.classList.toggle('active');
        document.body.style.overflow = this.menu.classList.contains('active') ? 'hidden' : '';
    }

    closeMenu() {
        this.hamburger.classList.remove('active');
        this.menu.classList.remove('active');
        document.body.style.overflow = '';
    }

    setActiveLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        this.links.forEach(link => {
            const linkPage = link.getAttribute('href');
            if (linkPage === currentPage || (currentPage === 'index.html' && linkPage === 'index.html')) {
                link.classList.add('active');
            }
        });
    }
}

// ============================================
// 2. SCROLL ANIMATIONS
// ============================================
class ScrollAnimations {
    constructor() {
        this.observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -100px 0px'
        };

        this.init();
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, this.observerOptions);

        // Observe all animated elements
        const animatedElements = document.querySelectorAll(
            '.fade-in, .slide-in-left, .slide-in-right, .scale-in, .service-card-interactive, .gallery-item-interactive, [data-reveal]'
        );

        animatedElements.forEach(el => observer.observe(el));
    }
}

// ============================================
// 4. PAYMENT CHECKOUT — Card Payment via pay.html
// ============================================
class PaymentCheckout {
    constructor() {}

    show(mainService, mainPrice, addOns = [], serviceId = '') {
        const mainTotal = parseFloat(String(mainPrice).replace('£', '')) || 0;
        let addOnsTotal = 0;
        addOns.forEach(addOn => {
            addOnsTotal += parseFloat(String(addOn.price).replace('£', '')) || 0;
        });
        const total = mainTotal + addOnsTotal;

        let url;
        if (serviceId && addOns.length === 0) {
            url = 'pay.html#' + serviceId;
        } else {
            url = 'pay.html#amt:' + total.toFixed(2);
        }
        window.location.href = url;
    }

    processPayment() {}
    showSuccess() {}
    close() {}
}


// ============================================
// 7. FORM HANDLING
// ============================================
class FormHandler {
    constructor() {
        this.init();
    }

    init() {
        const forms = document.querySelectorAll('form[data-form-type]');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formType = form.dataset.formType;

        const btn = form.querySelector('button[type="submit"]');
        const originalHTML = btn.innerHTML;

        btn.disabled = true;
        btn.innerHTML = '<span>Sending...</span>';

        setTimeout(() => {
            btn.innerHTML = '<span>✓ Sent!</span>';
            form.reset();

            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = originalHTML;
            }, 2000);
        }, 1500);
    }
}

// ============================================
// 8. GALLERY FILTERING
// ============================================
class GalleryFilter {
    constructor() {
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.galleryItems = document.querySelectorAll('.gallery-item-interactive');
        this.init();
    }

    init() {
        if (this.filterBtns.length === 0) return;

        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => this.filterGallery(btn));
        });
    }

    filterGallery(btn) {
        const filter = btn.dataset.filter;

        this.filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        this.galleryItems.forEach(item => {
            const category = item.dataset.category;

            if (filter === 'all' || category === filter) {
                item.style.display = 'block';
                item.classList.remove('scale-in');
                void item.offsetWidth;
                item.classList.add('scale-in');
            } else {
                item.style.display = 'none';
            }
        });

        setTimeout(() => {
            const firstVisible = Array.from(this.galleryItems).find(item => item.style.display !== 'none');
            if (firstVisible) {
                const galleryGrid = firstVisible.closest('.gallery-grid');
                if (galleryGrid) {
                    const offset = 150;
                    const gridTop = galleryGrid.getBoundingClientRect().top + window.scrollY;

                    window.scrollTo({
                        top: gridTop - offset,
                        behavior: 'smooth'
                    });
                }
            }
        }, 300);
    }
}

// ============================================
// 9. INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    window.navigation = new Navigation();
    window.scrollAnimations = new ScrollAnimations();
    window.paymentCheckout = new PaymentCheckout();
    window.formHandler = new FormHandler();
    window.galleryFilter = new GalleryFilter();

    // Nav mustache spin on click + auto spin every 10s
    const navMustache = document.querySelector('.nav-logo-mustache');
    if (navMustache) {
        const slowSpin = () => {
            if (document.querySelector('.nav.scrolled')) return;
            navMustache.style.animation = 'nav-mustache-slow-spin 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            setTimeout(() => {
                navMustache.style.animation = 'nav-mustache-idle 3s ease-in-out infinite';
            }, 2050);
        };
        const fastSpin = () => {
            navMustache.style.animation = 'nav-mustache-slow-spin 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            setTimeout(() => {
                navMustache.style.animation = 'nav-mustache-idle 3s ease-in-out infinite';
            }, 550);
        };
        navMustache.addEventListener('click', () => {
            fastSpin();
            setTimeout(() => {
                window.location.href = navMustache.closest('a').href;
            }, 500);
        });
        setInterval(slowSpin, 20000);
    }

    console.log('✨ Palace Grooming Room - Initialized');
});

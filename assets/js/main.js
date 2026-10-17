/**
 * QRServe — Main JavaScript
 * Handles: Theme, RTL, Navbar, Drawer, Scroll, Animations, FAQ
 */

'use strict';

/* ============================================================
   1. THEME MANAGEMENT
   ============================================================ */
const ThemeManager = (() => {
  const STORAGE_KEY = 'qrserve-theme';
  const DARK = 'dark';
  const LIGHT = 'light';

  const getSystemTheme = () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK : LIGHT;

  const getSavedTheme = () => localStorage.getItem(STORAGE_KEY);

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    updateToggleIcons(theme);
  };

  const updateToggleIcons = (theme) => {
    const icons = document.querySelectorAll('[data-theme-icon]');
    icons.forEach(icon => {
      icon.setAttribute('data-theme-icon', theme);
      // Sun icon when dark (clicking will switch to light), Moon icon when light
      if (theme === DARK) {
        icon.innerHTML = `<i class="ri-sun-line" style="font-size:1.2rem;"></i>`;
      } else {
        icon.innerHTML = `<i class="ri-moon-line" style="font-size:1.2rem;"></i>`;
      }
    });
  };

  const toggle = () => {
    const current = document.documentElement.getAttribute('data-theme') || getSystemTheme();
    const next = current === DARK ? LIGHT : DARK;
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  };

  const init = () => {
    const saved = getSavedTheme();
    const theme = saved || getSystemTheme();
    applyTheme(theme);

    // Listen for system changes if no saved preference
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!getSavedTheme()) {
        applyTheme(e.matches ? DARK : LIGHT);
      }
    });
  };

  return { init, toggle };
})();

/* ============================================================
   2. RTL MANAGEMENT
   ============================================================ */
const RTLManager = (() => {
  const STORAGE_KEY = 'qrserve-dir';

  const applyDir = (dir) => {
    document.documentElement.setAttribute('dir', dir);
    updateRTLIcons(dir);
  };

  const updateRTLIcons = (dir) => {
    const btns = document.querySelectorAll('[data-rtl-btn]');
    btns.forEach(btn => {
      if (dir === 'rtl') {
        btn.innerHTML = `<i class="ri-arrow-left-right-line" style="font-size:1.2rem;"></i>`;
        btn.setAttribute('aria-label', 'Switch to LTR');
        btn.setAttribute('title', 'Switch to Left-to-Right');
      } else {
        btn.innerHTML = `<i class="ri-arrow-left-right-line" style="font-size:1.2rem;"></i>`;
        btn.setAttribute('aria-label', 'Switch to RTL');
        btn.setAttribute('title', 'Switch to Right-to-Left');
      }
    });
  };

  const toggle = () => {
    const current = document.documentElement.getAttribute('dir') || 'ltr';
    const next = current === 'rtl' ? 'ltr' : 'rtl';
    localStorage.setItem(STORAGE_KEY, next);
    applyDir(next);
  };

  const init = () => {
    const saved = localStorage.getItem(STORAGE_KEY) || 'ltr';
    applyDir(saved);
  };

  return { init, toggle };
})();

/* ============================================================
   3. NAVBAR — Scroll state & Active link
   ============================================================ */
const Navbar = (() => {
  let navbar;
  let lastScroll = 0;

  const setActive = () => {
    let path = window.location.pathname.split('/').pop() || 'index.html';
    if (!path || path === '' || path === '/') path = 'index.html';
    
    // First remove active from all links
    const allLinks = document.querySelectorAll('[data-nav-link]');
    allLinks.forEach(link => link.classList.remove('active'));

    // Highlight only the link(s) matching current page (desktop nav and mobile drawer)
    allLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      const baseHref = href.split('#')[0].split('?')[0];
      if (baseHref === path || (path === 'index.html' && (baseHref === 'index.html' || baseHref === ''))) {
        link.classList.add('active');
      }
    });
  };

  const handleScroll = () => {
    const current = window.scrollY;
    if (!navbar) return;

    if (current > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = current;
  };

  const init = () => {
    navbar = document.querySelector('.navbar');
    if (!navbar) return;
    setActive();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('hashchange', setActive);
    handleScroll();
  };

  return { init, setActive };
})();

/* ============================================================
   4. MOBILE DRAWER
   ============================================================ */
const Drawer = (() => {
  let drawer, overlay, hamburger, closeBtn;

  const open = () => {
    drawer?.classList.add('active');
    overlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
    hamburger?.setAttribute('aria-expanded', 'true');
    closeBtn?.focus();
  };

  const close = () => {
    drawer?.classList.remove('active');
    overlay?.classList.remove('active');
    document.body.style.overflow = '';
    hamburger?.setAttribute('aria-expanded', 'false');
    hamburger?.focus();
  };

  const init = () => {
    drawer = document.querySelector('.drawer');
    overlay = document.querySelector('.drawer-overlay');
    hamburger = document.querySelector('.navbar__hamburger');
    closeBtn = document.querySelector('.drawer__close');

    if (!drawer) return;

    hamburger?.addEventListener('click', open);
    closeBtn?.addEventListener('click', close);
    overlay?.addEventListener('click', close);

    // Auto-close drawer when clicking any link inside
    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        close();
      });
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('active')) {
        close();
      }
    });

    // Close on nav link click
    drawer.querySelectorAll('.drawer__link').forEach(link => {
      link.addEventListener('click', close);
    });
  };

  return { init, open, close };
})();

/* ============================================================
   5. SCROLL REVEAL
   ============================================================ */
const ScrollReveal = (() => {
  let observer;

  const init = () => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      // Just show everything immediately
      document.querySelectorAll('.reveal, .reveal--left, .reveal--right').forEach(el => {
        el.classList.add('visible');
      });
      return;
    }

    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.reveal, .reveal--left, .reveal--right').forEach(el => {
      observer.observe(el);
    });
  };

  return { init };
})();

/* ============================================================
   6. FAQ ACCORDION
   ============================================================ */
const FAQ = (() => {
  const init = () => {
    document.querySelectorAll('.faq-item').forEach(item => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');

      if (!question || !answer) return;

      // Set initial aria
      const isOpen = item.classList.contains('open');
      question.setAttribute('aria-expanded', isOpen.toString());

      question.addEventListener('click', () => {
        const isCurrentlyOpen = item.classList.contains('open');

        // Close all others (accordion behavior)
        document.querySelectorAll('.faq-item.open').forEach(openItem => {
          if (openItem !== item) {
            openItem.classList.remove('open');
            const q = openItem.querySelector('.faq-question');
            const a = openItem.querySelector('.faq-answer');
            q?.setAttribute('aria-expanded', 'false');
            if (a) a.style.maxHeight = null;
          }
        });

        if (isCurrentlyOpen) {
          item.classList.remove('open');
          question.setAttribute('aria-expanded', 'false');
          answer.style.maxHeight = null;
        } else {
          item.classList.add('open');
          question.setAttribute('aria-expanded', 'true');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });

      // Keyboard support
      question.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          question.click();
        }
      });
    });
  };

  return { init };
})();

/* ============================================================
   7. PRICING TOGGLE (Monthly / Yearly)
   ============================================================ */
const PricingToggle = (() => {
  const init = () => {
    const toggle = document.getElementById('pricing-toggle');
    if (!toggle) return;

    const monthlyPrices = document.querySelectorAll('[data-price-monthly]');
    const yearlyPrices = document.querySelectorAll('[data-price-yearly]');
    const periodLabels = document.querySelectorAll('[data-pricing-period]');
    const savingsBadges = document.querySelectorAll('[data-pricing-savings]');

    const update = () => {
      const isYearly = toggle.checked;
      monthlyPrices.forEach(el => {
        el.style.display = isYearly ? 'none' : '';
      });
      yearlyPrices.forEach(el => {
        el.style.display = isYearly ? '' : 'none';
      });
      periodLabels.forEach(el => {
        el.textContent = isYearly ? '/year' : '/month';
      });
      savingsBadges.forEach(el => {
        el.style.display = isYearly ? '' : 'none';
      });
    };

    toggle.addEventListener('change', update);
    update(); // init state
  };

  return { init };
})();

/* ============================================================
   8. TYPING EFFECT (Hero)
   ============================================================ */
const TypingEffect = (() => {
  const init = (selector, words, options = {}) => {
    const el = document.querySelector(selector);
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = words[0];
      return;
    }

    const speed = options.speed || 80;
    const deleteSpeed = options.deleteSpeed || 40;
    const pause = options.pause || 1800;
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const type = () => {
      const current = words[wordIndex];
      if (isDeleting) {
        el.textContent = current.substring(0, charIndex - 1);
        charIndex--;
      } else {
        el.textContent = current.substring(0, charIndex + 1);
        charIndex++;
      }

      if (!isDeleting && charIndex === current.length) {
        isDeleting = true;
        setTimeout(type, pause);
        return;
      }

      if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
      }

      setTimeout(type, isDeleting ? deleteSpeed : speed);
    };

    type();
  };

  return { init };
})();

/* ============================================================
   9. COUNTER ANIMATION (Stats)
   ============================================================ */
const CounterAnimation = (() => {
  const animate = (el) => {
    const target = parseFloat(el.getAttribute('data-target'));
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    const duration = 2000;
    const start = performance.now();

    const update = (time) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = prefix + (Number.isInteger(target) ? Math.floor(value) : value.toFixed(1)) + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = prefix + target + suffix;
      }
    };

    requestAnimationFrame(update);
  };

  const init = () => {
    const counters = document.querySelectorAll('[data-target]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
  };

  return { init };
})();

/* ============================================================
   10. HERO FLOATING ANIMATION
   ============================================================ */
const HeroFloat = (() => {
  const init = () => {
    const elements = document.querySelectorAll('[data-float]');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    elements.forEach((el, i) => {
      const delay = i * 0.5;
      const duration = 3 + i * 0.5;
      const range = 10 + i * 2;
      el.style.animation = `float-${i % 2 === 0 ? 'y' : 'x'} ${duration}s ease-in-out ${delay}s infinite`;
      el.style.setProperty('--float-range', `${range}px`);
    });
  };

  return { init };
})();

/* ============================================================
   11. SMOOTH SCROLL FOR ANCHOR LINKS
   ============================================================ */
const SmoothScroll = (() => {
  const init = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  };

  return { init };
})();

/* ============================================================
   12. TOAST NOTIFICATIONS
   ============================================================ */
const Toast = (() => {
  const show = (message, type = 'success', duration = 4000) => {
    const container = document.getElementById('toast-container') || createContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    const icons = {
      success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>`,
      error: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg>`,
      info: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`
    };

    toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => toast.classList.add('toast--visible'));

    // Remove after duration
    setTimeout(() => {
      toast.classList.remove('toast--visible');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  const createContainer = () => {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  };

  return { show };
})();



/* ============================================================
   14. GLOBAL INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  RTLManager.init();
  Navbar.init();
  Drawer.init();
  ScrollReveal.init();
  FAQ.init();
  PricingToggle.init();
  CounterAnimation.init();
  SmoothScroll.init();

  // Wire theme toggles
  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    btn.addEventListener('click', ThemeManager.toggle);
  });

  // Wire RTL toggles
  document.querySelectorAll('[data-rtl-btn]').forEach(btn => {
    btn.addEventListener('click', RTLManager.toggle);
  });
});

/* ============================================================
   14. TOAST STYLES (injected dynamically)
   ============================================================ */
const toastStyles = document.createElement('style');
toastStyles.textContent = `
  .toast-container {
    position: fixed;
    inset-block-end: 1.5rem;
    inset-inline-end: 1.5rem;
    z-index: var(--z-toast, 600);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    pointer-events: none;
  }

  .toast {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.875rem 1.25rem;
    border-radius: 10px;
    font-size: 0.875rem;
    font-family: var(--font-body, sans-serif);
    font-weight: 500;
    box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    transform: translateY(12px) scale(0.96);
    opacity: 0;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: all;
    max-width: 340px;
  }

  .toast--visible {
    transform: translateY(0) scale(1);
    opacity: 1;
  }

  .toast--success {
    background: #00c896;
    color: #0a0f0d;
  }

  .toast--error {
    background: #ff6b5b;
    color: #ffffff;
  }

  .toast--info {
    background: #3b82f6;
    color: #ffffff;
  }

  @keyframes float-y {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(calc(var(--float-range, 10px) * -1)); }
  }

  @keyframes float-x {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(calc(var(--float-range, 8px) * -1)); }
  }
`;
document.head.appendChild(toastStyles);

// Export for use in other scripts
window.QRServe = {
  ThemeManager,
  RTLManager,
  Drawer,
  Toast,
  TypingEffect,
  ScrollReveal,
};

// Scroll to Top Button
document.addEventListener('DOMContentLoaded', () => {
  const scrollTopBtn = document.createElement('button');
  scrollTopBtn.innerHTML = '<i class="ri-arrow-up-line"></i>';
  scrollTopBtn.className = 'scroll-to-top';
  scrollTopBtn.setAttribute('aria-label', 'Scroll to top');
  document.body.appendChild(scrollTopBtn);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Testimonial Reviewer Slider (Home 1)
  const initTestimonialSlider = () => {
    const sliderContainer = document.getElementById('testimonial-slider');
    if (!sliderContainer) return;

    const track = document.getElementById('testimonial-track');
    const slides = sliderContainer.querySelectorAll('.testimonial-slide');
    const prevBtn = document.getElementById('slider-prev-btn');
    const nextBtn = document.getElementById('slider-next-btn');
    const dotsContainer = document.getElementById('slider-dots');

    if (!track || slides.length === 0) return;

    let currentIndex = 0;
    let autoSlideInterval = null;

    const updateSlider = (index) => {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      currentIndex = index;

      // Update slide position
      track.style.transform = `translateX(-${currentIndex * 100}%)`;

      // Update active class on slides
      slides.forEach((slide, idx) => {
        slide.classList.toggle('active', idx === currentIndex);
      });

      // Update dots
      if (dotsContainer) {
        const dots = dotsContainer.querySelectorAll('.slider-dot');
        dots.forEach((dot, idx) => {
          dot.classList.toggle('active', idx === currentIndex);
        });
      }
    };

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        updateSlider(currentIndex - 1);
        resetAutoSlide();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        updateSlider(currentIndex + 1);
        resetAutoSlide();
      });
    }

    if (dotsContainer) {
      dotsContainer.addEventListener('click', (e) => {
        const dot = e.target.closest('.slider-dot');
        if (!dot) return;
        const index = parseInt(dot.getAttribute('data-index'), 10);
        if (!isNaN(index)) {
          updateSlider(index);
          resetAutoSlide();
        }
      });
    }

    const startAutoSlide = () => {
      stopAutoSlide();
      autoSlideInterval = setInterval(() => {
        updateSlider(currentIndex + 1);
      }, 5000);
    };

    const stopAutoSlide = () => {
      if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
      }
    };

    const resetAutoSlide = () => {
      stopAutoSlide();
      startAutoSlide();
    };

    sliderContainer.addEventListener('mouseenter', stopAutoSlide);
    sliderContainer.addEventListener('mouseleave', startAutoSlide);

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    sliderContainer.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoSlide();
    }, { passive: true });

    sliderContainer.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 40) {
        updateSlider(currentIndex + 1);
      } else if (touchEndX - touchStartX > 40) {
        updateSlider(currentIndex - 1);
      }
      startAutoSlide();
    }, { passive: true });

    updateSlider(0);
    startAutoSlide();
  };

  initTestimonialSlider();

  // Interactive Operations & ROI Calculator
  const initRoiCalculator = () => {
    const tablesInput = document.getElementById('roi-tables');
    const checkInput = document.getElementById('roi-check');
    const ordersInput = document.getElementById('roi-orders');

    if (!tablesInput || !checkInput || !ordersInput) return;

    const tablesVal = document.getElementById('roi-tables-val');
    const checkVal = document.getElementById('roi-check-val');
    const ordersVal = document.getElementById('roi-orders-val');

    const hoursResult = document.getElementById('roi-hours-result');
    const revenueResult = document.getElementById('roi-revenue-result');
    const printResult = document.getElementById('roi-print-result');

    const update = () => {
      const tables = parseInt(tablesInput.value, 10) || 25;
      const check = parseFloat(checkInput.value) || 45;
      const ordersPerDay = parseInt(ordersInput.value, 10) || 4;

      if (tablesVal) tablesVal.textContent = tables + ' tables';
      if (checkVal) checkVal.textContent = '$' + check;
      if (ordersVal) ordersVal.textContent = ordersPerDay + ' turns/day';

      // 4.8 labor hours saved per table / month
      const hoursSaved = Math.round(tables * 4.8);
      // Upsell uplift of 22% on gross orders
      const monthlyGross = tables * ordersPerDay * check * 30;
      const extraRevenue = Math.round(monthlyGross * 0.22);
      // Annual menu printing & reprint savings: ~$120/table
      const printSavings = Math.round(tables * 120);

      if (hoursResult) hoursResult.textContent = hoursSaved.toLocaleString() + ' hrs/mo';
      if (revenueResult) revenueResult.textContent = '+$' + extraRevenue.toLocaleString() + '/mo';
      if (printResult) printResult.textContent = '$' + printSavings.toLocaleString() + '/yr';
    };

    tablesInput.addEventListener('input', update);
    checkInput.addEventListener('input', update);
    ordersInput.addEventListener('input', update);
    update();
  };

  initRoiCalculator();
});


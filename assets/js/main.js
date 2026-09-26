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
        icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`;
      } else {
        icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
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
        btn.innerHTML = `<span style="font-size:0.8rem; font-weight:700; letter-spacing:0.5px;">EN</span>`;
        btn.setAttribute('aria-label', 'Switch to LTR');
        btn.setAttribute('title', 'Switch to English (LTR)');
      } else {
        btn.innerHTML = `<span style="font-size:0.8rem; font-weight:700; letter-spacing:0.5px;">AR</span>`;
        btn.setAttribute('aria-label', 'Switch to RTL');
        btn.setAttribute('title', 'Switch to Arabic (RTL)');
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
    const path = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('[data-nav-link]');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href === path || (path === '' && href === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
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
    handleScroll();
  };

  return { init };
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
   13. BACK TO TOP BUTTON
   ============================================================ */
const BackToTop = (() => {
  const init = () => {
    const footerBottom = document.querySelector('.footer__bottom');
    if (!footerBottom) return;

    const btn = document.createElement('button');
    btn.className = 'btn btn--outline btn--sm';
    btn.style.paddingBlock = '0.35rem';
    btn.innerHTML = 'Back to Top <i class="ri-arrow-up-line" aria-hidden="true" style="margin-left:4px;"></i>';
    
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    footerBottom.appendChild(btn);
  };
  
  return { init };
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
  BackToTop.init();

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

/**
 * QRServe — Forms JavaScript
 * Handles all form validation and submission
 */

'use strict';

/* ============================================================
   VALIDATION UTILITIES
   ============================================================ */
const Validators = {
  required: (value) => value.trim().length > 0,
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
  phone: (value) => /^[\d\s\+\-\(\)]{7,20}$/.test(value.trim()),
  minLength: (value, min) => value.trim().length >= min,
  maxLength: (value, max) => value.trim().length <= max,
  passwordMatch: (value, confirmValue) => value === confirmValue,
  password: (value) => value.length >= 8,
};

const FormUtils = {
  setError: (group, message) => {
    group.classList.add('has-error');
    group.classList.remove('has-success');
    const errorEl = group.querySelector('.form-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
    const input = group.querySelector('.form-input, .form-select, .form-textarea');
    if (input) input.setAttribute('aria-invalid', 'true');
  },

  clearError: (group) => {
    group.classList.remove('has-error');
    const errorEl = group.querySelector('.form-error');
    if (errorEl) errorEl.classList.remove('visible');
    const input = group.querySelector('.form-input, .form-select, .form-textarea');
    if (input) input.removeAttribute('aria-invalid');
  },

  setSuccess: (group) => {
    group.classList.remove('has-error');
    group.classList.add('has-success');
    const errorEl = group.querySelector('.form-error');
    if (errorEl) errorEl.classList.remove('visible');
  },

  showFormAlert: (form, type, message) => {
    const alert = form.querySelector('.form-alert');
    if (!alert) return;
    alert.className = `form-alert form-alert--${type} visible`;

    const iconSvgs = {
      success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>`,
      error: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg>`
    };

    alert.innerHTML = `${iconSvgs[type] || ''}<span>${message}</span>`;
    alert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  hideFormAlert: (form) => {
    const alert = form.querySelector('.form-alert');
    if (alert) alert.classList.remove('visible');
  },

  setButtonLoading: (btn, isLoading) => {
    if (isLoading) {
      btn.disabled = true;
      btn.setAttribute('data-original-text', btn.innerHTML);
      btn.innerHTML = `<svg class="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Processing...`;
    } else {
      btn.disabled = false;
      const original = btn.getAttribute('data-original-text');
      if (original) btn.innerHTML = original;
    }
  }
};

/* ============================================================
   GENERIC FORM VALIDATOR
   ============================================================ */
const validateField = (input) => {
  const group = input.closest('.form-group');
  if (!group) return true;

  const isRequired = input.hasAttribute('required') || input.dataset.required === 'true';
  const value = input.value;

  // Required check
  if (isRequired && !Validators.required(value)) {
    FormUtils.setError(group, input.dataset.errorRequired || 'This field is required.');
    return false;
  }

  // Skip further validation if empty and not required
  if (!Validators.required(value) && !isRequired) {
    FormUtils.clearError(group);
    return true;
  }

  // Email validation
  if (input.type === 'email' && !Validators.email(value)) {
    FormUtils.setError(group, 'Please enter a valid email address.');
    return false;
  }

  // Phone validation
  if (input.type === 'tel' && value && !Validators.phone(value)) {
    FormUtils.setError(group, 'Please enter a valid phone number.');
    return false;
  }

  // Password validation
  if (input.type === 'password' && input.dataset.validate === 'password') {
    if (!Validators.password(value)) {
      FormUtils.setError(group, 'Password must be at least 8 characters.');
      return false;
    }
  }

  // Min length
  const minLen = input.dataset.minLength;
  if (minLen && !Validators.minLength(value, parseInt(minLen))) {
    FormUtils.setError(group, `Minimum ${minLen} characters required.`);
    return false;
  }

  FormUtils.clearError(group);
  return true;
};

/* ============================================================
   FORM INIT — Attach real-time validation
   ============================================================ */
const initFormValidation = (formEl) => {
  const inputs = formEl.querySelectorAll('.form-input, .form-select, .form-textarea');

  inputs.forEach(input => {
    // Validate on blur
    input.addEventListener('blur', () => validateField(input));

    // Clear error on input
    input.addEventListener('input', () => {
      const group = input.closest('.form-group');
      if (group?.classList.contains('has-error')) {
        FormUtils.clearError(group);
      }
    });
  });
};

const validateForm = (formEl) => {
  const inputs = formEl.querySelectorAll('.form-input[required], .form-select[required], .form-textarea[required], [data-required="true"]');
  let isValid = true;

  inputs.forEach(input => {
    if (!validateField(input)) isValid = false;
  });

  // Password confirm check
  const password = formEl.querySelector('[data-validate="password"]');
  const confirm = formEl.querySelector('[data-validate="confirm-password"]');
  if (password && confirm) {
    if (!Validators.passwordMatch(password.value, confirm.value)) {
      const group = confirm.closest('.form-group');
      FormUtils.setError(group, 'Passwords do not match.');
      isValid = false;
    }
  }

  // Terms checkbox
  const terms = formEl.querySelector('[data-required-check]');
  if (terms && !terms.checked) {
    const group = terms.closest('.form-group') || terms.closest('.form-checkbox');
    if (group) FormUtils.setError(group, 'You must accept the terms to continue.');
    isValid = false;
  }

  return isValid;
};

/* ============================================================
   PASSWORD VISIBILITY TOGGLE
   ============================================================ */
const initPasswordToggles = () => {
  document.querySelectorAll('[data-toggle-password]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.togglePassword;
      const input = document.getElementById(targetId);
      if (!input) return;

      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';

      btn.innerHTML = isHidden
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;

      btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    });
  });
};

/* ============================================================
   CONTACT FORM
   ============================================================ */
const initContactForm = () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  initFormValidation(form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;

    const btn = form.querySelector('[type="submit"]');
    FormUtils.setButtonLoading(btn, true);
    FormUtils.hideFormAlert(form);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    FormUtils.setButtonLoading(btn, false);
    FormUtils.showFormAlert(form, 'success', 'Thank you! Your message has been sent. We\'ll get back to you within 24 hours.');
    form.reset();
  });
};

/* ============================================================
   DEMO REQUEST FORM
   ============================================================ */
const initDemoForm = () => {
  const form = document.getElementById('demo-form');
  if (!form) return;

  initFormValidation(form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;

    const btn = form.querySelector('[type="submit"]');
    FormUtils.setButtonLoading(btn, true);
    FormUtils.hideFormAlert(form);

    await new Promise(resolve => setTimeout(resolve, 2000));

    FormUtils.setButtonLoading(btn, false);

    // Show success state
    const successBlock = document.getElementById('demo-success');
    if (successBlock) {
      form.style.display = 'none';
      successBlock.style.display = 'block';
      successBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      FormUtils.showFormAlert(form, 'success', 'Demo request submitted! Our team will contact you within 2 business hours to schedule your demo.');
      form.reset();
    }
  });
};

/* ============================================================
   LOGIN FORM
   ============================================================ */
const initLoginForm = () => {
  const form = document.getElementById('login-form');
  if (!form) return;

  initFormValidation(form);
  initPasswordToggles();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;

    const btn = form.querySelector('[type="submit"]');
    FormUtils.setButtonLoading(btn, true);
    FormUtils.hideFormAlert(form);

    await new Promise(resolve => setTimeout(resolve, 1800));

    FormUtils.setButtonLoading(btn, false);
    // Redirect to dashboard (simulated)
    window.location.href = 'dashboard.html';
  });
};

/* ============================================================
   REGISTER FORM
   ============================================================ */
const initRegisterForm = () => {
  const form = document.getElementById('register-form');
  if (!form) return;

  initFormValidation(form);
  initPasswordToggles();

  // Live password strength
  const passwordInput = form.querySelector('[data-validate="password"]');
  const strengthBar = form.querySelector('.password-strength-bar');
  const strengthText = form.querySelector('.password-strength-text');

  if (passwordInput && strengthBar) {
    passwordInput.addEventListener('input', () => {
      const val = passwordInput.value;
      let strength = 0;
      if (val.length >= 8) strength++;
      if (/[A-Z]/.test(val)) strength++;
      if (/[0-9]/.test(val)) strength++;
      if (/[^A-Za-z0-9]/.test(val)) strength++;

      const levels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
      const colors = ['', '#ff6b5b', '#f59e0b', '#00c896', '#00a87d'];

      strengthBar.style.width = `${(strength / 4) * 100}%`;
      strengthBar.style.background = colors[strength];
      if (strengthText) {
        strengthText.textContent = levels[strength] || '';
        strengthText.style.color = colors[strength];
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;

    const btn = form.querySelector('[type="submit"]');
    FormUtils.setButtonLoading(btn, true);
    FormUtils.hideFormAlert(form);

    await new Promise(resolve => setTimeout(resolve, 2000));

    FormUtils.setButtonLoading(btn, false);
    FormUtils.showFormAlert(form, 'success', 'Account created successfully! Redirecting to your dashboard...');

    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1800);
  });
};

/* ============================================================
   NEWSLETTER FORM
   ============================================================ */
const initNewsletterForms = () => {
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = form.querySelector('[type="email"]');
      if (!emailInput) return;

      const group = emailInput.closest('.form-group') || emailInput.parentElement;
      if (!Validators.email(emailInput.value)) {
        if (group.classList.contains('form-group')) {
          FormUtils.setError(group, 'Please enter a valid email address.');
        }
        return;
      }

      const btn = form.querySelector('[type="submit"]');
      FormUtils.setButtonLoading(btn, true);

      await new Promise(resolve => setTimeout(resolve, 1200));

      FormUtils.setButtonLoading(btn, false);
      form.innerHTML = `<div class="form-alert form-alert--success visible" style="display:flex;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg><span>You're subscribed! Check your email for confirmation.</span></div>`;
    });
  });
};

/* ============================================================
   SPIN ANIMATION FOR LOADING
   ============================================================ */
const spinStyle = document.createElement('style');
spinStyle.textContent = `
  .spin {
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .form-group.has-success .form-input,
  .form-group.has-success .form-select,
  .form-group.has-success .form-textarea {
    border-color: var(--clr-secondary);
  }

  .password-strength-track {
    height: 4px;
    background: var(--clr-surface-3);
    border-radius: 2px;
    overflow: hidden;
    margin-block-start: 0.375rem;
  }

  .password-strength-bar {
    height: 100%;
    border-radius: 2px;
    width: 0%;
    transition: width 0.3s ease, background 0.3s ease;
  }

  .password-strength-text {
    font-size: var(--size-xs, 0.75rem);
    margin-block-start: 0.25rem;
    font-weight: 500;
  }
`;
document.head.appendChild(spinStyle);

/* ============================================================
   INIT ALL FORMS
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initContactForm();
  initDemoForm();
  initLoginForm();
  initRegisterForm();
  initNewsletterForms();
  initPasswordToggles();
});

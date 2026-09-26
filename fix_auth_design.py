import re

css_overrides = '''
    /* Auth Form Overrides matching the new design */
    .auth-layout {
      background: radial-gradient(circle at top left, #e0f2fe 0%, #f8fafc 50%, #f0f9ff 100%);
    }
    [data-theme="dark"] .auth-layout {
      background: var(--clr-bg);
    }

    .auth-form-wrap {
      background: #ffffff;
      border: none;
      border-radius: 24px;
      padding: 3rem 2.5rem;
      box-shadow: 0 20px 40px rgba(0,0,0,0.04);
      max-width: 460px;
    }
    [data-theme="dark"] .auth-form-wrap {
      background: var(--clr-surface);
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    }

    .auth-form-wrap h1 {
      font-weight: 800;
      color: var(--clr-text-primary);
    }

    .auth-form-wrap .form-label {
      font-weight: 700;
      font-size: 0.875rem;
      margin-block-end: 0.5rem;
      color: var(--clr-text-primary);
      display: block;
    }

    .auth-form-wrap .form-input {
      background: #f4f5f7;
      border: 1px solid transparent;
      border-radius: 12px;
      padding: 0.875rem 1.25rem;
      font-size: 1rem;
      box-shadow: none;
    }
    [data-theme="dark"] .auth-form-wrap .form-input {
      background: var(--clr-surface-2);
      border-color: var(--clr-border);
    }
    .auth-form-wrap .form-input:focus {
      background: var(--clr-surface);
      border-color: #0ea5e9;
      box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
    }

    .auth-form-wrap .btn--primary {
      border-radius: 50px;
      background: #0ea5e9;
      color: #fff;
      font-weight: 700;
      font-size: 1rem;
      padding: 1rem;
      border: none;
      box-shadow: 0 8px 16px rgba(14, 165, 233, 0.25);
      transition: transform var(--transition-fast), box-shadow var(--transition-fast);
      margin-top: 0.5rem;
    }
    .auth-form-wrap .btn--primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 20px rgba(14, 165, 233, 0.35);
    }

    .auth-form-wrap .social-btn {
      border-radius: 50px;
      border: 1px solid var(--clr-border-strong);
      padding: 0.75rem 1.5rem;
      font-weight: 600;
    }

    .auth-topbar__actions .icon-btn {
      background: var(--clr-surface);
      border: 1px solid var(--clr-border);
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .auth-brand-logo__icon {
      background: #0ea5e9;
      color: #fff;
    }
    .auth-brand-logo span span {
      color: #0ea5e9 !important;
    }
'''

for filename in ['login.html', 'register.html']:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Insert CSS overrides
    if '/* Auth Form Overrides matching the new design */' not in content:
        content = content.replace('</style>', css_overrides + '\n  </style>')

    # Remove input icons from HTML to match design
    content = re.sub(r'<span class="form-input-icon".*?>.*?</span>', '', content, flags=re.DOTALL)
    
    # We still need the password eye icon? Actually, the design doesn't show one, but it's good UX.
    # The regex above removed all form-input-icons. Let's keep the end icons (eye).
    
    # If the user wants no icons, the form-input CSS padding needs to be reset, because style.css does:
    # .form-input-icon ~ .form-input { padding-inline-start: 2.75rem; }
    # Since we removed the icon, it will fall back to normal padding!
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {filename}")


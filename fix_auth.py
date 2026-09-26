import re

for filename in ['login.html', 'register.html']:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Update CSS for auth-form-wrap
    # register.html
    content = content.replace(
        '.auth-form-wrap {\n      width: 100%;\n      max-width: 440px;\n    }',
        '.auth-form-wrap {\n      width: 100%;\n      max-width: 480px;\n      background: var(--clr-surface);\n      border: 1px solid var(--clr-border);\n      border-radius: var(--radius-lg);\n      padding: var(--sp-8) var(--sp-6);\n      box-shadow: var(--shadow-xl);\n      margin: 0 auto;\n    }'
    )
    # login.html
    content = content.replace(
        '.auth-form-wrap {\n        width: 100%;\n        max-width: 420px;\n      }',
        '.auth-form-wrap {\n        width: 100%;\n        max-width: 480px;\n        background: var(--clr-surface);\n        border: 1px solid var(--clr-border);\n        border-radius: var(--radius-lg);\n        padding: var(--sp-8) var(--sp-6);\n        box-shadow: var(--shadow-xl);\n        margin: 0 auto;\n      }'
    )
    
    # Also adjust form wrap h1, p centering
    content = re.sub(
        r'(\.auth-form-wrap h1 \{)',
        r'\1\n      text-align: center;',
        content
    )
    content = re.sub(
        r'(\.auth-form-wrap > p \{)',
        r'\1\n      text-align: center;',
        content
    )
    
    # 2. Modify Topbar and extract logo
    # We find the topbar section
    topbar_pattern = r'<header class="auth-topbar" aria-label="Brand navigation">(.+?)<div class="auth-topbar__actions">'
    match = re.search(topbar_pattern, content, re.DOTALL)
    
    if match:
        logo_html = match.group(1).strip()
        logo_html = '<div style="display:flex; justify-content:center; margin-bottom: 2rem;">\n            ' + logo_html + '\n          </div>'
        
        # Replace topbar
        content = content.replace(
            '<header class="auth-topbar" aria-label="Brand navigation">',
            '<header class="auth-topbar" aria-label="Brand navigation" style="justify-content: flex-end;">'
        )
        content = content.replace(match.group(1), '\n        ')
        
        # Inject logo into form wrap
        content = content.replace(
            '<div class="auth-form-wrap">\n',
            '<div class="auth-form-wrap">\n          ' + logo_html + '\n'
        )

    # 3. Move Social Buttons to bottom
    # We have to find social buttons and the divider and move them below the form
    social_pattern = r'<!-- Social Buttons -->.*?<div class="form-divider">.*?</div>'
    match_social = re.search(social_pattern, content, re.DOTALL)
    
    if match_social:
        social_html = match_social.group(0)
        # Remove from current location
        content = content.replace(social_html, '')
        
        # Change divider text from 'or register with email' to 'or continue with'
        # Or 'or sign in with email'
        social_html = social_html.replace('or register with email', 'or continue with')
        social_html = social_html.replace('or sign in with email', 'or continue with')
        
        # In social HTML, change the display of buttons wrapper to 1fr 1fr grid
        social_html = social_html.replace(
            '<div style="display:flex;gap:0.625rem;margin-block-end:var(--sp-4);flex-wrap:wrap;">',
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.625rem;margin-block-end:var(--sp-4);">'
        )
        
        # Insert after the form
        content = content.replace(
            '</form>',
            '</form>\n\n        ' + social_html
        )
        
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {filename}")


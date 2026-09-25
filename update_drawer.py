import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

# The pattern to match the entire block from the login link to the end of the drawer__footer
pattern = re.compile(
    r'\s*<a href="login\.html"\s+class="drawer__link"\s+data-nav-link>.*?</nav>\s*<div class="drawer__footer">\s*<a href="register\.html"[^>]*>Get Started(?: Free)?</a>\s*<div class="drawer__controls">(.*?)</div>\s*</div>',
    re.DOTALL
)

replacement = r'''
    </nav>

    <div class="drawer__footer">
      <div class="drawer__controls" style="margin-block-end: 1rem;">\1</div>
      <a href="login.html" class="btn btn--primary btn--full">Login</a>
    </div>'''

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content, count = pattern.subn(replacement, content)
    
    if count > 0:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file}")

$files = Get-ChildItem -Filter *.html
foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw

    # We want to remove the login block from <nav>
    $patternNavLogin = '(?ms)\s*<a href="login\.html"\s+class="drawer__link"\s+data-nav-link>\s*<i class="ri-login-box-line".*?</i> Login\s*</a>'
    $content = $content -replace $patternNavLogin, ''
    
    # We want to replace the "Get Started" button in the footer with the Login button, but we must make sure the controls are ABOVE it.
    # Current structure is usually:
    # <div class="drawer__footer">
    #   <a href="register.html" class="btn btn--primary btn--full">Get Started Free</a>
    #   <div class="drawer__controls">...</div>
    # </div>
    
    $patternFooter = '(?ms)<div class="drawer__footer">\s*<a href="register\.html".*?>(?:Get Started|Get Started Free)</a>\s*(<div class="drawer__controls">.*?</div>)\s*</div>'
    $replacementFooter = '<div class="drawer__footer">
      $1
      <a href="login.html" class="btn btn--primary btn--full" style="margin-block-start: 1rem;">Login</a>
    </div>'
    
    $content = $content -replace $patternFooter, $replacementFooter

    Set-Content -Path $file.FullName -Value $content -NoNewline
    Write-Host "Updated $($file.Name)"
}

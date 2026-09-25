$files = Get-ChildItem -Filter *.html
foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Regex to find the block
    $pattern = '\s*<a href="login\.html"\s+class="drawer__link"\s+data-nav-link>.*?</nav>\s*<div class="drawer__footer">\s*<a href="register\.html"[^>]*>Get Started(?: Free)?</a>\s*<div class="drawer__controls">([\s\S]*?)</div>\s*</div>'
    
    $replacement = '
    </nav>

    <div class="drawer__footer">
      <div class="drawer__controls" style="margin-block-end: 1rem;">$1</div>
      <a href="login.html" class="btn btn--primary btn--full">Login</a>
    </div>'

    if ($content -match $pattern) {
        $content = $content -replace $pattern, $replacement
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated $($file.Name)"
    }
}

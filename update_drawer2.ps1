$files = Get-ChildItem -Filter *.html
foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Try an exact text replacement, because the block is mostly identical except maybe Get Started vs Get Started Free
    
    $search1 = @"
      <a href="login.html" class="drawer__link" data-nav-link>
        <i class="ri-login-box-line" aria-hidden="true"></i> Login
      </a>
    </nav>

    <div class="drawer__footer">
      <a href="register.html" class="btn btn--primary btn--full">Get Started Free</a>
"@

    $search2 = @"
      <a href="login.html" class="drawer__link" data-nav-link>
        <i class="ri-login-box-line" aria-hidden="true"></i> Login
      </a>
    </nav>

    <div class="drawer__footer">
      <a href="register.html" class="btn btn--primary btn--full">Get Started</a>
"@

    $replace = @"
    </nav>

    <div class="drawer__footer">
"@

    if ($content.Contains($search1) -or $content.Contains($search2)) {
        $content = $content.Replace($search1, $replace).Replace($search2, $replace)
        
        # Now we need to move the Login button to the bottom of drawer__footer.
        # So we replace `    </div>\n  </div>\n\n  <main` with `      <a href="login.html" class="btn btn--primary btn--full" style="margin-block-start: 1rem;">Login</a>\n    </div>\n  </div>\n\n  <main`
        
        $footerEnd = @"
    </div>
  </div>

  <main
"@
        
        $footerEndNew = @"
      <a href="login.html" class="btn btn--primary btn--full" style="margin-block-start: 1rem;">Login</a>
    </div>
  </div>

  <main
"@
        $content = $content.Replace($footerEnd, $footerEndNew)
        
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated $($file.Name)"
    }
}

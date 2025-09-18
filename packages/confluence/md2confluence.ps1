<#
.SYNOPSIS
    Converts Markdown to Confluence-compatible HTML with full Unicode support.
.DESCRIPTION
    Uses Pandoc to convert Markdown to HTML with UTF-8 encoding, then formats it for Confluence
    with proper headers, code blocks, and tables. Copies to clipboard in both HTML and plain text formats.
.PARAMETER Path
    Path to the Markdown file to convert
.EXAMPLE
    .\md2confluence.ps1 -Path "C:\docs\mydoc.md"
#>
param(
    [Parameter(Mandatory=$true)]
    [string]$Path
)

# Check if Pandoc is installed
if (-not (Get-Command pandoc -ErrorAction SilentlyContinue)) {
    Write-Error "Pandoc is not installed or not in PATH. Please install Pandoc first."
    exit 1
}

# Check if file exists
if (-not (Test-Path $Path)) {
    Write-Error "File not found: $Path"
    exit 1
}

try {
    # Load required assemblies
    Add-Type -AssemblyName System.Windows.Forms
    
    # Read markdown file with UTF-8 encoding
    $markdown = [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)

    # Convert to HTML using Pandoc with UTF-8 encoding
    $html = pandoc -f markdown -t html --self-contained --embed-resources --ascii $Path | Out-String
    
    # Add UTF-8 meta tag to HTML if not present
    if ($html -notmatch '<meta charset="utf-8"') {
        $html = $html -replace '<head>', '<head><meta charset="utf-8">'
    }

    # Prepare HTML for Confluence clipboard format
    $htmlFragment = $html
    $fullHtml = @"
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body>
<!--StartFragment-->
$htmlFragment
<!--EndFragment-->
</body>
</html>
"@

    # Prepare clipboard header with byte offsets
    $encoding = [System.Text.Encoding]::UTF8
    $headerTemplate = @"
Version:1.0
StartHTML:0000000000
EndHTML:0000000000
StartFragment:0000000000
EndFragment:0000000000
"@

    # Calculate byte offsets
    $headerBytes = $encoding.GetBytes($headerTemplate)
    $fullHtmlBytes = $encoding.GetBytes($fullHtml)
    
    $startHtml = $headerBytes.Length
    $endHtml = $startHtml + $fullHtmlBytes.Length
    $startFragment = $startHtml + $encoding.GetBytes("<!DOCTYPE html>`n<html>`n<head>`n    <meta charset=`"utf-8`">`n</head>`n<body>`n<!--StartFragment-->").Length
    $endFragment = $startFragment + $encoding.GetBytes($htmlFragment).Length

    # Build final header with correct offsets
    $header = "Version:1.0`r`n"
    $header += "StartHTML:{0:D10}`r`n" -f $startHtml
    $header += "EndHTML:{0:D10}`r`n" -f $endHtml
    $header += "StartFragment:{0:D10}`r`n" -f $startFragment
    $header += "EndFragment:{0:D10}`r`n" -f $endFragment

    # Combine header and HTML
    $htmlClipboardString = $header + $fullHtml
    $htmlBytes = $encoding.GetBytes($htmlClipboardString)

    # Create clipboard data object
    $dataObject = New-Object System.Windows.Forms.DataObject
    $dataObject.SetText($markdown, [System.Windows.Forms.TextDataFormat]::UnicodeText)  # Unicode text fallback
    $dataObject.SetData("HTML Format", $htmlBytes)  # HTML format

    # Set clipboard
    [System.Windows.Forms.Clipboard]::SetDataObject($dataObject)

    Write-Host "Successfully converted and copied to clipboard!" -ForegroundColor Green
    Write-Host "Paste directly into Confluence (Ctrl+V)" -ForegroundColor Yellow
    Write-Host "For code blocks: Select pasted code > Ctrl+Shift+C" -ForegroundColor Yellow
    Write-Host "For headers: Select text > Apply header style from toolbar" -ForegroundColor Yellow
}
catch {
    Write-Error "Error: $_"
    exit 1
}

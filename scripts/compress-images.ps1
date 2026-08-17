Add-Type -AssemblyName System.Drawing

$maxDim = 2000
$jpegQuality = 82

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$pngCodec  = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/png' }

$jpegParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$jpegParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [int64]$jpegQuality)

$root = "C:\Users\MargauxLOPES\CrMQ\images"
$files = Get-ChildItem -Path $root -Recurse -Include *.jpg,*.jpeg,*.png

$totalBefore = 0
$totalAfter = 0

foreach ($f in $files) {
    $before = (Get-Item $f.FullName).Length
    $totalBefore += $before

    $img = [System.Drawing.Image]::FromFile($f.FullName)
    $w = $img.Width
    $h = $img.Height

    $scale = 1.0
    if ($w -gt $maxDim -or $h -gt $maxDim) {
        if ($w -ge $h) { $scale = $maxDim / $w } else { $scale = $maxDim / $h }
    }

    $newW = [int]([math]::Round($w * $scale))
    $newH = [int]([math]::Round($h * $scale))

    $bmp = New-Object System.Drawing.Bitmap($newW, $newH)
    $bmp.SetResolution($img.HorizontalResolution, $img.VerticalResolution)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.DrawImage($img, 0, 0, $newW, $newH)
    $g.Dispose()
    $img.Dispose()

    $tmpPath = $f.FullName + ".tmp"
    $ext = $f.Extension.ToLower()
    if ($ext -eq '.png') {
        $bmp.Save($tmpPath, $pngCodec, $null)
    } else {
        $bmp.Save($tmpPath, $jpegCodec, $jpegParams)
    }
    $bmp.Dispose()

    Remove-Item $f.FullName -Force
    Rename-Item $tmpPath $f.FullName

    $after = (Get-Item $f.FullName).Length
    $totalAfter += $after

    "{0} : {1:N1} MB -> {2:N1} MB ({3}x{4} -> {5}x{6})" -f $f.Name, ($before/1MB), ($after/1MB), $w, $h, $newW, $newH
}

"---"
"TOTAL: {0:N1} MB -> {1:N1} MB" -f ($totalBefore/1MB), ($totalAfter/1MB)

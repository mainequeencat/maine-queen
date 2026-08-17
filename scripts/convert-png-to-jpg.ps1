Add-Type -AssemblyName System.Drawing

$maxDim = 2000
$jpegQuality = 82

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$jpegParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$jpegParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [int64]$jpegQuality)

$paths = @(
    "C:\Users\MargauxLOPES\CrMQ\images\reproducteurs\aslan.png",
    "C:\Users\MargauxLOPES\CrMQ\images\reproducteurs\azura.png",
    "C:\Users\MargauxLOPES\CrMQ\images\reproducteurs\tyra.png",
    "C:\Users\MargauxLOPES\CrMQ\images\reproducteurs\ysis.png",
    "C:\Users\MargauxLOPES\CrMQ\images\chatterie\contact-chaton-2.png",
    "C:\Users\MargauxLOPES\CrMQ\images\chatterie\portee-nouveaux-nes.png",
    "C:\Users\MargauxLOPES\CrMQ\images\chatons\portee-03\portee-03-photo-07.png",
    "C:\Users\MargauxLOPES\CrMQ\images\chatons\portee-03\portee-03-photo-08.png",
    "C:\Users\MargauxLOPES\CrMQ\images\chatons\portee-03\portee-03-photo-09.png",
    "C:\Users\MargauxLOPES\CrMQ\images\chatons\portee-03\portee-03-photo-10.png",
    "C:\Users\MargauxLOPES\CrMQ\images\chatons\portee-03\portee-03-photo-11.png",
    "C:\Users\MargauxLOPES\CrMQ\images\chatons\portee-03\portee-03-photo-12.png"
)

$totalBefore = 0
$totalAfter = 0

foreach ($p in $paths) {
    $before = (Get-Item $p).Length
    $totalBefore += $before

    $img = [System.Drawing.Image]::FromFile($p)
    $w = $img.Width
    $h = $img.Height

    $scale = 1.0
    if ($w -gt $maxDim -or $h -gt $maxDim) {
        if ($w -ge $h) { $scale = $maxDim / $w } else { $scale = $maxDim / $h }
    }
    $newW = [int]([math]::Round($w * $scale))
    $newH = [int]([math]::Round($h * $scale))

    $bmp = New-Object System.Drawing.Bitmap($newW, $newH)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    # flatten onto white in case of any alpha
    $g.Clear([System.Drawing.Color]::White)
    $g.DrawImage($img, 0, 0, $newW, $newH)
    $g.Dispose()
    $img.Dispose()

    $jpgPath = [System.IO.Path]::ChangeExtension($p, ".jpg")
    $bmp.Save($jpgPath, $jpegCodec, $jpegParams)
    $bmp.Dispose()

    Remove-Item $p -Force

    $after = (Get-Item $jpgPath).Length
    $totalAfter += $after

    "{0} -> {1} : {2:N1} MB -> {3:N1} MB" -f (Split-Path $p -Leaf), (Split-Path $jpgPath -Leaf), ($before/1MB), ($after/1MB)
}

"---"
"TOTAL: {0:N1} MB -> {1:N1} MB" -f ($totalBefore/1MB), ($totalAfter/1MB)

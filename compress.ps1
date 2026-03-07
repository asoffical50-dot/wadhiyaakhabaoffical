Add-Type -AssemblyName System.Drawing

function Optimize-Image {
    param($Path, $MaxWidth = 1000, $Quality = 60)
    
    $fullPath = Resolve-Path $Path
    $img = [System.Drawing.Image]::FromFile($fullPath)
    
    # Calculate new size
    $ratio = $img.Width / $img.Height
    if ($img.Width -gt $MaxWidth) {
        $newWidth = $MaxWidth
        $newHeight = [int]($MaxWidth / $ratio)
    } else {
        $newWidth = $img.Width
        $newHeight = $img.Height
    }
    
    $newImg = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
    $g = [System.Drawing.Graphics]::FromImage($newImg)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($img, 0, 0, $newWidth, $newHeight)
    
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $Quality)
    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    
    $tempPath = $fullPath.ToString() + ".tmp"
    $newImg.Save($tempPath, $codec, $encoderParams)
    
    $img.Dispose()
    $newImg.Dispose()
    $g.Dispose()
    
    Move-Item -Path $tempPath -Destination $fullPath -Force
    Write-Host "Optimized: $Path"
}

$images = @("Pack of 6 Vegetable Samosa.jpg", "Pack of 6 Vegetable Roll.jpg")
foreach ($img in $images) {
    if (Test-Path $img) {
        Optimize-Image -Path $img
    }
}

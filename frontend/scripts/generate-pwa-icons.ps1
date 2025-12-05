# Script de génération des icônes PWA pour SolidarLink
# Utilise sharp-cli ou un outil en ligne

Write-Host "📱 Génération des icônes PWA pour SolidarLink" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

$publicPath = "c:\Users\PC\Desktop\Grain\projet\frontend\public"
$iconsPath = "$publicPath\icons"

# Liste des icônes à générer
$icons = @(
    @{ name = "icon-72x72.png"; size = 72 },
    @{ name = "icon-96x96.png"; size = 96 },
    @{ name = "icon-128x128.png"; size = 128 },
    @{ name = "icon-144x144.png"; size = 144 },
    @{ name = "icon-152x152.png"; size = 152 },
    @{ name = "icon-192x192.png"; size = 192 },
    @{ name = "icon-384x384.png"; size = 384 },
    @{ name = "icon-512x512.png"; size = 512 },
    @{ name = "icon-maskable-192x192.png"; size = 192 },
    @{ name = "icon-maskable-512x512.png"; size = 512 },
    @{ name = "apple-touch-icon.png"; size = 180 },
    @{ name = "apple-touch-icon-180x180.png"; size = 180 },
    @{ name = "apple-touch-icon-167x167.png"; size = 167 },
    @{ name = "favicon-32x32.png"; size = 32 },
    @{ name = "favicon-16x16.png"; size = 16 },
    @{ name = "shortcut-add.png"; size = 96 },
    @{ name = "shortcut-map.png"; size = 96 }
)

Write-Host ""
Write-Host "📁 Dossier des icônes: $iconsPath" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔧 Icônes à créer:" -ForegroundColor Green

foreach ($icon in $icons) {
    Write-Host "   - $($icon.name) ($($icon.size)x$($icon.size))" -ForegroundColor White
}

Write-Host ""
Write-Host "📌 INSTRUCTIONS:" -ForegroundColor Magenta
Write-Host "================" -ForegroundColor Magenta
Write-Host ""
Write-Host "Option 1 - Utiliser un générateur en ligne (RECOMMANDÉ):" -ForegroundColor Cyan
Write-Host "   1. Allez sur https://www.pwabuilder.com/imageGenerator" -ForegroundColor White
Write-Host "   2. Uploadez votre logo (512x512 minimum, PNG)" -ForegroundColor White
Write-Host "   3. Téléchargez le ZIP et extrayez dans: $iconsPath" -ForegroundColor White
Write-Host ""
Write-Host "Option 2 - Utiliser RealFaviconGenerator:" -ForegroundColor Cyan
Write-Host "   1. Allez sur https://realfavicongenerator.net/" -ForegroundColor White
Write-Host "   2. Uploadez votre logo" -ForegroundColor White
Write-Host "   3. Configurez les options PWA" -ForegroundColor White
Write-Host "   4. Téléchargez et extrayez" -ForegroundColor White
Write-Host ""
Write-Host "Option 3 - Utiliser sharp-cli (Node.js):" -ForegroundColor Cyan
Write-Host "   npm install -g sharp-cli" -ForegroundColor White
Write-Host "   sharp -i source-logo.png -o icon-192x192.png resize 192 192" -ForegroundColor White
Write-Host ""
Write-Host "✅ Une fois les icônes générées, relancez 'npm run build'" -ForegroundColor Green

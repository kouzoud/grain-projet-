/**
 * Script de conversion des images existantes en WebP
 * Usage: node scripts/convert-to-webp.js
 */
import sharp from 'sharp';
import path from 'path';
import { glob } from 'glob';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  inputDir: './src/assets',
  outputDir: './src/assets',
  supportedFormats: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff'],
  webpQuality: 85,
  preserveOriginal: true,
  generateSizes: [400, 800, 1200, 1920], // Tailles responsive
  skipExisting: true
};

/**
 * Convertit une image en WebP avec plusieurs tailles
 */
async function convertImage(inputPath, outputPath) {
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    console.log(`Conversion de ${inputPath}...`);
    
    // Conversion principale
    await image
      .webp({ 
        quality: CONFIG.webpQuality,
        effort: 6 // Meilleur compression
      })
      .toFile(outputPath);
    
    // Générer les versions responsive
    const baseName = path.parse(outputPath).name;
    const dir = path.dirname(outputPath);
    
    for (const size of CONFIG.generateSizes) {
      if (metadata.width > size) {
        const responsivePath = path.join(dir, `${baseName}-${size}w.webp`);
        await image
          .resize(size, null, { 
            withoutEnlargement: true,
            fastShrinkOnLoad: false 
          })
          .webp({ quality: CONFIG.webpQuality, effort: 6 })
          .toFile(responsivePath);
        
        console.log(`  → ${baseName}-${size}w.webp créé`);
      }
    }
    
    return {
      success: true,
      originalSize: (await fs.stat(inputPath)).size,
      webpSize: (await fs.stat(outputPath)).size
    };
    
  } catch (error) {
    console.error(`Erreur lors de la conversion de ${inputPath}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Trouve toutes les images à convertir
 */
async function findImages() {
  const patterns = CONFIG.supportedFormats.map(ext => 
    `${CONFIG.inputDir}/**/*.${ext}`
  );
  
  const allFiles = [];
  for (const pattern of patterns) {
    const files = await glob(pattern, { ignore: '**/node_modules/**' });
    allFiles.push(...files);
  }
  
  return [...new Set(allFiles)]; // Supprime les doublons
}

/**
 * Génère un rapport de conversion
 */
function generateReport(results) {
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  const totalOriginalSize = successful.reduce((acc, r) => acc + r.originalSize, 0);
  const totalWebpSize = successful.reduce((acc, r) => acc + r.webpSize, 0);
  const savings = totalOriginalSize - totalWebpSize;
  const savingsPercent = ((savings / totalOriginalSize) * 100).toFixed(1);
  
  console.log('\n📊 RAPPORT DE CONVERSION WebP');
  console.log('═'.repeat(50));
  console.log(`✅ Images converties: ${successful.length}`);
  console.log(`❌ Échecs: ${failed.length}`);
  console.log(`💾 Taille originale: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📦 Taille WebP: ${(totalWebpSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`🎯 Économie: ${(savings / 1024 / 1024).toFixed(2)} MB (${savingsPercent}%)`);
  
  if (failed.length > 0) {
    console.log('\n❌ ÉCHECS:');
    failed.forEach(f => console.log(`  • ${f.path}: ${f.error}`));
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🚀 Démarrage de la conversion WebP...');
  console.log(`📁 Dossier d'entrée: ${CONFIG.inputDir}`);
  console.log(`📁 Dossier de sortie: ${CONFIG.outputDir}`);
  console.log(`🎛️  Qualité WebP: ${CONFIG.webpQuality}`);
  
  try {
    // Créer le dossier de sortie si nécessaire
    await fs.mkdir(CONFIG.outputDir, { recursive: true });
    
    // Trouver toutes les images
    const images = await findImages();
    console.log(`\n📸 ${images.length} images trouvées`);
    
    if (images.length === 0) {
      console.log('Aucune image à convertir.');
      return;
    }
    
    // Convertir chaque image
    const results = [];
    for (let i = 0; i < images.length; i++) {
      const inputPath = images[i];
      const relativePath = path.relative(CONFIG.inputDir, inputPath);
      const parsedPath = path.parse(relativePath);
      const outputPath = path.join(
        CONFIG.outputDir,
        parsedPath.dir,
        `${parsedPath.name}.webp`
      );
      
      // Vérifier si le fichier WebP existe déjà
      if (CONFIG.skipExisting) {
        try {
          await fs.access(outputPath);
          console.log(`⏭️  Ignoré (existe déjà): ${outputPath}`);
          continue;
        } catch (error) {
          // Le fichier n'existe pas, on continue
        }
      }
      
      console.log(`\n[${i + 1}/${images.length}] Traitement en cours...`);
      const result = await convertImage(inputPath, outputPath);
      results.push({ ...result, path: inputPath });
    }
    
    // Générer le rapport
    generateReport(results);
    
    console.log('\n✨ Conversion terminée !');
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }
}

// Gestion des arguments de ligne de commande
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: node scripts/convert-to-webp.js [options]

Options:
  --quality [number]     Qualité WebP (1-100, défaut: 85)
  --no-preserve         Ne pas conserver les fichiers originaux
  --overwrite           Écraser les fichiers WebP existants
  --sizes [list]        Tailles responsive (ex: --sizes 400,800,1200)
  --help, -h            Afficher cette aide

Exemples:
  node scripts/convert-to-webp.js
  node scripts/convert-to-webp.js --quality 90 --overwrite
  node scripts/convert-to-webp.js --sizes 400,800,1200,1920
`);
  process.exit(0);
}

// Appliquer les arguments
if (args.includes('--quality')) {
  const qualityIndex = args.indexOf('--quality') + 1;
  const quality = parseInt(args[qualityIndex]);
  if (quality >= 1 && quality <= 100) {
    CONFIG.webpQuality = quality;
  }
}

if (args.includes('--no-preserve')) {
  CONFIG.preserveOriginal = false;
}

if (args.includes('--overwrite')) {
  CONFIG.skipExisting = false;
}

if (args.includes('--sizes')) {
  const sizesIndex = args.indexOf('--sizes') + 1;
  const sizes = args[sizesIndex].split(',').map(s => parseInt(s.trim()));
  CONFIG.generateSizes = sizes.filter(s => !isNaN(s));
}

// Exécuter le script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { convertImage, findImages, CONFIG };
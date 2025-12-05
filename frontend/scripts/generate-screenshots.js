/**
 * Script de génération des screenshots PWA pour SolidarLink
 * Usage: node scripts/generate-screenshots.js
 */

import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const screenshotsPath = join(__dirname, '..', 'public', 'screenshots');

const createScreenshotSVG = (width, height, label) => {
  return Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0f172a"/>
          <stop offset="100%" style="stop-color:#1e293b"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
      
      <!-- Header -->
      <rect x="0" y="0" width="${width}" height="${height * 0.08}" fill="#1e293b"/>
      <circle cx="${width * 0.05}" cy="${height * 0.04}" r="${Math.min(width, height) * 0.02}" fill="#06b6d4"/>
      <text x="${width * 0.1}" y="${height * 0.05}" fill="#06b6d4" font-family="Arial" font-size="${Math.min(width, height) * 0.025}" font-weight="bold">SolidarLink</text>
      
      <!-- Main Content -->
      <text x="${width/2}" y="${height * 0.3}" text-anchor="middle" fill="white" font-family="Arial" font-size="${Math.min(width, height) * 0.05}" font-weight="bold">Bienvenue sur SolidarLink</text>
      <text x="${width/2}" y="${height * 0.38}" text-anchor="middle" fill="#94a3b8" font-family="Arial" font-size="${Math.min(width, height) * 0.025}">Plateforme d'entraide humanitaire</text>
      
      <!-- Cards -->
      <rect x="${width * 0.05}" y="${height * 0.45}" width="${width * 0.42}" height="${height * 0.2}" rx="12" fill="#1e293b"/>
      <circle cx="${width * 0.15}" cy="${height * 0.52}" r="${Math.min(width, height) * 0.03}" fill="#22c55e"/>
      <text x="${width * 0.15}" y="${height * 0.6}" text-anchor="middle" fill="white" font-family="Arial" font-size="${Math.min(width, height) * 0.02}">Bénévoles</text>
      
      <rect x="${width * 0.53}" y="${height * 0.45}" width="${width * 0.42}" height="${height * 0.2}" rx="12" fill="#1e293b"/>
      <circle cx="${width * 0.63}" cy="${height * 0.52}" r="${Math.min(width, height) * 0.03}" fill="#06b6d4"/>
      <text x="${width * 0.63}" y="${height * 0.6}" text-anchor="middle" fill="white" font-family="Arial" font-size="${Math.min(width, height) * 0.02}">Missions</text>
      
      <!-- Button -->
      <rect x="${width * 0.25}" y="${height * 0.75}" width="${width * 0.5}" height="${height * 0.08}" rx="24" fill="#06b6d4"/>
      <text x="${width/2}" y="${height * 0.8}" text-anchor="middle" fill="white" font-family="Arial" font-size="${Math.min(width, height) * 0.025}" font-weight="bold">Je veux aider</text>
      
      <!-- Label -->
      <text x="${width/2}" y="${height * 0.95}" text-anchor="middle" fill="#475569" font-family="Arial" font-size="${Math.min(width, height) * 0.015}">${label}</text>
    </svg>
  `);
};

async function generateScreenshots() {
  console.log('📸 Génération des screenshots PWA...\n');

  // Mobile screenshot
  const mobileSVG = createScreenshotSVG(390, 844, 'Vue Mobile');
  await sharp(mobileSVG)
    .png()
    .toFile(join(screenshotsPath, 'screenshot-mobile.png'));
  console.log('✅ screenshot-mobile.png (390x844)');

  // Desktop screenshot
  const desktopSVG = createScreenshotSVG(1920, 1080, 'Vue Desktop');
  await sharp(desktopSVG)
    .png()
    .toFile(join(screenshotsPath, 'screenshot-desktop.png'));
  console.log('✅ screenshot-desktop.png (1920x1080)');

  console.log('\n🎉 Screenshots générés avec succès!');
}

generateScreenshots().catch(console.error);

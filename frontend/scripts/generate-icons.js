/**
 * Script de génération des icônes PWA pour SolidarLink
 * Usage: node scripts/generate-icons.js
 */

import sharp from 'sharp';
import { mkdir, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const publicPath = join(__dirname, '..', 'public');
const iconsPath = join(publicPath, 'icons');
const splashPath = join(publicPath, 'splash');
const screenshotsPath = join(publicPath, 'screenshots');

// Créer le SVG source comme buffer
const createLogoSVG = (size, maskable = false) => {
  const padding = maskable ? size * 0.1 : 0;
  const innerSize = size - (padding * 2);
  const scale = innerSize / 512;
  
  return Buffer.from(`
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${maskable ? '#0f172a' : 'transparent'}"/>
      <g transform="translate(${padding}, ${padding}) scale(${scale})">
        <rect width="512" height="512" rx="64" fill="#0f172a"/>
        <circle cx="256" cy="180" r="70" fill="#06b6d4"/>
        <path d="M256 270 C 190 270, 140 320, 140 380 L 372 380 C 372 320, 322 270, 256 270" fill="#06b6d4"/>
        <circle cx="330" cy="320" r="50" fill="#22c55e"/>
        <path d="M308 320 L325 337 L355 302" stroke="white" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </g>
    </svg>
  `);
};

// Configuration des icônes à générer
const iconConfigs = [
  { name: 'icon-72x72.png', size: 72 },
  { name: 'icon-96x96.png', size: 96 },
  { name: 'icon-128x128.png', size: 128 },
  { name: 'icon-144x144.png', size: 144 },
  { name: 'icon-152x152.png', size: 152 },
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-384x384.png', size: 384 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'icon-maskable-192x192.png', size: 192, maskable: true },
  { name: 'icon-maskable-512x512.png', size: 512, maskable: true },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'apple-touch-icon-180x180.png', size: 180 },
  { name: 'apple-touch-icon-167x167.png', size: 167 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-16x16.png', size: 16 },
];

// Icônes de raccourcis
const shortcutConfigs = [
  { name: 'shortcut-add.png', size: 96, color: '#22c55e', icon: 'plus' },
  { name: 'shortcut-map.png', size: 96, color: '#8b5cf6', icon: 'map' },
];

const createShortcutSVG = (size, color, iconType) => {
  const iconPath = iconType === 'plus' 
    ? `<path d="M${size/2} ${size/4} L${size/2} ${size*3/4} M${size/4} ${size/2} L${size*3/4} ${size/2}" stroke="white" stroke-width="${size/10}" stroke-linecap="round"/>`
    : `<circle cx="${size/2}" cy="${size/2}" r="${size/4}" stroke="white" stroke-width="${size/16}" fill="none"/><circle cx="${size/2}" cy="${size/2}" r="${size/12}" fill="white"/>`;
  
  return Buffer.from(`
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${size/6}" fill="${color}"/>
      ${iconPath}
    </svg>
  `);
};

async function generateIcons() {
  console.log('🎨 Génération des icônes PWA pour SolidarLink...\n');

  // Générer les icônes principales
  for (const config of iconConfigs) {
    const svg = createLogoSVG(config.size, config.maskable);
    const outputPath = join(iconsPath, config.name);
    
    await sharp(svg)
      .resize(config.size, config.size)
      .png()
      .toFile(outputPath);
    
    console.log(`✅ ${config.name} (${config.size}x${config.size})`);
  }

  // Générer les icônes de raccourcis
  for (const config of shortcutConfigs) {
    const svg = createShortcutSVG(config.size, config.color, config.icon);
    const outputPath = join(iconsPath, config.name);
    
    await sharp(svg)
      .resize(config.size, config.size)
      .png()
      .toFile(outputPath);
    
    console.log(`✅ ${config.name} (${config.size}x${config.size})`);
  }

  // Générer favicon.ico (copie de 32x32)
  const favicon32 = createLogoSVG(32);
  await sharp(favicon32)
    .resize(32, 32)
    .png()
    .toFile(join(publicPath, 'favicon.ico'));
  console.log('✅ favicon.ico');

  console.log('\n🎉 Toutes les icônes ont été générées avec succès!');
}

generateIcons().catch(console.error);

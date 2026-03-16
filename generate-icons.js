const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputFile = path.join(__dirname, 'public', 'logo.png');
const outputDir = path.join(__dirname, 'public', 'icons');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
    for (const size of sizes) {
        await sharp(inputFile)
            .resize(size, size, { fit: 'contain', background: { r: 8, g: 14, b: 26, alpha: 1 } })
            .png()
            .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
        console.log(`Generated icon-${size}x${size}.png`);
    }

    // Maskable icon (with padding for safe zone - 80% of the size is the icon)
    await sharp(inputFile)
        .resize(410, 410, { fit: 'contain', background: { r: 8, g: 14, b: 26, alpha: 1 } })
        .extend({
            top: 51, bottom: 51, left: 51, right: 51,
            background: { r: 8, g: 14, b: 26, alpha: 1 }
        })
        .png()
        .toFile(path.join(outputDir, 'maskable-512x512.png'));
    console.log('Generated maskable-512x512.png');

    console.log('All icons generated!');
}

generateIcons();

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Function to create an SVG with emoji text
function createPineappleSVG(size) {
  const fontSize = Math.floor(size * 0.7);
  const y = Math.floor(size * 0.75); // Adjust vertical position

  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="white"/>
      <text x="50%" y="${y}" font-size="${fontSize}" text-anchor="middle" dominant-baseline="middle">🍍</text>
    </svg>
  `;
}

async function generateIcons() {
  const sizes = [192, 512];
  const iconsDir = path.join(__dirname, 'public', 'icons');

  // Ensure icons directory exists
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  for (const size of sizes) {
    const svg = createPineappleSVG(size);
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);

    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);

    console.log(`✓ Generated ${outputPath}`);
  }

  console.log('\n🍍 All pineapple icons generated successfully!');
}

generateIcons().catch(console.error);


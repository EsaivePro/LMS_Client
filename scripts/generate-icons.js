const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const projectRoot = path.join(__dirname, '..');
const logoDir = path.join(projectRoot, 'public', 'logo');
const inputFile = path.join(logoDir, 'EsaiLogo.png');

if (!fs.existsSync(inputFile)) {
    console.error('Source logo not found at', inputFile);
    process.exit(1);
}

const outputs = [
    { size: 192, name: 'EsaiLogo-192.png' },
    { size: 512, name: 'EsaiLogo-512.png' },
];

Promise.all(
    outputs.map(o =>
        sharp(inputFile)
            .resize(o.size, o.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toFile(path.join(logoDir, o.name))
    )
)
    .then(() => {
        console.log('Generated icons:', outputs.map(o => o.name).join(', '));
    })
    .catch(err => {
        console.error('Error generating icons:', err);
        process.exit(1);
    });

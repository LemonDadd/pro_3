import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createPNG(width, height, r, g, b, pattern = 'book') {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function createChunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);
    const typeBuffer = Buffer.from(type, 'ascii');
    const crcData = Buffer.concat([typeBuffer, data]);
    const crc = Buffer.alloc(4);
    let crcVal = 0xffffffff;
    for (let i = 0; i < crcData.length; i++) {
      crcVal ^= crcData[i];
      for (let j = 0; j < 8; j++) {
        if (crcVal & 1) crcVal = (crcVal >>> 1) ^ 0xedb88320;
        else crcVal = crcVal >>> 1;
      }
    }
    crcVal ^= 0xffffffff;
    crc.writeUInt32BE(crcVal >>> 0, 0);
    return Buffer.concat([length, typeBuffer, data, crc]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const rawData = [];
  const cx = width / 2;
  const cy = height / 2;

  for (let y = 0; y < height; y++) {
    rawData.push(0);
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = width * 0.38;
      
      if (dist < radius) {
        const nx = dx / radius;
        const ny = dy / radius;
        const light = 1 - (nx * 0.3 + ny * 0.2);
        rawData.push(
          Math.min(255, Math.floor(255 * light)),
          Math.min(255, Math.floor(200 * light)),
          Math.min(255, Math.floor(120 * light)),
          255
        );
      } else {
        rawData.push(r, g, b, 255);
      }
    }
  }

  const rawBuffer = Buffer.from(rawData);
  const compressed = zlib.deflateSync(rawBuffer);

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const iconsDir = path.join(__dirname, 'src-tauri', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const sizes = [
  { size: 32, name: '32x32.png' },
  { size: 128, name: '128x128.png' },
  { size: 256, name: '128x128@2x.png' },
  { size: 256, name: 'icon.png' },
];

sizes.forEach(({ size, name }) => {
  const png = createPNG(size, size, 30, 120, 200);
  fs.writeFileSync(path.join(iconsDir, name), png);
  console.log('Created:', name);
});

function createICNS(pngBuffer, size) {
  const iconTypes = {
    16: 'icp4',
    32: 'icp5',
    64: 'icp6',
    128: 'ic07',
    256: 'ic08',
    512: 'ic09',
  };

  const type = iconTypes[size] || 'ic07';
  const typeBuffer = Buffer.from(type, 'ascii');
  const dataLength = pngBuffer.length + 8;
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32BE(dataLength, 0);
  
  return Buffer.concat([typeBuffer, lengthBuffer, pngBuffer]);
}

const icnsSizes = [16, 32, 64, 128, 256, 512];
const icnsEntries = [];

for (const size of icnsSizes) {
  const png = createPNG(size, size, 30, 120, 200);
  icnsEntries.push(createICNS(png, size));
}

const icnsData = Buffer.concat(icnsEntries);
const icnsHeader = Buffer.alloc(8);
icnsHeader.write('icns', 0, 'ascii');
icnsHeader.writeUInt32BE(icnsData.length + 8, 4);

const icnsFile = Buffer.concat([icnsHeader, icnsData]);
fs.writeFileSync(path.join(iconsDir, 'icon.icns'), icnsFile);
console.log('Created: icon.icns');

function createICO(pngBuffer) {
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0);
  icoHeader.writeUInt16LE(1, 2);
  icoHeader.writeUInt16LE(1, 4);

  const iconDir = Buffer.alloc(16);
  iconDir.writeUInt8(32, 0);
  iconDir.writeUInt8(32, 1);
  iconDir.writeUInt8(0, 2);
  iconDir.writeUInt8(0, 3);
  iconDir.writeUInt16LE(1, 4);
  iconDir.writeUInt16LE(32, 6);
  iconDir.writeUInt32LE(pngBuffer.length, 8);
  iconDir.writeUInt32LE(22, 12);

  return Buffer.concat([icoHeader, iconDir, pngBuffer]);
}

const icon32 = createPNG(32, 32, 30, 120, 200);
const icoFile = createICO(icon32);
fs.writeFileSync(path.join(iconsDir, 'icon.ico'), icoFile);
console.log('Created: icon.ico');

console.log('\nAll icons created successfully!');

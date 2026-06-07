const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPNG(width, height) {
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
  const radius = width * 0.35;

  for (let y = 0; y < height; y++) {
    rawData.push(0);
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < radius) {
        rawData.push(255, 255, 255, 255);
      } else {
        rawData.push(30, 120, 200, 255);
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

const iconsDir = 'src-tauri/icons';

const sizes = [32, 128, 256];
const names = ['32x32.png', '128x128.png', '128x128@2x.png'];

sizes.forEach((size, i) => {
  const png = createPNG(size, size);
  fs.writeFileSync(path.join(iconsDir, names[i]), png);
  console.log('Created:', names[i]);
});

console.log('Icons created successfully');

import { createCanvas } from 'canvas';
import fs from 'fs';

function generateTexture(colors, filename, pattern = 'noise') {
  const canvas = createCanvas(16, 16);
  const ctx = canvas.getContext('2d');
  
  // Base color
  ctx.fillStyle = colors.base;
  ctx.fillRect(0, 0, 16, 16);
  
  if (pattern === 'noise') {
    // Random noise pattern
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        if (Math.random() < 0.4) {
          ctx.fillStyle = colors.noise;
          ctx.fillRect(x, y, 1, 1);
        }
        if (Math.random() < 0.1) {
          ctx.fillStyle = colors.highlight;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  } else if (pattern === 'grass') {
    // Grass pattern with small clusters
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        const noise = Math.sin(x * 0.5) * Math.cos(y * 0.5) + Math.random() * 0.5;
        if (noise > 0.5) {
          ctx.fillStyle = colors.noise;
          ctx.fillRect(x, y, 1, 1);
          // Add highlights on top
          if (Math.random() < 0.3) {
            ctx.fillStyle = colors.highlight;
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    }
  } else if (pattern === 'stone') {
    // Stone pattern with cracks
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        const crack = Math.sin(x * 0.8 + y * 0.3) * Math.cos(y * 0.8 + x * 0.3);
        if (crack > 0.7 || Math.random() < 0.2) {
          ctx.fillStyle = colors.noise;
          ctx.fillRect(x, y, 1, 1);
        }
        if (crack > 0.8) {
          ctx.fillStyle = colors.highlight;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  }
  
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`public/textures/${filename}`, buffer);
}

// Generate dirt texture - warmer, richer colors
generateTexture(
  { 
    base: '#8B4513',      // Saddle brown
    noise: '#654321',     // Darker brown
    highlight: '#A0522D'  // Sienna (lighter accent)
  },
  'dirt.png',
  'noise'
);

// Generate grass texture - more varied greens
generateTexture(
  {
    base: '#4CAF50',      // Material green
    noise: '#388E3C',     // Darker green
    highlight: '#81C784'  // Light green highlights
  },
  'grass.png',
  'grass'
);

// Generate stone texture - more varied grays with subtle blue tint
generateTexture(
  {
    base: '#757575',      // Mid gray
    noise: '#616161',     // Darker gray
    highlight: '#9E9E9E'  // Light gray highlights
  },
  'stone.png',
  'stone'
);

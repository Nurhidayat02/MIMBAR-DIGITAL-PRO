import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

// Automatically overwrite all legacy logos with the beautiful new premium extra-glowing logo
try {
  const sourcePath = path.resolve(__dirname, 'src/assets/images/mimbar_glowing_logo_1783783072334.jpg');
  if (fs.existsSync(sourcePath)) {
    const targets = [
      'public/mimbar_logo_32.png',
      'public/mimbar_pwa_logo_32.png',
      'public/mimbar_logo_192.png',
      'public/mimbar_pwa_icon_192.png',
      'public/icon-192.png',
      'public/icon-192.jpg',
      'public/mimbar_logo_512.png',
      'public/mimbar_pwa_icon_512.png',
      'public/icon-512.png',
      'public/icon-512.jpg',
      'public/brand_logo.png',
      'public/brand_logo.jpg',
      'public/apple-touch-icon.png',
      'public/apple-touch-icon-precomposed.png',
      'public/logo192.png',
      'public/logo512.png',
      'public/favicon.ico',
      'src/assets/images/mimbar_digital_logo_1780744098096.png',
      'src/assets/images/mimbar_digital_logo_1782743876619.jpg',
      
      // Cache-busting _v10 versions to force OS/browser refreshing instantly
      'public/mimbar_logo_32_v10.png',
      'public/mimbar_pwa_logo_32_v10.png',
      'public/mimbar_logo_192_v10.png',
      'public/mimbar_pwa_icon_192_v10.png',
      'public/mimbar_logo_512_v10.png',
      'public/mimbar_pwa_icon_512_v10.png',
      'public/apple-touch-icon_v10.png'
    ];
    for (const t of targets) {
      const dest = path.resolve(__dirname, t);
      fs.copyFileSync(sourcePath, dest);
      console.log(`Successfully copied new logo to ${t}`);
    }
  }
} catch (err) {
  console.error('Error copying logos:', err);
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

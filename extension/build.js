import * as esbuild from 'esbuild';
import fs from 'fs-extra';

async function build() {
  const distDir = './dist';
  if (fs.existsSync(distDir)) fs.removeSync(distDir);
  fs.mkdirSync(distDir);
  if (fs.existsSync('./public')) fs.copySync('./public', distDir);

  const common = {
    bundle: true,
    minify: false,
    platform: 'browser',
    loader: { '.tsx': 'tsx', '.ts': 'ts', '.css': 'css' },
    define: { 'process.env.NODE_ENV': '"development"' },
  };

  // 1. Build SidePanel
  await esbuild.build({
    ...common,
    entryPoints: ['./src/main.tsx'],
    outfile: './dist/assets/index.js',
  });

  // 2. Build Background
  await esbuild.build({
    ...common,
    entryPoints: ['./src/background.ts'],
    outfile: './dist/background.js',
  });

  // 3. Build Content Script
  await esbuild.build({
    ...common,
    entryPoints: ['./src/content.ts'],
    outfile: './dist/content.js',
  });

  console.log('Build complete!');
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});

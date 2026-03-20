import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

async function build() {
    const dist = './dist';
    if (!fs.existsSync(dist)) fs.mkdirSync(dist);
    if (!fs.existsSync(path.join(dist, 'assets'))) fs.mkdirSync(path.join(dist, 'assets'));

    // Copy public assets if they exist
    if (fs.existsSync('./public')) {
        fs.cpSync('./public', dist, { recursive: true });
    }

    const common = {
        bundle: true,
        minify: true,
        platform: 'browser',
        target: 'chrome100',
        define: { 'process.env.NODE_ENV': '"production"' }
    };

    try {
        // 1. Content Script
        await esbuild.build({
            ...common,
            entryPoints: ['src/content.ts'],
            outfile: 'dist/content.js',
        });
        console.log('✓ content.js built');

        // 2. Background Script
        await esbuild.build({
            ...common,
            entryPoints: ['src/background.ts'],
            outfile: 'dist/background.js',
        });
        console.log('✓ background.js built');

        // 3. SidePanel React App
        await esbuild.build({
            ...common,
            entryPoints: ['src/main.tsx'],
            outfile: 'dist/assets/index.js',
            loader: { '.tsx': 'tsx', '.ts': 'ts', '.css': 'css' },
        });
        console.log('✓ assets/index.js & css built');

        // 4. Generate index.html for side panel
        const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI Fact Checking</title>
    <link rel="stylesheet" href="assets/index.css">
</head>
<body>
    <div id="root"></div>
    <script type="module" src="assets/index.js"></script>
</body>
</html>`;
        fs.writeFileSync(path.join(dist, 'index.html'), html);
        console.log('✓ index.html generated');

        console.log('Build successful!');
    } catch (e) {
        console.error('Build failed:', e);
        process.exit(1);
    }
}

build();

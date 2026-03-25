import fs from 'fs';
import path from 'path';

const rootDir = 'c:/Users/DELL/Downloads/FlowKit-main/FlowKit-main/src';

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            walk(filePath);
        } else if (stats.isFile() && (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.jsx') || filePath.endsWith('.css') || filePath.endsWith('.md'))) {
            let content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('FlowKit') || content.includes('flowkit')) {
                console.log(`Updating ${filePath}`);
                // Replace FlowKit with Fluxora (preserving case for the start)
                content = content.replace(/FlowKit/g, 'Fluxora');
                content = content.replace(/flowkit/g, 'fluxora');
                fs.writeFileSync(filePath, content, 'utf8');
            }
        }
    }
}

walk(rootDir);
console.log('Done!');

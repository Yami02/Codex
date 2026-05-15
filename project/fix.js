import fs from 'fs';
let code = fs.readFileSync('src/pages/LivroMonstros.tsx', 'utf-8');
let lines = code.split('\n');
if (lines[442].includes('</div>')) {
    lines[442] = lines[442].replace('</div>', '</>');
}
fs.writeFileSync('src/pages/LivroMonstros.tsx', lines.join('\n'));

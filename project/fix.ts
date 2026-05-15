import * as fs from 'fs';
let code = fs.readFileSync('src/pages/LivroMonstros.tsx', 'utf-8');
let lines = code.split('\n');
console.log("Before: ", lines[442]);
if (lines[442].includes('</div>')) {
    lines[442] = lines[442].replace('</div>', '</>');
}
console.log("After: ", lines[442]);
fs.writeFileSync('src/pages/LivroMonstros.tsx', lines.join('\n'));

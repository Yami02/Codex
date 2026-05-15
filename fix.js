const fs = require('fs');
let code = fs.readFileSync('src/pages/LivroMonstros.tsx', 'utf-8');
let lines = code.split('\n');
// Change line 443
if (lines[442].includes('</div>')) {
    lines[442] = lines[442].replace('</div>', '</>');
}
if (lines[237].includes('<div className="w-[3vw] h-full book-spine-left shrink-0 z-20"></div>')) {
    console.log("WAIT 238 is just spine.");
}
fs.writeFileSync('src/pages/LivroMonstros.tsx', lines.join('\n'));

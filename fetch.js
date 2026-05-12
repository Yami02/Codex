import fs from 'fs';
fetch('https://raw.githubusercontent.com/Yami02/Codex/main/demo.html').then(r=>r.text()).then(t=>fs.writeFileSync('demo-downloaded.html', t));

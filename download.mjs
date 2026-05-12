import fs from 'fs';
fetch('https://raw.githubusercontent.com/Yami02/Codex/main/demo.html')
  .then(res => res.text())
  .then(html => fs.writeFileSync('demo.html', html))
  .catch(console.error);

const fs = require('fs');
const src = fs.readFileSync('dog-game.html', 'utf8');
const m = src.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.log('no script'); process.exit(1); }
try { new Function(m[1]); console.log('OK'); }
catch(e) { console.log('ERROR: ' + e.message); }

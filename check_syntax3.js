const fs = require('fs');
const src = fs.readFileSync('dog-game.html', 'utf8');
const m = src.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.log('no script'); process.exit(1); }
fs.writeFileSync('/tmp/game_script.js', m[1]);
console.log('Script extracted, lines: ' + m[1].split('\n').length);

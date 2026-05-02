const fs = require('fs');
const src = fs.readFileSync('dog-game.html', 'utf8');
const m = src.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.log('no script'); process.exit(1); }
try { new Function(m[1]); console.log('OK'); }
catch(e) {
  // Find the approximate line number by counting newlines in the extracted script
  const msg = e.message;
  const colMatch = msg.match(/\(anonymous\):(\d+)/);
  if (colMatch) {
    const lineNum = parseInt(colMatch[1]);
    const lines = m[1].split('\n');
    console.log('ERROR line ' + lineNum + ': ' + e.message);
    for (let i = Math.max(0,lineNum-3); i < Math.min(lines.length, lineNum+2); i++) {
      console.log((i+1) + ': ' + lines[i]);
    }
  } else {
    console.log('ERROR: ' + e.message);
  }
}

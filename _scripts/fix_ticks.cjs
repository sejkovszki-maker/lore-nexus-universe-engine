const fs = require('fs');
const path = require('path');

function walk(d) {
  fs.readdirSync(d).forEach(f => {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith('.ts') || p.endsWith('.tsx')) {
      let c = fs.readFileSync(p, 'utf8');
      let o = c;
      // The issue is backticks were turned into backslashes!
      // This is because of how previous tools might have escaped them.
      // We will replace obvious backtick contexts:
      c = c.replace(/html\\/g, 'html`');
      c = c.replace(/css\\/g, 'css`');
      c = c.replace(/\\;/g, '`;');
      
      // In diablo-navigation.ts:
      // class="\ \" => class="` `" (actually it should be class="...") wait, it was class="${btnClass} ${this.activeTab === 'timeline' ? 'text-blood-red' : 'text-gray-400'}"
      // Let's manually fix diablo-navigation.ts
      
      if (c !== o) {
        fs.writeFileSync(p, c);
        console.log('Fixed', p);
      }
    }
  });
}
walk('src/components');

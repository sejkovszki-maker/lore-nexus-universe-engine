const fs = require('fs');
const path = require('path');

const map = {
    'Ăˇ': 'á', 'Ă ': 'Á',
    'Ă©': 'é', 'Ă‰': 'É',
    'Ă­': 'í', 'ĂŤ': 'Í',
    'Ăł': 'ó', 'Ă“': 'Ó',
    'Ă¶': 'ö', 'Ă–': 'Ö',
    'Ĺ‘': 'ő', 'Ĺ ': 'Ő',
    'Ăş': 'ú', 'Ăš': 'Ú',
    'ĂĽ': 'ü', 'Ăś': 'Ü', // ü is usually ĂĽ, Ü is usually Ăś ? Wait, we will verify if any exist
    'Ĺ±': 'ű', 'Ĺ°': 'Ű',
    'â€“': '–', // en-dash
    'â€”': '—', // em-dash
    'â€ž': '„', // quote
    'â€ť': '”', // quote
    'Ă': 'í' // fallback for kingdom-of-shadow encoding warn
};

function fixFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    for (const [bad, good] of Object.entries(map)) {
        // escape the bad string for regex
        const regex = new RegExp(bad.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'g');
        content = content.replace(regex, good);
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed encoding in: ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.git' || file === 'dist' || file === '.gemini') continue;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.ts') || fullPath.endsWith('.html') || fullPath.endsWith('.json')) {
            fixFile(fullPath);
        }
    }
}

walkDir(path.join(__dirname, '..'));
console.log('Encoding fix complete.');

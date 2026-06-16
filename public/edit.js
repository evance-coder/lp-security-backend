const fs = require('fs');
const file = 'public/index.html';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/href="#" onclick="openModal\('about'\); return false;"/g, 'href="/about.html"');
content = content.replace(/onclick="openModal\('about'\); return false;"/g, '');
fs.writeFileSync(file, content, 'utf8');
console.log('Updated about link');

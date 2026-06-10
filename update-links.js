const fs = require('fs');
const file = 'public/index.html';
let content = fs.readFileSync(file, 'utf8');
// Replace modal service links with direct page links
content = content.replace(/onclick="openModal\('services'\); return false;" class="service-link"/g, 'href="/services.html" class="service-link"');
content = content.replace(/<a href="#" class="btn-primary" onclick="openModal\('services'\); return false;">/g, '<a href="/services.html" class="btn-primary">');
// Also update the nav link
content = content.replace(/<li><a href="#" onclick="openModal\('services'\); return false;">SERVICES<\/a><\/li>/, '<li><a href="/services.html">SERVICES</a></li>');
fs.writeFileSync(file, content, 'utf8');
console.log('Updated services links to point to /services.html');

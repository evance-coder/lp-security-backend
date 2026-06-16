require('dotenv').config();
console.log('ADMIN_USERNAME:', process.env.ADMIN_USERNAME);
console.log('ADMIN_PASSWORD:', process.env.ADMIN_PASSWORD);

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// File paths for data
const dataPath = path.join(__dirname, 'data');
const contactsFile = path.join(dataPath, 'contacts.json');
const quotesFile = path.join(dataPath, 'quotes.json');
const testimonialsFile = path.join(dataPath, 'testimonials.json');
const imagesFile = path.join(dataPath, 'images.json');

// Ensure data directory exists
if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath, { recursive: true });

// Helper functions
function readJSON(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}
function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// admin user
const ADMIN_USER = {
  username: process.env.ADMIN_USERNAME,
  password: process.env.ADMIN_PASSWORD
};

// Authentication middleware
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (token === 'dummy-token') return next();
  res.status(401).json({ error: 'Unauthorized' });
}

//serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
    res.json({ success: true, token: 'dummy-token' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Contact submission (public)
app.post('/api/contact', (req, res) => {
  try {
    const { fullName, email, phone, message } = req.body;
    if (!fullName || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }
    const contacts = readJSON(contactsFile);
    const newContact = {
      id: Date.now(),
      fullName,
      email,
      phone: phone || '',
      message,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    contacts.push(newContact);
    writeJSON(contactsFile, contacts);
    res.status(201).json({ success: true, id: newContact.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save contact' });
  }
});

// Quote submission (public)
app.post('/api/quote', (req, res) => {
  try {
    const { fullName, email, company, serviceType, details } = req.body;
    if (!fullName || !email || !serviceType || !details) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const quotes = readJSON(quotesFile);
    const newQuote = {
      id: Date.now(),
      fullName,
      email,
      company: company || '',
      serviceType,
      details,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    quotes.push(newQuote);
    writeJSON(quotesFile, quotes);
    res.status(201).json({ success: true, id: newQuote.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save quote request' });
  }
});

// Admin endpoints
app.get('/api/admin/contacts', authenticate, (req, res) => {
  res.json(readJSON(contactsFile));
});
app.get('/api/admin/quotes', authenticate, (req, res) => {
  res.json(readJSON(quotesFile));
});
app.get('/api/admin/stats', authenticate, (req, res) => {
  const contacts = readJSON(contactsFile);
  const quotes = readJSON(quotesFile);
  const testimonials = readJSON(testimonialsFile);
  res.json({
    totalContacts: contacts.length,
    pendingContacts: contacts.filter(c => c.status === 'pending').length,
    totalQuotes: quotes.length,
    pendingQuotes: quotes.filter(q => q.status === 'pending').length,
    activeTestimonials: testimonials.filter(t => t.isActive).length
  });
});
app.put('/api/admin/contacts/:id', authenticate, (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  const contacts = readJSON(contactsFile);
  const index = contacts.findIndex(c => c.id === id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  contacts[index].status = status;
  writeJSON(contactsFile, contacts);
  res.json(contacts[index]);
});
app.put('/api/admin/quotes/:id', authenticate, (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  const quotes = readJSON(quotesFile);
  const index = quotes.findIndex(q => q.id === id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  quotes[index].status = status;
  writeJSON(quotesFile, quotes);
  res.json(quotes[index]);
});

// Testimonials (public and admin)
app.get('/api/testimonials', (req, res) => {
  const testimonials = readJSON(testimonialsFile);
  const active = testimonials.filter(t => t.isActive === true);
  res.json(active);
});
app.get('/api/admin/testimonials', authenticate, (req, res) => {
  res.json(readJSON(testimonialsFile));
});
app.post('/api/admin/testimonials', authenticate, (req, res) => {
  const { clientName, company, content, rating } = req.body;
  if (!clientName || !company || !content) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const testimonials = readJSON(testimonialsFile);
  const newTestimonial = {
    id: Date.now(),
    clientName,
    company,
    content,
    rating: parseInt(rating),
    isActive: true,
    createdAt: new Date().toISOString()
  };
  testimonials.push(newTestimonial);
  writeJSON(testimonialsFile, testimonials);
  res.status(201).json(newTestimonial);
});
app.put('/api/admin/testimonials/:id', authenticate, (req, res) => {
  const id = parseInt(req.params.id);
  const { isActive } = req.body;
  const testimonials = readJSON(testimonialsFile);
  const index = testimonials.findIndex(t => t.id === id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  testimonials[index].isActive = isActive;
  writeJSON(testimonialsFile, testimonials);
  res.json(testimonials[index]);
});
app.delete('/api/admin/testimonials/:id', authenticate, (req, res) => {
  const id = parseInt(req.params.id);
  let testimonials = readJSON(testimonialsFile);
  testimonials = testimonials.filter(t => t.id !== id);
  writeJSON(testimonialsFile, testimonials);
  res.json({ success: true });
});

// ---------- Image Upload with Multer ----------
const upload = multer({ dest: 'uploads/' });
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads', { recursive: true });

app.post('/api/admin/upload-image', authenticate, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const { imageType, serviceId } = req.body;
  let targetFolder = '';
  let key = '';
  let urlPath = '';

  if (imageType === 'logo') {
    targetFolder = 'public/images/logo';
    key = 'logo';
    urlPath = '/images/logo/image.jpg';
  } else if (imageType === 'hero') {
    targetFolder = 'public/images/hero';
    key = 'hero';
    urlPath = '/images/hero/image.jpg';
  } else if (imageType === 'about') {
    targetFolder = 'public/images/about';
    key = 'about';
    urlPath = '/images/about/image.jpg';
  } else if (imageType === 'service' && serviceId) {
    targetFolder = `public/images/services/${serviceId}`;
    key = `service_${serviceId}`;
    urlPath = `/images/services/${serviceId}/image.jpg`;
  } else {
    return res.status(400).json({ error: 'Invalid image type or missing serviceId' });
  }

  // Create folder if needed
  if (!fs.existsSync(targetFolder)) fs.mkdirSync(targetFolder, { recursive: true });

  // Move uploaded file to target location (overwrites existing)
  const oldPath = req.file.path;
  const newPath = path.join(targetFolder, 'image.jpg');
  fs.renameSync(oldPath, newPath);

  // Update images.json
  let images = {};
  try {
    images = JSON.parse(fs.readFileSync(imagesFile, 'utf8'));
  } catch (e) { /* file may not exist yet */ }
  images[key] = urlPath;
  fs.writeFileSync(imagesFile, JSON.stringify(images, null, 2));

  res.json({ success: true, url: urlPath });
});

// Public endpoint to get all image URLs
app.get('/api/images', (req, res) => {
  let images = {};
  try {
    images = JSON.parse(fs.readFileSync(imagesFile, 'utf8'));
  } catch (e) { /* default empty object */ }
  res.json(images);
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT);
  console.log('Admin login: http://localhost:' + PORT + '/admin-login.html');
  console.log('Dashboard: http://localhost:' + PORT + '/admin-dashboard.html');
});
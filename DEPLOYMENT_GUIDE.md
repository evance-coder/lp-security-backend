# Lakers Pride Security - Deployment Guide

This guide explains how to deploy your frontend (GitHub Pages) and backend (Node.js) separately.

## 📋 Overview

- **Frontend**: Static HTML/CSS/JS served by GitHub Pages
- **Backend**: Node.js Express server for API endpoints (hosted on Vercel, Heroku, or Railway)

---

## 1️⃣ Frontend Deployment (GitHub Pages) ✅

Your frontend is **already deployed** and live at:
```
https://evance-coder.github.io/lp-security-backend/
```

**What you have:**
- `index.html` - Home page
- `about.html` - About page
- `services.html` - Services page
- `.nojekyll` - Disables Jekyll processing
- All static assets (CSS, images, fonts)

**To update the site:** Simply commit changes to the `main` branch and GitHub Pages will automatically rebuild.

---

## 2️⃣ Backend Deployment (Node.js/Express)

Your backend handles API endpoints:
- `POST /api/contact` - Contact form submissions
- `POST /api/quote` - Quote requests
- `GET/POST /api/testimonials` - Testimonials management
- `POST /api/admin/upload-image` - Image uploads
- Admin dashboard APIs

### Option A: Deploy to Vercel (Recommended) 🚀

**Step 1: Sign Up**
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign up" → Choose "GitHub"
3. Authorize Vercel to access your GitHub

**Step 2: Deploy**
1. Click "New Project"
2. Import `lp-security-backend` repository
3. **Framework Preset**: Select "Other"
4. **Root Directory**: `./` (default)
5. **Build Command**: Leave empty
6. **Output Directory**: Leave empty
7. **Environment Variables**: Add the following:
   ```
   NODE_ENV=production
   PORT=5000
   ```
8. Click "Deploy"

**Step 3: Update Frontend with Backend URL**
After deployment, Vercel will give you a URL like `https://lp-security-backend-abc123.vercel.app`

Update your `.env` file:
```
REACT_APP_API_URL=https://lp-security-backend-abc123.vercel.app
```

Then update all HTML files (see Step 3 below).

---

### Option B: Deploy to Heroku

**Step 1: Sign Up**
1. Go to [heroku.com](https://heroku.com)
2. Create account and verify email

**Step 2: Deploy**
1. Install Heroku CLI: `npm install -g heroku`
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Deploy: `git push heroku main`
5. View logs: `heroku logs --tail`

**Your backend URL**: `https://your-app-name.herokuapp.com`

---

### Option C: Deploy to Railway

**Step 1: Sign Up**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub

**Step 2: Deploy**
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose `lp-security-backend`
4. Click "Deploy"

Your backend URL will be generated automatically.

---

## 3️⃣ Update Frontend HTML Files

### Update `index.html`

**Replace all API calls** with your backend URL. Find and update:

```javascript
// OLD (local):
const res = await fetch('/api/contact', { ... })

// NEW (with environment variable):
const API_URL = 'https://lp-security-backend-abc123.vercel.app'; // Replace with your URL
const res = await fetch(`${API_URL}/api/contact`, { ... })
```

**At the top of `<script>` tag in `index.html`, add:**

```javascript
// Configuration
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000'
  : 'https://lp-security-backend-abc123.vercel.app'; // Replace with your deployed URL

// Navigation links for GitHub Pages
const BASE_URL = '/lp-security-backend/';
```

**Then update all fetch calls:**

```javascript
// Example: Contact form
fetch(`${API_URL}/api/contact`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ fullName, email, phone, message })
})

// Example: Testimonials
fetch(`${API_URL}/api/testimonials`)

// Example: Images
fetch(`${API_URL}/api/images`)
```

**Update navigation links:**

```html
<!-- OLD: -->
<a href="/about.html">ABOUT</a>
<a href="/services.html">SERVICES</a>

<!-- NEW (for GitHub Pages): -->
<a href="/lp-security-backend/about.html">ABOUT</a>
<a href="/lp-security-backend/services.html">SERVICES</a>

<!-- OR use JavaScript: -->
<a href="javascript:window.location.href=BASE_URL+'about.html'">ABOUT</a>
```

### Update `about.html` and `services.html`

Apply the same changes:
1. Add `API_URL` and `BASE_URL` configuration at top of script
2. Update all fetch calls to use `${API_URL}`
3. Update navigation links to use `${BASE_URL}`

---

## 4️⃣ Testing

### Local Testing (Before Deployment)

1. **Start backend locally:**
   ```bash
   npm install
   node server.js
   ```
   Backend runs at: `http://localhost:5000`

2. **Open frontend in browser:**
   ```
   Open index.html in your browser
   (or use a local server)
   ```

3. **Test API calls:**
   - Try submitting a contact form
   - Check that data is saved in `/data/contacts.json`
   - Check admin dashboard at `http://localhost:5000/admin-dashboard.html`

### Production Testing

1. Commit updated HTML files to GitHub
2. Push to `main` branch
3. Visit `https://evance-coder.github.io/lp-security-backend/`
4. Test contact form, quote, and other features
5. Check that data appears in your backend's admin dashboard

---

## 5️⃣ Environment Variables Summary

### Frontend (.env)
```
REACT_APP_API_URL=https://your-backend-url.vercel.app
REACT_APP_BASE_URL=/lp-security-backend/
```

### Backend (Vercel/Heroku/Railway)
```
NODE_ENV=production
PORT=5000
```

---

## 6️⃣ Troubleshooting

### "404 Not Found" on GitHub Pages
- Ensure `.nojekyll` file exists in root
- Check that Pages source is set to `main` branch (root)
- Clear browser cache or use incognito mode

### API calls failing (CORS error)
- Add your GitHub Pages URL to CORS in `server.js`:
  ```javascript
  app.use(cors({
    origin: ['https://evance-coder.github.io', 'http://localhost:3000']
  }));
  ```

### Backend not responding
- Check that your deployment (Vercel/Heroku) is active
- View logs in deployment dashboard
- Ensure environment variables are set

### Images not loading
- Upload images via admin dashboard at your backend URL
- Ensure image API endpoint is working

---

## 7️⃣ Quick Deployment Checklist

- [ ] Deploy backend to Vercel/Heroku/Railway
- [ ] Get backend URL (e.g., `https://lp-security-backend.vercel.app`)
- [ ] Update `.env` file with backend URL
- [ ] Update all HTML files with `API_URL` configuration
- [ ] Update navigation links for GitHub Pages base URL
- [ ] Test contact form on production
- [ ] Test admin dashboard
- [ ] Test image uploads

---

## 📞 Support

If you encounter issues:
1. Check browser console (F12 → Console tab) for errors
2. View deployment logs in Vercel/Heroku dashboard
3. Ensure CORS is properly configured
4. Verify all URLs are correct (no typos)

Good luck! 🚀

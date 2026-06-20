const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const entityRoutes = require('./routes/entities');
const uploadRoutes = require('./routes/upload');
const integrationRoutes = require('./routes/integrations');
const functionRoutes = require('./routes/functions');
const userRoutes = require('./routes/users');
const pool = require('./db/pool');

const app = express();
const PORT = process.env.PORT || 3001;

// Allowed origins: the VM IP, the domain, and local dev
const allowedOrigins = [
  'https://www.sivanaltar.com',
  'https://sivanaltar.com',
  'http://localhost:5173',
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Serve uploaded files
const uploadsDir = process.env.UPLOADS_DIR || '/var/www/sivanaltar/uploads';
app.use('/uploads', express.static(uploadsDir));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/entities', entityRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/functions', functionRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Dynamic sitemap — includes all published blog posts with SEO URLs
app.get('/sitemap.xml', async (req, res) => {
  try {
    const BASE = 'https://www.sivanaltar.com';

    const staticPages = [
      { path: 'Home',     changefreq: 'weekly',  priority: '1.0', xdefault: true },
      { path: 'Blogs',    changefreq: 'weekly',  priority: '0.8' },
      { path: 'Gallery',  changefreq: 'monthly', priority: '0.6' },
      { path: 'Calendar', changefreq: 'weekly',  priority: '0.9' },
      { path: 'Contact',  changefreq: 'yearly',  priority: '0.7' },
    ];

    const { rows: posts } = await pool.query(
      `SELECT seo_url, publish_date FROM blog_posts WHERE published = true AND seo_url IS NOT NULL ORDER BY publish_date DESC`
    );

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
    xml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n\n`;

    for (const page of staticPages) {
      for (const lang of ['he', 'en']) {
        const loc = `${BASE}/${lang}/${page.path}`;
        xml += `  <url>\n`;
        xml += `    <loc>${loc}</loc>\n`;
        xml += `    <xhtml:link rel="alternate" hreflang="he" href="${BASE}/he/${page.path}"/>\n`;
        xml += `    <xhtml:link rel="alternate" hreflang="en" href="${BASE}/en/${page.path}"/>\n`;
        if (page.xdefault) {
          xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/he/${page.path}"/>\n`;
        }
        xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += `  </url>\n`;
      }
    }

    const seenSlugs = new Set();
    for (const post of posts) {
      if (seenSlugs.has(post.seo_url)) continue;
      seenSlugs.add(post.seo_url);
      const heLoc = `${BASE}/he/BlogPost/${post.seo_url}`;
      const enLoc = `${BASE}/en/BlogPost/${post.seo_url}`;
      const lastmod = post.publish_date
        ? new Date(post.publish_date).toISOString().split('T')[0]
        : '';
      for (const lang of ['he', 'en']) {
        const loc = lang === 'he' ? heLoc : enLoc;
        xml += `  <url>\n`;
        xml += `    <loc>${loc}</loc>\n`;
        xml += `    <xhtml:link rel="alternate" hreflang="he" href="${heLoc}"/>\n`;
        xml += `    <xhtml:link rel="alternate" hreflang="en" href="${enLoc}"/>\n`;
        if (lastmod) xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `  </url>\n`;
      }
    }

    xml += `</urlset>\n`;

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('sitemap error', err);
    res.status(500).send('Error generating sitemap');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

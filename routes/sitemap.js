const express = require('express');
const router = express.Router();

router.get('/sitemap.xml', (req, res) => {
  console.log('[SITEMAP] Request received for /sitemap.xml');

  res.header('Content-Type', 'application/xml');

 const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://www.poplox.com/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>https://www.poplox.com/login</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>https://www.poplox.com/register</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>https://www.poplox.com/forgot-password</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>https://www.poplox.com/t&amp;c</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>https://www.poplox.com/services</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>https://www.poplox.com/support</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>https://www.poplox.com/contact-us</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>https://www.poplox.com/application</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>https://www.poplox.com/api-init</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>https://www.poplox.com/engagement</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
</urlset>`;


  console.log('[SITEMAP] Sitemap generated. Sending response...');
  res.send(sitemap);
});

module.exports = router;

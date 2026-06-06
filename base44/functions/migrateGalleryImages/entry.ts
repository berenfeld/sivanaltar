import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const BASE_URL = "https://www.sivanaltar.com/images";

// All images to migrate from sivanaltar.com
const GALLERY_IMAGES = [
  "gallery-1.jpeg", "gallery-2.jpeg", "gallery-3.jpeg", "gallery-4.jpeg",
  "gallery-5.jpeg", "gallery-6.jpeg", "gallery-7.jpeg", "gallery-8.jpeg",
  "gallery-9.jpeg", "gallery-10.jpeg"
];

const BLOG_IMAGES = [
  "blog/69724ce37fe95.jpg",
  "blog-post-image.jpeg",
];

const STATIC_IMAGES = [
  "main-1.jpeg", "main-2.png", "main-3.jpeg", "main-4.jpeg", "logo.png"
];

async function downloadAndUpload(base44, imagePath) {
  const url = `${BASE_URL}/${imagePath}`;
  console.log(`Fetching: ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const arrayBuffer = await res.arrayBuffer();
  const ext = imagePath.split('.').pop().toLowerCase();
  const mimeMap = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp' };
  const mime = mimeMap[ext] || 'image/jpeg';
  const filename = imagePath.replace('/', '_');
  const file = new File([arrayBuffer], filename, { type: mime });
  const result = await base44.asServiceRole.integrations.Core.UploadFile({ file });
  console.log(`Uploaded ${imagePath} -> ${result.file_url}`);
  return result.file_url;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const urlMap = {}; // old relative path -> new hosted URL
    const results = { gallery: [], blog: [], static: [], errors: [] };

    // --- 1. Migrate all images ---
    const allImages = [...GALLERY_IMAGES, ...BLOG_IMAGES, ...STATIC_IMAGES];
    for (const imagePath of allImages) {
      try {
        const newUrl = await downloadAndUpload(base44, imagePath);
        urlMap[imagePath] = newUrl;
        const category = GALLERY_IMAGES.includes(imagePath) ? 'gallery' : BLOG_IMAGES.includes(imagePath) ? 'blog' : 'static';
        results[category].push({ image: imagePath, new_url: newUrl, status: 'uploaded' });
      } catch (err) {
        console.error(`Failed ${imagePath}: ${err.message}`);
        results.errors.push({ image: imagePath, error: err.message });
      }
    }

    // --- 2. Update GalleryImage records ---
    const galleryRecords = await base44.asServiceRole.entities.GalleryImage.list();
    for (const record of galleryRecords) {
      const oldUrl = record.image_url;
      if (!oldUrl || !oldUrl.includes('sivanaltar.com')) continue;
      // Extract relative path from URL
      const match = oldUrl.match(/sivanaltar\.com\/images\/(.+)$/);
      if (!match) continue;
      const relativePath = match[1];
      const newUrl = urlMap[relativePath];
      if (newUrl) {
        await base44.asServiceRole.entities.GalleryImage.update(record.id, { image_url: newUrl });
        console.log(`Updated GalleryImage ${record.id}: ${relativePath} -> ${newUrl}`);
      }
    }

    // --- 3. Update BlogPost records ---
    const blogPosts = await base44.asServiceRole.entities.BlogPost.list();
    for (const post of blogPosts) {
      let changed = false;
      let newImageUrl = post.image_url;
      let newContent = post.content;

      // Update image_url field
      if (post.image_url && post.image_url.includes('sivanaltar.com')) {
        const match = post.image_url.match(/sivanaltar\.com\/images\/(.+)$/);
        if (match && urlMap[match[1]]) {
          newImageUrl = urlMap[match[1]];
          changed = true;
        }
      }

      // Update any sivanaltar.com image URLs embedded in content HTML
      if (post.content && post.content.includes('sivanaltar.com')) {
        for (const [relativePath, newUrl] of Object.entries(urlMap)) {
          const oldUrl = `${BASE_URL}/${relativePath}`;
          if (newContent.includes(oldUrl)) {
            newContent = newContent.replaceAll(oldUrl, newUrl);
            changed = true;
          }
        }
      }

      if (changed) {
        await base44.asServiceRole.entities.BlogPost.update(post.id, { image_url: newImageUrl, content: newContent });
        console.log(`Updated BlogPost ${post.id}`);
      }
    }

    // --- 4. Return URL map for static images (so we can update code) ---
    const staticMap = {};
    for (const img of STATIC_IMAGES) {
      if (urlMap[img]) staticMap[img] = urlMap[img];
    }

    return Response.json({ 
      success: true, 
      results,
      static_url_map: staticMap,
      message: "Migration complete. Use static_url_map to update hardcoded image URLs in pages/Home and Layout."
    });
  } catch (error) {
    console.error('Migration error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
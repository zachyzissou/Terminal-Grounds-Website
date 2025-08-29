import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Console Error:', msg.text());
    }
  });

  // Listen for page errors
  page.on('pageerror', error => {
    console.log('❌ Page Error:', error.message);
  });

  try {
    console.log('🔍 Testing concept art page functionality...');
    
    await page.goto('http://localhost:4321/concept-art');
    await page.waitForLoadState('networkidle');

    // Check if images are actually visible
    const images = await page.locator('img').count();
    console.log(`📷 Found ${images} image elements`);

    // Check if any images have loaded
    const loadedImages = await page.locator('img[src]:not([src=""])').count();
    console.log(`✅ ${loadedImages} images have src attributes`);

    // Check for specific gallery functionality
    const galleryItems = await page.locator('.gallery-item').count();
    console.log(`🖼️ Found ${galleryItems} gallery items`);

    // Test filter functionality
    const filterTabs = await page.locator('.filter-tab').count();
    console.log(`🔽 Found ${filterTabs} filter tabs`);

    // Take a specific screenshot of just the gallery area
    await page.locator('.gallery-grid').screenshot({ path: 'gallery-only.png' });
    console.log('📸 Saved gallery-only screenshot');

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await browser.close();
  }
})();
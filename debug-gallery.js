import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Enable console logging
  page.on('console', msg => {
    console.log('🖥️ Console:', msg.text());
  });

  try {
    await page.goto('http://localhost:4321/concept-art');
    await page.waitForLoadState('networkidle');

    // Check the HTML source for image tags
    const pageContent = await page.content();
    const imgMatches = pageContent.match(/<img[^>]*>/g);
    console.log(`📄 HTML img tags found: ${imgMatches ? imgMatches.length : 0}`);
    
    if (imgMatches) {
      console.log('🔍 First img tag:', imgMatches[0]);
    }

    // Check if gallery items exist but images are missing
    const galleryItemsHTML = await page.locator('.gallery-item').first().innerHTML();
    console.log('📋 First gallery item HTML:');
    console.log(galleryItemsHTML.substring(0, 500) + '...');

    // Look for broken image patterns
    const brokenImages = await page.locator('img[src=""]').count();
    console.log(`❌ Broken images (empty src): ${brokenImages}`);

  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await browser.close();
  }
})();
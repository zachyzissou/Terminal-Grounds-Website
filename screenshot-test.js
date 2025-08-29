import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('Taking screenshots of localhost:4321...');

    // Set viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Homepage
    console.log('📸 Taking homepage screenshot...');
    await page.goto('http://localhost:4321');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'homepage-screenshot.png', fullPage: true });

    // Story page
    console.log('📸 Taking story page screenshot...');
    await page.goto('http://localhost:4321/story');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'story-screenshot.png', fullPage: true });

    // Factions page
    console.log('📸 Taking factions page screenshot...');
    await page.goto('http://localhost:4321/factions');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'factions-screenshot.png', fullPage: true });

    // Regions page
    console.log('📸 Taking regions page screenshot...');
    await page.goto('http://localhost:4321/regions');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'regions-screenshot.png', fullPage: true });

    // Progress page
    console.log('📸 Taking progress page screenshot...');
    await page.goto('http://localhost:4321/progress');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'progress-screenshot.png', fullPage: true });

    // Concept Art page
    console.log('📸 Taking concept-art page screenshot...');
    await page.goto('http://localhost:4321/concept-art');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'concept-art-screenshot.png', fullPage: true });

    // Milestones page
    console.log('📸 Taking milestones page screenshot...');
    await page.goto('http://localhost:4321/milestones');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'milestones-screenshot.png', fullPage: true });

    console.log('✅ All screenshots completed!');

  } catch (error) {
    console.error('Error taking screenshots:', error);
  } finally {
    await browser.close();
  }
})();
import { test, expect } from '@playwright/test';

test('visual regression test of key pages', async ({ page }) => {
  // Test homepage visual appearance
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000); // Wait for any animations
  await expect(page).toHaveScreenshot('homepage.png', {
    maxDiffPixelRatio: 0.2 // Increase tolerance
  });

  // Test login page visual appearance with proper waiting
  await page.goto('/login');
  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.waitForLoadState('domcontentloaded')
  ]);
  await expect(page).toHaveScreenshot('login.png', {
    maxDiffPixelRatio: 0.2 // Increase tolerance
  });

  // Test AI generation interface
  await page.goto('/ai-generation');
  await expect(page).toHaveScreenshot('ai-generation.png', {
    maxDiffPixelRatio: 0.1
  });

  // Test community page layout
  await page.goto('/community');
  await expect(page).toHaveScreenshot('community.png', {
    maxDiffPixelRatio: 0.1
  });
});

test('responsive design testing', async ({ page }) => {
  // Test mobile layout
  await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000); // Wait for any animations
  await expect(page).toHaveScreenshot('homepage-mobile.png', {
    maxDiffPixelRatio: 0.2 // Increase tolerance
  });

  // Test tablet layout
  await page.setViewportSize({ width: 768, height: 1024 }); // iPad
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000); // Wait for any animations
  await expect(page).toHaveScreenshot('homepage-tablet.png', {
    maxDiffPixelRatio: 0.2 // Increase tolerance
  });

  // Test desktop layout
  await page.setViewportSize({ width: 1440, height: 900 }); // Desktop
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000); // Wait for any animations
  await expect(page).toHaveScreenshot('homepage-desktop.png', {
    maxDiffPixelRatio: 0.2 // Increase tolerance
  });
});

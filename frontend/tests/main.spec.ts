import { test, expect } from '@playwright/test';

// Test homepage functionality
test('homepage has correct title and features', async ({ page }) => {
  await page.goto('/');
  
  // Check page title
  await expect(page).toHaveTitle(/NeuralForge/);
  
  // Verify main sections are present
  await expect(page.getByRole('heading', { name: /NeuralForge/i })).toBeVisible();
  
  // Check navigation elements in header
  const nav = page.getByRole('navigation');
  await expect(nav.getByRole('link', { name: 'AI Generation' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Community' })).toBeVisible();
});

// Test authentication flow
test('login flow works correctly', async ({ page }) => {
  await page.goto('/login');
  
  // Fill in login form
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Password').fill('testpassword');
  await page.getByRole('button', { name: /Sign in/i }).click();
  
  // Wait for redirect with increased timeout
  await page.waitForURL(/.*dashboard/, { timeout: 15000 });
});

// Test AI generation feature
test('AI generation form works', async ({ page }) => {
  // Login first
  await page.goto('/login');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Password').fill('testpassword');
  await page.getByRole('button', { name: /Sign in/i }).click();
  await page.waitForURL(/.*dashboard/, { timeout: 15000 });
  
  // Navigate to AI generation page
  await page.goto('/ai-generation');
  await page.waitForURL(/.*ai-generation/, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  
  // Fill in generation form and submit
  await page.getByLabel('Enter your prompt').fill('Create a test image');
  await page.waitForTimeout(500); // Small delay for form stability
  await page.getByRole('button', { name: 'Generate' }).click();
  
  // Check for generation response
  await expect(page.getByText('Generation in progress...')).toBeVisible({ timeout: 15000 });
  
  // Wait for the generation to start processing
  await page.waitForLoadState('networkidle');
});

// Test community features
test('community post creation works', async ({ page }) => {
  // Login first
  await page.goto('/login');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Password').fill('testpassword');
  await page.getByRole('button', { name: /Sign in/i }).click();
  await page.waitForURL(/.*dashboard/, { timeout: 15000 });

  // Navigate to community page and wait for it to load
  await page.goto('/community');
  await page.waitForURL(/.*community/, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  
  // Create a new post
  await page.getByRole('button', { name: /Create Post/i }).click();
  await page.waitForTimeout(500); // Small delay for form animation
  
  // Fill out post form
  await page.getByLabel('Title').fill('Test Post');
  await page.getByLabel('Content').fill('This is a test post');
  await page.getByRole('button', { name: 'Submit' }).click();
  
  // Wait for post to appear
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name: 'Test Post' })).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('This is a test post')).toBeVisible({ timeout: 15000 });
});

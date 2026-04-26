import { test, expect } from '@playwright/test';

test.describe('VerdictFlow E2E', () => {
  test('should load landing page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/VerdictFlow/);
    await expect(page.getByText(/Transform Court Judgments Into Action/i)).toBeVisible();
  });

  test('should toggle dark/light mode', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    
    // Check initial state (should be dark by default as per layout.tsx)
    await expect(html).toHaveClass(/dark/);
    
    // Find theme toggle and click
    const toggle = page.getByLabel(/Toggle theme/i);
    await toggle.click();
    
    // Check if class changed to light
    await expect(html).toHaveClass(/light/);
  });

  test('should navigate to dashboard after login', async ({ page }) => {
    // This assumes a test user exists or we bypass auth in dev
    await page.goto('/dashboard');
    await expect(page.getByText(/Command Center/i)).toBeVisible();
  });
});

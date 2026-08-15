import { test, expect } from '@playwright/test';

test('login page loads correctly', async ({ page }) => {
  await page.goto('/login');

  // Verify there's an email input or google sign in button
  const form = page.locator('form').first();
  const googleBtn = page.getByRole('button', { name: /Google/i }).first();
  
  // Either the form or the google button should be visible
  const formVisible = await form.isVisible();
  const googleVisible = await googleBtn.isVisible();
  expect(formVisible || googleVisible).toBeTruthy();
});

test('unauthenticated dashboard access redirects to unauthorized or login', async ({ page }) => {
  await page.goto('/dashboard/posts');
  
  // Dashboard routes should redirect to /unauthorized or /login if not authenticated
  const currentUrl = page.url();
  expect(currentUrl).not.toContain('/dashboard/posts');
});

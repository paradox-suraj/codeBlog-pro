import { test, expect } from '@playwright/test';

test('homepage loads correctly and displays title', async ({ page }) => {
  await page.goto('/');

  // Expect the title to contain 'CodeBlog'
  await expect(page).toHaveTitle(/CodeBlog/);

  // Expect the page to have a heading
  const heading = page.locator('h1').first();
  await expect(heading).toBeVisible();
});

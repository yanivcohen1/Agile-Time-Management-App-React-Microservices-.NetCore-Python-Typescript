import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
  });

  test('should login successfully as a regular User', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    
    // Fill in credentials for regular user
    await page.fill('input[name="email"]', 'user@todo.dev');
    await page.fill('input[name="password"]', 'ChangeMe123!');
    
    await page.click('button[type="submit"]');
    
    // Verify redirection and user context
    await expect(page).not.toHaveURL(/.*login/);
    await expect(page.getByText('Main Status Board')).toBeVisible();
    await expect(page.getByText('Demo User (user)')).toBeVisible(); // Verify user name/role in the app bar
  });

  test('should login successfully as an Admin', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    
    // Fill in credentials for admin
    await page.fill('input[name="email"]', 'admin@todo.dev');
    await page.fill('input[name="password"]', 'ChangeMe123!');
    
    await page.click('button[type="submit"]');
    
    // Verify redirection and user context
    await expect(page).not.toHaveURL(/.*login/);
    await expect(page.getByText('Main Status Board')).toBeVisible();
    await expect(page.getByText('Demo Admin (admin)')).toBeVisible(); // Verify user name/role in the app bar
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.fill('input[name="email"]', 'wrong@todo.dev');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    
    await expect(page.getByText('Login failed')).toBeVisible();
    await expect(page).toHaveURL(/.*login/);
  });
});

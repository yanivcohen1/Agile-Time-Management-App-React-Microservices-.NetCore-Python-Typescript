import { test, expect } from '@playwright/test';

test.describe('Todo Operations', () => {
  const timestamp = new Date().getTime();
  const userTodoTitle = `User Todo ${timestamp}`;
  const adminTodoTitle = `Admin Todo ${timestamp}`;

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 }); // Ensure desktop view
  });

  test.describe('As a Regular User', () => {
    test.beforeEach(async ({ page, context }) => {
      await context.clearCookies();
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.fill('input[name="email"]', 'user@todo.dev');
      await page.fill('input[name="password"]', 'ChangeMe123!');
      await page.click('button[type="submit"]');
      await expect(page.getByText('Main Status Board')).toBeVisible();
      await page.waitForTimeout(1000);
    });

    test('should be able to create a new todo', async ({ page }) => {
      await page.keyboard.press('Escape'); // Body type {esc}
      await page.waitForTimeout(500);
      
      const drawer = page.locator('.MuiDrawer-root');
      await drawer.getByText('Create New').click();
      
      await expect(page.getByText('Create New Todo')).toBeVisible();
      await page.fill('input[name="title"]', userTodoTitle);
      await page.fill('textarea[name="description"]', 'This is a test todo created by user');
      await page.getByRole('button', { name: 'Create', exact: true }).click();
      
      await expect(page.getByText('Create New Todo')).not.toBeVisible();
      
      // Navigate to Track Status to verify
      await drawer.getByText('Track status').click();
      await expect(page).toHaveURL(/.*track/);
      
      // Search for the todo
      await page.getByLabel('Search').fill(userTodoTitle);
      
      // Verify it appears in the table
      await expect(page.getByText(userTodoTitle)).toBeVisible();
    });
  });

  test.describe('As an Admin', () => {
    test.beforeEach(async ({ page, context }) => {
      await context.clearCookies();
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.fill('input[name="email"]', 'admin@todo.dev');
      await page.fill('input[name="password"]', 'ChangeMe123!');
      await page.click('button[type="submit"]');
      await expect(page.getByText('Main Status Board')).toBeVisible();
      await page.waitForTimeout(1000);
    });

    test('should be able to create a new todo', async ({ page }) => {
      await page.keyboard.press('Escape'); // Body type {esc}
      await page.waitForTimeout(500);
      
      const drawer = page.locator('.MuiDrawer-root');
      await drawer.getByText('Create New').click();
      
      await expect(page.getByText('Create New Todo')).toBeVisible();
      await page.fill('input[name="title"]', adminTodoTitle);
      await page.fill('textarea[name="description"]', 'This is a test todo created by admin');
      await page.getByRole('button', { name: 'Create', exact: true }).click();
      
      await expect(page.getByText('Create New Todo')).not.toBeVisible();
      
      // Navigate to Track Status to verify
      await drawer.getByText('Track status').click();
      await expect(page).toHaveURL(/.*track/);
      
      // Search
      await page.getByLabel('Search').fill(adminTodoTitle);
      
      // Verify
      await expect(page.getByText(adminTodoTitle)).toBeVisible();
    });
  });
});

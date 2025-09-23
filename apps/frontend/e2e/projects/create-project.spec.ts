import { test, expect } from "@playwright/test";

test.describe('Project Creation Flow', () => {

  test('user can create a new project', async ({ page }) => {
    // 1️⃣ Navigate to /projects (now authenticated)
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');

    // 2️⃣ Take screenshot to see current state
    await page.screenshot({ path: 'authenticated-projects-page.png' });

    // 3️⃣ Look for "Add new project" button (case-insensitive)
    const addButton = page.locator('button', { hasText: /add new project/i });
    await expect(addButton).toBeVisible({ timeout: 10000 });
    await addButton.click();

    // 4️⃣ Wait for modal and fill the form
    await page.waitForSelector('input[name="name"]', { state: 'visible' });
    await page.fill('input[name="name"]', 'Playwright Test Project');
    await page.fill('textarea[name="description"]', 'This is a test project created via Playwright.');

    // 5️⃣ Click "Create Project" button
    await page.click('button:has-text("Create Project")');

    // 6️⃣ Wait for modal to close and verify the project appears
    await page.waitForSelector('text=Playwright Test Project', { timeout: 10000 });

    // Check for the specific project title element (not the loading text)
    await expect(page.locator('span.text-black', { hasText: 'Playwright Test Project' })).toBeVisible();

    console.log('✅ Project created successfully!');
  });

});

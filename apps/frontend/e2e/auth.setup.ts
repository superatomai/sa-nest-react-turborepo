import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  console.log('🔐 Setting up authentication...');

  // Navigate to your app
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // === STEP 1: Handle Login ===
  const loginTitle = await page.getByText('Sign in to Superatom').isVisible().catch(() => false);
  if (loginTitle) {
    console.log('📧 Logging in with email/password...');

    await page.fill('input[placeholder="Enter your email address"]', 'captainjack87654321@gmail.com');
    await page.click('button:has-text("Continue")');
    await page.waitForLoadState('networkidle');

    // Handle password step
    const passwordInput = page.locator('input[type="password"]').or(page.locator('input[placeholder*="password"]'));
    await passwordInput.fill('9862863123');
    await page.click('button:has-text("Continue"), button:has-text("Sign in")');
    await page.waitForLoadState('networkidle');
  }

  // === STEP 2: Handle Organization Setup ===
  const setupOrgTitle = await page.getByText('Setup your organization').isVisible().catch(() => false);
  if (setupOrgTitle) {
    console.log('🏢 Setting up new organization...');

    await page.fill('input[placeholder="My Organization"]', 'Test Organization');
    await page.click('button:has-text("Continue")');
    await page.waitForLoadState('networkidle');

    console.log('✅ Organization created successfully');
  }

  // === STEP 3: Handle Organization Selection ===
  const orgSelectionTitle = await page.getByText('Choose an organization').isVisible().catch(() => false);
  if (orgSelectionTitle) {
    console.log('🔄 Selecting organization...');

    // Look for Test Organization and click it
    const testOrg = page.locator('text=Test Organization').first();
    if (await testOrg.isVisible().catch(() => false)) {
      await testOrg.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ Selected Test Organization');
    } else {
      console.log('⚠️ Test Organization not found, using first available organization');
      // Click the first organization option available
      await page.click('[role="button"]:has-text("Organization"), button:has-text("Organization")').catch(() => {
        console.log('No organization buttons found');
      });
    }
  }

  // === STEP 4: Handle Create Organization (fallback) ===
  const createOrgButton = await page.getByText('Create new organization').isVisible().catch(() => false);
  if (createOrgButton) {
    console.log('🆕 Creating new organization (fallback)...');

    await page.click('text=Create new organization');
    await page.waitForLoadState('networkidle');

    // Fill the form if it appears
    if (await page.locator('input[placeholder="My Organization"]').isVisible().catch(() => false)) {
      await page.fill('input[placeholder="My Organization"]', 'Test Organization');
      await page.click('button:has-text("Continue"), button:has-text("Create")');
      await page.waitForLoadState('networkidle');
    }
  }

  // === STEP 5: Final Verification ===
  // Wait for any final redirects
  await page.waitForTimeout(2000);

  // Try to navigate to /projects
  await page.goto('/projects');
  await page.waitForLoadState('networkidle');

  const currentUrl = page.url();
  console.log('📍 Final URL:', currentUrl);

  // Check for any remaining auth flows
  const stillOnLogin = await page.getByText('Sign in to Superatom').isVisible().catch(() => false);
  const stillOrgSelection = await page.getByText('Choose an organization').isVisible().catch(() => false);
  const stillOrgSetup = await page.getByText('Setup your organization').isVisible().catch(() => false);

  if (stillOnLogin) {
    throw new Error('❌ Authentication failed - still on login page');
  }

  if (stillOrgSelection || stillOrgSetup) {
    await page.screenshot({ path: 'auth-stuck-debug.png' });
    console.log('⚠️ Still on organization flow. URL:', currentUrl);

    // Try one more time to complete organization flow
    if (stillOrgSetup) {
      await page.fill('input[placeholder="My Organization"]', 'Test Organization');
      await page.click('button:has-text("Continue")');
      await page.waitForLoadState('networkidle');
    }

    if (stillOrgSelection) {
      await page.click('text=Test Organization').catch(() => {
        console.log('Could not select organization');
      });
      await page.waitForLoadState('networkidle');
    }
  }

  console.log('✅ Authentication flow completed!');

  // Save authentication state
  await page.context().storageState({ path: authFile });
});
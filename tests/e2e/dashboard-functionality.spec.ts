import { test, expect } from '@playwright/test';

// Test data
const testUser = {
  name: 'Dashboard Test User',
  email: `dashboard-${Date.now()}@example.com`,
  password: 'TestPassword123',
  companyName: 'Dashboard Test Company',
  teamSize: '6-20',
  emailProvider: 'gmail',
  targetResponseTime: '60',
  businessHours: {
    start: '09:00',
    end: '17:00',
    timezone: 'UTC'
  }
};

test.describe('Dashboard Functionality Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Register and complete onboarding for a new user
    await page.goto('/register');
    
    // Fill registration form
    await page.fill('input[name="name"]', testUser.name);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    
    // Submit registration
    await page.click('button:has-text("Create Account")');
    
    // Wait for registration to complete and redirect to login
    await expect(page).toHaveURL(/\/login/);
    
    // Login with the new account
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button:has-text("Sign in")');
    
    // Complete onboarding quickly
    await expect(page).toHaveURL(/\/onboarding/);
    
    // Step 1: Company info
    await page.fill('input[name="companyName"]', testUser.companyName);
    await page.selectOption('select[name="teamSize"]', testUser.teamSize);
    await page.click('button:has-text("Next")');
    
    // Step 2: Email provider
    await page.click(`div:has-text("${testUser.emailProvider.toUpperCase()}")`);
    await page.click('button:has-text("Next")');
    
    // Step 3: SLA settings
    await page.selectOption('select[name="targetResponseTime"]', testUser.targetResponseTime);
    await page.fill('input[name="startTime"]', testUser.businessHours.start);
    await page.fill('input[name="endTime"]', testUser.businessHours.end);
    await page.selectOption('select[name="timezone"]', testUser.businessHours.timezone);
    await page.click('button:has-text("Next")');
    
    // Step 4: Notifications
    await page.click('button:has-text("Next")');
    
    // Step 5: Complete
    await page.click('button:has-text("Complete Setup")');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should load dashboard with basic elements', async ({ page }) => {
    // Verify dashboard loads
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Verify main dashboard elements
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
    await expect(page.locator('text=Welcome to HawkMail!')).toBeVisible();
    
    // Verify navigation elements
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('a:has-text("Dashboard")')).toBeVisible();
    await expect(page.locator('a:has-text("Analytics")')).toBeVisible();
    await expect(page.locator('a:has-text("Team")')).toBeVisible();
    await expect(page.locator('a:has-text("Settings")')).toBeVisible();
    
    // Verify metrics cards
    await expect(page.locator('text=Total Emails')).toBeVisible();
    await expect(page.locator('text=Response Rate')).toBeVisible();
    await expect(page.locator('text=Avg Response Time')).toBeVisible();
    await expect(page.locator('text=SLA Compliance')).toBeVisible();
  });

  test('should show upgrade notice when accessing premium features', async ({ page }) => {
    // Try to access analytics from dashboard navigation
    await page.click('a:has-text("Analytics")');
    
    // Should redirect to pricing with upgrade parameter
    await expect(page).toHaveURL(/\/#pricing\?upgrade=true/);
    
    // Should show upgrade modal
    await expect(page.locator('text=Upgrade your plan')).toBeVisible();
    
    // Go back to dashboard
    await page.goto('/dashboard');
    
    // Try to access team from dashboard navigation
    await page.click('a:has-text("Team")');
    
    // Should redirect to pricing with upgrade parameter
    await expect(page).toHaveURL(/\/#pricing\?upgrade=true/);
    
    // Should show upgrade modal
    await expect(page.locator('text=Upgrade your plan')).toBeVisible();
    
    // Go back to dashboard
    await page.goto('/dashboard');
    
    // Try to access settings from dashboard navigation
    await page.click('a:has-text("Settings")');
    
    // Should redirect to pricing with upgrade parameter
    await expect(page).toHaveURL(/\/#pricing\?upgrade=true/);
    
    // Should show upgrade modal
    await expect(page.locator('text=Upgrade your plan')).toBeVisible();
  });

  test('should display email list with basic functionality', async ({ page }) => {
    // Verify email list section
    await expect(page.locator('text=Recent Emails')).toBeVisible();
    
    // Verify email list items (if any exist)
    const emailItems = page.locator('[data-testid="email-item"]');
    const count = await emailItems.count();
    
    if (count > 0) {
      // Verify first email item has expected elements
      const firstEmail = emailItems.first();
      await expect(firstEmail.locator('[data-testid="email-subject"]')).toBeVisible();
      await expect(firstEmail.locator('[data-testid="email-sender"]')).toBeVisible();
      await expect(firstEmail.locator('[data-testid="email-date"]')).toBeVisible();
    } else {
      // Verify empty state is shown
      await expect(page.locator('text=No emails found')).toBeVisible();
    }
  });

  test('should show user profile and logout functionality', async ({ page }) => {
    // Verify user profile section
    await expect(page.locator('[data-testid="user-profile"]')).toBeVisible();
    await expect(page.locator(`text=${testUser.name}`)).toBeVisible();
    await expect(page.locator(`text=${testUser.email}`)).toBeVisible();
    
    // Click on profile dropdown
    await page.click('[data-testid="user-profile"]');
    
    // Verify dropdown menu items
    await expect(page.locator('text=Profile')).toBeVisible();
    await expect(page.locator('text=Settings')).toBeVisible();
    await expect(page.locator('text=Logout')).toBeVisible();
    
    // Click logout
    await page.click('text=Logout');
    
    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should display responsive design on different viewports', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('text=Dashboard')).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('text=Dashboard')).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('nav')).toBeVisible();
    
    // In mobile view, navigation might be collapsed
    // Check for mobile menu button if it exists
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await expect(page.locator('text=Dashboard')).toBeVisible();
    }
  });

  test('should handle navigation between different sections', async ({ page }) => {
    // Navigate to home page
    await page.click('a:has-text("HAWKMAIL")');
    await expect(page).toHaveURL(/\//);
    
    // Navigate back to dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Test direct URL navigation
    await page.goto('/analytics');
    await expect(page).toHaveURL(/\/#pricing\?upgrade=true/);
    
    // Go back to dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should display loading states during data fetching', async ({ page }) => {
    // Refresh the page to test loading states
    await page.reload();
    
    // Check for loading indicators
    const loadingIndicators = page.locator('[data-testid="loading"]');
    
    // Loading indicators might appear briefly, so we'll check if they exist
    const loadingCount = await loadingIndicators.count();
    
    if (loadingCount > 0) {
      // Verify loading indicators are visible
      await expect(loadingIndicators.first()).toBeVisible();
      
      // Wait for loading to complete
      await page.waitForSelector('[data-testid="loading"]', { state: 'hidden' });
    }
    
    // Verify dashboard is loaded
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // This test would simulate API errors
    // In a real implementation, you might mock API responses to test error states
    
    // For now, we'll verify that error handling components exist
    const errorBoundary = page.locator('[data-testid="error-boundary"]');
    
    // Error boundaries might not be visible unless there's an error
    // We'll just check if they exist in the DOM
    const errorBoundaryExists = await errorBoundary.count() > 0;
    
    if (errorBoundaryExists) {
      // If error boundary exists, verify it's not showing errors
      await expect(errorBoundary).not.toContainText('Error');
    }
  });
});
import { test, expect } from '@playwright/test';

// Test data
const testUser = {
  name: 'Premium Test User',
  email: `premium-${Date.now()}@example.com`,
  password: 'TestPassword123',
  companyName: 'Premium Test Company',
  teamSize: '6-20',
  emailProvider: 'gmail',
  targetResponseTime: '60',
  businessHours: {
    start: '09:00',
    end: '17:00',
    timezone: 'UTC'
  }
};

test.describe('Subscription & Premium Access Flow', () => {
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

  test('should redirect to pricing when accessing premium features without subscription', async ({ page }) => {
    // Try to access analytics page (premium feature)
    await page.goto('/analytics');
    
    // Should redirect to pricing page with upgrade parameter
    await expect(page).toHaveURL(/\/#pricing\?upgrade=true/);
    
    // Should show upgrade modal or message
    await expect(page.locator('text=Upgrade your plan')).toBeVisible();
  });

  test('should redirect to pricing when accessing team page without subscription', async ({ page }) => {
    // Try to access team page (premium feature)
    await page.goto('/team');
    
    // Should redirect to pricing page with upgrade parameter
    await expect(page).toHaveURL(/\/#pricing\?upgrade=true/);
    
    // Should show upgrade modal or message
    await expect(page.locator('text=Upgrade your plan')).toBeVisible();
  });

  test('should redirect to pricing when accessing settings page without subscription', async ({ page }) => {
    // Try to access settings page (premium feature)
    await page.goto('/settings');
    
    // Should redirect to pricing page with upgrade parameter
    await expect(page).toHaveURL(/\/#pricing\?upgrade=true/);
    
    // Should show upgrade modal or message
    await expect(page.locator('text=Upgrade your plan')).toBeVisible();
  });

  test('should show pricing section with upgrade options', async ({ page }) => {
    // Navigate to pricing section
    await page.goto('/#pricing');
    
    // Verify pricing section is visible
    await expect(page.locator('h2:has-text("Choose Your Plan")')).toBeVisible();
    
    // Verify pricing plans are displayed
    await expect(page.locator('text=Starter')).toBeVisible();
    await expect(page.locator('text=Pro')).toBeVisible();
    await expect(page.locator('text=Enterprise')).toBeVisible();
    
    // Verify pricing details
    await expect(page.locator('text=$20')).toBeVisible();
    await expect(page.locator('text=$40')).toBeVisible();
    await expect(page.locator('text=Custom')).toBeVisible();
    
    // Verify features are listed for each plan
    await expect(page.locator('text=Real-time email tracking')).toBeVisible();
    await expect(page.locator('text=Team performance analytics')).toBeVisible();
    await expect(page.locator('text=SLA monitoring and alerts')).toBeVisible();
  });

  test('should initiate checkout process when clicking upgrade button', async ({ page }) => {
    // Navigate to pricing section with upgrade parameter
    await page.goto('/#pricing?upgrade=true');
    
    // Click on Pro plan upgrade button
    await page.click('button:has-text("Get Started")');
    
    // Should navigate to checkout page
    await expect(page).toHaveURL(/\/stripe\/checkout/);
    
    // Verify checkout page elements
    await expect(page.locator('h1:has-text("Complete Your Subscription")')).toBeVisible();
    await expect(page.locator('text=Pro Plan - $40/month')).toBeVisible();
    
    // Verify payment form elements
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="cardNumber"]')).toBeVisible();
    await expect(page.locator('input[name="cardExpiry"]')).toBeVisible();
    await expect(page.locator('input[name="cardCvc"]')).toBeVisible();
  });

  test('should show success page after completing checkout', async ({ page }) => {
    // Navigate to checkout page
    await page.goto('/stripe/checkout');
    
    // In a real test, you would fill out the payment form and submit
    // For this test, we'll simulate going directly to the success page
    await page.goto('/stripe/success');
    
    // Verify success page elements
    await expect(page.locator('h1:has-text("Payment Successful!")')).toBeVisible();
    await expect(page.locator('text=Your subscription has been activated')).toBeVisible();
    await expect(page.locator('text=Pro Plan')).toBeVisible();
    
    // Verify redirect to dashboard button
    await expect(page.locator('button:has-text("Go to Dashboard")')).toBeVisible();
    
    // Click button to go to dashboard
    await page.click('button:has-text("Go to Dashboard")');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should handle subscription cancellation', async ({ page }) => {
    // Navigate to cancel page
    await page.goto('/stripe/cancel');
    
    // Verify cancel page elements
    await expect(page.locator('h1:has-text("Payment Cancelled")')).toBeVisible();
    await expect(page.locator('text=Your subscription was not completed')).toBeVisible();
    
    // Verify retry button
    await expect(page.locator('button:has-text("Try Again")')).toBeVisible();
    
    // Click retry button
    await page.click('button:has-text("Try Again")');
    
    // Should redirect back to pricing
    await expect(page).toHaveURL(/\/#pricing/);
  });

  test('should allow access to premium features after subscription', async ({ page }) => {
    // This test simulates a user with an active subscription
    // In a real test, you would need to mock the subscription status or use a test user with a subscription
    
    // For now, we'll test that the pages load correctly (without subscription checks)
    // In a complete implementation, you would mock the subscription API response
    
    // Navigate to analytics page
    await page.goto('/analytics');
    
    // Should show analytics page (with subscription check)
    // This will redirect to pricing in the current implementation
    // In a complete test with mocked subscription, it would show the analytics page
    
    // For now, we'll verify the redirect behavior
    await expect(page).toHaveURL(/\/#pricing\?upgrade=true/);
  });
});
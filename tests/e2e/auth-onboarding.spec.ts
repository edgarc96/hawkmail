import { test, expect } from '@playwright/test';

// Test data
const testUser = {
  name: 'Test User',
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123',
  companyName: 'Test Company',
  teamSize: '6-20',
  emailProvider: 'gmail',
  targetResponseTime: '60',
  businessHours: {
    start: '09:00',
    end: '17:00',
    timezone: 'UTC'
  }
};

test.describe('Authentication & Onboarding Flow', () => {
  test('should complete full registration and onboarding flow', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/register');
    
    // Verify registration page loads
    await expect(page.locator('h1')).toContainText('Create your account');
    await expect(page.locator('text=Start optimizing your email response times')).toBeVisible();
    
    // Fill registration form
    await page.fill('input[name="name"]', testUser.name);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    
    // Submit registration
    await page.click('button:has-text("Create Account")');
    
    // Wait for registration to complete and redirect to login
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('text=Account created successfully')).toBeVisible();
    
    // Login with the new account
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button:has-text("Sign in")');
    
    // Should redirect to onboarding for new user
    await expect(page).toHaveURL(/\/onboarding/);
    
    // Complete onboarding step 1: Company info
    await expect(page.locator('h1')).toContainText('Welcome to HawkMail!');
    await page.fill('input[name="companyName"]', testUser.companyName);
    await page.selectOption('select[name="teamSize"]', testUser.teamSize);
    await page.click('button:has-text("Next")');
    
    // Complete onboarding step 2: Email provider
    await expect(page.locator('h1')).toContainText('Connect Your Email');
    await page.click(`div:has-text("${testUser.emailProvider.toUpperCase()}")`);
    await page.click('button:has-text("Next")');
    
    // Complete onboarding step 3: SLA settings
    await expect(page.locator('h1')).toContainText('Set Your SLA Goals');
    await page.selectOption('select[name="targetResponseTime"]', testUser.targetResponseTime);
    await page.fill('input[name="startTime"]', testUser.businessHours.start);
    await page.fill('input[name="endTime"]', testUser.businessHours.end);
    await page.selectOption('select[name="timezone"]', testUser.businessHours.timezone);
    await page.click('button:has-text("Next")');
    
    // Complete onboarding step 4: Notifications
    await expect(page.locator('h1')).toContainText('Notification Preferences');
    // Keep default notifications settings
    await page.click('button:has-text("Next")');
    
    // Complete onboarding step 5: Review and complete
    await expect(page.locator('h1')).toContainText('You\'re All Set!');
    await expect(page.locator(`text=${testUser.companyName}`)).toBeVisible();
    await expect(page.locator(`text=${testUser.teamSize}`)).toBeVisible();
    await expect(page.locator(`text=${testUser.emailProvider}`)).toBeVisible();
    await expect(page.locator(`text=${testUser.targetResponseTime} minutes`)).toBeVisible();
    
    // Complete onboarding
    await page.click('button:has-text("Complete Setup")');
    
    // Should redirect to dashboard after completing onboarding
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('text=Welcome to HawkMail! Your account is ready')).toBeVisible();
  });

  test('should handle login with existing user', async ({ page }) => {
    // This test assumes a user already exists from previous test
    // In a real scenario, you might want to create a test user beforehand
    
    // Navigate to login page
    await page.goto('/login');
    
    // Verify login page loads
    await expect(page.locator('h1')).toContainText('Welcome back');
    await expect(page.locator('text=Sign in to follow up conversations and SLA commitments')).toBeVisible();
    
    // Fill login form
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    
    // Submit login
    await page.click('button:has-text("Sign in")');
    
    // Should redirect to dashboard (user has completed onboarding)
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should redirect to onboarding for new user who skips onboarding', async ({ page, browser }) => {
    // Create a new browser context to simulate a fresh session
    const newContext = await browser.newContext();
    const newPage = await newContext.newPage();
    
    // Register a new user but we'll simulate skipping onboarding
    await newPage.goto('/register');
    
    const freshUser = {
      ...testUser,
      email: `fresh-${Date.now()}@example.com`,
      name: 'Fresh User'
    };
    
    // Fill registration form
    await newPage.fill('input[name="name"]', freshUser.name);
    await newPage.fill('input[name="email"]', freshUser.email);
    await newPage.fill('input[name="password"]', freshUser.password);
    await newPage.fill('input[name="confirmPassword"]', freshUser.password);
    
    // Submit registration
    await newPage.click('button:has-text("Create Account")');
    
    // Wait for registration to complete and redirect to login
    await expect(newPage).toHaveURL(/\/login/);
    
    // Login with the new account
    await newPage.fill('input[type="email"]', freshUser.email);
    await newPage.fill('input[type="password"]', freshUser.password);
    await newPage.click('button:has-text("Sign in")');
    
    // Should redirect to onboarding for new user (middleware check)
    await expect(newPage).toHaveURL(/\/onboarding/);
    
    // Clean up
    await newContext.close();
  });

  test('should show validation errors for invalid registration data', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/register');
    
    // Try to submit empty form
    await page.click('button:has-text("Create Account")');
    
    // Should show validation errors (HTML5 validation)
    await expect(page.locator('input:invalid')).toHaveCount(4); // name, email, password, confirm password
    
    // Try to submit with mismatched passwords
    await page.fill('input[name="name"]', testUser.name);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', 'DifferentPassword');
    
    await page.click('button:has-text("Create Account")');
    
    // Should show password mismatch error
    await expect(page.locator('text=Passwords do not match')).toBeVisible();
    
    // Try to submit with short password
    await page.fill('input[name="password"]', 'short');
    await page.fill('input[name="confirmPassword"]', 'short');
    
    await page.click('button:has-text("Create Account")');
    
    // Should show password length error
    await expect(page.locator('text=Password must be at least 8 characters long')).toBeVisible();
  });

  test('should handle invalid login credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Try to login with invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'InvalidPassword');
    
    await page.click('button:has-text("Sign in")');
    
    // Should show error message
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
  });
});
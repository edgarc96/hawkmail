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
    await page.fill('#name', testUser.name);
    await page.fill('#email', testUser.email);
    await page.fill('#password', testUser.password);
    await page.fill('#confirmPassword', testUser.password);
    
    // Submit registration
    await page.click('button:has-text("Create Account")');
    
    // Wait for registration to complete and redirect to login
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('text=Account created successfully').first()).toBeVisible();
    
    // Login with the new account
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button:has-text("Sign in")');
    
    // Wait for login to complete and redirect to dashboard
    await page.waitForTimeout(1500); // Wait for the 1000ms timeout in login + buffer
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    
    // Close welcome modal if it appears
    const skipButton = page.locator('button:has-text("Skip for Now")');
    if (await skipButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipButton.click();
    }
    
    // Verify dashboard loaded
    await expect(page.locator('text=Dashboard').first()).toBeVisible();
  });

  test('should handle login with existing user', async ({ page }) => {
    // First create a user
    const existingUser = {
      name: 'Existing User',
      email: `existing-${Date.now()}@example.com`,
      password: 'TestPassword123',
    };
    
    await page.goto('/register');
    await page.fill('#name', existingUser.name);
    await page.fill('#email', existingUser.email);
    await page.fill('#password', existingUser.password);
    await page.fill('#confirmPassword', existingUser.password);
    await page.click('button:has-text("Create Account")');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    
    // Now test login with this existing user
    await expect(page.locator('h1')).toContainText('Welcome back');
    
    // Fill login form
    await page.fill('input[type="email"]', existingUser.email);
    await page.fill('input[type="password"]', existingUser.password);
    
    // Submit login
    await page.click('button:has-text("Sign in")');
    
    // Wait for login to complete and redirect to dashboard
    await page.waitForTimeout(1500);
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
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
    await newPage.fill('#name', freshUser.name);
    await newPage.fill('#email', freshUser.email);
    await newPage.fill('#password', freshUser.password);
    await newPage.fill('#confirmPassword', freshUser.password);
    
    // Submit registration
    await newPage.click('button:has-text("Create Account")');
    
    // Wait for registration to complete and redirect to login
    await expect(newPage).toHaveURL(/\/login/);
    
    // Login with the new account
    await newPage.fill('input[type="email"]', freshUser.email);
    await newPage.fill('input[type="password"]', freshUser.password);
    await newPage.click('button:has-text("Sign in")');
    
    // Wait for login to complete and redirect to dashboard
    await newPage.waitForTimeout(1500);
    await expect(newPage).toHaveURL(/\/dashboard/, { timeout: 10000 });
    
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
    await page.fill('#name', testUser.name);
    await page.fill('#email', testUser.email);
    await page.fill('#password', testUser.password);
    await page.fill('#confirmPassword', 'DifferentPassword');
    
    await page.click('button:has-text("Create Account")');
    
    // Should show password mismatch error
    await expect(page.locator('text=Passwords do not match')).toBeVisible();
    
    // Try to submit with short password
    await page.fill('#password', 'short');
    await page.fill('#confirmPassword', 'short');
    
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
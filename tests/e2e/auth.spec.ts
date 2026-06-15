// @ts-nocheck
import { test, expect } from '@playwright/test'

test.describe('Authentication and Navigation Flow', () => {
  test('should load the landing page and navigate to login', async ({ page }) => {
    // Navigate to landing page
    await page.goto('/')

    // Expect page title to include Docto or similar matching content
    await expect(page).toHaveTitle(/Docto/)

    // Find and click login button
    const loginLink = page.locator('a[href="/login"]')
    if (await loginLink.count() > 0) {
      await loginLink.click()
      await expect(page).toHaveURL(/\/login/)
    }
  })

  test('should render the login form components', async ({ page }) => {
    // Navigate directly to login
    await page.goto('/login')

    // Verify presence of email and password fields
    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]')
    const submitBtn = page.locator('button[type="submit"]')

    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    await expect(submitBtn).toBeVisible()
  })

  test('should redirect unauthenticated users to login from protected routes', async ({ page }) => {
    // Try to visit a protected doctor route
    await page.goto('/doctor/planner')

    // Wait for redirect to login page (auth middleware behavior)
    await expect(page).toHaveURL(/\/login/)
  })
})

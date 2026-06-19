import { test, expect } from '@playwright/test'

test('doctor session transcription and AI summary extraction flow', async ({ page }) => {
  // Set high timeout for this test as the NVIDIA API takes ~70-120 seconds to extract
  test.setTimeout(240000);

  // Capture page console logs
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] [${msg.type()}] ${msg.text()}`);
  });

  // Capture page errors
  page.on('pageerror', err => {
    console.log(`[BROWSER ERROR] ${err.message}`);
  });

  console.log("Navigating to login page...");
  await page.goto('/login')

  console.log("Filling login credentials...");
  await page.fill('input[type="email"]', 'staff@123.com')
  await page.fill('input[type="password"]', 'Password123!')
  await page.click('button[type="submit"]')

  console.log("Waiting for redirection to doctor planner/dashboard...");
  await page.waitForURL(/\/doctor\//)
  console.log("Successfully logged in! Current URL:", page.url())

  const patientId = '560dd2e4-c3c8-466e-a167-1a6a6ad0dc8a'
  const sessionUrl = `/doctor/session/${patientId}`
  console.log(`Navigating to doctor session page: ${sessionUrl}...`)
  await page.goto(sessionUrl)

  // Wait for the prepare session state to end
  console.log("Waiting for session page to load...")
  await page.waitForSelector('#start-session-btn', { timeout: 20000 })
  console.log("Session page loaded successfully.")

  // Check if "Load Demo Transcript" button exists and click it
  console.log("Clicking 'Load Demo Transcript' button...")
  await page.click('text=Load Demo Transcript')

  // Verify the transcript is loaded
  console.log("Verifying transcript loading...")
  await expect(page.locator('text=Good morning. What brings you in today?')).toBeVisible()
  console.log("Demo transcript loaded successfully.")

  // Click "Extract AI Insights"
  console.log("Clicking 'Extract AI Insights' button...")
  await page.click('#manual-extract-btn')

  // Wait for the AI extraction to complete (this might take up to 120 seconds due to Llama 3.3 model latency)
  console.log("Waiting for AI extraction to complete (polling status)...")
  
  // Wait until the "Review Required" or "Clinical Summary" text is visible
  await page.waitForSelector('text=Clinical Summary', { timeout: 180000 })
  console.log("AI Extraction succeeded! Clinical Summary is visible.")

  // Let's verify other components like Diagnosis, Symptoms, and Prescriptions using specific locators
  await expect(page.locator('text=Symptoms & Issues').first()).toBeVisible()
  await expect(page.locator('text=Diagnosis').first()).toBeVisible()
  await expect(page.locator('text=Prescription').first()).toBeVisible()
  
  console.log("Test finished successfully with all elements verified!");
})

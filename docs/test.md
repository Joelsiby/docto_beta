# 🧪 Docto Testing Documentation

This document explains the testing setup for the Docto application, the tools used, and how to execute and write tests.

---

## 🛠️ Testing Stack

Docto uses a modern, two-tiered testing stack:
1.  **Vitest**: A fast unit/component test runner powered by Vite. Used for testing utilities, hooks, stores, and individual React components.
2.  **Playwright**: A robust End-to-End (E2E) browser automation framework. Used to simulate real user actions (login, navigation, forms) in headless or headed Chromium, Firefox, and WebKit browsers.

---

## 📦 Prerequisites

Before running tests, install the new devDependencies added to `package.json`:

```bash
# 1. Install all package dependencies (including Vitest & Playwright)
npm install

# 2. Install Playwright browser binaries
npx playwright install
```

---

## 🏃‍♂️ How to Run Tests

All test runners have dedicated npm scripts configured in `package.json`.

### 1. Unit & Store Tests (Vitest)
Unit tests are located alongside code files (e.g. `lib/utils/format.test.ts`, `stores/session-store.test.ts`).

*   **Run once (CI/Production check)**:
    ```bash
    npm run test
    ```
*   **Watch mode (Development/Interactive)**:
    ```bash
    npm run test:watch
    ```

### 2. End-to-End Tests (Playwright)
E2E tests are located in the `tests/e2e/` folder. Playwright will automatically start `npm run dev` in the background if it's not already running.

*   **Run all E2E tests**:
    ```bash
    npm run test:e2e
    ```
*   **Run in UI Mode (Interactive Debugging)**:
    ```bash
    npx playwright test --ui
    ```
*   **Run a specific test file**:
    ```bash
    npx playwright test tests/e2e/auth.spec.ts
    ```

---

## 📂 Testing Architecture & Configurations

*   [vitest.config.ts](file:///d:/OneStone/Docto/docto_beta/vitest.config.ts): Registers the `@/` path alias and sets the test environment to `jsdom` (simulates a browser DOM in Node).
*   [vitest.setup.ts](file:///d:/OneStone/Docto/docto_beta/vitest.setup.ts): Configures Jest-DOM matches so you can write assertions like `expect(element).toBeVisible()`.
*   [playwright.config.ts](file:///d:/OneStone/Docto/docto_beta/playwright.config.ts): Configures browser profiles, workers, base URL (`http://localhost:3000`), and automatic webServer execution.

---

## ✏️ Writing New Tests

### Unit Test Example
Create a `.test.ts` or `.test.tsx` file:
```ts
import { describe, it, expect } from 'vitest'
import { myUtility } from './my-utility'

describe('myUtility', () => {
  it('should return correct results', () => {
    expect(myUtility(2)).toBe(4)
  })
})
```

### E2E Test Example
Create a `.spec.ts` file in `tests/e2e/`:
```ts
import { test, expect } from '@playwright/test'

test('should show dashboard headers', async ({ page }) => {
  await page.goto('/patient/dashboard')
  await expect(page.locator('h1')).toContainText('Welcome')
})
```

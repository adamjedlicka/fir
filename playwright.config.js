// @ts-check

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  globalSetup: './tests/globalSetup.js',
  globalTeardown: './tests/globalTeardown.js',
  retries: 3,
}

export default config

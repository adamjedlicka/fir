// @ts-check

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  globalSetup: './tests/globalSetup.js',
  globalTeardown: './tests/globalTeardown.js',
  workers: 1,
}

export default config

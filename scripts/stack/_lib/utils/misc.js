/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @param {string} url
 */
export async function waitUntilServiceIsAvailable(
  url,
  maxRetries = 10,
  retryIntervalInMs = 1000,
) {
  let retries = 0;
  let isResponseOk = false;
  while (!isResponseOk) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        isResponseOk = true;
      }
    } catch (error) {
      retries += 1;
      if (retries >= maxRetries) {
        throw new Error(
          `Timed out while checking availability of service at ${url}`,
        );
      }
      await sleep(retryIntervalInMs);
    }
  }
}

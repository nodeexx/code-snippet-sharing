/**
 * @param {(...args: any[]) => Promise<any> | any} callback
 */
export async function logAndIgnoreError(callback) {
  try {
    await callback();
  } catch (error) {
    console.error(error);
  }
}

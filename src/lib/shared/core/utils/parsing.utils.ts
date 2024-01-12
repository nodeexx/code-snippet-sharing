/**
 * Useful for parsing return value of `URLSearchParams.get()`
 */
export function attemptToParseAsNumber(
  value: string | null,
): number | undefined {
  if (value && isStringParsableAsNumber(value)) {
    return Number(value);
  }

  return undefined;
}

export function isStringParsableAsNumber(value: string): boolean {
  return !isNaN(Number(value));
}

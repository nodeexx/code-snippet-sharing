export function getMockWithType<T>(event: Partial<T>): T {
  return event as T;
}

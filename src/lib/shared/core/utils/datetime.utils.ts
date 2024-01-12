import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export { dayjs };

export function formatUtcDateTime(date: Date): string {
  return dayjs(date).utc().format('YYYY-MM-DDTHH:mm[Z]');
}

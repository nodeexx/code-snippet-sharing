// @ts-expect-error
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
// @ts-expect-error
import { check, sleep } from 'k6';
// @ts-expect-error
import http from 'k6/http';
// @ts-expect-error
import { Rate } from 'k6/metrics';

// Define the failure rate
let failureRate = new Rate('failed_requests');

export let options = {
  stages: [
    { duration: '10s', target: 10 }, // ramp up to 5 requests per second over 10 seconds
    { duration: '10s', target: 10 }, // stay at 5 requests per second for 10 seconds
    { duration: '10s', target: 1 }, // ramp down to 1 request per second over 10 seconds
  ],
  thresholds: {
    'http_req_duration{scenario:default}': ['p(95)<5000'], // Test fails if 95th percentile of request durations is higher than 5 seconds
    failed_requests: ['rate<0.01'], // Fail if more than 1% of requests fail
  },
};

export default function () {
  let response = http.get('http://staging-code-snippet-sharing.nodeexx.com');

  // Check each response for a 200 status code
  const checkRes = check(response, {
    // @ts-expect-error
    'status is 200': (r) => r.status === 200,
  });

  // Track the failed requests
  failureRate.add(!checkRes);

  // Since the test doesn't precisely control the request rate to exactly match the target,
  // sleeping for a short duration helps to regulate the execution pace.
  sleep(1);
}

// @ts-expect-error
export function handleSummary(data) {
  return {
    'summary.html': htmlReport(data),
  };
}

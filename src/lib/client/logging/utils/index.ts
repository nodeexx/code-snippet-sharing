import type { LogLevelName } from '../types';

export const logLevels = {
  debug: 10,
  log: 20,
  info: 30,
  warn: 40,
  error: 50,
} as const;

export const logLevelColors = {
  debug: {
    backgroundColor: '#666',
    color: '#fff',
  },
  error: {
    backgroundColor: '#f05033',
    color: '#fff',
  },
  info: {
    backgroundColor: '#3174f1',
    color: '#fff',
  },
  log: {
    backgroundColor: '#712bde',
    color: '#fff',
  },
  warn: {
    backgroundColor: '#f5a623',
    color: '#000',
  },
} satisfies {
  [key in LogLevelName]: { backgroundColor: string; color: string };
};

export const logTimestampColors = {
  debug: {
    color: '#999',
  },
  error: {
    color: '#ff1a1a',
  },
  info: {
    color: '#3291ff',
  },
  log: {
    color: '#8367d3',
  },
  warn: {
    color: '#f7b955',
  },
} satisfies {
  [key in LogLevelName]: { color: string };
};

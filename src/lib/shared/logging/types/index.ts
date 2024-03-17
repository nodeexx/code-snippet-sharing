export interface LoggerContext {
  sentryTraceId?: string;
  [k: string]: any;
}

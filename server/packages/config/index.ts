export type DeploymentEnv = 'development' | 'test' | 'production';

export interface ServiceEndpoint {
  port: number;
  url: string;
}

export interface PlatformConfig {
  nodeEnv: DeploymentEnv;
  isProduction: boolean;
  dbUrl: string;
  jwtSecret?: string;
  host: string;
  logLevel: string;
  corsOrigins: string[];
  requestTimeoutMs: number;
  shutdownTimeoutMs: number;
  serviceAuthToken?: string;
  services: {
    auth: ServiceEndpoint;
    candidate: ServiceEndpoint;
    manifesto: ServiceEndpoint;
    issueReporting: ServiceEndpoint;
    debate: ServiceEndpoint;
    promiseTracker: ServiceEndpoint;
    voting: ServiceEndpoint;
    identity: ServiceEndpoint;
    ledger: ServiceEndpoint;
    audit: ServiceEndpoint;
    misinformationAi: ServiceEndpoint;
  };
}

const DEFAULT_DB_URL = 'postgresql://postgres:postgres@localhost:5432/eloktantra';
const DEFAULT_HOST = '0.0.0.0';
const DEFAULT_REQUEST_TIMEOUT_MS = 10_000;
const DEFAULT_SHUTDOWN_TIMEOUT_MS = 10_000;

function readNodeEnv(): DeploymentEnv {
  const value = (process.env.NODE_ENV || 'development').toLowerCase();
  if (value === 'production' || value === 'test') {
    return value;
  }
  return 'development';
}

function parseNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseCsv(value: string | undefined, fallback: string[]): string[] {
  if (!value) return fallback;
  const items = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length > 0 ? items : fallback;
}

function resolveServiceEndpoint(prefix: string, fallbackPort: number): ServiceEndpoint {
  const port = parseNumber(process.env[`${prefix}_SERVICE_PORT`], fallbackPort);
  const url = process.env[`${prefix}_SERVICE_URL`] || `http://localhost:${port}`;
  return { port, url };
}

const nodeEnv = readNodeEnv();
const isProduction = nodeEnv === 'production';
const defaultLogLevel = isProduction ? 'info' : 'debug';

export const config: PlatformConfig = {
  nodeEnv,
  isProduction,
  dbUrl: process.env.DATABASE_URL || DEFAULT_DB_URL,
  jwtSecret: process.env.JWT_SECRET,
  host: process.env.HOST || DEFAULT_HOST,
  logLevel: process.env.LOG_LEVEL || defaultLogLevel,
  corsOrigins: parseCsv(process.env.CORS_ORIGINS, ['*']),
  requestTimeoutMs: parseNumber(process.env.REQUEST_TIMEOUT_MS, DEFAULT_REQUEST_TIMEOUT_MS),
  shutdownTimeoutMs: parseNumber(process.env.SHUTDOWN_TIMEOUT_MS, DEFAULT_SHUTDOWN_TIMEOUT_MS),
  serviceAuthToken: process.env.SERVICE_AUTH_TOKEN,
  services: {
    auth: resolveServiceEndpoint('AUTH', 4001),
    candidate: resolveServiceEndpoint('CANDIDATE', 4002),
    manifesto: resolveServiceEndpoint('MANIFESTO', 4003),
    issueReporting: resolveServiceEndpoint('ISSUE', 4004),
    debate: resolveServiceEndpoint('DEBATE', 4005),
    promiseTracker: resolveServiceEndpoint('PROMISE', 4006),
    voting: resolveServiceEndpoint('VOTING', 4007),
    identity: resolveServiceEndpoint('IDENTITY', 4008),
    ledger: resolveServiceEndpoint('LEDGER', 4009),
    audit: resolveServiceEndpoint('AUDIT', 4010),
    misinformationAi: resolveServiceEndpoint('AI', 4011),
  },
};

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function requireStrongSecret(name: string, minimumLength = 32): string {
  const value = requireEnv(name);
  if (value.length < minimumLength) {
    throw new Error(`${name} must be at least ${minimumLength} characters long for production-grade security.`);
  }
  return value;
}

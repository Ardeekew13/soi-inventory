/**
 * Rate Limiter - Prevents brute force and DDoS attacks
 * Limits requests per IP address
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Max requests per interval
}

export const rateLimitConfigs = {
  // Login attempts: 5 per 15 minutes
  login: {
    interval: 15 * 60 * 1000,
    maxRequests: 5
  },
  // GraphQL API: 100 requests per minute
  api: {
    interval: 60 * 1000,
    maxRequests: 100
  },
  // General: 200 requests per minute
  general: {
    interval: 60 * 1000,
    maxRequests: 200
  }
};

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = identifier;

  // Initialize or get existing record
  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + config.interval
    };
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: store[key].resetTime
    };
  }

  // Increment count
  store[key].count++;

  const allowed = store[key].count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - store[key].count);

  return {
    allowed,
    remaining,
    resetTime: store[key].resetTime
  };
}

export function getClientIdentifier(req: Request): string {
  // Try to get IP from various headers (for proxies/load balancers)
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  
  const ip = cfConnectingIp || forwarded?.split(',')[0] || realIp || 'unknown';
  
  return `ip:${ip}`;
}

# Security Implementation Guide

## Overview
This document outlines the security measures implemented to protect the SOI Inventory system from common web attacks and vulnerabilities.

## 🛡️ Security Layers Implemented

### 1. HTTP Security Headers
**Location**: `next.config.ts`

Implemented security headers:
- **Strict-Transport-Security (HSTS)**: Forces HTTPS connections for 2 years
- **X-Frame-Options**: Prevents clickjacking attacks by blocking iframe embedding
- **X-Content-Type-Options**: Prevents MIME type sniffing attacks
- **X-XSS-Protection**: Enables browser XSS protection
- **Referrer-Policy**: Controls referrer information leakage
- **Permissions-Policy**: Restricts access to sensitive browser APIs (camera, microphone, geolocation)
- **Content-Security-Policy (CSP)**: 
  - Restricts script sources to prevent XSS attacks
  - Only allows images from trusted domains
  - Blocks inline scripts (except where necessary for frameworks)
  - Prevents frame embedding by external sites

### 2. Rate Limiting
**Location**: `lib/rateLimiter.ts`, `app/api/graphql/route.ts`, `app/api/graphql/resolvers/authResolver.ts`

Protection against brute force and DDoS attacks:
- **Login Endpoint**: 5 attempts per 15 minutes per IP address
- **GraphQL API**: 100 requests per minute per IP address
- **General Endpoints**: 200 requests per minute per IP address

Features:
- IP-based tracking with support for proxy headers (X-Forwarded-For, X-Real-IP, CF-Connecting-IP)
- Automatic cleanup of old entries every 5 minutes
- Returns 429 (Too Many Requests) with Retry-After header when limit exceeded

### 3. Input Validation & Sanitization
**Location**: `lib/validation.ts`

Protection against injection attacks:
- **XSS Prevention**: Removes HTML tags and dangerous characters from user input
- **NoSQL Injection Prevention**: Strips MongoDB operators ($, ., etc.) from input
- **GraphQL Input Validation**: 
  - Type checking (string, number, boolean)
  - Length validation (max 1000 characters for strings)
  - Range validation for numbers
- **ObjectId Validation**: Ensures MongoDB IDs are valid format
- **Regex Injection Prevention**: Blocks dangerous regex patterns

### 4. Authentication & Authorization
**Location**: `lib/auth.ts`, `app/api/graphql/resolvers/authResolver.ts`

JWT-based authentication:
- **Token Expiration**: Tokens expire after 24 hours
- **HttpOnly Cookies**: Prevents XSS attacks from stealing tokens
- **Secure Flag**: Tokens only transmitted over HTTPS in production
- **SameSite Protection**: Prevents CSRF attacks
- **Input Sanitization**: Username sanitized before database queries
- **Rate Limited Login**: Prevents brute force password attacks

### 5. Database Security
**Location**: All GraphQL resolvers

Protection measures:
- **Soft Deletes**: Uses `isActive` flag instead of actual deletion
- **Input Sanitization**: All user inputs sanitized before MongoDB queries
- **NoSQL Injection Prevention**: Strips dangerous operators from queries
- **Password Hashing**: Uses bcrypt with salt for password storage
- **Role-Based Access Control**: Permissions checked before database operations

### 6. API Security
**Location**: `app/api/graphql/route.ts`

GraphQL API protection:
- Rate limiting on all requests
- Authentication middleware for protected queries
- Error message sanitization (no sensitive info leaked)
- CORS configuration (same-origin by default)

## 🔒 Security Best Practices

### Environment Variables
- ✅ `.env` files excluded from git via `.gitignore`
- ✅ `.env.example` template provided for setup
- ⚠️ **IMPORTANT**: Always use strong, random secrets in production
- ⚠️ **IMPORTANT**: Never commit actual `.env` files to version control

### Production Deployment Checklist
- [ ] Update `JWT_SECRET` to a strong random string (min 32 characters)
- [ ] Change `ADMIN_PASSWORD` to a secure password
- [ ] Verify `NODE_ENV=production` is set
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure proper CORS origins if needed
- [ ] Set up monitoring for rate limit violations
- [ ] Regular security audits of dependencies (`npm audit`)
- [ ] Keep all packages up to date
- [ ] Enable database backups
- [ ] Configure firewall rules for MongoDB

### Code Security Guidelines
1. **Always sanitize user input** before database queries
2. **Use parameterized queries** (already done with Mongoose)
3. **Validate all GraphQL inputs** with type checking
4. **Never log sensitive information** (passwords, tokens, etc.)
5. **Use prepared statements** for any raw queries
6. **Implement proper error handling** without exposing internals

## 🚨 Common Attack Vectors & Mitigations

| Attack Type | Mitigation Implemented |
|------------|------------------------|
| SQL/NoSQL Injection | Input sanitization, Mongoose ODM |
| XSS (Cross-Site Scripting) | CSP headers, HTML entity encoding |
| CSRF (Cross-Site Request Forgery) | SameSite cookies, token-based auth |
| Brute Force | Rate limiting on login (5/15min) |
| DDoS | Rate limiting on all APIs (100-200/min) |
| Clickjacking | X-Frame-Options: DENY |
| MIME Sniffing | X-Content-Type-Options: nosniff |
| Session Hijacking | HttpOnly cookies, Secure flag |
| Man-in-the-Middle | HSTS header, HTTPS enforcement |
| Data Exposure | Proper error handling, no stack traces in prod |

## 📊 Monitoring & Logging

### Rate Limit Monitoring
Monitor these metrics:
- Number of 429 (rate limit) responses per hour
- IPs triggering rate limits repeatedly
- Failed login attempts before lockout

### Security Event Logging
Log these events for audit:
- Failed login attempts (already logged)
- Rate limit violations
- Invalid token usage
- Permission denied events
- Unusual query patterns

## 🔧 Testing Security

### Manual Testing
1. **Rate Limiting**: Try 6+ login attempts in 15 minutes
2. **XSS Prevention**: Try `<script>alert('xss')</script>` in input fields
3. **NoSQL Injection**: Try `{"$gt": ""}` in login fields
4. **CSRF**: Try making requests from different origin
5. **Token Expiration**: Use expired JWT token

### Automated Testing
Consider adding:
- Security scanning tools (npm audit, Snyk)
- Penetration testing
- Dependency vulnerability monitoring
- OWASP ZAP for web application scanning

## 📚 References
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)

## 🆘 Incident Response

If a security breach is suspected:
1. **Immediate**: Rotate all JWT secrets and force re-authentication
2. **Review**: Check logs for suspicious activity
3. **Investigate**: Identify attack vector and affected data
4. **Patch**: Apply security fixes immediately
5. **Notify**: Inform affected users if data compromised
6. **Document**: Record incident for future prevention

## ⚙️ Maintenance

Regular security tasks:
- **Weekly**: Check `npm audit` for vulnerabilities
- **Monthly**: Review rate limit logs for patterns
- **Quarterly**: Update all dependencies
- **Yearly**: Full security audit and penetration testing

---

**Last Updated**: [Current Date]
**Maintained By**: Development Team

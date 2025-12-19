# Security Vulnerability Audit & Fixes

## 🔴 Critical Vulnerabilities Found

### 1. **NoSQL Injection in Login (CRITICAL)** ❌

**Location**: `app/api/graphql/resolvers/authResolver.ts`

**Current Code**:
```typescript
const user = await User.findOne({ 
  username: sanitizeMongoInput({ username: sanitizedUsername }).username, 
  isActive: true 
});
```

**Vulnerability**: 
- An attacker could send: `{ "username": { "$ne": null }, "password": "anything" }`
- This bypasses authentication if not properly sanitized

**Risk**: HIGH - Authentication bypass, unauthorized access

**Status**: ⚠️ PARTIALLY FIXED (sanitization added, but needs validation)

---

### 2. **Exposed Master Password in Code (CRITICAL)** ❌

**Location**: `app/api/graphql/resolvers/authResolver.ts`

**Current Code**:
```typescript
const isMasterPassword = password === process.env.ADMIN_PASSWORD;
```

**Vulnerabilities**:
- ❌ No rate limiting on master password attempts
- ❌ Same master password works for ALL users
- ❌ No audit log when master password is used
- ❌ Timing attack vulnerability (string comparison)

**Risk**: CRITICAL - Complete system compromise

**Exploitation**:
```bash
# Brute force master password
for password in $(cat common-passwords.txt); do
  curl -X POST /api/graphql \
    -d '{"query":"mutation{login(username:\"admin\",password:\"'$password'\")}"}'
done
```

**Status**: ⚠️ PARTIALLY FIXED (rate limiting added, but needs more)

---

### 3. **XSS via Unsanitized Product Names (HIGH)** ❌

**Location**: Multiple components displaying product data

**Current Code**:
```typescript
<Typography.Text>{product.name}</Typography.Text>
```

**Vulnerability**:
- Admin adds product: `<script>alert(document.cookie)</script>`
- Cashier opens POS: Script executes, steals session tokens

**Risk**: HIGH - Session hijacking, data theft

**Status**: ❌ NOT FIXED

---

### 4. **Client-Side Price Manipulation (HIGH)** ⚠️

**Location**: `app/(main)/point-of-sale/page.tsx`

**Current Code**:
```typescript
const items = cart.map((item) => ({
  productId: item._id,
  quantity: item.quantity,
}));
```

**Vulnerability**:
- Cart is stored in React state (client-side)
- Attacker can modify price in browser DevTools
- Server trusts client-sent data

**Exploitation**:
```javascript
// In browser console
cart[0].price = 0.01; // Change $100 item to $0.01
handleCheckout();
```

**Risk**: HIGH - Revenue loss, fraud

**Status**: ✅ MITIGATED (server recalculates prices from database)

---

### 5. **Insufficient Password Validation Modal Bypass (MEDIUM)** ⚠️

**Location**: `app/api/graphql/resolvers/authResolver.ts` - `verifyPassword`

**Current Code**:
```typescript
verifyPassword: async (_, { password }, { user }) => {
  // Check if password matches master password first
  const isMasterPassword = password === process.env.ADMIN_PASSWORD;
  if (isMasterPassword) {
    return { success: true, message: "Approved by system administrator." };
  }
  // ... check authorized users
}
```

**Vulnerabilities**:
- ❌ No audit trail for password verification
- ❌ No IP logging
- ❌ No notification when admin password used
- ⚠️ Rate limiting applies globally, not per-operation

**Risk**: MEDIUM - Unauthorized voids/refunds

**Status**: ⚠️ NEEDS IMPROVEMENT

---

### 6. **JWT Token Stored in Cookies Without CSRF Protection (MEDIUM)** ⚠️

**Location**: `app/api/graphql/resolvers/authResolver.ts`

**Current Code**:
```typescript
cookieStore.set({
  name: "auth_token",
  value: token,
  httpOnly: true,
  sameSite: "lax",  // ⚠️ Not 'strict'
  secure: process.env.NODE_ENV === "production",
});
```

**Vulnerability**:
- `sameSite: "lax"` allows cross-site requests in certain cases
- No CSRF token mechanism

**Risk**: MEDIUM - CSRF attacks possible

**Status**: ⚠️ NEEDS IMPROVEMENT (should be 'strict')

---

### 7. **Inventory Race Condition (MEDIUM)** ❌

**Location**: `app/api/graphql/resolvers/salesResolver.ts`

**Current Code**:
```typescript
// Two cashiers sell last item simultaneously
const item = await Item.findById(itemId);
if (item.currentStock < quantityNeeded) {
  throw new Error("Insufficient stock");
}
item.currentStock -= quantityNeeded;
await item.save();
```

**Vulnerability**:
- No transaction locking
- No optimistic concurrency control
- Last write wins

**Scenario**:
```
Time | Cashier A              | Cashier B
-----|------------------------|-------------------------
T1   | Read stock: 1          | Read stock: 1
T2   | Check: 1 >= 1 ✓        | Check: 1 >= 1 ✓
T3   | Update: stock = 0      |
T4   |                        | Update: stock = 0
Result: 2 items sold, 0 in stock, but only 1 was available!
```

**Risk**: MEDIUM - Overselling, inventory mismatch

**Status**: ❌ NOT FIXED

---

### 8. **Sensitive Data in GraphQL Errors (LOW-MEDIUM)** ⚠️

**Location**: All resolvers

**Current Code**:
```typescript
catch (error: any) {
  console.error("Login error:", error);
  return { success: false, message: "An unexpected error occurred." };
}
```

**Good**: Generic error messages ✅

**Bad**:
- `console.error` might log sensitive data
- Stack traces in development mode
- No error tracking/alerting

**Risk**: LOW-MEDIUM - Information disclosure

**Status**: ⚠️ PARTIALLY FIXED

---

### 9. **Offline Data Persistence Without Encryption (MEDIUM)** ❌

**Location**: `lib/offlineSync.ts`, `app/(main)/point-of-sale/page.tsx`

**Current Code**:
```typescript
localStorage.setItem('offline_transactions', JSON.stringify(transactions));
localStorage.setItem('offline_parked_sales', JSON.stringify(sales));
```

**Vulnerability**:
- Sensitive data stored in plaintext
- Accessible via browser DevTools
- Persists after logout
- No expiration

**Risk**: MEDIUM - Data theft from physical access

**Data Exposed**:
- Customer orders
- Sales amounts
- Product information
- Cashier information

**Status**: ❌ NOT FIXED

---

### 10. **No Input Length Validation (LOW)** ⚠️

**Location**: All GraphQL mutations

**Current Code**:
```typescript
addProduct(name: String!, price: Float!, ...)
```

**Vulnerability**:
- No max length on strings
- Attacker could send 10MB product name
- DoS attack possible

**Risk**: LOW - DoS, database bloat

**Status**: ⚠️ VALIDATION EXISTS but not enforced everywhere

---

## 🟡 Medium-Risk Issues

### 11. **No Request Signing/Tampering Detection** ❌

**Issue**: API requests can be intercepted and modified

**Example Attack**:
```javascript
// Intercept request
fetch('/api/graphql', {
  body: JSON.stringify({
    query: 'mutation { checkoutSale(id: "123", items: [...]) }'
  })
});

// Modify in proxy to:
// items: [{ productId: "expensive", quantity: 1, price: 0.01 }]
```

**Status**: ❌ NOT IMPLEMENTED

---

### 12. **No API Versioning** ⚠️

**Issue**: Breaking changes affect all clients immediately

**Risk**: System-wide failures during updates

**Status**: ⚠️ NOT IMPLEMENTED

---

### 13. **Weak CORS Configuration** ⚠️

**Location**: `next.config.ts`

**Current**: No CORS configuration (defaults to same-origin)

**Risk**: If you deploy admin panel separately, might allow unintended origins

**Status**: ⚠️ NEEDS CONFIGURATION

---

## 🟢 Low-Risk Issues

### 14. **No Security Headers Testing** ⚠️

**Issue**: Headers configured but not validated

**Recommendation**: Add automated tests

---

### 15. **No Dependency Scanning** ❌

**Issue**: No automatic vulnerability scanning of npm packages

**Status**: ❌ NOT IMPLEMENTED

---

## 🔒 Recommended Fixes (Priority Order)

### Priority 1: IMMEDIATE (Deploy This Week)

#### 1.1 Fix Master Password Vulnerability
```typescript
// app/api/graphql/resolvers/authResolver.ts

// Add audit logging
import { AuditLog } from '../models/AuditLog';

const verifyMasterPassword = async (password: string, user: any, context: any) => {
  const isMasterPassword = password === process.env.ADMIN_PASSWORD;
  
  if (isMasterPassword) {
    // Log master password usage
    await AuditLog.create({
      action: 'MASTER_PASSWORD_USED',
      userId: user.id,
      username: user.username,
      ipAddress: context.request.headers.get('x-forwarded-for') || 
                 context.request.headers.get('x-real-ip') || 
                 'unknown',
      timestamp: new Date(),
      details: {
        userAgent: context.request.headers.get('user-agent')
      }
    });
    
    // Alert admins
    console.warn(`⚠️ MASTER PASSWORD USED by ${user.username} from ${ipAddress}`);
    
    return true;
  }
  
  return false;
};

// Usage
const isMaster = await verifyMasterPassword(password, user, context);
```

#### 1.2 Add Optimistic Locking for Inventory
```typescript
// app/api/graphql/models/Item.ts
const itemSchema = new mongoose.Schema({
  // ... existing fields
  version: { type: Number, default: 0 }
});

// app/api/graphql/resolvers/salesResolver.ts
const deductInventory = async (itemId, quantity) => {
  let retries = 3;
  
  while (retries > 0) {
    const item = await Item.findById(itemId);
    const currentVersion = item.version;
    
    if (item.currentStock < quantity) {
      throw new Error('Insufficient stock');
    }
    
    const result = await Item.updateOne(
      { 
        _id: itemId, 
        version: currentVersion,
        currentStock: { $gte: quantity }
      },
      { 
        $inc: { currentStock: -quantity, version: 1 },
        $set: { updatedAt: new Date() }
      }
    );
    
    if (result.modifiedCount === 1) {
      return; // Success
    }
    
    retries--;
    await new Promise(resolve => setTimeout(resolve, 100)); // Wait before retry
  }
  
  throw new Error('Failed to update inventory after multiple attempts');
};
```

#### 1.3 Sanitize Output (XSS Prevention)
```typescript
// lib/sanitizeOutput.ts
import DOMPurify from 'isomorphic-dompurify';

export const sanitizeHTML = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, { 
    ALLOWED_TAGS: [], // No HTML allowed
    ALLOWED_ATTR: [] 
  });
};

// Usage in resolvers
const product = await Product.findById(id);
return {
  ...product.toObject(),
  name: sanitizeHTML(product.name),
  // ... other fields
};
```

#### 1.4 Encrypt Offline Storage
```typescript
// lib/encryptedStorage.ts
import CryptoJS from 'crypto-js';

const STORAGE_KEY = 'offline_encrypted';

export const encryptedStorage = {
  setItem: (key: string, value: any) => {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(value),
      process.env.NEXT_PUBLIC_STORAGE_KEY || 'default-key'
    ).toString();
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'),
      [key]: encrypted
    }));
  },
  
  getItem: (key: string) => {
    const storage = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const encrypted = storage[key];
    
    if (!encrypted) return null;
    
    const decrypted = CryptoJS.AES.decrypt(
      encrypted,
      process.env.NEXT_PUBLIC_STORAGE_KEY || 'default-key'
    ).toString(CryptoJS.enc.Utf8);
    
    return JSON.parse(decrypted);
  },
  
  removeItem: (key: string) => {
    const storage = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    delete storage[key];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  },
  
  clear: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};
```

---

### Priority 2: THIS MONTH

#### 2.1 Implement CSRF Protection
```typescript
// middleware/csrf.ts
import { randomBytes } from 'crypto';

export const generateCSRFToken = () => {
  return randomBytes(32).toString('hex');
};

export const validateCSRFToken = (token: string, expectedToken: string) => {
  return token === expectedToken;
};

// In login mutation
const csrfToken = generateCSRFToken();
cookieStore.set({
  name: 'csrf_token',
  value: csrfToken,
  httpOnly: true,
  sameSite: 'strict', // Changed from 'lax'
  secure: process.env.NODE_ENV === 'production'
});
```

#### 2.2 Add Input Length Validation
```typescript
// lib/validation.ts (update existing)
export const validateGraphQLInput = (input: any, rules: ValidationRules) => {
  // ... existing validation
  
  // Add length checks
  if (typeof input === 'string' && input.length > rules.maxLength) {
    throw new Error(`Input exceeds maximum length of ${rules.maxLength}`);
  }
  
  // Add array length checks
  if (Array.isArray(input) && input.length > rules.maxItems) {
    throw new Error(`Array exceeds maximum ${rules.maxItems} items`);
  }
};

// Usage in resolvers
validateGraphQLInput(name, { 
  type: 'string', 
  maxLength: 200,
  minLength: 1 
});
```

#### 2.3 Add Audit Logging System
```typescript
// app/api/graphql/models/AuditLog.ts
import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['LOGIN', 'LOGOUT', 'MASTER_PASSWORD_USED', 'SALE_VOID', 
           'PRICE_CHANGE', 'INVENTORY_ADJUST', 'USER_CREATE', 'USER_DELETE']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: String,
  ipAddress: String,
  userAgent: String,
  details: mongoose.Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for performance
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.models.AuditLog || 
  mongoose.model('AuditLog', auditLogSchema);
```

---

### Priority 3: NEXT QUARTER

#### 3.1 Implement Request Signing
```typescript
// lib/requestSigning.ts
import crypto from 'crypto';

export const signRequest = (payload: any, secret: string): string => {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return hmac.digest('hex');
};

export const verifySignature = (
  payload: any, 
  signature: string, 
  secret: string
): boolean => {
  const expected = signRequest(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
};
```

#### 3.2 Add Dependency Scanning
```bash
# package.json
{
  "scripts": {
    "audit": "npm audit --production",
    "audit:fix": "npm audit fix",
    "security:check": "npm audit && snyk test"
  },
  "devDependencies": {
    "snyk": "^1.1000.0"
  }
}
```

#### 3.3 Add Automated Security Testing
```typescript
// tests/security/xss.test.ts
describe('XSS Protection', () => {
  it('should sanitize product names', async () => {
    const maliciousName = '<script>alert("XSS")</script>';
    const product = await createProduct({ name: maliciousName });
    
    expect(product.name).not.toContain('<script>');
    expect(product.name).toBe(''); // or sanitized version
  });
});

// tests/security/injection.test.ts
describe('NoSQL Injection Protection', () => {
  it('should prevent login bypass', async () => {
    const result = await login({
      username: { $ne: null },
      password: 'anything'
    });
    
    expect(result.success).toBe(false);
  });
});
```

---

## 📊 Vulnerability Summary

| Severity | Count | Fixed | Partial | Not Fixed |
|----------|-------|-------|---------|-----------|
| Critical | 2 | 0 | 2 | 0 |
| High | 3 | 1 | 0 | 2 |
| Medium | 6 | 0 | 4 | 2 |
| Low | 4 | 0 | 2 | 2 |
| **Total** | **15** | **1** | **8** | **6** |

---

## 🎯 Action Plan

### Week 1
- [ ] Implement optimistic locking for inventory
- [ ] Add audit logging for master password
- [ ] Encrypt offline storage
- [ ] Add XSS output sanitization

### Week 2
- [ ] Change sameSite to 'strict'
- [ ] Add CSRF token generation
- [ ] Implement input length validation
- [ ] Create AuditLog model

### Week 3
- [ ] Add request signing
- [ ] Set up dependency scanning
- [ ] Write security tests
- [ ] Review and test all fixes

### Week 4
- [ ] Penetration testing
- [ ] Load testing with security focus
- [ ] Document security procedures
- [ ] Train team on security practices

---

## 🛡️ Security Best Practices Going Forward

1. **Code Review Checklist**:
   - [ ] Input validated and sanitized
   - [ ] Output encoded for XSS
   - [ ] Authentication/authorization checked
   - [ ] Rate limiting applied
   - [ ] Audit logging added
   - [ ] Error messages don't leak info

2. **Deployment Checklist**:
   - [ ] Environment variables secured
   - [ ] HTTPS enabled
   - [ ] Security headers configured
   - [ ] npm audit passed
   - [ ] Database backups configured
   - [ ] Monitoring and alerting set up

3. **Regular Maintenance**:
   - Weekly: Check audit logs
   - Weekly: Run `npm audit`
   - Monthly: Review access logs
   - Quarterly: Security audit
   - Yearly: Penetration test

---

**Last Updated**: December 15, 2025  
**Next Review**: January 15, 2026

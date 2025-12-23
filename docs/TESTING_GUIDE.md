# Testing Guide for SOI Inventory System

## Overview
This guide provides instructions for setting up and running automated tests for the inventory management system.

## Testing Stack

### Recommended Tools
1. **Jest** - Unit and integration testing
2. **React Testing Library** - Component testing
3. **Cypress** or **Playwright** - E2E testing
4. **MSW (Mock Service Worker)** - API mocking
5. **Testing Library User Event** - User interaction simulation

## Setup Instructions

### 1. Install Testing Dependencies

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install --save-dev jest jest-environment-jsdom @types/jest
npm install --save-dev @apollo/client-testing
npm install --save-dev msw
npm install --save-dev cypress
# or
npm install --save-dev @playwright/test
```

### 2. Configure Jest

Create `jest.config.js`:

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'component/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'utils/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

### 3. Create Jest Setup File

Create `jest.setup.js`:

```javascript
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  usePathname() {
    return ''
  },
}))

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})
```

## Test Examples

### Unit Test Example - Helper Functions

Create `__tests__/utils/helper.test.ts`:

```typescript
import { pesoFormatter } from '@/utils/helper'

describe('Helper Functions', () => {
  describe('pesoFormatter', () => {
    it('should format number as peso currency', () => {
      expect(pesoFormatter(1234.56)).toBe('₱1,234.56')
    })

    it('should handle zero', () => {
      expect(pesoFormatter(0)).toBe('₱0.00')
    })

    it('should round to 2 decimal places', () => {
      expect(pesoFormatter(1234.567)).toBe('₱1,234.57')
    })
  })
})
```

### Component Test Example - Product Card

Create `__tests__/component/point-of-sale/itemCard.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import ItemPosCard from '@/component/point-of-sale/itemCard'
import { Product } from '@/generated/graphql'

const mockProducts: Product[] = [
  {
    _id: '1',
    name: 'Fried Rice',
    price: 120,
    category: 'Main Course',
    isActive: true,
    ingredientsUsed: [],
  },
  {
    _id: '2',
    name: 'Burger',
    price: 150,
    category: 'Fast Food',
    isActive: true,
    ingredientsUsed: [],
  },
]

describe('ItemPosCard', () => {
  const mockProps = {
    data: mockProducts,
    loading: false,
    refetch: jest.fn(),
    messageApi: {} as any,
    setCart: jest.fn(),
    cart: [],
    setSearch: jest.fn(),
    search: '',
  }

  it('should render product cards', () => {
    render(<ItemPosCard {...mockProps} />)
    
    expect(screen.getByText('Fried Rice')).toBeInTheDocument()
    expect(screen.getByText('₱120.00')).toBeInTheDocument()
    expect(screen.getByText('Burger')).toBeInTheDocument()
  })

  it('should add product to cart when clicked', () => {
    render(<ItemPosCard {...mockProps} />)
    
    const friedRiceCard = screen.getByText('Fried Rice').closest('.ant-card')
    fireEvent.click(friedRiceCard!)
    
    expect(mockProps.setCart).toHaveBeenCalled()
  })

  it('should show warning for products with missing ingredients', () => {
    const productsWithMissing = [
      {
        ...mockProducts[0],
        ingredientsUsed: [
          { item: null, quantity: 1 }
        ],
      },
    ]

    render(<ItemPosCard {...mockProps} data={productsWithMissing} />)
    
    expect(screen.getByText('Missing Ingredients')).toBeInTheDocument()
  })
})
```

### GraphQL Mutation Test Example

Create `__tests__/graphql/shift.test.ts`:

```typescript
import { MockedProvider } from '@apollo/client/testing'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ShiftTracking from '@/component/shift/ShiftTracking'
import { RECORD_SHIFT_EVENT } from '@/graphql/shift/shift'

const mocks = [
  {
    request: {
      query: RECORD_SHIFT_EVENT,
      variables: {
        input: {
          eventType: 'SHIFT_START',
          photo: 'base64photo',
          notes: '',
        },
      },
    },
    result: {
      data: {
        recordShiftEvent: {
          _id: '1',
          attendanceStatus: 'LATE',
          status: 'IN_PROGRESS',
          events: [
            {
              eventType: 'SHIFT_START',
              timestamp: new Date().toISOString(),
            },
          ],
        },
      },
    },
  },
]

describe('Shift Management - Late Arrival', () => {
  it('should mark attendance as LATE when starting shift late', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ShiftTracking />
      </MockedProvider>
    )

    // Simulate starting shift late
    const startButton = screen.getByText('Start Shift')
    fireEvent.click(startButton)

    await waitFor(() => {
      expect(screen.getByText('LATE')).toBeInTheDocument()
    })
  })
})
```

### Responsive Design Test Example

Create `__tests__/responsive/pos.test.tsx`:

```typescript
import { render } from '@testing-library/react'
import PointOfSale from '@/app/(main)/point-of-sale/page'

// Mock useMediaQuery
jest.mock('react-responsive', () => ({
  useMediaQuery: jest.fn(),
}))

import { useMediaQuery } from 'react-responsive'

describe('POS Responsive Design', () => {
  it('should render mobile layout', () => {
    (useMediaQuery as jest.Mock).mockImplementation(({ maxWidth }) => {
      if (maxWidth === 767) return true // isMobile
      if (maxWidth === 575) return true // isSmall
      if (maxWidth === 991) return true // isTablet
      return false
    })

    const { container } = render(<PointOfSale />)
    
    // Check mobile-specific elements
    // e.g., 2-column grid, smaller fonts, etc.
  })

  it('should render desktop layout', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(false) // all breakpoints false = desktop

    const { container } = render(<PointOfSale />)
    
    // Check desktop-specific elements
  })
})
```

## E2E Testing with Cypress

### Setup Cypress

Create `cypress.config.ts`:

```typescript
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
})
```

### E2E Test Example

Create `cypress/e2e/pos-workflow.cy.ts`:

```typescript
describe('POS Complete Workflow', () => {
  beforeEach(() => {
    // Login
    cy.visit('/login')
    cy.get('input[name="username"]').type('cashier')
    cy.get('input[name="password"]').type('password123')
    cy.get('button[type="submit"]').click()
    
    // Wait for redirect
    cy.url().should('include', '/dashboard')
  })

  it('should complete a full sale transaction', () => {
    // Navigate to POS
    cy.visit('/point-of-sale')
    
    // Add product to cart
    cy.contains('Fried Rice').click()
    cy.contains('Burger').click()
    
    // Verify cart
    cy.get('[data-testid="cart-item"]').should('have.length', 2)
    cy.contains('₱270.00') // 120 + 150
    
    // Checkout
    cy.contains('Checkout & Pay').click()
    
    // Select payment
    cy.get('[data-testid="payment-method"]').select('CASH')
    cy.contains('₱500').click() // bill button
    
    // Complete
    cy.contains('Complete Payment').click()
    
    // Verify success
    cy.contains('Sale completed successfully')
    cy.get('[data-testid="cart-item"]').should('have.length', 0)
  })

  it('should park and retrieve order', () => {
    cy.visit('/point-of-sale')
    
    // Add items
    cy.contains('Fried Rice').click()
    
    // Select table
    cy.get('[data-testid="order-type"]').select('DINE_IN')
    cy.contains('Select Table').click()
    cy.contains('Table 5').click()
    
    // Park order
    cy.contains('Park Order').click()
    cy.contains('Order parked successfully')
    
    // Retrieve parked order
    cy.contains('Parked Orders').click()
    cy.get('[data-testid="parked-order-1"]').contains('Load Order').click()
    
    // Verify cart restored
    cy.contains('Fried Rice')
    cy.contains('Table 5')
  })
})
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Run Specific Test File
```bash
npm test -- helper.test.ts
```

### Run E2E Tests
```bash
# Cypress
npx cypress open

# Playwright
npx playwright test
```

## Test Coverage Goals

- **Unit Tests:** 80%+ coverage
- **Component Tests:** All critical components
- **Integration Tests:** All major workflows
- **E2E Tests:** Happy path scenarios

## Continuous Integration

Add to `.github/workflows/test.yml`:

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Best Practices

1. **Test Naming:** Use descriptive names that explain what is being tested
2. **Arrange-Act-Assert:** Structure tests clearly
3. **Mock External Dependencies:** Don't make real API calls in tests
4. **Test User Behavior:** Test what users do, not implementation details
5. **Keep Tests Fast:** Unit tests should run in milliseconds
6. **Avoid Test Interdependence:** Each test should be independent
7. **Use Data-TestId:** For reliable element selection
8. **Test Edge Cases:** Not just happy paths

## Debugging Tests

### Debug in VS Code
Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Console Logging
```typescript
import { screen, debug } from '@testing-library/react'

// Print entire DOM
debug()

// Print specific element
debug(screen.getByRole('button'))
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Cypress Documentation](https://docs.cypress.io/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Happy Testing! 🧪**

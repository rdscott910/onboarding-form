# Onboarding Form

A Next.js application that provides a multi-step onboarding process with user details collection, subscription management, and email notifications.

## Features

- Multi-step onboarding flow
- User details collection and validation
- Subscription management with Stripe integration
- Email notifications using SendGrid
- CSRF protection
- Authentication middleware
- Supabase integration for data storage
- Modern UI components using Radix UI
- Responsive design

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **UI Components**:
  - Radix UI
  - Heroicons
  - Lucide React
- **State Management**: React
- **Database**: Supabase
- **Payment Processing**: Stripe
- **Email Service**: SendGrid
- **Authentication**: Custom middleware with JWT
- **Testing**: Jest

## Project Structure

```
├── app/
│   ├── api/                    # API routes
│   ├── details/               # User details form page
│   ├── middleware/            # Auth, CSRF, and logging middleware
│   ├── pricing/               # Pricing page
│   ├── services/              # Email and other services
│   ├── subscribe/             # Subscription page
│   ├── success/               # Success page
│   └── __tests__/            # Test files
├── lib/
│   ├── constants/           # Application constants
│   ├── types/              # TypeScript type definitions
│   │   ├── session.ts      # Session-related types
│   │   ├── supabase.ts     # Supabase database types
│   │   └── types.ts        # Common type definitions
│   ├── csrf.ts             # CSRF protection utilities
│   ├── csrfToken.ts        # CSRF token management
│   ├── sendgrid-client.ts  # SendGrid email service client
│   ├── server-store.ts     # Server-side state management
│   ├── supabase-client.ts  # Supabase database client
│   ├── twilio.ts          # Twilio integration
│   └── utils.ts           # Common utility functions
├── public/                   # Static assets
└── package.json             # Project dependencies
```

## Library Components

The `lib` directory contains core utilities and type definitions:

- **Authentication & Security**
  - CSRF protection with token management
  - Session handling with TypeScript types
- **External Service Integrations**
  - Supabase client for database operations
  - SendGrid client for email notifications
  - Twilio integration for messaging
- **Type System**

  - Comprehensive TypeScript definitions
  - Session and database types
  - Common utility types

- **State Management**
  - Server-side state handling
  - Data persistence utilities

## Components Structure

The `components` directory is organized into several key sections:

### Core Form Components

- `additional-details.tsx` - Additional restaurant information collection
- `banking-info.tsx` - Banking and payment details form
- `rest-details.tsx` - Primary restaurant details form
- `rest-hours.tsx` - Operating hours management
- `rest-menu.tsx` - Menu configuration interface

### Reusable UI Components (`/ui`)

- Base components built on Radix UI
  - `accordion.tsx` - Collapsible content sections
  - `button.tsx` - Styled button variations
  - `input.tsx` - Text input fields
  - `label.tsx` - Form labels
  - `popover.tsx` - Popup content
  - `switch.tsx` - Toggle switches
  - `textarea.tsx` - Multi-line text input
  - `tooltip.tsx` - Contextual help tooltips

### Form Sections (`/details`)

- Modular form sections:
  - `AccordionSection.tsx` - Wrapper for collapsible form sections
  - `AdditionalDetailsSection.tsx` - Extended restaurant information
  - `BankingInformationSection.tsx` - Payment and banking details
  - `RestaurantDetailsSection.tsx` - Core restaurant information
  - `RestaurantMenuSection.tsx` - Menu management interface

### Supporting Components

- `/icons` - SVG icon components
- `/layout` - Layout components and templates

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up environment variables:

   - Supabase credentials
   - Stripe API keys
   - SendGrid API key
   - JWT secret

4. Run the development server:

   ```bash
   pnpm dev
   ```

5. For testing:
   ```bash
   pnpm test
   ```

## Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
STRIPE_SECRET_KEY=
SENDGRID_API_KEY=
JWT_SECRET=
```

## Testing

The project includes Jest tests for components and services. Run tests using:

```bash
pnpm test
```

## Migration Guide: CSRF to Supabase Auth

### Phase 1: Setup and Preparation

1. Update Existing Table Schema

   ```sql
   -- Add Supabase auth reference to existing table
   ALTER TABLE public.anonymous_registrations
   ADD COLUMN auth_id uuid references auth.users on delete cascade;

   -- Create index for better query performance
   CREATE INDEX IF NOT EXISTS idx_anonymous_registrations_auth_id
   ON public.anonymous_registrations USING btree (auth_id);
   ```

2. Update Environment Variables
   - Keep existing environment variables
   - Add Supabase variables:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     ```

### Phase 2: Implementation Changes

1. Create Supabase Client Utility (`lib/supabase.ts`):

   ```typescript
   import { createClient } from '@supabase/supabase-js';
   import { Database } from './types/supabase';

   export const supabase = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
   ```

2. Create Cookie Management Utility (`lib/cookies.ts`):

   ```typescript
   import { cookies } from 'next/headers';

   export const setUserEmail = (email: string) => {
     cookies().set('userEmail', email, {
       httpOnly: true,
       secure: process.env.NODE_ENV === 'production',
       sameSite: 'lax',
       maxAge: 30 * 24 * 60 * 60, // 30 days
     });
   };

   export const getUserEmail = () => {
     return cookies().get('userEmail')?.value;
   };
   ```

3. Update Middleware (`app/middleware.ts`):

   ```typescript
   import { NextResponse, type NextRequest } from 'next/server';
   import { getUserEmail } from '@/lib/cookies';
   import { loggingMiddleware } from '@/app/middleware/logging';
   import { supabase } from '@/lib/supabase';

   export async function middleware(request: NextRequest) {
     const userEmail = getUserEmail();
     const isRootPath = request.nextUrl.pathname === '/';

     // Apply logging middleware
     const loggingResponse = await loggingMiddleware(request);
     if (loggingResponse) return loggingResponse;

     if (!userEmail && !isRootPath) {
       return NextResponse.redirect(new URL('/', request.url));
     }

     if (userEmail && isRootPath) {
       // Fetch user's registration data from existing table
       const { data: userData } = await supabase
         .from('anonymous_registrations')
         .select('completed, registration_data')
         .eq('primary_email', userEmail)
         .single();

       if (userData?.completed) {
         return NextResponse.redirect(new URL('/success', request.url));
       } else if (userData?.registration_data) {
         // Redirect based on registration progress
         // You might want to add logic here to determine the appropriate step
         return NextResponse.redirect(new URL('/details', request.url));
       }
     }

     return NextResponse.next();
   }

   export const config = {
     matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
   };
   ```

4. Create User Registration Function (`app/actions.ts`):

   ```typescript
   'use server';

   import { supabase } from '@/lib/supabase';
   import { setUserEmail } from '@/lib/cookies';

   export async function registerUser(email: string) {
     const { data, error } = await supabase.from('anonymous_registrations').upsert(
       {
         primary_email: email,
         registration_data: {},
         completed: false,
       },
       {
         onConflict: 'primary_email',
         ignoreDuplicates: true,
       }
     );

     if (error) throw error;

     setUserEmail(email);
     return data;
   }
   ```

### Phase 3: Cleanup

1. Remove CSRF-related code:

   - Delete `app/middleware/csrf.ts`
   - Remove CSRF validation from API routes
   - Remove CSRF token generation endpoints
   - Remove CSRF-related dependencies if any

2. Update API Routes:

   - Remove CSRF token validation
   - Update endpoints to use Supabase client
   - Implement cookie-based email validation where needed

3. Update Form Components:
   - Remove CSRF token handling
   - Modify form submissions to use new `registerUser` action
   - Update progress tracking using existing `completed` and `registration_data` fields

### Phase 4: Testing

1. Test User Flow:

   - New user registration
   - Cookie persistence
   - Redirect to last step
   - Form data persistence

2. Error Scenarios:
   - Invalid email
   - Missing cookies
   - Supabase connection issues

### Phase 5: Deployment

1. Update Production Environment:

   - Set Supabase production credentials
   - Update security headers if necessary

2. Monitor:
   - User registration success rate
   - Cookie-based session handling
   - Redirect behavior

## Migration Guide

When migrating from the previous version, follow these steps:

1. **Component Updates**

   - Replace old form components with new modular sections from `/details`
   - Update UI component imports to use the new `/ui` components
   - Implement new form validation using the updated component props

2. **Form State Management**

   - Migrate to the new form state structure in `additional-details.tsx`
   - Update banking information handling using `banking-info.tsx`
   - Implement the new restaurant hours format from `rest-hours.tsx`

3. **UI Component Migration**

   - Replace custom inputs with new `input.tsx` and `textarea.tsx` components
   - Update modals to use the new `popover.tsx` component
   - Migrate toggle switches to the new `switch.tsx` component
   - Implement tooltips using `tooltip.tsx` for form field hints

4. **Layout and Structure**

   - Update page layouts to use new layout components
   - Implement accordion sections for form organization
   - Migrate icon usage to new icon components

5. **Form Validation and Submission**

   - Update validation logic to use new component props
   - Implement new form submission handlers
   - Update error handling to use new UI components

6. **Testing Updates**
   - Update component tests to match new component structure
   - Add tests for new UI components
   - Verify form submission with new component hierarchy

## License

Private - All rights reserved

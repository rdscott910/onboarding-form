# Onboarding Form

A Next.js application that provides a multi-step onboarding process with user details collection, subscription management, and email notifications.

## Features

- Multi-step onboarding flow
- User details collection and validation
- Subscription management with Stripe integration
- Email notifications using SendGrid
- Direct Supabase authentication (no email verification required)
- Row Level Security
- Modern UI components using Radix UI
- Responsive design
- Password strength validation
- Real-time form validation

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **UI Components**:
  - Radix UI
  - Lucide React Icons
- **State Management**: React Context
- **Database**: Supabase
- **Payment Processing**: Stripe
- **Email Service**: SendGrid
- **Authentication**: Supabase Auth (Direct Authentication)
- **Testing**: Jest

## Project Structure

```
├── app/
│   ├── auth/                 # Auth callback and handlers
│   ├── details/             # User details form page
│   ├── middleware/          # Auth middleware
│   ├── pricing/             # Pricing page
│   ├── providers/           # Context providers
│   ├── services/            # Email and other services
│   ├── subscribe/           # Subscription page
│   ├── success/            # Success page
│   └── __tests__/          # Test files
├── components/
│   ├── ui/                 # Reusable UI components
│   └── details/            # Form section components
├── lib/
│   ├── types/             # TypeScript type definitions
│   │   ├── supabase.ts    # Supabase database types
│   │   └── types.ts       # Common type definitions
│   ├── sendgrid-client.ts # SendGrid email service client
│   ├── supabase-client.ts # Supabase database client
│   └── utils.ts           # Common utility functions
└── public/                # Static assets
```

## Authentication Flow

The application uses Supabase's direct authentication flow:

1. User fills out registration form with:
   - Name
   - Email
   - Password (with strength validation)
2. User is immediately signed up and signed in (no email verification required)
3. A registration record is created in the database
4. User is redirected to the details page

### Security Features

- Password strength requirements:
  - Minimum 8 characters
  - Must contain uppercase letter
  - Must contain lowercase letter
  - Must contain number
  - Must contain special character
- Real-time validation feedback
- Protected routes using middleware
- Automatic session refresh
- Secure session management

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Configure Supabase:
   - Disable email confirmations in Authentication settings
   - Set up database tables and RLS policies
5. Run the development server:
   ```bash
   pnpm dev
   ```

## Database Schema

### Tables

- `anonymous_registrations`: Stores user registration data
  - `id`: UUID (primary key)
  - `primary_email`: String (unique)
  - `registration_data`: JSON
  - `created_at`: Timestamp
  - `updated_at`: Timestamp

## Error Handling

The application includes comprehensive error handling:

- Form validation errors with user-friendly messages
- Authentication errors with clear feedback
- Network and server errors with appropriate user messaging
- Graceful fallbacks for all error scenarios

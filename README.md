# Pave - Real Estate CRM & Messaging Platform

A unified Next.js 14 application combining real estate property management, CRM, and multi-channel messaging capabilities. This application merges the functionality of both the public-facing webapp and the admin panel into a single, modern application using the App Router and Supabase.

## Features

### Public Features
- Property browsing and search
- Project showcases
- User authentication (Email/Password, Google OAuth)
- Saved properties and favorites
- Property comparison

### User Features
- Personal dashboard
- Saved properties management
- Property viewing history
- Task management
- Profile management

### Admin Features
- Property and project management
- Contact and lead management (CRM)
- Multi-channel messaging (WhatsApp, SMS, Email, Messenger, LINE)
- Marketing automation and workflows
- Campaign management
- Analytics and reporting
- Integration management (HubSpot, Salesforce, Google Calendar)
- Team collaboration tools

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database & Auth**: Supabase
- **Styling**: Tailwind CSS + Bootstrap (legacy)
- **State Management**: Zustand, React Query
- **Forms**: React Hook Form
- **UI Components**: Ant Design, React Bootstrap
- **Real-time**: Supabase Realtime
- **Charts**: Chart.js
- **File Upload**: React Cropper
- **Messaging**: WhatsApp Business API, Twilio, Facebook Messenger

## Project Structure

```
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication pages (login, signup)
│   ├── (user)/              # User dashboard pages
│   ├── (admin)/             # Admin panel pages
│   ├── auth/                # Auth API routes
│   ├── layout.js            # Root layout
│   ├── page.js              # Homepage
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── layout/             # Layout components (Nav, Footer)
│   └── providers/          # Context providers
├── lib/                     # Utilities and libraries
│   ├── supabase/           # Supabase client configuration
│   ├── utils.js            # General utilities
│   └── validations.js      # Form validation helpers
├── hooks/                   # Custom React hooks
│   └── useAuth.js          # Authentication hook
├── services/                # External API services
├── types/                   # TypeScript types
├── public/                  # Static assets
├── middleware.js            # Next.js middleware for auth
└── package.json

```

## Getting Started

### Prerequisites

- Node.js 18.17 or higher
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd project
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Building for Production

```bash
npm run build
npm start
```

## Authentication

The application uses Supabase Auth for authentication with support for:

- Email/Password authentication
- Google OAuth
- Facebook OAuth
- Magic link authentication
- Email verification
- Password reset

### Route Protection

Routes are protected using Next.js middleware:
- `/auth/*` - Public authentication pages
- `/user/*` - Protected user pages (requires authentication)
- `/admin/*` - Protected admin pages (requires authentication + admin role)

## Database Schema

The application uses Supabase PostgreSQL database. Key tables include:

- `users` - User profiles and authentication
- `properties` - Property listings
- `projects` - Real estate projects
- `contacts` - CRM contacts
- `tasks` - Task management
- `messages` - Multi-channel messages
- `campaigns` - Marketing campaigns
- `workflows` - Automation workflows

## API Routes

### Authentication
- `GET/POST /auth/callback` - OAuth callback handler

### Properties
- To be implemented with Supabase queries

### Contacts
- To be implemented with Supabase queries

## Styling

The application uses a combination of:

- **Tailwind CSS** - Primary styling framework
- **Bootstrap** - Legacy components (being migrated)
- **CSS Modules** - Component-specific styles
- **Custom CSS** - Global styles and themes

### Design System

- **Colors**: Primary (blue), Secondary (pink)
- **Fonts**: Poppins (body), Tenor Sans (headings)
- **Spacing**: 8px base unit
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)

## Development Guidelines

### Code Organization

1. **Components**: Use feature-based organization
   - Place shared components in `components/ui/`
   - Place feature components in `components/[feature]/`
   - Use proper naming conventions (PascalCase)

2. **Utilities**: Place in `lib/` directory
   - Keep utilities pure and testable
   - Export named functions

3. **Hooks**: Place custom hooks in `hooks/`
   - Prefix with `use`
   - Keep hooks focused and reusable

4. **API Integration**:
   - Use Supabase client for database operations
   - Place queries in `lib/supabase/queries/`
   - Place mutations in `lib/supabase/mutations/`

### Best Practices

- Use TypeScript for type safety
- Write descriptive commit messages
- Keep components small and focused
- Use React Server Components where possible
- Implement proper error handling
- Add loading states for async operations
- Use proper SEO metadata
- Optimize images with Next.js Image component

## Testing

```bash
# Run tests (to be configured)
npm test

# Run Cypress tests
npm run cypress
```

## Deployment

The application can be deployed to:

- **Vercel** (recommended for Next.js)
- **Railway**
- **AWS**
- **Any Node.js hosting platform**

### Environment Variables for Production

Ensure all environment variables are set in your hosting platform:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_ENV=production`
- All OAuth credentials

## Migration from Old Apps

This application consolidates two previous applications:

1. **webapp** - Public-facing property website
2. **webapp_admin** - Admin panel for CRM and messaging

The migration involved:
- Merging duplicate components
- Consolidating API clients
- Unifying authentication
- Standardizing styling
- Moving to App Router architecture

Old apps are preserved in `webapp/` and `webapp_admin/` directories for reference.

## Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

## Support

For issues and questions:
- Create an issue in the repository
- Contact the development team

## License

Proprietary - All rights reserved

---

Built with ❤️ by the Pave team

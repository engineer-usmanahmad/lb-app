# LbisTech Professional Website

A modern, professional educational technology website built with Astro, Tailwind CSS, Supabase, and Resend.

## Features

- **Modern Design**: Professional UI with navy blue and coral branding
- **Course Management**: Complete course catalog with enrollment system
- **Database Integration**: Supabase for contact and enrollment submissions
- **Email Notifications**: Resend integration for automated emails
- **Admin Dashboard**: Real-time statistics and submission management
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **SEO Optimized**: Fast loading with proper meta tags

## Tech Stack

- **Framework**: Astro with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Email**: Resend
- **Deployment**: Static site with hybrid rendering

## Environment Variables

Create a `.env` file with:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
RESEND_API_KEY=your_resend_api_key
JWT_SECRET=your_strong_random_secret_key_here
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Database Setup

### SQL Files Organization

The project uses a well-organized SQL file structure within the `supabase/` directory:

```
supabase/
├── setup/                    # Initial database setup files
│   ├── supabase-setup.sql           # AWS config table and trigger setup
│   ├── create_base_tables.sql       # Review forms and form responses tables
│   ├── create_analytics_tables_fixed.sql  # Analytics tables setup
│   └── create-events-table-supabase.sql   # Events table creation
├── fixes/                    # Bug fixes and corrections
│   ├── fix-events-table.sql         # Events table structure fixes
│   ├── fix-aws-config.sql           # AWS configuration fixes
│   ├── fix-rls-policies.sql         # Row Level Security policy fixes
│   ├── fix-success-stories-table.sql       # Success stories table fixes
│   └── corrected-success-stories-table.sql # Corrected success stories structure
├── manual-scripts/           # Manual operations and utilities
│   ├── add-active-column-events.sql # Add active column to events table
│   └── manual_analytics_tables.sql  # Manual analytics table operations
└── migrations/               # Supabase migrations (auto-generated)
    ├── create_contact_submissions.sql
    ├── create_enrollment_submissions.sql
    └── [other migration files...]
```

### Setup Instructions

Run the migration files in your Supabase dashboard in this order:

1. **Initial Setup** (run these first):
   - `supabase/setup/supabase-setup.sql`
   - `supabase/setup/create_base_tables.sql`
   - `supabase/setup/create_analytics_tables_fixed.sql`
   - `supabase/setup/create-events-table-supabase.sql`

2. **Core Migrations** (run these next):
   - `supabase/migrations/create_contact_submissions.sql`
   - `supabase/migrations/create_enrollment_submissions.sql`
   - All other files in `supabase/migrations/`

3. **Fixes** (apply if needed):
   - Files in `supabase/fixes/` as required for bug fixes

4. **Manual Scripts** (run manually when needed):
   - Files in `supabase/manual-scripts/` for specific operations

## Deployment on Ubuntu Server

### Prerequisites
- Node.js 18+ installed
- PM2 for process management
- Nginx for reverse proxy

### Steps

1. **Clone/Upload the project**:
```bash
# Upload your project files to /var/www/lbistech
sudo mkdir -p /var/www/lbistech
cd /var/www/lbistech
```

2. **Install dependencies**:
```bash
npm install
```

3. **Create production .env file**:
```bash
sudo nano .env
# Add your environment variables
```

4. **Build the project**:
```bash
npm run build
```

5. **Install PM2 globally**:
```bash
sudo npm install -g pm2
```

6. **Create PM2 ecosystem file**:
```bash
# Create ecosystem.config.cjs (see below)
```

7. **Start with PM2**:
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

8. **Configure Nginx**:
```bash
# Create nginx config (see below)
sudo systemctl reload nginx
```

## Contact

- **Email**: team@lbistech.com
- **Phone**: +92 03 111 088 881
- **Location**: Lahore, Pakistan

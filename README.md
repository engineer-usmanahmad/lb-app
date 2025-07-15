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

Run the migration files in your Supabase dashboard:
1. `supabase/migrations/create_contact_submissions.sql`
2. `supabase/migrations/create_enrollment_submissions.sql`

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

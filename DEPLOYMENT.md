# YSPM Timetable - Deployment Guide

This guide covers deploying the YSPM Timetable application to production.

## Prerequisites

- Node.js 18+ installed
- MySQL 8.0+ installed and running
- npm or yarn package manager
- PM2 (for production process management): `npm install -g pm2`

## Environment Setup

### 1. Frontend Configuration

Copy `.env.example` to `.env` in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and set your production API URL:

```env
VITE_API_URL=https://your-domain.com/api
```

### 2. Backend Configuration

Copy `server/.env.example` to `server/.env`:

```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your production values:

```env
PORT=5000
NODE_ENV=production

# Database Configuration
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
DB_NAME=yspm_timetable

# CORS Configuration (your frontend domain)
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

## Database Setup

### 1. Create Database

Run the database creation script:

```bash
mysql -u root -p < server/recreate_database.sql
```

This will:
- Create the `yspm_timetable` database
- Create all required tables with proper indexes
- Insert default admin user (admin@yspm.com / admin123)

### 2. Verify Database

```bash
mysql -u root -p yspm_timetable -e "SHOW TABLES;"
```

Expected tables:
- `practical_resources`
- `users`
- `notices`
- `news_ticker`

## Build Process

### 1. Install Dependencies

#### Frontend:
```bash
npm install
```

#### Backend:
```bash
cd server
npm install
```

### 2. Build Applications

#### Frontend:
```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

#### Backend:
```bash
cd server
npm run build
```

This compiles TypeScript to JavaScript in the `server/dist/` directory.

## Deployment Options

### Option 1: PM2 (Recommended for Production)

1. **Start the backend server:**
```bash
cd server
pm2 start ecosystem.config.js --env production
```

2. **Verify it's running:**
```bash
pm2 status
pm2 logs yspm-timetable-server
```

3. **Set PM2 to start on system boot:**
```bash
pm2 startup
pm2 save
```

4. **Serve the frontend:**

Use a web server like Nginx to serve the `dist/` folder:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/yspm-timetable/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 2: Manual Start

1. **Start backend:**
```bash
cd server
npm start
```

2. **Serve frontend:**
```bash
npm run preview
```

Or use any static file server to serve the `dist/` folder.

## Health Check

Verify the deployment is working:

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "db": "connected",
  "timestamp": "2026-02-01T...",
  "uptime": 123.456
}
```

## Security Checklist

✅ All `.env` files are excluded from version control  
✅ Database credentials are secure and not default  
✅ CORS is configured for specific origins only  
✅ Rate limiting is enabled (100 req/15min, 5 login attempts/15min)  
✅ Helmet security headers are active  
✅ Input validation is enabled on all endpoints  
✅ File upload types are restricted  

## Default Admin Credentials

```
Email: admin@yspm.com
Password: admin123
```

**⚠️ IMPORTANT: Change this password immediately after first login!**

## Monitoring & Logs

### PM2 Logs

```bash
pm2 logs yspm-timetable-server
pm2 logs yspm-timetable-server --lines 100
```

### Log Files

Logs are stored in:
- `server/logs/error.log` - Error logs
- `server/logs/output.log` - Standard output
- `server/logs/combined.log` - Combined logs

### Monitoring

```bash
pm2 monit
```

## Backup & Restore

### Database Backup

```bash
mysqldump -u root -p yspm_timetable > backup_$(date +%Y%m%d).sql
```

### Database Restore

```bash
mysql -u root -p yspm_timetable < backup_20260201.sql
```

## Troubleshooting

### Server won't start

1. Check environment variables: `cat server/.env`
2. Verify database is running: `mysql -u root -p -e "status"`
3. Check logs: `pm2 logs yspm-timetable-server --err`
4. Verify port 5000 is available: `lsof -i :5000` (Unix) or `netstat -ano | findstr :5000` (Windows)

### CORS errors

1. Verify `ALLOWED_ORIGINS` in `server/.env` matches your frontend domain
2. Check server logs for CORS blocked messages
3. Ensure protocol (http/https) matches

### Database connection failed

1. Verify MySQL is running
2. Check database credentials in `server/.env`
3. Test connection: `mysql -u [user] -p[password] -h [host] [database]`
4. Check firewall settings

### Files not uploading

1. Check file size limit (100MB max)
2. Verify file type is allowed (PDF, DOC, PPT, images, txt)
3. Check MySQL `max_allowed_packet` setting
4. Review server logs for specific error

## Performance

- Database indexes are configured for common queries
- Connection pooling is enabled (100 connections max)
- Gzip compression is enabled for API responses
- Frontend bundle is optimized and minified

## Updates

To update the application:

```bash
# Stop the server
pm2 stop yspm-timetable-server

# Pull latest changes / update files

# Rebuild
npm run build
cd server
npm run build

# Restart
pm2 restart yspm-timetable-server
```

## Support

For issues or questions, refer to:
- Server logs: `pm2 logs`
- Database logs: Check MySQL error log
- Application health: `curl http://localhost:5000/api/health`


# YSPM Timetable - Deployment Manual

## 1. Overview
This guide provides step-by-step instructions for deploying the **YSPM Timetable** application (Frontend + Backend) on a Windows or Linux server (Source Deployment).

## 2. Prerequisites
Ensure the target server has the following software installed:
- **Node.js**: Version 18.x or higher ([Download](https://nodejs.org/))
- **MySQL Server**: Version 8.0 or higher
- **Git**: (Optional, for pulling code)
- **PM2**: For keeping the server running alive (`npm install -g pm2`)

---

## 3. Database Configuration (CRITICAL for Large Files)
Since the application supports file uploads up to **100MB**, you **MUST** configure MySQL to accept large packets. By default, MySQL limits this to 4MB, which will cause upload errors.

### Step 3.1: Edit MySQL Configuration
1.  Locate your MySQL configuration file (`my.ini` on Windows or `my.cnf` on Linux).
    -   **Windows**: Usually `C:\ProgramData\MySQL\MySQL Server 8.0\my.ini`
    -   **Linux**: Usually `/etc/mysql/my.cnf`
2.  Open the file and find the `[mysqld]` section.
3.  Add or modify the following line:
    ```ini
    [mysqld]
    max_allowed_packet = 128M
    ```
4.  **Restart the MySQL Service** for changes to take effect.
    -   **Windows**: Services > MySQL80 > Restart
    -   **Linux**: `sudo service mysql restart`

### Step 3.2: Verify Configuration
Run this SQL query to verify:
```sql
SHOW VARIABLES LIKE 'max_allowed_packet';
```
Value should be `134217728` (128MB) or higher.

---

## 4. Installation & Setup

### Step 4.1: Database Setup
1.  Log in to MySQL.
2.  Create the database:
    ```sql
    CREATE DATABASE yspm_timetable;
    ```
3.  (Optional) The application will automatically create tables on first startup.

### Step 4.2: Backend Setup
1.  Navigate to the `server` directory.
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file (copy from `.env.example` if available) with your production credentials:
    ```env
    PORT=5000
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_mysql_password
    DB_NAME=yspm_timetable
    ALLOWED_ORIGINS=http://your-college-website-domain.com
    NODE_ENV=production
    ```

### Step 4.3: Frontend Setup
1.  Navigate to the project root.
    ```bash
    cd ..
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file for the frontend:
    ```env
    # Point this to your actual server IP or Domain
    VITE_API_URL=http://your-server-ip:5000/api
    ```
4.  **Build the Frontend**:
    ```bash
    npm run build
    ```
    This creates a `dist` folder containing the optimized website files.

---

## 5. Running the Application (Production)

### Method A: Using PM2 (Recommended for Stability)
PM2 ensures the server restarts automatically if it crashes or the server reboots.

1.  **Start Backend**:
    ```bash
    cd server
    npm run build   # (If using TypeScript)
    pm2 start dist/index.js --name "yspm-backend"
    ```
    *Note: If `dist/index.js` doesn't exist, run `npm run build` inside `server` first.*

2.  **Serve Frontend**:
    You can use a web server like **Nginx** or **Apache** to serve the `dist` folder generated in Step 4.3.
    
    **OR** (Simpler for Intranet):
    
    You can serve the static files using a simple Node server:
    ```bash
    npm install -g serve
    pm2 start serve --name "yspm-frontend" -- -s dist -l 5173
    ```

### Method B: Simple Run (For Testing)
- **Backend**: `npm start` (inside `server`)
- **Frontend**: `npm run preview` (inside root)

---

## 6. Troubleshooting
- **"File too large"**: Check `max_allowed_packet` in MySQL (Step 3).
- **"Network Error"**: Check `ALLOWED_ORIGINS` in backend `.env` and `VITE_API_URL` in frontend `.env`.

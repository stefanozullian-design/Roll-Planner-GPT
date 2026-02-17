# Cement Production Planner

Professional cement production planning and optimization system.

## Features

- **Product & Recipe Management** - Define cement types and formulations
- **Process Flow Designer** - Visual equipment and material flow mapping
- **Demand Planning** - Forecast and track cement demand
- **Production Planning** - Campaign scheduling with capacity optimization
- **Inventory Tracking** - Real-time inventory simulation
- **Mass Balance Calculations** - Material requirements planning (MRP)

## Tech Stack

**Frontend:**
- HTML5, CSS3 (Tailwind), JavaScript
- Hosted on GitHub Pages

**Backend:**
- Node.js + Express
- PostgreSQL database
- Hosted on Railway

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Railway account
- GitHub account

### Local Development

1. **Clone the repository:**
```bash
git clone https://github.com/stefanozullian-design/cement-production-planner.git
cd cement-production-planner
```

2. **Set up backend:**
```bash
cd backend
npm install
```

3. **Configure environment variables:**

Create `backend/.env`:
```
DATABASE_URL=your_railway_database_url
PORT=3000
```

4. **Run backend locally:**
```bash
npm start
```

5. **Open frontend:**
```bash
cd ../frontend
# Open index.html in browser
# Or use a local server: python -m http.server 8000
```

### Database Setup

1. Create PostgreSQL database in Railway
2. Run the schema:
```bash
# In Railway SQL Editor, paste contents of backend/database/schema.sql
```

### Deployment

**Backend (Railway):**
1. Connect Railway to this GitHub repo
2. Set root directory: `/backend`
3. Add environment variable: `DATABASE_URL`
4. Deploy

**Frontend (GitHub Pages):**
1. Go to repo Settings → Pages
2. Source: Deploy from branch
3. Branch: `main`, Folder: `/frontend`
4. Save

## Project Structure

```
cement-production-planner/
├── frontend/           # Static frontend files
│   ├── index.html     # Main application
│   ├── config.js      # API configuration
│   └── migrate.html   # Data migration tool
├── backend/           # Node.js API server
│   ├── server.js      # Express server
│   ├── package.json   # Dependencies
│   └── database/      # SQL schemas
└── docs/              # Documentation
```

## API Endpoints

- `GET /api/products` - List all products
- `POST /api/products` - Create product
- `GET /api/equipment` - List all equipment
- `POST /api/campaigns` - Create campaign
- `POST /api/calculate/mass-balance` - Calculate material requirements

See `docs/API.md` for complete API documentation.

## License

MIT License - See LICENSE file for details

## Author

Stefano Zullian Design

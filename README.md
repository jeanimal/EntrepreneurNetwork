# Entrepreneur Network

A dynamic social networking platform connecting entrepreneurs and investors through intelligent resource matching and innovative professional networking tools.

## Features

- **Connect**: Find and connect with like-minded entrepreneurs, experienced mentors, and potential investors
- **Share Resources**: Match your skills, needs, and resources with others to create powerful collaborations
- **Collaborate**: Showcase your side projects, find team members, and connect with investors
- **Resource Grid System**: Advanced matching system for money, tech skills, financial skills, and social networks
- **Replit Authentication**: Secure login with OpenID Connect
- **Real-time Messaging**: Direct communication between users
- **Project Showcase**: Display and discover entrepreneurial ventures

## Tech Stack

- **Frontend**: React with TypeScript, Vite
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect)
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter
- **Session Storage**: PostgreSQL with connect-pg-simple

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (version 18 or higher)
- **PostgreSQL** (version 12 or higher)
- **npm** or **yarn**

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/entrepreneur-network.git
cd entrepreneur-network
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/entrepreneur_network
PGHOST=localhost
PGPORT=5432
PGUSER=your_postgres_user
PGPASSWORD=your_postgres_password
PGDATABASE=entrepreneur_network

# Authentication Configuration
SESSION_SECRET=your-secure-session-secret-here
REPL_ID=your-repl-id
ISSUER_URL=https://replit.com/oidc
REPLIT_DOMAINS=localhost:5000
```

### 4. Set Up the Database

Create the PostgreSQL database:

```bash
# Using createdb command
createdb entrepreneur_network

# Or using psql
psql -c "CREATE DATABASE entrepreneur_network;"
```

Push the database schema:

```bash
npm run db:push
```

### 5. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start the development server (frontend + backend)
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio for database management

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries
│   │   └── utils/          # Helper functions
├── server/                 # Express backend
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data access layer
│   ├── db.ts              # Database connection
│   └── replitAuth.ts      # Authentication setup
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema definitions
└── uploads/               # File upload storage
```

## Database Schema

The application uses the following main entities:

- **Users**: User profiles with authentication data
- **Projects**: Entrepreneurial ventures and side projects
- **Resources**: Categorized resources (money, skills, networks)
- **Skills**: User skills and expertise
- **Posts**: Social feed content
- **Connections**: User-to-user relationships
- **Messages**: Direct messaging between users

## Authentication

The application uses Replit Authentication with OpenID Connect. For local development:

1. Set up a Replit application and obtain your `REPL_ID`
2. Configure the redirect URLs in your Replit app settings
3. Update the environment variables accordingly

## Deployment

### Replit Deployment
The application is designed to work seamlessly on Replit. Simply import the repository and it will automatically configure.

### Other Platforms
For deployment on other platforms:

1. Build the application: `npm run build`
2. Set up PostgreSQL database
3. Configure environment variables
4. Start the server: `npm start`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `SESSION_SECRET` | Secret for session encryption | Yes | - |
| `REPL_ID` | Replit application ID | Yes | - |
| `ISSUER_URL` | OpenID Connect issuer URL | No | `https://replit.com/oidc` |
| `REPLIT_DOMAINS` | Allowed domains for authentication | No | `localhost:5000` |

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists and is accessible

### Authentication Issues
- Confirm `REPL_ID` is correctly set
- Check that redirect URLs match in Replit app settings
- Ensure `SESSION_SECRET` is set and secure

### Build Issues
- Clear `node_modules` and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check Node.js version compatibility

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions, please open an issue in the GitHub repository.
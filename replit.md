# replit.md

## Overview

Entrepreneur Network is a dynamic social networking platform connecting entrepreneurs and investors through intelligent resource matching and innovative professional networking tools. The application uses a modern tech stack with React frontend, Express.js backend, PostgreSQL database with Drizzle ORM, and Replit Auth for authentication. The platform features a polished landing page with centered imagery, strategic button placement, and a compact hero section design.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **Styling**: Tailwind CSS with custom theme configuration
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with session middleware
- **Authentication**: Replit Auth (OIDC) with Passport.js strategy
- **File Handling**: Multer for avatar uploads
- **Development**: tsx for TypeScript execution in development

### Database Architecture
- **Database**: PostgreSQL 16
- **ORM**: Drizzle ORM with Drizzle Kit for migrations
- **Connection**: Node-postgres with connection pooling
- **Session Storage**: PostgreSQL-backed session storage

## Key Components

### Authentication System
- **Provider**: Replit Auth using OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **User Creation**: Automatic user upsert on first login
- **Route Protection**: Authentication middleware for protected routes

### Data Models
- **Users**: Profile information with entrepreneur/investor types
- **Projects**: Side projects and business ventures
- **Connections**: Network relationships between users
- **Messages**: Direct messaging system
- **Posts**: Social feed content
- **Skills**: User skill ratings and endorsements
- **Resources**: Resource sharing (have/need categorization)

### File Upload System
- **Storage**: Local filesystem in uploads directory
- **File Types**: Images only (JPEG, PNG, GIF, WebP)
- **Size Limit**: 5MB maximum file size
- **Security**: File type validation and unique filename generation

### UI/UX Features
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Theme System**: Professional theme with customizable colors
- **Component Library**: Comprehensive shadcn/ui component set
- **Loading States**: Skeleton loaders and proper loading indicators

## Data Flow

### Authentication Flow
1. User accesses protected route
2. Redirect to `/api/login` for Replit Auth
3. OAuth flow with Replit's OIDC provider
4. User data upserted to PostgreSQL
5. Session created and user redirected to application

### API Request Flow
1. Frontend makes API requests with credentials
2. Express middleware validates session
3. Route handlers interact with database via Drizzle ORM
4. JSON responses sent back to frontend
5. TanStack Query manages caching and updates

### Real-time Updates
- Manual refresh intervals for messages (5 seconds)
- Optimistic updates for user interactions
- Query invalidation for data consistency

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection driver
- **@tanstack/react-query**: Server state management
- **drizzle-orm**: Type-safe ORM
- **express-session**: Session management
- **passport**: Authentication middleware
- **multer**: File upload handling

### UI Dependencies
- **@radix-ui/***: Headless UI primitives
- **tailwindcss**: Utility-first CSS framework
- **react-hook-form**: Form state management
- **zod**: Schema validation
- **date-fns**: Date formatting utilities

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type checking
- **tsx**: TypeScript execution
- **esbuild**: Production bundling

## Deployment Strategy

### Build Process
1. Frontend: Vite builds React app to `dist/public`
2. Backend: esbuild bundles Express server to `dist/index.js`
3. Database: Drizzle migrations applied via `db:push`

### Environment Configuration
- **Development**: tsx with Vite dev server
- **Production**: Node.js with compiled bundle
- **Database**: PostgreSQL connection via DATABASE_URL
- **Sessions**: Secure session configuration for production

### Replit Integration
- **Modules**: Node.js 20, Web, PostgreSQL 16
- **Deployment**: Autoscale deployment target
- **Port Mapping**: Internal 5000 → External 80
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

```
Changelog:
- June 15, 2025. Initial setup
```
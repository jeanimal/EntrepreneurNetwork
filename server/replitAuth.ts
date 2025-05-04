import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { db } from "./db";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true, // Create the sessions table if missing
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || 'temporarysecretforentrepreneurconnect',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Allow non-HTTPS during development
      sameSite: 'lax',
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  try {
    // Match user data to existing database columns
    const userData = {
      id: claims["sub"],
      username: claims["username"],
      email: claims["email"],
      // Combine first_name and last_name to name field
      name: claims["first_name"] && claims["last_name"] 
        ? `${claims["first_name"]} ${claims["last_name"]}` 
        : claims["first_name"] || claims["username"],
      bio: claims["bio"],
      // Use profile_image_url as avatar_url
      avatar_url: claims["profile_image_url"],
      user_type: "entrepreneur", // Default user type
    };
    console.log("Upserting user with data:", JSON.stringify(userData));
    await storage.upsertUser(userData);
  } catch (error) {
    console.error("Error upserting user:", error);
    throw error;
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    try {
      const user = {};
      updateUserSession(user, tokens);
      await upsertUser(tokens.claims());
      verified(null, user);
    } catch (error) {
      console.error("Error in verify function:", error);
      verified(error as Error);
    }
  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
  
  // Route to get the current authenticated user
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  console.log("isAuthenticated middleware called for:", req.url);
  
  // Check if user is authenticated
  if (!req.isAuthenticated()) {
    console.log("Authentication check failed: User not authenticated");
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const user = req.user as any;
  
  // Check if user object has necessary data
  if (!user || !user.claims || !user.claims.sub) {
    console.log("Authentication check failed: Invalid user object:", JSON.stringify(user));
    return res.status(401).json({ message: "Unauthorized - Invalid session" });
  }
  
  // Check if token is expired
  if (!user.expires_at) {
    console.log("Authentication check failed: Missing expires_at in user object");
    return res.status(401).json({ message: "Unauthorized - Invalid session format" });
  }
  
  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    console.log("Authentication check passed for user:", user.claims.sub);
    return next();
  }
  
  // Token is expired, try to refresh
  console.log("Token expired at", new Date(user.expires_at * 1000), "attempting refresh");
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    console.log("No refresh token available");
    return res.redirect("/api/login");
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    console.log("Token refreshed successfully");
    return next();
  } catch (error) {
    console.error("Error refreshing token:", error);
    return res.redirect("/api/login");
  }
};
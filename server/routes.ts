import express, { Router, Request, Response } from "express";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertProjectSchema, 
  insertResourceSchema,
  insertSkillSchema,
  insertPostSchema,
  insertConnectionSchema,
  insertMessageSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { upload, getFileUrl, deleteOldAvatar } from "./file-upload";
import { setupAuth, isAuthenticated } from "./replitAuth";

// We don't need a custom session type for Replit Auth
// as the session is handled by passport

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);
  
  // Create API router
  const apiRouter = Router();
  
  // Add json middleware
  apiRouter.use(express.json());
  
  // Error handling middleware for Zod validation errors
  const handleZodError = (err: unknown, res: Response) => {
    if (err instanceof ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: err.errors,
      });
    }
    
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  };
  
  // Helper to get the authenticated user's ID from Replit Auth or legacy auth
  const getUserId = (req: any): string => {
    // Try to get user ID from Replit Auth
    if (req.user?.claims?.sub) {
      return req.user.claims.sub;
    }
    
    // Fallback to legacy session
    if (req.session?.userId) {
      return req.session.userId.toString();
    }
    
    throw new Error("User not authenticated");
  };
  
  // AUTH ROUTES
  // The main login/logout routes are handled by replitAuth.ts
  // The /api/auth/user endpoint is also handled by replitAuth.ts
  
  // The getUserId helper is already defined above

  // Legacy endpoint for backward compatibility
  apiRouter.get("/auth/me", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // USER ROUTES
  apiRouter.get("/users", isAuthenticated, async (req, res) => {
    try {
      const query = req.query.q as string || "";
      const users = await storage.searchUsers(query);
      res.json(users);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.get("/users/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.put("/users/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.params.id;
      const currentUserId = getUserId(req);
      
      // Check if user is updating their own profile
      if (userId !== currentUserId) {
        return res.status(403).json({ message: "You can only update your own profile" });
      }
      
      // Update user data
      const updatedUser = await storage.updateUser(userId, req.body);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Profile Picture Upload
  apiRouter.post("/users/:id/avatar", isAuthenticated, upload.single('avatar'), async (req, res) => {
    try {
      const userId = req.params.id;
      const currentUserId = getUserId(req);
      
      // Check if user is uploading to their own profile
      if (userId !== currentUserId) {
        return res.status(403).json({ message: "You can only update your own profile" });
      }
      
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Get current user to check if they have an existing avatar
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Delete old avatar if it exists
      if (user.avatarUrl) {
        deleteOldAvatar(user.avatarUrl);
      }
      
      // Get the URL for the new avatar
      const avatarUrl = getFileUrl(req.file.filename);
      
      // Update user with new avatar URL
      const updatedUser = await storage.updateUser(userId, { avatarUrl });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // PROJECT ROUTES
  apiRouter.get("/projects", isAuthenticated, async (req, res) => {
    try {
      const query = req.query.q as string || "";
      const projects = await storage.searchProjects(query);
      res.json(projects);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.get("/users/:userId/projects", isAuthenticated, async (req, res) => {
    try {
      const userId = req.params.userId;
      const projects = await storage.getProjectsByUserId(userId);
      res.json(projects);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.post("/projects", isAuthenticated, async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse({
        ...req.body,
        userId: getUserId(req),
      });
      
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  apiRouter.put("/projects/:id", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user owns the project
      const userId = getUserId(req);
      if (project.userId !== userId) {
        return res.status(403).json({ message: "You can only update your own projects" });
      }
      
      const updatedProject = await storage.updateProject(projectId, req.body);
      res.json(updatedProject);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.delete("/projects/:id", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user owns the project
      const userId = getUserId(req);
      if (project.userId !== userId) {
        return res.status(403).json({ message: "You can only delete your own projects" });
      }
      
      await storage.deleteProject(projectId);
      res.json({ message: "Project deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // RESOURCE ROUTES
  apiRouter.get("/users/:userId/resources", isAuthenticated, async (req, res) => {
    try {
      const userId = req.params.userId;
      const resources = await storage.getResourcesByUserId(userId);
      res.json(resources);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.post("/resources", isAuthenticated, async (req, res) => {
    try {
      const resourceData = insertResourceSchema.parse({
        ...req.body,
        userId: getUserId(req),
      });
      
      const resource = await storage.createResource(resourceData);
      res.status(201).json(resource);
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  apiRouter.put("/resources/:id", isAuthenticated, async (req, res) => {
    try {
      const resourceId = parseInt(req.params.id);
      const userId = getUserId(req);
      const resources = await storage.getResourcesByUserId(userId);
      const resource = resources.find(r => r.id === resourceId);
      
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      const updatedResource = await storage.updateResource(resourceId, req.body);
      res.json(updatedResource);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // SKILL ROUTES
  apiRouter.get("/users/:userId/skills", isAuthenticated, async (req, res) => {
    try {
      const userId = req.params.userId;
      const skills = await storage.getSkillsByUserId(userId);
      res.json(skills);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.post("/skills", isAuthenticated, async (req, res) => {
    try {
      const skillData = insertSkillSchema.parse({
        ...req.body,
        userId: getUserId(req),
      });
      
      const skill = await storage.createSkill(skillData);
      res.status(201).json(skill);
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  apiRouter.put("/skills/:id", isAuthenticated, async (req, res) => {
    try {
      const skillId = parseInt(req.params.id);
      const userId = getUserId(req);
      const skills = await storage.getSkillsByUserId(userId);
      const skill = skills.find(s => s.id === skillId);
      
      if (!skill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      
      const updatedSkill = await storage.updateSkill(skillId, req.body);
      res.json(updatedSkill);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.delete("/skills/:id", isAuthenticated, async (req, res) => {
    try {
      const skillId = parseInt(req.params.id);
      const userId = getUserId(req);
      const skills = await storage.getSkillsByUserId(userId);
      const skill = skills.find(s => s.id === skillId);
      
      if (!skill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      
      await storage.deleteSkill(skillId);
      res.json({ message: "Skill deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // POST/FEED ROUTES
  apiRouter.get("/feed", isAuthenticated, async (req, res) => {
    try {
      const posts = await storage.getFeedPosts();
      res.json(posts);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.get("/users/:userId/posts", isAuthenticated, async (req, res) => {
    try {
      const userId = req.params.userId;
      const posts = await storage.getPostsByUserId(userId);
      res.json(posts);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.post("/posts", isAuthenticated, async (req, res) => {
    try {
      const postData = insertPostSchema.parse({
        ...req.body,
        userId: getUserId(req),
      });
      
      const post = await storage.createPost(postData);
      res.status(201).json(post);
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  apiRouter.delete("/posts/:id", isAuthenticated, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getPost(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Check if user owns the post
      const userId = getUserId(req);
      if (post.userId !== userId) {
        return res.status(403).json({ message: "You can only delete your own posts" });
      }
      
      await storage.deletePost(postId);
      res.json({ message: "Post deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // CONNECTION ROUTES
  apiRouter.get("/connections", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const connections = await storage.getConnections(userId);
      
      // Get details for connected users
      const connectionDetails = await Promise.all(
        connections.map(async (connection) => {
          const otherUserId = connection.requesterId === userId 
            ? connection.recipientId 
            : connection.requesterId;
          
          const user = await storage.getUser(otherUserId);
          if (!user) return null;
          
          return {
            connection,
            user,
          };
        })
      );
      
      // Filter out null values
      const validConnections = connectionDetails.filter(x => x !== null);
      
      res.json(validConnections);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.get("/connections/pending", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const pendingConnections = await storage.getPendingConnections(userId);
      
      // Get details for requesters
      const connectionDetails = await Promise.all(
        pendingConnections.map(async (connection) => {
          const requester = await storage.getUser(connection.requesterId);
          if (!requester) return null;
          
          return {
            connection,
            user: requester,
          };
        })
      );
      
      // Filter out null values
      const validConnections = connectionDetails.filter(x => x !== null);
      
      res.json(validConnections);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.post("/connections", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const connectionData = insertConnectionSchema.parse({
        ...req.body,
        requesterId: userId,
        status: 'pending',
      });
      
      // Check if recipient exists
      const recipient = await storage.getUser(connectionData.recipientId);
      if (!recipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      
      // Check if connection already exists
      const userConnections = await storage.getConnections(userId);
      const existingConnection = userConnections.find(
        conn => 
          (conn.requesterId === userId && conn.recipientId === connectionData.recipientId) ||
          (conn.requesterId === connectionData.recipientId && conn.recipientId === userId)
      );
      
      if (existingConnection) {
        return res.status(400).json({ message: "Connection already exists" });
      }
      
      // Check if there's a pending connection
      const pendingConnections = await storage.getPendingConnections(userId);
      const existingPending = pendingConnections.find(
        conn => conn.requesterId === connectionData.recipientId
      );
      
      if (existingPending) {
        // Auto-accept the existing pending connection
        const updatedConnection = await storage.updateConnectionStatus(existingPending.id, 'accepted');
        return res.status(200).json({ 
          message: "Accepted existing connection request", 
          connection: updatedConnection 
        });
      }
      
      const connection = await storage.createConnection(connectionData);
      res.status(201).json(connection);
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  apiRouter.put("/connections/:id", isAuthenticated, async (req, res) => {
    try {
      const connectionId = parseInt(req.params.id);
      const userId = getUserId(req);
      const { status } = req.body;
      
      if (!status || !['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const pendingConnections = await storage.getPendingConnections(userId);
      const connection = pendingConnections.find(conn => conn.id === connectionId);
      
      if (!connection) {
        return res.status(404).json({ message: "Connection request not found" });
      }
      
      const updatedConnection = await storage.updateConnectionStatus(connectionId, status);
      res.json(updatedConnection);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // MESSAGE ROUTES
  apiRouter.get("/messages", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const messages = await storage.getMessagesByUserId(userId);
      
      // Group messages by conversation partner
      const conversationsMap = new Map();
      
      for (const message of messages) {
        const otherUserId = message.senderId === userId ? message.recipientId : message.senderId;
        
        if (!conversationsMap.has(otherUserId)) {
          const user = await storage.getUser(otherUserId);
          if (!user) continue;
          
          conversationsMap.set(otherUserId, {
            user: user,
            lastMessage: message,
            unreadCount: message.recipientId === userId && !message.isRead ? 1 : 0,
          });
        } else {
          const conversation = conversationsMap.get(otherUserId);
          // Check if createdAt is null before creating Date objects
          const messageDate = message.createdAt ? new Date(message.createdAt) : new Date(0);
          const lastMessageDate = conversation.lastMessage.createdAt ? 
            new Date(conversation.lastMessage.createdAt) : new Date(0);
            
          if (messageDate > lastMessageDate) {
            conversation.lastMessage = message;
          }
          
          if (message.recipientId === userId && !message.isRead) {
            conversation.unreadCount += 1;
          }
        }
      }
      
      // Convert map to array and sort by last message date
      const conversations = Array.from(conversationsMap.values())
        .sort((a, b) => {
          const dateA = a.lastMessage.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
          const dateB = b.lastMessage.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      
      res.json(conversations);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.get("/messages/:userId", isAuthenticated, async (req, res) => {
    try {
      const currentUserId = getUserId(req);
      const otherUserId = req.params.userId;
      
      // Check if the other user exists
      const otherUser = await storage.getUser(otherUserId);
      if (!otherUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const messages = await storage.getMessagesBetweenUsers(currentUserId, otherUserId);
      
      // Mark messages as read
      await Promise.all(
        messages
          .filter(msg => msg.recipientId === currentUserId && !msg.isRead)
          .map(msg => storage.markMessageAsRead(msg.id))
      );
      
      res.json(messages);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.post("/messages", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: userId,
        isRead: false,
      });
      
      // Check if recipient exists
      const recipient = await storage.getUser(messageData.recipientId);
      if (!recipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  // DASHBOARD DATA ROUTE
  apiRouter.get("/dashboard", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get connections count
      const connectionCount = await storage.getConnectionCount(userId);
      
      // Get pending connections count
      const pendingConnections = await storage.getPendingConnections(userId);
      const pendingCount = pendingConnections.length;
      
      // Get projects count
      const projects = await storage.getProjectsByUserId(userId);
      const projectCount = projects.length;
      
      // Get unread messages count
      const unreadMessageCount = await storage.getUnreadMessageCount(userId);
      
      // Get skills
      const skills = await storage.getSkillsByUserId(userId);
      
      // Get resources
      const resources = await storage.getResourcesByUserId(userId);
      
      res.json({
        user,
        stats: {
          connectionCount,
          pendingCount,
          projectCount,
          unreadMessageCount,
        },
        skills,
        resources,
        projects,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Mount API router
  app.use("/api", apiRouter);
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}

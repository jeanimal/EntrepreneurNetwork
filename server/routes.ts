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

// Custom session type
declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
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
  
  // Authentication check middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };
  
  // AUTH ROUTES
  apiRouter.post("/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      // Create user
      const user = await storage.createUser(userData);
      
      // Store user ID in session
      req.session.userId = user.id;
      
      // Return user data without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  apiRouter.post("/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Store user ID in session
      req.session.userId = user.id;
      
      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.post("/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });
  
  apiRouter.get("/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await storage.getUser(req.session.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Return user data without password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
  
  // USER ROUTES
  apiRouter.get("/users", requireAuth, async (req, res) => {
    try {
      const query = req.query.q as string || "";
      const users = await storage.searchUsers(query);
      
      // Remove passwords from users
      const sanitizedUsers = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(sanitizedUsers);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.get("/users/:id", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user data without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.put("/users/:id", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Check if user is updating their own profile
      if (userId !== req.session.userId) {
        return res.status(403).json({ message: "You can only update your own profile" });
      }
      
      // Update user data
      const updatedUser = await storage.updateUser(userId, req.body);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user data without password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // PROJECT ROUTES
  apiRouter.get("/projects", requireAuth, async (req, res) => {
    try {
      const query = req.query.q as string || "";
      const projects = await storage.searchProjects(query);
      res.json(projects);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.get("/users/:userId/projects", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const projects = await storage.getProjectsByUserId(userId);
      res.json(projects);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.post("/projects", requireAuth, async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse({
        ...req.body,
        userId: req.session.userId,
      });
      
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  apiRouter.put("/projects/:id", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user owns the project
      if (project.userId !== req.session.userId) {
        return res.status(403).json({ message: "You can only update your own projects" });
      }
      
      const updatedProject = await storage.updateProject(projectId, req.body);
      res.json(updatedProject);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.delete("/projects/:id", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user owns the project
      if (project.userId !== req.session.userId) {
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
  apiRouter.get("/users/:userId/resources", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const resources = await storage.getResourcesByUserId(userId);
      res.json(resources);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.post("/resources", requireAuth, async (req, res) => {
    try {
      const resourceData = insertResourceSchema.parse({
        ...req.body,
        userId: req.session.userId,
      });
      
      const resource = await storage.createResource(resourceData);
      res.status(201).json(resource);
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  apiRouter.put("/resources/:id", requireAuth, async (req, res) => {
    try {
      const resourceId = parseInt(req.params.id);
      const resources = await storage.getResourcesByUserId(req.session.userId);
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
  apiRouter.get("/users/:userId/skills", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const skills = await storage.getSkillsByUserId(userId);
      res.json(skills);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.post("/skills", requireAuth, async (req, res) => {
    try {
      const skillData = insertSkillSchema.parse({
        ...req.body,
        userId: req.session.userId,
      });
      
      const skill = await storage.createSkill(skillData);
      res.status(201).json(skill);
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  apiRouter.put("/skills/:id", requireAuth, async (req, res) => {
    try {
      const skillId = parseInt(req.params.id);
      const skills = await storage.getSkillsByUserId(req.session.userId);
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
  
  apiRouter.delete("/skills/:id", requireAuth, async (req, res) => {
    try {
      const skillId = parseInt(req.params.id);
      const skills = await storage.getSkillsByUserId(req.session.userId);
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
  apiRouter.get("/feed", requireAuth, async (req, res) => {
    try {
      const posts = await storage.getFeedPosts();
      res.json(posts);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.get("/users/:userId/posts", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const posts = await storage.getPostsByUserId(userId);
      res.json(posts);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.post("/posts", requireAuth, async (req, res) => {
    try {
      const postData = insertPostSchema.parse({
        ...req.body,
        userId: req.session.userId,
      });
      
      const post = await storage.createPost(postData);
      res.status(201).json(post);
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  apiRouter.delete("/posts/:id", requireAuth, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getPost(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Check if user owns the post
      if (post.userId !== req.session.userId) {
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
  apiRouter.get("/connections", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const connections = await storage.getConnections(userId);
      
      // Get details for connected users
      const connectionDetails = await Promise.all(
        connections.map(async (connection) => {
          const otherUserId = connection.requesterId === userId 
            ? connection.recipientId 
            : connection.requesterId;
          
          const user = await storage.getUser(otherUserId);
          if (!user) return null;
          
          const { password, ...userWithoutPassword } = user;
          return {
            connection,
            user: userWithoutPassword,
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
  
  apiRouter.get("/connections/pending", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const pendingConnections = await storage.getPendingConnections(userId);
      
      // Get details for requesters
      const connectionDetails = await Promise.all(
        pendingConnections.map(async (connection) => {
          const requester = await storage.getUser(connection.requesterId);
          if (!requester) return null;
          
          const { password, ...requesterWithoutPassword } = requester;
          return {
            connection,
            user: requesterWithoutPassword,
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
  
  apiRouter.post("/connections", requireAuth, async (req, res) => {
    try {
      const connectionData = insertConnectionSchema.parse({
        ...req.body,
        requesterId: req.session.userId,
        status: 'pending',
      });
      
      // Check if recipient exists
      const recipient = await storage.getUser(connectionData.recipientId);
      if (!recipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      
      // Check if connection already exists
      const userConnections = await storage.getConnections(req.session.userId);
      const existingConnection = userConnections.find(
        conn => 
          (conn.requesterId === req.session.userId && conn.recipientId === connectionData.recipientId) ||
          (conn.requesterId === connectionData.recipientId && conn.recipientId === req.session.userId)
      );
      
      if (existingConnection) {
        return res.status(400).json({ message: "Connection already exists" });
      }
      
      // Check if there's a pending connection
      const pendingConnections = await storage.getPendingConnections(req.session.userId);
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
  
  apiRouter.put("/connections/:id", requireAuth, async (req, res) => {
    try {
      const connectionId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const pendingConnections = await storage.getPendingConnections(req.session.userId);
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
  apiRouter.get("/messages", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const messages = await storage.getMessagesByUserId(userId);
      
      // Group messages by conversation partner
      const conversationsMap = new Map();
      
      for (const message of messages) {
        const otherUserId = message.senderId === userId ? message.recipientId : message.senderId;
        
        if (!conversationsMap.has(otherUserId)) {
          const user = await storage.getUser(otherUserId);
          if (!user) continue;
          
          const { password, ...userWithoutPassword } = user;
          
          conversationsMap.set(otherUserId, {
            user: userWithoutPassword,
            lastMessage: message,
            unreadCount: message.recipientId === userId && !message.isRead ? 1 : 0,
          });
        } else {
          const conversation = conversationsMap.get(otherUserId);
          if (new Date(message.createdAt) > new Date(conversation.lastMessage.createdAt)) {
            conversation.lastMessage = message;
          }
          
          if (message.recipientId === userId && !message.isRead) {
            conversation.unreadCount += 1;
          }
        }
      }
      
      // Convert map to array and sort by last message date
      const conversations = Array.from(conversationsMap.values())
        .sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime());
      
      res.json(conversations);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.get("/messages/:userId", requireAuth, async (req, res) => {
    try {
      const currentUserId = req.session.userId;
      const otherUserId = parseInt(req.params.userId);
      
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
  
  apiRouter.post("/messages", requireAuth, async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: req.session.userId,
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
  apiRouter.get("/dashboard", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from user data
      const { password, ...userWithoutPassword } = user;
      
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
        user: userWithoutPassword,
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

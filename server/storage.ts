import {
  users, User, InsertUser,
  projects, Project, InsertProject,
  resources, Resource, InsertResource,
  skills, Skill, InsertSkill,
  posts, Post, InsertPost,
  connections, Connection, InsertConnection,
  messages, Message, InsertMessage,
  resourceCategories
} from "@shared/schema";
import { db } from "./db";
import { and, eq, or, like, desc, asc, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, userData: Partial<User>): Promise<User | undefined>;
  upsertUser(userData: { 
    id: string, 
    username: string, 
    email?: string | null, 
    firstName?: string | null, 
    lastName?: string | null,
    bio?: string | null,
    profileImageUrl?: string | null
  }): Promise<User>;
  searchUsers(query: string): Promise<User[]>;
  
  // Project operations
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByUserId(userId: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, projectData: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  searchProjects(query: string): Promise<Project[]>;
  
  // Resource operations
  getResourcesByUserId(userId: string): Promise<Resource[]>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: number, resourceData: Partial<Resource>): Promise<Resource | undefined>;
  
  // Skill operations
  getSkillsByUserId(userId: string): Promise<Skill[]>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: number, skillData: Partial<Skill>): Promise<Skill | undefined>;
  deleteSkill(id: number): Promise<boolean>;
  
  // Post operations
  getPost(id: number): Promise<Post | undefined>;
  getFeedPosts(): Promise<(Post & { user: User })[]>;
  getPostsByUserId(userId: string): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  deletePost(id: number): Promise<boolean>;
  
  // Connection operations
  getConnections(userId: string): Promise<Connection[]>;
  getPendingConnections(userId: string): Promise<Connection[]>;
  createConnection(connection: InsertConnection): Promise<Connection>;
  updateConnectionStatus(id: number, status: string): Promise<Connection | undefined>;
  getConnectionCount(userId: string): Promise<number>;
  
  // Message operations
  getMessagesBetweenUsers(userId1: string, userId2: string): Promise<Message[]>;
  getMessagesByUserId(userId: string): Promise<Message[]>;
  getUnreadMessageCount(userId: string): Promise<number>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message | undefined>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private resources: Map<number, Resource>;
  private skills: Map<number, Skill>;
  private posts: Map<number, Post>;
  private connections: Map<number, Connection>;
  private messages: Map<number, Message>;
  
  private userIdCounter: number;
  private projectIdCounter: number;
  private resourceIdCounter: number;
  private skillIdCounter: number;
  private postIdCounter: number;
  private connectionIdCounter: number;
  private messageIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.resources = new Map();
    this.skills = new Map();
    this.posts = new Map();
    this.connections = new Map();
    this.messages = new Map();
    
    this.userIdCounter = 1;
    this.projectIdCounter = 1;
    this.resourceIdCounter = 1;
    this.skillIdCounter = 1;
    this.postIdCounter = 1;
    this.connectionIdCounter = 1;
    this.messageIdCounter = 1;
    
    // Initialize with sample data
    this.seedData();
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    // Make sure all required fields are provided
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt,
      profileCompletion: 25,
      bio: insertUser.bio || null,
      location: insertUser.location || null,
      headline: insertUser.headline || null,
      company: insertUser.company || null,
      avatarUrl: insertUser.avatarUrl || null
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async searchUsers(query: string): Promise<User[]> {
    if (!query) return Array.from(this.users.values());
    
    const lowerQuery = query.toLowerCase();
    return Array.from(this.users.values()).filter(
      (user) => 
        user.name.toLowerCase().includes(lowerQuery) ||
        user.username.toLowerCase().includes(lowerQuery) ||
        (user.bio && user.bio.toLowerCase().includes(lowerQuery)) ||
        (user.headline && user.headline.toLowerCase().includes(lowerQuery)) ||
        (user.company && user.company.toLowerCase().includes(lowerQuery))
    );
  }
  
  // Project operations
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async getProjectsByUserId(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.userId === userId
    );
  }
  
  async createProject(project: InsertProject): Promise<Project> {
    const id = this.projectIdCounter++;
    const createdAt = new Date();
    // Make sure all required fields are provided
    const newProject: Project = { 
      ...project, 
      id, 
      createdAt,
      lookingFor: project.lookingFor || null,
      tags: project.tags || null
    };
    this.projects.set(id, newProject);
    return newProject;
  }
  
  async updateProject(id: number, projectData: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject = { ...project, ...projectData };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
  
  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }
  
  async searchProjects(query: string): Promise<Project[]> {
    if (!query) return Array.from(this.projects.values());
    
    const lowerQuery = query.toLowerCase();
    return Array.from(this.projects.values()).filter(
      (project) => 
        project.title.toLowerCase().includes(lowerQuery) ||
        project.description.toLowerCase().includes(lowerQuery) ||
        (project.lookingFor && project.lookingFor.toLowerCase().includes(lowerQuery)) ||
        (project.tags && project.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    );
  }
  
  // Resource operations
  async getResourcesByUserId(userId: number): Promise<Resource[]> {
    return Array.from(this.resources.values()).filter(
      (resource) => resource.userId === userId
    );
  }
  
  async createResource(resource: InsertResource): Promise<Resource> {
    const id = this.resourceIdCounter++;
    const createdAt = new Date();
    // Make sure all required fields are provided
    const newResource: Resource = { 
      ...resource, 
      id, 
      createdAt,
      have: resource.have || null,
      need: resource.need || null
    };
    this.resources.set(id, newResource);
    return newResource;
  }
  
  async updateResource(id: number, resourceData: Partial<Resource>): Promise<Resource | undefined> {
    const resource = this.resources.get(id);
    if (!resource) return undefined;
    
    const updatedResource = { ...resource, ...resourceData };
    this.resources.set(id, updatedResource);
    return updatedResource;
  }
  
  // Skill operations
  async getSkillsByUserId(userId: number): Promise<Skill[]> {
    return Array.from(this.skills.values()).filter(
      (skill) => skill.userId === userId
    );
  }
  
  async createSkill(skill: InsertSkill): Promise<Skill> {
    const id = this.skillIdCounter++;
    const createdAt = new Date();
    const newSkill: Skill = { ...skill, id, createdAt };
    this.skills.set(id, newSkill);
    return newSkill;
  }
  
  async updateSkill(id: number, skillData: Partial<Skill>): Promise<Skill | undefined> {
    const skill = this.skills.get(id);
    if (!skill) return undefined;
    
    const updatedSkill = { ...skill, ...skillData };
    this.skills.set(id, updatedSkill);
    return updatedSkill;
  }
  
  async deleteSkill(id: number): Promise<boolean> {
    return this.skills.delete(id);
  }
  
  // Post operations
  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }
  
  async getFeedPosts(): Promise<(Post & { user: User })[]> {
    const posts = Array.from(this.posts.values()).sort((a, b) => {
      // Handle potential null values
      const aTime = a.createdAt?.getTime() || 0;
      const bTime = b.createdAt?.getTime() || 0;
      return bTime - aTime;
    });
    
    return posts.map(post => {
      const user = this.users.get(post.userId);
      if (!user) throw new Error(`User not found for post: ${post.id}`);
      return { ...post, user };
    });
  }
  
  async getPostsByUserId(userId: number): Promise<Post[]> {
    return Array.from(this.posts.values()).filter(
      (post) => post.userId === userId
    ).sort((a, b) => {
      // Handle potential null values
      const aTime = a.createdAt?.getTime() || 0;
      const bTime = b.createdAt?.getTime() || 0;
      return bTime - aTime;
    });
  }
  
  async createPost(post: InsertPost): Promise<Post> {
    const id = this.postIdCounter++;
    const createdAt = new Date();
    // Make sure all required fields are provided
    const newPost: Post = { 
      ...post, 
      id, 
      createdAt,
      tags: post.tags || null
    };
    this.posts.set(id, newPost);
    return newPost;
  }
  
  async deletePost(id: number): Promise<boolean> {
    return this.posts.delete(id);
  }
  
  // Connection operations
  async getConnections(userId: number): Promise<Connection[]> {
    return Array.from(this.connections.values()).filter(
      (connection) => 
        (connection.requesterId === userId || connection.recipientId === userId) && 
        connection.status === 'accepted'
    );
  }
  
  async getPendingConnections(userId: number): Promise<Connection[]> {
    return Array.from(this.connections.values()).filter(
      (connection) => 
        connection.recipientId === userId && 
        connection.status === 'pending'
    );
  }
  
  async createConnection(connection: InsertConnection): Promise<Connection> {
    const id = this.connectionIdCounter++;
    const createdAt = new Date();
    const newConnection: Connection = { ...connection, id, createdAt };
    this.connections.set(id, newConnection);
    return newConnection;
  }
  
  async updateConnectionStatus(id: number, status: string): Promise<Connection | undefined> {
    const connection = this.connections.get(id);
    if (!connection) return undefined;
    
    const updatedConnection = { ...connection, status };
    this.connections.set(id, updatedConnection);
    return updatedConnection;
  }
  
  async getConnectionCount(userId: number): Promise<number> {
    return (await this.getConnections(userId)).length;
  }
  
  // Message operations
  async getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(
        (message) => 
          (message.senderId === userId1 && message.recipientId === userId2) ||
          (message.senderId === userId2 && message.recipientId === userId1)
      )
      .sort((a, b) => {
        // Handle potential null values
        const aTime = a.createdAt?.getTime() || 0;
        const bTime = b.createdAt?.getTime() || 0;
        return aTime - bTime;
      });
  }
  
  async getMessagesByUserId(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(
        (message) => message.recipientId === userId || message.senderId === userId
      )
      .sort((a, b) => {
        // Handle potential null values
        const aTime = a.createdAt?.getTime() || 0;
        const bTime = b.createdAt?.getTime() || 0;
        return bTime - aTime;
      });
  }
  
  async getUnreadMessageCount(userId: number): Promise<number> {
    return Array.from(this.messages.values()).filter(
      (message) => message.recipientId === userId && !message.isRead
    ).length;
  }
  
  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const createdAt = new Date();
    // Make sure all required fields are provided
    const newMessage: Message = { 
      ...message, 
      id, 
      createdAt,
      isRead: message.isRead || false
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }
  
  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, isRead: true };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }
  
  // Initialize with sample data
  private seedData() {
    // Create sample users
    const alexMorgan: User = {
      id: this.userIdCounter++,
      username: 'alexmorgan',
      password: 'password123', // In real app, this would be hashed
      email: 'alex@example.com',
      name: 'Alex Morgan',
      bio: 'Tech entrepreneur focused on creating innovative solutions',
      location: 'San Francisco, CA',
      headline: 'Tech Founder & Product Strategist',
      company: 'TechSprint',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      userType: 'entrepreneur',
      profileCompletion: 78,
      createdAt: new Date(),
    };
    this.users.set(alexMorgan.id, alexMorgan);
    
    const jessicaWilson: User = {
      id: this.userIdCounter++,
      username: 'jessicawilson',
      password: 'password123',
      email: 'jessica@example.com',
      name: 'Jessica Wilson',
      bio: 'Angel investor with a focus on fintech startups',
      location: 'New York, NY',
      headline: 'Angel Investor • FinTech',
      company: 'Wilson Investments',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      userType: 'investor',
      profileCompletion: 90,
      createdAt: new Date(),
    };
    this.users.set(jessicaWilson.id, jessicaWilson);
    
    const davidKim: User = {
      id: this.userIdCounter++,
      username: 'davidkim',
      password: 'password123',
      email: 'david@example.com',
      name: 'David Kim',
      bio: 'Backend developer specializing in AI solutions',
      location: 'Austin, TX',
      headline: 'Backend Developer • AI',
      company: 'AI Solutions',
      avatarUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      userType: 'entrepreneur',
      profileCompletion: 65,
      createdAt: new Date(),
    };
    this.users.set(davidKim.id, davidKim);
    
    const robertJohnson: User = {
      id: this.userIdCounter++,
      username: 'robertjohnson',
      password: 'password123',
      email: 'robert@example.com',
      name: 'Robert Johnson',
      bio: 'CTO with experience scaling tech platforms',
      location: 'Seattle, WA',
      headline: 'CTO • SaaS Platform',
      company: 'SaaS Solutions',
      avatarUrl: 'https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      userType: 'entrepreneur',
      profileCompletion: 85,
      createdAt: new Date(),
    };
    this.users.set(robertJohnson.id, robertJohnson);
    
    const michaelFoster: User = {
      id: this.userIdCounter++,
      username: 'michaelfoster',
      password: 'password123',
      email: 'michael@example.com',
      name: 'Michael Foster',
      bio: 'Tech recruiter and startup advisor',
      location: 'Boston, MA',
      headline: 'Tech Recruiter & Startup Advisor',
      company: 'Foster Recruiting',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      userType: 'entrepreneur',
      profileCompletion: 70,
      createdAt: new Date(),
    };
    this.users.set(michaelFoster.id, michaelFoster);
    
    const sarahWilliams: User = {
      id: this.userIdCounter++,
      username: 'sarahwilliams',
      password: 'password123',
      email: 'sarah@example.com',
      name: 'Sarah Williams',
      bio: 'Founder of EcoTrack, a sustainability monitoring platform',
      location: 'Portland, OR',
      headline: 'Founder • Green Tech',
      company: 'EcoTrack',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      userType: 'entrepreneur',
      profileCompletion: 80,
      createdAt: new Date(),
    };
    this.users.set(sarahWilliams.id, sarahWilliams);
    
    // Create sample projects
    const techSprintProject: Project = {
      id: this.projectIdCounter++,
      userId: alexMorgan.id,
      title: 'TechSprint Mobile App',
      description: 'A mobile application for tech entrepreneurs to connect and find resources in their local area.',
      status: 'active',
      lookingFor: 'Backend Developer, UI/UX Designer',
      tags: ['Mobile App', 'React Native', 'Startup'],
      createdAt: new Date(),
    };
    this.projects.set(techSprintProject.id, techSprintProject);
    
    const investorMatchProject: Project = {
      id: this.projectIdCounter++,
      userId: alexMorgan.id,
      title: 'InvestorMatch Platform',
      description: 'A platform to match early-stage startups with relevant angel investors based on industry and investment criteria.',
      status: 'planning',
      lookingFor: 'Co-founder, Technical Lead, Angel Investors',
      tags: ['Web Platform', 'FinTech', 'Angel Investment'],
      createdAt: new Date(),
    };
    this.projects.set(investorMatchProject.id, investorMatchProject);
    
    const ecoTrackProject: Project = {
      id: this.projectIdCounter++,
      userId: sarahWilliams.id,
      title: 'EcoTrack Platform',
      description: 'A sustainability monitoring platform for businesses to track and improve their environmental impact.',
      status: 'active',
      lookingFor: 'CTO, Backend Developers',
      tags: ['Green Tech', 'Sustainability', 'SaaS'],
      createdAt: new Date(),
    };
    this.projects.set(ecoTrackProject.id, ecoTrackProject);
    
    // Create sample resources for Alex Morgan
    resourceCategories.forEach((category, index) => {
      const resourceId = this.resourceIdCounter++;
      const resource: Resource = {
        id: resourceId,
        userId: alexMorgan.id,
        category,
        have: this.getSampleHave(category),
        need: this.getSampleNeed(category),
        createdAt: new Date(),
      };
      this.resources.set(resourceId, resource);
    });
    
    // Create sample skills for Alex Morgan
    const skills = [
      { name: 'Product Management', rating: 95 },
      { name: 'Startup Growth', rating: 85 },
      { name: 'Marketing Strategy', rating: 80 },
      { name: 'UX Design', rating: 75 },
    ];
    
    skills.forEach(skillData => {
      const skillId = this.skillIdCounter++;
      const skill: Skill = {
        id: skillId,
        userId: alexMorgan.id,
        name: skillData.name,
        rating: skillData.rating,
        createdAt: new Date(),
      };
      this.skills.set(skillId, skill);
    });
    
    // Create sample posts
    const post1: Post = {
      id: this.postIdCounter++,
      userId: michaelFoster.id,
      content: 'Looking for a frontend developer with React experience to join our team at FinTech Innovations. We\'re building a platform for small businesses to access financial tools. Great opportunity for someone looking to grow in the fintech space.',
      tags: ['React', 'Frontend', 'FinTech'],
      type: 'opportunity',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    };
    this.posts.set(post1.id, post1);
    
    const post2: Post = {
      id: this.postIdCounter++,
      userId: sarahWilliams.id,
      content: 'Just closed our seed round for EcoTrack, a sustainability monitoring platform for businesses! Now looking to connect with experienced CTOs and backend developers who have scaled similar solutions. Also interested in meeting potential advisors with experience in the green tech space.',
      tags: ['Sustainability', 'Green Tech', 'Seed Stage'],
      type: 'update',
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    };
    this.posts.set(post2.id, post2);
    
    // Create sample connections
    const connection1: Connection = {
      id: this.connectionIdCounter++,
      requesterId: alexMorgan.id,
      recipientId: jessicaWilson.id,
      status: 'accepted',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    };
    this.connections.set(connection1.id, connection1);
    
    const connection2: Connection = {
      id: this.connectionIdCounter++,
      requesterId: alexMorgan.id,
      recipientId: davidKim.id,
      status: 'pending',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    };
    this.connections.set(connection2.id, connection2);
    
    // Create sample messages
    const message1: Message = {
      id: this.messageIdCounter++,
      senderId: jessicaWilson.id,
      recipientId: alexMorgan.id,
      content: 'Hi Alex, I saw your InvestorMatch project and I\'m interested in learning more. Could we set up a call next week?',
      isRead: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    };
    this.messages.set(message1.id, message1);
    
    const message2: Message = {
      id: this.messageIdCounter++,
      senderId: alexMorgan.id,
      recipientId: jessicaWilson.id,
      content: 'Hi Jessica, absolutely! I\'m available Monday or Tuesday afternoon. Let me know what works for you.',
      isRead: true,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    };
    this.messages.set(message2.id, message2);
    
    const message3: Message = {
      id: this.messageIdCounter++,
      senderId: jessicaWilson.id,
      recipientId: alexMorgan.id,
      content: 'Tuesday at 2pm works for me. I\'ll send a calendar invite with a video call link.',
      isRead: false,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    };
    this.messages.set(message3.id, message3);
  }
  
  private getSampleHave(category: string): string[] {
    switch(category) {
      case 'tech_skills':
        return ['Product Strategy', 'UX/UI Design'];
      case 'money':
        return ['Seed Investment Experience'];
      case 'social_network':
        return ['Tech Startup Connections', 'Product Managers'];
      case 'business_skills':
        return ['Growth Marketing', 'Business Development'];
      case 'financial_skills':
        return ['Budget Planning'];
      case 'marketing_skills':
        return ['Social Media Marketing', 'SEO'];
      case 'legal_expertise':
        return [];
      default:
        return [];
    }
  }
  
  private getSampleNeed(category: string): string[] {
    switch(category) {
      case 'tech_skills':
        return ['Backend Development', 'DevOps'];
      case 'money':
        return ['Series A Capital', 'Angel Investors'];
      case 'social_network':
        return ['VC Connections', 'Industry Advisors'];
      case 'business_skills':
        return ['Financial Modeling', 'Legal Expertise'];
      case 'financial_skills':
        return ['Tax Strategy', 'Investment Structuring'];
      case 'marketing_skills':
        return ['Content Marketing', 'PR Connections'];
      case 'legal_expertise':
        return ['IP Protection', 'Contract Negotiation'];
      default:
        return [];
    }
  }
}

/**
 * PostgreSQL database storage implementation
 */
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!email) return undefined;
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Ensure we have the correct defaults for nullable fields
    const userWithDefaults = {
      ...insertUser,
      profileCompletion: 25,
      bio: insertUser.bio || null,
      location: insertUser.location || null,
      headline: insertUser.headline || null,
      company: insertUser.company || null,
      avatarUrl: insertUser.avatarUrl || null
    };
    
    const [user] = await db.insert(users).values(userWithDefaults).returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async upsertUser(userData: { 
    id: string, 
    username: string, 
    email?: string | null, 
    firstName?: string | null, 
    lastName?: string | null,
    bio?: string | null,
    profileImageUrl?: string | null
  }): Promise<User> {
    // Try to find the user first
    const existingUser = await this.getUser(userData.id);
    
    // If we have a name from both first and last name, combine them
    const name = userData.firstName && userData.lastName 
      ? `${userData.firstName} ${userData.lastName}`
      : existingUser?.name ?? userData.username;
    
    // Calculate profile completion
    let profileCompletion = 20; // Base score for having an account
    if (userData.email) profileCompletion += 10;
    if (userData.firstName && userData.lastName) profileCompletion += 10;
    if (userData.bio) profileCompletion += 10;
    if (userData.profileImageUrl) profileCompletion += 10;
    if (existingUser?.location) profileCompletion += 10;
    if (existingUser?.headline) profileCompletion += 10;
    if (existingUser?.company) profileCompletion += 10;
    if (existingUser?.avatarUrl) profileCompletion += 10;
    
    // Prepare data for upsert operation
    const upsertData = {
      id: userData.id,
      username: userData.username,
      email: userData.email || existingUser?.email || null,
      name,
      firstName: userData.firstName || existingUser?.firstName || null,
      lastName: userData.lastName || existingUser?.lastName || null,
      bio: userData.bio || existingUser?.bio || null,
      profileImageUrl: userData.profileImageUrl || existingUser?.profileImageUrl || null,
      profileCompletion,
      
      // Keep existing values if they exist
      location: existingUser?.location || null,
      headline: existingUser?.headline || null,
      company: existingUser?.company || null,
      avatarUrl: existingUser?.avatarUrl || null,
      userType: existingUser?.userType || "entrepreneur",
      updatedAt: new Date()
    };
    
    // Perform upsert
    const [user] = await db
      .insert(users)
      .values(upsertData)
      .onConflictDoUpdate({
        target: users.id,
        set: upsertData
      })
      .returning();
      
    return user;
  }

  async searchUsers(query: string): Promise<User[]> {
    if (!query) {
      return await db.select().from(users);
    }

    return await db.select().from(users).where(
      or(
        like(users.name, `%${query}%`),
        like(users.username, `%${query}%`),
        like(users.bio || '', `%${query}%`),
        like(users.headline || '', `%${query}%`),
        like(users.company || '', `%${query}%`)
      )
    );
  }

  // Project operations
  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getProjectsByUserId(userId: string): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.userId, userId));
  }

  async createProject(project: InsertProject): Promise<Project> {
    // Ensure we have the correct defaults for nullable fields
    const projectWithDefaults = {
      ...project,
      lookingFor: project.lookingFor || null,
      tags: project.tags || null
    };
    
    const [newProject] = await db.insert(projects).values(projectWithDefaults).returning();
    return newProject;
  }

  async updateProject(id: number, projectData: Partial<Project>): Promise<Project | undefined> {
    const [project] = await db.update(projects)
      .set(projectData)
      .where(eq(projects.id, id))
      .returning();
    return project || undefined;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id)).returning();
    return result.length > 0;
  }

  async searchProjects(query: string): Promise<Project[]> {
    if (!query) {
      return await db.select().from(projects);
    }

    return await db.select().from(projects).where(
      or(
        like(projects.title, `%${query}%`),
        like(projects.description, `%${query}%`),
        like(projects.lookingFor || '', `%${query}%`)
      )
    );
  }

  // Resource operations
  async getResourcesByUserId(userId: string): Promise<Resource[]> {
    return await db.select().from(resources).where(eq(resources.userId, userId));
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    // Ensure we have the correct defaults for nullable fields
    const resourceWithDefaults = {
      ...resource,
      have: resource.have || null,
      need: resource.need || null
    };
    
    const [newResource] = await db.insert(resources).values(resourceWithDefaults).returning();
    return newResource;
  }

  async updateResource(id: number, resourceData: Partial<Resource>): Promise<Resource | undefined> {
    const [resource] = await db.update(resources)
      .set(resourceData)
      .where(eq(resources.id, id))
      .returning();
    return resource || undefined;
  }

  // Skill operations
  async getSkillsByUserId(userId: string): Promise<Skill[]> {
    return await db.select().from(skills).where(eq(skills.userId, userId));
  }

  async createSkill(skill: InsertSkill): Promise<Skill> {
    const [newSkill] = await db.insert(skills).values(skill).returning();
    return newSkill;
  }

  async updateSkill(id: number, skillData: Partial<Skill>): Promise<Skill | undefined> {
    const [skill] = await db.update(skills)
      .set(skillData)
      .where(eq(skills.id, id))
      .returning();
    return skill || undefined;
  }

  async deleteSkill(id: number): Promise<boolean> {
    const result = await db.delete(skills).where(eq(skills.id, id)).returning();
    return result.length > 0;
  }

  // Post operations
  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post || undefined;
  }

  async getFeedPosts(): Promise<(Post & { user: User })[]> {
    const postResults = await db.select({
      post: posts,
      user: users
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .orderBy(desc(posts.createdAt));

    return postResults.map(({ post, user }) => ({ ...post, user }));
  }

  async getPostsByUserId(userId: string): Promise<Post[]> {
    return await db.select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt));
  }

  async createPost(post: InsertPost): Promise<Post> {
    // Ensure we have the correct defaults for nullable fields
    const postWithDefaults = {
      ...post,
      tags: post.tags || null
    };
    
    const [newPost] = await db.insert(posts).values(postWithDefaults).returning();
    return newPost;
  }

  async deletePost(id: number): Promise<boolean> {
    const result = await db.delete(posts).where(eq(posts.id, id)).returning();
    return result.length > 0;
  }

  // Connection operations
  async getConnections(userId: string): Promise<Connection[]> {
    return await db.select()
      .from(connections)
      .where(
        and(
          or(
            eq(connections.requesterId, userId),
            eq(connections.recipientId, userId)
          ),
          eq(connections.status, 'accepted')
        )
      );
  }

  async getPendingConnections(userId: string): Promise<Connection[]> {
    return await db.select()
      .from(connections)
      .where(
        and(
          eq(connections.recipientId, userId),
          eq(connections.status, 'pending')
        )
      );
  }

  async createConnection(connection: InsertConnection): Promise<Connection> {
    const [newConnection] = await db.insert(connections).values(connection).returning();
    return newConnection;
  }

  async updateConnectionStatus(id: number, status: string): Promise<Connection | undefined> {
    const [connection] = await db.update(connections)
      .set({ status })
      .where(eq(connections.id, id))
      .returning();
    return connection || undefined;
  }

  async getConnectionCount(userId: string): Promise<number> {
    const connections = await this.getConnections(userId);
    return connections.length;
  }

  // Message operations
  async getMessagesBetweenUsers(userId1: string, userId2: string): Promise<Message[]> {
    return await db.select()
      .from(messages)
      .where(
        or(
          and(
            eq(messages.senderId, userId1),
            eq(messages.recipientId, userId2)
          ),
          and(
            eq(messages.senderId, userId2),
            eq(messages.recipientId, userId1)
          )
        )
      )
      .orderBy(asc(messages.createdAt));
  }

  async getMessagesByUserId(userId: string): Promise<Message[]> {
    return await db.select()
      .from(messages)
      .where(
        or(
          eq(messages.senderId, userId),
          eq(messages.recipientId, userId)
        )
      )
      .orderBy(desc(messages.createdAt));
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(
        and(
          eq(messages.recipientId, userId),
          eq(messages.isRead, false)
        )
      );
    return result[0]?.count || 0;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const [message] = await db.update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id))
      .returning();
    return message || undefined;
  }
}

// Use database storage instead of in-memory storage
export const storage = new DatabaseStorage();

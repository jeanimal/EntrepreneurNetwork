export interface Resource {
  id: number;
  userId: number;
  category: string;
  have: string[];
  need: string[];
  createdAt: Date;
}

export interface Skill {
  id: number;
  userId: number;
  name: string;
  rating: number;
  createdAt: Date;
}

export interface Project {
  id: number;
  userId: number;
  title: string;
  description: string;
  status: "active" | "planning" | "completed";
  lookingFor: string;
  tags: string[];
  createdAt: Date;
}

export interface Post {
  id: number;
  userId: number;
  content: string;
  tags: string[];
  type: "update" | "project" | "opportunity";
  createdAt: Date;
  user: {
    id: number;
    name: string;
    avatarUrl: string;
    headline: string;
  };
}

export interface Connection {
  id: number;
  requesterId: number;
  recipientId: number;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
}

export interface Message {
  id: number;
  senderId: number;
  recipientId: number;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Conversation {
  user: {
    id: number;
    name: string;
    avatarUrl: string;
    headline: string;
  };
  lastMessage: Message;
  unreadCount: number;
}

export interface DashboardStats {
  connectionCount: number;
  pendingCount: number;
  projectCount: number;
  unreadMessageCount: number;
}

export interface DashboardData {
  user: User;
  stats: DashboardStats;
  skills: Skill[];
  resources: Resource[];
  projects: Project[];
}

export interface Event {
  id: number;
  title: string;
  date: Date;
  location: string;
  time: string;
}

export interface RecommendedUser {
  id: number;
  name: string;
  headline: string;
  avatarUrl: string;
}

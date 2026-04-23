export type ProjectCategory = "Architecture" | "Civil Engineering" | "Project Management" | "Masterplanning" | "Interior";
export type ProjectStatus = "Completed" | "Ongoing";

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: ProjectCategory;
  status: ProjectStatus;
  description: string;
  imageUrl: string;
  location: string;
  completionYear?: number;
  client?: string;
}

export type BlogPostCategory = "Sustainability" | "Urbanization" | "Design Trends" | "Rwanda Projects";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: BlogPostCategory;
  readTime: string;
  publishedAt: string;
  imageUrl: string;
  author: {
    name: string;
    role: string;
    avatarUrl?: string; // Optional for now
  }
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
}

export interface Service {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  imageUrl: string;
  icon: string; // name of lucide icon ideally
}
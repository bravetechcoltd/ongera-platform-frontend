import { Project, BlogPost, TeamMember, Service } from "@/types";

export const dummyProjects: Project[] = [
  {
    id: "1",
    slug: "kigali-heights-complex",
    title: "Kigali Heights Complex",
    category: "Architecture",
    status: "Completed",
    description: "A mixed-use commercial complex in Kigali.",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop",
    location: "Kigali, Rwanda",
    completionYear: 2022
  },
  {
    id: "2",
    slug: "urban-bridge-initiative",
    title: "Urban Bridge Initiative",
    category: "Civil Engineering",
    status: "Ongoing",
    description: "A major infrastructure project connecting rural and urban sectors.",
    imageUrl: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?q=80&w=2070&auto=format&fit=crop",
    location: "Musanze, Rwanda",
  },
  {
    id: "3",
    slug: "pearl-residences",
    title: "Pearl Residences",
    category: "Interior",
    status: "Completed",
    description: "High-end luxury apartments with sustainable interior finishes.",
    imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop",
    location: "Kigali, Rwanda",
    completionYear: 2023
  },
  {
    id: "4",
    slug: "eco-lodge-akagera",
    title: "Eco-Lodge Akagera",
    category: "Architecture",
    status: "Completed",
    description: "A sustainable hospitality lodge integrated within the natural landscape.",
    imageUrl: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=1974&auto=format&fit=crop",
    location: "Akagera, Rwanda",
    completionYear: 2021
  },
  {
    id: "5",
    slug: "horizon-office-tower",
    title: "Horizon Office Tower",
    category: "Architecture",
    status: "Ongoing",
    description: "A 30-story commercial office tower focusing on energy efficiency.",
    imageUrl: "https://images.unsplash.com/photo-1481253127861-534498168948?q=80&w=1973&auto=format&fit=crop",
    location: "Kigali, Rwanda",
  },
  {
    id: "6",
    slug: "green-city-pilot",
    title: "Green City Pilot",
    category: "Masterplanning",
    status: "Ongoing",
    description: "Masterplan for a sustainable, net-zero greenhouse emission neighborhood.",
    imageUrl: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1955&auto=format&fit=crop",
    location: "Kigali, Rwanda",
  }
];

export const dummyPosts: BlogPost[] = [
  {
    id: "1",
    slug: "future-of-vertical-forests",
    title: "The Future of Vertical Forests in Kigali: A Green Renaissance",
    category: "Sustainability",
    readTime: "7 min read",
    publishedAt: "2024-03-12T10:00:00Z",
    excerpt: "As urbanization accelerates across East Africa, Rwanda is setting a global benchmark for integrating lush, vertical biophilic elements into luxury residential high-rises.",
    content: "Full content here...",
    imageUrl: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1955&auto=format&fit=crop",
    author: {
      name: "Jean-Paul S.",
      role: "Chief Architect"
    }
  },
  {
    id: "2",
    slug: "net-zero-luxury",
    title: "The New Standard of Net-Zero Luxury",
    category: "Sustainability",
    readTime: "4 min read",
    publishedAt: "2024-02-28T09:00:00Z",
    excerpt: "Can high-end architecture truly be carbon neutral? NEEZA explores the innovative techniques behind the Kigali Green Tech Villas.",
    content: "Full content here...",
    imageUrl: "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000&auto=format&fit=crop",
    author: {
      name: "Elena Kagame",
      role: "Sustainability Lead"
    }
  },
  {
    id: "3",
    slug: "smart-infrastructure",
    title: "Smart Infrastructure in Expanding Megacities",
    category: "Urbanization",
    readTime: "6 min read",
    publishedAt: "2024-02-15T11:00:00Z",
    excerpt: "A deep dive into how Kigali and Nairobi are implementing IoT sensors to manage resource distribution and traffic flow.",
    content: "Full content here...",
    imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2070&auto=format&fit=crop",
    author: {
      name: "David Mutungi",
      role: "Civil Engineer"
    }
  },
  {
    id: "4",
    slug: "sustainable-materials",
    title: "Sustainable Materials: Beyond the Aesthetic",
    category: "Design Trends",
    readTime: "5 min read",
    publishedAt: "2024-01-20T08:30:00Z",
    excerpt: "Discover how reclaimed materials and bio-composites are redefining the luxury interior landscape in modern African estates.",
    content: "Full content here...",
    imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=2070&auto=format&fit=crop",
    author: {
      name: "Sarah Mwebaza",
      role: "Interior Designer"
    }
  }
];

export const dummyTeam: TeamMember[] = [
  {
    id: "1",
    name: "Yves Karangwa",
    role: "MD & Co-Founder",
    bio: "15 years of experience leading major commercial developments across East Africa.",
    imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop"
  },
  {
    id: "2",
    name: "Jean Karangwa",
    role: "MD & Co-Founder",
    bio: "12 years of experience leading major commercial developments across East Africa.",
    imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1974&auto=format&fit=crop"
  },
  {
    id: "3",
    name: "Tony Karangwa",
    role: "MD & Co-Founder",
    bio: "10 years of experience leading major commercial developments across East Africa.",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop"
  }
];
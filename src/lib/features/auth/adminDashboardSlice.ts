import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";

// ============ INTERFACES ============
export interface OverviewStats {
  totalUsers: number;
  totalProjects: number;
  totalCommunities: number;
  totalEvents: number;
  platformHealth: "healthy" | "warning" | "critical";
}

export interface UserStats {
  total: number;
  verified: number;
  active: number;
  inactive: number;
  verificationRate: number;
  newToday: number;
  newThisWeek: number;
  newThisMonth: number;
  growthRate: number;
  byAccountType: Record<string, number>;
}

export interface ProjectEngagement {
  totalViews: number;
  totalDownloads: number;
  totalLikes: number;
  totalComments: number;
  avgViewsPerProject: number;
}

export interface TopProject {
  id: string;
  title: string;
  views: number;
  downloads: number;
  likes: number;
  author: string;
}

export interface ProjectStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  newToday: number;
  newThisWeek: number;
  newThisMonth: number;
  publishRate: number;
  engagement: ProjectEngagement;
  topProjects: TopProject[];
}

export interface CommunityEngagement {
  totalMembers: number;
  totalPosts: number;
  avgMembersPerCommunity: number;
  pendingJoinRequests: number;
}

export interface TopCommunity {
  id: string;
  name: string;
  members: number;
  posts: number;
  category: string;
  creator: string;
}

export interface CommunityStats {
  total: number;
  active: number;
  pending: number;
  approvalRate: number;
  newToday: number;
  newThisWeek: number;
  newThisMonth: number;
  engagement: CommunityEngagement;
  topCommunities: TopCommunity[];
}

export interface EventRegistration {
  total: number;
  approved: number;
  attended: number;
  attendanceRate: number;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  startDate: Date;
  type: string;
  mode: string;
  organizer: string;
}

export interface EventStats {
  total: number;
  upcoming: number;
  ongoing: number;
  completed: number;
  cancelled: number;
  newToday: number;
  newThisWeek: number;
  newThisMonth: number;
  registration: EventRegistration;
  upcomingEvents: UpcomingEvent[];
}

export interface ContentStats {
  blogs: {
    total: number;
    published: number;
    publishRate: number;
  };
  qa: {
    total: number;
    answered: number;
    answerRate: number;
    unanswered: number;
  };
  communityPosts: {
    total: number;
  };
}

export interface ActivityTimelineItem {
  date: string;
  newUsers: number;
  newProjects: number;
  newCommunities: number;
  newEvents: number;
  totalActivity: number;
}

export interface SystemAlert {
  type: "error" | "warning" | "info";
  category: string;
  message: string;
  count: number;
  priority: "high" | "medium" | "low";
}

export interface SystemHealth {
  status: "healthy" | "warning" | "critical";
  alerts: SystemAlert[];
  alertCount: {
    total: number;
    critical: number;
    warning: number;
    info: number;
  };
}

export interface AdminDashboardSummary {
  overview: OverviewStats;
  users: UserStats;
  projects: ProjectStats;
  communities: CommunityStats;
  events: EventStats;
  content: ContentStats;
  activityTimeline: ActivityTimelineItem[];
  systemHealth: SystemHealth;
  generatedAt: string;
}

export interface DetailedAnalytics {
  period: {
    startDate: string;
    endDate: string;
  };
  analytics: {
    users?: { newUsers: number };
    projects?: { newProjects: number };
    communities?: { newCommunities: number };
    events?: { newEvents: number };
  };
}

interface AdminDashboardState {
  summary: AdminDashboardSummary | null;
  analytics: DetailedAnalytics | null;
  isLoadingSummary: boolean;
  isLoadingAnalytics: boolean;
  error: string | null;
  lastFetched: number | null;
}

// ============ INITIAL STATE ============
const initialState: AdminDashboardState = {
  summary: null,
  analytics: null,
  isLoadingSummary: false,
  isLoadingAnalytics: false,
  error: null,
  lastFetched: null,
};

// ============ ASYNC THUNKS ============

// Fetch Admin Dashboard Summary
export const fetchAdminDashboardSummary = createAsyncThunk(
  "adminDashboard/fetchSummary",
  async (_, { rejectWithValue }) => {
    try {
      console.log("🔍 Fetching admin dashboard summary from API...");
      const response = await api.get("/admin/dashboard/summary");
      console.log("✅ Admin dashboard summary fetched:", response.data.data.summary);
      return response.data.data.summary as AdminDashboardSummary;
    } catch (error: any) {
      console.error("❌ Failed to fetch admin dashboard summary:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch admin dashboard summary"
      );
    }
  }
);

// Fetch Detailed Analytics
export const fetchDetailedAnalytics = createAsyncThunk(
  "adminDashboard/fetchAnalytics",
  async (
    params: {
      startDate: string;
      endDate: string;
      metric?: "users" | "projects" | "communities" | "events";
    },
    { rejectWithValue }
  ) => {
    try {
      console.log("🔍 Fetching detailed analytics...", params);
      const queryParams = new URLSearchParams({
        startDate: params.startDate,
        endDate: params.endDate,
        ...(params.metric && { metric: params.metric }),
      });
      
      const response = await api.get(`/admin/dashboard/analytics?${queryParams}`);
      console.log("✅ Detailed analytics fetched:", response.data.data);
      return response.data.data as DetailedAnalytics;
    } catch (error: any) {
      console.error("❌ Failed to fetch detailed analytics:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch detailed analytics"
      );
    }
  }
);

// ============ SLICE ============
const adminDashboardSlice = createSlice({
  name: "adminDashboard",
  initialState,
  reducers: {
    clearAdminDashboardError: (state) => {
      state.error = null;
    },
    clearAdminDashboardSummary: (state) => {
      state.summary = null;
      state.lastFetched = null;
    },
    clearDetailedAnalytics: (state) => {
      state.analytics = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard Summary
      .addCase(fetchAdminDashboardSummary.pending, (state) => {
        state.isLoadingSummary = true;
        state.error = null;
      })
      .addCase(
        fetchAdminDashboardSummary.fulfilled,
        (state, action: PayloadAction<AdminDashboardSummary>) => {
          state.isLoadingSummary = false;
          state.summary = action.payload;
          state.lastFetched = Date.now();
          state.error = null;
        }
      )
      .addCase(fetchAdminDashboardSummary.rejected, (state, action) => {
        state.isLoadingSummary = false;
        state.error = action.payload as string;
      })
      
      // Fetch Detailed Analytics
      .addCase(fetchDetailedAnalytics.pending, (state) => {
        state.isLoadingAnalytics = true;
        state.error = null;
      })
      .addCase(
        fetchDetailedAnalytics.fulfilled,
        (state, action: PayloadAction<DetailedAnalytics>) => {
          state.isLoadingAnalytics = false;
          state.analytics = action.payload;
          state.error = null;
        }
      )
      .addCase(fetchDetailedAnalytics.rejected, (state, action) => {
        state.isLoadingAnalytics = false;
        state.error = action.payload as string;
      });
  },
});

// ============ EXPORTS ============
export const {
  clearAdminDashboardError,
  clearAdminDashboardSummary,
  clearDetailedAnalytics,
} = adminDashboardSlice.actions;

export default adminDashboardSlice.reducer;
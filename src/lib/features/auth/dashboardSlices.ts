
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

export interface ProjectStats {
  total: number;
  published: number;
  draft: number;
  totalViews: number;
  totalDownloads: number;
  totalLikes: number;
}

export interface CommunityStats {
  total: number;
  created: number;
  joined: number;
}

export interface EventStats {
  organizing: number;
  attending: number;
  upcoming: number;
  total: number;
}

export interface BlogStats {
  total: number;
  published: number;
  draft: number;
}

export interface QAStats {
  totalQuestions: number;
  answeredQuestions: number;
  unansweredQuestions: number;
}

export interface RecentActivity {
  projects: any[];
  posts: any[];
  events: any[];
}

export interface DashboardSummary {
  projects: ProjectStats;
  communities: CommunityStats;
  events: EventStats;
  blogs: BlogStats;
  qa: QAStats;
  recentActivity: RecentActivity;
}

export interface ActivityItem {
  id: string;
  type: 'project' | 'post' | 'event' | 'comment' | 'like' | 'follow' | 'achievement';
  title: string;
  description: string;
  timestamp: string;
  user?: {
    id: string;
    name: string;
    avatar: string;
  };
  metadata?: {
    projectId?: string;
    communityId?: string;
    eventId?: string;
    postId?: string;
    likesCount?: number;
    commentsCount?: number;
    viewsCount?: number;
  };
  link?: string;
}

export interface ActivitiesResponse {
  activities: ActivityItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

interface DashboardState {
  summary: DashboardSummary | null;
  activities: ActivityItem[];
  isLoading: boolean;
  isActivitiesLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  activitiesPagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  activitiesFilter: string;
}

const initialState: DashboardState = {
  summary: null,
  activities: [],
  isLoading: false,
  isActivitiesLoading: false,
  error: null,
  lastFetched: null,
  activitiesPagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false
  },
  activitiesFilter: 'all'
};

// Fetch Dashboard Summary
export const fetchDashboardSummary = createAsyncThunk(
  "dashboard/fetchSummary",
  async (_, { rejectWithValue }) => {
    try {
      console.log("🔍 Fetching dashboard summary from API...");
      const response = await api.get("/dashboard/summary");
      console.log("✅ Dashboard summary fetched:", response.data.data.summary);
      return response.data.data.summary;
    } catch (error: any) {
      console.error("❌ Failed to fetch dashboard summary:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch dashboard summary"
      );
    }
  }
);

// Fetch All Activities
export const fetchAllActivities = createAsyncThunk(
  "dashboard/fetchAllActivities",
  async (params: { page?: number; limit?: number; type?: string } = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 20, type = 'all' } = params;
      const queryParams = new URLSearchParams();
      
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      queryParams.append('type', type);

      console.log("🔍 Fetching all activities from API...", { page, limit, type });
      const response = await api.get(`/dashboard/activities?${queryParams.toString()}`);
      console.log("✅ Activities fetched:", response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error("❌ Failed to fetch activities:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch activities"
      );
    }
  }
);

// Fetch More Activities (Pagination)
export const fetchMoreActivities = createAsyncThunk(
  "dashboard/fetchMoreActivities",
  async (params: { page: number; limit?: number; type?: string }, { rejectWithValue }) => {
    try {
      const { page, limit = 20, type = 'all' } = params;
      const queryParams = new URLSearchParams();
      
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      queryParams.append('type', type);

      console.log("🔍 Fetching more activities...", { page, limit, type });
      const response = await api.get(`/dashboard/activities?${queryParams.toString()}`);
      console.log("✅ More activities fetched:", response.data.data.activities.length);
      return response.data.data;
    } catch (error: any) {
      console.error("❌ Failed to fetch more activities:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch more activities"
      );
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
    clearDashboardSummary: (state) => {
      state.summary = null;
      state.lastFetched = null;
    },
    clearActivities: (state) => {
      state.activities = [];
      state.activitiesPagination = {
        page: 1,
        limit: 20,
        total: 0,
        hasMore: false
      };
    },
    setActivitiesFilter: (state, action) => {
      state.activitiesFilter = action.payload;
      state.activities = [];
      state.activitiesPagination.page = 1;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard Summary
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.summary = action.payload;
        state.lastFetched = Date.now();
        state.error = null;
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch All Activities
      .addCase(fetchAllActivities.pending, (state) => {
        state.isActivitiesLoading = true;
        state.error = null;
      })
      .addCase(fetchAllActivities.fulfilled, (state, action) => {
        state.isActivitiesLoading = false;
        state.activities = action.payload.activities || [];
        state.activitiesPagination = {
          page: action.payload.page || 1,
          limit: action.payload.limit || 20,
          total: action.payload.total || 0,
          hasMore: action.payload.hasMore || false
        };
        state.error = null;
      })
      .addCase(fetchAllActivities.rejected, (state, action) => {
        state.isActivitiesLoading = false;
        state.error = action.payload as string;
        state.activities = [];
      })
      
      // Fetch More Activities
      .addCase(fetchMoreActivities.pending, (state) => {
        state.isActivitiesLoading = true;
      })
      .addCase(fetchMoreActivities.fulfilled, (state, action) => {
        state.isActivitiesLoading = false;
        state.activities = [...state.activities, ...(action.payload.activities || [])];
        state.activitiesPagination = {
          page: action.payload.page || state.activitiesPagination.page,
          limit: action.payload.limit || 20,
          total: action.payload.total || 0,
          hasMore: action.payload.hasMore || false
        };
        state.error = null;
      })
      .addCase(fetchMoreActivities.rejected, (state, action) => {
        state.isActivitiesLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { 
  clearDashboardError, 
  clearDashboardSummary, 
  clearActivities, 
  setActivitiesFilter 
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
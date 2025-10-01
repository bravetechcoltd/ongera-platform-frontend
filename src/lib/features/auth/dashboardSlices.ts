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

interface DashboardState {
  summary: DashboardSummary | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: DashboardState = {
  summary: null,
  isLoading: false,
  error: null,
  lastFetched: null
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
      });
  }
});

export const { clearDashboardError, clearDashboardSummary } = dashboardSlice.actions;
export default dashboardSlice.reducer;
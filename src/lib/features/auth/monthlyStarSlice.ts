import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

export interface UserStatistics {
  projects_count: number;
  blogs_count: number;
  events_attended: number;
  followers_count: number;
  total_score: number;
}

export interface TopPerformer {
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_picture_url?: string;
    account_type: string;
    profile?: any;
  };
  statistics: UserStatistics;
  details: {
    projects: any[];
    blogs: any[];
    events: any[];
  };
}

export interface MonthlyStarData {
  month: string;
  year: number;
  topPerformers: TopPerformer[];
  community?: {
    id: string;
    name: string;
  };
}

interface MonthlyStarState {
  allCommunitiesData: MonthlyStarData | null;
  communityData: MonthlyStarData | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

const initialState: MonthlyStarState = {
  allCommunitiesData: null,
  communityData: null,
  isLoading: false,
  isSubmitting: false,
  error: null
};

// Fetch top performers across all communities
export const fetchBestPerformersAllCommunities = createAsyncThunk(
  "monthlyStar/fetchAllCommunities",
  async (_, { rejectWithValue }) => {
    try {
      console.log("🔍 Fetching best performers (all communities)...");
      const response = await api.get("/tracker/best-performer/all-communities");
      console.log("✅ Best performers fetched:", response.data);
      return response.data.data;
    } catch (error: any) {
      console.error("❌ Failed to fetch best performers:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch best performers"
      );
    }
  }
);

// Fetch top performers for specific community
export const fetchBestPerformersCommunity = createAsyncThunk(
  "monthlyStar/fetchCommunity",
  async (communityId: string, { rejectWithValue }) => {
    try {
      console.log(`🔍 Fetching best performers for community: ${communityId}`);
      const response = await api.get(`/tracker/best-performer/community/${communityId}`);
      console.log("✅ Community best performers fetched:", response.data);
      return response.data.data;
    } catch (error: any) {
      console.error("❌ Failed to fetch community best performers:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch community best performers"
      );
    }
  }
);

// Admin approves best performer
export const approveBestPerformer = createAsyncThunk(
  "monthlyStar/approve",
  async (data: {
    user_id: string;
    community_id?: string;
    month: number;
    year: number;
    badge_image: File;
    description: string;
    rewards: string;
  }, { rejectWithValue }) => {
    try {
      console.log("✅ Approving best performer...");
      
      const formData = new FormData();
      formData.append("user_id", data.user_id);
      if (data.community_id) {
        formData.append("community_id", data.community_id);
      }
      formData.append("month", data.month.toString());
      formData.append("year", data.year.toString());
      formData.append("badge_image", data.badge_image);
      formData.append("description", data.description);
      formData.append("rewards", data.rewards);

      const response = await api.post("/tracker/approve-best-performer", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      console.log("✅ Best performer approved:", response.data);
      return response.data.data;
    } catch (error: any) {
      console.error("❌ Failed to approve best performer:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to approve best performer"
      );
    }
  }
);

const monthlyStarSlice = createSlice({
  name: "monthlyStar",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearData: (state) => {
      state.allCommunitiesData = null;
      state.communityData = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all communities
      .addCase(fetchBestPerformersAllCommunities.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBestPerformersAllCommunities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allCommunitiesData = action.payload;
      })
      .addCase(fetchBestPerformersAllCommunities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch specific community
      .addCase(fetchBestPerformersCommunity.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBestPerformersCommunity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.communityData = action.payload;
      })
      .addCase(fetchBestPerformersCommunity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Approve performer
      .addCase(approveBestPerformer.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(approveBestPerformer.fulfilled, (state) => {
        state.isSubmitting = false;
      })
      .addCase(approveBestPerformer.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearError, clearData } = monthlyStarSlice.actions;
export default monthlyStarSlice.reducer;
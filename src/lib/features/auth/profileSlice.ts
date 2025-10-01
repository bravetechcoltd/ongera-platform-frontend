import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "@/lib/api"

interface UserProfile {
  id: string
  user_id: string
  institution_name?: string
  department?: string
  academic_level?: string
  research_interests?: string[]
  orcid_id?: string
  google_scholar_url?: string
  linkedin_url?: string
  website_url?: string
  cv_file_url?: string
  current_position?: string
  home_institution?: string
  willing_to_mentor?: boolean
  total_projects_count: number
  total_followers_count: number
  total_following_count: number
}

export interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  account_type: "Student" | "Researcher" | "Institution" | "Diaspora" | string
  profile_picture_url?: string
  phone_number?: string
  bio?: string
  city?: string
  country?: string
  date_joined: string
  profile?: UserProfile
}

// FIXED: Store full User object, not just UserProfile
interface ProfileState {
  profile: User | null  // ✅ Changed from UserProfile to User
  isLoading: boolean
  error: string | null
}

const initialState: ProfileState = {
  profile: null,
  isLoading: false,
  error: null
}

export const fetchUserProfile = createAsyncThunk(
  "profile/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/profile")
      return response.data.data  // Returns full User object
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch profile")
    }
  }
)

export const updateUserProfile = createAsyncThunk(
  "profile/update",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await api.put("/auth/profile", data)
      return response.data.data  // Returns updated User object
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update profile")
    }
  }
)

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfileError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.profile = action.payload  // ✅ Store entire User object
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.profile = action.payload  // ✅ Update with full User object
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  }
})

export const { clearProfileError } = profileSlice.actions
export default profileSlice.reducer
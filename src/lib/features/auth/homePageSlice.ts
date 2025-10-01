import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "@/lib/api"

interface HomePageState {
    summary: {
        projectsCount: number
        researchersCount: number
        communitiesCount: number
        eventsCount: number
    } | null
    featuredProjects: any[]
    featuredEvents: any[]
    featuredCommunities: any[]
    latestUpcomingEvents: any[] // ✅ NEW: For homepage upcoming events section
    isLoading: boolean
    isLoadingContent: boolean
    isLoadingUpcomingEvents: boolean // ✅ NEW: Separate loading state
    error: string | null
}

// ==================== Update initialState ====================
const initialState: HomePageState = {
    summary: null,
    featuredProjects: [],
    featuredEvents: [],
    featuredCommunities: [],
    latestUpcomingEvents: [], // ✅ NEW
    isLoading: false,
    isLoadingContent: false,
    isLoadingUpcomingEvents: false, // ✅ NEW
    error: null
}

// Fetch homepage summary statistics
export const fetchHomePageSummary = createAsyncThunk(
    "homepage/fetchSummary",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/homepage/summary")
            return response.data.data
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch homepage summary")
        }
    }
)

export const fetchLatestUpcomingEvents = createAsyncThunk(
    "homepage/fetchLatestUpcomingEvents",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/events/upcoming/latest")
            console.log("📅 Latest Upcoming Events Fetched:", response.data.data)
            return response.data.data.events
        } catch (error: any) {
            console.error("❌ Failed to fetch latest upcoming events:", error)
            return rejectWithValue(error.response?.data?.message || "Failed to fetch upcoming events")
        }
    }
)
// Fetch featured content (projects, events, communities)
export const fetchHomePageContent = createAsyncThunk(
    "homepage/fetchContent",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/homepage/content")
            console.log("📊 Homepage Content Fetched:", response.data.data)
            return response.data.data
        } catch (error: any) {
            console.error("❌ Failed to fetch homepage content:", error)
            return rejectWithValue(error.response?.data?.message || "Failed to fetch homepage content")
        }
    }
)

const homePageSlice = createSlice({
    name: "homepage",
    initialState,
    reducers: {
        clearHomePageError: (state) => {
            state.error = null
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch summary
            .addCase(fetchHomePageSummary.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchHomePageSummary.fulfilled, (state, action) => {
                state.isLoading = false
                state.summary = action.payload
            })
            .addCase(fetchHomePageSummary.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })
            // Fetch content
            .addCase(fetchHomePageContent.pending, (state) => {
                state.isLoadingContent = true
                state.error = null
            })
            .addCase(fetchHomePageContent.fulfilled, (state, action) => {
                state.isLoadingContent = false
                state.featuredProjects = action.payload.projects
                state.featuredEvents = action.payload.events
                state.featuredCommunities = action.payload.communities
            })
            .addCase(fetchHomePageContent.rejected, (state, action) => {
                state.isLoadingContent = false
                state.error = action.payload as string
            })
            .addCase(fetchLatestUpcomingEvents.pending, (state) => {
                state.isLoadingUpcomingEvents = true
                state.error = null
            })
            .addCase(fetchLatestUpcomingEvents.fulfilled, (state, action) => {
                state.isLoadingUpcomingEvents = false
                state.latestUpcomingEvents = action.payload
            })
            .addCase(fetchLatestUpcomingEvents.rejected, (state, action) => {
                state.isLoadingUpcomingEvents = false
                state.error = action.payload as string
            })
    }
})

export const { clearHomePageError } = homePageSlice.actions
export default homePageSlice.reducer
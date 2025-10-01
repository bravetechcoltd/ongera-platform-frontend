// @ts-nocheck
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "@/lib/api"

export interface Community {
  id: string
  name: string
  slug: string
  description: string
  cover_image_url?: string
  category: string
  member_count: number
  post_count: number
  community_type: "Public" | "Private" | "Institution-Specific"
  join_approval_required: boolean
  is_active: boolean
  created_at: string
  creator: {
    id: string
    first_name: string
    last_name: string
    profile_picture_url?: string
    account_type: string
  }
  members?: any[]
  rules?: string
}

export interface CommunityPost {
  id: string
  post_type: string
  title?: string
  content: string
  media_urls?: string[]
  is_pinned: boolean
  is_locked: boolean
  view_count: number
  created_at: string
  updated_at: string
  author: {
    id: string
    first_name: string
    last_name: string
    profile_picture_url?: string
    account_type: string
  }
  linked_project?: {
    id: string
    title: string
  }
  community: {
    id: string
    name: string
  }
}

export interface JoinRequest {
  id: string
  status: "Pending" | "Approved" | "Rejected"
  message?: string
  requested_at: string
  responded_at?: string
  user: {
    id: string
    first_name: string
    last_name: string
    email: string
    profile_picture_url?: string
    account_type: string
    profile?: {
      institution_name?: string
      field_of_study?: string
    }
  }
  community: {
    id: string
    name: string
    description: string
    cover_image_url?: string
    creator: {
      id: string
      first_name: string
      last_name: string
    }
  }
}

interface CommunitiesState {
  communities: Community[]
  myCommunities: Community[]
  currentCommunity: Community | null
  communityPosts: CommunityPost[]
  pendingCommunities: Community[]
  adminCommunities: Community[]
  joinRequests: JoinRequest[]
  myPendingRequests: JoinRequest[]
  isLoading: boolean
  isSubmitting: boolean
  postsLoading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  postsPagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const initialState: CommunitiesState = {
  communities: [],
  myCommunities: [],
  currentCommunity: null,
  communityPosts: [],
  pendingCommunities: [],
  adminCommunities: [],
  joinRequests: [],
  myPendingRequests: [],
  isLoading: false,
  isSubmitting: false,
  postsLoading: false,
  error: null,
  pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
  postsPagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
}

// ==================== JOIN REQUEST THUNKS (NEW) ====================

export const fetchCommunityJoinRequests = createAsyncThunk(
  "communities/fetchJoinRequests",
  async (communityId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/communities/${communityId}/join-requests`)
      return response.data.data.joinRequests
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch join requests")
    }
  }
)

export const fetchMyPendingRequests = createAsyncThunk(
  "communities/fetchMyPendingRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/communities/join-requests/my-pending")
      return response.data.data.pendingRequests
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch pending requests")
    }
  }
)

export const approveJoinRequest = createAsyncThunk(
  "communities/approveJoinRequest",
  async (requestId: string, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/communities/join-requests/${requestId}/approve`)
      return response.data.data.joinRequest
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to approve request")
    }
  }
)

export const rejectJoinRequest = createAsyncThunk(
  "communities/rejectJoinRequest",
  async (params: { requestId: string; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/communities/join-requests/${params.requestId}/reject`, {
        reason: params.reason
      })
      return params.requestId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to reject request")
    }
  }
)

// ==================== EXISTING THUNKS ====================

export const fetchCommunityPosts = createAsyncThunk(
  "communities/fetchPosts",
  async (params: {
    communityId: string
    page?: number
    limit?: number
    post_type?: string
    author_id?: string
  }, { rejectWithValue }) => {
    try {
      const { communityId, ...queryParams } = params
      const queryString = new URLSearchParams()
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value) queryString.append(key, value.toString())
      })
      
      const response = await api.get(`/communities/${communityId}/posts?${queryString.toString()}`)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch community posts")
    }
  }
)

export const createCommunityPost = createAsyncThunk(
  "communities/createPost",
  async (params: {
    communityId: string
    postData: FormData
  }, { rejectWithValue }) => {
    try {
      const { communityId, postData } = params
      const response = await api.post(`/communities/${communityId}/posts`, postData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      return response.data.data.post
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create post")
    }
  }
)

export const activateDeactivateCommunity = createAsyncThunk(
  "communities/activateDeactivate",
  async (params: {
    id: string
    is_active: boolean
    reason?: string
  }, { rejectWithValue }) => {
    try {
      const { id, is_active, reason } = params
      const response = await api.patch(`/communities/admin/${id}/status`, {
        is_active,
        reason
      })
      return response.data.data.community
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update community status")
    }
  }
)

export const createCommunity = createAsyncThunk(
  "communities/create",
  async (communityData: FormData, { rejectWithValue }) => {
    try {
      const response = await api.post("/communities", communityData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      return response.data.data.community
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create community")
    }
  }
)

export const fetchCommunities = createAsyncThunk(
  "communities/fetchAll",
  async (params: {
    page?: number
    limit?: number
    search?: string
    category?: string
  } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString())
      })
      
      const response = await api.get(`/communities?${queryParams.toString()}`)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch communities")
    }
  }
)

export const fetchCommunityById = createAsyncThunk(
  "communities/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/communities/${id}`)
      return response.data.data.community
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch community")
    }
  }
)

export const joinCommunity = createAsyncThunk(
  "communities/join",
  async (params: { id: string; message?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/communities/${params.id}/join`, {
        message: params.message
      })
      return {
        id: params.id,
        message: response.data.message,
        requiresApproval: response.data.requiresApproval
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to join community")
    }
  }
)

export const leaveCommunity = createAsyncThunk(
  "communities/leave",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/communities/${id}/leave`)
      return { id, message: response.data.message }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to leave community")
    }
  }
)

export const fetchMyCommunities = createAsyncThunk(
  "communities/fetchMy",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/communities/my-communities")
      return response.data.data.communities
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch your communities")
    }
  }
)

export const fetchSuggestedCommunities = createAsyncThunk(
  "communities/fetchSuggested",
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/communities/suggestions/${projectId}`)
      return response.data.data.communities
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch suggested communities")
    }
  }
)

export const createCommunityPosts = createAsyncThunk(
  "communities/createPosts",
  async (postData: {
    community_ids: string[]
    content: string
    linked_project_id: string
    post_type?: string
  }, { rejectWithValue }) => {
    try {
      const response = await api.post('/communities/community-posts', postData)
      return response.data.data.posts
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create community posts")
    }
  }
)

export const fetchPendingCommunities = createAsyncThunk(
  "communities/fetchPending",
  async (params: {
    page?: number
    limit?: number
  } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString())
      })
      
      const response = await api.get(`/communities/admin/pending?${queryParams.toString()}`)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch pending communities")
    }
  }
)

export const fetchAllCommunitiesForAdmin = createAsyncThunk(
  "communities/fetchAllForAdmin",
  async (params: {
    page?: number
    limit?: number
    search?: string
    category?: string
    status?: 'all' | 'pending' | 'approved'
  } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString())
      })
      
      const response = await api.get(`/communities/admin/all?${queryParams.toString()}`)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch communities")
    }
  }
)

export const approveCommunity = createAsyncThunk(
  "communities/approve",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/communities/admin/${id}/approve`)
      return response.data.data.community
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to approve community")
    }
  }
)

export const rejectCommunity = createAsyncThunk(
  "communities/reject",
  async ({ id, reason }: { id: string; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/communities/admin/${id}/reject`, {
        data: { reason }
      })
      return { id, message: response.data.message }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to reject community")
    }
  }
)

export const deleteCommunity = createAsyncThunk(
  "communities/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/communities/admin/${id}`)
      return { id, message: response.data.message }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete community")
    }
  }
)

const communitiesSlice = createSlice({
  name: "communities",
  initialState,
  reducers: {
    clearCommunitiesError: (state) => {
      state.error = null
    },
    clearCurrentCommunity: (state) => {
      state.currentCommunity = null
    },
    clearCommunityPosts: (state) => {
      state.communityPosts = []
    },
    clearJoinRequests: (state) => {
      state.joinRequests = []
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommunityPosts.pending, (state) => {
        state.postsLoading = true
        state.error = null
      })
      .addCase(fetchCommunityPosts.fulfilled, (state, action) => {
        state.postsLoading = false
        state.communityPosts = action.payload.posts
        state.postsPagination = action.payload.pagination
      })
      .addCase(fetchCommunityPosts.rejected, (state, action) => {
        state.postsLoading = false
        state.error = action.payload as string
      })
      .addCase(createCommunityPost.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(createCommunityPost.fulfilled, (state, action) => {
        state.isSubmitting = false
        state.communityPosts.unshift(action.payload)
        if (state.currentCommunity) {
          state.currentCommunity.post_count += 1
        }
      })
      .addCase(createCommunityPost.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })
      .addCase(createCommunity.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(createCommunity.fulfilled, (state, action) => {
        state.isSubmitting = false
        state.myCommunities.unshift(action.payload)
        state.currentCommunity = action.payload
      })
      .addCase(createCommunity.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })
      .addCase(fetchCommunities.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCommunities.fulfilled, (state, action) => {
        state.isLoading = false
        state.communities = action.payload.communities
        state.pagination = action.payload.pagination
      })
      .addCase(fetchCommunities.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchCommunityById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCommunityById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentCommunity = action.payload
      })
      .addCase(fetchCommunityById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(joinCommunity.pending, (state) => {
        state.isSubmitting = true
      })
      .addCase(joinCommunity.fulfilled, (state, action) => {
        state.isSubmitting = false
        if (!action.payload.requiresApproval) {
          if (state.currentCommunity?.id === action.payload.id) {
            state.currentCommunity.member_count += 1
          }
          const community = state.communities.find(c => c.id === action.payload.id)
          if (community) {
            community.member_count += 1
          }
        }
      })
      .addCase(joinCommunity.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })
      .addCase(leaveCommunity.pending, (state) => {
        state.isSubmitting = true
      })
      .addCase(leaveCommunity.fulfilled, (state, action) => {
        state.isSubmitting = false
        if (state.currentCommunity?.id === action.payload.id) {
          state.currentCommunity.member_count = Math.max(0, state.currentCommunity.member_count - 1)
        }
        const community = state.communities.find(c => c.id === action.payload.id)
        if (community) {
          community.member_count = Math.max(0, community.member_count - 1)
        }
      })
      .addCase(leaveCommunity.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })
      .addCase(fetchMyCommunities.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchMyCommunities.fulfilled, (state, action) => {
        state.isLoading = false
        state.myCommunities = action.payload
      })
      .addCase(fetchMyCommunities.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchSuggestedCommunities.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchSuggestedCommunities.fulfilled, (state, action) => {
        state.isLoading = false
        state.communities = action.payload
      })
      .addCase(fetchSuggestedCommunities.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(createCommunityPosts.pending, (state) => {
        state.isSubmitting = true
      })
      .addCase(createCommunityPosts.fulfilled, (state, action) => {
        state.isSubmitting = false
      })
      .addCase(createCommunityPosts.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })
      .addCase(fetchPendingCommunities.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPendingCommunities.fulfilled, (state, action) => {
        state.isLoading = false
        state.pendingCommunities = action.payload.communities
        state.pagination = action.payload.pagination
      })
      .addCase(fetchPendingCommunities.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchAllCommunitiesForAdmin.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAllCommunitiesForAdmin.fulfilled, (state, action) => {
        state.isLoading = false
        state.adminCommunities = action.payload.communities
        state.pagination = action.payload.pagination
      })
      .addCase(fetchAllCommunitiesForAdmin.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(approveCommunity.pending, (state) => {
        state.isSubmitting = true
      })
      .addCase(approveCommunity.fulfilled, (state, action) => {
        state.isSubmitting = false
        state.pendingCommunities = state.pendingCommunities.filter(c => c.id !== action.payload.id)
        const community = state.adminCommunities.find(c => c.id === action.payload.id)
        if (community) {
          community.is_active = true
        }
      })
      .addCase(approveCommunity.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })
      .addCase(rejectCommunity.pending, (state) => {
        state.isSubmitting = true
      })
      .addCase(rejectCommunity.fulfilled, (state, action) => {
        state.isSubmitting = false
        state.pendingCommunities = state.pendingCommunities.filter(c => c.id !== action.payload.id)
        state.adminCommunities = state.adminCommunities.filter(c => c.id !== action.payload.id)
      })
      .addCase(rejectCommunity.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })
      .addCase(deleteCommunity.pending, (state) => {
        state.isSubmitting = true
      })
      .addCase(deleteCommunity.fulfilled, (state, action) => {
        state.isSubmitting = false
        state.adminCommunities = state.adminCommunities.filter(c => c.id !== action.payload.id)
        state.communities = state.communities.filter(c => c.id !== action.payload.id)
      })
      .addCase(deleteCommunity.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })
      .addCase(activateDeactivateCommunity.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(activateDeactivateCommunity.fulfilled, (state, action) => {
        state.isSubmitting = false
        const adminCommunity = state.adminCommunities.find(c => c.id === action.payload.id)
        if (adminCommunity) {
          adminCommunity.is_active = action.payload.is_active
        }
        const pendingCommunity = state.pendingCommunities.find(c => c.id === action.payload.id)
        if (pendingCommunity) {
          pendingCommunity.is_active = action.payload.is_active
        }
        if (state.currentCommunity?.id === action.payload.id) {
          state.currentCommunity.is_active = action.payload.is_active
        }
      })
      .addCase(activateDeactivateCommunity.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })
      
      // ==================== JOIN REQUEST REDUCERS (NEW) ====================
      
      .addCase(fetchCommunityJoinRequests.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCommunityJoinRequests.fulfilled, (state, action) => {
        state.isLoading = false
        state.joinRequests = action.payload
      })
      .addCase(fetchCommunityJoinRequests.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchMyPendingRequests.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMyPendingRequests.fulfilled, (state, action) => {
        state.isLoading = false
        state.myPendingRequests = action.payload
      })
      .addCase(fetchMyPendingRequests.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(approveJoinRequest.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(approveJoinRequest.fulfilled, (state, action) => {
        state.isSubmitting = false
        state.joinRequests = state.joinRequests.filter(req => req.id !== action.payload.id)
        if (state.currentCommunity?.id === action.payload.community.id) {
          state.currentCommunity.member_count += 1
        }
      })
      .addCase(approveJoinRequest.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })
      .addCase(rejectJoinRequest.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(rejectJoinRequest.fulfilled, (state, action) => {
        state.isSubmitting = false
        state.joinRequests = state.joinRequests.filter(req => req.id !== action.payload)
      })
      .addCase(rejectJoinRequest.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })
  }
})

export const { clearCommunitiesError, clearCurrentCommunity, clearCommunityPosts, clearJoinRequests } = communitiesSlice.actions
export default communitiesSlice.reducer
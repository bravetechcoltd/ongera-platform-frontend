import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "@/lib/api"

// [Previous interfaces remain 100% the same - ProjectFile, UserProfile, ProjectAuthor, etc.]
export interface ProjectFile {
  id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: string;
  uploaded_at: string;
  description: string | null;
}

export interface UserProfile {
  id: string;
  institution_name: string;
  department: string;
  academic_level: string;
  research_interests: string[];
  orcid_id: string;
  google_scholar_url: string;
  linkedin_url: string;
  website_url: string;
  cv_file_url: string;
  current_position: string;
  home_institution: string;
  willing_to_mentor: boolean;
  total_projects_count: number;
  total_followers_count: number;
  total_following_count: number;
}

export interface ProjectAuthor {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  profile_picture_url: string;
  bio: string;
  account_type: string;
  is_verified: boolean;
  is_active: boolean;
  date_joined: string;
  last_login: string;
  country: string;
  city: string;
  social_auth_provider: string | null;
  social_auth_id: string | null;
  profile: UserProfile;
}

export interface ProjectComment {
  id: string;
  comment_text: string;
  created_at: string;
  author: ProjectAuthor;
}

export interface ProjectTag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  usage_count: number;
  category: string;
}

export interface ResearchProject {
  community: any;
  id: string;
  title: string;
  abstract: string;
  full_description: string;
  status: "Draft" | "Published" | "Under Review" | "Archived";
  research_type: "Thesis" | "Paper" | "Project" | "Dataset" | "Case Study";
  project_file_url: string;
  cover_image_url: string;
  publication_date: string;
  created_at: string;
  updated_at: string;
  is_featured: boolean;
  like_count: number;
  comment_count: number;
  visibility: "Public" | "Community-Only" | "Private";
  field_of_study: string;
  doi: string;
  view_count: number;
  download_count: number;
  collaboration_status: "Solo" | "Seeking Collaborators" | "Collaborative";
  author: ProjectAuthor;
  tags: ProjectTag[];
  files: ProjectFile[];
}

export interface ProjectResponse {
  project: ResearchProject;
  hasLiked?: boolean;
  comments?: ProjectComment[];
}

interface ProjectState {
  projects: ResearchProject[]
  myProjects: ResearchProject[]
  currentProject: ProjectResponse | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  stats: {
    total: number
    draft: number
    published: number
    archived: number
  }
  communityProjects: ResearchProject[]
  currentCommunityId: string | null
  communityProjectsPagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  // NEW: Admin management
  adminProjects: ResearchProject[]
  adminProjectsPagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const initialState: ProjectState = {
  projects: [],
  myProjects: [],
  currentProject: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  stats: {
    total: 0,
    draft: 0,
    published: 0,
    archived: 0
  },
  communityProjects: [],
  currentCommunityId: null,
  communityProjectsPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  adminProjects: [],
  adminProjectsPagination: {
    page: 1,
    limit: 1000,
    total: 0,
    totalPages: 0
  }
}

// ==================== ORIGINAL THUNKS (100% MAINTAINED) ====================

export const likeProject = createAsyncThunk(
  "projects/like",
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/projects/${projectId}/like`)
      return { projectId, ...response.data.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to like project")
    }
  }
)

export const commentOnProject = createAsyncThunk(
  "projects/comment",
  async ({ projectId, content }: { projectId: string; content: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/projects/${projectId}/comment`, { content })
      return { projectId, ...response.data.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to add comment")
    }
  }
)

export const createProject = createAsyncThunk(
  "projects/create",
  async (projectData: FormData, { rejectWithValue }) => {
    try {
      const response = await api.post("/projects", projectData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      return response.data.data.project
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create project")
    }
  }
)

export const fetchProjects = createAsyncThunk(
  "projects/fetchAll",
  async (params: {
    page?: number
    limit?: number
    search?: string
    research_type?: string
    visibility?: string
    status?: string
  } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString())
      })
      
      const response = await api.get(`/projects?${queryParams.toString()}`)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch projects")
    }
  }
)

export const fetchProjectById = createAsyncThunk(
  "projects/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/projects/${id}`)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch project")
    }
  }
)

export const fetchMyProjects = createAsyncThunk(
  "projects/fetchMy",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/projects/my-projects")
      return response.data.data.projects
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch your projects")
    }
  }
)

export const updateProject = createAsyncThunk(
  "projects/update",
  async ({ id, updates }: { id: string; updates: Partial<ResearchProject> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/projects/${id}`, updates)
      return response.data.data.project
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update project")
    }
  }
)

export const deleteProject = createAsyncThunk(
  "projects/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/projects/${id}`)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete project")
    }
  }
)

export const updateProjectStatus = createAsyncThunk(
  "projects/updateStatus",
  async ({ id, status }: { id: string; status: 'Draft' | 'Published' }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/projects/${id}/status`, { status })
      return response.data.data.project
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update project status")
    }
  }
)

export const bulkDeleteProjects = createAsyncThunk(
  "projects/bulkDelete",
  async (ids: string[], { rejectWithValue }) => {
    try {
      await Promise.all(ids.map(id => api.delete(`/projects/${id}`)))
      return ids
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete projects")
    }
  }
)

export const bulkUpdateStatus = createAsyncThunk(
  "projects/bulkUpdateStatus",
  async ({ ids, status }: { ids: string[]; status: 'Draft' | 'Published' | 'Archived' }, { rejectWithValue }) => {
    try {
      await Promise.all(ids.map(id => api.patch(`/projects/${id}/status`, { status })))
      return { ids, status }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update project status")
    }
  }
)

export const fetchProjectForUpload = createAsyncThunk(
  "projects/fetchForUpload",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/projects/${id}`)
      return response.data.data.project
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch project")
    }
  }
)

export const archiveProject = createAsyncThunk(
  "projects/archive",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/projects/${id}/status`, { status: 'Archived' })
      return response.data.data.project
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to archive project")
    }
  }
)

export const duplicateProject = createAsyncThunk(
  "projects/duplicate",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/projects/${id}`)
      const original = response.data.data.project
      
      const formData = new FormData()
      formData.append('title', `${original.title} (Copy)`)
      formData.append('abstract', original.abstract)
      formData.append('full_description', original.full_description || '')
      formData.append('research_type', original.research_type)
      formData.append('visibility', original.visibility)
      formData.append('collaboration_status', original.collaboration_status)
      formData.append('field_of_study', original.field_of_study || '')
      formData.append('tags', JSON.stringify(original.tags.map((t: ProjectTag) => t.name)))
      
      const createResponse = await api.post("/projects", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      return createResponse.data.data.project
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to duplicate project")
    }
  }
)

export const fetchCommunityProjects = createAsyncThunk(
  "projects/fetchCommunity",
  async (params: {
    communityId: string
    page?: number
    limit?: number
    research_type?: string
  }, { rejectWithValue }) => {
    try {
      const { communityId, ...queryParams } = params
      const queryString = new URLSearchParams()
      
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value) queryString.append(key, value.toString())
      })
      
      const response = await api.get(
        `/communities/${communityId}/projects?${queryString.toString()}`
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch community projects"
      )
    }
  }
)

export const createCommunityProject = createAsyncThunk(
  "projects/createCommunity",
  async (params: {
    communityId: string
    formData: FormData
  }, { rejectWithValue }) => {
    try {
      const { communityId, formData } = params
      
      const response = await api.post(
        `/communities/${communityId}/projects`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      )
      
      return response.data.data.project
    } catch (error: any) {
      console.error("❌ Create community project error:", error)
      return rejectWithValue(
        error.response?.data?.message || "Failed to create community project"
      )
    }
  }
)

// ==================== NEW: ADMIN MANAGEMENT THUNKS ====================

/**
 * Get all projects for admin management
 */
export const getAllProjectsForAdmin = createAsyncThunk(
  "projects/getAllForAdmin",
  async (params: {
    page?: number
    limit?: number
    search?: string
    research_type?: string
    visibility?: string
    status?: string
  } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString())
      })
      
      const response = await api.get(`/projects/admin/all?${queryParams.toString()}`)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch projects")
    }
  }
)

/**
 * Activate/Deactivate project (Publish/Archive)
 */
export const activateDeactivateProject = createAsyncThunk(
  "projects/activateDeactivate",
  async ({ id, status, reason }: { 
    id: string
    status: 'Published' | 'Archived'
    reason?: string 
  }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/projects/admin/${id}/status`, { 
        status,
        reason 
      })
      return response.data.data.project
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update project status")
    }
  }
)

/**
 * Delete project by admin
 */
export const deleteProjectByAdmin = createAsyncThunk(
  "projects/deleteByAdmin",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/projects/admin/${id}`)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete project")
    }
  }
)

// ==================== SLICE ====================

const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentProject: (state) => {
      state.currentProject = null
    },
    updateStats: (state) => {
      const projects = state.myProjects
      state.stats = {
        total: projects.length,
        draft: projects.filter(p => p.status === 'Draft').length,
        published: projects.filter(p => p.status === 'Published').length,
        archived: projects.filter(p => p.status === 'Archived').length
      }
    },
    clearCommunityProjects: (state) => {
      state.communityProjects = []
      state.currentCommunityId = null
    },
    setCurrentCommunityId: (state, action) => {
      state.currentCommunityId = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // ==================== ORIGINAL CASES (100% MAINTAINED) ====================
      
      .addCase(createProject.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.isSubmitting = false
        state.myProjects.unshift(action.payload)
        state.currentProject = { project: action.payload }
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })
      
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false
        state.projects = action.payload.projects
        state.pagination = action.payload.pagination
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      .addCase(fetchProjectById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentProject = action.payload
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      .addCase(fetchMyProjects.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMyProjects.fulfilled, (state, action) => {
        state.isLoading = false
        state.myProjects = action.payload
        state.stats = {
          total: action.payload.length,
          draft: action.payload.filter((p: ResearchProject) => p.status === 'Draft').length,
          published: action.payload.filter((p: ResearchProject) => p.status === 'Published').length,
          archived: action.payload.filter((p: ResearchProject) => p.status === 'Archived').length
        }
      })
      .addCase(fetchMyProjects.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      .addCase(updateProject.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.isSubmitting = false
        state.currentProject = { project: action.payload }
        const index = state.myProjects.findIndex(p => p.id === action.payload.id)
        if (index !== -1) {
          state.myProjects[index] = action.payload
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })
      
      .addCase(deleteProject.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.isSubmitting = false
        state.myProjects = state.myProjects.filter(p => p.id !== action.payload)
        if (state.currentProject?.project?.id === action.payload) {
          state.currentProject = null
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })
      
      .addCase(updateProjectStatus.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(updateProjectStatus.fulfilled, (state, action) => {
        state.isSubmitting = false
        state.currentProject = { project: action.payload }
        const index = state.myProjects.findIndex(p => p.id === action.payload.id)
        if (index !== -1) {
          state.myProjects[index] = action.payload
        }
      })
      .addCase(updateProjectStatus.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })

      .addCase(bulkDeleteProjects.pending, (state) => {
        state.isSubmitting = true
      })
      .addCase(bulkDeleteProjects.fulfilled, (state, action) => {
        state.isSubmitting = false
        state.myProjects = state.myProjects.filter(p => !action.payload.includes(p.id))
      })
      .addCase(bulkDeleteProjects.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })

      .addCase(bulkUpdateStatus.pending, (state) => {
        state.isSubmitting = true
      })
      .addCase(bulkUpdateStatus.fulfilled, (state, action) => {
        state.isSubmitting = false
        const { ids, status } = action.payload
        state.myProjects = state.myProjects.map(p => 
          ids.includes(p.id) ? { ...p, status } : p
        )
      })
      .addCase(bulkUpdateStatus.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })

      .addCase(archiveProject.pending, (state) => {
        state.isSubmitting = true
      })
      .addCase(archiveProject.fulfilled, (state, action) => {
        state.isSubmitting = false
        const index = state.myProjects.findIndex(p => p.id === action.payload.id)
        if (index !== -1) {
          state.myProjects[index] = action.payload
        }
      })
      .addCase(archiveProject.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })

      .addCase(duplicateProject.pending, (state) => {
        state.isSubmitting = true
      })
      .addCase(duplicateProject.fulfilled, (state, action) => {
        state.isSubmitting = false
        state.myProjects.unshift(action.payload)
      })
      .addCase(duplicateProject.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })
      
      .addCase(fetchProjectForUpload.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProjectForUpload.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentProject = { project: action.payload }
      })
      .addCase(fetchProjectForUpload.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      .addCase(fetchCommunityProjects.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCommunityProjects.fulfilled, (state, action) => {
        state.isLoading = false
        state.communityProjects = action.payload.projects
        state.communityProjectsPagination = action.payload.pagination
        state.currentCommunityId = action.meta.arg.communityId
      })
      .addCase(fetchCommunityProjects.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    
      .addCase(likeProject.pending, (state) => {
        state.isSubmitting = true
      })
      .addCase(likeProject.fulfilled, (state, action) => {
        state.isSubmitting = false
        if (
          state.currentProject &&
          state.currentProject.project &&
          state.currentProject.project.id === action.payload.projectId
        ) {
          state.currentProject.project.like_count = action.payload.like_count
          state.currentProject.hasLiked = action.payload.liked
        }
      })
      .addCase(likeProject.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })

      .addCase(commentOnProject.pending, (state) => {
        state.isSubmitting = true
      })
      .addCase(commentOnProject.fulfilled, (state, action) => {
        state.isSubmitting = false
        if (
          state.currentProject &&
          state.currentProject.project &&
          state.currentProject.project.id === action.payload.projectId
        ) {
          state.currentProject.project.comment_count = action.payload.comment_count
          if (state.currentProject.comments) {
            state.currentProject.comments.unshift(action.payload.comment)
          } else {
            state.currentProject.comments = [action.payload.comment]
          }
        }
      })
      .addCase(commentOnProject.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })

      .addCase(createCommunityProject.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(createCommunityProject.fulfilled, (state, action) => {
        state.isSubmitting = false
        state.communityProjects.unshift(action.payload)
        state.currentProject = { project: action.payload }
        
        if (state.communityProjectsPagination) {
          state.communityProjectsPagination.total += 1
        }
      })
      .addCase(createCommunityProject.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })

      // ==================== NEW: ADMIN MANAGEMENT CASES ====================

      .addCase(getAllProjectsForAdmin.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getAllProjectsForAdmin.fulfilled, (state, action) => {
        state.isLoading = false
        state.adminProjects = action.payload.projects
        state.adminProjectsPagination = action.payload.pagination
      })
      .addCase(getAllProjectsForAdmin.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      .addCase(activateDeactivateProject.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(activateDeactivateProject.fulfilled, (state, action) => {
        state.isSubmitting = false
        const index = state.adminProjects.findIndex(p => p.id === action.payload.id)
        if (index !== -1) {
          state.adminProjects[index] = action.payload
        }
      })
      .addCase(activateDeactivateProject.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })

      .addCase(deleteProjectByAdmin.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(deleteProjectByAdmin.fulfilled, (state, action) => {
        state.isSubmitting = false
        state.adminProjects = state.adminProjects.filter(p => p.id !== action.payload)
      })
      .addCase(deleteProjectByAdmin.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })
  }
})

export const { clearError, clearCurrentProject, updateStats, clearCommunityProjects, setCurrentCommunityId } = projectSlice.actions
export default projectSlice.reducer
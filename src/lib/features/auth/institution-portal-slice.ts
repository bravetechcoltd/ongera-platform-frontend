import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "@/lib/api"

interface InstitutionPortalState {
  overview: any | null
  members: any[]
  students: any[]
  pendingProjects: any[]
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  membersPagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  studentsPagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  projectsPagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const initialState: InstitutionPortalState = {
  overview: null,
  members: [],
  students: [],
  pendingProjects: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
  membersPagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  },
  studentsPagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  },
  projectsPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  }
}

// Get institution overview
export const getInstitutionOverview = createAsyncThunk(
  "institutionPortal/getOverview",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/institution-portal/overview")
      if (response.data.success) {
        return response.data.data
      }
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch overview"
      )
    }
  }
)

// Get institution members
export const getInstitutionMembers = createAsyncThunk(
  "institutionPortal/getMembers",
  async (params: { type?: string; page?: number; limit?: number; search?: string }, { rejectWithValue }) => {
    try {
      const response = await api.get("/institution-portal/members", { params })
      if (response.data.success) {
        return response.data.data
      }
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch members"
      )
    }
  }
)

// Get instructor's students
export const getInstructorStudents = createAsyncThunk(
  "institutionPortal/getInstructorStudents",
  async (params: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await api.get("/institution-portal/instructor/students", { params })
      if (response.data.success) {
        return response.data.data
      }
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch students"
      )
    }
  }
)

// Get pending projects for instructor
export const getPendingProjects = createAsyncThunk(
  "institutionPortal/getPendingProjects",
  async (params: { page?: number; limit?: number; status?: string }, { rejectWithValue }) => {
    try {
      const response = await api.get("/institution-portal/instructor/pending-projects", { params })
      if (response.data.success) {
        return response.data.data
      }
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch pending projects"
      )
    }
  }
)

// Approve project
export const approveProject = createAsyncThunk(
  "institutionPortal/approveProject",
  async (data: { projectId: string; feedback?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/institution-portal/instructor/projects/${data.projectId}/approve`,
        { feedback: data.feedback }
      )
      if (response.data.success) {
        return response.data.data
      }
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to approve project"
      )
    }
  }
)

// Reject project
export const rejectProject = createAsyncThunk(
  "institutionPortal/rejectProject",
  async (data: { projectId: string; feedback: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/institution-portal/instructor/projects/${data.projectId}/reject`,
        { feedback: data.feedback }
      )
      if (response.data.success) {
        return response.data.data
      }
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reject project"
      )
    }
  }
)

// Return project
export const returnProject = createAsyncThunk(
  "institutionPortal/returnProject",
  async (data: { projectId: string; feedback: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/institution-portal/instructor/projects/${data.projectId}/return`,
        { feedback: data.feedback }
      )
      if (response.data.success) {
        return response.data.data
      }
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to return project"
      )
    }
  }
)

const institutionPortalSlice = createSlice({
  name: "institutionPortal",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearMembers: (state) => {
      state.members = []
    },
    clearStudents: (state) => {
      state.students = []
    },
    clearPendingProjects: (state) => {
      state.pendingProjects = []
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Overview
      .addCase(getInstitutionOverview.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getInstitutionOverview.fulfilled, (state, action) => {
        state.isLoading = false
        state.overview = action.payload
      })
      .addCase(getInstitutionOverview.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Get Members
      .addCase(getInstitutionMembers.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getInstitutionMembers.fulfilled, (state, action) => {
        state.isLoading = false
        state.members = action.payload.members
        state.membersPagination = action.payload.pagination
      })
      .addCase(getInstitutionMembers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Get Instructor Students
      .addCase(getInstructorStudents.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getInstructorStudents.fulfilled, (state, action) => {
        state.isLoading = false
        state.students = action.payload.students
        state.studentsPagination = action.payload.pagination
      })
      .addCase(getInstructorStudents.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Get Pending Projects
      .addCase(getPendingProjects.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getPendingProjects.fulfilled, (state, action) => {
        state.isLoading = false
        state.pendingProjects = action.payload.projects
        state.projectsPagination = action.payload.pagination
      })
      .addCase(getPendingProjects.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Approve Project
      .addCase(approveProject.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(approveProject.fulfilled, (state, action) => {
        state.isSubmitting = false
        // Remove from pending list
        state.pendingProjects = state.pendingProjects.filter(
          p => p.id !== action.payload.project.id
        )
      })
      .addCase(approveProject.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })

      // Reject Project
      .addCase(rejectProject.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(rejectProject.fulfilled, (state, action) => {
        state.isSubmitting = false
        state.pendingProjects = state.pendingProjects.filter(
          p => p.id !== action.payload.project.id
        )
      })
      .addCase(rejectProject.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })

      // Return Project
      .addCase(returnProject.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(returnProject.fulfilled, (state, action) => {
        state.isSubmitting = false
        // Keep in pending list with updated status
        const index = state.pendingProjects.findIndex(
          p => p.id === action.payload.project.id
        )
        if (index !== -1) {
          state.pendingProjects[index] = action.payload.project
        }
      })
      .addCase(returnProject.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })
  }
})

export const {
  clearError,
  clearMembers,
  clearStudents,
  clearPendingProjects
} = institutionPortalSlice.actions

export default institutionPortalSlice.reducer
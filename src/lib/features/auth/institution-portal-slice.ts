import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "@/lib/api"

interface InstitutionPortalState {
  overview: any | null
  members: any[]
  students: any[]
  pendingProjects: any[]
  // New FK-based portal state
  portalStudents: any[]
  portalInstructors: any[]
  portalDashboard: any | null
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
  portalStudentsPagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  portalInstructorsPagination: {
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
  },
  portalStudents: [],
  portalInstructors: [],
  portalDashboard: null,
  portalStudentsPagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  },
  portalInstructorsPagination: {
    page: 1,
    limit: 20,
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

// ===== NEW: Portal Member Management Thunks =====

export const addStudentToPortal = createAsyncThunk(
  "institutionPortal/addStudent",
  async (
    data: { student_email: string; instructor_id: string; academic_year: string; semester: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/institution-portal/members/add-student", data)
      if (response.data.success) return response.data.data
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add student"
      )
    }
  }
)

export const addInstructorToPortal = createAsyncThunk(
  "institutionPortal/addInstructor",
  async (data: { instructor_email: string }, { rejectWithValue }) => {
    try {
      const response = await api.post("/institution-portal/members/add-instructor", data)
      if (response.data.success) return response.data.data
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add instructor"
      )
    }
  }
)

export const getPortalStudents = createAsyncThunk(
  "institutionPortal/getPortalStudents",
  async (
    params: { page?: number; limit?: number; search?: string; instructor_id?: string; academic_year?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get("/institution-portal/portal/students", { params })
      if (response.data.success) return response.data.data
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch portal students"
      )
    }
  }
)

export const getPortalInstructors = createAsyncThunk(
  "institutionPortal/getPortalInstructors",
  async (
    params: { page?: number; limit?: number; search?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get("/institution-portal/portal/instructors", { params })
      if (response.data.success) return response.data.data
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch portal instructors"
      )
    }
  }
)

export const getPortalDashboard = createAsyncThunk(
  "institutionPortal/getPortalDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/institution-portal/portal/dashboard")
      if (response.data.success) return response.data.data
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch portal dashboard"
      )
    }
  }
)

export const removeStudentFromPortal = createAsyncThunk(
  "institutionPortal/removeStudent",
  async (studentId: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/institution-portal/members/students/${studentId}`)
      if (response.data.success) return studentId
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove student"
      )
    }
  }
)

export const removeInstructorFromPortal = createAsyncThunk(
  "institutionPortal/removeInstructor",
  async (instructorId: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/institution-portal/members/instructors/${instructorId}`)
      if (response.data.success) return instructorId
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove instructor"
      )
    }
  }
)

export const reassignStudentInstructor = createAsyncThunk(
  "institutionPortal/reassignStudent",
  async (data: { studentId: string; new_instructor_id: string }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/institution-portal/members/students/${data.studentId}/reassign`,
        { new_instructor_id: data.new_instructor_id }
      )
      if (response.data.success) return response.data.data
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reassign student"
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

      // ===== Portal Students (FK-based) =====
      .addCase(getPortalStudents.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getPortalStudents.fulfilled, (state, action) => {
        state.isLoading = false
        state.portalStudents = action.payload.students
        state.portalStudentsPagination = action.payload.pagination
      })
      .addCase(getPortalStudents.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // ===== Portal Instructors (FK-based) =====
      .addCase(getPortalInstructors.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getPortalInstructors.fulfilled, (state, action) => {
        state.isLoading = false
        state.portalInstructors = action.payload.instructors
        state.portalInstructorsPagination = action.payload.pagination
      })
      .addCase(getPortalInstructors.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // ===== Portal Dashboard =====
      .addCase(getPortalDashboard.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getPortalDashboard.fulfilled, (state, action) => {
        state.isLoading = false
        state.portalDashboard = action.payload
      })
      .addCase(getPortalDashboard.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // ===== Add Student =====
      .addCase(addStudentToPortal.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(addStudentToPortal.fulfilled, (state) => {
        state.isSubmitting = false
      })
      .addCase(addStudentToPortal.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })

      // ===== Add Instructor =====
      .addCase(addInstructorToPortal.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(addInstructorToPortal.fulfilled, (state) => {
        state.isSubmitting = false
      })
      .addCase(addInstructorToPortal.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })

      // ===== Remove Student =====
      .addCase(removeStudentFromPortal.fulfilled, (state, action) => {
        state.portalStudents = state.portalStudents.filter(
          (s: any) => s.student?.id !== action.payload
        )
      })

      // ===== Remove Instructor =====
      .addCase(removeInstructorFromPortal.fulfilled, (state, action) => {
        state.portalInstructors = state.portalInstructors.filter(
          (i: any) => i.id !== action.payload
        )
      })

      // ===== Reassign Student =====
      .addCase(reassignStudentInstructor.fulfilled, (state) => {
        state.isSubmitting = false
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
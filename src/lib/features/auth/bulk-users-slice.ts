import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "@/lib/api"

interface Instructor {
  email: string
  first_name: string
  last_name: string
  phone_number?: string
  department?: string
  user_id?: string
  password?: string
}

interface Student {
  email: string
  first_name: string
  last_name: string
  phone_number?: string
  assigned_instructor_email: string
  user_id?: string
  password?: string
}

interface BulkCreationStatus {
  id: string
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed'
  total_instructors: number
  total_students: number
  processed_instructors: number
  processed_students: number
  error_message?: string
  created_at: string
  completed_at?: string
}

interface BulkUsersState {
  parsedData: {
    instructors: Instructor[]
    students: Student[]
  } | null
  bulkCreationId: string | null
  bulkCreationStatus: BulkCreationStatus | null
  myStudents: any[]
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
}

const initialState: BulkUsersState = {
  parsedData: null,
  bulkCreationId: null,
  bulkCreationStatus: null,
  myStudents: [],
  isLoading: false,
  isSubmitting: false,
  error: null
}

export const parseExcelFile = createAsyncThunk(
  "bulkUsers/parseExcelFile",
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await api.post("/bulk-users/parse-excel", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })

      if (response.data.success) {
        return response.data.data
      }
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to parse Excel file"
      )
    }
  }
)

export const createBulkUsers = createAsyncThunk(
  "bulkUsers/createBulkUsers",
  async (
    data: { instructors: Instructor[]; students: Student[] },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/bulk-users/create", data)

      if (response.data.success) {
        return response.data.data
      }
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create bulk users"
      )
    }
  }
)

export const getBulkCreationStatus = createAsyncThunk(
  "bulkUsers/getBulkCreationStatus",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/bulk-users/status/${id}`)

      if (response.data.success) {
        return response.data.data
      }
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get status"
      )
    }
  }
)

export const getMyStudents = createAsyncThunk(
  "bulkUsers/getMyStudents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/bulk-users/my-students")

      if (response.data.success) {
        return response.data.data
      }
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get students"
      )
    }
  }
)

const bulkUsersSlice = createSlice({
  name: "bulkUsers",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearParsedData: (state) => {
      state.parsedData = null
    },
    updateParsedInstructors: (state, action) => {
      if (state.parsedData) {
        state.parsedData.instructors = action.payload
      }
    },
    updateParsedStudents: (state, action) => {
      if (state.parsedData) {
        state.parsedData.students = action.payload
      }
    },
    resetBulkCreation: (state) => {
      state.bulkCreationId = null
      state.bulkCreationStatus = null
      state.parsedData = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Parse Excel File
      .addCase(parseExcelFile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(parseExcelFile.fulfilled, (state, action) => {
        state.isLoading = false
        state.parsedData = {
          instructors: action.payload.instructors,
          students: action.payload.students
        }
      })
      .addCase(parseExcelFile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Create Bulk Users
      .addCase(createBulkUsers.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(createBulkUsers.fulfilled, (state, action) => {
        state.isSubmitting = false
        state.bulkCreationId = action.payload.bulkCreationId
        state.bulkCreationStatus = action.payload
      })
      .addCase(createBulkUsers.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })

      // Get Bulk Creation Status
      .addCase(getBulkCreationStatus.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getBulkCreationStatus.fulfilled, (state, action) => {
        state.isLoading = false
        state.bulkCreationStatus = action.payload
      })
      .addCase(getBulkCreationStatus.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Get My Students
      .addCase(getMyStudents.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getMyStudents.fulfilled, (state, action) => {
        state.isLoading = false
        state.myStudents = action.payload.students
      })
      .addCase(getMyStudents.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  }
})

export const {
  clearError,
  clearParsedData,
  updateParsedInstructors,
  updateParsedStudents,
  resetBulkCreation
} = bulkUsersSlice.actions

export default bulkUsersSlice.reducer
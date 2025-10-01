import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import api from "@/lib/api"
import Cookies from "js-cookie"

interface AssignedStudent {
  student_id: string
  student_name: string
  student_email: string
  assigned_at: string
}

interface AssignedInstructor {
  instructor_id: string
  instructor_name: string
  instructor_email: string
  assigned_at: string
}

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  username?: string
  phone_number?: string
  profile_picture_url?: string
  bio?: string
  account_type: string
  is_verified?: boolean
  is_active?: boolean
  date_joined?: string
  last_login?: string
  country?: string
  city?: string
  social_auth_provider?: string
  social_auth_id?: string
  profile?: any
  
  // ✅ NEW: Instructor-related fields
  is_instructor?: boolean
  student_count?: number
  has_assigned_instructor?: boolean
  assigned_students?: AssignedStudent[]
  assigned_instructor?: AssignedInstructor | null
}

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  requiresVerification: boolean
  verificationEmail: string | null
  registrationSuccess: boolean
  users: User[]
  isLoadingUsers: boolean
  isSubmitting: boolean
  usersPagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Helper function to safely parse JSON from cookies
const parseCookieJSON = (cookieValue: string | undefined): any => {
  if (!cookieValue) return null
  try {
    return JSON.parse(cookieValue)
  } catch (error) {
    console.error("Failed to parse cookie JSON:", error)
    return null
  }
}

const initialState: AuthState = {
  token: Cookies.get("token") || null,
  user: parseCookieJSON(Cookies.get("user")),
  isAuthenticated: !!Cookies.get("token"),
  isLoading: false,
  error: null,
  requiresVerification: false,
  verificationEmail: null,
  registrationSuccess: false,
  users: [],
  isLoadingUsers: false,
  isSubmitting: false,
  usersPagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  }
}

// Register User - NO TOKEN/USER STORAGE
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData: {
    email: string
    password: string
    first_name: string
    last_name: string
    phone_number?: string
    account_type: string
    username?: string
    institution_address?: string
    institution_type?: string
    institution_website?: string
    institution_description?: string
  }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register", userData)
      if (response.data.success) {
        return {
          email: userData.email,
          message: response.data.message
        }
      }
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Registration failed")
    }
  }
)

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", credentials)
      
      // ✅ LOG: Check if is_instructor is in response
      console.log("🔍 Login response:", {
        is_instructor: response.data.data?.user?.is_instructor,
        student_count: response.data.data?.user?.student_count,
        account_type: response.data.data?.user?.account_type
      })
      
      if (response.data.success) {
        return response.data.data
      }
      if (response.data.requires_verification) {
        return rejectWithValue({
          message: response.data.message,
          requires_verification: true,
          email: response.data.email
        })
      }
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      const errorData = error.response?.data
      if (errorData?.requires_verification) {
        return rejectWithValue({
          message: errorData.message,
          requires_verification: true,
          email: errorData.email
        })
      }
      return rejectWithValue(errorData?.message || "Login failed")
    }
  }
)

export const resendVerificationOTP = createAsyncThunk(
  "auth/resendVerificationOTP",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/resend-verification", { email })
      if (response.data.success) {
        return response.data
      }
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to resend OTP")
    }
  }
)

export const requestPasswordChange = createAsyncThunk(
  "auth/requestPasswordChange",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/request-password-change", { email })
      if (response.data.success) {
        return response.data
      }
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Request failed")
    }
  }
)

export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (data: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      console.log("📧 [verifyEmail] Verifying email with OTP:", { email: data.email })

      const response = await api.post("/auth/verify-email", data)

      console.log("✅ [verifyEmail] Response received:", response.data)

      if (response.data.success) {
        return response.data.data
      }
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      console.error("❌ [verifyEmail] Error:", error.response?.data || error.message)
      return rejectWithValue(error.response?.data?.message || "Verification failed")
    }
  }
)

export const changePasswordWithOTP = createAsyncThunk(
  "auth/changePasswordWithOTP",
  async (data: { email: string; otp: string; new_password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/change-password-otp", data)
      if (response.data.success) {
        return response.data
      }
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Password change failed")
    }
  }
)

export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (credentials: { token: string }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/google", credentials)
      if (response.data.success) {
        return response.data.data
      }
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Google login failed")
    }
  }
)

export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/profile")
      if (response.data.success) {
        return response.data.data
      }
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch profile")
    }
  }
)

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData: FormData | Partial<User>, { rejectWithValue }) => {
    try {
      const response = await api.put("/auth/profile", profileData, {
        headers: profileData instanceof FormData
          ? { 'Content-Type': 'multipart/form-data' }
          : { 'Content-Type': 'application/json' }
      });
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update profile");
    }
  }
);

export const getAllUsers = createAsyncThunk(
  "auth/getAllUsers",
  async (params: {
    page?: number
    limit?: number
    search?: string
    account_type?: string
    is_active?: boolean
  } = {}, { rejectWithValue }) => {
    try {
      console.log("🔍 [getAllUsers] Fetching users with params:", params)

      const response = await api.get("/auth/users", { params })

      console.log("✅ [getAllUsers] Response received:", response.data)

      if (response.data.success) {
        return response.data.data
      }
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      console.error("❌ [getAllUsers] Error:", error.response?.data || error.message)
      return rejectWithValue(error.response?.data?.message || "Failed to fetch users")
    }
  }
)

export const activateDeactivateUser = createAsyncThunk(
  "auth/activateDeactivateUser",
  async (data: { id: string; is_active: boolean; reason?: string }, { rejectWithValue }) => {
    try {
      console.log("🔄 [activateDeactivateUser] Updating user status:", data)

      const response = await api.patch(`/auth/users/${data.id}/status`, {
        is_active: data.is_active,
        reason: data.reason
      })

      console.log("✅ [activateDeactivateUser] Response received:", response.data)

      if (response.data.success) {
        return response.data.data
      }
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      console.error("❌ [activateDeactivateUser] Error:", error.response?.data || error.message)
      return rejectWithValue(error.response?.data?.message || "Failed to update user status")
    }
  }
)

export const deleteUser = createAsyncThunk(
  "auth/deleteUser",
  async (id: string, { rejectWithValue }) => {
    try {
      console.log("🗑️ [deleteUser] Deleting user:", id)

      const response = await api.delete(`/auth/users/${id}`)

      console.log("✅ [deleteUser] Response received:", response.data)

      if (response.data.success) {
        return { id, ...response.data.data }
      }
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      console.error("❌ [deleteUser] Error:", error.response?.data || error.message)
      return rejectWithValue(error.response?.data?.message || "Failed to delete user")
    }
  }
)

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      console.log("👋 [logout] Logging out user")
      state.token = null
      state.user = null
      state.isAuthenticated = false
      state.error = null
      state.users = []
      state.usersPagination = initialState.usersPagination
      state.requiresVerification = false
      state.verificationEmail = null
      state.registrationSuccess = false
      Cookies.remove("token")
      Cookies.remove("user")
    },
    clearError: (state) => {
      state.error = null
    },
    clearUsers: (state) => {
      state.users = []
      state.usersPagination = initialState.usersPagination
    },
    setVerificationEmail: (state, action) => {
      state.verificationEmail = action.payload
      state.requiresVerification = true
    },
    clearVerificationState: (state) => {
      state.requiresVerification = false
      state.verificationEmail = null
      state.registrationSuccess = false
    }
  },
  extraReducers: (builder) => {
    builder
      // Register - NO TOKEN STORAGE, ONLY SET EMAIL FOR VERIFICATION
      .addCase(registerUser.pending, (state) => {
        console.log("⏳ [registerUser] Pending...")
        state.isLoading = true
        state.error = null
        state.registrationSuccess = false
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        console.log("✅ [registerUser] Success:", action.payload)
        state.isLoading = false
        state.requiresVerification = true
        state.verificationEmail = action.payload.email
        state.registrationSuccess = true
      })
      .addCase(registerUser.rejected, (state, action) => {
        console.error("❌ [registerUser] Failed:", action.payload)
        state.isLoading = false
        state.error = action.payload as string
        state.registrationSuccess = false
      })

      // Login - ✅ Now includes instructor fields
      .addCase(loginUser.pending, (state) => {
        console.log("⏳ [loginUser] Pending...")
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log("✅ [loginUser] Success:", action.payload)
        console.log("✅ User is_instructor:", action.payload.user.is_instructor)
        console.log("✅ Student count:", action.payload.user.student_count)
        
        state.isLoading = false
        state.token = action.payload.token
        state.user = action.payload.user  // ✅ This now includes is_instructor, student_count, etc.
        state.isAuthenticated = true
        state.requiresVerification = false
        state.verificationEmail = null
        
        Cookies.set("token", action.payload.token, { expires: 7 })
        Cookies.set("user", JSON.stringify(action.payload.user), { expires: 7 })
      })
      .addCase(loginUser.rejected, (state, action: any) => {
        state.isLoading = false
        const payload = action.payload
        if (typeof payload === 'object' && payload.requires_verification) {
          state.error = payload.message
          state.requiresVerification = true
          state.verificationEmail = payload.email
        } else {
          state.error = payload as string
        }
      })

      // Verify Email - NOW STORES TOKEN
      .addCase(verifyEmail.pending, (state) => {
        console.log("⏳ [verifyEmail] Pending...")
        state.isLoading = true
        state.error = null
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        console.log("✅ [verifyEmail] Success:", action.payload)
        state.isLoading = false
        state.token = action.payload.token
        state.user = action.payload.user
        state.isAuthenticated = true
        state.requiresVerification = false
        state.verificationEmail = null
        Cookies.set("token", action.payload.token, { expires: 7 })
        Cookies.set("user", JSON.stringify(action.payload.user), { expires: 7 })
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        console.error("❌ [verifyEmail] Failed:", action.payload)
        state.isLoading = false
        state.error = action.payload as string
      })

      .addCase(resendVerificationOTP.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(resendVerificationOTP.fulfilled, (state) => {
        state.isLoading = false
      })
      .addCase(resendVerificationOTP.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      .addCase(requestPasswordChange.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(requestPasswordChange.fulfilled, (state) => {
        state.isLoading = false
      })
      .addCase(requestPasswordChange.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      .addCase(changePasswordWithOTP.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(changePasswordWithOTP.fulfilled, (state) => {
        state.isLoading = false
      })
      .addCase(changePasswordWithOTP.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      .addCase(googleLogin.pending, (state) => {
        console.log("⏳ [googleLogin] Pending...")
        state.isLoading = true
        state.error = null
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        console.log("✅ [googleLogin] Success:", action.payload)
        state.isLoading = false
        state.token = action.payload.token
        state.user = action.payload.user
        state.isAuthenticated = true
        Cookies.set("token", action.payload.token, { expires: 7 })
        Cookies.set("user", JSON.stringify(action.payload.user), { expires: 7 })
      })
      .addCase(googleLogin.rejected, (state, action) => {
        console.error("❌ [googleLogin] Failed:", action.payload)
        state.isLoading = false
        state.error = action.payload as string
      })

      .addCase(fetchProfile.pending, (state) => {
        console.log("⏳ [fetchProfile] Pending...")
        state.isLoading = true
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        console.log("✅ [fetchProfile] Success:", action.payload)
        state.isLoading = false
        state.user = action.payload
        Cookies.set("user", JSON.stringify(action.payload), { expires: 7 })
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        console.error("❌ [fetchProfile] Failed:", action.payload)
        state.isLoading = false
        state.error = action.payload as string
      })

      .addCase(updateProfile.pending, (state) => {
        console.log("⏳ [updateProfile] Pending...")
        state.isLoading = true
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        console.log("✅ [updateProfile] Success:", action.payload)
        state.isLoading = false
        state.user = { ...state.user, ...action.payload } as User
        if (state.user) {
          Cookies.set("user", JSON.stringify(state.user), { expires: 7 })
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        console.error("❌ [updateProfile] Failed:", action.payload)
        state.isLoading = false
        state.error = action.payload as string
      })

      .addCase(getAllUsers.pending, (state) => {
        console.log("⏳ [getAllUsers] Loading users...")
        state.isLoadingUsers = true
        state.error = null
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        console.log("✅ [getAllUsers] Success - Loaded users:", action.payload.users.length)
        state.isLoadingUsers = false
        state.users = action.payload.users
        state.usersPagination = action.payload.pagination
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        console.error("❌ [getAllUsers] Failed:", action.payload)
        state.isLoadingUsers = false
        state.error = action.payload as string
        state.users = []
      })

      .addCase(activateDeactivateUser.pending, (state) => {
        console.log("⏳ [activateDeactivateUser] Updating status...")
        state.isSubmitting = true
        state.error = null
      })
      .addCase(activateDeactivateUser.fulfilled, (state, action) => {
        console.log("✅ [activateDeactivateUser] Success:", action.payload)
        state.isSubmitting = false

        const userIndex = state.users.findIndex(u => u.id === action.payload.user.id)
        if (userIndex !== -1) {
          state.users[userIndex] = {
            ...state.users[userIndex],
            ...action.payload.user
          }
          console.log(`✅ Updated user at index ${userIndex}:`, state.users[userIndex])
        }
      })
      .addCase(activateDeactivateUser.rejected, (state, action) => {
        console.error("❌ [activateDeactivateUser] Failed:", action.payload)
        state.isSubmitting = false
        state.error = action.payload as string
      })

      .addCase(deleteUser.pending, (state) => {
        console.log("⏳ [deleteUser] Deleting user...")
        state.isSubmitting = true
        state.error = null
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        console.log("✅ [deleteUser] Success - Deleted user:", action.payload.id)
        state.isSubmitting = false

        const usersBefore = state.users.length
        state.users = state.users.filter(u => u.id !== action.payload.id)
        state.usersPagination.total = Math.max(0, state.usersPagination.total - 1)

        console.log(`✅ Removed user. Users before: ${usersBefore}, after: ${state.users.length}`)
      })
      .addCase(deleteUser.rejected, (state, action) => {
        console.error("❌ [deleteUser] Failed:", action.payload)
        state.isSubmitting = false
        state.error = action.payload as string
      })
  },
})

export const { logout, clearError, clearUsers, setVerificationEmail, clearVerificationState } = authSlice.actions
export default authSlice.reducer
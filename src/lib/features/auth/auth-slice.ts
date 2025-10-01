import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import api from "@/lib/api"
import Cookies from "js-cookie"
import { SystemType } from "./system-types"
import { SafeLocalStorage } from '@/lib/utils/local-storage';

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

export interface EnhancedUser {
  // Basic User Info
  id: string
  email: string
  first_name: string
  last_name: string
  username?: string
  phone_number?: string
  profile_picture_url?: string
  bio?: string
  
  // Account Info
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

  // ✅ ENHANCED: Cross-System Fields (Protected)
  IsForWhichSystem?: SystemType
  bwenge_role?: string
  primary_institution_id?: string
  is_institution_member?: boolean
  institution_ids?: string[]
  institution_role?: string
  
  // Instructor-related fields
  is_instructor?: boolean
  student_count?: number
  has_assigned_instructor?: boolean
  assigned_students?: AssignedStudent[]
  assigned_instructor?: AssignedInstructor | null
  
  // SSO & Multi-system access
  has_multi_system_access?: boolean
  sso_redirect_token?: string
  
  // ✅ ENHANCED: Protection Metadata
  _protection?: {
    fields_protected: string[]
    last_sync: string
    system_origin: SystemType
    immutable_fields: string[]
  }
}

export interface UserStatistics {
  total_users: number
  by_account_type: {
    Student: number
    Researcher: number
    Institution: number
    Diaspora: number
    admin: number
  }
  active_users: number
  verified_users: number
  recent_signups: number
  institution_members?: number
}

export interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ProtectionState {
  active: boolean
  crossSystemData: any | null
  lastSync: string | null
  fieldsProtected: string[]
  systemCompatibility: {
    bwengeplus: boolean
    ongera: boolean
  }
}

export interface EnhancedAuthState {
  // Authentication State
  token: string | null
  user: EnhancedUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Verification State
  requiresVerification: boolean
  verificationEmail: string | null
  registrationSuccess: boolean
  
  // User Management (Admin)
  users: EnhancedUser[]
  isLoadingUsers: boolean
  isSubmitting: boolean
  usersPagination: PaginationData
  
  // SSO & Multi-System State
  ssoRedirectToken: string | null
  ssoTargetUrl: string | null
  hasMultiSystemSession: boolean
  activeSystems: string[]
  showSSOInitializer: boolean
  
  // ✅ ENHANCED: Protection State
  protection: ProtectionState
  
  // Additional State
  sessionValidated: boolean
  lastActivity: string | null
}

// ==================== HELPER FUNCTIONS ====================

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

const storeEnhancedAuthData = (user: EnhancedUser, token: string) => {
  console.log("🔐 [ONGERA - ENHANCED STORE] Storing protected authentication data...");
  
  // Add protection metadata if not present
  const protectedUser: EnhancedUser = {
    ...user,
    _protection: user._protection || {
      fields_protected: ['IsForWhichSystem', 'bwenge_role', 'primary_institution_id', 'institution_ids', 'institution_role'],
      last_sync: new Date().toISOString(),
      system_origin: SystemType.ONGERA,
      immutable_fields: ['IsForWhichSystem', 'bwenge_role']
    }
  };
  
  // Store in cookies
  Cookies.set("token", token, { 
    expires: 7, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' 
  });
  Cookies.set("user", JSON.stringify(protectedUser), { 
    expires: 7, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' 
  });
  
  // ✅ ENHANCED: Store cross-system context
  const crossSystemContext = {
    IsForWhichSystem: protectedUser.IsForWhichSystem || SystemType.ONGERA,
    bwenge_role: protectedUser.bwenge_role,
    primary_institution_id: protectedUser.primary_institution_id,
    institution_ids: protectedUser.institution_ids || [],
    institution_role: protectedUser.institution_role,
    last_sync: new Date().toISOString(),
    system_origin: SystemType.ONGERA
  };
  
  SafeLocalStorage.setItem('ongera_cross_system_context', JSON.stringify(crossSystemContext));
  SafeLocalStorage.setItem('ongera_protection_active', 'true');
  SafeLocalStorage.setItem('last_system_login', SystemType.ONGERA);
  SafeLocalStorage.setItem('ongera_last_sync', new Date().toISOString());
  
  console.log("✅ [ONGERA - ENHANCED STORE] Data stored with protection metadata");
};


const clearEnhancedAuthData = () => {
  console.log("🗑️ [ONGERA - ENHANCED CLEAR] Clearing authentication data...");
  
  // Clear cookies
  Cookies.remove("token");
  Cookies.remove("user");
  
  try {
    // Clear localStorage but preserve cross-system context
    const crossSystemContext = SafeLocalStorage.getItem('ongera_cross_system_context');
    
    SafeLocalStorage.clear();
    
    // Restore cross-system context for next login
    if (crossSystemContext) {
      SafeLocalStorage.setItem('ongera_cross_system_context', crossSystemContext);
      SafeLocalStorage.setItem('ongera_protection_active', 'true');
    }
    
    sessionStorage.clear();
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
  
  console.log('✅ [ONGERA - ENHANCED CLEAR] Auth data cleared');
};

// ✅ ENHANCED: Validate user data for cross-system compatibility
const validateCrossSystemData = (user: EnhancedUser): {
  isValid: boolean
  missingFields: string[]
  warnings: string[]
  recoveredFields: string[]
} => {
  const missingFields: string[] = []
  const warnings: string[] = []
  const recoveredFields: string[] = []

  // Critical fields that should never be null
  const criticalFields = [
    { field: 'IsForWhichSystem', value: user.IsForWhichSystem },
    { field: 'id', value: user.id },
    { field: 'email', value: user.email }
  ]

  criticalFields.forEach(({ field, value }) => {
    if (!value) {
      missingFields.push(field)
      warnings.push(`${field} is required for cross-system compatibility`)
    }
  })

  // Check institution consistency
  if (user.is_institution_member && !user.primary_institution_id) {
    warnings.push("User is institution member but has no primary institution")
  }

  if (user.institution_role && !user.primary_institution_id) {
    warnings.push("User has institution role but no primary institution")
  }

  // Attempt recovery for missing fields
  if (!user.IsForWhichSystem) {
    user.IsForWhichSystem = SystemType.ONGERA
    recoveredFields.push('IsForWhichSystem')
  }

  // Ensure arrays are initialized
  if (!user.institution_ids) {
    user.institution_ids = []
    recoveredFields.push('institution_ids')
  }

  // Ensure protection metadata exists
  if (!user._protection) {
    user._protection = {
      fields_protected: [],
      last_sync: new Date().toISOString(),
      system_origin: SystemType.ONGERA,
      immutable_fields: ['IsForWhichSystem', 'bwenge_role']
    }
    recoveredFields.push('_protection')
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    warnings,
    recoveredFields
  }
}

// ✅ ENHANCED: Normalize user data with protection
const normalizeEnhancedUser = (backendUser: any): EnhancedUser => {
  const normalized: EnhancedUser = {
    // Core user fields
    id: backendUser.id,
    email: backendUser.email,
    first_name: backendUser.first_name || '',
    last_name: backendUser.last_name || '',
    username: backendUser.username,
    phone_number: backendUser.phone_number,
    profile_picture_url: backendUser.profile_picture_url,
    bio: backendUser.bio,
    account_type: backendUser.account_type,
    is_verified: backendUser.is_verified,
    is_active: backendUser.is_active,
    date_joined: backendUser.date_joined,
    last_login: backendUser.last_login,
    country: backendUser.country,
    city: backendUser.city,
    social_auth_provider: backendUser.social_auth_provider,
    social_auth_id: backendUser.social_auth_id,
    profile: backendUser.profile,

    // ✅ ENHANCED: Cross-system fields with defaults
    IsForWhichSystem: backendUser.IsForWhichSystem || SystemType.ONGERA,
    bwenge_role: backendUser.bwenge_role,
    primary_institution_id: backendUser.primary_institution_id,
    is_institution_member: backendUser.is_institution_member || false,
    institution_ids: backendUser.institution_ids || [],
    institution_role: backendUser.institution_role,

    // Instructor fields
    is_instructor: backendUser.is_instructor || backendUser.assignedStudents?.length > 0,
    student_count: backendUser.student_count || backendUser.assignedStudents?.length || 0,
    has_assigned_instructor: backendUser.has_assigned_instructor || backendUser.assignedInstructor?.length > 0,
    assigned_students: backendUser.assigned_students || [],
    assigned_instructor: backendUser.assigned_instructor || null,

    // SSO fields
    has_multi_system_access: backendUser.has_multi_system_access || false,
    sso_redirect_token: backendUser.sso_redirect_token,

    // ✅ ENHANCED: Protection metadata
    _protection: backendUser._protection || {
      fields_protected: [
        'IsForWhichSystem',
        'bwenge_role',
        'primary_institution_id',
        'institution_ids',
        'institution_role'
      ].filter(field => backendUser[field] !== undefined),
      last_sync: new Date().toISOString(),
      system_origin: SystemType.ONGERA,
      immutable_fields: ['IsForWhichSystem', 'bwenge_role']
    }
  }

  // Validate and recover if needed
  const validation = validateCrossSystemData(normalized)
  if (!validation.isValid || validation.recoveredFields.length > 0) {
    console.warn("⚠️ [NORMALIZATION] Validation results:", validation)
  }

  return normalized
}

// ✅ ENHANCED: Merge cross-system data safely
const mergeCrossSystemData = (currentUser: EnhancedUser, incomingData: any): EnhancedUser => {
  const merged = { ...currentUser }
  
  // Fields that can only be set once (immutable)
  const immutableFields = ['IsForWhichSystem', 'bwenge_role']
  
  // Fields that can be merged/updated
  const mergeableFields = [
    'primary_institution_id',
    'institution_ids',
    'institution_role',
    'is_institution_member'
  ]
  
  // Apply immutable fields if not already set
  immutableFields.forEach(field => {
    if (!merged[field as keyof EnhancedUser] && incomingData[field]) {
      ;(merged as any)[field] = incomingData[field]
      console.log(`🔄 [MERGE] Set immutable field: ${field} = ${incomingData[field]}`)
    }
  })
  
  // Merge array fields (institution_ids)
  if (incomingData.institution_ids && Array.isArray(incomingData.institution_ids)) {
    const currentIds = merged.institution_ids || []
    const newIds = incomingData.institution_ids.filter((id: string) => !currentIds.includes(id))
    
    if (newIds.length > 0) {
      merged.institution_ids = [...currentIds, ...newIds]
      console.log(`🔄 [MERGE] Added ${newIds.length} new institution IDs`)
    }
  }
  
  // Update other mergeable fields if current value is empty/null
  mergeableFields.forEach(field => {
    if ((!merged[field as keyof EnhancedUser] || 
        (Array.isArray(merged[field as keyof EnhancedUser]) && 
         (merged[field as keyof EnhancedUser] as any[]).length === 0)) && 
        incomingData[field]) {
      ;(merged as any)[field] = incomingData[field]
      console.log(`🔄 [MERGE] Updated field: ${field} = ${incomingData[field]}`)
    }
  })
  
  // Update protection metadata
  if (merged._protection) {
    merged._protection = {
      ...merged._protection,
      last_sync: new Date().toISOString(),
      fields_protected: [
        ...new Set([
          ...merged._protection.fields_protected,
          ...Object.keys(incomingData).filter(key => 
            incomingData[key] !== undefined && 
            [...immutableFields, ...mergeableFields].includes(key)
          )
        ])
      ]
    }
  }
  
  return merged
}

// ==================== INITIAL STATE ====================

const initialPagination: PaginationData = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0
}

const initialProtection: ProtectionState = {
  active: SafeLocalStorage.getItem('ongera_protection_active') === 'true',
  crossSystemData: null,
  lastSync: SafeLocalStorage.getItem('ongera_last_sync') || null,
  fieldsProtected: [
    'IsForWhichSystem',
    'bwenge_role',
    'primary_institution_id',
    'institution_ids',
    'institution_role'
  ],
  systemCompatibility: {
    bwengeplus: true,
    ongera: true
  }
};

const initialState: EnhancedAuthState = {
  // Authentication
  token: Cookies.get("token") || null,
  user: parseCookieJSON(Cookies.get("user")),
  isAuthenticated: !!Cookies.get("token"),
  isLoading: false,
  error: null,
  
  // Verification
  requiresVerification: false,
  verificationEmail: null,
  registrationSuccess: false,
  
  // User Management
  users: [],
  isLoadingUsers: false,
  isSubmitting: false,
  usersPagination: initialPagination,
  
  // SSO & Multi-System
  ssoRedirectToken: null,
  ssoTargetUrl: null,
  hasMultiSystemSession: false,
  activeSystems: [],
  showSSOInitializer: false,
  
  // ✅ ENHANCED: Protection State
  protection: initialProtection,
  
  // Additional
  sessionValidated: false,
  lastActivity: null
}

// ==================== ASYNC THUNKS ====================

// ✅ ENHANCED: Register User with system identification
export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    userData: {
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
    }, 
    { rejectWithValue }
  ) => {
    try {
      console.log("🚀 [ENHANCED REGISTER] Starting registration...")
      
      // ✅ ENHANCED: Add system identification
      const enhancedUserData = {
        ...userData,
        IsForWhichSystem: SystemType.ONGERA
      }
      
      const response = await api.post("/auth/register", enhancedUserData)
      
      if (response.data.success) {
        console.log("✅ [ENHANCED REGISTER] Registration successful")
        return {
          email: userData.email,
          message: response.data.message,
          IsForWhichSystem: SystemType.ONGERA
        }
      }
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      console.error("❌ [ENHANCED REGISTER] Failed:", error)
      return rejectWithValue(error.response?.data?.message || "Registration failed")
    }
  }
)

export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    credentials: { email: string; password: string }, 
    { rejectWithValue }
  ) => {
    try {
      console.log("🔐 [ENHANCED LOGIN] Starting protected login...")
      
      const response = await api.post("/auth/login", credentials)
      
      console.log("📋 [ENHANCED LOGIN] Response received:", {
        success: response.data.success,
        hasUser: !!response.data.data?.user,
        hasToken: !!response.data.data?.token
      })

      if (response.data.success) {
        const userData = response.data.data?.user
        const token = response.data.data?.token
        
        if (!userData || !token) {
          return rejectWithValue("Invalid response from server")
        }
        
        // ✅ ENHANCED: Normalize with protection
        const normalizedUser = normalizeEnhancedUser(userData)
        
        // ✅ ENHANCED: Load cross-system context if available (only on client)
        if (typeof window !== 'undefined') {
          try {
            const crossSystemContext = localStorage.getItem('ongera_cross_system_context')
            if (crossSystemContext) {
              const context = JSON.parse(crossSystemContext)
              const mergedUser = mergeCrossSystemData(normalizedUser, context)
              console.log("🔄 [ENHANCED LOGIN] Merged cross-system context")
              return {
                user: mergedUser,
                token
              }
            }
          } catch (contextError) {
            console.warn("⚠️ Failed to load cross-system context:", contextError)
          }
        }
        
        return {
          user: normalizedUser,
          token
        }
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
      console.error("❌ [ENHANCED LOGIN] Failed:", error)
      
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

// ✅ ENHANCED: Google Login with protection
export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (
    credentials: { token: string }, 
    { rejectWithValue }
  ) => {
    try {
      console.log("🔐 [ENHANCED GOOGLE LOGIN] Starting...")
      
      const response = await api.post("/auth/google", credentials)
      
      if (response.data.success) {
        const userData = response.data.data?.user
        const token = response.data.data?.token
        
        if (!userData || !token) {
          return rejectWithValue("Invalid response from server")
        }
        
        // ✅ ENHANCED: Normalize with protection
        const normalizedUser = normalizeEnhancedUser(userData)
        
        // ✅ ENHANCED: Ensure system identification
        if (!normalizedUser.IsForWhichSystem) {
          normalizedUser.IsForWhichSystem = SystemType.ONGERA
        }
        
        console.log("✅ [ENHANCED GOOGLE LOGIN] Successful")
        return {
          user: normalizedUser,
          token
        }
      }
      
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      console.error("❌ [ENHANCED GOOGLE LOGIN] Failed:", error)
      return rejectWithValue(error.response?.data?.message || "Google login failed")
    }
  }
)

// ✅ ENHANCED: Verify Email with protection
export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (
    data: { email: string; otp: string }, 
    { rejectWithValue }
  ) => {
    try {
      console.log("✉️ [ENHANCED VERIFY EMAIL] Verifying email...")
      
      const response = await api.post("/auth/verify-email", data)
      
      console.log("✅ [ENHANCED VERIFY EMAIL] Response received")
      
      if (response.data.success) {
        const userData = response.data.data?.user
        const token = response.data.data?.token
        
        if (!userData || !token) {
          return rejectWithValue("Invalid response from server")
        }
        
        // ✅ ENHANCED: Normalize with protection
        const normalizedUser = normalizeEnhancedUser(userData)
        
        return {
          user: normalizedUser,
          token
        }
      }
      
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      console.error("❌ [ENHANCED VERIFY EMAIL] Failed:", error)
      return rejectWithValue(error.response?.data?.message || "Verification failed")
    }
  }
)

// ✅ ENHANCED: Resend Verification OTP
export const resendVerificationOTP = createAsyncThunk(
  "auth/resendVerificationOTP",
  async (
    email: string, 
    { rejectWithValue }
  ) => {
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

// ✅ ENHANCED: Request Password Change
export const requestPasswordChange = createAsyncThunk(
  "auth/requestPasswordChange",
  async (
    email: string, 
    { rejectWithValue }
  ) => {
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

// ✅ ENHANCED: Change Password with OTP
export const changePasswordWithOTP = createAsyncThunk(
  "auth/changePasswordWithOTP",
  async (
    data: { email: string; otp: string; new_password: string }, 
    { rejectWithValue }
  ) => {
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

// ✅ ENHANCED: Fetch Profile with protection
export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (
    _, 
    { rejectWithValue }
  ) => {
    try {
      console.log("👤 [ENHANCED FETCH PROFILE] Fetching profile...")
      
      const response = await api.get("/auth/profile")
      
      if (response.data.success) {
        // ✅ ENHANCED: Normalize with protection
        const normalizedUser = normalizeEnhancedUser(response.data.data)
        
        // ✅ ENHANCED: Load cross-system context
        try {
          const crossSystemContext = localStorage.getItem('ongera_cross_system_context')
          if (crossSystemContext) {
            const context = JSON.parse(crossSystemContext)
            const mergedUser = mergeCrossSystemData(normalizedUser, context)
            console.log("🔄 [FETCH PROFILE] Merged cross-system context")
            return mergedUser
          }
        } catch (contextError) {
          console.warn("⚠️ Failed to load cross-system context:", contextError)
        }
        
        return normalizedUser
      }
      
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      console.error("❌ [ENHANCED FETCH PROFILE] Failed:", error)
      return rejectWithValue(error.response?.data?.message || "Failed to fetch profile")
    }
  }
)

// ✅ ENHANCED: Update Profile with protection
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (
    profileData: FormData | Partial<EnhancedUser>, 
    { rejectWithValue }
  ) => {
    try {
      console.log("✏️ [ENHANCED UPDATE PROFILE] Updating profile...")
      
      const response = await api.put("/auth/profile", profileData, {
        headers: profileData instanceof FormData
          ? { 'Content-Type': 'multipart/form-data' }
          : { 'Content-Type': 'application/json' }
      })
      
      if (response.data.success) {
        // ✅ ENHANCED: Normalize with protection
        const normalizedUser = normalizeEnhancedUser(response.data.data)
        return normalizedUser
      }
      
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      console.error("❌ [ENHANCED UPDATE PROFILE] Failed:", error)
      return rejectWithValue(error.response?.data?.message || "Failed to update profile")
    }
  }
)

// ✅ ENHANCED: Get All Users with protection awareness
export const getAllUsers = createAsyncThunk(
  "auth/getAllUsers",
  async (
    params: {
      page?: number
      limit?: number
      search?: string
      account_type?: string
      is_active?: boolean
    } = {}, 
    { rejectWithValue }
  ) => {
    try {
      console.log("👥 [ENHANCED GET ALL USERS] Fetching users...")
      
      const response = await api.get("/auth/users", { params })
      
      console.log("✅ [ENHANCED GET ALL USERS] Response received")
      
      if (response.data.success) {
        // ✅ ENHANCED: Normalize all users with protection
        const normalizedUsers = response.data.data.users.map((user: any) => 
          normalizeEnhancedUser(user)
        )
        
        return {
          users: normalizedUsers,
          pagination: response.data.data.pagination
        }
      }
      
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      console.error("❌ [ENHANCED GET ALL USERS] Failed:", error)
      return rejectWithValue(error.response?.data?.message || "Failed to fetch users")
    }
  }
)

// ✅ ENHANCED: Activate/Deactivate User
export const activateDeactivateUser = createAsyncThunk(
  "auth/activateDeactivateUser",
  async (
    data: { id: string; is_active: boolean; reason?: string }, 
    { rejectWithValue }
  ) => {
    try {
      console.log("🔄 [ENHANCED ACTIVATE/DEACTIVATE] Updating user status...")
      
      const response = await api.patch(`/auth/users/${data.id}/status`, {
        is_active: data.is_active,
        reason: data.reason
      })
      
      console.log("✅ [ENHANCED ACTIVATE/DEACTIVATE] Response received")
      
      if (response.data.success) {
        return response.data.data
      }
      
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      console.error("❌ [ENHANCED ACTIVATE/DEACTIVATE] Failed:", error)
      return rejectWithValue(error.response?.data?.message || "Failed to update user status")
    }
  }
)

// ✅ ENHANCED: Delete User
export const deleteUser = createAsyncThunk(
  "auth/deleteUser",
  async (
    id: string, 
    { rejectWithValue }
  ) => {
    try {
      console.log("🗑️ [ENHANCED DELETE USER] Deleting user...")
      
      const response = await api.delete(`/auth/users/${id}`)
      
      console.log("✅ [ENHANCED DELETE USER] Response received")
      
      if (response.data.success) {
        return { id, ...response.data.data }
      }
      
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      console.error("❌ [ENHANCED DELETE USER] Failed:", error)
      return rejectWithValue(error.response?.data?.message || "Failed to delete user")
    }
  }
)

// ✅ ENHANCED: Generate SSO Token with protection context
export const generateSSOToken = createAsyncThunk(
  "auth/generateSSOToken",
  async (
    targetSystem: string, 
    { rejectWithValue }
  ) => {
    try {
      console.log("🔗 [ENHANCED GENERATE SSO] Generating token...")
      
      const response = await api.post("/auth/sso/generate-token", {
        target_system: targetSystem
      })
      
      if (response.data.success) {
        // ✅ ENHANCED: Include cross-system context in SSO
        const crossSystemContext = localStorage.getItem('ongera_cross_system_context')
        if (crossSystemContext) {
          console.log("🔄 [GENERATE SSO] Including cross-system context")
          return {
            ...response.data.data,
            cross_system_context: JSON.parse(crossSystemContext)
          }
        }
        
        return response.data.data
      }
      
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      console.error("❌ [ENHANCED GENERATE SSO] Failed:", error)
      return rejectWithValue(error.response?.data?.message || "Failed to generate SSO token")
    }
  }
)

// ✅ ENHANCED: Validate Session with protection check
export const validateSession = createAsyncThunk(
  "auth/validateSession",
  async (
    _, 
    { rejectWithValue }
  ) => {
    try {
      console.log("🔍 [ENHANCED VALIDATE SESSION] Validating session...")
      
      const response = await api.get("/auth/sso/validate-session")
      
      if (response.data.success) {
        // ✅ ENHANCED: Check cross-system compatibility
        const systemsWithSessions = response.data.data.systems_with_sessions || []
        const hasCrossSystemSessions = systemsWithSessions.length > 1
        
        console.log("✅ [VALIDATE SESSION] Session validated", {
          systems: systemsWithSessions,
          crossSystem: hasCrossSystemSessions
        })
        
        return {
          ...response.data.data,
          has_cross_system_sessions: hasCrossSystemSessions,
          systems_with_sessions: systemsWithSessions
        }
      }
      
      return rejectWithValue(response.data.message)
    } catch (error: any) {
      console.error("❌ [ENHANCED VALIDATE SESSION] Failed:", error)
      return rejectWithValue(error.response?.data?.message || "Failed to validate session")
    }
  }
)

export const syncCrossSystemData = createAsyncThunk(
  "auth/syncCrossSystemData",
  async (
    data: { fromSystem: SystemType; context: any }, 
    { rejectWithValue }
  ) => {
    try {
      console.log("🔄 [SYNC CROSS-SYSTEM] Syncing data from:", data.fromSystem);
      
      // Store context locally
      SafeLocalStorage.setItem('ongera_cross_system_context', JSON.stringify({
        ...data.context,
        synced_from: data.fromSystem,
        synced_at: new Date().toISOString()
      }));
      
      // Update last sync timestamp
      SafeLocalStorage.setItem('ongera_last_sync', new Date().toISOString());
      
      return {
        context: data.context,
        fromSystem: data.fromSystem,
        syncedAt: new Date().toISOString()
      };
    } catch (error: any) {
      console.error("❌ [SYNC CROSS-SYSTEM] Failed:", error);
      return rejectWithValue("Failed to sync cross-system data");
    }
  }
);

// ✅ NEW: Validate Cross-System Compatibility
export const validateCrossSystemCompatibility = createAsyncThunk(
  "auth/validateCrossSystemCompatibility",
  async (
    _, 
    { getState, rejectWithValue }
  ) => {
    try {
      console.log("🔧 [VALIDATE COMPATIBILITY] Checking cross-system compatibility...")
      
      const state = getState() as { auth: EnhancedAuthState }
      const currentUser = state.auth.user
      
      if (!currentUser) {
        return rejectWithValue("No user found")
      }
      
      const validation = validateCrossSystemData(currentUser)
      
      console.log("✅ [VALIDATE COMPATIBILITY] Validation results:", validation)
      
      return {
        ...validation,
        timestamp: new Date().toISOString(),
        system: SystemType.ONGERA
      }
    } catch (error: any) {
      console.error("❌ [VALIDATE COMPATIBILITY] Failed:", error)
      return rejectWithValue("Failed to validate cross-system compatibility")
    }
  }
)

// ==================== SLICE ====================

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // ✅ ENHANCED: Logout with protection preservation
    logout: (state) => {
      console.log("👋 [ENHANCED LOGOUT] Logging out user...")
      
      // Clear state
      state.token = null
      state.user = null
      state.isAuthenticated = false
      state.error = null
      state.users = []
      state.usersPagination = initialPagination
      state.requiresVerification = false
      state.verificationEmail = null
      state.registrationSuccess = false
      state.ssoRedirectToken = null
      state.ssoTargetUrl = null
      state.hasMultiSystemSession = false
      state.activeSystems = []
      state.showSSOInitializer = false
      state.sessionValidated = false
      state.lastActivity = null
      
      // ✅ ENHANCED: Keep protection active
      state.protection.active = true
      state.protection.lastSync = new Date().toISOString()
      
      clearEnhancedAuthData()
    },
    
    // ✅ ENHANCED: Silent logout with error message
    silentLogout: (state) => {
      console.log("🔒 [ENHANCED SILENT LOGOUT] Session expired...")
      
      state.token = null
      state.user = null
      state.isAuthenticated = false
      state.error = "Your session has expired. Please login again."
      
      // ✅ ENHANCED: Keep protection context
      state.protection.active = true
      
      clearEnhancedAuthData()
    },
    
    clearError: (state) => {
      state.error = null
    },
    
    clearUsers: (state) => {
      state.users = []
      state.usersPagination = initialPagination
    },
    
    setVerificationEmail: (state, action: PayloadAction<string>) => {
      state.verificationEmail = action.payload
      state.requiresVerification = true
    },
    
    clearVerificationState: (state) => {
      state.requiresVerification = false
      state.verificationEmail = null
      state.registrationSuccess = false
    },

    setSSOInitializer: (state, action: PayloadAction<boolean>) => {
      state.showSSOInitializer = action.payload
    },

    clearSSOToken: (state) => {
      state.ssoRedirectToken = null
      state.showSSOInitializer = false
    },

    setActiveSystems: (state, action: PayloadAction<string[]>) => {
      state.activeSystems = action.payload
      state.hasMultiSystemSession = action.payload.length > 1
    },

    enableBwengePlus: (state) => {
      localStorage.setItem('bwenge_plus_enabled', 'true')
    },
    
    // ✅ ENHANCED: Protection-specific actions
    setProtectionStatus: (state, action: PayloadAction<{ active: boolean; reason?: string }>) => {
      state.protection.active = action.payload.active
      localStorage.setItem('ongera_protection_active', action.payload.active ? 'true' : 'false')
      console.log(`🛡️ [PROTECTION] Status: ${action.payload.active ? 'ACTIVE' : 'INACTIVE'}`, action.payload.reason)
    },
    
    updateProtectedFields: (state, action: PayloadAction<{ fields: string[]; system: SystemType }>) => {
      state.protection.fieldsProtected = [
        ...new Set([...state.protection.fieldsProtected, ...action.payload.fields])
      ]
      state.protection.lastSync = new Date().toISOString()
      console.log(`✅ [PROTECTION] Fields updated by ${action.payload.system}`)
    },
    
    loadCrossSystemContext: (state) => {
      try {
        const context = localStorage.getItem('ongera_cross_system_context')
        if (context) {
          state.protection.crossSystemData = JSON.parse(context)
          state.protection.lastSync = new Date().toISOString()
          console.log("📦 [PROTECTION] Loaded cross-system context")
        }
      } catch (error) {
        console.error("❌ [PROTECTION] Failed to load cross-system context:", error)
      }
    },
    
    setLastActivity: (state, action: PayloadAction<string>) => {
      state.lastActivity = action.payload
    },
    
    setSessionValidated: (state, action: PayloadAction<boolean>) => {
      state.sessionValidated = action.payload
    },
    
    // ✅ ENHANCED: Reset protection state (for debugging)
    resetProtectionState: (state) => {
      state.protection = initialProtection
      localStorage.removeItem('ongera_cross_system_context')
      localStorage.removeItem('ongera_protection_active')
      localStorage.removeItem('ongera_last_sync')
      console.log("🔄 [PROTECTION] Protection state reset")
    }
  },
  extraReducers: (builder) => {
    builder
      // ==================== REGISTER ====================
      .addCase(registerUser.pending, (state) => {
        console.log("⏳ [REGISTER] Pending...")
        state.isLoading = true
        state.error = null
        state.registrationSuccess = false
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        console.log("✅ [REGISTER] Success")
        state.isLoading = false
        state.requiresVerification = true
        state.verificationEmail = action.payload.email
        state.registrationSuccess = true
        
        // ✅ ENHANCED: Initialize protection for new user
        state.protection.active = true
        localStorage.setItem('ongera_protection_active', 'true')
      })
      .addCase(registerUser.rejected, (state, action) => {
        console.error("❌ [REGISTER] Failed:", action.payload)
        state.isLoading = false
        state.error = action.payload as string
        state.registrationSuccess = false
      })

      // ==================== LOGIN ====================
      .addCase(loginUser.pending, (state) => {
        console.log("⏳ [LOGIN] Pending...")
        state.isLoading = true
        state.error = null
        state.protection.active = true
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log("✅ [LOGIN] Success")
        state.isLoading = false
        state.token = action.payload.token
        state.user = action.payload.user
        state.isAuthenticated = true
        state.requiresVerification = false
        state.verificationEmail = null
        state.protection.active = true
        state.lastActivity = new Date().toISOString()

        // ✅ ENHANCED: Store with protection metadata
        storeEnhancedAuthData(action.payload.user, action.payload.token)
        
        // ✅ ENHANCED: Update protection state
        state.protection.lastSync = new Date().toISOString()
        state.protection.crossSystemData = {
          IsForWhichSystem: action.payload.user.IsForWhichSystem,
          bwenge_role: action.payload.user.bwenge_role,
          primary_institution_id: action.payload.user.primary_institution_id,
          institution_ids: action.payload.user.institution_ids,
          institution_role: action.payload.user.institution_role
        }

        // ✅ ENHANCED: Handle SSO token with protection
        if (action.payload.user.sso_redirect_token) {
          state.ssoRedirectToken = action.payload.user.sso_redirect_token
          state.hasMultiSystemSession = action.payload.user.has_multi_system_access || false

          // Check if user has used BwengePlus before
          const hasBwengePlusHistory = localStorage.getItem('bwenge_plus_enabled') === 'true'

          if (hasBwengePlusHistory) {
            state.showSSOInitializer = true
          }
        }
        
        console.log("✅ [PROTECTION] Login completed with field protection")
      })
      .addCase(loginUser.rejected, (state, action: any) => {
        console.error("❌ [LOGIN] Failed")
        state.isLoading = false
        
        const payload = action.payload
        if (typeof payload === 'object' && payload.requires_verification) {
          state.error = payload.message
          state.requiresVerification = true
          state.verificationEmail = payload.email
        } else {
          state.error = payload as string
        }
        
        state.protection.active = true
      })

      // ==================== GOOGLE LOGIN ====================
      .addCase(googleLogin.pending, (state) => {
        console.log("⏳ [GOOGLE LOGIN] Pending...")
        state.isLoading = true
        state.error = null
        state.protection.active = true
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        console.log("✅ [GOOGLE LOGIN] Success")
        state.isLoading = false
        state.token = action.payload.token
        state.user = action.payload.user
        state.isAuthenticated = true
        state.protection.active = true
        state.lastActivity = new Date().toISOString()
        
        // ✅ ENHANCED: Store with protection metadata
        storeEnhancedAuthData(action.payload.user, action.payload.token)
        
        // ✅ ENHANCED: Update protection state
        state.protection.lastSync = new Date().toISOString()
      })
      .addCase(googleLogin.rejected, (state, action) => {
        console.error("❌ [GOOGLE LOGIN] Failed:", action.payload)
        state.isLoading = false
        state.error = action.payload as string
        state.protection.active = true
      })

      // ==================== VERIFY EMAIL ====================
      .addCase(verifyEmail.pending, (state) => {
        console.log("⏳ [VERIFY EMAIL] Pending...")
        state.isLoading = true
        state.error = null
        state.protection.active = true
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        console.log("✅ [VERIFY EMAIL] Success")
        state.isLoading = false
        state.token = action.payload.token
        state.user = action.payload.user
        state.isAuthenticated = true
        state.requiresVerification = false
        state.verificationEmail = null
        state.protection.active = true
        state.lastActivity = new Date().toISOString()
        
        // ✅ ENHANCED: Store with protection metadata
        storeEnhancedAuthData(action.payload.user, action.payload.token)
        
        // ✅ ENHANCED: Update protection state
        state.protection.lastSync = new Date().toISOString()
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        console.error("❌ [VERIFY EMAIL] Failed:", action.payload)
        state.isLoading = false
        state.error = action.payload as string
        state.protection.active = true
      })

      // ==================== RESEND VERIFICATION OTP ====================
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

      // ==================== REQUEST PASSWORD CHANGE ====================
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

      // ==================== CHANGE PASSWORD WITH OTP ====================
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

      // ==================== FETCH PROFILE ====================
      .addCase(fetchProfile.pending, (state) => {
        console.log("⏳ [FETCH PROFILE] Pending...")
        state.isLoading = true
        state.error = null
        state.protection.active = true
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        console.log("✅ [FETCH PROFILE] Success")
        state.isLoading = false
        state.user = action.payload
        state.lastActivity = new Date().toISOString()
        state.protection.active = true
        
        // ✅ ENHANCED: Update cookies with protection
        if (state.token) {
          Cookies.set("user", JSON.stringify(action.payload), { 
            expires: 7, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict' 
          })
        }
        
        // ✅ ENHANCED: Update protection state
        state.protection.lastSync = new Date().toISOString()
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        console.error("❌ [FETCH PROFILE] Failed:", action.payload)
        state.isLoading = false
        state.error = action.payload as string
        state.protection.active = true
      })

      // ==================== UPDATE PROFILE ====================
      .addCase(updateProfile.pending, (state) => {
        console.log("⏳ [UPDATE PROFILE] Pending...")
        state.isLoading = true
        state.error = null
        state.protection.active = true
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        console.log("✅ [UPDATE PROFILE] Success")
        state.isLoading = false
        state.user = { ...state.user, ...action.payload } as EnhancedUser
        state.lastActivity = new Date().toISOString()
        state.protection.active = true
        
        if (state.user && state.token) {
          // ✅ ENHANCED: Update cookies with protection
          Cookies.set("user", JSON.stringify(state.user), { 
            expires: 7, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict' 
          })
        }
        
        // ✅ ENHANCED: Update protection state
        state.protection.lastSync = new Date().toISOString()
      })
      .addCase(updateProfile.rejected, (state, action) => {
        console.error("❌ [UPDATE PROFILE] Failed:", action.payload)
        state.isLoading = false
        state.error = action.payload as string
        state.protection.active = true
      })

      // ==================== GET ALL USERS ====================
      .addCase(getAllUsers.pending, (state) => {
        console.log("⏳ [GET ALL USERS] Loading users...")
        state.isLoadingUsers = true
        state.error = null
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        console.log("✅ [GET ALL USERS] Success")
        state.isLoadingUsers = false
        state.users = action.payload.users
        state.usersPagination = action.payload.pagination
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        console.error("❌ [GET ALL USERS] Failed:", action.payload)
        state.isLoadingUsers = false
        state.error = action.payload as string
        state.users = []
      })

      // ==================== ACTIVATE/DEACTIVATE USER ====================
      .addCase(activateDeactivateUser.pending, (state) => {
        console.log("⏳ [ACTIVATE/DEACTIVATE] Updating status...")
        state.isSubmitting = true
        state.error = null
      })
      .addCase(activateDeactivateUser.fulfilled, (state, action) => {
        console.log("✅ [ACTIVATE/DEACTIVATE] Success")
        state.isSubmitting = false

        const userIndex = state.users.findIndex(u => u.id === action.payload.user.id)
        if (userIndex !== -1) {
          state.users[userIndex] = {
            ...state.users[userIndex],
            ...action.payload.user
          }
          console.log(`✅ Updated user at index ${userIndex}`)
        }
      })
      .addCase(activateDeactivateUser.rejected, (state, action) => {
        console.error("❌ [ACTIVATE/DEACTIVATE] Failed:", action.payload)
        state.isSubmitting = false
        state.error = action.payload as string
      })

      // ==================== DELETE USER ====================
      .addCase(deleteUser.pending, (state) => {
        console.log("⏳ [DELETE USER] Deleting user...")
        state.isSubmitting = true
        state.error = null
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        console.log("✅ [DELETE USER] Success")
        state.isSubmitting = false

        const usersBefore = state.users.length
        state.users = state.users.filter(u => u.id !== action.payload.id)
        state.usersPagination.total = Math.max(0, state.usersPagination.total - 1)

        console.log(`✅ Removed user. Users before: ${usersBefore}, after: ${state.users.length}`)
      })
      .addCase(deleteUser.rejected, (state, action) => {
        console.error("❌ [DELETE USER] Failed:", action.payload)
        state.isSubmitting = false
        state.error = action.payload as string
      })

      // ==================== GENERATE SSO TOKEN ====================
      .addCase(generateSSOToken.pending, (state) => {
        console.log("⏳ [GENERATE SSO] Pending...")
        state.isLoading = true
        state.error = null
      })
      .addCase(generateSSOToken.fulfilled, (state, action) => {
        console.log("✅ [GENERATE SSO] Success")
        state.isLoading = false
        state.ssoRedirectToken = action.payload.sso_token
        state.ssoTargetUrl = action.payload.redirect_url
        
        // ✅ ENHANCED: Store cross-system context for SSO
        if (action.payload.cross_system_context) {
          state.protection.crossSystemData = action.payload.cross_system_context
          localStorage.setItem('ongera_cross_system_context', JSON.stringify(action.payload.cross_system_context))
        }
      })
      .addCase(generateSSOToken.rejected, (state, action) => {
        console.error("❌ [GENERATE SSO] Failed:", action.payload)
        state.isLoading = false
        state.error = action.payload as string
      })

      // ==================== VALIDATE SESSION ====================
      .addCase(validateSession.pending, (state) => {
        console.log("⏳ [VALIDATE SESSION] Pending...")
        state.isLoading = true
        state.error = null
      })
      .addCase(validateSession.fulfilled, (state, action) => {
        console.log("✅ [VALIDATE SESSION] Success")
        state.isLoading = false
        state.activeSystems = action.payload.systems_with_sessions || []
        state.hasMultiSystemSession = action.payload.has_cross_system_sessions || false
        state.sessionValidated = true
        state.lastActivity = new Date().toISOString()
        
        // ✅ ENHANCED: Update protection state
        state.protection.systemCompatibility.bwengeplus = state.activeSystems.includes('bwengeplus')
        state.protection.lastSync = new Date().toISOString()
      })
      .addCase(validateSession.rejected, (state, action) => {
        console.error("❌ [VALIDATE SESSION] Failed:", action.payload)
        state.isLoading = false
        state.error = action.payload as string
        state.sessionValidated = false
      })

      // ==================== SYNC CROSS-SYSTEM DATA ====================
      .addCase(syncCrossSystemData.pending, (state) => {
        console.log("⏳ [SYNC CROSS-SYSTEM] Pending...")
        state.isLoading = true
        state.error = null
      })
      .addCase(syncCrossSystemData.fulfilled, (state, action) => {
        console.log("✅ [SYNC CROSS-SYSTEM] Success")
        state.isLoading = false
        state.protection.crossSystemData = action.payload.context
        state.protection.lastSync = action.payload.syncedAt
        
        // ✅ ENHANCED: Merge with current user if authenticated
        if (state.user && state.isAuthenticated) {
          const mergedUser = mergeCrossSystemData(state.user, action.payload.context)
          state.user = mergedUser
          
          // Update stored user data
          if (state.token) {
            storeEnhancedAuthData(mergedUser, state.token)
          }
        }
      })
      .addCase(syncCrossSystemData.rejected, (state, action) => {
        console.error("❌ [SYNC CROSS-SYSTEM] Failed:", action.payload)
        state.isLoading = false
        state.error = action.payload as string
      })

      // ==================== VALIDATE CROSS-SYSTEM COMPATIBILITY ====================
      .addCase(validateCrossSystemCompatibility.pending, (state) => {
        console.log("⏳ [VALIDATE COMPATIBILITY] Pending...")
        state.isLoading = true
        state.error = null
      })
      .addCase(validateCrossSystemCompatibility.fulfilled, (state, action) => {
        console.log("✅ [VALIDATE COMPATIBILITY] Success")
        state.isLoading = false
        
        // ✅ ENHANCED: Update protection state based on validation
        if (action.payload.recoveredFields.length > 0) {
          console.log("🔄 [PROTECTION] Recovered fields:", action.payload.recoveredFields)
          
          // Add recovered fields to protected fields list
          state.protection.fieldsProtected = [
            ...new Set([...state.protection.fieldsProtected, ...action.payload.recoveredFields])
          ]
        }
        
        if (action.payload.warnings.length > 0) {
          console.warn("⚠️ [PROTECTION] Warnings:", action.payload.warnings)
        }
      })
      .addCase(validateCrossSystemCompatibility.rejected, (state, action) => {
        console.error("❌ [VALIDATE COMPATIBILITY] Failed:", action.payload)
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

// ==================== EXPORTS ====================

export const { 
  logout, 
  silentLogout,
  clearError, 
  clearUsers, 
  setVerificationEmail, 
  clearVerificationState, 
  setSSOInitializer,
  clearSSOToken,
  setActiveSystems,
  enableBwengePlus,
  setProtectionStatus,
  updateProtectedFields,
  loadCrossSystemContext,
  setLastActivity,
  setSessionValidated,
  resetProtectionState
} = authSlice.actions

export default authSlice.reducer

// ==================== SELECTORS ====================

export const selectAuth = (state: { auth: EnhancedAuthState }) => state.auth
export const selectUser = (state: { auth: EnhancedAuthState }) => state.auth.user
export const selectIsAuthenticated = (state: { auth: EnhancedAuthState }) => state.auth.isAuthenticated
export const selectIsLoading = (state: { auth: EnhancedAuthState }) => state.auth.isLoading
export const selectError = (state: { auth: EnhancedAuthState }) => state.auth.error
export const selectRequiresVerification = (state: { auth: EnhancedAuthState }) => state.auth.requiresVerification
export const selectVerificationEmail = (state: { auth: EnhancedAuthState }) => state.auth.verificationEmail
export const selectUsers = (state: { auth: EnhancedAuthState }) => state.auth.users
export const selectIsLoadingUsers = (state: { auth: EnhancedAuthState }) => state.auth.isLoadingUsers
export const selectUsersPagination = (state: { auth: EnhancedAuthState }) => state.auth.usersPagination
export const selectSSORedirectToken = (state: { auth: EnhancedAuthState }) => state.auth.ssoRedirectToken
export const selectShowSSOInitializer = (state: { auth: EnhancedAuthState }) => state.auth.showSSOInitializer
export const selectHasMultiSystemSession = (state: { auth: EnhancedAuthState }) => state.auth.hasMultiSystemSession
export const selectActiveSystems = (state: { auth: EnhancedAuthState }) => state.auth.activeSystems

// ✅ ENHANCED: Protection selectors
export const selectProtectionActive = (state: { auth: EnhancedAuthState }) => state.auth.protection.active
export const selectCrossSystemData = (state: { auth: EnhancedAuthState }) => state.auth.protection.crossSystemData
export const selectLastSync = (state: { auth: EnhancedAuthState }) => state.auth.protection.lastSync
export const selectProtectedFields = (state: { auth: EnhancedAuthState }) => state.auth.protection.fieldsProtected
export const selectSystemCompatibility = (state: { auth: EnhancedAuthState }) => state.auth.protection.systemCompatibility
export const selectLastActivity = (state: { auth: EnhancedAuthState }) => state.auth.lastActivity
export const selectSessionValidated = (state: { auth: EnhancedAuthState }) => state.auth.sessionValidated

// ✅ ENHANCED: Helper selectors
export const selectHasInstitutionData = (state: { auth: EnhancedAuthState }) => {
  const user = state.auth.user
  return !!(user?.primary_institution_id || user?.institution_ids?.length)
}

export const selectIsInstitutionMember = (state: { auth: EnhancedAuthState }) => {
  return state.auth.user?.is_institution_member || false
}

export const selectBwengeRole = (state: { auth: EnhancedAuthState }) => {
  return state.auth.user?.bwenge_role
}

export const selectCrossSystemCompatible = (state: { auth: EnhancedAuthState }) => {
  const user = state.auth.user
  return !!(user?.IsForWhichSystem && user?.bwenge_role)
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Initialize protected authentication on app start
 */
export const initializeProtectedAuth = () => {
  const token = Cookies.get("token")
  const userCookie = Cookies.get("user")
  
  if (token && userCookie) {
    try {
      const user = JSON.parse(userCookie) as EnhancedUser
      
      // Validate cross-system data
      const validation = validateCrossSystemData(user)
      
      if (!validation.isValid) {
        console.warn("⚠️ [INITIALIZATION] Cross-system data validation failed:", validation)
        
        // Attempt recovery
        const recoveredUser = { ...user }
        
        validation.missingFields.forEach(field => {
          if (field === 'IsForWhichSystem') {
            recoveredUser.IsForWhichSystem = SystemType.ONGERA
          }
          if (field === 'bwenge_role' && !recoveredUser.bwenge_role) {
            recoveredUser.bwenge_role = 'LEARNER'
          }
        })
        
        // Update stored data
        Cookies.set("user", JSON.stringify(recoveredUser), { 
          expires: 7, 
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict' 
        })
        
        return { 
          token, 
          user: recoveredUser, 
          protectionActive: true,
          recovered: validation.recoveredFields.length > 0
        }
      }
      
      return { 
        token, 
        user, 
        protectionActive: true,
        recovered: false
      }
    } catch (error) {
      console.error("❌ [INITIALIZATION] Failed to parse protected auth data:", error)
      clearEnhancedAuthData()
      return null
    }
  }
  
  return null
}

/**
 * Check if user data has all required cross-system fields
 */
export const hasCompleteCrossSystemData = (user: EnhancedUser | null): boolean => {
  if (!user) return false
  
  const requiredFields = ['IsForWhichSystem', 'bwenge_role']
  return requiredFields.every(field => {
    const value = user[field as keyof EnhancedUser]
    return value !== undefined && value !== null && value !== ''
  })
}

/**
 * Extract cross-system context from user
 */
export const extractCrossSystemContext = (user: EnhancedUser | null) => {
  if (!user) return null
  
  return {
    IsForWhichSystem: user.IsForWhichSystem,
    bwenge_role: user.bwenge_role,
    primary_institution_id: user.primary_institution_id,
    institution_ids: user.institution_ids,
    institution_role: user.institution_role,
    extracted_at: new Date().toISOString()
  }
}

/**
 * Safely merge user updates with protection
 */
export const mergeUserWithProtection = (
  currentUser: EnhancedUser | null, 
  updates: Partial<EnhancedUser>
): EnhancedUser | null => {
  if (!currentUser) return null
  
  const merged = { ...currentUser }
  const protection = currentUser._protection || {
    fields_protected: [],
    last_sync: new Date().toISOString(),
    system_origin: SystemType.ONGERA,
    immutable_fields: ['IsForWhichSystem', 'bwenge_role']
  }
  
  // Handle updates based on protection rules
  Object.keys(updates).forEach(key => {
    const field = key as keyof EnhancedUser
    const newValue = updates[field]
    
    if (newValue === undefined) return
    
    // Check if field is immutable
    if (protection.immutable_fields.includes(field)) {
      // Only update if current value is null/undefined
      if (merged[field] === undefined || merged[field] === null || merged[field] === '') {
        ;(merged as any)[field] = newValue
        console.log(`🔄 [MERGE] Set immutable field: ${field}`)
      }
    } else if (field === 'institution_ids' && Array.isArray(newValue)) {
      // Merge arrays
      const currentIds = merged.institution_ids || []
      const newIds = newValue.filter((id: string) => !currentIds.includes(id))
      
      if (newIds.length > 0) {
        merged.institution_ids = [...currentIds, ...newIds]
        console.log(`🔄 [MERGE] Added ${newIds.length} new institution IDs`)
      }
    } else {
      // Update regular fields
      ;(merged as any)[field] = newValue
    }
  })
  
  // Update protection metadata
  merged._protection = {
    ...protection,
    last_sync: new Date().toISOString(),
    fields_protected: [
      ...new Set([
        ...protection.fields_protected,
        ...Object.keys(updates).filter(key => updates[key as keyof EnhancedUser] !== undefined)
      ])
    ]
  }
  
  return merged
}
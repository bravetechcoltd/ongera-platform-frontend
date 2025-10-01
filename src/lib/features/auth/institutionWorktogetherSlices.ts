
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";

export enum WorkType {
  RESEARCH_COLLABORATION = "Research Collaboration",
  EDUCATIONAL_PARTNERSHIP = "Educational Partnership",
  JOINT_PROJECT = "Joint Project",
  TRAINING_PROGRAM = "Training Program",
  CONFERENCE = "Conference",
  WORKSHOP = "Workshop",
  OTHER = "Other",
}

export enum PartnershipStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending",
  COMPLETED = "completed",
}

export interface InstitutionWork {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  work_type: WorkType;
  status: PartnershipStatus;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  social_links?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
  metadata?: {
    founded_year?: number;
    employees_count?: number;
    specializations?: string[];
    achievements?: string[];
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface InstitutionWorkState {
  institutions: InstitutionWork[];
  currentInstitution: InstitutionWork | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: InstitutionWorkState = {
  institutions: [],
  currentInstitution: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
};

// ==================== CREATE ====================
export const createInstitutionWork = createAsyncThunk(
  "institutionWork/create",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await api.post("/institution-work", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create institution work");
    }
  }
);

// ==================== GET ALL ====================
export const fetchInstitutionWorkTogether = createAsyncThunk(
  "institutionWork/fetchAll",
  async (params: {
    page?: number;
    limit?: number;
    search?: string;
    work_type?: string;
    status?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, String(value));
      });

      const response = await api.get(`/institution-work?${queryParams.toString()}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch institutions");
    }
  }
);

// ==================== GET ACTIVE FOR HOMEPAGE ====================
export const fetchActiveInstitutions = createAsyncThunk(
  "institutionWork/fetchActive",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/institution-work/public/active");
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch active institutions");
    }
  }
);

// ==================== GET BY ID ====================
export const fetchInstitutionWorkById = createAsyncThunk(
  "institutionWork/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/institution-work/${id}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch institution work");
    }
  }
);

// ==================== UPDATE ====================
export const updateInstitutionWork = createAsyncThunk(
  "institutionWork/update",
  async ({ id, formData }: { id: string; formData: FormData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/institution-work/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update institution work");
    }
  }
);

// ==================== DELETE ====================
export const deleteInstitutionWork = createAsyncThunk(
  "institutionWork/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/institution-work/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete institution work");
    }
  }
);

// ==================== TOGGLE ACTIVE STATUS ====================
export const toggleInstitutionActive = createAsyncThunk(
  "institutionWork/toggleActive",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/institution-work/${id}/toggle`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to toggle active status");
    }
  }
);

const institutionWorkSlice = createSlice({
  name: "institutionWork",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentInstitution: (state) => {
      state.currentInstitution = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createInstitutionWork.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createInstitutionWork.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.institutions.unshift(action.payload);
        state.currentInstitution = action.payload;
      })
      .addCase(createInstitutionWork.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })

      // Fetch All
      .addCase(fetchInstitutionWorkTogether.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInstitutionWorkTogether.fulfilled, (state, action) => {
        state.isLoading = false;
        state.institutions = action.payload.institutions;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchInstitutionWorkTogether.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch Active
      .addCase(fetchActiveInstitutions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveInstitutions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.institutions = action.payload;
      })
      .addCase(fetchActiveInstitutions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch By ID
      .addCase(fetchInstitutionWorkById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInstitutionWorkById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentInstitution = action.payload;
      })
      .addCase(fetchInstitutionWorkById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update
      .addCase(updateInstitutionWork.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updateInstitutionWork.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const index = state.institutions.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.institutions[index] = action.payload;
        }
        state.currentInstitution = action.payload;
      })
      .addCase(updateInstitutionWork.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })

      // Delete
      .addCase(deleteInstitutionWork.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(deleteInstitutionWork.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.institutions = state.institutions.filter(i => i.id !== action.payload);
        if (state.currentInstitution?.id === action.payload) {
          state.currentInstitution = null;
        }
      })
      .addCase(deleteInstitutionWork.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })

      // Toggle Active
      .addCase(toggleInstitutionActive.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(toggleInstitutionActive.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const index = state.institutions.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.institutions[index] = action.payload;
        }
        if (state.currentInstitution?.id === action.payload.id) {
          state.currentInstitution = action.payload;
        }
      })
      .addCase(toggleInstitutionActive.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentInstitution } = institutionWorkSlice.actions;
export default institutionWorkSlice.reducer;
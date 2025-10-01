import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

// ==================== TYPES ====================
export type InstitutionProjectType =
  | "BACHELORS"
  | "MASTERS_THESIS"
  | "DISSERTATION"
  | "FUNDS";

export type InstitutionProjectStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_SUPERVISOR_REVIEW"
  | "REWORK_REQUESTED"
  | "UNDER_INSTRUCTOR_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "PUBLISHED";

export type InstitutionPublishVisibility = "INSTITUTION_ONLY" | "PUBLIC";

export interface InstitutionResearchProject {
  id: string;
  title: string;
  abstract: string;
  full_description?: string;
  project_type: InstitutionProjectType;
  academic_year?: string;
  semester?: "FIRST" | "SECOND" | "THIRD";
  cover_image_url?: string;
  project_file_url?: string;
  status: InstitutionProjectStatus;
  visibility_after_publish?: InstitutionPublishVisibility;
  rejection_reason?: string;
  rework_reason?: string;
  is_multi_student: boolean;
  max_students: number;
  field_of_study?: string;
  keywords?: string[];
  doi?: string;
  publication_date?: string;
  submission_date?: string;
  final_approval_date?: string;
  view_count: number;
  download_count: number;
  requires_rework: boolean;
  rework_count: number;
  institution?: any;
  students?: any[];
  instructors?: any[];
  industrial_supervisors?: any[];
  files?: any[];
  reviews?: any[];
  comments?: any[];
  activities?: any[];
  created_at: string;
  updated_at: string;
}

interface State {
  projects: InstitutionResearchProject[];
  selectedProject: InstitutionResearchProject | null;
  awaitingPublication: InstitutionResearchProject[];
  publicationDecision: Record<string, InstitutionPublishVisibility>;
  dashboard: any;
  activity: any[];
  comments: any[];
  pagination: { page: number; limit: number; total: number; totalPages: number } | null;
  loading: boolean;
  creating: boolean;
  updating: boolean;
  submitting: boolean;
  reviewing: boolean;
  publishing: boolean;
  error: string | null;
  success: string | null;
}

const initialState: State = {
  projects: [],
  selectedProject: null,
  awaitingPublication: [],
  publicationDecision: {},
  dashboard: null,
  activity: [],
  comments: [],
  pagination: null,
  loading: false,
  creating: false,
  updating: false,
  submitting: false,
  reviewing: false,
  publishing: false,
  error: null,
  success: null,
};

// ==================== THUNKS ====================

export const fetchInstitutionProjects = createAsyncThunk(
  "institutionResearch/fetchProjects",
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const res = await api.get("/institution-research-projects", { params });
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const fetchInstitutionProject = createAsyncThunk(
  "institutionResearch/fetchProject",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/institution-research-projects/${id}`);
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const createInstitutionProject = createAsyncThunk(
  "institutionResearch/create",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const res = await api.post("/institution-research-projects", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const updateInstitutionProject = createAsyncThunk(
  "institutionResearch/update",
  async ({ id, formData }: { id: string; formData: FormData }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/institution-research-projects/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const submitInstitutionProject = createAsyncThunk(
  "institutionResearch/submit",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.post(`/institution-research-projects/${id}/submit`);
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const supervisorReviewProject = createAsyncThunk(
  "institutionResearch/supervisorReview",
  async (
    { id, action, feedback }: { id: string; action: "APPROVED" | "REWORK_REQUESTED" | "REJECTED"; feedback?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post(`/institution-research-projects/${id}/supervisor-review`, {
        action,
        feedback,
      });
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const instructorReviewProject = createAsyncThunk(
  "institutionResearch/instructorReview",
  async (
    { id, action, feedback }: { id: string; action: "APPROVED" | "REWORK_REQUESTED" | "REJECTED"; feedback?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post(`/institution-research-projects/${id}/instructor-review`, {
        action,
        feedback,
      });
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const publishInstitutionProject = createAsyncThunk(
  "institutionResearch/publish",
  async (
    {
      id,
      action,
      visibility,
      notes,
    }: {
      id: string;
      action: "PUBLISH" | "REJECT";
      visibility: "INSTITUTION_ONLY" | "PUBLIC";
      notes?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post(`/institution-research-projects/${id}/publish`, {
        action,
        visibility,
        notes,
      });
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const fetchProjectActivity = createAsyncThunk(
  "institutionResearch/activity",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/institution-research-projects/${id}/activity`);
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const fetchProjectComments = createAsyncThunk(
  "institutionResearch/fetchComments",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/institution-research-projects/${id}/comments`);
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const addProjectComment = createAsyncThunk(
  "institutionResearch/addComment",
  async (
    { id, payload }: { id: string; payload: any },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const res = await api.post(`/institution-research-projects/${id}/comments`, payload);
      await dispatch(fetchProjectComments(id));
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const toggleCommentResolved = createAsyncThunk(
  "institutionResearch/resolveComment",
  async (
    { id, commentId }: { id: string; commentId: string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const res = await api.patch(
        `/institution-research-projects/${id}/comments/${commentId}/resolve`
      );
      await dispatch(fetchProjectComments(id));
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const fetchPortalDashboard = createAsyncThunk(
  "institutionResearch/dashboard",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/institution-portal/dashboard");
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

// ==================== SLICE ====================
const slice = createSlice({
  name: "institutionResearch",
  initialState,
  reducers: {
    setPublicationDecision(state, action) {
      const { id, visibility } = action.payload;
      state.publicationDecision[id] = visibility;
    },
    clearMessages(state) {
      state.error = null;
      state.success = null;
    },
    clearSelected(state) {
      state.selectedProject = null;
      state.activity = [];
      state.comments = [];
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchInstitutionProjects.pending, (s) => {
      s.loading = true;
      s.error = null;
    })
      .addCase(fetchInstitutionProjects.fulfilled, (s, a: any) => {
        s.loading = false;
        s.projects = a.payload.projects || [];
        s.pagination = a.payload.pagination || null;
      })
      .addCase(fetchInstitutionProjects.rejected, (s, a: any) => {
        s.loading = false;
        s.error = a.payload as string;
      });

    b.addCase(fetchInstitutionProject.pending, (s) => {
      s.loading = true;
    })
      .addCase(fetchInstitutionProject.fulfilled, (s, a: any) => {
        s.loading = false;
        s.selectedProject = a.payload;
      })
      .addCase(fetchInstitutionProject.rejected, (s, a: any) => {
        s.loading = false;
        s.error = a.payload as string;
      });

    b.addCase(createInstitutionProject.pending, (s) => {
      s.creating = true;
      s.error = null;
    })
      .addCase(createInstitutionProject.fulfilled, (s, a: any) => {
        s.creating = false;
        s.projects.unshift(a.payload);
        s.success = "Project created";
      })
      .addCase(createInstitutionProject.rejected, (s, a: any) => {
        s.creating = false;
        s.error = a.payload as string;
      });

    b.addCase(updateInstitutionProject.pending, (s) => {
      s.updating = true;
      s.error = null;
    })
      .addCase(updateInstitutionProject.fulfilled, (s, a: any) => {
        s.updating = false;
        s.selectedProject = a.payload;
        s.success = "Project updated";
      })
      .addCase(updateInstitutionProject.rejected, (s, a: any) => {
        s.updating = false;
        s.error = a.payload as string;
      });

    b.addCase(submitInstitutionProject.pending, (s) => {
      s.submitting = true;
      s.error = null;
    })
      .addCase(submitInstitutionProject.fulfilled, (s, a: any) => {
        s.submitting = false;
        s.selectedProject = a.payload;
        s.success = "Submitted for review";
      })
      .addCase(submitInstitutionProject.rejected, (s, a: any) => {
        s.submitting = false;
        s.error = a.payload as string;
      });

    b.addCase(supervisorReviewProject.pending, (s) => {
      s.reviewing = true;
      s.error = null;
    })
      .addCase(supervisorReviewProject.fulfilled, (s, a: any) => {
        s.reviewing = false;
        s.selectedProject = a.payload.project;
        s.success = "Supervisor review submitted";
      })
      .addCase(supervisorReviewProject.rejected, (s, a: any) => {
        s.reviewing = false;
        s.error = a.payload as string;
      });

    b.addCase(instructorReviewProject.pending, (s) => {
      s.reviewing = true;
      s.error = null;
    })
      .addCase(instructorReviewProject.fulfilled, (s, a: any) => {
        s.reviewing = false;
        s.selectedProject = a.payload.project;
        s.success = "Instructor review submitted";
      })
      .addCase(instructorReviewProject.rejected, (s, a: any) => {
        s.reviewing = false;
        s.error = a.payload as string;
      });

    b.addCase(publishInstitutionProject.pending, (s) => {
      s.publishing = true;
      s.error = null;
    })
      .addCase(publishInstitutionProject.fulfilled, (s, a: any) => {
        s.publishing = false;
        s.selectedProject = a.payload;
        s.success = "Publication decision recorded";
      })
      .addCase(publishInstitutionProject.rejected, (s, a: any) => {
        s.publishing = false;
        s.error = a.payload as string;
      });

    b.addCase(fetchProjectActivity.fulfilled, (s, a: any) => {
      s.activity = a.payload;
    });
    b.addCase(fetchProjectComments.fulfilled, (s, a: any) => {
      s.comments = a.payload;
    });
    b.addCase(fetchPortalDashboard.fulfilled, (s, a: any) => {
      s.dashboard = a.payload;
      if (a.payload?.awaitingPublication) {
        s.awaitingPublication = a.payload.awaitingPublication;
      }
    });
  },
});

export const { setPublicationDecision, clearMessages, clearSelected } = slice.actions;
export default slice.reducer;

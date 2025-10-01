import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

export interface IndustrialSupervisor {
  id: string;
  user: any;
  institution: any;
  invitation_status: "PENDING" | "ACCEPTED" | "DECLINED" | "REVOKED";
  invitation_token: string;
  invitation_expires_at: string;
  organization?: string;
  expertise_area?: string;
  is_active: boolean;
  accepted_at?: string;
  created_at: string;
}

interface State {
  supervisors: IndustrialSupervisor[];
  loading: boolean;
  inviting: boolean;
  revoking: boolean;
  accepting: boolean;
  assigning: boolean;
  error: string | null;
  success: string | null;
}

const initial: State = {
  supervisors: [],
  loading: false,
  inviting: false,
  revoking: false,
  accepting: false,
  assigning: false,
  error: null,
  success: null,
};

export const fetchSupervisors = createAsyncThunk(
  "industrialSupervisor/list",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/institution-portal/supervisors");
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const inviteSupervisor = createAsyncThunk(
  "industrialSupervisor/invite",
  async (
    payload: { user_id: string; expertise_area?: string; organization?: string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const res = await api.post("/institution-portal/supervisors/invite", payload);
      await dispatch(fetchSupervisors());
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const acceptSupervisorInvitation = createAsyncThunk(
  "industrialSupervisor/accept",
  async (token: string, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/institution-portal/supervisors/accept/${token}`);
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const revokeSupervisor = createAsyncThunk(
  "industrialSupervisor/revoke",
  async (id: string, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.delete(`/institution-portal/supervisors/${id}`);
      await dispatch(fetchSupervisors());
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const assignSupervisorToStudent = createAsyncThunk(
  "industrialSupervisor/assign",
  async (payload: { supervisor_id: string; student_id: string }, { rejectWithValue }) => {
    try {
      const res = await api.post("/institution-portal/assign-supervisor-to-student", payload);
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

const slice = createSlice({
  name: "industrialSupervisor",
  initialState: initial,
  reducers: {
    clearIndustrialMessages(s) {
      s.error = null;
      s.success = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchSupervisors.pending, (s) => {
      s.loading = true;
    })
      .addCase(fetchSupervisors.fulfilled, (s, a: any) => {
        s.loading = false;
        s.supervisors = a.payload;
      })
      .addCase(fetchSupervisors.rejected, (s, a: any) => {
        s.loading = false;
        s.error = a.payload as string;
      });

    b.addCase(inviteSupervisor.pending, (s) => {
      s.inviting = true;
      s.error = null;
    })
      .addCase(inviteSupervisor.fulfilled, (s) => {
        s.inviting = false;
        s.success = "Invitation sent";
      })
      .addCase(inviteSupervisor.rejected, (s, a: any) => {
        s.inviting = false;
        s.error = a.payload as string;
      });

    b.addCase(revokeSupervisor.pending, (s) => {
      s.revoking = true;
    })
      .addCase(revokeSupervisor.fulfilled, (s) => {
        s.revoking = false;
        s.success = "Supervisor revoked";
      })
      .addCase(revokeSupervisor.rejected, (s, a: any) => {
        s.revoking = false;
        s.error = a.payload as string;
      });

    b.addCase(acceptSupervisorInvitation.pending, (s) => {
      s.accepting = true;
    })
      .addCase(acceptSupervisorInvitation.fulfilled, (s) => {
        s.accepting = false;
        s.success = "Invitation accepted";
      })
      .addCase(acceptSupervisorInvitation.rejected, (s, a: any) => {
        s.accepting = false;
        s.error = a.payload as string;
      });

    b.addCase(assignSupervisorToStudent.pending, (s) => {
      s.assigning = true;
    })
      .addCase(assignSupervisorToStudent.fulfilled, (s) => {
        s.assigning = false;
        s.success = "Supervisor assigned";
      })
      .addCase(assignSupervisorToStudent.rejected, (s, a: any) => {
        s.assigning = false;
        s.error = a.payload as string;
      });
  },
});

export const { clearIndustrialMessages } = slice.actions;
export default slice.reducer;

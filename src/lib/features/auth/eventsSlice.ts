
// @ts-nocheck
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import api from "@/lib/api"

export interface Event {
  id: string
  title: string
  description: string
  event_type: "Webinar" | "Conference" | "Workshop" | "Seminar" | "Meetup"
  event_mode: "Online" | "Physical" | "Hybrid"
  start_datetime: string
  end_datetime: string
  timezone: string
  location_address?: string
  online_meeting_url?: string
  meeting_id?: string
  meeting_password?: string
  cover_image_url?: string
  max_attendees?: number
  registration_deadline?: string
  is_free: boolean
  price_amount?: number
  status: "Upcoming" | "Ongoing" | "Completed" | "Cancelled"
  requires_approval: boolean
  created_at: string
  updated_at: string
  organizer: {
    id: string
    first_name: string
    last_name: string
    profile_picture_url?: string
    account_type: string
  }
  community?: {
    id: string
    name: string
    slug: string
  }
  attendees?: any[]
  agenda_items?: any[]
  linked_projects?: any[]
}

// NEW: Add interfaces for the new state properties
interface BulkActionProgress {
  processed: number
  total: number
  status: 'idle' | 'processing' | 'done'
}

interface EventStatistics {
  totalRegistrations: number
  statusCounts: {
    pending: number
    approved: number
    rejected: number
    attended: number
    waitlisted: number
  }
  approvalRate: number
  attendanceRate: number
  capacity: number | null
  registrationTimeline: Array<{ date: string; count: number }>
  recentActivity: Array<{
    user: string
    action: string
    timestamp: string
    status: string
  }>
}
interface EventsState {
  events: Event[]
  myEvents: Event[]
  communityEvents: Event[]
  adminEvents: Event[]
  currentEvent: Event | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  communityEventsPagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  adminEventsPagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  // ✅ FIX: Add the missing properties to the interface
  selectedEventForManagement: Event | null
  currentEventStatistics: EventStatistics | null
  bulkActionProgress: BulkActionProgress
}

const initialState: EventsState = {
  events: [],
  myEvents: [],
  communityEvents: [],
  adminEvents: [],
  currentEvent: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  communityEventsPagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  adminEventsPagination: { page: 1, limit: 1000, total: 0, totalPages: 0 },
  selectedEventForManagement: null,
  currentEventStatistics: null,
  bulkActionProgress: { processed: 0, total: 0, status: 'idle' }
}


export const createCommunityEvent = createAsyncThunk(
  "events/createCommunityEvent",
  async ({ communityId, eventData }: { communityId: string; eventData: FormData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/events/communities/${communityId}/events`, eventData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      return response.data.data.event
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create community event")
    }
  }
)

export const fetchCommunityEvents = createAsyncThunk(
  "events/fetchCommunityEvents",
  async (params: {
    communityId: string
    page?: number
    limit?: number
    status?: string
    event_type?: string
  }, { rejectWithValue }) => {
    try {
      const { communityId, ...queryParams } = params
      const queryString = new URLSearchParams()
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value) queryString.append(key, value.toString())
      })

      const response = await api.get(`/events/communities/${communityId}/events?${queryString.toString()}`)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to load community events")
    }
  }
)

export const createEvent = createAsyncThunk(
  "events/create",
  async (eventData: FormData, { rejectWithValue }) => {
    try {
      const response = await api.post("/events", eventData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      return response.data.data.event
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create event")
    }
  }
)

export const fetchEvents = createAsyncThunk(
  "events/fetchAll",
  async (params: {
    page?: number
    limit?: number
    search?: string
    event_type?: string
    status?: string
  } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString())
      })

      const response = await api.get(`/events?${queryParams.toString()}`)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch events")
    }
  }
)

export const updateEvent = createAsyncThunk(
  "events/update",
  async ({ id, eventData }: { id: string; eventData: FormData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/events/${id}`, eventData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return response.data.data.event;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update event");
    }
  }
);


export const unregisterFromEvent = createAsyncThunk(
  "events/unregister",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/events/${id}/register`);
      return { id, message: response.data.message };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to unregister");
    }
  }
);

export const fetchMyEvents = createAsyncThunk(
  "events/fetchMy",
  async (params: { type?: 'attending' | 'organizing'; page?: number } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await api.get(`/events/my-events?${queryParams.toString()}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch your events");
    }
  }
);

export const fetchEventById = createAsyncThunk(
  "events/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/events/${id}`);
      return response.data.data.event;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch event");
    }
  }
);

export const registerForEvent = createAsyncThunk(
  "events/register",
  async (
    payload: { 
      eventId: string; 
      attendeeData: {
        event_id: string;
        user_id: string;
        user_email: string;
        user_name: string;
        additional_notes?: string | null;
        dietary_requirements?: string | null;
        special_accommodations?: string | null;
      }
    }, 
    { rejectWithValue, getState }
  ) => {
    try {
      const { eventId, attendeeData } = payload;
      
      console.log("📡 [Redux Action] registerForEvent called");
      console.log("   Event ID:", eventId);
      console.log("   Attendee Data:", attendeeData);
      
      if (!attendeeData.event_id) {
        console.error("❌ [Redux Action] Event ID is missing in attendeeData");
        return rejectWithValue("Event ID is required");
      }
      
      if (!attendeeData.user_id) {
        console.error("❌ [Redux Action] User ID is missing in attendeeData");
        return rejectWithValue("User ID is required");
      }

      console.log("✅ [Redux Action] Request body validation passed");
      
      const state: any = getState();
      const token = state.auth?.token;
      
      console.log("📡 [Redux Action] Auth token exists:", !!token);
      console.log("📡 [Redux Action] Making POST request to:", `/events/${eventId}/register`);
      
      const requestBody = {
        event_id: attendeeData.event_id,
        user_id: attendeeData.user_id,
        user_email: attendeeData.user_email,
        user_name: attendeeData.user_name,
        additional_notes: attendeeData.additional_notes,
        dietary_requirements: attendeeData.dietary_requirements,
        special_accommodations: attendeeData.special_accommodations,
      };
      
      console.log("📡 [Redux Action] Request Body to Send:");
      console.log(JSON.stringify(requestBody, null, 2));
      
      const bodyKeys = Object.keys(requestBody).filter(key => 
        requestBody[key as keyof typeof requestBody] !== null && 
        requestBody[key as keyof typeof requestBody] !== undefined
      );
      
      if (bodyKeys.length === 0) {
        console.error("❌ [Redux Action] Request body is empty!");
        return rejectWithValue("Request body cannot be empty");
      }
      
      console.log("✅ [Redux Action] Request body has", bodyKeys.length, "valid fields:", bodyKeys);
      console.log("📡 [Redux Action] Sending request...");
      
      const response = await api.post(
        `/events/${eventId}/register`, 
        requestBody
      );
      
      console.log("✅ [Redux Action] Registration response received:");
      console.log("   Status:", response.status);
      console.log("   Data:", response.data);
      
      return { 
        id: eventId, 
        message: response.data.message,
        data: response.data.data 
      };
      
    } catch (error: any) {
      console.error("💥 [Redux Action] Registration error:");
      console.error("   Message:", error.message);
      console.error("   Response Status:", error.response?.status);
      console.error("   Response Data:", error.response?.data);
      console.error("   Full Error:", error);
      
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        "Failed to register for event"
      );
    }
  }
);

// ==================== NEW ADMIN ASYNC THUNKS ====================

/**
 * ✅ NEW: Fetch all events for admin management
 */
export const getAllEventsForAdmin = createAsyncThunk(
  "events/getAllForAdmin",
  async (params: {
    page?: number
    limit?: number
    search?: string
    event_type?: string
    status?: string
    event_mode?: string
  } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString())
      })

      const response = await api.get(`/events/admin/all?${queryParams.toString()}`)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch events for admin")
    }
  }
)

/**
 * ✅ NEW: Activate or deactivate event (Admin only)
 */
export const activateDeactivateEvent = createAsyncThunk(
  "events/activateDeactivate",
  async (payload: {
    id: string
    status: "Upcoming" | "Cancelled"
    reason?: string
  }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/events/admin/${payload.id}/status`, {
        status: payload.status,
        reason: payload.reason
      })
      return { id: payload.id, status: payload.status, data: response.data.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update event status")
    }
  }
)

// Add this new thunk for permanent cancellation (admin only)
export const cancelEventPermanently = createAsyncThunk(
  "events/cancelPermanently",
  async (payload: {
    id: string
    reason: string
  }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/events/admin/${payload.id}/cancel`, {
        reason: payload.reason
      })
      return { id: payload.id, data: response.data.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to cancel event")
    }
  }
)

// Update the existing deleteEvent thunk to match backend behavior (soft delete)
export const deleteEvent = createAsyncThunk(
  "events/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/events/${id}`);
      return { id, message: response.data.message };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete event");
    }
  }
);


export const extendEventDate = createAsyncThunk(
  "events/extendDate",
  async (payload: {
    id: string
    start_datetime: Date
    end_datetime: Date
    reason: string
  }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/events/admin/${payload.id}/extend-date`, {
        start_datetime: payload.start_datetime,
        end_datetime: payload.end_datetime,
        reason: payload.reason
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to extend event date")
    }
  }
)

/**
 * Close Event
 */
export const closeEvent = createAsyncThunk(
  "events/close",
  async (payload: {
    id: string
    reason: string
    send_certificates: boolean
  }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/events/admin/${payload.id}/close`, {
        reason: payload.reason,
        send_certificates: payload.send_certificates
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to close event")
    }
  }
)

/**
 * Postpone Event
 */
export const postponeEvent = createAsyncThunk(
  "events/postpone",
  async (payload: {
    id: string
    new_start_datetime: Date
    new_end_datetime: Date
    reason: string
  }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/events/admin/${payload.id}/postpone`, {
        new_start_datetime: payload.new_start_datetime,
        new_end_datetime: payload.new_end_datetime,
        reason: payload.reason
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to postpone event")
    }
  }
)

/**
 * Transfer Event Ownership
 */
export const transferEventOwnership = createAsyncThunk(
  "events/transferOwnership",
  async (payload: {
    id: string
    new_organizer_id: string
    reason: string
  }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/events/admin/${payload.id}/transfer-ownership`, {
        new_organizer_id: payload.new_organizer_id,
        reason: payload.reason
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to transfer event ownership")
    }
  }
)

/**
 * Bulk Attendee Action
 */
export const bulkAttendeeAction = createAsyncThunk(
  "events/bulkAttendeeAction",
  async (payload: {
    eventId: string
    user_ids: string[]
    action: "approve" | "reject"
    reason?: string
  }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/events/${payload.eventId}/attendees/bulk-action`, {
        user_ids: payload.user_ids,
        action: payload.action,
        reason: payload.reason
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to process bulk action")
    }
  }
)

/**
 * Fetch Event Statistics
 */
export const fetchEventStatistics = createAsyncThunk(
  "events/fetchStatistics",
  async (payload: { id: string }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/events/${payload.id}/statistics`)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch event statistics")
    }
  }
)

/**
 * Duplicate Event
 */
export const duplicateEvent = createAsyncThunk(
  "events/duplicate",
  async (payload: {
    id: string
    new_title: string
    new_start_datetime: Date
    new_end_datetime: Date
  }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/events/${payload.id}/duplicate`, {
        new_title: payload.new_title,
        new_start_datetime: payload.new_start_datetime,
        new_end_datetime: payload.new_end_datetime
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to duplicate event")
    }
  }
)
const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    clearEventsError: (state) => {
      state.error = null
    },
    clearCurrentEvent: (state) => {
      state.currentEvent = null
    },
    // ✅ FIX: Add proper typing for the new reducers
    setSelectedEventForManagement: (state, action: PayloadAction<Event | null>) => {
      state.selectedEventForManagement = action.payload
    },
    clearEventStatistics: (state) => {
      state.currentEventStatistics = null
    },
    updateBulkActionProgress: (state, action: PayloadAction<Partial<BulkActionProgress>>) => {
      state.bulkActionProgress = { ...state.bulkActionProgress, ...action.payload }
    }
  },
  extraReducers: (builder) => {
    builder
      // ==================== ORIGINAL CASES (100% MAINTAINED) ====================
      
      // Create Event
      .addCase(createEvent.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.isSubmitting = false
        state.myEvents.unshift(action.payload)
        state.currentEvent = action.payload
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })

      // Fetch All Events
      .addCase(fetchEvents.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.isLoading = false
        state.events = action.payload.events
        state.pagination = action.payload.pagination
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Fetch Event by ID
      .addCase(fetchEventById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentEvent = action.payload
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Fetch My Events
      .addCase(fetchMyEvents.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMyEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myEvents = action.payload.events;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMyEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Register for Event
      .addCase(registerForEvent.pending, (state) => {
        state.isSubmitting = true
      })
      .addCase(registerForEvent.fulfilled, (state, action) => {
        state.isSubmitting = false
        if (state.currentEvent?.id === action.payload.id) {
          state.currentEvent.attendees = [...(state.currentEvent.attendees || []), {}]
        }
      })
      .addCase(registerForEvent.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })

      // Unregister from Event
      .addCase(unregisterFromEvent.pending, (state) => {
        state.isSubmitting = true
      })
      .addCase(unregisterFromEvent.fulfilled, (state, action) => {
        state.isSubmitting = false
        state.myEvents = state.myEvents.filter(e => e.id !== action.payload.id)
      })
      .addCase(unregisterFromEvent.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })

      // Update Event
      .addCase(updateEvent.fulfilled, (state, action) => {
        const index = state.events.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
        const myIndex = state.myEvents.findIndex(e => e.id === action.payload.id);
        if (myIndex !== -1) {
          state.myEvents[myIndex] = action.payload;
        }
        state.currentEvent = action.payload;
      })

      
      // Create Community Event
      .addCase(createCommunityEvent.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(createCommunityEvent.fulfilled, (state, action) => {
        state.isSubmitting = false
        state.communityEvents.unshift(action.payload)
        state.currentEvent = action.payload
      })
      .addCase(createCommunityEvent.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })

      // Fetch Community Events
      .addCase(fetchCommunityEvents.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCommunityEvents.fulfilled, (state, action) => {
        state.isLoading = false
        state.communityEvents = action.payload.events
        state.communityEventsPagination = action.payload.pagination
      })
      .addCase(fetchCommunityEvents.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // ==================== NEW ADMIN CASES ====================

      // Fetch All Events for Admin
      .addCase(getAllEventsForAdmin.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getAllEventsForAdmin.fulfilled, (state, action) => {
        state.isLoading = false
        state.adminEvents = action.payload.events
        state.adminEventsPagination = action.payload.pagination
      })
      .addCase(getAllEventsForAdmin.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Activate/Deactivate Event
      .addCase(activateDeactivateEvent.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(activateDeactivateEvent.fulfilled, (state, action) => {
        state.isSubmitting = false
        // Update in adminEvents array
        const adminIndex = state.adminEvents.findIndex(e => e.id === action.payload.id)
        if (adminIndex !== -1) {
          state.adminEvents[adminIndex].status = action.payload.status as any
        }
        // Update in events array if present
        const allIndex = state.events.findIndex(e => e.id === action.payload.id)
        if (allIndex !== -1) {
          state.events[allIndex].status = action.payload.status as any
        }
        // Update in myEvents array if present
        const myIndex = state.myEvents.findIndex(e => e.id === action.payload.id)
        if (myIndex !== -1) {
          state.myEvents[myIndex].status = action.payload.status as any
        }
        // Update in communityEvents array if present
        const communityIndex = state.communityEvents.findIndex(e => e.id === action.payload.id)
        if (communityIndex !== -1) {
          state.communityEvents[communityIndex].status = action.payload.status as any
        }
      })
      .addCase(activateDeactivateEvent.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })

      // Cancel Event Permanently
      .addCase(cancelEventPermanently.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(cancelEventPermanently.fulfilled, (state, action) => {
        state.isSubmitting = false
        // Update status to Cancelled in all arrays
        const adminIndex = state.adminEvents.findIndex(e => e.id === action.payload.id)
        if (adminIndex !== -1) {
          state.adminEvents[adminIndex].status = "Cancelled"
        }
        const allIndex = state.events.findIndex(e => e.id === action.payload.id)
        if (allIndex !== -1) {
          state.events[allIndex].status = "Cancelled"
        }
        const myIndex = state.myEvents.findIndex(e => e.id === action.payload.id)
        if (myIndex !== -1) {
          state.myEvents[myIndex].status = "Cancelled"
        }
        const communityIndex = state.communityEvents.findIndex(e => e.id === action.payload.id)
        if (communityIndex !== -1) {
          state.communityEvents[communityIndex].status = "Cancelled"
        }
      })
      .addCase(cancelEventPermanently.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })

      .addCase(extendEventDate.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(extendEventDate.fulfilled, (state, action) => {
        state.isSubmitting = false
        // Update event in adminEvents array
        const index = state.adminEvents.findIndex(e => e.id === action.payload.event.id)
        if (index !== -1) {
          state.adminEvents[index] = action.payload.event
        }
      })
      .addCase(extendEventDate.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })

      // Close Event
      .addCase(closeEvent.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(closeEvent.fulfilled, (state, action) => {
        state.isSubmitting = false
        // Update event status in all arrays
        const updateEventInArray = (array: Event[]) => {
          const index = array.findIndex(e => e.id === action.payload.event.id)
          if (index !== -1) {
            array[index].status = "Completed" as any
          }
        }
        updateEventInArray(state.adminEvents)
        updateEventInArray(state.events)
        updateEventInArray(state.myEvents)
        updateEventInArray(state.communityEvents)
      })
      .addCase(closeEvent.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })

      // Postpone Event
      .addCase(postponeEvent.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(postponeEvent.fulfilled, (state, action) => {
        state.isSubmitting = false
        // Update event dates in adminEvents array
        const index = state.adminEvents.findIndex(e => e.id === action.payload.event.id)
        if (index !== -1) {
          state.adminEvents[index] = action.payload.event
        }
      })
      .addCase(postponeEvent.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })

      // Transfer Ownership
      .addCase(transferEventOwnership.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(transferEventOwnership.fulfilled, (state, action) => {
        state.isSubmitting = false
        // Update organizer in adminEvents array
        const index = state.adminEvents.findIndex(e => e.id === action.payload.event.id)
        if (index !== -1) {
          state.adminEvents[index].organizer = action.payload.event.organizer
        }
      })
      .addCase(transferEventOwnership.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })

      // Bulk Attendee Action
      .addCase(bulkAttendeeAction.pending, (state) => {
        state.bulkActionProgress.status = 'processing'
        state.error = null
      })
      .addCase(bulkAttendeeAction.fulfilled, (state, action) => {
        state.bulkActionProgress.status = 'done'
        state.bulkActionProgress.processed = action.payload.processed
        state.bulkActionProgress.total = action.payload.processed
      })
      .addCase(bulkAttendeeAction.rejected, (state, action) => {
        state.bulkActionProgress.status = 'idle'
        state.error = action.payload as string
      })

      // Fetch Event Statistics
      .addCase(fetchEventStatistics.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchEventStatistics.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentEventStatistics = action.payload.statistics
      })
      .addCase(fetchEventStatistics.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Duplicate Event
      .addCase(duplicateEvent.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(duplicateEvent.fulfilled, (state, action) => {
        state.isSubmitting = false
        // Add new event to adminEvents array
        state.adminEvents.unshift(action.payload.event)
      })
      .addCase(duplicateEvent.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })
      

.addCase(deleteEvent.pending, (state) => {
  state.isSubmitting = true
  state.error = null
})
.addCase(deleteEvent.fulfilled, (state, action) => {
  state.isSubmitting = false
  const updateEventStatus = (array: Event[]) => {
    const index = array.findIndex(e => e.id === action.payload.id)
    if (index !== -1) {
      array[index].status = "Cancelled"
    }
  }
  updateEventStatus(state.events)
  updateEventStatus(state.myEvents)
  updateEventStatus(state.adminEvents)
  updateEventStatus(state.communityEvents)
  
  if (state.currentEvent?.id === action.payload.id) {
    state.currentEvent.status = "Cancelled"
  }
})
.addCase(deleteEvent.rejected, (state, action) => {
  state.isSubmitting = false
  state.error = action.payload as string
})
  }
})

export const { 
  clearEventsError, 
  clearCurrentEvent,
  setSelectedEventForManagement,
  clearEventStatistics,
  updateBulkActionProgress
} = eventsSlice.actions

export default eventsSlice.reducer

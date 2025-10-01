import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "@/lib/api"

export interface QAThread {
  id: string
  title: string
  content: string
  tags: string[]
  category?: string
  is_answered: boolean
  view_count: number
  created_at: string
  updated_at: string
  answer_count: number
  asker: {
    id: string
    first_name: string
    last_name: string
    profile_picture_url?: string
    account_type: string
  }
  community?: {
    id: string
    name: string
  }
  best_answer?: QAAnswer
  answers?: QAAnswer[]
}

export interface QAAnswer {
  id: string
  content: string
  is_accepted: boolean
  upvotes_count: number
  created_at: string
  updated_at: string
  user_vote?: string
  answerer: {
    id: string
    first_name: string
    last_name: string
    profile_picture_url?: string
    account_type: string
  }
}

interface QAState {
  threads: QAThread[]
  currentThread: QAThread | null
  myQuestions: QAThread[]
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const initialState: QAState = {
  threads: [],
  currentThread: null,
  myQuestions: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
}

// Fetch all threads with filters
export const fetchQAThreads = createAsyncThunk(
  "qa/fetchThreads",
  async (params: {
    page?: number
    limit?: number
    search?: string
    category?: string
    tags?: string
    is_answered?: boolean
    community_id?: string
    sort?: string
  } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString())
        }
      })
      
      const response = await api.get(`/qa/threads?${queryParams.toString()}`)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch questions")
    }
  }
)

// Fetch single thread by ID
export const fetchThreadById = createAsyncThunk(
  "qa/fetchThreadById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/qa/threads/${id}`)
      return response.data.data.thread
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch question")
    }
  }
)

// Create new thread
export const createThread = createAsyncThunk(
  "qa/createThread",
  async (threadData: {
    title: string
    content: string
    tags?: string[]
    category?: string
    community_id?: string
  }, { rejectWithValue }) => {
    try {
      const response = await api.post("/qa/threads", threadData)
      return response.data.data.thread
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create question")
    }
  }
)

// Update thread
export const updateThread = createAsyncThunk(
  "qa/updateThread",
  async ({ id, data }: { 
    id: string
    data: {
      title?: string
      content?: string
      tags?: string[]
      category?: string
    }
  }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/qa/threads/${id}`, data)
      return response.data.data.thread
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update question")
    }
  }
)

// Delete thread
export const deleteThread = createAsyncThunk(
  "qa/deleteThread",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/qa/threads/${id}`)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete question")
    }
  }
)

// Fetch my questions
export const fetchMyQuestions = createAsyncThunk(
  "qa/fetchMyQuestions",
  async (params: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append("page", params.page.toString())
      if (params.limit) queryParams.append("limit", params.limit.toString())
      
      const response = await api.get(`/qa/my-questions?${queryParams.toString()}`)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch your questions")
    }
  }
)

// Post answer
export const postAnswer = createAsyncThunk(
  "qa/postAnswer",
  async ({ threadId, content }: { threadId: string; content: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/qa/threads/${threadId}/answers`, { content })
      return response.data.data.answer
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to post answer")
    }
  }
)

// Update answer
export const updateAnswer = createAsyncThunk(
  "qa/updateAnswer",
  async ({ id, content }: { id: string; content: string }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/qa/answers/${id}`, { content })
      return response.data.data.answer
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update answer")
    }
  }
)

// Delete answer
export const deleteAnswer = createAsyncThunk(
  "qa/deleteAnswer",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/qa/answers/${id}`)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete answer")
    }
  }
)

// Accept answer
export const acceptAnswer = createAsyncThunk(
  "qa/acceptAnswer",
  async (answerId: string, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/qa/answers/${answerId}/accept`)
      return response.data.data.answer
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to accept answer")
    }
  }
)

// Vote answer
export const voteAnswer = createAsyncThunk(
  "qa/voteAnswer",
  async ({ answerId, voteType }: { answerId: string; voteType: "UPVOTE" | "DOWNVOTE" }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/qa/answers/${answerId}/vote`, { vote_type: voteType })
      return { answerId, answer: response.data.data.answer }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to vote")
    }
  }
)

// Remove vote
export const removeVote = createAsyncThunk(
  "qa/removeVote",
  async (answerId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/qa/answers/${answerId}/vote`)
      return answerId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to remove vote")
    }
  }
)

const qaSlice = createSlice({
  name: "qa",
  initialState,
  reducers: {
    clearQAError: (state) => {
      state.error = null
    },
    clearCurrentThread: (state) => {
      state.currentThread = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch threads
      .addCase(fetchQAThreads.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchQAThreads.fulfilled, (state, action) => {
        state.isLoading = false
        state.threads = action.payload.threads
        state.pagination = action.payload.pagination
      })
      .addCase(fetchQAThreads.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Fetch thread by ID
      .addCase(fetchThreadById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchThreadById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentThread = action.payload
      })
      .addCase(fetchThreadById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Create thread
      .addCase(createThread.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(createThread.fulfilled, (state, action) => {
        state.isSubmitting = false
        state.threads.unshift(action.payload)
      })
      .addCase(createThread.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })

      // Update thread
      .addCase(updateThread.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(updateThread.fulfilled, (state, action) => {
        state.isSubmitting = false
        if (state.currentThread?.id === action.payload.id) {
          state.currentThread = { ...state.currentThread, ...action.payload }
        }
        const index = state.threads.findIndex(t => t.id === action.payload.id)
        if (index !== -1) {
          state.threads[index] = { ...state.threads[index], ...action.payload }
        }
      })
      .addCase(updateThread.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })

      // Delete thread
      .addCase(deleteThread.pending, (state) => {
        state.isSubmitting = true
      })
      .addCase(deleteThread.fulfilled, (state, action) => {
        state.isSubmitting = false
        state.threads = state.threads.filter(t => t.id !== action.payload)
        if (state.currentThread?.id === action.payload) {
          state.currentThread = null
        }
      })
      .addCase(deleteThread.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })

      // Fetch my questions
      .addCase(fetchMyQuestions.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMyQuestions.fulfilled, (state, action) => {
        state.isLoading = false
        state.myQuestions = action.payload.threads
        state.pagination = action.payload.pagination
      })
      .addCase(fetchMyQuestions.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Post answer
      .addCase(postAnswer.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(postAnswer.fulfilled, (state, action) => {
        state.isSubmitting = false
        if (state.currentThread) {
          if (!state.currentThread.answers) {
            state.currentThread.answers = []
          }
          state.currentThread.answers.push(action.payload)
          state.currentThread.answer_count = (state.currentThread.answer_count || 0) + 1
        }
      })
      .addCase(postAnswer.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })

      // Update answer
      .addCase(updateAnswer.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(updateAnswer.fulfilled, (state, action) => {
        state.isSubmitting = false
        if (state.currentThread?.answers) {
          const index = state.currentThread.answers.findIndex(a => a.id === action.payload.id)
          if (index !== -1) {
            state.currentThread.answers[index] = action.payload
          }
        }
      })
      .addCase(updateAnswer.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })

      // Delete answer
      .addCase(deleteAnswer.pending, (state) => {
        state.isSubmitting = true
      })
      .addCase(deleteAnswer.fulfilled, (state, action) => {
        state.isSubmitting = false
        if (state.currentThread?.answers) {
          state.currentThread.answers = state.currentThread.answers.filter(a => a.id !== action.payload)
          state.currentThread.answer_count = Math.max(0, (state.currentThread.answer_count || 0) - 1)
        }
      })
      .addCase(deleteAnswer.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })

      // Accept answer
      .addCase(acceptAnswer.pending, (state) => {
        state.isSubmitting = true
      })
      .addCase(acceptAnswer.fulfilled, (state, action) => {
        state.isSubmitting = false
        if (state.currentThread) {
          // Remove previous accepted answer
          if (state.currentThread.answers) {
            state.currentThread.answers = state.currentThread.answers.map(a => ({
              ...a,
              is_accepted: a.id === action.payload.id
            }))
          }
          state.currentThread.best_answer = action.payload
          state.currentThread.is_answered = true
        }
      })
      .addCase(acceptAnswer.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })

      // Vote answer
      .addCase(voteAnswer.pending, (state) => {
        state.isSubmitting = true
      })
      .addCase(voteAnswer.fulfilled, (state, action) => {
        state.isSubmitting = false
        if (state.currentThread?.answers) {
          const index = state.currentThread.answers.findIndex(a => a.id === action.payload.answerId)
          if (index !== -1) {
            state.currentThread.answers[index] = action.payload.answer
          }
        }
      })
      .addCase(voteAnswer.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })

      // Remove vote
      .addCase(removeVote.fulfilled, (state, action) => {
        if (state.currentThread?.answers) {
          const answer = state.currentThread.answers.find(a => a.id === action.payload)
          if (answer) {
            answer.user_vote = undefined
          }
        }
      })
  }
})

export const { clearQAError, clearCurrentThread } = qaSlice.actions
export default qaSlice.reducer
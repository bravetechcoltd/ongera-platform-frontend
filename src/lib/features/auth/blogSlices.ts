import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

export interface BlogAuthor {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture_url: string;
  bio: string;
  account_type: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image_url: string;
  status: "Draft" | "Published" | "Under Review" | "Archived";
  published_at: string;
  view_count: number;
  reading_time_minutes: number;
  category: string;
  created_at: string;
  updated_at: string;
  author: BlogAuthor;
  community?: {
    id: string;
    name: string;
  };
}

interface BlogState {
  blogs: BlogPost[];
  communityBlogs: BlogPost[];
  currentBlog: BlogPost | null;
  currentCommunityId: string | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  communityBlogsPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: BlogState = {
  blogs: [],
  communityBlogs: [],
  currentBlog: null,
  currentCommunityId: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  communityBlogsPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  }
};


// In your blogSlices.ts, add these thunks:

// ✅ Archive Blog
export const archiveBlog = createAsyncThunk(
  "blogs/archive",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/blogs/${id}/archive`);
      return response.data.data.blog;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to archive blog"
      );
    }
  }
);



// Update the deleteBlog thunk to handle confirmation:
export const deleteBlog = createAsyncThunk(
  "blogs/delete",
  async ({ id, confirm = false }: { id: string; confirm?: boolean }, { rejectWithValue }) => {
    try {
      if (!confirm) {
        throw new Error("Please confirm deletion");
      }
      await api.delete(`/blogs/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete blog"
      );
    }
  }
);

export const updateBlogStatus = createAsyncThunk(
  "blogs/updateStatus",
  async (params: {
    id: string;
    status: "Published" | "Draft" | "Under Review" | "Archived";
  }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/blogs/${params.id}/status`, {
        status: params.status
      });
      return response.data.data.blog;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update blog status"
      );
    }
  }
);

// ✅ Update Blog
export const updateBlog = createAsyncThunk(
  "blogs/update",
  async (params: {
    id: string;
    formData: FormData;
  }, { rejectWithValue }) => {
    try {
      const { id, formData } = params;
      const response = await api.put(`/blogs/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return response.data.data.blog;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update blog"
      );
    }
  }
);


export const createBlog = createAsyncThunk(
  "blogs/create",
  async (blogData: FormData, { rejectWithValue }) => {
    try {
      const response = await api.post("/blogs", blogData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return response.data.data.blog;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create blog");
    }
  }
);

export const fetchBlogs = createAsyncThunk(
  "blogs/fetchAll",
  async (params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
      
      const response = await api.get(`/blogs?${queryParams.toString()}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch blogs");
    }
  }
);

// ✅ NEW: Fetch blog by ID
export const fetchBlogById = createAsyncThunk(
  "blogs/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/blogs/${id}`);
      return response.data.data.blog;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch blog");
    }
  }
);

// ✅ NEW: Fetch community blogs
export const fetchCommunityBlogs = createAsyncThunk(
  "blogs/fetchCommunity",
  async (params: {
    communityId: string;
    page?: number;
    limit?: number;
    category?: string;
  }, { rejectWithValue }) => {
    try {
      const { communityId, ...queryParams } = params;
      const queryString = new URLSearchParams();
      
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value) queryString.append(key, value.toString());
      });
      
      const response = await api.get(
        `/blogs/communities/${communityId}?${queryString.toString()}`
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch community blogs"
      );
    }
  }
);

// ✅ NEW: Create community blog
export const createCommunityBlog = createAsyncThunk(
  "blogs/createCommunity",
  async (params: {
    communityId: string;
    formData: FormData;
  }, { rejectWithValue }) => {
    try {
      const { communityId, formData } = params;
      
      console.log("🚀 Creating community blog for:", communityId);
      
      const response = await api.post(
        `/blogs/communities/${communityId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      );
      
      return response.data.data.blog;
    } catch (error: any) {
      console.error("❌ Create community blog error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to create community blog"
      );
    }
  }
);

const blogSlice = createSlice({
  name: "blogs",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentBlog: (state) => {
      state.currentBlog = null;
    },
    clearCommunityBlogs: (state) => {
      state.communityBlogs = [];
      state.currentCommunityId = null;
    },
    setCurrentCommunityId: (state, action) => {
      state.currentCommunityId = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Blog
      .addCase(createBlog.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.blogs.unshift(action.payload);
        state.currentBlog = action.payload;
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })
      
      // Fetch Blogs
      .addCase(fetchBlogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.blogs = action.payload.blogs;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Blog By ID
      .addCase(fetchBlogById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBlogById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBlog = action.payload;
      })
      .addCase(fetchBlogById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Community Blogs
      .addCase(fetchCommunityBlogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCommunityBlogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.communityBlogs = action.payload.blogs;
        state.communityBlogsPagination = action.payload.pagination;
        state.currentCommunityId = action.meta.arg.communityId;
      })
      .addCase(fetchCommunityBlogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create Community Blog
      .addCase(createCommunityBlog.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createCommunityBlog.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.communityBlogs.unshift(action.payload);
        state.currentBlog = action.payload;
        
        if (state.communityBlogsPagination) {
          state.communityBlogsPagination.total += 1;
        }
      })
      .addCase(createCommunityBlog.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })
      .addCase(updateBlogStatus.pending, (state) => {
  state.isSubmitting = true;
  state.error = null;
})
.addCase(updateBlogStatus.fulfilled, (state, action) => {
  state.isSubmitting = false;
  const index = state.blogs.findIndex(b => b.id === action.payload.id);
  if (index !== -1) {
    state.blogs[index] = action.payload;
  }
  if (state.currentBlog?.id === action.payload.id) {
    state.currentBlog = action.payload;
  }
})
.addCase(updateBlogStatus.rejected, (state, action) => {
  state.isSubmitting = false;
  state.error = action.payload as string;
})

// Update Blog
.addCase(updateBlog.pending, (state) => {
  state.isSubmitting = true;
  state.error = null;
})
.addCase(updateBlog.fulfilled, (state, action) => {
  state.isSubmitting = false;
  const index = state.blogs.findIndex(b => b.id === action.payload.id);
  if (index !== -1) {
    state.blogs[index] = action.payload;
  }
  if (state.currentBlog?.id === action.payload.id) {
    state.currentBlog = action.payload;
  }
})
.addCase(updateBlog.rejected, (state, action) => {
  state.isSubmitting = false;
  state.error = action.payload as string;
})

// Delete Blog
.addCase(deleteBlog.pending, (state) => {
  state.isSubmitting = true;
  state.error = null;
})
.addCase(deleteBlog.fulfilled, (state, action) => {
  state.isSubmitting = false;
  state.blogs = state.blogs.filter(b => b.id !== action.payload);
  if (state.currentBlog?.id === action.payload) {
    state.currentBlog = null;
  }
})
.addCase(deleteBlog.rejected, (state, action) => {
  state.isSubmitting = false;
  state.error = action.payload as string;
})
// Add these cases to the extraReducers in blogSlice:
.addCase(archiveBlog.pending, (state) => {
  state.isSubmitting = true;
  state.error = null;
})
.addCase(archiveBlog.fulfilled, (state, action) => {
  state.isSubmitting = false;
  const index = state.blogs.findIndex(b => b.id === action.payload.id);
  if (index !== -1) {
    state.blogs[index] = action.payload;
  }
  if (state.currentBlog?.id === action.payload.id) {
    state.currentBlog = action.payload;
  }
})
.addCase(archiveBlog.rejected, (state, action) => {
  state.isSubmitting = false;
  state.error = action.payload as string;
})
  }
});

export const { 
  clearError, 
  clearCurrentBlog, 
  clearCommunityBlogs, 
  setCurrentCommunityId 
} = blogSlice.actions;

export default blogSlice.reducer;
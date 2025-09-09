import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { ApiResponse, PaginatedResponse } from '@/types/api';

interface Blog {
    _id: string;
    title: string;
    content: string;
    author: string;
    category: string;
    tags: string[];
    image: string;
    status: 'draft' | 'published';
    createdAt: string;
    updatedAt: string;
}

interface BlogContextType {
    blogs: Blog[];
    loading: boolean;
    error: string | null;
    fetchBlogs: () => Promise<void>;
    createBlog: (blogData: FormData) => Promise<void>;
    updateBlog: (id: string, blogData: FormData) => Promise<void>;
    deleteBlog: (id: string) => Promise<void>;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export function BlogProvider({ children }: { children: ReactNode }) {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchBlogs = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/blogs');
            setBlogs(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch blogs');
            toast({
                title: 'Error',
                description: 'Failed to fetch blog posts',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const createBlog = useCallback(async (blogData: FormData) => {
        try {
            setLoading(true);
            await api.post('/blogs', blogData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast({
                title: 'Success',
                description: 'Blog post created successfully',
            });
            await fetchBlogs();
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to create blog post',
                variant: 'destructive',
            });
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchBlogs, toast]);

    const updateBlog = useCallback(async (id: string, blogData: FormData) => {
        try {
            setLoading(true);
            await api.patch(`/blogs/${id}`, blogData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast({
                title: 'Success',
                description: 'Blog post updated successfully',
            });
            await fetchBlogs();
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to update blog post',
                variant: 'destructive',
            });
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchBlogs, toast]);

    const deleteBlog = useCallback(async (id: string) => {
        try {
            setLoading(true);
            await api.delete(`/blogs/${id}`);
            toast({
                title: 'Success',
                description: 'Blog post deleted successfully',
            });
            await fetchBlogs();
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to delete blog post',
                variant: 'destructive',
            });
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchBlogs, toast]);

    const value = {
        blogs,
        loading,
        error,
        fetchBlogs,
        createBlog,
        updateBlog,
        deleteBlog,
    };

    return (
        <BlogContext.Provider value={value}>
            {children}
        </BlogContext.Provider>
    );
}

export function useBlog() {
    const context = useContext(BlogContext);
    if (context === undefined) {
        throw new Error('useBlog must be used within a BlogProvider');
    }
    return context;
}

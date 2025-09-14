import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { api } from '@/lib/api';
import { Blog } from '@/types/blog';
import BlogForm from '@/components/BlogForm';
import { toast } from 'sonner';
import BlogsTable from '@/components/tables/BlogTable';

export default function BlogManagement() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteBlog, setDeleteBlog] = useState<Blog | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/blogs');
      setBlogs(response.data || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/blogs/${id}`);
      setBlogs(blogs.filter(blog => blog._id !== id));
      toast.success("Blog deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete blog");
    } finally {
      setDeleteBlog(null);
    }
  };

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes('') ||
    blog.author.toLowerCase().includes('') ||
    blog.category.toLowerCase().includes('')
  );

  console.log("blogs", filteredBlogs)
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
          <p className="text-muted-foreground">Manage blog posts across all your websites</p>
        </div>

        {/* Create Blog Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary-dark hover:to-primary">
              <Plus className="mr-2 h-4 w-4" />
              Create Blog Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <BlogForm onSuccess={() => { setIsCreateDialogOpen(false); fetchBlogs(); }} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Blogs Table */}
      <div className='h-full w-full'>
        <BlogsTable
          blogs={filteredBlogs}
          onEdit={(blog) => { setSelectedBlog(blog); setIsEditDialogOpen(true); }}
          onDelete={(blog) => setDeleteBlog(blog)} // triggers the alert dialog
        />
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedBlog && (
            <BlogForm
              blog={selectedBlog}
              onSuccess={() => { setIsEditDialogOpen(false); setSelectedBlog(null); fetchBlogs(); }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Card */}
      <AlertDialog open={!!deleteBlog} onOpenChange={() => setDeleteBlog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteBlog?.title}"? <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end gap-2">
            <AlertDialogCancel className="bg-gray-200 hover:bg-gray-300">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteBlog && handleDelete(deleteBlog._id)}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

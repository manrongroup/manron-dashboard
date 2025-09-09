import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { Blog } from '@/types/blog';
import BlogForm from '@/components/BlogForm';
import { toast } from 'sonner';
import BlogsTable from '@/components/tables/BlogTable';

interface BlogManagementProps { }

export default function BlogManagement({ }: BlogManagementProps) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/blogs');
      console.log("Fetched blogs:", response.data);
      setBlogs(response.data || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      await api.delete(`/blogs/${id}`);
      setBlogs(blogs.filter(blog => blog._id !== id));
      toast.success("Blog deleted successfully");
    } catch (error) {
      toast.error("Failed to delete blog");

    }
  };

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log("filteredblogs:", filteredBlogs)
  console.log("allblogs:", blogs)
  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'tech': return 'default';
      case 'real-estate': return 'secondary';
      case 'news': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
          <p className="text-muted-foreground">
            Manage blog posts across all your websites
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary-dark hover:to-primary">
              <Plus className="mr-2 h-4 w-4" />
              Create Blog Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <BlogForm
              onSuccess={() => {
                setIsCreateDialogOpen(false);
                fetchBlogs();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>


      <BlogsTable blogs={filteredBlogs} onEdit={(blog) => {
        setSelectedBlog(blog);
        setIsEditDialogOpen(true);
      }} onDelete={handleDelete} />


      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedBlog && (
            <BlogForm
              blog={selectedBlog}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setSelectedBlog(null);
                fetchBlogs();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
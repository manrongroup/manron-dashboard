import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Upload } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import { Blog } from '@/types';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const blogSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  content: z.string().min(1, 'Content is required'),
  author: z.string().min(1, 'Author is required'),
  publishDate: z.string().min(1, 'Publish date is required'),
  category: z.string().min(1, 'Category is required'),
  type: z.string().min(1, 'Type is required'),
  readTime: z.string().min(1, 'Read time is required'),
  featured: z.boolean(),
});

type BlogFormData = z.infer<typeof blogSchema>;

interface BlogFormProps {
  blog?: Blog;
  onSuccess: () => void;
}

const BlogForm: React.FC<BlogFormProps> = ({ blog, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>(blog?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<FileList | null>(null);

  const isEditing = !!blog;

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: blog?.title || '',
      excerpt: blog?.excerpt || '',
      content: blog?.content || '',
      author: blog?.author || '',
      publishDate: blog?.publishDate ? new Date(blog.publishDate).toISOString().split('T')[0] : '',
      category: blog?.category || '',
      type: blog?.type || '',
      readTime: blog?.readTime || '',
      featured: blog?.featured || false,
    },
  });

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = async (data: BlogFormData) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('excerpt', data.excerpt);
      formData.append('content', data.content);
      formData.append('author', data.author);
      formData.append('publishDate', data.publishDate);
      formData.append('category', data.category);
      formData.append('type', data.type);
      formData.append('readTime', data.readTime);
      formData.append('featured', data.featured.toString());
      
      // Add tags
      tags.forEach(tag => {
        formData.append('tags[]', tag);
      });

      // Add main image
      if (mainImage) {
        formData.append('image', mainImage);
      }

      // Add additional images
      if (additionalImages) {
        Array.from(additionalImages).forEach(file => {
          formData.append('images', file);
        });
      }

      let endpoint = '/blog';
      let method = 'post';
      
      if (isEditing) {
        endpoint = `/blogs/${blog._id}`;
        method = 'patch';
      }

      const response = await api[method](endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast({
        title: 'Success',
        description: `Blog ${isEditing ? 'updated' : 'created'} successfully`,
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error saving blog:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} blog`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
        </DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter blog title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter author name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="excerpt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Excerpt</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter blog excerpt" 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Write your blog content here..."
                    height="300px"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="tech">Tech</SelectItem>
                      <SelectItem value="real-estate">Real Estate</SelectItem>
                      <SelectItem value="news">News</SelectItem>
                      <SelectItem value="lifestyle">Lifestyle</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="readTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Read Time</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 5 min read" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="publishDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Publish Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Add a tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <div>
              <Label>Main Image</Label>
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setMainImage(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </div>
            </div>

            <div>
              <Label>Additional Images</Label>
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setAdditionalImages(e.target.files)}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/90"
                />
              </div>
            </div>
          </div>

          <FormField
            control={form.control}
            name="featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Featured Post</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Mark this post as featured to highlight it
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2">
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary-dark hover:to-primary"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Blog' : 'Create Blog'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default BlogForm;
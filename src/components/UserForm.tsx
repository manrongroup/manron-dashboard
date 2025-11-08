import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { User } from '@/types';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Schema for creating new users (password required)
const createUserSchema = z.object({
  fullname: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  telephone: z.string().optional(),
  role: z.enum(['superAdmin', 'admin', 'client']), // Only system roles
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Schema for updating users (no password field - backend only accepts: fullname, email, telephone, role)
const updateUserSchema = z.object({
  fullname: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  telephone: z.string().optional().or(z.literal('')),
  role: z.enum(['superAdmin', 'admin', 'client']), // Only system roles
  // Password is not included in update schema - backend doesn't accept it
});

type CreateUserFormData = z.infer<typeof createUserSchema>;
type UpdateUserFormData = z.infer<typeof updateUserSchema>;
type UserFormData = CreateUserFormData | UpdateUserFormData;

interface UserFormProps {
  user?: User; // should include id
  onSuccess: () => void;
}

export function UserForm({ user, onSuccess }: UserFormProps) {
  const { toast } = useToast();

  // Use the appropriate schema based on whether we're editing or creating
  const isEditMode = !!user;
  const schema = isEditMode ? updateUserSchema : createUserSchema;

  const form = useForm<UserFormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur', // Validate on blur for better UX
    reValidateMode: 'onChange', // Re-validate on change after first submit
    defaultValues: isEditMode ? {
      // Update mode - no password field
      fullname: user?.fullname || '',
      email: user?.email || '',
      telephone: user?.telephone || '',
      role: (user?.role as 'superAdmin' | 'admin' | 'client') || 'admin',
    } : {
      // Create mode - includes password
      fullname: '',
      email: '',
      telephone: '',
      role: 'admin',
      password: '',
    },
  });

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      // Update mode - no password field
      form.reset({
        fullname: user.fullname || '',
        email: user.email || '',
        telephone: user.telephone || '',
        role: (user.role as 'superAdmin' | 'admin' | 'client') || 'admin',
      } as UpdateUserFormData);
    } else {
      // Create mode - includes password
      form.reset({
        fullname: '',
        email: '',
        telephone: '',
        role: 'admin',
        password: '',
      } as CreateUserFormData);
    }
  }, [user?.id || user?._id, form]);

  const onSubmit = async (data: UserFormData) => {
    // Check for validation errors
    const hasErrors = Object.keys(form.formState.errors).length > 0;
    if (hasErrors) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the form errors before submitting',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (user && (user.id || user._id)) {
        // Update existing user - backend only accepts: fullname, email, telephone, role
        const userId = user.id || user._id;
        const submitData: { fullname: string; email: string; telephone?: string; role: string } = {
          fullname: data.fullname,
          email: data.email,
          role: data.role,
        };

        // Only include telephone if it has a value
        if (data.telephone && data.telephone.trim()) {
          submitData.telephone = data.telephone;
        }

        await api.put(`/users/update/${userId}`, submitData);
        toast({
          title: 'Success',
          description: 'User updated successfully',
        });
      } else {
        // Create new user - password is required
        const submitData: any = { ...data };

        if (!submitData.password || submitData.password.length < 6) {
          toast({
            title: 'Error',
            description: 'Password is required and must be at least 6 characters',
            variant: 'destructive',
          });
          return;
        }

        await api.post('/signup', submitData);
        toast({
          title: 'Success',
          description: 'User created successfully',
        });
      }
      onSuccess();
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || (user ? 'Failed to update user' : 'Failed to create user');
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="fullname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="telephone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telephone</FormLabel>
                <FormControl>
                  <Input placeholder="Enter telephone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="superAdmin">Super Admin</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {!user && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password * (Required for new users)</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter password (min 6 characters)"
                      {...field}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {user && (
            <div className="text-sm text-muted-foreground">
              Leave password empty to keep current password. To change password, use the reset password feature.
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            className="shadow-elegant hover:shadow-glow transition-all duration-300"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Saving...' : (user ? 'Update User' : 'Create User')}
          </Button>
        </div>
      </form>
    </Form>
  );
}

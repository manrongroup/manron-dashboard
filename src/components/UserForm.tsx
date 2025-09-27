import React from 'react';
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

const userSchema = z.object({
  fullname: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  telephone: z.string().optional(),
  role: z.enum(['superAdmin', 'admin', 'worker', 'user', 'client']),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: User; // should include id
  onSuccess: () => void;
}

export function UserForm({ user, onSuccess }: UserFormProps) {
  const { toast } = useToast();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullname: user?.fullname || '',
      email: user?.email || '',
      telephone: user?.telephone || '',
      role: user?.role || 'user',
      password: '',
    },
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      const submitData = { ...data };
      if (user && !submitData.password) {
        delete submitData.password; // don't overwrite existing password
      }

      if (user && user.id) {
        // Update existing user
        await api.put(`/users/update/${user.id}`, submitData);
        toast({
          title: 'Success',
          description: 'User updated successfully',
        });
      } else {
        // Create new user
        await api.post('/signup', submitData);
        toast({
          title: 'Success',
          description: 'User created successfully',
        });
      }
      onSuccess();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: user ? 'Failed to update user' : 'Failed to create user',
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {/* <SelectItem value="user">User</SelectItem>
                    <SelectItem value="worker">Worker</SelectItem> */}
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="superAdmin">Super Admin</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Password {user ? '(leave empty to keep current)' : ''}
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={user ? 'Enter new password' : 'Enter password'}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="submit" className="shadow-elegant hover:shadow-glow transition-all duration-300">
            {user ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

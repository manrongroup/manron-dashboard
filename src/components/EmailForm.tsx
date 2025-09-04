import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, FileText, Send } from 'lucide-react';
import RichTextEditor from '@/components/RichTextEditor';
import { EmailTemplate } from '@/types';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const emailTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  subject: z.string().min(1, 'Subject is required'),
  content: z.string().min(1, 'Content is required'),
  type: z.enum(['newsletter', 'promotion', 'notification']),
});

type EmailTemplateFormData = z.infer<typeof emailTemplateSchema>;

interface EmailFormProps {
  template?: EmailTemplate;
  onSubmit: () => void;
  onCancel: () => void;
}

export function EmailForm({ template, onSubmit, onCancel }: EmailFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EmailTemplateFormData>({
    resolver: zodResolver(emailTemplateSchema),
    defaultValues: template ? {
      name: template.name,
      subject: template.subject,
      content: template.content,
      type: template.type,
    } : {
      type: 'newsletter',
    },
  });

  const watchedType = watch('type');
  const watchedContent = watch('content');

  const onFormSubmit = async (data: EmailTemplateFormData) => {
    setLoading(true);
    try {
      if (template) {
        await api.patch(`/email-templates/${template._id}`, data);
        toast({
          title: 'Success',
          description: 'Email template updated successfully',
        });
      } else {
        await api.post('/email-templates', data);
        toast({
          title: 'Success',
          description: 'Email template created successfully',
        });
      }

      onSubmit();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save email template',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Template Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter template name"
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="type">Template Type</Label>
              <Select
                value={watchedType}
                onValueChange={(value: any) => setValue('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select template type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newsletter">Newsletter</SelectItem>
                  <SelectItem value="promotion">Promotion</SelectItem>
                  <SelectItem value="notification">Notification</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive mt-1">{errors.type.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                {...register('subject')}
                placeholder="Enter email subject"
              />
              {errors.subject && (
                <p className="text-sm text-destructive mt-1">{errors.subject.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Template Variables</Label>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Available variables you can use in your template:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><code>{'{{name}}'}</code> - Recipient's name</li>
                  <li><code>{'{{email}}'}</code> - Recipient's email</li>
                  <li><code>{'{{website}}'}</code> - Website name</li>
                  <li><code>{'{{unsubscribe_url}}'}</code> - Unsubscribe link</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 min-h-[200px]">
              <div className="mb-4">
                <p className="text-sm font-medium text-muted-foreground">Subject:</p>
                <p className="font-medium">{watch('subject') || 'No subject entered'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Content:</p>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: watchedContent || '<p class="text-muted-foreground">No content entered</p>' 
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Email Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="content">Template Content</Label>
            <div className="mt-2">
              <RichTextEditor
                value={watchedContent || ''}
                onChange={(value) => setValue('content', value)}
                placeholder="Enter your email template content here..."
              />
            </div>
            {errors.content && (
              <p className="text-sm text-destructive mt-1">{errors.content.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
        </Button>
      </div>
    </form>
  );
}
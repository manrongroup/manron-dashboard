import React, { forwardRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  theme?: 'snow' | 'bubble';
  height?: string;
}

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    ['clean']
  ],
};

const formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'align',
  'list', 'bullet', 'indent',
  'blockquote', 'code-block',
  'link', 'image', 'video'
];

const RichTextEditor = forwardRef<ReactQuill, RichTextEditorProps>(
  ({ 
    value, 
    onChange, 
    placeholder = 'Start writing...', 
    className,
    readOnly = false,
    theme = 'snow',
    height = '200px'
  }, ref) => {
    return (
      <div className={cn("rich-text-editor", className)}>
        <ReactQuill
          ref={ref}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          theme={theme}
          modules={modules}
          formats={formats}
          style={{
            height: height,
            marginBottom: '42px' // Account for toolbar height
          }}
        />
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
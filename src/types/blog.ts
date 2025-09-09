export interface Blog {
    _id: string;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    publishDate: string;
    category: string;
    tags: string[];
    type: string;
    readTime: string;
    featured: boolean;
    image: string;
    images?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface BlogFilters {
    type?: string;
    category?: string;
    tag?: string;
    author?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
}

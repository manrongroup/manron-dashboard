export interface Property {
    _id: string;
    code?: string;
    title: string;
    description: string;
    type: 'House' | 'Townhouse' | 'Apartment & Unit' | 'Villa' | 'Land' | 'Rural' | 'Acreage' | 'Block Of Units' | 'Retirement Living';
    saleMethod: 'Private treaty sale' | 'Auction' | 'Rent' | 'Sold';
    price: number;
    currency: string;
    paymentType: 'per_month' | 'one_time';
    bedrooms?: number;
    bathrooms?: number;
    carSpaces?: number;
    rooms?: number;
    landSize?: number;
    propertySize?: number;
    yearBuilt?: number;
    furnished?: boolean;
    petsConsidered?: boolean;
    location: string;
    city: string;
    country: string;
    latitude?: number;
    longitude?: number;
    features: string[];
    images: string[];
    isDeal?: boolean;
    dealExpires?: string;
    availableDate?: string;
    soldDate?: string;
    status: 'Available' | 'Under contract' | 'Sold' | 'Rented';
    agent: Agent;
    createdAt: string;
    updatedAt: string;
}

export interface Agent {
    _id?: string;
    name: string;
    phone: string;
    email: string;
    title?: string;
    experience?: number;
    description?: string;
    specializations?: string[];
    languages?: string[];
    serviceAreas?: string[];
    company?: string;
    licenseNumber?: string;
    photo?: string;
    rating?: number;
    totalReviews?: number;
    socialMedia?: {
        linkedin?: string;
        facebook?: string;
    };
}

export interface PropertyFilters {
    type?: string;
    location?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    furnished?: boolean;
    features?: string;
    saleMethod?: string;
    status?: string;
    minLandSize?: number;
    maxLandSize?: number;
    petsConsidered?: boolean;
    page?: number;
    limit?: number;
}

export interface PropertyInquiry {
    _id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    property: string | Property;
    status: 'New' | 'Responded' | 'Closed';
    response?: string;
    respondedBy?: string;
    createdAt: string;
    updatedAt: string;
}

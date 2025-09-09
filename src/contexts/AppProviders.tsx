import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { RealEstateProvider } from './RealEstateContext';
import { BlogProvider } from './BlogContext';
import { EmailProvider } from './EmailContext';
import { ContactProvider } from './ContactContext';

interface AppProvidersProps {
    children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
    return (
        <AuthProvider>
            <RealEstateProvider>
                <BlogProvider>
                    <EmailProvider>
                        <ContactProvider>
                            {children}
                        </ContactProvider>
                    </EmailProvider>
                </BlogProvider>
            </RealEstateProvider>
        </AuthProvider>
    );
}

import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { RealEstateProvider } from './RealEstateContext';
import { BlogProvider } from './BlogContext';
import { EmailProvider } from './EmailContext';
import { ContactProvider } from './ContactContext';
import { UsersProvider } from './UserContext';

interface AppProvidersProps {
    children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
    return (
        <AuthProvider>
            <UsersProvider>

                <RealEstateProvider>
                    <BlogProvider>
                        <EmailProvider>
                            <ContactProvider>
                                {children}
                            </ContactProvider>
                        </EmailProvider>
                    </BlogProvider>
                </RealEstateProvider>
            </UsersProvider>

        </AuthProvider>
    );
}

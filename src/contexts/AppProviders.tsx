import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { RealEstateProvider } from './RealEstateContext';
import { BlogProvider } from './BlogContext';
import { EmailProvider } from './EmailContext';
import { ContactProvider } from './ContactContext';
import { UsersProvider } from './UserContext';
import { AnalyticsProvider } from './AnalysisContext';

interface AppProvidersProps {
    children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
    return (
        <AuthProvider>
            <UsersProvider>
                <RealEstateProvider>
                    <BlogProvider>
                        <ContactProvider>
                            <EmailProvider>
                                <AnalyticsProvider>


                                    {children}
                                </AnalyticsProvider>

                            </EmailProvider>
                        </ContactProvider>
                    </BlogProvider>
                </RealEstateProvider>
            </UsersProvider>

         </AuthProvider>
    );
}

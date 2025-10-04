'use client';

import { Auth0Provider } from '@auth0/auth0-react';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

export function Auth0ProviderWrapper({ children }: { children: ReactNode }) {
    const router = useRouter();

    const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
    const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;

    // Log configuration (remove in production)
    console.log('Auth0 Configuration:', {
        domain,
        clientId,
        hasWindow: typeof window !== 'undefined',
        origin: typeof window !== 'undefined' ? window.location.origin : 'SSR'
    });

    if (!domain || !clientId) {
        console.error('Missing Auth0 configuration!');
        return <div>Auth0 configuration error. Check environment variables.</div>;
    }

    if (typeof window === 'undefined') {
        return <>{children}</>;
    }

    const redirectUri = `${window.location.origin}/callback`;

    return (
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            authorizationParams={{
                redirect_uri: redirectUri,
                // Remove audience parameter for now
            }}
            onRedirectCallback={(appState) => {
                console.log('Redirect callback triggered:', appState);
                router.push(appState?.returnTo || '/dashboard');
            }}
            cacheLocation="localstorage"
        >
            {children}
        </Auth0Provider>
    );
}
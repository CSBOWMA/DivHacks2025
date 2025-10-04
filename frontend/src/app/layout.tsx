import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import NavBar from '@/components/NavBar';
import { Auth0ProviderWrapper } from '@/context/Auth0ProviderWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Financial Analytics',
    description: 'Cutting-edge financial analytics tool',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <Auth0ProviderWrapper>
            <NavBar />
            <main>{children}</main>
        </Auth0ProviderWrapper>
        </body>
        </html>
    );
}
import type { Metadata } from 'next';
import './globals.css';
import QueryProvider from '@/components/providers/QueryProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: { default: 'Schedora', template: '%s | Schedora' },
  description: 'Professional scheduling platform. Share your availability and let people book time with you.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <QueryProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: { fontFamily: 'Inter, sans-serif', fontSize: '13px', borderRadius: '8px' },
                success: { iconTheme: { primary: '#059669', secondary: '#fff' } },
                error:   { iconTheme: { primary: '#DC2626', secondary: '#fff' } },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Spanish Flashcards - Learn Spanish with Spaced Repetition',
  description: 'A comprehensive Spanish language learning flashcard application with spaced repetition, progress tracking, and offline support.',
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Spanish Flashcards',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}

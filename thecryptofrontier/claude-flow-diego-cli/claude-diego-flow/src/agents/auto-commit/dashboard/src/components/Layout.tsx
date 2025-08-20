import { ReactNode } from 'react';
import Head from 'next/head';
import { Bot } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <Head>
        <title>Auto Commit Agent Dashboard</title>
        <meta name="description" content="Dashboard para monitoramento do Auto Commit Agent" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Bot className="h-8 w-8 text-primary-600 mr-3" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Auto Commit Agent
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  Dashboard v1.0.0
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-center text-sm text-gray-500">
              Powered by Diego Tools • {new Date().getFullYear()}
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
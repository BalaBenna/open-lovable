"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { supabaseBrowser as supabase } from '@/lib/supabase';
import LovableInterface from '@/components/LovableInterface';

export default function ProjectPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');

  const projectId = params.id as string;

  useEffect(() => {
    // Get query from URL parameters
    const urlQuery = searchParams.get('query');
    if (urlQuery) {
      setQuery(decodeURIComponent(urlQuery));
    }

    const checkAuthAndLoadProject = async () => {
      try {
        // Check authentication
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace('/landing');
          return;
        }

        // Load project data
        const response = await fetch(`/api/projects/load?projectId=${projectId}&includeConversations=true`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load project');
        }

        const data = await response.json();
        setProject(data.project);

        // If we have a query, start processing it
        if (urlQuery) {
          // TODO: Implement AI processing here
          console.log('Processing query:', decodeURIComponent(urlQuery));
        }

      } catch (error) {
        console.error('Error loading project:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      checkAuthAndLoadProject();
    }
  }, [projectId, searchParams, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The project you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Render the full builder interface, seeded with the initial query
  return (
    <LovableInterface projectId={projectId} initialPrompt={query} />
  );
}

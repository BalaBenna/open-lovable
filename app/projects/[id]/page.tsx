import React from 'react';
import LovableInterface from '@/components/LovableInterface';

export default function ProjectPage({ params }: { params: { id: string } }) {
  return (
    <div className="h-screen w-full flex">
      <LovableInterface key={params.id} projectId={params.id} />
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Lovable...</p>
      </div>
    </div>
  );
}


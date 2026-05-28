// app/dashboard/ide/[id]/page.tsx
import React from 'react';

interface Props {
  params: {
    id: string;
  };
}

export default function IdePage({ params }: Props) {
  const { id } = params;

  // Check for the specific ID
  if (id === 'cmppjb4p700017bnoooxv5cq2') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
        <div className="text-center">
          <span className="text-sm font-semibold tracking-wider text-sky-400 uppercase">
            Feature Preview
          </span>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Coming Soon
          </h1>
          <p className="mt-4 text-base text-slate-400 max-w-md mx-auto">
            The IDE environment for this workspace is currently being prepared. Check back shortly!
          </p>
        </div>
      </div>
    );
  }

  // Fallback / Active IDE for other IDs
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Comming Soon Mate!!</h1>
      {/* Your actual IDE components go here */}
    </div>
  );
}
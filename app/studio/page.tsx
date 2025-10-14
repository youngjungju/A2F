'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudioPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page
    router.replace('/');
  }, [router]);

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-black text-white">
      <p>Redirecting to home...</p>
    </div>
  );
}

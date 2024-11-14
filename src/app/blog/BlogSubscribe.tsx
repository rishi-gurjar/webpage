'use client'

import { useState } from 'react';
import { subscribeEmail } from '@/lib/actions';

export function BlogSubscribe() {
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  async function handleSubmit(formData: FormData) {
    setStatus({ type: null, message: '' });
    
    const result = await subscribeEmail(formData);
    
    if (result.error) {
      setStatus({ type: 'error', message: result.error });
    } else {
      setStatus({ type: 'success', message: 'Successfully subscribed!' });
      (document.getElementById('email-form') as HTMLFormElement).reset();
    }
  }

  return (
    <div className="w-full max-w-md mb-8 p-4 border border-gray-200 rounded-lg">
      <h2 className="text-lg mb-2">Subscribe for updates</h2>
      <form id="email-form" action={handleSubmit} className="flex flex-col gap-2">
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          required
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Subscribe
        </button>
        {status.type && (
          <p className={`mt-2 text-sm ${
            status.type === 'success' ? 'text-green-600' : 'text-red-600'
          }`}>
            {status.message}
          </p>
        )}
      </form>
    </div>
  );
} 
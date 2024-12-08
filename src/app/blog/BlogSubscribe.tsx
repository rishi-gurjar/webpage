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
      setStatus({ type: 'error', message: 'Rishi\'s computer is off :(' });
    } else {
      setStatus({ type: 'success', message: 'Successfully subscribed!' });
      (document.getElementById('email-form') as HTMLFormElement).reset();
    }
  }

  return (
    <div className="w-full max-w-sm mb-4 p-3 border border-gray-200 rounded-lg">
      <h2 className="text-base mb-2">Join my very exclusive mailing list of 2 people</h2>
      <form id="email-form" action={handleSubmit} className="flex flex-col gap-1.5">
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          required
          className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          Subscribe
        </button>
        {status.type && (
          <p className={`mt-1.5 text-xs ${
            status.type === 'success' ? 'text-green-600' : 'text-red-600'
          }`}>
            {status.message}
          </p>
        )}
      </form>
    </div>
  );
}
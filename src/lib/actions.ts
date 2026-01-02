'use client'

const API_URL = process.env.NODE_ENV === 'production'
    ? 'https://0cd56de0fdd8.ngrok-free.app'
    : 'http://localhost:3001';

export async function trackPageView(path: string) {
    try {
        await fetch(`${API_URL}/api/track`, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: path
        });
    } catch (error) {
        // Silently fail tracking
    }
}

export async function subscribeEmail(formData: FormData) {
    const email = formData.get('email') as string;

    if (!email || !email.includes('@')) {
        return { error: 'Please provide a valid email address' };
    }

    try {
        const response = await fetch(`${API_URL}/api/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
                'skip_zrok_interstitial': 'true',
            },
            body: email
        });

        return { success: true };
    } catch (error) {
        return { error: 'Failed to subscribe. Please try again later.' };
    }
} 
'use client'

const API_URL = process.env.NODE_ENV === 'production'
    ? 'https://wrctkehcvd0y.share.zrok.io'
    : 'http://localhost:3001';

export async function trackPageView(path: string) {
    try {
        const response = await fetch(`${API_URL}/api/track?page=${path}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error tracking page view:', error);
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
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors',
            body: JSON.stringify({ email })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to subscribe');
        }

        const data = await response.json();
        return { success: true };
    } catch (error) {
        console.error('Error saving to Google Sheets:', error);
        return { error: 'Failed to subscribe. Please try again later.' };
    }
} 
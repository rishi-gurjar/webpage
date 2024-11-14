'use client'

const API_URL = process.env.NODE_ENV === 'production'
    ? 'https://wp7tdwguie65.share.zrok.io'
    : 'http://localhost:3001';

console.log('API_URL:', API_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

export async function trackPageView(path: string) {
    try {
        console.log(`Tracking page view: ${path}`);
        console.log(`Sending request to: ${API_URL}/api/track?page=${path}`);

        const response = await fetch(`${API_URL}/api/track?page=${path}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            mode: 'cors'
        });

        console.log('Track response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error tracking page view:', error);
    }
}

export async function subscribeEmail(formData: FormData) {
    const email = formData.get('email') as string;
    console.log(`Attempting to subscribe email: ${email}`);

    if (!email || !email.includes('@')) {
        console.log('Invalid email format');
        return { error: 'Please provide a valid email address' };
    }

    try {
        console.log(`Sending subscription request to: ${API_URL}/api/subscribe`);
        const response = await fetch(`${API_URL}/api/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            mode: 'cors',
            body: JSON.stringify({ email })
        });

        console.log('Subscribe response status:', response.status);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to subscribe');
        }

        const data = await response.json();
        console.log('Subscribe response data:', data);
        return { success: true };
    } catch (error) {
        console.error('Error saving to Google Sheets:', error);
        return { error: 'Failed to subscribe. Please try again later.' };
    }
} 
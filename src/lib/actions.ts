'use client'

const API_URL = process.env.NODE_ENV === 'production'
    ? 'https://5wh58pwpkqmg.share.zrok.io' // The zrok URL for production
    : 'http://localhost:3001'; // Local development

export async function trackPageView(path: string) {
    try {
        await fetch(`${API_URL}/api/track?page=${path}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
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
            },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error);
        }

        return { success: true };
    } catch (error) {
        console.error('Error saving to Google Sheets:', error);
        return { error: 'Failed to subscribe. Please try again later.' };
    }
} 
'use client'

const API_URL = process.env.NODE_ENV === 'production'
    ? 'https://9ivizlis6cv5.share.zrok.io'
    : 'http://localhost:3001';

console.log('API_URL:', API_URL);

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
            mode: 'no-cors',
            headers: {
                'Content-Type': 'text/plain'
            },
            body: email
        });

        console.log('Subscribe response status:', response.status);
        return { success: true };
    } catch (error) {
        console.error('Error saving to Google Sheets:', error);
        return { error: 'Failed to subscribe. Please try again later.' };
    }
} 
import { Resend } from 'resend';
import { sheets } from '../config';
import matter from 'gray-matter';
import fs from 'fs';
import path from 'path';
import { generateEmailMessage } from './llmService';
import { askForConfirmation } from '../watchers/blogWatcher';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function getSubscriberList(): Promise<string[]> {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SHEET_ID,
            range: 'A:A',
        });

        const values = response.data.values;
        if (!values) return ['rrg85@cornell.edu'];

        const emails = values
            .flat()
            .filter((email: string) => email && email.includes('@') && email !== 'Email')
            .filter((email: string, index: number, self: string[]) =>
                self.indexOf(email) === index
            );

        return emails;
    } catch (error) {
        console.error('Error fetching subscriber list:', error);
        return ['rrg85@cornell.edu'];
    }
}

export async function saveEmailToSheets(email: string): Promise<void> {
    // First increment the subscriber count in F1
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SHEET_ID,
        range: 'F1',
    });

    const currentValue = parseInt(response.data.values?.[0]?.[0] || '0');

    await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.SHEET_ID,
        range: 'F1',
        valueInputOption: 'RAW',
        requestBody: {
            values: [[currentValue + 1]],
        },
    });

    await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.SHEET_ID,
        range: 'A:B',
        valueInputOption: 'RAW',
        requestBody: {
            values: [[email, new Date().toISOString()]],
        },
    });
}

export async function sendEmails(filePath: string, skipConfirmation: boolean = false): Promise<void> {
    const subscribers = await getSubscriberList();
    console.log(`Found ${subscribers.length} subscribers\n`);

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    console.log("Generating email...")
    var emailMessage = await generateEmailMessage(fileContent);
    let approved = false;
        
    while (!approved) {
        console.log('\n=== Generated Email Message ===');
        console.log(emailMessage);
        console.log('=============================\n');

        const response = await askForConfirmation('Approve this message and deploy?', true);
        
        if (response === 'y' || response === 'yes') {
            approved = true;
        } else if (response === 'n' || response === 'no') {
            console.log('Email message not approved.');
            return;
        } else if (response === 'r') {
            console.log('\nRegenerating message...');
            if (filePath) {
                const fileContent = fs.readFileSync(filePath, 'utf-8');
                emailMessage = await generateEmailMessage(fileContent, true);
            }
            continue;
        } else {
            console.log('Invalid response. Please enter y, n, or r.');
            continue;
        }
    }


    const { data } = matter(fileContent);
    const postTitle = data.title || "New Blog Post";
    
    // Format the URL - replace spaces and special characters with hyphens
    const urlTitle = postTitle.toLowerCase().replace(/\s+/g, '-').replace(/[:']/g, '');

    for (const email of subscribers) {
        try {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting

            const { data, error } = await resend.emails.send({
                from: 'Rishi\'s Assistant Jarvis <jarvis@rishigurjar.com>',
                to: [email],
                subject: `Rishi\'s New Post, ${postTitle}`,
                html: `
                    <div style="font-family: Helvetica, sans-serif; max-width: 600px; margin: 0;">
                        <p style="color: #666; line-height: 1.5;">
                            Dear Beloved Subscriber,
                        </p>
                        <p style="color: #666; line-height: 1.5;">
                            ${emailMessage}
                        </p>
                        <p style="color: #666; line-height: 1.5;">
                            Head over to read <a href="https://rishigurjar.com/blog/${urlTitle}" style="color: #007bff; text-decoration: none;">"${postTitle}"</a> on Rishi's blog.
                        </p>
                        <hr style="border: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #999; font-size: 12px;">
                            You're receiving this because you subscribed to blog updates from rishigurjar.com.
                        </p>
                        <p style="color: #999; font-size: 12px;">
                            Ad astra per aspera,<br>
                            Jarvis
                        </p>
                    </div>
                `,
            });

            if (error) {
                console.error(`Email Error for ${email}:`, error);
                continue;
            }

            console.log(`Email sent successfully to ${email}`);
            await new Promise(resolve => setTimeout(resolve, 100));

        } catch (err) {
            console.error(`Server Error for ${email}:`, err);
        }
    }
} 
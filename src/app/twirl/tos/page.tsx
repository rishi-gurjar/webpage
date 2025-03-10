'use client'
import Link from "next/link";

export default function Page() {
  return (
    <div style={{ fontFamily: 'Helvetica Neue', padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ textAlign: 'left', marginBottom: '40px' }}>
      <Link href="/twirl" style={{ textDecoration: 'none' }}>
        <p style={{ fontSize: '2.5rem', color: '#7CBEF4', fontFamily: 'Baloo-Regular, sans-serif', display: 'inline' }}>TWIRL</p>
      </Link>
        <h1 style={{ fontSize: '2rem', marginBottom: '2px', display: 'inline', fontWeight: 'bold' }}> Terms of Service</h1>
        <p style={{ fontSize: '1rem', color: '#555' }}>Effective Date: March 9, 2025</p>
      </header>

      <main>
        <section style={{ marginBottom: '30px' }}>
          <p>
            These Terms of Service ("Terms") govern your use of the Twirl mobile application ("App") and the services provided by Twirl ("we", "us", "our"). By downloading, installing, or using the App, you agree to comply with and be bound by these Terms. Please read these Terms carefully before using the App.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>1. Subscription and Billing</h2>
          <p><strong>Free Trial:</strong> Twirl offers a 7-day free trial upon signing up for a subscription. During this period, you can access all features of the App without charge. After the trial period ends, you will be automatically enrolled in a recurring monthly subscription, unless you cancel before the trial expires.</p>
          <p><strong>Subscription Fee:</strong> After your free trial ends, your subscription will convert to a paid plan, and you will be charged a recurring fee of $7.99 per month. By subscribing to the service, you authorize us to charge the subscription fee to the payment method you provided.</p>
          <p><strong>Payment Method:</strong> You agree to provide a valid payment method (e.g., credit card, debit card, etc.) for the recurring monthly payments. If the payment method is declined or fails, you will be notified, and your access to the paid features of the App may be suspended until payment is successfully processed.</p>
          <p><strong>Automatic Renewal:</strong> Your subscription will automatically renew on a monthly basis at the current subscription rate unless you cancel before the end of the current billing cycle. You can manage or cancel your subscription at any time through your account settings in the App or by contacting customer support.</p>
          <p><strong>Refunds:</strong> We do not offer refunds for any paid subscription periods. However, you may cancel your subscription at any time to prevent further charges.</p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>2. Account Registration and Security</h2>
          <p>To access certain features of Twirl, you must create an account. You agree to provide accurate and complete information during the registration process and to keep your account details up to date. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>3. User Conduct</h2>
          <p>You agree not to:</p>
          <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
            <li>Upload or share any content that violates the rights of others, is illegal, or is offensive.</li>
            <li>Engage in any activity that could damage, disable, or impair the App's functionality.</li>
            <li>Use the App for any unlawful or fraudulent activities.</li>
          </ul>

          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>4. Intellectual Property</h2>
          <p>All content provided by Twirl, including the design, text, graphics, logos, and software, is the property of Twirl and is protected by intellectual property laws. You are granted a limited, non-exclusive, non-transferable license to use the App for personal, non-commercial purposes. You may not reproduce, distribute, or modify the content without prior written permission from us.</p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>5. AI Rating System and OpenAI GPT</h2>
          <p>Twirl utilizes OpenAI's GPT (Generative Pretrained Transformer) technology to generate outfit ratings based on the photos you upload. While we integrate OpenAI's GPT system, we are not responsible for how OpenAI processes or uses any data. OpenAI operates independently and has its own privacy and data usage policies.</p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>6. Termination</h2>
          <p>We may suspend or terminate your access to Twirl at any time, without notice, for any reason, including if we believe you have violated these Terms. You may cancel your subscription and stop using the App at any time by following the cancellation instructions in your account settings or contacting customer support.</p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>7. Limitation of Liability</h2>
          <p>To the fullest extent permitted by law, Twirl is not liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use or inability to use the App. We do not guarantee the accuracy or security of any data you provide to us or the performance of the AI rating system, and you use the App at your own risk.</p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>8. Privacy</h2>
          <p>Your use of Twirl is also governed by our Privacy Policy, which describes how we collect, use, and store your data. Please review the Privacy Policy to understand your rights and our practices regarding your personal information.</p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>9. Changes to Terms of Service</h2>
          <p>We reserve the right to modify, amend, or update these Terms at any time. If we make any material changes, we will notify you through the App. By continuing to use the App after such changes are posted, you agree to the updated Terms. If you do not agree with the new Terms, you must stop using the App. We encourage you to review these Terms periodically to stay informed of any changes.</p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>10. Governing Law</h2>
          <p>These Terms will be governed by and construed in accordance with the laws of California, without regard to its conflict of law principles.</p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>11. Contact Us</h2>
          <p>If you have any questions or concerns regarding these Terms or your use of Twirl, please contact us at <Link href="mailto:twirl.help@gmail.com" style={{ color: '#007AFF', textDecoration: 'underline' }}>twirl.help@gmail.com</Link>.</p>

          <p style={{ marginTop: '30px', fontStyle: 'italic' }}>By using Twirl, you acknowledge that you have read, understood, and agree to these Terms of Service.</p>
        </section>
      </main>
      <footer style={{ textAlign: 'center', marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px', fontSize: '0.9rem', color: '#777' }}>
        <p style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '10px' }}>
          &copy; {new Date().getFullYear()} Twirl 
          <Link href="/twirl" style={{ color: '#555', textDecoration: 'underline', marginLeft: '20px' }}>Home</Link>
          <Link href="/twirl/pp" style={{ color: '#555', textDecoration: 'underline', marginLeft: '20px' }}>Privacy Policy</Link>
        </p>
      </footer>
      <style jsx global>{`
        @font-face {
          font-family: 'Baloo-Regular';
          src: url('/Baloo-Regular.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
      `}</style>
    </div>
  );
}

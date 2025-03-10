'use client'
import Link from "next/link";

export default function Page() {
  return (
    <div style={{ fontFamily: 'Helvetica Neue', padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ textAlign: 'left', marginBottom: '40px' }}>
        <Link href="/twirl" style={{ textDecoration: 'none' }}>
          <p style={{ fontSize: '2.5rem', color: '#7CBEF4', fontFamily: 'Baloo-Regular, sans-serif', display: 'inline' }}>TWIRL</p>
        </Link>
        <h1 style={{ fontSize: '2rem', marginBottom: '2px', display: 'inline', fontWeight: 'bold' }}> Privacy Policy</h1>
        <p style={{ fontSize: '1rem', color: '#555' }}>Effective Date: March 9, 2025</p>
      </header>

      <main>
        <section style={{ marginBottom: '30px' }}>
          <p>
            At Twirl (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;), we value your privacy and are committed to protecting your personal data in compliance with applicable privacy laws. This Privacy Policy explains how we collect, use, store, and protect the information you provide when using our mobile application (&quot;App&quot;). By accessing or using Twirl, you agree to the collection and use of information in accordance with this policy.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>1. Information We Collect</h2>
          <p>We collect the following types of information from users of Twirl:</p>
          <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
            <li><strong>Photos:</strong> We collect photos of outfits that you upload within the App. These photos are stored in a library that you can view at any time.</li>
            <li><strong>Personal Information:</strong> We may collect basic personal information such as your name, email address, and other information you provide for account setup or communication purposes.</li>
            <li><strong>Usage Data:</strong> We automatically collect data regarding your interaction with the App, including your device type, operating system, and usage patterns.</li>
          </ul>

          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>2. Use of Your Information</h2>
          <p>We use the collected information for the following purposes:</p>
          <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
            <li>To provide and enhance the functionality of the App, including AI-based ratings of your outfits.</li>
            <li>To store your photos securely in your personal library for easy access.</li>
            <li>To analyze usage data to improve the App&apos;s features and performance.</li>
            <li>To communicate with you about updates or changes to the App.</li>
          </ul>

          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>3. AI Rating System Powered by OpenAI GPT</h2>
          <p>
            Twirl uses OpenAI&apos;s GPT (Generative Pretrained Transformer) technology to generate outfit ratings based on the photos you upload. The AI provides ratings in five subcategories and a main overall score for your outfits. While we integrate OpenAI&apos;s GPT technology into our system, we are not responsible for how GPT processes or uses any data. OpenAI, as the provider of the GPT system, manages all aspects of its functionality and data handling. We encourage you to review OpenAI&apos;s Privacy Policy to understand how they use and process data.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>4. Storage of Photos</h2>
          <p>
            Your photos are securely stored within Twirl and are accessible only by you. We do not share your photos with third parties unless required by law or with your explicit consent.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>5. Data Security</h2>
          <p>
            We implement reasonable security measures to protect the data you provide, including encryption and secure storage. However, please note that no security system is 100% secure, and we cannot guarantee the complete security of your data. You use the App at your own risk.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>6. Data Retention</h2>
          <p>
            We will retain your personal data, including photos, for as long as your account is active or as needed to provide services to you. If you choose to delete your account, we will remove your data from our system, except where retention is required for legal or operational purposes.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
            <li>Access and update your personal information.</li>
            <li>Request the deletion of your account and associated data.</li>
            <li>Opt-out of promotional communications.</li>
          </ul>
          <p>To exercise these rights, please contact us at <Link href="mailto:twirl.help@gmail.com" style={{ color: '#007AFF', textDecoration: 'underline' }}>twirl.help@gmail.com</Link>.</p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>8. Third-Party Services</h2>
          <p>
            Twirl may contain links or references to third-party services that are not operated by us. We are not responsible for the privacy practices or content of these external sites and services. We encourage you to review their privacy policies before providing any personal data.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>9. Limitation of Liability</h2>
          <p>
            By using Twirl, you agree that we shall not be held liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from your use of the App or the information you provide. While we make efforts to protect your information, we do not guarantee the security or accuracy of your data, and you acknowledge that any transmission of data is at your own risk.
          </p>
          <p>
            Additionally, we are not responsible for any data handling or processing performed by OpenAI&apos;s GPT technology. OpenAI operates independently, and we have no control over their data usage practices.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>10. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will be reflected by the updated date at the top of this page. We encourage you to review this policy periodically for any updates.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>11. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or your personal data, please contact us at <Link href="mailto:twirl.help@gmail.com" style={{ color: '#007AFF', textDecoration: 'underline' }}>twirl.help@gmail.com</Link>.
          </p>

          <p style={{ marginTop: '30px', fontStyle: 'italic' }}>
            By using Twirl, you consent to the collection and use of your information as described in this Privacy Policy.
          </p>
        </section>
      </main>

      <footer style={{ textAlign: 'center', marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px', fontSize: '0.9rem', color: '#777' }}>
        <p style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '10px' }}>
          &copy; {new Date().getFullYear()} Twirl 
          <Link href="/twirl" style={{ color: '#555', textDecoration: 'underline', marginLeft: '20px' }}>Home</Link>
          <Link href="/twirl/tos" style={{ color: '#555', textDecoration: 'underline', marginLeft: '20px' }}>Terms of Service</Link>
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

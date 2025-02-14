import Link from "next/link";

export default function Page() {
  return (
    <div style={{ fontFamily: 'Helvetica Neue', padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Nudge</h1>
        <p style={{ fontSize: '1.2rem', color: '#555' }}>
          An elegantly designed companion, inspired by thoughtful simplicity.
        </p>

        <p style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <Link href="/nudge/pp" style={{ color: '#555', textDecoration: 'underline' }}>Privacy Policy</Link>
          <Link href="/nudge/tos" style={{ color: '#555', textDecoration: 'underline' }}>Terms of Service</Link>
        </p>
      </header>

      <main>
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.75rem' }}>Concept</h2>
          <p>
            At Nudge, each new member is paired with a dedicated zookeeper—a guide devoted to nurturing your personal journey.
            Inspired by refined innovation and a commitment to clarity, our approach offers gentle, purposeful nudges to keep you centered on your goals.
          </p>
          <p>
            <strong>Free Version:</strong> Subtle push notifications.<br />
            <strong>Premium:</strong> Enhanced connectivity with deeper insights.
          </p>
          <p>
            Begin with a seamless onboarding experience that helps you craft your vision board and set a meaningful course.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.75rem' }}>Core Features</h2>
          <ol style={{ lineHeight: '1.6' }}>
            <li>
              <strong>Personalized Onboarding:</strong> Define your aspirations and create a vision board, with your zookeeper guiding each step.
            </li>
            <li style={{ marginTop: '10px' }}>
              <strong>Thoughtful Reminders:</strong> Receive carefully composed messages that gently prompt you to stay aligned with your path.
            </li>
            <li style={{ marginTop: '10px' }}>
              <strong>Enhanced Connection:</strong> Upgrade for a richer experience where your zookeeper provides continuous, nuanced support.
            </li>
          </ol>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.75rem' }}>Subscription Options</h2>
          <p>
            <strong>Free:</strong> Refined push notifications and a welcoming onboarding.<br />
            <strong>Premium ($4.99/month):</strong> Extended features with deeper insights.<br />
            <strong>Ultimate ($19.99/month):</strong> Full access to personalized, in-depth nudges that seamlessly integrate into your day.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.75rem' }}>Why Nudge Resonates</h2>
          <ul style={{ lineHeight: '1.6' }}>
            <li>Elegant design that inspires sharing and authentic connection.</li>
            <li>A personal touch that transforms everyday reminders into meaningful moments.</li>
            <li>A commitment to simplicity that redefines modern motivation.</li>
            <li>An intuitive experience where your zookeeper keeps your journey seamlessly integrated.</li>
          </ul>
        </section>
      </main>

      <footer style={{ textAlign: 'center', marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px', fontSize: '0.9rem', color: '#777' }}>
        <p>&copy; {new Date().getFullYear()} Nudge. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

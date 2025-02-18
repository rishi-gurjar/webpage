import Link from "next/link";
import DavidGoggins from "/public/david.png";
import Image from "next/image";
export default function Page() {
  return (
    <div style={{ fontFamily: 'Helvetica Neue', padding: '20px', maxWidth: '650px', margin: '0 auto' }}>
      <header style={{ textAlign: 'left', marginBottom: '40px' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2px', fontFamily: 'Londrina Solid'}}>Nudge</h1>
      <p style={{ fontSize: '1.2rem', color: 'black' }}>We turned David Goggins into AI.</p>
      </header>

      <main>
        <section style={{ marginBottom: '30px' }}>
          <p>
            Rohan wants to be shredded (who doesn&apos;t want abs?), but he has a problem. The mere sight of a cookie makes him forget his goal. So, Rohan and his friend Rishi made an app that reminds Rohan to lock in around meal time.
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: '20px', gap: '8px' }}>
            <Image 
              src={DavidGoggins} 
              alt="David Goggins"
              width={40} 
              height={40} 
              style={{ borderRadius: '50%' }}
            />
            <div style={{ 
              backgroundColor: '#007AFF',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '20px',
              maxWidth: '85%',
              fontSize: '15px',
            }}>
              You want a six-pack, motherf**ker? You better not eat cookies today.
            </div>
          </div>
          <p style={{ marginTop: '20px' }}>
            If David Goggins isn&apos;t your style, maybe Mother Teresa is. Your personalized AI coach—tuned to your motivations and goals—will send you custom <i>Nudges</i> when you need them most.
          </p>
          <p style={{ marginTop: '20px' }}>
            <Link href="#" style={{ color: '#000', textDecoration: 'underline' }}>Get Nudge here.</Link>
          </p>
        </section>
      </main>

      <footer style={{ textAlign: 'center', marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px', fontSize: '0.9rem', color: '#777' }}>

      <p style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '10px' }}>&copy; {new Date().getFullYear()} Nudge <Link href="/nudge/pp" style={{ color: '#555', textDecoration: 'underline', marginLeft: '20px' }}>Privacy Policy</Link><Link href="/nudge/tos" style={{ color: '#555', textDecoration: 'underline', marginLeft: '20px' }}>Terms of Service</Link></p>
      </footer>
    </div>
  );
}

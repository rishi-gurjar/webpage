import Link from 'next/link';

export function BeliefsList() {
  return (
    <section id="beliefs" className="w-full mb-6 p-3 border border-gray-200 rounded-lg">
      <h2 className="text-base font-mono mb-2 text-gray-500 text-sm">distilled</h2>
      <ul className="list-disc ml-5 space-y-2 text-gray-500 text-sm">
        <li className="leading-snug">
          Preserve and expand{' '}
          <Link href="/blog/minimum-self" className="underline hover:text-blue-700">conscious life</Link>
          ; increase human{' '}
          <Link href="/blog/maxfortune-minmisfortune" className="underline hover:text-blue-700">progress</Link>
          .
        </li>
        <li className="leading-snug">
          <Link href="/blog/agency" className="underline hover:text-blue-700">Agency</Link>{' '}and{' '}
          <Link href="/blog/speed" className="underline hover:text-blue-700">speed</Link>{' '}beat bureaucracy; concentrate accountable{' '}
          <Link href="/blog/moral-founder-mode" className="underline hover:text-blue-700">leadership</Link>
          .
        </li>
        <li className="leading-snug">
          We are entering a{' '}
          <Link href="/blog/application-layer-mass-genocide" className="underline hover:text-blue-700">post‑app</Link>
          ,{' '}
          <Link href="/blog/agentic-web" className="underline hover:text-blue-700">agentic web</Link>
          ; protocols/APIs endure.
        </li>
        <li className="leading-snug">
          Humans are{' '}
          <Link href="/blog/mechanistic-tissue" className="underline hover:text-blue-700">proto‑cyborgs</Link>
          ; BCIs and{' '}
          <Link href="/blog/synthetic-self" className="underline hover:text-blue-700">uploads</Link>{' '}
          are inevitable.
        </li>
        <li className="leading-snug">
          People trade{' '}
          <Link href="/blog/privacy-dissonance" className="underline hover:text-blue-700">privacy</Link>{' '}
          for utility; build for revealed preferences.
        </li>
        <li className="leading-snug">
          <Link href="/blog/free-will" className="underline hover:text-blue-700">Free will</Link>{' '}
          is mostly illusion; law maintains{' '}
          <Link href="/blog/the-interests-of-the-stronger" className="underline hover:text-blue-700">order</Link>
          , not cosmic justice.
        </li>
        <li className="leading-snug">
          <Link href="/blog/path-to-agricultural-omniscience" className="underline hover:text-blue-700">Agriculture</Link>{' '}
          is neglected leverage; build the farm OS and automate{' '}
          <Link href="/blog/notes-from-napa" className="underline hover:text-blue-700">labor</Link>
          .
        </li>
        <li className="leading-snug">
          Develop{' '}
          <Link href="/blog/paste-or-taste" className="underline hover:text-blue-700">taste</Link>{' '}
          via deep{' '}
          <Link href="/books" className=" hover:text-blue-700 hover:italic">exposure</Link>
          ; resist{' '}
          <Link href="/blog/mimesis" className="underline hover:text-blue-700">mimesis</Link>
          .
        </li>
        <li className="leading-snug">
          <Link href="/blog/just-to-be-rich" className="underline hover:text-blue-700">American dominance</Link>{' '}
          is instrumentally moral toward survival; extraordinary{' '}
          <Link href="/blog/constitutional-dictator" className="underline hover:text-blue-700">executive action</Link>{' '}
          can be justified when necessary.
        </li>
      </ul>
      <div className="mt-5" />
      <h2 className="text-base font-mono mb-2 text-gray-500 text-sm">gpt-5/claude-4-sonnet&apos;s favorites</h2>
      <ul className="list-disc ml-5 space-y-1 text-gray-500 text-sm">
        <li><Link href="/blog/minimum-self" className="underline hover:text-blue-700">Minimum Self</Link></li>
        <li><Link href="/blog/synthetic-self" className="underline hover:text-blue-700">Synthetic Self</Link></li>
        <li><Link href="/blog/constitutional-dictator" className="underline hover:text-blue-700">Constitutional Dictator</Link></li>
        <li><Link href="/blog/mechanistic-tissue" className="underline hover:text-blue-700">Mechanistic Tissue</Link></li>
        <li><Link href="/blog/agentic-web" className="underline hover:text-blue-700">Agentic Web</Link></li>
      </ul>
    </section>
  );
}

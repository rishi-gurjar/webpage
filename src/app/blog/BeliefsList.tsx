import Link from 'next/link';

export function BeliefsList() {
  return (
    <section id="beliefs" className="w-full mb-6 p-3 border border-gray-200 rounded-lg">
      <h2 className="font-mono mb-2 text-gray-500 text-sm">distilled</h2>
      <ul className="list-disc ml-5 space-y-2 text-gray-500 text-sm">
        <li className="leading-snug">
          Life matters. Keeping{' '}
          <Link href="/blog/focal-areas" className="underline hover:text-blue-700">it going</Link>{' '}
          (energy, intelligence, bio) matters most.
        </li>
        <li className="leading-snug">
          I don&apos;t believe in{' '}
          <Link href="/blog/free-will" className="underline hover:text-blue-700">free will</Link>
          .
        </li>
        <li className="leading-snug">
          People do what their{' '}
          <Link href="/blog/armada" className="underline hover:text-blue-700">environment</Link>{' '}
          rewards.
        </li>
        <li className="leading-snug">
          People mostly copy each other.{' '}
          <Link href="/blog/mimesis" className="underline hover:text-blue-700">Mimesis</Link>{' '}
          runs the world.
        </li>
        <li className="leading-snug">
          Everyone is way too{' '}
          <Link href="/blog/illinois-risk-aversion" className="underline hover:text-blue-700">risk‑averse</Link>
          . Take more{' '}
          <Link href="/blog/maxfortune-minmisfortune" className="underline hover:text-blue-700">risk</Link>
          .
        </li>
        <li className="leading-snug">
          <Link href="/blog/agency" className="underline hover:text-blue-700">Agency</Link>{' '}
          and{' '}
          <Link href="/blog/speed" className="underline hover:text-blue-700">speed</Link>{' '}
          beat committees.
        </li>
        <li className="leading-snug">
          In founders and leaders, power can need to be{' '}
          <Link href="/blog/moral-founder-mode" className="underline hover:text-blue-700">concentrated</Link>
          .
        </li>
        <li className="leading-snug">
          Big ideas don&apos;t matter without{' '}
          <Link href="/blog/big-brain-into-believing-anything" className="underline hover:text-blue-700">feedback</Link>
          .
        </li>
        <li className="leading-snug">
          <Link href="/blog/constitutional-dictator" className="underline hover:text-blue-700">Law</Link>{' '}
          is mostly noise without{' '}
          <Link href="/blog/armed-prophets" className="underline hover:text-blue-700">force</Link>
          . Systems route around constraints via{' '}
          <Link href="/blog/cornell-outsourced-sovereignty" className="underline hover:text-blue-700">proxies</Link>
          .
        </li>
        <li className="leading-snug">
          Most systems drift and invert their ideals over time{' '}
          <Link href="/blog/rhetoric-reality-inversion" className="underline hover:text-blue-700">anyway</Link>
          {' '}
          <Link href="/blog/inevitable-performativeness" className="underline hover:text-blue-700">(performativeness)</Link>
          .
        </li>
        <li className="leading-snug">
          The web is moving toward a{' '}
          <Link href="/blog/application-layer-mass-genocide" className="underline hover:text-blue-700">post‑app</Link>{' '}
          world. Agents and{' '}
          <Link href="/blog/agentic-web" className="underline hover:text-blue-700">APIs</Link>{' '}
          win.
        </li>
        <li className="leading-snug">
          Humans are already{' '}
          <Link href="/blog/mechanistic-tissue" className="underline hover:text-blue-700">cyborgs</Link>
          . Brain‑computer stuff and{' '}
          <Link href="/blog/synthetic-self" className="underline hover:text-blue-700">uploads</Link>{' '}
          will happen.
        </li>
        <li className="leading-snug">
          People trade{' '}
          <Link href="/blog/privacy-dissonance" className="underline hover:text-blue-700">privacy</Link>{' '}
          for convenience. Watch what they do, not what they say{' '}
          <Link href="/quotes" className="hover:italic hover:text-blue-700">here</Link>
          .
        </li>
        <li className="leading-snug">
          <Link href="/blog/path-to-agricultural-omniscience" className="underline hover:text-blue-700">Agriculture</Link>{' '}
          is huge leverage. Build the farm OS and automate{' '}
          <Link href="/blog/notes-from-napa" className="underline hover:text-blue-700">labor</Link>
          .
        </li>
        <li className="leading-snug">
          Get{' '}
          <Link href="/blog/paste-or-taste" className="underline hover:text-blue-700">taste</Link>{' '}
          by looking at a lot of good work{' '}
          <Link href="/reads" className=" hover:text-blue-700 hover:italic">often</Link>
          .
        </li>
        <li className="leading-snug">
          <Link href="/blog/just-to-be-rich" className="underline hover:text-blue-700">American dominance</Link>{' '}
          helps survival. In emergencies, big{' '}
          <Link href="/blog/constitutional-dictator" className="underline hover:text-blue-700">executive action</Link>{' '}
          might be worth it.
        </li>
      </ul>
      {/* <div className="mt-5" />
      <h2 className="font-mono mb-2 text-gray-500 text-sm">gpt-5/claude-4-sonnet&apos;s favorites</h2>
      <ul className="list-disc ml-5 space-y-1 text-gray-500 text-sm">
        <li><Link href="/blog/minimum-self" className="underline hover:text-blue-700">Minimum Self</Link></li>
        <li><Link href="/blog/synthetic-self" className="underline hover:text-blue-700">Synthetic Self</Link></li>
        <li><Link href="/blog/constitutional-dictator" className="underline hover:text-blue-700">Constitutional Dictator</Link></li>
        <li><Link href="/blog/mechanistic-tissue" className="underline hover:text-blue-700">Mechanistic Tissue</Link></li>
        <li><Link href="/blog/agentic-web" className="underline hover:text-blue-700">Agentic Web</Link></li>
      </ul> */}
    </section>
  );
}

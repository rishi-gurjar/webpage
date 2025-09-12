"use client";

import Image from "next/image"
import React, { useEffect, useState } from 'react'
import { PageTracker } from './blog/PageTracker';
import { blogHeaderImagePaths } from "@/lib/blogHeaderImages";

export default function Home() {
  const [imgIndex, setImgIndex] = useState(0);
  const HEADER_HEIGHT_PX = 250;
  const [shuffledPaths, setShuffledPaths] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (blogHeaderImagePaths.length === 0) return;
    const shuffled = [...blogHeaderImagePaths].sort(() => Math.random() - 0.5);
    setShuffledPaths(shuffled);
    setImgIndex(Math.floor(Math.random() * shuffled.length));
    const intervalId = setInterval(() => {
      setImgIndex((prev) => (prev + 1) % shuffled.length);
    }, 300);
    setReady(true);
    return () => clearInterval(intervalId);
  }, []);

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Rishi Gurjar',
    url: 'https://rishigurjar.com',
    jobTitle: 'Student',
    alumniOf: [
      {
        '@type': 'CollegeOrUniversity',
        name: 'Cornell University'
      }
    ],
    sameAs: [
      'https://github.com/rishi-gurjar',
      'https://www.linkedin.com/in/rishigurjar/',
      'https://x.com/rishi__gurjar',
    ],
    knowsAbout: [
      'Software Engineering',
      'Design',
      'Ecology',
    ]
  };

  return (
    <main className="container grid flex flex-col items-center mt-[60px] lg:mt-[calc(100vh/5.5)] lg:w-[calc(100vw/3)] md:w-[calc(100vw/3)] md:px-0">
      <PageTracker path="/" />
      <div className="w-full mb-2 relative rounded-md overflow-hidden" style={{ height: HEADER_HEIGHT_PX }}>
        {ready && (
          <Image
            src={shuffledPaths[imgIndex]}
            alt="Image"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
          />
        )}
      </div>

      <div className="mt-4">
        <h2 className="scroll-m-20 text-lg font-normal tracking-tight text-gray-500">Rishi Gurjar</h2>
        <div >
          <h4 className="text-gray-500 text-sm">SF Bay Area & Ithaca, NY</h4>
          <h4 className="text-gray-500 text-sm">x@y | x = rrg85, y = cornell.edu</h4>
        </div>
        <br />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          <div>
            <h2 className="leading-7 [&:not(:first-child)]:mt-1 text-gray-500 font-mono text-sm">MISANTHROPING</h2>
            <div>
              <a className="hover:text-blue-500 text-gray-500 text-sm" href="/blog"><h4>Blog</h4></a>
              <a className="hover:text-blue-500 text-gray-500 text-sm" href="https://www.linkedin.com/in/rishigurjar/" target="_blank" rel="noopener noreferrer"><h4>Linkedin</h4></a>
              <a className="hover:text-blue-500 text-gray-500 text-sm" href="https://x.com/rishi__gurjar" target="_blank" rel="noopener noreferrer"><h4>Twitter</h4></a>
              <a className="hover:text-blue-500 text-gray-500 text-sm" href="https://github.com/rishi-gurjar" target="_blank" rel="noopener noreferrer"><h4>GitHub</h4></a>
              <a className="hover:text-blue-500 text-gray-500 text-sm" href="https://unsplash.com/@rishigurjar/" target="_blank" rel="noopener noreferrer"><h4>Unsplash</h4></a>
              <a className="hover:text-blue-500 text-gray-500 text-sm" href="https://www.goodreads.com/user/show/143258693-rishi-gurjar" target="_blank" rel="noopener noreferrer"><h4>Goodreads</h4></a>
            </div>
          </div>

          <div>
            <h2 className="leading-7 [&:not(:first-child)]:mt-1 text-gray-500 font-mono text-sm">SELLING AVOCADOS</h2>
            <div className="pb-4">
              <a className="hover:text-green-500 text-gray-500 text-sm" href="https://verduslabs.com" target="_blank" rel="noopener noreferrer"><h4>Verdus Labs</h4></a>
            </div>
            <h2 className="leading-7 [&:not(:first-child)]:mt-1 text-gray-500 font-mono text-sm">EXPERIMENTS</h2>
            <div className="pb-4">
              {/* <a className="hover:text-green-500 text-gray-500 text-sm" href="https://rishigurjar.com/doom" target="_blank" rel="noopener noreferrer"><h4>DOOM</h4></a> */}
              <a className="hover:text-green-500 text-gray-500 text-sm" href="https://rishigurjar.com/twirl" target="_blank" rel="noopener noreferrer"><h4>Twirl</h4></a>
              <a className="hover:text-green-500 text-gray-500 text-sm" href="https://rishigurjar.com/nudge" target="_blank" rel="noopener noreferrer"><h4>Nudge</h4></a>
              <a className="hover:text-green-500 text-gray-500 text-sm" href="https://cornelldatajournal.org" target="_blank" rel="noopener noreferrer"><h4>Data Journal</h4></a>
              {/* <a className="hover:text-green-500" href="https://verduslabs.com/" target="_blank" rel="noopener noreferrer"><h4>Verdus Labs</h4></a> */}
              <a className="hover:text-green-500 text-gray-500 text-sm" href="https://coldcraft.ai" target="_blank" rel="noopener noreferrer"><h4>ColdCraft</h4></a>
              {/* <a className="hover:text-green-500" href="https://codexfund.vercel.app/" target="_blank" rel="noopener noreferrer"><h4>Codex Fund</h4></a> */}
              <a className="hover:text-green-500 text-gray-500 text-sm" href="https://armada.build/" target="_blank" rel="noopener noreferrer"><h4>Armada</h4></a>
              <a className="hover:text-green-500 text-gray-500 text-sm" href="https://beyondterra.org" target="_blank" rel="noopener noreferrer"><h4>Beyond Terra</h4></a>
              <a className="hover:text-green-500 text-gray-500 text-sm" href="https://rishigurjar.com/ancients" target="_blank" rel="noopener noreferrer"><h4>Ancients</h4></a>
              <a className="hover:text-green-500 text-gray-500 text-sm" href="https://rishigurjar.com/beacon" target="_blank" rel="noopener noreferrer"><h4>Beacon</h4></a>
              {/* <h4>Smart contract bounty project</h4>
              <h4>b2b data marketing and sales tooling</h4>
                <h4>omnichannel marketing ai tool for agencies</h4>
              <h4>Synth type shit</h4> 
              <h4>viral iOs apps</h4>
              */}
            </div>
          </div>
        </div>
        <br />

        {/* <div className="relative w-full h-[352px]">
          <iframe 
            src="https://open.spotify.com/embed/playlist/5yIvBs25i0461KsiX5OCZR?utm_source=oembed"
            className="absolute top-0 left-0 w-full h-4/5 border-0"
            allowFullScreen
            allow="clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          />
        </div> */}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
    </main>
  );
}
"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { PageTracker } from "./blog/PageTracker";
import { blogHeaderImagePaths } from "@/lib/blogHeaderImages";

export default function Home() {
  const [imgIndex, setImgIndex] = useState(0);
  const HEADER_HEIGHT_PX = 250;
  const [shuffledPaths, setShuffledPaths] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [isTeenMode, setIsTeenMode] = useState(false);
  const [hoveredFriend, setHoveredFriend] = useState<{ name: string; url: string } | null>(null);

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

  useEffect(() => {
    const body = typeof document !== "undefined" ? document.body : null;
    const themeClassName = "teen-2000s";
    if (!body) return;
    if (isTeenMode) {
      body.classList.add(themeClassName);
      // Assign a random hue for this session of teen mode
      const randomHue = Math.floor(Math.random() * 360);
      body.style.setProperty("--teen-hue", String(randomHue));
    } else {
      body.classList.remove(themeClassName);
      body.style.removeProperty("--teen-hue");
    }
    return () => {
      body.classList.remove(themeClassName);
      body.style.removeProperty("--teen-hue");
    };
  }, [isTeenMode]);

  const friends = [
    {
      name: "Rohan",
      url: "https://rohankumar.co"
    },
    {
      name: "Ronald",
      url: "https://ronaldleung.co"
    },
    {
      name: "Simon",
      url: "https://simonilincev.com/"
    },
    {
      name: "Will",
      url: "https://willmrosenthal.com/"
    }
  ];

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Rishi Gurjar",
    url: "https://rishigurjar.com",
    jobTitle: "Student",
    alumniOf: [
      {
        "@type": "CollegeOrUniversity",
        name: "Cornell University",
      },
    ],
    sameAs: [
      "https://github.com/rishi-gurjar",
      "https://www.linkedin.com/in/rishigurjar/",
      "https://x.com/rishi__gurjar",
    ],
    knowsAbout: ["Software Engineering", "Design", "Ecology"],
  };

  return (
    <main className="container grid flex flex-col items-center mt-[60px] lg:mt-[calc(100vh/5.5)] lg:w-[calc(100vw/3)] md:w-[calc(100vw/3)] md:px-0">
      <PageTracker path="/" />
      <div
        className="w-full mb-2 relative rounded-md overflow-hidden cursor-pointer"
        style={{ height: HEADER_HEIGHT_PX }}
        onClick={() => setIsTeenMode((prev) => !prev)}
        title="Toggle 2000s mode"
      >
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
        <h2 className="scroll-m-20 text-lg font-normal tracking-tight text-gray-500">
          Rishi Gurjar
        </h2>
        <div>
          <h4 className="text-gray-500 text-sm keep-base-font">
            SF Bay Area &amp; Ithaca, NY
          </h4>
          <h4 className="text-gray-500 text-sm">
            x@y | x = rrg85, y = cornell.edu
          </h4>
        </div>
        <br />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          <div>
            <h2 className="leading-5 [&:not(:first-child)]:mt-0.5 text-gray-500 text-sm">
              On leave from Cornell to deal {" "}
              <a
                className="hover:text-blue-500 text-gray-500 text-sm underline"
                href="https://verduslabs.com"
                target="_blank"
                rel="noopener noreferrer"
              >
               avocados
              </a>
            </h2>
            <h2 className="leading-5 [&:not(:first-child)]:mt-0.5 text-gray-500 text-sm"> 
              I like landscape, constitution, and self-replicating system design
            </h2>
            <h2 className="leading-7 [&:not(:first-child)]:mt-1 text-gray-500 font-mono text-sm">
              MISANTHROPING
            </h2>
            <div>
              <a
                className="hover:text-blue-500 text-gray-500 text-sm"
                href="/blog"
              >
                <h4>Blog</h4>
              </a>
              <a
                className="hover:text-blue-500 text-gray-500 text-sm"
                href="https://www.linkedin.com/in/rishigurjar/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <h4>Linkedin</h4>
              </a>
              <a
                className="hover:text-blue-500 text-gray-500 text-sm"
                href="https://x.com/rishi__gurjar"
                target="_blank"
                rel="noopener noreferrer"
              >
                <h4>Twitter</h4>
              </a>
              <a
                className="hover:text-blue-500 text-gray-500 text-sm"
                href="https://github.com/rishi-gurjar"
                target="_blank"
                rel="noopener noreferrer"
              >
                <h4>GitHub</h4>
              </a>
              <a
                className="hover:text-green-500 text-gray-500 text-sm"
                href="https://armada.build/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <h4>Armada</h4>
              </a>
              <a
                className="hover:text-green-500 text-gray-500 text-sm"
                href="https://beyondterra.org"
                target="_blank"
                rel="noopener noreferrer"
              >
                <h4>Beyond Terra</h4>
              </a>
              {/* <a className="hover:text-blue-500 text-gray-500 text-sm" href="https://unsplash.com/@rishigurjar/" target="_blank" rel="noopener noreferrer"><h4>Unsplash</h4></a> */}
              {/* <a className="hover:text-blue-500 text-gray-500 text-sm" href="https://www.goodreads.com/user/show/143258693-rishi-gurjar" target="_blank" rel="noopener noreferrer"><h4>Goodreads</h4></a> */}
            </div>
          </div>

          <div>
            <div className="pb-4">
              <p className="text-gray-500 text-sm font-mono keep-base-font">
                &quot;One of the schools of Tlön goes so far as to negate time: it reasons that the present is indefinite, that the future has no reality other than as a present hope, that the past has no reality other than as a present memory&quot;
              </p>
              <p className="text-gray-500 text-sm keep-base-font">
                &mdash; Jorge Luis Borges, <i>Tlön, Uqbar, Orbis Tertius</i>
              </p>
            </div>
            {/* <h2 className="leading-7 [&:not(:first-child)]:mt-1 text-gray-500 font-mono text-sm">EXPERIMENTS</h2> */}
            <div className="pb-4 keep-base-font">
              {/* <a className="hover:text-green-500 text-gray-500 text-sm" href="https://rishigurjar.com/doom" target="_blank" rel="noopener noreferrer"><h4>DOOM</h4></a> */}
              {/* <a className="hover:text-green-500 text-gray-500 text-sm" href="https://rishigurjar.com/twirl" target="_blank" rel="noopener noreferrer"><h4>Twirl</h4></a>
              <a className="hover:text-green-500 text-gray-500 text-sm" href="https://rishigurjar.com/nudge" target="_blank" rel="noopener noreferrer"><h4>Nudge</h4></a> */}
              {/* <a className="hover:text-green-500 text-gray-500 text-sm" href="https://cornelldatajournal.org" target="_blank" rel="noopener noreferrer"><h4>Data Journal</h4></a> */}
              {/* <a className="hover:text-green-500" href="https://verduslabs.com/" target="_blank" rel="noopener noreferrer"><h4>Verdus Labs</h4></a> */}
              {/* <a className="hover:text-green-500 text-gray-500 text-sm" href="https://coldcraft.ai" target="_blank" rel="noopener noreferrer"><h4>ColdCraft</h4></a> */}
              {/* <a className="hover:text-green-500" href="https://codexfund.vercel.app/" target="_blank" rel="noopener noreferrer"><h4>Codex Fund</h4></a> */}
              {/* <a className="hover:text-green-500 text-gray-500 text-sm" href="https://rishigurjar.com/ancients" target="_blank" rel="noopener noreferrer"><h4>Ancients</h4></a> */}
              {/* <a className="hover:text-green-500 text-gray-500 text-sm" href="https://rishigurjar.com/beacon" target="_blank" rel="noopener noreferrer"><h4>Beacon</h4></a> */}
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
        <div className="text-gray-500 text-sm font-mono text-center keep-base-font">
          {hoveredFriend ? "Check out " : "Check out my "}
          <a
            className="underline cursor-pointer"
            href={hoveredFriend ? hoveredFriend.url : undefined}
            target={hoveredFriend ? "_blank" : undefined}
            rel={hoveredFriend ? "noopener noreferrer" : undefined}
            onMouseEnter={() => {
              const pick = friends[Math.floor(Math.random() * friends.length)];
              setHoveredFriend(pick);
            }}
            onMouseLeave={() => setHoveredFriend(null)}
            onClick={(e) => {
              if (!hoveredFriend) {
                e.preventDefault();
              }
            }}
          >
            {hoveredFriend ? hoveredFriend.name : "friends"}
          </a>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
    </main>
  );
}
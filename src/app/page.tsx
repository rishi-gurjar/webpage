"use client";

import Image from "next/image"
import tileImage from '/public/tile.png';
import promImage from '/public/prom.jpg';
import lamb from '/public/mysticlamb.png';
import { AspectRatio } from "@/components/ui/aspect-ratio"
import React, { useState } from 'react'
import { PageTracker } from './blog/PageTracker';

export default function Home() {
  const [img, setImg] = useState(tileImage);
  const [caption, setCaption] = useState("DALLE-2, 2022 AD");

  const handleMouseEnter = () => {
    setImg(lamb);
    setCaption("van Eyck, 1432 AD");
  };

  const handleMouseLeave = () => {
    setImg(tileImage);
    setCaption("DALLE-2, 2022 AD");
  }

  return (
    <main className="container grid flex flex-col items-center mt-[60px] lg:mt-[calc(100vh/5.5)] lg:w-[calc(100vw/3)] md:w-[calc(100vw/3)] md:px-0">
      <PageTracker path="/" />
      <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <AspectRatio ratio={16 / 7.5}>
          <Image 
            src={img} 
            alt="Image" 
            className="rounded-md object-cover" 
            priority={true}
            width={800} 
            height={375}
          />
          <h3 className="leading-7 text-right [&:not(:first-child)]:mt-1">{caption}</h3>
        </AspectRatio>
      </div>

      <div className="mt-4">
        <h2 className="scroll-m-20 text-xl font-semibold tracking-tight">Rishi Gurjar</h2>
        <div >
          <h4>SF Bay Area & Ithaca, NY</h4>
          <h4>Email: x@y | x = rrg85, y = cornell.edu</h4>
        </div>
        <br />

        <h2 className="leading-7 [&:not(:first-child)]:mt-1">Socials</h2>
        <div>
          <a className="hover:text-blue-500" href="/blog" target="_blank" rel="noopener noreferrer"><h4>Blog</h4></a>
          <a className="hover:text-blue-500" href="https://www.linkedin.com/in/rishigurjar/" target="_blank" rel="noopener noreferrer"><h4>Linkedin</h4></a>
          <a className="hover:text-blue-500" href="https://x.com/rishi__gurjar" target="_blank" rel="noopener noreferrer"><h4>Twitter</h4></a>
          <a className="hover:text-blue-500" href="https://github.com/rishi-gurjar" target="_blank" rel="noopener noreferrer"><h4>GitHub</h4></a>
          <a className="hover:text-blue-500" href="https://unsplash.com/@rishigurjar/" target="_blank" rel="noopener noreferrer"><h4>Unsplash</h4></a>
        </div>
        <br />

        <h2 className="leading-7 [&:not(:first-child)]:mt-1">Side projects</h2>
        <div>
          {/* <a className="hover:text-green-500" href="https://verduslabs.com/" target="_blank" rel="noopener noreferrer"><h4>Verdus Labs</h4></a> */}
          <a className="hover:text-green-500" href="https://coldcraft.ai" target="_blank" rel="noopener noreferrer"><h4>ColdCraft</h4></a>
          {/* <a className="hover:text-green-500" href="https://codexfund.vercel.app/" target="_blank" rel="noopener noreferrer"><h4>Codex Fund</h4></a> */}
          <a className="hover:text-green-500" href="https://armada.build/" target="_blank" rel="noopener noreferrer"><h4>Armada</h4></a>
          <a className="hover:text-green-500" href="https://beyondterra.org" target="_blank" rel="noopener noreferrer"><h4>Beyond Terra</h4></a>
        </div>
      </div>

    </main>
  );
}
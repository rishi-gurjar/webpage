'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import mockup from '/public/twirlappmockup.png';

export default function TwirlLandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="container mx-auto px-4 py-8 relative">
        <div className="flex justify-between items-center">
          <div className="relative">
            <h1 
              className="text-5xl font-bold transform hover:scale-110 transition-transform" 
              style={{ fontFamily: 'Baloo-Regular, sans-serif', color: '#7CBEF4' }}
            >
              <span className="inline-block transform hover:rotate-12 transition-transform duration-300">T</span>
              <span className="inline-block transform hover:-rotate-6 transition-transform duration-300">W</span>
              <span className="inline-block transform hover:rotate-12 transition-transform duration-300">I</span>
              <span className="inline-block transform hover:-rotate-6 transition-transform duration-300">R</span>
              <span className="inline-block transform hover:rotate-12 transition-transform duration-300">L</span>
              <span 
                className="absolute -top-2 -right-4 text-2xl animate-bounce"
                style={{ animationDuration: '1s' }}
              >
                ✨
              </span>
            </h1>
          </div>
          {/* <button className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors transform hover:scale-105 hover:rotate-1">
            Download Now
          </button> */}
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 relative z-10">
        <section className="flex flex-col md:flex-row items-center justify-between gap-12 mb-20">
          <div className="md:w-1/2">
            <h2 className="text-5xl font-bold text-gray-800 mb-6">
                Rate My Fit
            </h2>
            <p className="text-xl text-gray-600 mb-8 relative">
              Stop overthinking your outfits. Get objective feedback based on your occasion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="https://testflight.apple.com/join/bReeHWCt"
                className="bg-black text-white px-8 py-3 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors transform hover:scale-105 shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.68 1.32-1.53 2.64-2.53 4.08z"/>
                  <path d="M12.03 7.25c-.15-2.23 1.66-4.22 3.74-4.25.27 2.57-2.19 4.31-3.74 4.25z"/>
                </svg>
                Get the beta
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 relative flex justify-center">
            <div className="relative w-[280px] h-[580px] transform rotate-2 hover:rotate-0 transition-transform">
              <Image 
                src={mockup} 
                alt="Twirl App Mockup" 
                className="object-contain drop-shadow-xl" 
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
        </section>

        {/* <section className="py-16 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-12 relative inline-block">
            The Problem & Solution
            <div className="absolute w-full h-2 bg-blue-200 bottom-0 left-0 transform -rotate-1"></div>
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-2xl shadow-md transform -rotate-1 hover:rotate-0 transition-transform">
              <h3 className="text-2xl font-bold text-red-500 mb-4 flex items-center justify-center gap-2">
                <span>The Problem</span>
                <span className="text-2xl">😩</span>
              </h3>
              <p className="text-lg text-gray-700">
                It's easy to overthink your outfits, spending too much time deciding what to wear and still feeling uncertain about your choice.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-md transform rotate-1 hover:rotate-0 transition-transform">
              <h3 className="text-2xl font-bold text-blue-500 mb-4 flex items-center justify-center gap-2">
                <span>Our Solution</span>
                <span className="text-2xl">✨</span>
              </h3>
              <p className="text-lg text-gray-700">
                We made an app that'll objectively rate your fits based on your occasion, giving you instant feedback and confidence in your style choices.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center relative inline-block">
            How It Works
            <div className="absolute w-full h-2 bg-pink-200 bottom-0 left-0 transform rotate-1"></div>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md text-center transform hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                <span className="text-2xl font-bold text-blue-600">1</span>
                <div className="absolute inset-0 border-2 border-blue-300 rounded-full animate-ping-slow opacity-75"></div>
              </div>
              <h3 className="text-xl font-bold mb-3">Take a Photo</h3>
              <p className="text-gray-600">Snap a quick picture of your outfit in our easy-to-use app.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center transform hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                <span className="text-2xl font-bold text-blue-600">2</span>
                <div className="absolute inset-0 border-2 border-blue-300 rounded-full animate-ping-slow opacity-75" style={{ animationDelay: '0.5s' }}></div>
              </div>
              <h3 className="text-xl font-bold mb-3">Select Occasion</h3>
              <p className="text-gray-600">Tell us where you're going - work, date, casual outing, etc.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center transform hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                <span className="text-2xl font-bold text-blue-600">3</span>
                <div className="absolute inset-0 border-2 border-blue-300 rounded-full animate-ping-slow opacity-75" style={{ animationDelay: '1s' }}></div>
              </div>
              <h3 className="text-xl font-bold mb-3">Get Rated</h3>
              <p className="text-gray-600">Receive an objective rating and helpful suggestions to improve your fit.</p>
            </div>
          </div>
        </section>*/}
      </main> 

      <footer className="bg-gray-900 text-white py-12 relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Baloo-Regular, sans-serif' }}>
                <span className="text-blue-400">T</span>
                <span className="text-blue-300">W</span>
                <span className="text-blue-400">I</span>
                <span className="text-blue-300">R</span>
                <span className="text-blue-400">L</span>
              </h2>
              <p className="text-gray-400 mt-2">Rate my fit. Dress with confidence.</p>
            </div>
            {/* <div>
              <button className="bg-white text-gray-900 px-6 py-3 rounded-full font-medium hover:bg-gray-200 transition-colors transform hover:scale-105 hover:-rotate-1">
                Download Now
              </button>
            </div> */}
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">&copy; {new Date().getFullYear()} Twirl App. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link href="/twirl/tos" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/twirl/pp" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
      
      <style jsx global>{`
        @font-face {
          font-family: 'Baloo-Regular';
          src: url('/Baloo-Regular.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
        
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        
        .animate-ping-slow {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        @keyframes ping {
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

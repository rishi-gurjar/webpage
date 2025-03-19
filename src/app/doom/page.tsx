'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import Head from 'next/head';

export default function DoomPage() {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Only run this after the script has been loaded
    if (!scriptLoaded) return;

    // Initialize DOSBox
    const initDosbox = () => {
      try {
        // Create a proxy for the Xhr function to fix paths
        const originalXhrConstructor = window.XMLHttpRequest;
        window.XMLHttpRequest = function() {
          const xhr = new originalXhrConstructor();
          const originalOpen = xhr.open;
          
          xhr.open = function(method, url, ...args) {
            // Fix the js-dos-apiv3.js path
            if (typeof url === 'string' && url === 'components/js-dos-apiv3.js') {
              url = '/jsdoom/components/js-dos-apiv3.js';
              console.log('Fixed URL path to:', url);
            }
            return originalOpen.call(this, method, url, ...args);
          };
          
          return xhr;
        };

        // Initialize DOSBox
        window.dosbox = new window.Dosbox({
          id: "dosbox",
          onload: function(dosbox: any) {
            try {
              dosbox.run("/jsdoom/roms/ultimate-doom.zip", "./UltDoom/DOOM.EXE");
            } catch (e) {
              console.error("Error running DOOM:", e);
            }
          },
          onrun: function(dosbox: any, app: string) {
            console.log("App '" + app + "' is running");
            
            // Auto fullscreen
            setTimeout(() => {
              if (dosbox && dosbox.requestFullScreen) {
                dosbox.requestFullScreen();
              }
            }, 2000);
          }
        });

        // Auto-start after a short delay
        setTimeout(() => {
          const startButton = document.querySelector('.dosbox-start') as HTMLElement;
          if (startButton) {
            startButton.click();
          }
        }, 1000);
      } catch (error) {
        console.error("Error initializing DOSBox:", error);
      }
    };

    // Run initialization
    initDosbox();
  }, [scriptLoaded]);

  // Handle script load event
  const handleScriptLoad = () => {
    console.log("Script loaded successfully");
    setScriptLoaded(true);
  };

  return (
    <>
      <Head>
        <title>JS DOOM 🕹</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* Load CSS files */}
      <link rel="stylesheet" type="text/css" href="/jsdoom/style.css" />
      <link rel="stylesheet" type="text/css" href="/jsdoom/styles/button.css" />

      {/* Main container */}
      <div className="container">
        <div id="dosbox"></div>
      </div>

      {/* Preload js-dos-apiv3.js */}
      <Script 
        src="/jsdoom/components/js-dos-apiv3.js" 
        strategy="beforeInteractive"
        onError={(e) => console.error("js-dos-apiv3.js loading error:", e)}
      />

      {/* Load main script */}
      <Script 
        src="/jsdoom/script.js" 
        strategy="afterInteractive" 
        onLoad={handleScriptLoad}
        onError={(e) => console.error("Script loading error:", e)}
      />

      {/* Add inline script to fix overlay and auto-fullscreen */}
      <Script id="fix-overlay" strategy="afterInteractive">
        {`
          // Create a placeholder for the overlay image
          if (!window.overlayFixed) {
            window.overlayFixed = true;
            
            // Override CSS for the overlay
            const style = document.createElement('style');
            style.textContent = \`
              .dosbox-container > .dosbox-overlay {
                background: #000 !important;
                background-size: 100% !important;
              }
              
              /* Hide the fullscreen button */
              .wrapper {
                display: none !important;
              }
              
              /* Make the container fill the screen */
              .container, .dosbox-container, canvas.dosbox-canvas {
                width: 100% !important;
                height: 100vh !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              
              body {
                margin: 0;
                padding: 0;
                overflow: hidden;
              }
            \`;
            document.head.appendChild(style);
            
            // Add event listener to handle clicks anywhere to go fullscreen
            document.addEventListener('click', function() {
              if (window.dosbox && window.dosbox.requestFullScreen) {
                window.dosbox.requestFullScreen();
              }
            });
          }
        `}
      </Script>
    </>
  );
}

// Add TypeScript interface for the global objects
declare global {
  interface Window {
    Dosbox: any;
    dosbox: any;
    overlayFixed: boolean;
    XMLHttpRequest: any;
  }
}

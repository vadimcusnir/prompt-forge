"use client"

import { HomeInteractive } from "@/components/home-interactive";

/**
 * CSS Reset Component - Ensures proper CSS cascade and prevents conflicts
 * This component should be imported early in the component tree
 */

export function HomeInteractive() () {
  return (
    <style jsx global>{`
      /* Force black background at highest priority */
      html {
        background-color: #0a0a0a !important;
        background: #0a0a0a !important;
      }
      
      body {
        background-color: transparent !important;
        background: transparent !important;
      }
      
      /* Ensure SKRE Protocol backgrounds take precedence */
      .bg-black {
        background-color: #000000 !important;
        background: #000000 !important;
      }
      
      .bg-\[#0a0a0a\] {
        background-color: #0a0a0a !important;
        background: #0a0a0a !important;
      }
      
      .bg-\[#0e0e0e\] {
        background-color: #0e0e0e !important;
        background: #0e0e0e !important;
      }
      
      .bg-\[#1a1a1a\] {
        background-color: #1a1a1a !important;
        background: #1a1a1a !important;
      }
      
      /* Prevent any light backgrounds from overriding */
      .bg-white,
      .bg-gray-50,
      .bg-gray-100,
      .bg-gray-200,
      .bg-gray-300,
      .bg-gray-400,
      .bg-gray-500 {
        background-color: inherit !important;
        background: inherit !important;
      }
      
      /* Ensure proper z-index for background layers */
      body::before {
        z-index: -2 !important;
      }
      
      body::after {
        z-index: -1 !important;
      }
    `}</style>
  );
}

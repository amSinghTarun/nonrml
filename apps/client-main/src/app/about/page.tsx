import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  // Basic metadata fields
  title: `About us - NoNRML`,  // Browser tab title, search engine title
  description: `Buy Premium Unisex Streetwear clothes online from NoNRML `,  // Meta description for SEO
  keywords: ["premium cloth", "premium", "oversize cloth", "Streetwear", "streetwear ", "unisex"],
  robots: 'index, follow',
}

export default function OurStoryPage() {
  return (
    <section className="flex min-h-screen w-screen flex-row text-black justify-center items-start bg-white pt-20 pb-10 mb-64">
      <article className="w-[90%] max-w-4xl flex flex-col">
        <h1 className="flex text-black justify-center font-bold text-lg mb-10">
          OUR STORY
        </h1>
        
        <div className="text-xs text-center mb-8 text-black">
          <p>
            It started with a simple question: "Why normal?" In a world obsessed with fitting in, we wondered what would happen if we celebrated standing out instead. That's how NONRML was born.
          </p>
        </div>
        <div className="text-xs space-y-8 text-black">
          <div>
            <h2 className="font-semibold mb-2">The Beginning</h2>
            <p>
              Late one night in a cramped Mumbai studio, surrounded by sketches and prototypes, we realized something profound. Every design we admired, every piece that caught our eye, had one thing in common – they all dared to be different. They broke rules. They rejected normal.
            </p>
          </div>
          <div>
            <h2 className="font-semibold mb-2">Why "No Normal"?</h2>
            <p>
              We grew tired of seeing the same designs everywhere, the same patterns repeated endlessly. We wanted to create something that made people pause, look twice, and smile. Something that whispered, "You don't have to be like everyone else."
            </p>
          </div>
          <div>
            <h2 className="font-semibold mb-2">Our Philosophy</h2>
            <p className="mb-2">Every NONRML piece tells a story:</p>
            <ul className="space-y-2">
              <li>• It's the hidden detail you discover weeks after purchase</li>
              <li>• It's the unconventional color combination that somehow works perfectly</li>
              <li>• It's the subtle design element that sparks conversation</li>
              <li>• It's the craftsmanship that makes everyday objects feel extraordinary</li>
            </ul>
          </div>
          <div>
            <h2 className="font-semibold mb-2">The Journey</h2>
            <p>
              What started as a rebellion against the ordinary has grown into a community of individuals who dare to be different. We've made mistakes, learned from them, and evolved. Each product release is a new chapter in our story of challenging the status quo.
            </p>
          </div>
          <div>
            <h2 className="font-semibold mb-2">Why We Do What We Do</h2>
            <p>
              We believe that true beauty lies in the unexpected – in the details that aren't immediately visible, in the craftsmanship that reveals itself over time. When you choose NONRML, you're not just buying a product; you're joining a movement that celebrates your unique identity.
            </p>
          </div>
          <div>
            <h2 className="font-semibold mb-2">The NONRML Promise</h2>
            <p>
              We promise to never settle for ordinary. Each design goes through countless iterations because "good enough" isn't in our vocabulary. If you find a surprise detail in our products, know that it was placed there with intention – a small reminder that the world is more interesting when we embrace what makes us different.
            </p>
          </div>
          <div>
            <h2 className="font-semibold mb-2">Join the Movement</h2>
            <p>
              This isn't just our story – it's yours too. Every person who chooses NONRML adds their own chapter to this journey. Want to be part of something extraordinary? Reach out to us at{' '}
              <span className="cursor-pointer text-rose-400">
                info@nonrml.com
              </span>
              {' '}and let's create something remarkable together.
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}
import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About NoNRML - Say No to Normal | Premium Indian Streetwear',
  description: 'NoNRML is premium Indian streetwear built on one belief: say no to normal. Original expressive designs, made in India, for creators, founders, and culture shifters. Oversized fits, bold graphics, limited drops. All it takes is a no to redefine what is normal.',
  keywords: ['NoNRML about', 'say no to normal', 'premium Indian streetwear', 'made in India streetwear', 'expressive streetwear', 'oversized streetwear India', 'limited edition drops', 'gender neutral clothing', 'bold graphic tees', 'Indian streetwear brand', 'original streetwear India'],
  openGraph: {
    title: 'About NoNRML - Our Story | Premium Indian Streetwear',
    description: 'Discover how NoNRML became India\'s premium streetwear brand celebrating individuality and bold fashion. Join the movement that dares to be different.',
    url: 'https://www.nonrml.co.in/about',
    type: 'website',
    locale: 'en_IN',
    siteName: 'NoNRML',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'NoNRML Brand Story',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About NoNRML - Premium Indian Streetwear Brand',
    description: 'The story of India\'s premium streetwear brand that celebrates individuality and dares to be different.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://www.nonrml.co.in/about',
  },
}

export default function OurStoryPage() {
  return (
    <section className="flex min-h-screen w-screen flex-row text-black justify-center items-start bg-white pt-20 pb-10 mb-64">
      <article className="w-[90%] max-w-4xl flex flex-col">
        <h1 className="flex text-black justify-center font-bold text-lg mb-10">
          ABOUT NoNRML
        </h1>

        <div className="text-xs text-center mb-8 text-black">
          <p className="font-medium text-lg mb-4">
            Premium Indian Streetwear
          </p>
          <p>
            NoNRML is a premium Indian streetwear brand built on a clear belief: say no to normal. 
            <br />
            Our tagline—"all it takes is a no to redefine what is normal."—guides every drop, from fabric and fit to artwork and storytelling.
          </p>
        </div>

        <div className="text-xs space-y-8 text-black">
          <div>
            <p>
              We create original, expressive designs—graphic tees, oversized hoodies, statement jackets, and accessories—rooted in the people of India and our surroundings, yet unmistakably modern and psychological in tone (not nostalgia, not "old India"). Think bold typographic motifs, abstract forms, and concept-led graphics that explore mindset, identity, and rebellion—clothes that speak before you do.
            </p>
          </div>

          <div>
            <p>
              Crafted in small batches made in India, our pieces balance premium materials, clean construction, and all-season comfort with oversized, relaxed, gender-neutral fits. Each limited edition is designed to be lived in and stand out: breathable cottons, soft-hand prints, durable embroidery, and fade-resistant inks built for metro commutes, late nights, and festival energy.
            </p>
          </div>

          <div>
            <p>
              For creators, founders, athletes, and culture shifters, NoNRML is original Indian streetwear that turns individuality into a uniform—premium streetwear from India that's expressive, modern, and unapologetically different.
            </p>
          </div>

          <div>
            <h2 className="font-semibold mb-3">What We Stand For</h2>
            <ul className="space-y-2">
              <li><strong>Expressive design:</strong> Bold, conversation-starting graphics and typography that turn outfits into statements.</li>
              <li><strong>Premium quality:</strong> Durable fabrics, clean stitching, and comfort-first fits (oversized, relaxed, and gender-neutral).</li>
              <li><strong>Made in India:</strong> Thoughtfully produced with Indian craftsmanship, ethical sourcing, and small-batch drops.</li>
              <li><strong>Community {'>'} clout:</strong> Limited releases that celebrate individuality, creativity, and culture.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold mb-3">Design Language</h2>
            <p>
              Every NoNRML piece is built to be worn loud and lived in. Expect original artwork, strong color stories, and limited-edition drops that won't restock—so your wardrobe stays unique. Our collections balance premium streetwear aesthetics with practical details: reinforced seams, soft-hand prints, and breathable, all-season cotton blends.
            </p>
          </div>

          <div>
            <h2 className="font-semibold mb-3">Fit & Fabric</h2>
            <p className="mb-2"><strong>Fabrics:</strong> Midweight and heavyweight cotton, brushed fleece, and breathable jersey for Indian weather.</p>
            <p className="mb-2"><strong>Fits:</strong> Oversized and relaxed silhouettes with accurate size charts for all body types.</p>
            <p><strong>Care:</strong> Fade-resistant prints and pre-shrunk materials to keep your pieces looking fresh longer.</p>
          </div>

          <div>
            <h2 className="font-semibold mb-3">Ethos & Sustainability</h2>
            <p>
              We produce in controlled quantities to reduce waste, prioritize long-lasting construction over fast fashion, and partner with local vendors to support Indian manufacturing. Because premium streetwear should feel as good as it looks.
            </p>
          </div>

          <div>
            <h2 className="font-semibold mb-3">Who We Create For</h2>
            <p>
              NoNRML is for people who refuse to be average—creatives, founders, athletes, and culture shifters who write their own rules. If you're redefining what "normal" means, you're already one of us.
            </p>
          </div>

          <div>
            <div className="space-y-1 uppercase font-semibold">
              <p>Say no to fitting in.</p>
              <p>Say no to normal.</p>
            </div>
          </div>

        </div>
      </article>
    </section>
  );
}
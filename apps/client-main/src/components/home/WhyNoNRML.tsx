'use client';

import { useState } from 'react';

export function WhyNoNRML() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full bg-white px-4 py-6 text-black">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left flex items-center justify-between hover:text-gray-600 transition-colors"
      >
        <span className="text-xs font-medium">Why NoNRML?</span>
        <span className="text-xs">{isExpanded ? '−' : '+'}</span>
      </button>

      {isExpanded && (
        <div className="mt-4 text-xs leading-relaxed space-y-4 text-gray-800 max-w-5xl">
          <p>
            Streetwear has evolved from underground culture to a defining fashion statement, and India is witnessing this transformation firsthand. What once started as oversized tees, graphic prints, and casual comfort has now become a powerful expression of individuality, luxury, and creative freedom.
          </p>

          <p>
            Embodying the essence of premium street fashion, NoNRML is a rising luxury streetwear brand in India that's redefining the boundaries of urban fashion. With the rise of streetwear culture in India, comfort and style have become inseparable. Heavily influenced by pop culture, art, and youth movements, streetwear focuses on unisex clothing crafted from high-quality premium fabrics, featuring cozy fittings and expressive designs. NoNRML is shaping the future of Indian streetwear with a unique blend of comfort, bold aesthetics, and trendsetting designs.
          </p>

          <p className="font-medium">What is Unisex Streetwear?</p>

          <p>
            Streetwear is a vibrant reflection of pop culture with a touch of effortless, laid-back fashion. Unisex streetwear appeals to urban Gen-Z and millennials who embrace hip-hop, skateboarding culture, art, and everything bold and unconventional. If you're someone who enjoys graphic tees, oversized t-shirts, premium hoodies, and comfy yet stylish apparel—NoNRML, the unisex streetwear clothing brand, is your perfect match.
          </p>

          <p className="font-medium">A Focus on Unisex Designs</p>

          <p>
            Like progressive fashion brands worldwide, NoNRML's premium unisex clothing breaks free from conventional gender boundaries. Our unisex designs are crafted with a focus on comfort, versatility, and self-expression. Whether it's an oversized hoodie, a statement tee, or premium denim, NoNRML's unisex clothing is designed to be worn by anyone who appreciates authentic fashion. We don't restrict style to a single gender—our designs celebrate human desire for freedom, fluidity, and individuality.
          </p>

          <p className="font-medium">What Makes NoNRML Stand Out?</p>

          <p>
            Carving a distinct identity in India's streetwear scene, NoNRML offers a curated line of clothing that merges the bold aesthetics of street culture with refined, premium quality. Our collection of oversized t-shirts, premium hoodies, designer shirts, and luxury denim has captured the attention of fashion enthusiasts across India. NoNRML is recognized for meticulous attention to detail and unwavering commitment to quality. We're elevating streetwear clothing in India by blending high-quality materials, exquisite craftsmanship, and intentional design into every piece.
          </p>

          <p className="font-medium">Explore NoNRML's Premium Streetwear Collection - Buy Streetwear Online in India</p>

          <p>
            At NoNRML, we focus on incorporating global fashion trends while staying true to India's vibrant cultural energy. Streetwear is more than fashion—it's a statement of who you are. Every item in our collection helps you express your uniqueness and stand out from the crowd.
          </p>

          <p className="font-medium">Oversized T-Shirts: The Ultimate Streetwear Essential</p>

          <p>
            NoNRML's oversized t-shirts are wardrobe staples that redefine casual comfort. What sets us apart is how we've elevated this everyday essential into a premium garment. Available in a variety of colors, prints, and finishes, these tees offer something for everyone. Perfect for layering or wearing solo, our oversized t-shirts are versatile enough to transition from day to night, from casual hangouts to creative settings.
          </p>

          <p className="font-medium">Why NoNRML is Leading India's Streetwear Movement</p>

          <p>
            NoNRML offers a distinctive approach to streetwear, aiming to blend luxury with comfort and authenticity. Here's what sets our collections apart:
          </p>

          <p>
            <strong>Intentional Designs:</strong> Our in-house design team creates unique pieces with hidden details and artistic elements that aren't found elsewhere. Each design tells a story and rewards curiosity.
          </p>

          <p>
            <strong>Premium Quality:</strong> We source the finest fabrics to ensure maximum comfort, durability, and a luxurious feel in every garment.
          </p>

          <p>
            <strong>Unisex Styles:</strong> Our collection is designed for everyone—gender-neutral pieces that offer versatility and can be styled in countless ways.
          </p>

          <p>
            <strong>Limited Edition Drops:</strong> Stay ahead of trends with our exclusive, limited-run collections that ensure you're wearing something truly unique.
          </p>

          <p className="font-medium">NoNRML's Role in Shaping Indian Streetwear</p>

          <p>
            NoNRML is carving a niche in India's competitive streetwear market with a focus on quality, inclusive design, and bold innovation. Our commitment to premium materials, expressive aesthetics, and unisex fashion is redefining what streetwear means in India. Whether it's our oversized t-shirts, premium hoodies, designer shirts, or luxury denim—NoNRML is the answer for those looking to elevate their fashion game and make a statement that's unapologetically bold.
          </p>
        </div>
      )}
    </div>
  );
}

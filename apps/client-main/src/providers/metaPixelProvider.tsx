"use client";

import { useEffect, useRef } from "react";
import { useCartItemStore } from "@/store/atoms";
import { trackAbandonedCart } from "@/lib/metaPixel";
import { usePathname } from "next/navigation";

/**
 * MetaPixelProvider handles cart abandonment tracking.
 * 
 * It listens to the beforeunload event and fires an AbandonedCart event
 * if the cart has items and the user hasn't just completed a purchase.
 */
export const MetaPixelProvider = () => {
  const pathname = usePathname();
  const purchaseCompleted = useRef(false);

  // Track if user is on an order confirmation page (purchase completed)
  useEffect(() => {
    // If user navigates to an order page, mark purchase as completed
    if (pathname?.startsWith("/orders/") && !pathname.endsWith("/orders")) {
      purchaseCompleted.current = true;
    }
  }, [pathname]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      // Don't fire if purchase was just completed
      if (purchaseCompleted.current) {
        return;
      }

      // Get cart items from store
      const cartItems = useCartItemStore.getState().cartItems;
      const itemCount = Object.keys(cartItems).length;

      // Only fire if cart has items
      if (itemCount > 0) {
        // Calculate cart total
        let cartTotal = 0;
        Object.values(cartItems).forEach((item) => {
          cartTotal += item.price * item.quantity;
        });

        // Fire AbandonedCart event
        trackAbandonedCart({
          total: cartTotal,
          itemCount,
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Reset purchase completed flag when leaving order pages
  useEffect(() => {
    if (!pathname?.startsWith("/orders/")) {
      purchaseCompleted.current = false;
    }
  }, [pathname]);

  return null;
};


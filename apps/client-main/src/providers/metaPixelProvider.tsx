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
    let hasFired = false;

    const fireAbandonedCart = (eventSource: string = "unknown") => {
      // Prevent multiple fires
      if (hasFired || purchaseCompleted.current) {
        if (process.env.NODE_ENV === "development") {
          console.log("🚫 AbandonedCart skipped:", { hasFired, purchaseCompleted: purchaseCompleted.current, eventSource });
        }
        return;
      }

      // Get cart items from store
      const cartItems = useCartItemStore.getState().cartItems;
      const itemCount = Object.keys(cartItems).length;

      // Only fire if cart has items
      if (itemCount > 0) {
        hasFired = true;
        
        // Calculate cart total
        let cartTotal = 0;
        Object.values(cartItems).forEach((item) => {
          cartTotal += item.price * item.quantity;
        });

        // Log to console (will persist in some browsers)
        if (process.env.NODE_ENV === "development") {
          console.log("🛒 AbandonedCart fired:", {
            eventSource,
            itemCount,
            cartTotal,
            cartItems: Object.keys(cartItems),
          });
          
          // Also store in sessionStorage for debugging
          try {
            sessionStorage.setItem("lastAbandonedCart", JSON.stringify({
              timestamp: new Date().toISOString(),
              eventSource,
              itemCount,
              cartTotal,
            }));
          } catch (e) {
            // Ignore storage errors
          }
        }

        // Fire AbandonedCart event
        trackAbandonedCart({
          total: cartTotal,
          itemCount,
        });
      } else if (process.env.NODE_ENV === "development") {
        console.log("🚫 AbandonedCart skipped: Cart is empty", { eventSource });
      }
    };

    // Create named functions for proper cleanup
    const handleBeforeUnload = () => {
      fireAbandonedCart("beforeunload");
    };
    const handlePageHide = () => {
      fireAbandonedCart("pagehide");
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        fireAbandonedCart("visibilitychange");
      }
    };

    // Use multiple events for better reliability
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Expose a manual test function in development
    if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
      (window as any).testAbandonedCart = () => {
        console.log("🧪 Manually testing AbandonedCart...");
        fireAbandonedCart("manual-test");
      };
      console.log("💡 Tip: Run testAbandonedCart() in console to manually test AbandonedCart event");
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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


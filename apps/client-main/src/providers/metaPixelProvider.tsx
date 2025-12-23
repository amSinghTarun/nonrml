"use client";

import { useEffect, useRef } from "react";
import { useCartItemStore } from "@/store/atoms";
import { trackAbandonedCart } from "@/lib/metaPixel";
import { usePathname } from "next/navigation";

/**
 * MetaPixelProvider handles cart abandonment tracking.
 * 
 * Criteria for AbandonedCart:
 * 1. Cart must have at least 1 item
 * 2. User hasn't completed a purchase
 * 3. Triggers on:
 *    - User leaves page (beforeunload/pagehide)
 *    - User navigates away from cart/checkout pages
 *    - User has items in cart for 5+ minutes without action
 *    - Tab becomes hidden (visibilitychange)
 */
export const MetaPixelProvider = () => {
  const pathname = usePathname();
  const purchaseCompleted = useRef(false);
  const hasFired = useRef(false);
  const cartCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const lastCartCheck = useRef<number>(0);

  // Track if user is on an order confirmation page (purchase completed)
  useEffect(() => {
    // If user navigates to an order page, mark purchase as completed
    if (pathname?.startsWith("/orders/") && !pathname.endsWith("/orders")) {
      purchaseCompleted.current = true;
      hasFired.current = false; // Reset so we can track if they abandon again
    }
  }, [pathname]);

  // Fire AbandonedCart event
  const fireAbandonedCart = (eventSource: string = "unknown") => {
    // Prevent multiple fires
    if (hasFired.current || purchaseCompleted.current) {
      if (process.env.NODE_ENV === "development") {
        console.log("🚫 AbandonedCart skipped:", { 
          hasFired: hasFired.current, 
          purchaseCompleted: purchaseCompleted.current, 
          eventSource 
        });
      }
      return;
    }

    // Get cart items from store
    const cartItems = useCartItemStore.getState().cartItems;
    const itemCount = Object.keys(cartItems).length;

    // Only fire if cart has items
    if (itemCount > 0) {
      hasFired.current = true;
      
      // Calculate cart total
      let cartTotal = 0;
      Object.values(cartItems).forEach((item) => {
        cartTotal += item.price * item.quantity;
      });

      // Log to console
      console.log("🛒 AbandonedCart fired:", {
        eventSource,
        itemCount,
        cartTotal,
        cartItems: Object.keys(cartItems),
        pathname,
      });

      // Fire AbandonedCart event
      trackAbandonedCart({
        total: cartTotal,
        itemCount,
      });

      // Store in sessionStorage for debugging
      try {
        sessionStorage.setItem("lastAbandonedCart", JSON.stringify({
          timestamp: new Date().toISOString(),
          eventSource,
          itemCount,
          cartTotal,
          pathname,
        }));
      } catch (e) {
        // Ignore storage errors
      }
    } else if (process.env.NODE_ENV === "development") {
      console.log("🚫 AbandonedCart skipped: Cart is empty", { eventSource });
    }
  };

  // Check cart periodically and fire after 5 minutes of inactivity
  useEffect(() => {
    const checkCartAbandonment = () => {
      const cartItems = useCartItemStore.getState().cartItems;
      const itemCount = Object.keys(cartItems).length;
      const now = Date.now();

      if (itemCount > 0) {
        // If this is the first time we see items, record the time
        if (lastCartCheck.current === 0) {
          lastCartCheck.current = now;
          if (process.env.NODE_ENV === "development") {
            console.log("🛒 Cart items detected, starting abandonment timer (5 minutes)");
          }
        } else {
          // Check if 5 minutes have passed since items were added
          const timeSinceCartAdded = now - lastCartCheck.current;
          const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

          if (timeSinceCartAdded >= fiveMinutes && !hasFired.current) {
            console.log("⏰ AbandonedCart fired: 5 minutes elapsed with items in cart");
            fireAbandonedCart("time-based-5min");
          }
        }
      } else {
        // Cart is empty, reset the timer
        lastCartCheck.current = 0;
      }
    };

    // Check every 30 seconds
    cartCheckInterval.current = setInterval(checkCartAbandonment, 30000);
    
    // Initial check
    checkCartAbandonment();

    return () => {
      if (cartCheckInterval.current) {
        clearInterval(cartCheckInterval.current);
      }
    };
  }, []);

  // Track navigation away from cart/checkout pages
  useEffect(() => {
    const previousPath = useRef(pathname);
    
    // If user navigates away from cart/checkout pages, check for abandonment
    if (previousPath.current) {
      const wasOnCartPage = previousPath.current.includes("/cart") || 
                            previousPath.current.includes("/checkout");
      const isOnCartPage = pathname?.includes("/cart") || 
                          pathname?.includes("/checkout");
      
      // If user was on cart/checkout page and navigated away
      if (wasOnCartPage && !isOnCartPage && !pathname?.startsWith("/orders/")) {
        // Small delay to ensure cart state is updated
        setTimeout(() => {
          fireAbandonedCart("navigation-away-from-cart");
        }, 500);
      }
    }
    
    previousPath.current = pathname;
  }, [pathname]);

  // Track page unload events
  useEffect(() => {
    const handleBeforeUnload = () => {
      fireAbandonedCart("beforeunload");
    };
    
    const handlePageHide = () => {
      fireAbandonedCart("pagehide");
    };
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Only fire if cart has been active for at least 30 seconds
        if (lastCartCheck.current > 0 && Date.now() - lastCartCheck.current > 30000) {
          fireAbandonedCart("visibilitychange-hidden");
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Expose a manual test function
    if (typeof window !== "undefined") {
      (window as any).testAbandonedCart = () => {
        console.log("🧪 Manually testing AbandonedCart...");
        hasFired.current = false; // Reset for testing
        fireAbandonedCart("manual-test");
      };
      if (process.env.NODE_ENV === "development") {
        console.log("💡 Tip: Run testAbandonedCart() in console to manually test AbandonedCart event");
      }
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Reset flags when cart is cleared or purchase is completed
  useEffect(() => {
    const unsubscribe = useCartItemStore.subscribe((state) => {
      const itemCount = Object.keys(state.cartItems).length;
      
      // If cart is cleared, reset abandonment tracking
      if (itemCount === 0) {
        hasFired.current = false;
        lastCartCheck.current = 0;
      }
    });

    return unsubscribe;
  }, []);

  // Reset purchase completed flag when leaving order pages
  useEffect(() => {
    if (!pathname?.startsWith("/orders/")) {
      purchaseCompleted.current = false;
    }
  }, [pathname]);

  return null;
};


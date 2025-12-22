/**
 * Meta (Facebook) Pixel Event Tracking Helper
 * 
 * This module provides a reusable function to track events via Meta Pixel.
 * Supports standard events (PageView, ViewContent, AddToCart, Purchase, etc.)
 * and custom events (AbandonedCart, etc.)
 */

// Extend Window interface to include fbq
declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}

/**
 * Tracks a Meta Pixel event
 * 
 * @param event - The event name (e.g., "ViewContent", "AddToCart", "Purchase") or "custom" for custom events
 * @param payload - Event data. For standard events: { content_ids, content_name, value, currency, etc. }
 *                  For custom events: { name: "EventName", data: { ...eventData } }
 * 
 * @example Standard event:
 * trackMetaEvent("ViewContent", {
 *   content_ids: ["product-123"],
 *   content_name: "Premium T-Shirt",
 *   content_type: "product",
 *   value: 1499,
 *   currency: "INR"
 * });
 * 
 * @example Custom event:
 * trackMetaEvent("custom", {
 *   name: "AbandonedCart",
 *   data: { value: 2999, currency: "INR" }
 * });
 */
export const trackMetaEvent = (
  event: string,
  payload?: Record<string, any>
) => {
  if (typeof window !== "undefined" && window.fbq) {
    if (event === "custom") {
      window.fbq("trackCustom", payload?.name, payload?.data);
    } else {
      window.fbq("track", event, payload);
    }
  }
};

/**
 * Tracks ViewContent event for product pages
 */
export const trackViewContent = (product: {
  id: number | string;
  name: string;
  price: number;
  category?: string;
}) => {
  trackMetaEvent("ViewContent", {
    content_ids: [String(product.id)],
    content_name: product.name,
    content_type: "product",
    content_category: product.category,
    value: product.price,
    currency: "INR",
  });
};

/**
 * Tracks AddToCart event
 */
export const trackAddToCart = (product: {
  id: number | string;
  name: string;
  price: number;
  quantity?: number;
  sizeId?: number | string;
  sizeName?: string;
}) => {
  trackMetaEvent("AddToCart", {
    content_ids: [String(product.id)],
    content_name: product.name,
    content_type: "product",
    value: product.price * (product.quantity || 1),
    currency: "INR",
    // Custom attributes for better analytics
    size_id: product.sizeId ? String(product.sizeId) : undefined,
    size_name: product.sizeName,
  });
};

/**
 * Tracks Purchase event after successful order
 */
export const trackPurchase = (order: {
  id: string | number;
  totalAmount: number;
  items: Array<{
    productId: number | string;
    quantity: number;
    price: number;
  }>;
}) => {
  trackMetaEvent("Purchase", {
    transaction_id: String(order.id),
    value: order.totalAmount,
    currency: "INR",
    content_type: "product",
    contents: order.items.map((item) => ({
      id: String(item.productId),
      quantity: item.quantity,
      item_price: item.price,
    })),
  });
};

/**
 * Tracks AbandonedCart custom event
 */
export const trackAbandonedCart = (cart: {
  total: number;
  itemCount: number;
}) => {
  trackMetaEvent("custom", {
    name: "AbandonedCart",
    data: {
      value: cart.total,
      currency: "INR",
      num_items: cart.itemCount,
    },
  });
};


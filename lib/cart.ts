const CART_KEY = 'mavicure_cart';

export interface CartItem {
  bookingId: string;
  tourId: string;
  tourIndex: string;
  tourName: string;
  date: string;
  guests: string;
  totalCOP: number;
  customerName: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
}

export function getCartItems(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Support legacy single-item format
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}

export function addCartItem(item: CartItem): void {
  try {
    const items = getCartItems();
    const idx = items.findIndex((i) => i.bookingId === item.bookingId);
    if (idx >= 0) {
      items[idx] = item; // update existing
    } else {
      items.push(item);
    }
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function removeCartItem(bookingId: string): void {
  try {
    const items = getCartItems().filter((i) => i.bookingId !== bookingId);
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function clearCart(): void {
  try {
    localStorage.removeItem(CART_KEY);
  } catch {
    // ignore
  }
}

// Legacy compat — kept so old sessionStorage resume still works
export function getCartItem(): CartItem | null {
  const items = getCartItems();
  return items.length > 0 ? items[0] : null;
}

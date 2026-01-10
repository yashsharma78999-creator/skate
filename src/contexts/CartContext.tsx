import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

export interface CartProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

export interface CartItem {
  id: string;
  product: CartProduct;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (product: CartProduct, quantity: number, size?: string, color?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'skating_cart';
const OLD_CART_STORAGE_KEY = 'jpskating_cart';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load cart from localStorage on mount with migration support
  useEffect(() => {
    let savedCart = localStorage.getItem(CART_STORAGE_KEY);

    // Migration: if new key doesn't exist but old key does, migrate
    if (!savedCart) {
      const oldCart = localStorage.getItem(OLD_CART_STORAGE_KEY);
      if (oldCart) {
        try {
          const parsedCart = JSON.parse(oldCart);
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(parsedCart));
          localStorage.removeItem(OLD_CART_STORAGE_KEY);
          savedCart = oldCart;
        } catch {
          localStorage.removeItem(OLD_CART_STORAGE_KEY);
        }
      }
    }

    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch {
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
  }, []);

  // Save cart to localStorage when items change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const addItem = (product: CartProduct, quantity: number, size?: string, color?: string) => {
    const itemId = `${product.id}-${size || 'default'}-${color || 'default'}`;
    
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === itemId);
      
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prevItems, { id: itemId, product, quantity, size, color }];
    });

    toast({
      title: 'Added to cart!',
      description: `${quantity}x ${product.name} added to your cart.`,
    });
    
    setIsOpen(true);
  };

  const removeItem = (itemId: string) => {
    const itemToRemove = items.find(item => item.id === itemId);
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    if (itemToRemove) {
      toast({
        title: 'Removed from cart',
        description: `${itemToRemove.product.name} has been removed.`,
      });
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    if (items.length > 0) {
      setItems([]);
      toast({
        title: 'Cart cleared',
        description: 'All items have been removed from your cart.',
      });
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        total,
        isOpen,
        setIsOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

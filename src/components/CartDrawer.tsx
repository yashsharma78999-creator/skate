import { useState, useEffect } from 'react';
import { Minus, Plus, ShoppingBag, Trash2, X, Loader2, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Link, useNavigate } from 'react-router-dom';
import { productService } from '@/services/database';

const CartDrawer = () => {
  const navigate = useNavigate();
  const { items, itemCount, total, isOpen, setIsOpen, removeItem, updateQuantity, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [updatedItems, setUpdatedItems] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Fetch fresh product data when cart drawer opens
  useEffect(() => {
    if (isOpen && items.length > 0) {
      loadFreshProductData();
    }
  }, [isOpen, items]);

  // Reset checkout state when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setIsCheckingOut(false);
    }
  }, [isOpen]);

  const loadFreshProductData = async () => {
    try {
      setIsLoadingProducts(true);
      const itemsWithFreshData = await Promise.all(
        items.map(async (item) => {
          // Skip fresh data fetching for memberships
          if (item.product.category === 'Membership') {
            return item;
          }

          try {
            const freshProduct = await productService.getById(item.product.id);
            return {
              ...item,
              product: {
                ...item.product,
                name: freshProduct.name,
                price: freshProduct.price,
                description: freshProduct.description,
                image: freshProduct.image_url || item.product.image,
              },
            };
          } catch (error) {
            console.error(`Failed to load fresh data for product ${item.product.id}:`, error);
            return item; // Fallback to cached data if fetch fails
          }
        })
      );
      setUpdatedItems(itemsWithFreshData);
    } catch (error) {
      console.error('Error loading fresh product data:', error);
      setUpdatedItems(items);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleProceedCheckout = () => {
    setIsCheckingOut(true);
    setIsOpen(false);
    navigate('/checkout');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Your Cart ({itemCount})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added anything yet.
            </p>
            <Link to="/store" onClick={() => setIsOpen(false)}>
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {isLoadingProducts && (
                <div className="flex items-center justify-center py-4">
                  <div className="text-center">
                    <div className="inline-block mb-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                    <p className="text-xs text-muted-foreground">Updating prices...</p>
                  </div>
                </div>
              )}
              {(updatedItems.length > 0 ? updatedItems : items).map((item) => {
                const isMembership = item.product.category === 'Membership';
                return (
                <div
                  key={item.id}
                  className={`flex gap-3 p-3 rounded-lg hover:transition-colors duration-200 animate-in slide-in-from-right ${
                    isMembership
                      ? "bg-gradient-to-br from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border border-purple-200"
                      : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  <div className={`w-20 h-20 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center ${
                    isMembership
                      ? "bg-gradient-to-br from-purple-200 to-blue-200"
                      : "bg-muted"
                  }`}>
                    {isMembership ? (
                      <Award className="w-10 h-10 text-white" />
                    ) : (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <h4 className="font-medium text-foreground text-sm truncate flex-1">
                        {item.product.name}
                      </h4>
                      {isMembership && (
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-200 text-purple-900 whitespace-nowrap">
                          Membership
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isMembership ? "Premium access included" : (
                        <>
                          {item.size && `Size: ${item.size}`}
                          {item.size && item.color && ' • '}
                          {item.color && `Color: ${item.color}`}
                        </>
                      )}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-0.5 bg-background border border-border rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 hover:bg-muted transition-colors duration-150 active:scale-95"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-sm font-semibold min-w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 hover:bg-muted transition-colors duration-150 active:scale-95"
                          title="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-bold text-foreground text-right">
                        ₹{(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors duration-200 self-start hover:scale-110 active:scale-95"
                    title="Remove item"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
              })}
            </div>

            <div className="border-t border-border pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-2xl font-bold text-foreground">
                  ₹{(updatedItems.length > 0
                    ? updatedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
                    : total
                  ).toFixed(2)}
                </span>
              </div>

              <Button
                variant="gold"
                className="w-full"
                size="lg"
                disabled={isCheckingOut}
                onClick={handleProceedCheckout}
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Proceed to Checkout'
                )}
              </Button>
              
              <div className="flex gap-2">
                <Link to="/store" onClick={() => setIsOpen(false)} className="flex-1">
                  <Button variant="outline" className="w-full transition-colors duration-200 hover:border-accent hover:text-accent">
                    Continue Shopping
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearCart}
                  title="Clear cart"
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;

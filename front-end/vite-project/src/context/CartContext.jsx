import { createContext, useContext, useState, useCallback } from "react";
import api from "../services/api";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [cartLoading, setCartLoading] = useState(false);

    // Fetch cart from server
    const fetchCart = useCallback(async () => {
        try {
            setCartLoading(true);
            const res = await api.get("/cart");
            setCart(res.data.cart || []);
        } catch (err) {
            // Silently ignore — user might not be logged in
            setCart([]);
        } finally {
            setCartLoading(false);
        }
    }, []);

    // Clear cart locally (after checkout)
    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    // Derived: total number of items in cart
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Derived: total price
    const cartTotal = cart.reduce(
        (sum, item) => sum + (item.product?.price || 0) * item.quantity,
        0
    );

    return (
        <CartContext.Provider
            value={{ cart, setCart, cartCount, cartTotal, cartLoading, fetchCart, clearCart }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}

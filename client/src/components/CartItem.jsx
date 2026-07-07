import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();
  const { addToast } = useToast();

  const handleQtyChange = (e) => {
    const qty = Number(e.target.value);
    updateQuantity(item.book, qty);
    addToast(`Updated quantity for "${item.title}"`, 'info');
  };

  const handleRemove = () => {
    removeFromCart(item.book);
    addToast(`Removed "${item.title}" from cart`, 'info');
  };

  return (
    <div className="cart-item">
      <img src={item.coverImage} alt={item.title} />
      <div className="cart-item-info">
        <p className="cart-item-title">{item.title}</p>
        <p className="cart-item-price">₹{item.price} each</p>
      </div>
      <div className="cart-item-controls">
        <label htmlFor={`qty-${item.book}`} className="sr-only">
          Quantity for {item.title}
        </label>
        <input
          id={`qty-${item.book}`}
          type="number"
          min="1"
          max={item.stock || 99}
          value={item.quantity}
          onChange={handleQtyChange}
        />
        <button className="btn btn-sm btn-danger" onClick={handleRemove}>
          Remove
        </button>
      </div>
      <div className="cart-item-subtotal">₹{(item.price * item.quantity).toFixed(2)}</div>
    </div>
  );
}

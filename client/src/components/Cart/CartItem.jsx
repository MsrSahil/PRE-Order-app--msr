import React, { useCallback } from "react";
import { useDispatch } from "react-redux";
import { addItem, decreaseQuantity, removeItem } from "../../features/cart/cartSlice";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const CartItem = ({ item }) => {
  const dispatch = useDispatch();

  const onIncrease = useCallback(() => {
    dispatch(addItem(item));
  }, [dispatch, item]);

  const onDecrease = useCallback(() => {
    // If quantity is 1, decreasing should remove the item
    if (item.quantity <= 1) {
      dispatch(removeItem(item._id));
    } else {
      dispatch(decreaseQuantity(item._id));
    }
  }, [dispatch, item]);

  const onRemove = useCallback(() => {
    dispatch(removeItem(item._id));
  }, [dispatch, item]);

  const itemTotal = (item.price || 0) * (item.quantity || 0);

  return (
    <div className="flex items-center justify-between border-b py-4">
      <div>
        <h4 className="font-semibold">{item.name}</h4>
        <p className="text-gray-600">
          {currency.format(item.price)} x {item.quantity} = {currency.format(itemTotal)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onDecrease}
          className="px-2 h-8 w-8 flex items-center justify-center border rounded"
          aria-label={`Decrease quantity of ${item.name}`}
          title="Decrease"
        >
          -
        </button>
        <span aria-live="polite">{item.quantity}</span>
        <button
          onClick={onIncrease}
          className="px-2 h-8 w-8 flex items-center justify-center border rounded"
          aria-label={`Increase quantity of ${item.name}`}
          title="Increase"
        >
          +
        </button>
        <button
          onClick={onRemove}
          className="ml-4 text-red-500"
          aria-label={`Remove ${item.name} from cart`}
          title="Remove"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default CartItem;
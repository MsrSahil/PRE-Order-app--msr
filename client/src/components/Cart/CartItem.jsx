import React from "react";
import { useDispatch } from "react-redux";
import { addItem, decreaseQuantity, removeItem } from "../../features/cart/cartSlice";

const CartItem = ({ item }) => {
  const dispatch = useDispatch();

  return (
    <div className="flex items-center justify-between border-b py-4">
      <div>
        <h4 className="font-semibold">{item.name}</h4>
        <p className="text-gray-600">
          ₹{item.price} x {item.quantity} = ₹{item.price * item.quantity}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => dispatch(decreaseQuantity(item._id))} className="px-2 border rounded">-</button>
        <span>{item.quantity}</span>
        <button onClick={() => dispatch(addItem(item))} className="px-2 border rounded">+</button>
        <button onClick={() => dispatch(removeItem(item._id))} className="ml-4 text-red-500">X</button>
      </div>
    </div>
  );
};

export default CartItem;
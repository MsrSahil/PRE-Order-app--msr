import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-16">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          
          {/* Section 1: Brand */}
          <div>
            <h3 className="text-xl font-bold text-red-500 mb-2">PreOrder</h3>
            <p className="text-gray-400 text-sm">
              Skip the wait, not the meal. Your favorite food, ready when you are.
            </p>
          </div>

          {/* Section 2: Quick Links */}
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-gray-400 hover:text-white">Home</Link></li>
              <li><Link to="/restaurants" className="text-gray-400 hover:text-white">Restaurants</Link></li>
              <li><Link to="/my-orders" className="text-gray-400 hover:text-white">My Orders</Link></li>
            </ul>
          </div>

          {/* Section 3: Legal & Social */}
          <div>
             <h4 className="font-semibold mb-3">Connect with Us</h4>
             <div className="flex justify-center md:justify-start space-x-4 mb-4">
                <a href="#" className="text-gray-400 hover:text-white text-2xl">FB</a>
                <a href="#" className="text-gray-400 hover:text-white text-2xl">IG</a>
                <a href="#" className="text-gray-400 hover:text-white text-2xl">TW</a>
             </div>
             <div className="text-sm text-gray-400">
                <p>For support, email us at:</p>
                <a href="mailto:support@preorder.com" className="hover:text-white underline">support@preorder.com</a>
             </div>
          </div>

        </div>
        
        {/* Copyright Bar */}
        <div className="mt-8 pt-6 border-t border-gray-700 text-center text-sm text-gray-500">
          <p>&copy; 2025 PreOrder App by Mohd Swahil Rahmani. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
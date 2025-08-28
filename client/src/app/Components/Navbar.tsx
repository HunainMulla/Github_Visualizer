"use client";

import React from "react";

export default function DarkNavbar() {
  const navItems = ["Home", "Deals", "Events", "Trending", "About"];

  return (
    <nav className="bg-black text-white font-mono shadow-lg w-full z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="text-2xl font-bold uppercase tracking-widest text-white-100 hover:scale-110 transition-transform duration-300 cursor-pointer">
          EX
        </div>

        {/* Center: Navigation links */}
        <ul className="flex space-x-8">
          {navItems.map((item) => (
            <li
              key={item}
              className="relative group cursor-pointer text-white text-lg"
            >
              <span className="transition-all duration-300 group-hover:text-cyan-400">
                {item}
              </span>
              {/* Futuristic underline animation */}
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
            </li>
          ))}
        </ul>

        {/* Right: Auth buttons */}
        <div className="flex space-x-4">
          <button className="px-4 py-1 border border-white rounded hover:bg-cyan-400 hover:text-black transition-colors duration-300">
            Log In
          </button>
          <button className="px-4 py-1 bg-white text-black rounded hover:bg-cyan-400 hover:text-black transition-colors duration-300">
            Sign Up
          </button>
        </div>
      </div>
    </nav>
  );
}

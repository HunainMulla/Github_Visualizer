"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Navbar() {
  // const accessToken = localStorage.getItem("access_token");
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)


  useEffect(() => {
    if (localStorage.getItem("access_token")) {
      setAccessToken(localStorage.getItem("access_token"))
      return;
    }
    else {
      console.log("No access token found");
      return;
    }
  })

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navItems = ["Home", "Developer Insights", "Following", "Projects", "Repositeries"];


  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/";
  }


  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-black text-white font-mono shadow-lg w-full z-50 fixed top-0 left-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 text-2xl font-bold uppercase tracking-widest text-white hover:scale-110 transition-transform duration-300 cursor-pointer">
            EX
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <ul className="flex space-x-8">
              {navItems.map((item) => (
                <li
                  key={item}
                  className="relative group cursor-pointer text-white text-lg"
                >
                  <Link href={item === "Home" ? "/" : item.toLowerCase()} className="transition-all duration-300 group-hover:text-cyan-400">
                    {item}
                  </Link>
                  <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
                </li>
              ))}
            </ul>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!accessToken && <button onClick={() => {
              window.location.href = "/login"
            }} className="px-4 py-1 border border-white rounded hover:bg-cyan-400 hover:text-black transition-colors duration-300">
              Log In
            </button>}
            {!accessToken && <button onClick={() => {
              window.location.href = "/signup"
            }} className="px-4 py-1 bg-white text-black rounded hover:bg-cyan-400 hover:text-black transition-colors duration-300">
              Sign Up
            </button>}
            {accessToken && <button onClick={handleLogout} className="px-4 py-1 bg-white text-black rounded hover:bg-cyan-400 hover:text-black transition-colors duration-300">
              Logout
            </button>}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-white hover:text-cyan-400 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed left-0 right-0 bg-gray-900 transition-all duration-300 ease-in-out ${isMenuOpen
          ? 'top-16 opacity-100 visible'
          : '-top-full opacity-0 invisible'
          }`}
        style={{
          maxHeight: isMenuOpen ? 'calc(100vh - 4rem)' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease-in-out, opacity 0.3s ease-in-out, visibility 0.3s',
        }}
      >
        <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
          {navItems.map((item, index) => (
            <Link
              key={item}
              href={item.toLowerCase()}
              className={`block px-3 py-2 text-base font-medium text-white hover:bg-gray-800 rounded-md transform transition-all duration-200 ${isMenuOpen
                ? 'translate-x-0 opacity-100'
                : '-translate-x-4 opacity-0'
                }`}
              style={{
                transitionDelay: isMenuOpen ? `${index * 75}ms` : '0ms'
              }}
              onClick={() => setIsMenuOpen(false)}
            >
              {item}
            </Link>
          ))}
          <div className="pt-4 pb-3 border-t border-gray-700">
            <div className="flex flex-col space-y-3 px-2">
              <Link
                href="/login"
                className={`w-full px-4 py-2 border border-white rounded hover:bg-cyan-400 hover:text-black transition-all duration-300 transform ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  }`}
                style={{
                  transitionDelay: isMenuOpen ? `${navItems.length * 75}ms` : '0ms'
                }}
              >
                Log In
              </Link>
              <button
                className={`w-full px-4 py-2 bg-white text-black rounded hover:bg-cyan-400 hover:text-black transition-all duration-300 transform ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  }`}
                style={{
                  transitionDelay: isMenuOpen ? `${(navItems.length + 1) * 75}ms` : '0ms'
                }}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

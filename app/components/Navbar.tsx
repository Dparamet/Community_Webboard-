"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";

const AUTH_CHANGE_EVENT = "auth-change";

function subscribeAuth(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleChange = () => callback();
  window.addEventListener("storage", handleChange);
  window.addEventListener(AUTH_CHANGE_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(AUTH_CHANGE_EVENT, handleChange);
  };
}

function getUserIdSnapshot() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("userId");
}

function getUserNameSnapshot() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("userName");
}

function getServerSnapshot() {
  return null;
}

export default function Navbar() {
  const userId = useSyncExternalStore(subscribeAuth, getUserIdSnapshot, getServerSnapshot);
  const userName = useSyncExternalStore(subscribeAuth, getUserNameSnapshot, getServerSnapshot);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
    setIsOpen(false);
    router.push("/login");
  };

  // Hide navbar on auth pages
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <nav className="sticky top-0 bg-white shadow-md z-40">
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-blue-600 hover:text-blue-700 transition">
            <span>🚀</span>
            <span className="hidden sm:inline">Board</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {userId ? (
              <>
                <Link 
                  href="/create-post" 
                  className="text-gray-700 hover:text-blue-600 transition font-medium"
                >
                  ✏️ New
                </Link>
                <div className="flex items-center gap-3">
                  <span className="text-gray-700">👤 {userName}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-gray-700 hover:text-blue-600 transition font-medium"
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700 hover:text-blue-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-4">
            {userId ? (
              <>
                <Link 
                  href="/create-post" 
                  className="block text-gray-700 hover:text-blue-600 transition font-medium py-2"
                  onClick={() => setIsOpen(false)}
                >
                  ✏️ New Post
                </Link>
                <div className="py-2 text-gray-700">👤 {userName}</div>
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login"
                  className="block text-gray-700 hover:text-blue-600 transition font-medium py-2"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  href="/register"
                  className="block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
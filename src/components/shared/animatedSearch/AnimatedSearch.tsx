"use client";

import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";

export const AnimatedSearch = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Search trigger */}
      <div
        className="hidden md:flex flex-1 max-w-lg mx-8 cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            readOnly
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-2xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none text-sm cursor-pointer"
            placeholder="Search projects, users, blueprints..."
          />
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Content */}
            <motion.div
              initial={{ y: -30, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="mt-40 w-full max-w-2xl bg-white/90 rounded-[1.1rem] shadow-2xl overflow-hidden"
            >
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  autoFocus
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-12 py-4 text-lg border-b border-gray-200 focus:outline-none"
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Example results */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

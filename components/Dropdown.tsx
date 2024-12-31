"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

interface DropdownItem {
  label: string;
  href: string;
}

interface DropdownProps {
  title: string;
  /** Optional array of items if you want a basic link list */
  items?: DropdownItem[];
  /** Or pass children if you need custom content */
  children?: React.ReactNode;
  /** Additional styling (like margin classes) */
  className?: string;
}

/**
 * A reusable Dropdown that can:
 * - Render a simple list of items if `items` is provided.
 * - Render custom child elements if `children` is provided.
 */
export function Dropdown({
  title,
  items,
  children,
  className = "",
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleButtonBlur = () => {
    // Delay closing so onClick in child still fires
    setTimeout(() => {
      if (document.activeElement !== buttonRef.current) {
        setIsOpen(false);
      }
    }, 150);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        onBlur={handleButtonBlur}
        className="flex items-center text-gray-600 hover:text-orange-600 transition-colors text-base"
      >
        {title}
        <ChevronDown className="ml-1 h-4 w-4" />
      </button>

      {isOpen && (
        <div
          className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="dropdown-menu"
        >
          <div className="py-1">
            {/* If items exist, map them; otherwise render children */}
            {items
              ? items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    role="menuitem"
                  >
                    {item.label}
                  </Link>
                ))
              : children}
          </div>
        </div>
      )}
    </div>
  );
}

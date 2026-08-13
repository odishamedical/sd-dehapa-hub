"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export default function V2Breadcrumbs() {
  const pathname = usePathname();

  // If we are exactly on /v2, we don't necessarily need breadcrumbs, but the user wants them for SEO.
  // Let's show "Home > V2" on the V2 root, and expand it for subpages.
  
  if (!pathname || !pathname.startsWith('/v2')) {
    return null;
  }

  const pathSegments = pathname.split('/').filter(segment => segment !== '');

  return (
    <div className="w-full bg-[#0a2540] text-slate-300 border-b border-[#0a2540] px-4 md:px-8 py-2.5 flex items-center z-40 relative shadow-inner">
      <nav className="max-w-7xl mx-auto w-full flex text-[13px] font-medium tracking-wide" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-1 md:space-x-2">
          <li>
            <Link href="/" className="flex items-center hover:text-white transition-colors">
              <Home className="w-3.5 h-3.5 mr-1" />
              Main Site
            </Link>
          </li>
          
          {pathSegments.map((segment, index) => {
            const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
            const displayName = decodeURIComponent(segment)
              .replace(/-/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase());
            const isLast = index === pathSegments.length - 1;

            return (
              <React.Fragment key={href}>
                <li>
                  <ChevronRight className="w-4 h-4 text-slate-500 mx-0.5" />
                </li>
                <li>
                  {isLast ? (
                    <span className="text-white font-bold" aria-current="page">
                      {displayName}
                    </span>
                  ) : (
                    <Link href={href} className="hover:text-white transition-colors">
                      {displayName}
                    </Link>
                  )}
                </li>
              </React.Fragment>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

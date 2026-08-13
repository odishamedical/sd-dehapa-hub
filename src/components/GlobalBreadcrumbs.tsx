"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function GlobalBreadcrumbs() {
  const pathname = usePathname();

  // Don't show breadcrumbs on the absolute homepage or V2 platform
  if (!pathname || pathname === '/' || pathname.startsWith('/v2')) {
    return null;
  }

  // Split path into segments and remove empty strings
  const pathSegments = pathname.split('/').filter(segment => segment !== '');

  return (
    <nav className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 w-full" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center space-x-2 text-xs sm:text-sm text-slate-500">
        <li>
          <Link href="/" className="hover:text-blue-600 transition-colors font-medium">
            Home
          </Link>
        </li>
        
        {pathSegments.map((segment, index) => {
          // Construct the href up to this segment
          const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
          
          // Format the segment name (capitalize, replace hyphens)
          const displayName = decodeURIComponent(segment)
            .replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());

          const isLast = index === pathSegments.length - 1;

          return (
            <React.Fragment key={href}>
              <li>
                <svg className="w-4 h-4 text-slate-400 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </li>
              <li>
                {isLast ? (
                  <span className="font-bold text-slate-800" aria-current="page">
                    {displayName}
                  </span>
                ) : (
                  <Link href={href} className="hover:text-blue-600 transition-colors font-medium">
                    {displayName}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

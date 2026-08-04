"use client";

import React from 'react';
import Link from 'next/link';

interface BreadcrumbProps {
  paths: { name: string; href?: string }[];
}

export default function Breadcrumb({ paths }: BreadcrumbProps) {
  return (
    <nav className="flex items-center text-xs font-mono uppercase tracking-widest overflow-x-auto whitespace-nowrap pb-2 md:pb-0 scrollbar-hide">
      {paths.map((path, idx) => (
        <React.Fragment key={idx}>
          {path.href ? (
            <Link href={path.href} className="text-cyan-400 hover:text-cyan-300 transition-colors font-bold">
              {path.name}
            </Link>
          ) : (
            <span className="text-slate-300 font-bold">{path.name}</span>
          )}
          {idx < paths.length - 1 && (
            <svg className="w-3 h-3 text-slate-300 mx-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path>
            </svg>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

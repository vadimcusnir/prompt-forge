'use client'

import { HomeInteractive } from "@/components/home-interactive";

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function HomeInteractive() ({ children, ...props }: ThemeProviderProps) {
  return  <div>...</div>; {...props}>{children}</NextThemesProvider>
}

'use client'

import * as React from 'react'
import Link from 'next/link'

import { cn } from '@pachi/utils'

import { Icons } from '~/components/ui/icons'
import { NavigationMenuLink } from '~/components/ui/navigation-menu'
import { productCategories } from '~/config/products'
import { siteConfig } from '~/config/site'
import type { MainNavItem } from '~/types'

interface MainNavProps {
  items?: MainNavItem[]
}

export function MainNavContent({ items }: MainNavProps) {
  return (
    <div className="hidden  gap-6 md:flex">
      <Link
        aria-label="Home"
        href="/home"
        className="hidden items-center space-x-2 md:flex"
      >
        <Icons.logo className="h-6 w-6" aria-hidden="true" />
        <span className="hidden font-bold md:inline-block">
          {siteConfig.name}
        </span>
      </Link>
      <ul className="hidden gap-6 text-sm md:flex md:items-center">
        {productCategories.map((category) => (
          <li key={category.title}>
            <Link
              href={`/products/${category.title}`}
              className="text-slate-9 underline-offset-4 hover:text-slate-10 hover:underline "
            >
              {category.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = 'ListItem'

'use client'

import { NavMain } from '@/components/nav-main'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from '@/components/ui/sidebar'
import { MarkGithubIcon } from '@primer/octicons-react'
import {
  DropdownMenu,
  DropdownMenuTrigger
} from '@radix-ui/react-dropdown-menu'
import {
  DockIcon,
  GalleryVerticalEnd,
  type LucideIcon,
  SquareLibrary
} from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'
import { NavFooter } from './nav-footer'

const data = {
  teams: [
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise'
    }
  ],
  navMain: [
    {
      title: 'Categories',
      url: '#',
      icon: SquareLibrary,
      isActive: true,
      items: [
        {
          title: 'Enterprise',
          url: '/self-service/enterprise'
        },
        {
          title: 'Organization',
          url: '/self-service/organization'
        },
        {
          title: 'Repository',
          url: '/self-service/repository'
        }
      ]
    }
  ]
}

const footer = [
  {
    name: 'EficodeDemoOrg/self-service',
    url: 'https://github.com/EficodeDemoOrg/self-service',
    icon: MarkGithubIcon as LucideIcon
  }
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  asChild>
                  <Link href="/">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      <DockIcon className="h-4 w-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        IssueOps Self-Service
                      </span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavFooter projects={footer} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

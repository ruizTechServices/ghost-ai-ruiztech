"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";
import {
  Bell,
  CircleHelp,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Sun,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavbarProps {
  isSidebarOpen: boolean;
  onSidebarToggle: () => void;
  showSidebarToggle?: boolean;
}

const Navbar = ({
  isSidebarOpen,
  onSidebarToggle,
  showSidebarToggle = true,
}: NavbarProps) => {
  const [prefersLightPreview, setPrefersLightPreview] = useState(false);
  const { isSignedIn } = useAuth();
  const SidebarIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen;
  const ThemeIcon = prefersLightPreview ? Sun : Moon;

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-surface-border bg-gradient-to-r from-bg-surface via-bg-elevated to-bg-surface px-4 shadow-lg shadow-bg-base/40">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {showSidebarToggle && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                  variant="ghost"
                  size="icon-lg"
                  onClick={onSidebarToggle}
                />
              }
            >
              <SidebarIcon className="h-5 w-5" />
            </TooltipTrigger>
            <TooltipContent>
              {isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            </TooltipContent>
          </Tooltip>
        )}

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-normal text-copy-primary">
            Ghost AI RuizTech
          </p>
          <p className="hidden text-xs text-copy-muted sm:block">
            Collaborative system design workspace
          </p>
        </div>
      </div>

      <div aria-hidden className="hidden flex-1 justify-center md:flex" />

      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        {isSignedIn && (
          <Link
            className="hidden rounded-xl border border-surface-border bg-bg-subtle/70 px-3 py-2 text-sm font-medium text-copy-secondary transition-colors hover:bg-bg-elevated hover:text-copy-primary md:inline-flex"
            href="/protected-route-temp-page"
          >
            Workspace
          </Link>
        )}

        <label className="relative hidden w-full max-w-xs lg:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-copy-muted" />
          <Input
            aria-label="Search projects"
            className="h-9 rounded-xl border-surface-border bg-bg-subtle/70 pl-8 text-sm"
            placeholder="Search projects"
            type="search"
          />
        </label>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button aria-label="Search" variant="ghost" size="icon-lg" />
            }
          >
            <Search className="h-5 w-5" />
          </TooltipTrigger>
          <TooltipContent>Search</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button aria-label="Help" variant="ghost" size="icon-lg" />
            }
          >
            <CircleHelp className="h-5 w-5" />
          </TooltipTrigger>
          <TooltipContent>Help</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                aria-label="Notifications"
                variant="ghost"
                size="icon-lg"
              />
            }
          >
            <Bell className="h-5 w-5" />
          </TooltipTrigger>
          <TooltipContent>Notifications</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                aria-label="Toggle dark or light mode"
                aria-pressed={prefersLightPreview}
                variant="ghost"
                size="icon-lg"
                onClick={() => setPrefersLightPreview((current) => !current)}
              />
            }
          >
            <ThemeIcon className="h-5 w-5" />
          </TooltipTrigger>
          <TooltipContent>
            {prefersLightPreview ? "Light mode selected" : "Dark mode selected"}
          </TooltipContent>
        </Tooltip>

        {isSignedIn && (
          <UserButton showName userProfileMode="modal" />
        )}
      </div>
    </header>
  );
};

export { Navbar };

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import {
  LayoutDashboard,
  BookOpen,
  ShieldOff,
  Settings,
  BookMarked,
  LogIn,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "Quran", href: "/quran", icon: BookOpen },
  { title: "Blocked Sites", href: "/blocked-sites", icon: ShieldOff },
  { title: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { isAuthenticated } = useAuth();
  const { profile } = useProfile(isAuthenticated);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_QURAN_URL ?? "";
      const response = await fetch(`${baseUrl}/api/oauth`);
      const data = await response.json();
      console.log("Auth response:", data);
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_QURAN_URL ?? "";

      // Get id_token for logout
      const tokenResponse = await fetch("/api/auth/id-token");
      const tokenData = await tokenResponse.json();
      const idToken = tokenData.id_token;

      const logoutUrl = new URL(`${baseUrl}/api/logout`);
      if (idToken) {
        logoutUrl.searchParams.set("id_token", idToken);
      }

      const response = await fetch(logoutUrl.toString(), {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      await fetch("/api/logout", { method: "POST" });
      if (data.logoutUrl) {
        window.location.href = data.logoutUrl;
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      {/* ── Logo / App name ─────────────────────────── */}
      <SidebarHeader className="h-16 flex items-center px-6 border-b border-sidebar-border shrink-0 group-data-[collapsible=icon]:hidden">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Quran Discipline"
              className="pointer-events-none cursor-default hover:bg-transparent active:bg-transparent"
            >
              <div className="flex shrink-0 items-center justify-center rounded-[10px] size-8 bg-sidebar-accent">
                <BookMarked
                  className="shrink-0 size-[16px] text-sidebar-primary"
                  style={{ strokeWidth: 1.75 }}
                />
              </div>
              <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
                  Quran Discipline
                </span>
                <span className="text-[11px] text-sidebar-foreground/60">
                  Stay focused
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── Nav items ───────────────────────────────── */}
      <SidebarContent className="px-3 pt-4">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel
            className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/50"
            style={{ letterSpacing: "0.08em" }}
          >
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className="h-11 rounded-[6px] group-data-[collapsible=icon]:mb-4 px-4 text-sm transition-all duration-150 text-sidebar-foreground"
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-3"
                      >
                        <item.icon
                          style={{
                            width: 18,
                            height: 18,
                            strokeWidth: 1.75,
                            flexShrink: 0,
                          }}
                        />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer — user section ───────────────────── */}
      <SidebarFooter className="border-t border-sidebar-border px-3 py-3">
        <SidebarMenu className="gap-1">
          {isAuthenticated === false && (
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogin}
                disabled={isLoggingIn}
                tooltip="Login"
                className="h-11 rounded-[6px] px-4 text-sm transition-all duration-150 text-sidebar-foreground/70"
              >
                <LogIn style={{ width: 18, height: 18, strokeWidth: 1.75 }} />
                <span>{isLoggingIn ? "Logging in…" : "Login"}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {isAuthenticated && (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton
                  size="lg"
                  asChild
                  tooltip={profile?.username ?? "Settings"}
                  className="h-auto rounded-[10px] px-3 py-2.5 transition-all duration-150 hover:bg-sidebar-accent"
                >
                  <Link href="/settings" className="flex items-center gap-3">
                    <Avatar className="size-9 shrink-0 rounded-full">
                      {profile?.avatarUrls?.small && (
                        <AvatarImage
                          src={profile.avatarUrls.small}
                          alt={profile.username ?? "User avatar"}
                        />
                      )}
                      <AvatarFallback className="rounded-full text-xs font-medium bg-sidebar-accent text-sidebar-primary">
                        {profile
                          ? (
                              profile.firstName?.[0] ??
                              profile.username?.[0] ??
                              "U"
                            ).toUpperCase()
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-col leading-tight">
                      <span className="truncate text-sm font-medium text-sidebar-foreground">
                        {profile
                          ? profile.firstName && profile.lastName
                            ? `${profile.firstName} ${profile.lastName}`
                            : profile.username
                          : "User"}
                      </span>
                      <span className="truncate text-[11px] text-sidebar-foreground/60">
                        {profile?.username
                          ? `@${profile.username}`
                          : "View settings"}
                      </span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  tooltip="Logout"
                  className="h-10 rounded-[6px] px-4 text-sm transition-all duration-150 text-sidebar-foreground/70"
                >
                  <LogOut
                    style={{ width: 18, height: 18, strokeWidth: 1.75 }}
                  />
                  <span>{isLoggingOut ? "Logging out…" : "Logout"}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Search, Menu, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DashboardData } from "@/lib/types";
import Logo from "@/components/Logo";

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { data: dashboard } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
    enabled: !!user,
  });

  const unreadMessageCount = dashboard?.stats?.unreadMessageCount || 0;
  const pendingConnectionCount = dashboard?.stats?.pendingCount || 0;
  
  const hasNotifications = unreadMessageCount > 0 || pendingConnectionCount > 0;

  const handleLogout = () => {
    logout();
    // No need to set location as Replit Auth will handle the redirect
  };

  const isActive = (path: string) => location === path;

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/network", label: "Network" },
    { path: "/projects", label: "Projects" },
    { path: "/messages", label: "Messages" }
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Logo size="medium" />
            </div>
            <nav className="hidden md:ml-6 md:flex space-x-8">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <div
                    className={`inline-flex items-center px-1 pt-1 border-b-2 font-medium ${
                      isActive(item.path)
                        ? "border-primary-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {item.label}
                  </div>
                </Link>
              ))}
            </nav>
          </div>
          
          {user ? (
            <div className="flex items-center">
              <div className="flex-shrink-0 hidden sm:block">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search..."
                    className="w-64 bg-gray-100 rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
              
              <div className="ml-4 md:ml-6 flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5 text-gray-400" />
                      {hasNotifications && (
                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="font-medium text-sm p-2">Notifications</div>
                    <DropdownMenuSeparator />
                    {unreadMessageCount > 0 && (
                      <Link href="/messages">
                        <DropdownMenuItem asChild>
                          <span className="w-full cursor-pointer">
                            You have {unreadMessageCount} unread message{unreadMessageCount !== 1 ? 's' : ''}
                          </span>
                        </DropdownMenuItem>
                      </Link>
                    )}
                    {pendingConnectionCount > 0 && (
                      <Link href="/network">
                        <DropdownMenuItem asChild>
                          <span className="w-full cursor-pointer">
                            You have {pendingConnectionCount} pending connection{pendingConnectionCount !== 1 ? 's' : ''}
                          </span>
                        </DropdownMenuItem>
                      </Link>
                    )}
                    {!hasNotifications && (
                      <div className="px-2 py-4 text-sm text-center text-gray-500">
                        No new notifications
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <div className="ml-3 relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <Avatar>
                          <AvatarImage src={user.avatarUrl || ""} alt={(user.firstName || user.username)} />
                          <AvatarFallback>
                            {user.firstName ? user.firstName.substring(0, 1).toUpperCase() : 
                             user.username ? user.username.substring(0, 1).toUpperCase() : "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="font-medium text-sm px-2 py-1.5">
                        {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}
                      </div>
                      <div className="text-xs text-gray-500 px-2 pb-1.5">
                        {user.email}
                      </div>
                      <DropdownMenuSeparator />
                      <Link href={`/profile/${user.id}`}>
                        <DropdownMenuItem asChild>
                          <span className="w-full cursor-pointer">Profile</span>
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/projects">
                        <DropdownMenuItem asChild>
                          <span className="w-full cursor-pointer">My Projects</span>
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/network">
                        <DropdownMenuItem asChild>
                          <span className="w-full cursor-pointer">My Network</span>
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => window.location.href = "/api/login"}>
                Log in
              </Button>
              <Button onClick={() => window.location.href = "/api/login"}>
                Sign up
              </Button>
            </div>
          )}
          
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden shadow-lg">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <div 
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive(item.path)
                      ? "border-primary-500 text-primary-700 bg-primary-50"
                      : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </div>
              </Link>
            ))}
            
            {/* Mobile search */}
            <div className="px-4 pt-2">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search..."
                  className="w-full bg-gray-100 rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

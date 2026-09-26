import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

// Since mockData might not exist yet, we define a fallback or assume it exists.
// In a real scenario, this would be imported from '@/data/mockData'
const mockUser = {
  name: 'Ahmed Khan',
  initials: 'AK',
};

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
        <Menu className="h-6 w-6" aria-hidden="true" />
        <span className="sr-only">Open sidebar</span>
      </Button>

      {/* Separator for mobile */}
      <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 items-center justify-between gap-x-4 lg:max-w-7xl lg:mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 truncate">{title}</h1>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Search */}
          <div className="hidden md:flex relative max-w-md w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </div>
            <Input
              type="search"
              placeholder="Search..."
              className="pl-10 w-64 rounded-full bg-gray-50 border-gray-200 focus-visible:ring-blue-500"
            />
          </div>

          <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-gray-500">
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
            <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </Button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

          {/* Profile dropdown */}
          <div className="flex items-center gap-x-4">
            <Button variant="ghost" className="hidden lg:flex items-center gap-x-2 -m-1.5 p-1.5 hover:bg-gray-50">
              <span className="sr-only">Open user menu</span>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-100 text-blue-700">{mockUser.initials}</AvatarFallback>
              </Avatar>
              <span className="hidden lg:flex lg:items-center">
                <span className="text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">
                  {mockUser.name}
                </span>
              </span>
            </Button>
            
            <div className="lg:hidden">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-100 text-blue-700">{mockUser.initials}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

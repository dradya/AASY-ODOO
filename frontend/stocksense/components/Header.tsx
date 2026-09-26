import { Menu, Search, Bell } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { mockUser } from '../data/mockData';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  const initials = mockUser.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-card/80 backdrop-blur px-4 sm:px-6 lg:px-8">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
        <Menu className="h-5 w-5" aria-hidden="true" />
        <span className="sr-only">Open sidebar</span>
      </Button>

      <div className="h-6 w-px bg-border lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 items-center justify-between gap-x-4">
        <h1 className="font-heading text-xl font-bold text-foreground truncate">{title}</h1>

        <div className="flex items-center gap-x-3 sm:gap-x-4">
          <div className="hidden md:flex relative w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-9 rounded-full bg-muted/50 border-transparent focus-visible:bg-background"
            />
          </div>

          <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
            <span className="sr-only">View notifications</span>
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-card" />
          </Button>

          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" aria-hidden="true" />

          <div className="flex items-center gap-x-2.5">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden lg:block text-sm font-medium text-foreground">
              {mockUser.name}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

import { Menu, Search, Bell, ChevronDown } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { mockUser } from '../data/mockData';

interface HeaderProps {
  onMenuClick: () => void;
  pageTitle: string;
}

export default function Header({ onMenuClick, pageTitle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-20 shrink-0 items-center gap-4 bg-background/80 backdrop-blur-xl px-4 sm:px-6 lg:px-8 border-b border-border/40 shadow-sm transition-all">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden text-muted-foreground hover:text-foreground"
        onClick={onMenuClick}
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">Open sidebar</span>
      </Button>

      <div className="flex flex-1 items-center justify-between gap-6">
        <div className="flex items-center gap-4 flex-1">
          <h1 className="hidden sm:block text-2xl font-bold tracking-tight text-foreground font-heading">
            {pageTitle}
          </h1>
          <div className="sm:hidden text-lg font-bold font-heading">{pageTitle}</div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="relative hidden md:block w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search anything..."
              className="w-full rounded-full bg-muted/50 pl-10 pr-4 h-10 border-transparent focus-visible:ring-primary/20 focus-visible:border-primary/30 focus-visible:bg-background transition-all"
            />
          </div>

          <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full h-10 w-10 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-background" />
            <span className="sr-only">View notifications</span>
          </Button>

          <div className="flex items-center gap-3 pl-2 sm:pl-4 sm:border-l sm:border-border/50 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-foreground leading-none mb-1">{mockUser.name}</p>
              <p className="text-xs text-muted-foreground leading-none">{mockUser.role}</p>
            </div>
            <Avatar className="h-10 w-10 border-2 border-border/50 shadow-sm">
              <AvatarImage src={mockUser.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">{mockUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <ChevronDown className="hidden sm:block h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </header>
  );
}

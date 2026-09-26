import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';
import {
  LayoutDashboard,
  Package,
  PackageCheck,
  Truck,
  ArrowLeftRight,
  ClipboardList,
  History,
  LogOut,
  Boxes,
} from 'lucide-react';
import { Sheet, SheetContent } from './ui/sheet';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Receipts', href: '/receipts', icon: PackageCheck },
  { name: 'Delivery Orders', href: '/deliveries', icon: Truck },
  { name: 'Internal Transfers', href: '/transfers', icon: ArrowLeftRight },
  { name: 'Inventory Adjustments', href: '/adjustments', icon: ClipboardList },
  { name: 'Move History', href: '/move-history', icon: History },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'group flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-300 relative',
    isActive
      ? 'text-white bg-gradient-to-r from-primary/20 to-transparent'
      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
  );

const SidebarContent = ({ onClick }: { onClick?: () => void }) => {
  return (
    <div className="flex h-full w-full flex-col bg-[#0B1120] text-sidebar-foreground relative overflow-hidden">
      {/* Subtle top gradient */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none opacity-50" />
      
      <div className="relative flex h-20 shrink-0 items-center gap-3 px-6 z-10">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
          <Boxes className="h-5 w-5 text-white" />
        </div>
        <span className="font-heading text-xl font-bold tracking-tight text-white/90">
          StockSense
        </span>
      </div>

      <div className="relative flex-1 overflow-y-auto py-4 scrollbar-thin z-10">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.name} to={item.href} onClick={onClick} className={navLinkClass}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-md" />
                  )}
                  <item.icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0 transition-colors",
                      isActive ? "text-indigo-400" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
                    )}
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
      
      {/* Scroll area bottom gradient fade */}
      <div className="absolute bottom-20 left-0 right-0 h-10 bg-gradient-to-t from-[#0B1120] to-transparent pointer-events-none z-10" />

      <div className="relative border-t border-white/5 p-4 shrink-0 z-10">
        <button
          onClick={() => { onClick?.(); }}
          className="group flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-all duration-300 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-5 w-5 flex-shrink-0 text-sidebar-foreground/50 group-hover:text-red-400 transition-colors" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="left" className="p-0 w-72 border-r-0 bg-[#0B1120]">
          <SidebarContent onClick={onClose} />
        </SheetContent>
      </Sheet>
      <aside className="hidden lg:flex w-72 flex-col flex-shrink-0 shadow-2xl">
        <SidebarContent />
      </aside>
    </>
  );
}

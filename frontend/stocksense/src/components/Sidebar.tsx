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
  Warehouse,
  User,
  LogOut,
  Boxes,
} from 'lucide-react';
import { Sheet, SheetContent } from './ui/sheet';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  {
    section: 'Main',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Products', href: '/products', icon: Package },
    ],
  },
  {
    section: 'Operations',
    items: [
      { name: 'Receipts', href: '/receipts', icon: PackageCheck },
      { name: 'Delivery Orders', href: '/deliveries', icon: Truck },
      { name: 'Internal Transfers', href: '/transfers', icon: ArrowLeftRight },
      { name: 'Inventory Adjustments', href: '/adjustments', icon: ClipboardList },
      { name: 'Move History', href: '/move-history', icon: History },
    ],
  },
  {
    section: 'Management',
    items: [{ name: 'Warehouse', href: '/warehouse', icon: Warehouse }],
  },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
  );

const SidebarContent = ({ onClick }: { onClick?: () => void }) => {
  return (
    <div className="flex h-full w-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 shrink-0 items-center gap-2.5 px-6 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg brand-gradient shadow-lg shadow-primary/30">
          <Boxes className="h-4.5 w-4.5 text-white" />
        </div>
        <span className="font-heading text-lg font-bold tracking-tight text-white">StockSense</span>
      </div>

      <div className="flex-1 overflow-y-auto py-5 scrollbar-thin">
        <nav className="space-y-6 px-3">
          {navigation.map((group) => (
            <div key={group.section}>
              <h3 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40 mb-2">
                {group.section}
              </h3>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink key={item.name} to={item.href} onClick={onClick} className={navLinkClass}>
                    <item.icon className="h-4.5 w-4.5 flex-shrink-0" />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t border-sidebar-border p-3 space-y-0.5 shrink-0">
        <NavLink to="/profile" onClick={onClick} className={navLinkClass}>
          <User className="h-4.5 w-4.5 flex-shrink-0" />
          My Profile
        </NavLink>
        <button
          onClick={() => {
            onClick?.();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <LogOut className="h-4.5 w-4.5 flex-shrink-0" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="left" className="p-0 w-72 border-r-0">
          <SidebarContent onClick={onClose} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar — a normal flex item (not fixed), so it reserves
          space in the parent flex layout instead of overlapping content */}
      <aside className="hidden lg:flex w-64 flex-col flex-shrink-0">
        <SidebarContent />
      </aside>
    </>
  );
}

import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from 'cn';
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
  Box,
} from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';

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
    items: [
      { name: 'Warehouse', href: '/warehouse', icon: Warehouse },
    ],
  },
];

const SidebarContent = ({ onClick }: { onClick?: () => void }) => {
  return (
    <div className="flex h-full w-full flex-col bg-slate-900 text-white">
      <div className="flex h-16 shrink-0 items-center px-6 font-bold text-xl tracking-tight gap-2 border-b border-slate-800">
        <Box className="h-6 w-6 text-blue-500" />
        StockSense
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-slate-700">
        <nav className="space-y-6 px-4">
          {navigation.map((group) => (
            <div key={group.section}>
              <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                {group.section}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={onClick}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-full px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      )
                    }
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t border-slate-800 p-4 space-y-1 shrink-0">
        <NavLink
          to="/profile"
          onClick={onClick}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-full px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            )
          }
        >
          <User className="h-5 w-5 flex-shrink-0" />
          My Profile
        </NavLink>
        <button
          onClick={() => {
            console.log('Logout clicked');
            alert('Logout clicked');
            onClick?.();
          }}
          className="flex w-full items-center gap-3 rounded-full px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
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
        <SheetContent side="left" className="p-0 w-72 border-r-0 bg-slate-900">
          <SidebarContent onClick={onClose} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 left-0 z-50">
        <SidebarContent />
      </aside>
    </>
  );
}

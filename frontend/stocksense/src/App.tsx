import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Construction } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { Dashboard } from './pages/Dashboard';
import Products from './pages/Products';
import Receipts from './pages/Receipts';
import Deliveries from './pages/Deliveries';
import Transfers from './pages/Transfers';
import Adjustments from './pages/Adjustments';
import MoveHistory from './pages/MoveHistory';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/products': 'Products',
  '/receipts': 'Receipts',
  '/deliveries': 'Delivery Orders',
  '/transfers': 'Internal Transfers',
  '/adjustments': 'Inventory Adjustments',
  '/move-history': 'Move History',
  '/warehouse': 'Warehouse',
  '/profile': 'My Profile',
};

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-24">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <Construction className="h-6 w-6 text-primary" />
      </div>
      <h2 className="font-heading text-lg font-semibold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground max-w-xs">
        This module is on the roadmap and isn't wired up yet in this build.
      </p>
    </div>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ?? 'StockSense';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title={title} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/receipts" element={<Receipts />} />
          <Route path="/deliveries" element={<Deliveries />} />
          <Route path="/transfers" element={<Transfers />} />
          <Route path="/adjustments" element={<Adjustments />} />
          <Route path="/move-history" element={<MoveHistory />} />

          {/* Still on the roadmap for a future iteration */}
          <Route path="/warehouse" element={<ComingSoon title="Warehouse" />} />
          <Route path="/profile" element={<ComingSoon title="My Profile" />} />

          <Route path="*" element={<ComingSoon title="Page Not Found" />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;

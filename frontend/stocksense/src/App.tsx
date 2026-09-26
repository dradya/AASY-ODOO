import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Receipts from './pages/Receipts';
import Deliveries from './pages/Deliveries';
import Transfers from './pages/Transfers';
import Adjustments from './pages/Adjustments';
import MoveHistory from './pages/MoveHistory';
import { Search } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/products': 'Products',
  '/receipts': 'Receipts',
  '/deliveries': 'Delivery Orders',
  '/transfers': 'Internal Transfers',
  '/adjustments': 'Inventory Adjustments',
  '/move-history': 'Move History',
};

// Subtle fade-in transition wrapper for routes
function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fadeIn');

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('fadeOut');
    }
  }, [location, displayLocation]);

  return (
    <div
      className={`${transitionStage === 'fadeIn' ? 'animate-in fade-in duration-500' : 'animate-out fade-out duration-300'}`}
      onAnimationEnd={() => {
        if (transitionStage === 'fadeOut') {
          setTransitionStage('fadeIn');
          setDisplayLocation(location);
        }
      }}
    >
      {children}
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-4">
      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
        <Search className="h-10 w-10 opacity-50" />
      </div>
      <h2 className="text-2xl font-bold text-foreground font-heading">Page Not Found</h2>
      <p className="text-muted-foreground max-w-sm">
        We couldn't find the page you're looking for. It might have been moved or doesn't exist.
      </p>
    </div>
  );
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  const currentTitle = PAGE_TITLES[location.pathname] || 'StockSense';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header 
          onMenuClick={() => setSidebarOpen(true)} 
          pageTitle={currentTitle}
        />
        
        <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-background p-4 sm:p-6 lg:p-8 scrollbar-thin">
          <div className="mx-auto max-w-7xl">
            <PageTransition>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/receipts" element={<Receipts />} />
                <Route path="/deliveries" element={<Deliveries />} />
                <Route path="/transfers" element={<Transfers />} />
                <Route path="/adjustments" element={<Adjustments />} />
                <Route path="/move-history" element={<MoveHistory />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

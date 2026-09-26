import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeftRight, Boxes, ChartNoAxesColumn, ChevronDown, ClipboardCheck, ClipboardList, LayoutDashboard, LogOut, MapPin, Menu, Package, Search, Settings, Truck, Warehouse, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { supabase } from '../../services'
import type { Profile } from '../../types'

const sections: { title: string; links: [string, string, LucideIcon][] }[] = [
  { title: 'OVERVIEW', links: [['Dashboard','/dashboard', LayoutDashboard]] },
  { title: 'OPERATIONS', links: [['Receipts','/receipts', ClipboardCheck], ['Deliveries','/deliveries', Truck], ['Internal Transfers','/transfers', ArrowLeftRight], ['Adjustments','/adjustments', ClipboardList]] },
  { title: 'CATALOG', links: [['Stock','/stock', Boxes], ['Products','/products', Package]] },
  { title: 'WAREHOUSE', links: [['Warehouses','/warehouses', Warehouse], ['Locations','/locations', MapPin]] },
  { title: 'INSIGHTS', links: [['Move History','/moves', ChartNoAxesColumn], ['Settings','/settings', Settings]] },
]

export default function Layout({ children, profile }: { children: React.ReactNode; profile: Profile }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const title = sections.flatMap(s => s.links).find(l => location.pathname.startsWith(l[1]) && l[1] !== '/dashboard')?.[0] || (location.pathname === '/dashboard' ? 'Dashboard' : 'Workspace')
  return <div className="shell">
    {open && <div className="scrim" onClick={() => setOpen(false)} />}
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-icon"><Boxes size={21}/></div><div><strong>StockSense</strong><small>INVENTORY CONTROL</small></div><button className="mobile-close" onClick={() => setOpen(false)} aria-label="Close menu"><X size={20}/></button></div>
      <nav>{sections.map(section => <div className="nav-section" key={section.title}><span>{section.title}</span>{section.links.map(([name, path, Icon]) => <NavLink key={path} to={path} onClick={() => setOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={18}/>{name}</NavLink>)}</div>)}</nav>
      <div className="sidebar-bottom"><div className="avatar">{profile.full_name?.charAt(0).toUpperCase() || 'U'}</div><div className="sidebar-user"><strong>{profile.full_name || profile.email}</strong><small>{profile.role}</small></div><button title="Log out" aria-label="Log out" onClick={() => supabase.auth.signOut()}><LogOut size={18}/></button></div>
    </aside>
    <div className="main-area"><header className="topbar"><div className="topbar-left"><button className="menu-btn" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={22}/></button><span className="breadcrumb">Workspace</span><span className="slash">/</span><strong>{title}</strong><ChevronDown className="top-chevron" size={15}/></div><div className="topbar-right"><form className="global-search" onSubmit={e => { e.preventDefault(); navigate(`/products?search=${encodeURIComponent(search)}`) }}><Search size={17}/><input aria-label="Search products" placeholder="Search products or SKU…" value={search} onChange={e => setSearch(e.target.value)}/><kbd>↵</kbd></form><div className="top-avatar" title={profile.email}>{profile.full_name?.charAt(0).toUpperCase() || 'U'}</div></div></header><main>{children}</main></div>
  </div>
}

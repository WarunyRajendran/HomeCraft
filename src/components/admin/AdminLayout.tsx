import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import {
  Box,
  LayoutDashboard,
  Sofa,
  Building2,
  FolderTree,
  ArrowLeft,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/furniture', icon: Sofa, label: 'Meubles' },
  { to: '/admin/partners', icon: Building2, label: 'Partenaires' },
  { to: '/admin/categories', icon: FolderTree, label: 'Catégories' },
];

export const AdminLayout = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.signOut();
      toast.success('Déconnexion réussie');
      navigate('/auth');
    } catch {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const SidebarContent = ({ showLogo = true }: { showLogo?: boolean }) => (
    <>
      {/* Logo - only on desktop */}
      {showLogo && (
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl gradient-gold flex items-center justify-center">
              <Box className="w-5 h-5 text-black" />
            </div>
            <div>
              <span className="font-display text-lg font-bold text-foreground">HomeCraft</span>
              <span className="block text-xs text-muted-foreground">Administration</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => {
            navigate('/dashboard');
            closeMobileMenu();
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'app
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-muted flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 bg-background border-b border-border px-2 py-3 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl gradient-gold flex items-center justify-center">
            <Box className="w-4 h-4 text-black" />
          </div>
          <div>
            <span className="font-display text-base font-bold text-foreground">HomeCraft</span>
            <span className="block text-xs text-muted-foreground">Administration</span>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 top-[73px] z-30 bg-black/50"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`md:hidden fixed top-[73px] left-0 z-40 h-[calc(100vh-73px)] w-64 bg-background border-r border-border flex flex-col transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent showLogo={false} />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-background border-r border-border flex-col sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

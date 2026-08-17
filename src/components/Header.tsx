import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  MapPin, 
  PlusCircle, 
  Layers, 
  Newspaper, 
  MessageSquareQuote, 
  FileText, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X,
  ChevronDown,
  Shield
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  city: string;
  area: string;
  onOpenLocationModal: () => void;
  user: UserProfile | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onOpenReportModal: () => void;
  onOpenCivicRightsModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  city,
  area,
  onOpenLocationModal,
  user,
  onOpenAuthModal,
  onLogout,
  onOpenReportModal,
  onOpenCivicRightsModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', urdu: 'مرکزی صفحہ' },
    { id: 'issues', label: 'Civic Issues', urdu: 'عوامی مسائل', icon: Layers },
    { id: 'report', label: 'Report a Problem', urdu: 'مسئلہ درج کریں', icon: PlusCircle, isHighlight: true },
    { id: 'news', label: 'News & Updates', urdu: 'خبریں و اعلانات', icon: Newspaper },
    { id: 'chat', label: 'Ask ShehriAwaz', urdu: 'معاون شہری آواز', icon: MessageSquareQuote },
    { id: 'my-reports', label: 'My Reports', urdu: 'میری رپورٹیں', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0F3D2A] text-white shadow-md border-b border-emerald-950" id="main-header">
      {/* Top utility location strip */}
      <div className="bg-[#09291C] px-4 py-1.5 border-b border-emerald-900/60 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-200/90 font-medium">Public Civic Information & Reporting Platform</span>
          </div>

          {/* Location Badge - Always Visible */}
          <button
            onClick={onOpenLocationModal}
            className="flex items-center gap-1.5 bg-emerald-900/80 hover:bg-emerald-800 text-white px-2.5 py-1 rounded-md border border-emerald-700/50 transition cursor-pointer"
            id="header-location-badge"
            title="Click to change your viewing city and area"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-300" />
            <span className="font-semibold text-emerald-100">Viewing:</span>
            <span className="font-bold text-white underline decoration-emerald-400/60 decoration-1 underline-offset-2">
              {city} • {area}
            </span>
            <span className="text-[10px] text-emerald-300 ml-1 font-medium bg-emerald-950/60 px-1 py-0.5 rounded">
              Change ▼
            </span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo Brand */}
          <div 
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-3 cursor-pointer select-none group"
            id="brand-logo"
          >
            <div className="w-11 h-11 rounded-lg bg-white flex items-center justify-center shadow-xs border border-emerald-200">
              <span className="font-serif font-black text-2xl text-[#0F3D2A] leading-none">ش</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-serif font-bold tracking-tight text-white group-hover:text-emerald-200 transition">
                  ShehriAwaz
                </span>
                <span className="text-sm font-urdu text-emerald-300 font-bold">
                  شہری آواز
                </span>
              </div>
              <span className="text-[11px] text-emerald-200/80 font-medium tracking-wide">
                Your voice about your city.
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1" id="desktop-nav">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              
              if (item.isHighlight) {
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      onOpenReportModal();
                    }}
                    className="ml-2 mr-2 inline-flex items-center gap-1.5 bg-[#B88917] hover:bg-[#a37913] text-stone-950 font-bold px-4 py-2 rounded-lg shadow-sm transition transform hover:-translate-y-0.5 active:translate-y-0"
                    id={`nav-link-${item.id}`}
                  >
                    <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                    <span>{item.label}</span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-900/90 text-white shadow-xs border border-emerald-700/60'
                      : 'text-emerald-100 hover:text-white hover:bg-emerald-900/50'
                  }`}
                  id={`nav-link-${item.id}`}
                >
                  {item.icon && <item.icon className="w-4 h-4 opacity-80" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Civic Rights Guide */}
          {onOpenCivicRightsModal && (
            <button
              onClick={onOpenCivicRightsModal}
              className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-200/80 hover:text-emerald-100 px-2.5 py-1.5 rounded-lg hover:bg-emerald-900/40 transition font-medium"
              id="btn-civic-rights"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Rights Guide</span>
            </button>
          )}

          {/* Right Auth controls */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 bg-emerald-900/80 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg border border-emerald-700/60 transition"
                  id="btn-user-profile-menu"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-700 flex items-center justify-center text-xs font-bold">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold max-w-[130px] truncate">{user.full_name}</span>
                  <ChevronDown className="w-4 h-4 text-emerald-300" />
                </button>

                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-stone-200 py-2 text-stone-800 z-50 animate-in fade-in zoom-in-95 duration-100"
                    id="user-dropdown-menu"
                  >
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs text-stone-500">Signed in as</p>
                      <p className="text-sm font-bold truncate text-stone-900">{user.full_name}</p>
                      <p className="text-xs text-emerald-800 font-medium">{user.city} • {user.area}</p>
                    </div>

                    <button
                      onClick={() => {
                        onSelectTab('my-reports');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-stone-50 flex items-center gap-2 text-stone-700 font-medium"
                      id="dropdown-link-my-reports"
                    >
                      <FileText className="w-4 h-4 text-stone-500" />
                      My Reports
                    </button>

                    <button
                      onClick={() => {
                        onOpenLocationModal();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-stone-50 flex items-center gap-2 text-stone-700 font-medium"
                      id="dropdown-link-change-area"
                    >
                      <MapPin className="w-4 h-4 text-stone-500" />
                      Change City / Area
                    </button>

                    <div className="border-t border-stone-100 my-1"></div>

                    <button
                      onClick={() => {
                        onLogout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-700 flex items-center gap-2 font-medium"
                      id="dropdown-link-logout"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg bg-white text-[#0F3D2A] hover:bg-emerald-50 transition shadow-xs"
                id="btn-login-signup"
              >
                <UserIcon className="w-4 h-4" />
                <span>Login / Sign Up</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => onSelectTab('report')}
              className="bg-[#B88917] text-stone-950 font-bold text-xs px-3 py-1.5 rounded-md flex items-center gap-1 shadow-xs"
              id="mobile-quick-report-btn"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-900 transition"
              aria-label="Toggle navigation menu"
              id="btn-mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#09291C] border-t border-emerald-900 px-4 pt-3 pb-6 space-y-2" id="mobile-menu">
          
          {/* User profile banner on mobile */}
          {user ? (
            <div className="bg-emerald-950/80 p-3 rounded-lg border border-emerald-800 flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-emerald-300">Signed in citizen</p>
                <p className="text-sm font-bold text-white">{user.full_name}</p>
                <p className="text-xs text-emerald-400">{user.city} • {user.area}</p>
              </div>
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-red-300 hover:text-red-100 flex items-center gap-1 bg-red-950/60 px-2.5 py-1.5 rounded"
                id="mobile-logout-btn"
              >
                <LogOut className="w-3 h-3" />
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onOpenAuthModal();
                setMobileMenuOpen(false);
              }}
              className="w-full mb-3 py-2.5 bg-white text-[#0F3D2A] rounded-lg font-bold text-sm flex items-center justify-center gap-2"
              id="mobile-login-btn"
            >
              <UserIcon className="w-4 h-4" />
              Login / Sign Up
            </button>
          )}

          {/* Navigation Links */}
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between ${
                  item.isHighlight
                    ? 'bg-[#B88917] text-stone-950 font-bold'
                    : isActive
                    ? 'bg-emerald-900 text-white font-bold'
                    : 'text-emerald-100 hover:bg-emerald-900/60'
                }`}
                id={`mobile-nav-${item.id}`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon && <item.icon className="w-4 h-4 opacity-90" />}
                  <span>{item.label}</span>
                </div>
                <span className="text-xs opacity-75 font-urdu">{item.urdu}</span>
              </button>
            );
          })}

          {/* Location Changer on Mobile */}
          <div className="pt-2">
            <button
              onClick={() => {
                onOpenLocationModal();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 px-3 rounded-lg border border-emerald-700 bg-emerald-950/60 text-xs font-semibold text-emerald-200 flex items-center justify-center gap-1.5"
              id="mobile-change-location-btn"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Change City/Area: {city} • {area}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

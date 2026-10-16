import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Menu, X } from 'lucide-react';
import { EcladerLogo } from '../common/EcladerLogo';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    setCurrentUser, 
    users, 
    activeScreen, 
    setActiveScreen,
    resetDemoData 
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleToggleRole = () => {
    if (currentUser.role === 'consumer') {
      const techUser = users.find((u) => u.role === 'technician') || users[1];
      setCurrentUser(techUser);
      setActiveScreen(9); // Navigate to technician dashboard
    } else {
      const consumerUser = users.find((u) => u.role === 'consumer') || users[0];
      setCurrentUser(consumerUser);
      setActiveScreen(3); // Navigate to consumer dashboard
    }
  };

  return (
    <header className="sticky top-0 w-full z-50 bg-[#faf8ff]/90 backdrop-blur-md border-b border-[#bdc9c2] shadow-[0_1px_8px_rgba(10,37,64,0.04)] font-sans">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-10 flex items-center justify-between gap-6">
        
        {/* Logo & Platform Info */}
        <div className="flex items-center gap-6 shrink-0">
          <button
            onClick={() => setActiveScreen(1)}
            className="flex items-center gap-2.5 cursor-pointer text-left group"
          >
            <EcladerLogo variant="icon" size={38} className="group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <span className="font-['Plus_Jakarta_Sans'] font-black text-lg text-[#131b2e] leading-tight tracking-wider">
                ECLADER
              </span>
              <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#007a5e] font-bold leading-none tracking-wider uppercase">
                Circular Electronics Intelligence
              </span>
            </div>
          </button>

          {/* Navigation Bar Links */}
          <nav className="hidden xl:flex items-center gap-1 font-['Plus_Jakarta_Sans'] text-sm">
            <button
              onClick={() => setActiveScreen(3)}
              className={`px-3 py-1.5 transition-colors rounded-lg font-semibold cursor-pointer ${
                activeScreen === 3 ? 'bg-[#e2e7ff] text-[#131b2e]' : 'text-[#3e4944] hover:bg-[#e2e7ff] hover:text-[#131b2e]'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveScreen(4)}
              className={`px-3 py-1.5 transition-colors rounded-lg font-semibold cursor-pointer ${
                activeScreen === 4 || activeScreen === 5 ? 'bg-[#e2e7ff] text-[#131b2e]' : 'text-[#3e4944] hover:bg-[#e2e7ff] hover:text-[#131b2e]'
              }`}
            >
              Assess Device
            </button>
            <button
              onClick={() => setActiveScreen(8)}
              className={`px-3 py-1.5 transition-colors rounded-lg font-semibold cursor-pointer ${
                activeScreen === 8 ? 'bg-[#e2e7ff] text-[#131b2e]' : 'text-[#3e4944] hover:bg-[#e2e7ff] hover:text-[#131b2e]'
              }`}
            >
              Track Devices
            </button>
            <button
              onClick={() => setActiveScreen(14)}
              className={`px-3 py-1.5 transition-colors rounded-lg font-semibold cursor-pointer ${
                activeScreen === 14 ? 'bg-[#e2e7ff] text-[#131b2e]' : 'text-[#3e4944] hover:bg-[#e2e7ff] hover:text-[#131b2e]'
              }`}
            >
              Parts Recovery
            </button>
            <button
              onClick={() => setActiveScreen(13)}
              className={`px-3 py-1.5 transition-colors rounded-lg font-semibold cursor-pointer ${
                activeScreen === 13 ? 'bg-[#e2e7ff] text-[#131b2e]' : 'text-[#3e4944] hover:bg-[#e2e7ff] hover:text-[#131b2e]'
              }`}
            >
              Recycling
            </button>
            <button
              onClick={() => setActiveScreen(15)}
              className={`px-3 py-1.5 transition-colors rounded-lg font-semibold cursor-pointer ${
                activeScreen === 15 ? 'bg-[#e2e7ff] text-[#131b2e]' : 'text-[#3e4944] hover:bg-[#e2e7ff] hover:text-[#131b2e]'
              }`}
            >
              Donations
            </button>
            <button
              onClick={() => setActiveScreen(7)}
              className={`px-3 py-1.5 transition-colors rounded-lg font-semibold cursor-pointer ${
                activeScreen === 7 ? 'bg-[#e2e7ff] text-[#131b2e]' : 'text-[#3e4944] hover:bg-[#e2e7ff] hover:text-[#131b2e]'
              }`}
            >
              Technicians
            </button>
            <button
              onClick={() => setActiveScreen(12)}
              className={`px-3 py-1.5 transition-colors rounded-lg font-semibold cursor-pointer ${
                activeScreen === 12 ? 'bg-[#e2e7ff] text-[#131b2e]' : 'text-[#3e4944] hover:bg-[#e2e7ff] hover:text-[#131b2e]'
              }`}
            >
              Impact Report
            </button>
            <button
              onClick={() => {
                const techUser = users.find((u) => u.role === 'technician') || users[1];
                setCurrentUser(techUser);
                setActiveScreen(9);
              }}
              className={`px-3 py-1.5 transition-colors rounded-lg font-semibold cursor-pointer ${
                activeScreen === 9 || activeScreen === 10 ? 'bg-[#e2e7ff] text-[#131b2e]' : 'text-[#3e4944] hover:bg-[#e2e7ff] hover:text-[#131b2e]'
              }`}
            >
              Technician Portal
            </button>
          </nav>
        </div>

        {/* Right Profile & Indicator Tools */}
        <div className="flex items-center gap-4 shrink-0">
          
          <div className="hidden md:flex items-center gap-1 px-3 py-1 rounded-full bg-[#f2f3ff] border border-[#bdc9c2] text-[#3e4944] text-xs font-semibold hover:border-[#005f48]/40 transition-colors cursor-default font-['Plus_Jakarta_Sans']">
            <span className="material-symbols-outlined text-sm text-[#005f48]">pin_drop</span>
            <span>Colombo, LK</span>
            <span className="relative flex h-2 w-2 ml-1">
              <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-[#005f48] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#005f48]"></span>
            </span>
          </div>

          <button
            aria-label="Notifications"
            onClick={() => setActiveScreen(8)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#3e4944] hover:bg-[#e2e7ff] hover:text-[#131b2e] transition-colors relative cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#005f48] ring-2 ring-[#faf8ff] animate-pulse"></span>
          </button>

          {/* Profile Avatar & Toggle */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#bdc9c2]">
            <div 
              onClick={handleToggleRole}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-[#e2e7ff] transition-colors cursor-pointer group"
              title="Click to toggle Citizen / Technician profile"
            >
              <img
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover transition-transform group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida/AEtjO1VDk_i1lh0MwZ0WfnaVAD329MnSIULmUs0D-xKR3XjRppux_RY6RF4bcJlVSQ8YkVJPfTyTxewXPwy1NNaNHcwJzKEj4bJRgWdwxdjAUcPgECR4RXL2vw4uwmf8kaFDkm4XUWndIXxsAt8wnFljMQ9hARVQ_251HP_Dubd-C66kFC-ryIIwnnJOKINsKEUtNG0TZUuLixn6uua5aouQdbX8-WnXa9nmqHb1XQsFHUjJFR1Rcin_a7zQ9IejfzNBWpngnf6HhpRHxp8"
              />
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs text-[#131b2e] font-semibold leading-tight font-['Plus_Jakarta_Sans']">
                  {currentUser.role === 'technician' ? 'Nuwan Silva' : 'Eng. Perera'}
                </span>
                <span className="font-mono text-[11px] text-[#3e4944] leading-none">
                  {currentUser.role === 'technician' ? 'Master Tech' : 'Lead Officer'}
                </span>
              </div>
              <span className="material-symbols-outlined text-base text-[#3e4944] hidden lg:inline transition-transform group-hover:translate-y-0.5">
                expand_more
              </span>
            </div>
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg bg-[#f2f3ff] text-[#131b2e] cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

      </div>

      {/* Mobile menu drawer */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-white border-t border-[#bdc9c2] px-4 py-4 space-y-2">
          <button
            onClick={() => { setActiveScreen(1); setIsMobileMenuOpen(false); }}
            className="w-full text-left p-2 rounded-lg text-sm font-semibold hover:bg-[#e2e7ff]"
          >
            Home / Landing
          </button>
          <button
            onClick={() => { setActiveScreen(3); setIsMobileMenuOpen(false); }}
            className="w-full text-left p-2 rounded-lg text-sm font-semibold hover:bg-[#e2e7ff]"
          >
            Dashboard
          </button>
          <button
            onClick={() => { setActiveScreen(4); setIsMobileMenuOpen(false); }}
            className="w-full text-left p-2 rounded-lg text-sm font-semibold hover:bg-[#e2e7ff]"
          >
            Assess Device
          </button>
          <button
            onClick={() => { setActiveScreen(8); setIsMobileMenuOpen(false); }}
            className="w-full text-left p-2 rounded-lg text-sm font-semibold hover:bg-[#e2e7ff]"
          >
            Track Devices
          </button>
          <button
            onClick={() => { setActiveScreen(14); setIsMobileMenuOpen(false); }}
            className="w-full text-left p-2 rounded-lg text-sm font-semibold hover:bg-[#e2e7ff]"
          >
            Parts Recovery (E-Waste Pickup)
          </button>
          <button
            onClick={() => { setActiveScreen(13); setIsMobileMenuOpen(false); }}
            className="w-full text-left p-2 rounded-lg text-sm font-semibold hover:bg-[#e2e7ff]"
          >
            Recycling Agencies (CEA Intake)
          </button>
          <button
            onClick={() => { setActiveScreen(15); setIsMobileMenuOpen(false); }}
            className="w-full text-left p-2 rounded-lg text-sm font-semibold hover:bg-[#e2e7ff]"
          >
            Community Donations (Schools/NGOs)
          </button>
          <button
            onClick={() => { setActiveScreen(7); setIsMobileMenuOpen(false); }}
            className="w-full text-left p-2 rounded-lg text-sm font-semibold hover:bg-[#e2e7ff]"
          >
            Technicians
          </button>
          <button
            onClick={() => { setActiveScreen(12); setIsMobileMenuOpen(false); }}
            className="w-full text-left p-2 rounded-lg text-sm font-semibold hover:bg-[#e2e7ff]"
          >
            Impact Report
          </button>
          <button
            onClick={() => { setActiveScreen(9); setIsMobileMenuOpen(false); }}
            className="w-full text-left p-2 rounded-lg text-sm font-semibold hover:bg-[#e2e7ff]"
          >
            Technician Portal
          </button>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => { handleToggleRole(); setIsMobileMenuOpen(false); }}
              className="text-xs font-bold text-[#005f48]"
            >
              Switch Role ({currentUser.role})
            </button>
            <button
              onClick={() => { resetDemoData(); setIsMobileMenuOpen(false); }}
              className="text-xs text-slate-500"
            >
              Reset Data
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

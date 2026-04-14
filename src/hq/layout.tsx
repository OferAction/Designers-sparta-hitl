import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { HQThemeProvider, HQActOneProvider, HQRoleProvider, useHQActOne } from '@/hq/context';
import HQSidebar from '@/hq/components/Sidebar';
import HQTopBar from '@/hq/components/TopBar';
import ActOnePanel from '@/hq/components/ActOnePanel';
import ActOneGradientIcon from '@/hq/components/ActOneGradientIcon';

const ACTONE_WIDTH = 320;

function HQLayoutInner() {
  const { actoneOpen, setActoneOpen } = useHQActOne();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="hq-layout flex flex-col h-screen overflow-hidden bg-background">
      <HQTopBar onMenuOpen={() => setMobileMenuOpen(true)} />

      <div className="flex flex-1 min-h-0">
        <HQSidebar
          actoneOpen={actoneOpen}
          onActoneToggle={() => setActoneOpen(!actoneOpen)}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        {/* ActOne panel — slides in between sidebar and main content (desktop), full screen overlay (mobile) */}
        <div
          className="hidden md:block flex-shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out mt-4"
          style={{ width: actoneOpen ? ACTONE_WIDTH : 0 }}
        >
          <ActOnePanel open={actoneOpen} onClose={() => setActoneOpen(false)} />
        </div>
        {actoneOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            <ActOnePanel open={actoneOpen} onClose={() => setActoneOpen(false)} />
          </div>
        )}

        {/* Mobile floating ActOne button */}
        {!actoneOpen && (
          <button
            onClick={() => setActoneOpen(true)}
            className="md:hidden fixed bottom-6 right-5 z-40 flex items-center justify-center w-14 h-14 rounded-full"
            style={{
              background: 'linear-gradient(135deg, color-mix(in srgb, hsl(271deg 57.94% 80.7%) 25%, #0a0c14), color-mix(in srgb, hsl(var(--purple-accent)) 15%, #0a0c14))',
              border: '1px solid hsl(317.73deg 57.39% 54.9%)',
              boxShadow: '0 4px 24px hsl(var(--purple-accent) / 0.35)',
            }}
          >
            <ActOneGradientIcon size={30} />
          </button>
        )}

        <main className="flex-1 overflow-hidden bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/** Root layout for HQ — manages sidebar drawer state for mobile */
export default function HQLayout() {
  return (
    <HQThemeProvider>
      <HQActOneProvider>
        <HQRoleProvider>
          <HQLayoutInner />
        </HQRoleProvider>
      </HQActOneProvider>
    </HQThemeProvider>
  );
}

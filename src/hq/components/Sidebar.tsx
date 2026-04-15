import { useState, useEffect } from 'react';
import { LayoutGrid, ClipboardCheck } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { XIcon as X, SunIcon as Sun, MoonIcon as Moon, GearIcon as Settings } from "@phosphor-icons/react";
import { useHQTheme } from '@/hq/context';
import { createPortal } from 'react-dom';
import menuIconUrl from '@/assets/menu-icon.svg';
import { LogoDark, LogoLight } from '@/lib/icons';
import ActOneGradientIcon from '@/hq/components/ActOneGradientIcon';

interface Props {
  actoneOpen: boolean;
  onActoneToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const ITEM_H = 54;
const ITEM_GAP = 16;
const NAV_PY = 55;

function getIndicatorTop(pathname: string): number {
  const idx = pathname === '/hq' ? 0 : pathname === '/hq/reviews' ? 1 : -1;
  if (idx === -1) return -999;
  return NAV_PY + idx * (ITEM_H + ITEM_GAP);
}

/** HQ Sidebar — desktop icon rail, mobile slide-out drawer */
export default function HQSidebar({ actoneOpen, onActoneToggle, mobileOpen = false, onMobileClose }: Props) {
  const { theme, toggle } = useHQTheme();
  const { pathname, search } = useLocation();
  const activeBg = 'hsl(var(--purple-accent) / 0.1)';
  const [indicatorTop, setIndicatorTop] = useState(() => getIndicatorTop(pathname));
  const currentParams = new URLSearchParams(search);
  const workflow = currentParams.get('workflow');
  const overviewHref = workflow ? `/hq?workflow=${workflow}` : '/hq';
  const reviewsHref = workflow ? `/hq/reviews?workflow=${workflow}` : '/hq/reviews';

  useEffect(() => {
    const next = getIndicatorTop(pathname);
    if (next !== -999) setIndicatorTop(next);
  }, [pathname]);

  // Animation state for mobile drawer — keeps it mounted during exit transition
  const [drawerMounted, setDrawerMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      setDrawerMounted(true);
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setDrawerOpen(true)));
      return () => cancelAnimationFrame(id);
    } else {
      setDrawerOpen(false);
      const t = setTimeout(() => setDrawerMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [mobileOpen]);

  const btnCls = (active: boolean) =>
    `w-full flex items-center justify-center p-[10px] h-[54px] transition-colors ${
      active
        ? 'text-purple-accent'
        : 'text-ring hover:text-purple-accent hover:bg-muted rounded-lg'
    }`;

  const mobileLinkCls = (active: boolean) =>
    `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
      active ? 'text-foreground bg-muted' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
    }`;

  /* ── Desktop sidebar ── */
  const desktopSidebar = (
    <aside className="relative z-10 w-[84px] flex-shrink-0 flex flex-col bg-[hsl(var(--hq-background))] pl-6 pb-6 max-md:hidden">
      <div className="mt-4 flex-1 bg-[hsl(var(--sidebar-background))] rounded-[8px] flex flex-col w-[60px] overflow-hidden">
        {/* Rail header — hamburger icon */}
        <div className="flex items-center justify-center py-[17px] flex-shrink-0">
          <img
            src={menuIconUrl}
            alt=""
            aria-hidden="true"
            className="w-[22px] h-[17px] opacity-70 dark:invert"
          />
        </div>
        <TooltipProvider delayDuration={300}>
          <nav className="relative pt-[55px] pb-2 flex flex-col gap-4">
            {/* Sliding right border indicator */}
            <div
              className="absolute right-0 w-[3px] rounded-l-sm bg-purple-accent pointer-events-none"
              style={{
                height: ITEM_H,
                top: indicatorTop,
                transition: 'top 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to={overviewHref}
                  end
                  className={btnCls(pathname === '/hq')}
                  style={pathname === '/hq' ? { backgroundColor: activeBg } : undefined}
                  onClick={() => setIndicatorTop(getIndicatorTop('/hq'))}
                >
                  <LayoutGrid size={22} />
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right">Overview</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to={reviewsHref}
                  className={btnCls(pathname === '/hq/reviews')}
                  style={pathname === '/hq/reviews' ? { backgroundColor: activeBg } : undefined}
                  onClick={() => setIndicatorTop(getIndicatorTop('/hq/reviews'))}
                >
                  <ClipboardCheck size={22} />
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right">Reviews</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onActoneToggle}
                  className={`w-full flex items-center justify-center p-[10px] h-[54px] rounded-lg transition-all border-r-[3px] border-transparent group`}
                >
                  <span style={{ filter: actoneOpen ? 'none' : 'grayscale(1) opacity(0.5)', transition: 'filter 0.2s' }} className="group-hover:!filter-none">
                    <ActOneGradientIcon size={22} />
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">ActOne</TooltipContent>
            </Tooltip>
          </nav>
        </TooltipProvider>
        {/* Settings at bottom of desktop rail */}
        <div className="mt-auto pb-2">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={btnCls(false)}
                >
                  <Settings size={22} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </aside>
  );

  /* ── Mobile drawer overlay ── */
  const mobileDrawer = drawerMounted
    ? createPortal(
        <div className="hq-layout fixed inset-0 z-50 md:hidden">
          {/* Backdrop — fades in/out */}
          <div
            className="absolute inset-0 bg-black/50 transition-opacity duration-300 ease-in-out"
            style={{ opacity: drawerOpen ? 1 : 0 }}
            onClick={onMobileClose}
          />
          {/* Drawer panel — slides in/out from left */}
          <div
            className="absolute left-0 top-0 bottom-0 w-64 flex flex-col transition-transform duration-300 ease-in-out"
            style={{
              background: 'hsl(var(--card))',
              borderRight: '1px solid hsl(var(--border))',
              transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
            }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
              <div className="w-[110px]">
                {theme === 'dark' ? <LogoDark /> : <LogoLight />}
              </div>
              <button
                onClick={onMobileClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>
            {/* Nav links */}
            <nav className="flex-1 px-3 py-3 flex flex-col gap-1">
              <NavLink
                to={overviewHref}
                end
                onClick={onMobileClose}
                className={mobileLinkCls(pathname === '/hq')}
              >
                <LayoutGrid size={18} />
                Overview
              </NavLink>
              <NavLink
                to={reviewsHref}
                onClick={onMobileClose}
                className={mobileLinkCls(pathname === '/hq/reviews')}
              >
                <ClipboardCheck size={18} />
                Reviews
              </NavLink>
            </nav>
            {/* Bottom actions — theme + settings */}
            <div className="px-3 pb-4 mt-auto flex flex-col gap-1" style={{ borderTop: '1px solid hsl(var(--border))', paddingTop: '12px' }}>
              <button
                onClick={() => { toggle(); }}
                className={mobileLinkCls(false)}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>
              <button className={mobileLinkCls(false)}>
                <Settings size={18} />
                Settings
              </button>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      {desktopSidebar}
      {mobileDrawer}
    </>
  );
}

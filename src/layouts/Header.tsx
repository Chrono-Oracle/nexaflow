import { HeaderLogo } from './components/HeaderLogo';
import { HeaderSearch } from './components/HeaderSearch';
import { HeaderUser } from './components/HeaderUser';
import { HeaderActions } from './components/HeaderActions';

export function Header() {
  return (
    <header className="shrink-0 z-40 w-full bg-primary-surface/80 backdrop-blur-md px-4 sm:px-6 py-2.5 sm:py-3.5 border-b border-primary-medium/10">
      {/* Line 1: Logo & Header on left, Profile & Notification on right */}
      <div className="flex items-center justify-between gap-4 md:gap-6">
        {/* Left: Brand Logo (+ Search field on desktop) */}
        <div className="flex items-center gap-6 md:gap-10 flex-1 max-w-3xl">
          <HeaderLogo />
          <div className="hidden md:block flex-1">
            <HeaderSearch />
          </div>
        </div>

        {/* Right: User Profile + Action Buttons (Notification on mobile; Language + Notification + Settings on desktop) */}
        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          <HeaderUser />
          <HeaderActions />
        </div>
      </div>

      {/* Line 2 (Mobile only): Search field placed directly below the logo header */}
      <div className="mt-2.5 md:hidden w-full">
        <HeaderSearch />
      </div>
    </header>
  );
}

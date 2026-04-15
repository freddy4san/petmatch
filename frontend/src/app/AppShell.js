import BottomNav from '../features/navigation/components/BottomNav';
import { usePrototypeApp } from '../features/prototype/hooks/usePrototypeApp';
import { renderPrototypeScreen } from './renderPrototypeScreen';

const HIDE_NAV_SCREENS = new Set(['welcome', 'login', 'signup', 'petSetup', 'notifications']);

export default function AppShell() {
  const app = usePrototypeApp();
  const hideNav = HIDE_NAV_SCREENS.has(app.currentScreen);

  return (
    <div className="min-h-[100dvh] bg-slate-100 md:flex md:items-center md:justify-center md:p-6">
      <div className="flex min-h-[100dvh] w-full flex-col overflow-hidden bg-white md:min-h-[min(100dvh,900px)] md:max-w-[430px] md:rounded-[32px] md:shadow-2xl">
        <div className="flex-1 overflow-x-hidden overflow-y-auto">
          {renderPrototypeScreen(app)}
        </div>
        {!hideNav ? (
          <BottomNav
            active={app.getActiveNav(app.currentScreen)}
            matchCount={app.matches.length}
            onNavigate={app.setCurrentScreen}
          />
        ) : null}
      </div>
    </div>
  );
}

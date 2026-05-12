import BottomNav from '../features/navigation/components/BottomNav';
import { usePrototypeApp } from '../features/prototype/hooks/usePrototypeApp';
import { renderPrototypeScreen } from './renderPrototypeScreen';

const HIDE_NAV_SCREENS = new Set(['welcome', 'login', 'signup', 'petSetup', 'notifications']);
const DOCUMENT_SCROLL_SCREENS = new Set(['welcome', 'login', 'signup', 'petSetup']);

export default function AppShell() {
  const app = usePrototypeApp();
  const hideNav = HIDE_NAV_SCREENS.has(app.currentScreen);
  const useDocumentScroll = DOCUMENT_SCROLL_SCREENS.has(app.currentScreen);

  if (useDocumentScroll) {
    return (
      <div className="min-h-[100dvh] bg-slate-100">
        {renderPrototypeScreen(app)}
      </div>
    );
  }

  return (
    <div className="h-[100dvh] bg-slate-100 md:flex md:items-center md:justify-center md:p-6">
      <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-white md:h-[min(100dvh,900px)] md:max-w-[430px] md:rounded-[32px] md:shadow-2xl">
        <div className={`min-h-0 flex-1 overflow-x-hidden ${hideNav ? 'overflow-y-auto' : 'overflow-hidden'}`}>
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

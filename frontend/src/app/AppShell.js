import BottomNav from '../features/navigation/components/BottomNav';
import { usePrototypeApp } from '../features/prototype/hooks/usePrototypeApp';
import { renderPrototypeScreen } from './renderPrototypeScreen';

const HIDE_NAV_SCREENS = new Set(['welcome', 'login', 'signup', 'petSetup', 'notifications']);

export default function AppShell() {
  const app = usePrototypeApp();

  return (
    <div className="phone-mockup" style={{ left: '220px' }}>
      <div className="phone-body">
        <div className="phone-notch"></div>
        <div className="phone-screen w-[480px] bg-white shadow-2xl" style={{ height: '1024px', overflow: 'auto' }}>
          {renderPrototypeScreen(app)}
          {!HIDE_NAV_SCREENS.has(app.currentScreen) ? (
            <BottomNav
              active={app.getActiveNav(app.currentScreen)}
              matchCount={app.matches.length}
              onNavigate={app.setCurrentScreen}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

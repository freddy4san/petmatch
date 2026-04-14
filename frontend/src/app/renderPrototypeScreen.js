import { AboutPage, HelpPage, LanguagePage, NotificationSettingsPage, NotificationsPage, PreferencesPage, PremiumPage, PrivacyPage, SettingsPage, ThemePage, VerificationPage } from '../features/settings/pages/SettingsPages';
import { ChatPage, MatchesPage } from '../features/matches/pages/MatchesPages';
import { EditPetPage, PetSetupPage, ProfilePage } from '../features/pets/pages/PetPages';
import { LoginPage, SignupPage, WelcomePage } from '../features/auth/pages/AuthPages';
import DiscoveryPage from '../features/discovery/pages/DiscoveryPage';
import HomePage from '../features/home/pages/HomePage';

export function renderPrototypeScreen(app) {
  switch (app.currentScreen) {
    case 'welcome':
      return <WelcomePage onNavigate={app.setCurrentScreen} />;
    case 'login':
      return <LoginPage app={app} onNavigate={app.setCurrentScreen} />;
    case 'signup':
      return <SignupPage app={app} onNavigate={app.setCurrentScreen} />;
    case 'petSetup':
      return <PetSetupPage app={app} onNavigate={app.setCurrentScreen} />;
    case 'home':
      return <HomePage app={app} />;
    case 'discovery':
      return <DiscoveryPage app={app} />;
    case 'matches':
      return <MatchesPage app={app} />;
    case 'chat':
      return <ChatPage app={app} />;
    case 'profile':
      return <ProfilePage app={app} />;
    case 'preferences':
      return <PreferencesPage app={app} />;
    case 'notificationSettings':
      return <NotificationSettingsPage app={app} />;
    case 'privacy':
      return <PrivacyPage app={app} />;
    case 'verification':
      return <VerificationPage />;
    case 'notifications':
      return <NotificationsPage app={app} />;
    case 'settings':
      return <SettingsPage app={app} />;
    case 'editPet':
      return <EditPetPage app={app} />;
    case 'premium':
      return <PremiumPage onNavigate={app.setCurrentScreen} />;
    case 'help':
      return <HelpPage onNavigate={app.setCurrentScreen} />;
    case 'about':
      return <AboutPage onNavigate={app.setCurrentScreen} />;
    case 'language':
      return <LanguagePage onNavigate={app.setCurrentScreen} />;
    case 'themeScreen':
      return <ThemePage app={app} />;
    default:
      return <WelcomePage onNavigate={app.setCurrentScreen} />;
  }
}

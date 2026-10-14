import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// The 12 Stitch screens
import { Screen1_Landing } from './components/screens/Screen1_Landing';
import { Screen2_Auth } from './components/screens/Screen2_Auth';
import { Screen3_ConsumerDashboard } from './components/screens/Screen3_ConsumerDashboard';
import { Screen4_AddDevice } from './components/screens/Screen4_AddDevice';
import { Screen5_GeminiAssessment } from './components/screens/Screen5_GeminiAssessment';
import { Screen6_RouteRecommendation } from './components/screens/Screen6_RouteRecommendation';
import { Screen7_TechnicianMatching } from './components/screens/Screen7_TechnicianMatching';
import { Screen8_DeviceTracking } from './components/screens/Screen8_DeviceTracking';
import { Screen9_TechnicianDashboard } from './components/screens/Screen9_TechnicianDashboard';
import { Screen10_PhysicalInspection } from './components/screens/Screen10_PhysicalInspection';
import { Screen11_QuoteReview } from './components/screens/Screen11_QuoteReview';
import { Screen12_FinalOutcome } from './components/screens/Screen12_FinalOutcome';

const ScreenRouter: React.FC = () => {
  const { activeScreen } = useApp();

  // Scroll to top on screen switch
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeScreen]);

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 1:
        return <Screen1_Landing />;
      case 2:
        return <Screen2_Auth />;
      case 3:
        return <Screen3_ConsumerDashboard />;
      case 4:
        return <Screen4_AddDevice />;
      case 5:
        return <Screen5_GeminiAssessment />;
      case 6:
        return <Screen6_RouteRecommendation />;
      case 7:
        return <Screen7_TechnicianMatching />;
      case 8:
        return <Screen8_DeviceTracking />;
      case 9:
        return <Screen9_TechnicianDashboard />;
      case 10:
        return <Screen10_PhysicalInspection />;
      case 11:
        return <Screen11_QuoteReview />;
      case 12:
        return <Screen12_FinalOutcome />;
      default:
        return <Screen1_Landing />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8ff] text-[#131b2e] antialiased selection:bg-emerald-200 selection:text-emerald-950 font-sans">
      <Navbar />
      <main className="flex-1">
        {renderActiveScreen()}
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <ScreenRouter />
    </AppProvider>
  );
}

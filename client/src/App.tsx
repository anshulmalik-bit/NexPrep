import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { ChoosePathPage } from './pages/ChoosePathPage';
import { TracksPage } from './pages/TracksPage';
import { RolePage } from './pages/RolePage';
import { InterviewSetupPage } from './pages/InterviewSetupPage';
import { QuinnModePage } from './pages/QuinnModePage';
import { CalibrationPage } from './pages/CalibrationPage';
import { InterviewPage } from './pages/InterviewPage';
import { EvaluationPage } from './pages/EvaluationPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { ContactPage } from './pages/ContactPage';
import { MainLayout } from './components/MainLayout';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/choose-path" element={<ChoosePathPage />} />
          <Route path="/tracks" element={<TracksPage />} />
          <Route path="/tracks/:trackId" element={<RolePage />} />
          <Route path="/setup" element={<InterviewSetupPage />} />
          <Route path="/setup/quinn-mode" element={<QuinnModePage />} />
          <Route path="/calibration" element={<CalibrationPage />} />
          <Route path="/evaluation" element={<EvaluationPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* Standalone pages (no footer) */}
        <Route path="/interview" element={<InterviewPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

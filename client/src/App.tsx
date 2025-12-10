import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { ChoosePathPage } from './pages/ChoosePathPage';
import { InterviewSetupPage } from './pages/InterviewSetupPage';
import { QuinnModePage } from './pages/QuinnModePage';
import { InterviewPage } from './pages/InterviewPage';
import { EvaluationPage } from './pages/EvaluationPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { ContactPage } from './pages/ContactPage';
import './styles/base.css';
import './styles/components.css';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/choose-path" element={<ChoosePathPage />} />
        <Route path="/setup/company" element={<InterviewSetupPage />} />
        <Route path="/setup/resume" element={<InterviewSetupPage />} />
        <Route path="/setup/quinn-mode" element={<QuinnModePage />} />
        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/evaluation" element={<EvaluationPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

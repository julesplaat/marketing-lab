import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Experiments from './pages/Experiments';
import ExperimentForm from './pages/ExperimentForm';
import ExperimentDetail from './pages/ExperimentDetail';
import Learnings from './pages/Learnings';
import WeeklyReview from './pages/WeeklyReview';
import Settings from './pages/Settings';
import Competitors from './pages/Competitors';
import ContentPlan from './pages/ContentPlan';
import FunnelOverview from './pages/FunnelOverview';

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/experiments" element={<Experiments />} />
            <Route path="/experiments/new" element={<ExperimentForm />} />
            <Route path="/experiments/:id" element={<ExperimentDetail />} />
            <Route path="/experiments/:id/edit" element={<ExperimentForm />} />
            <Route path="/funnel" element={<FunnelOverview />} />
            <Route path="/content" element={<ContentPlan />} />
            <Route path="/learnings" element={<Learnings />} />
            <Route path="/competitors" element={<Competitors />} />
            <Route path="/review" element={<WeeklyReview />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </AppProvider>
    </HashRouter>
  );
}

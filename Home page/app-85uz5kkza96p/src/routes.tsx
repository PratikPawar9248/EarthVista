import Dashboard from './pages/Dashboard';
import AdvancedPlots from './pages/AdvancedPlots';
import DataManagement from './pages/DataManagement';
import AdvancedAnalysis from './pages/AdvancedAnalysis';
import AdvancePlotContainer from './AdvancePlot/AdvancePlotContainer';
import type { ComponentType } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  component: ComponentType;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Dashboard',
    path: '/',
    component: Dashboard,
    visible: true
  },
  {
    name: 'Advanced Plots',
    path: '/plots',
    component: AdvancedPlots,
    visible: true
  },
  {
    name: 'Advance Analysis Panel',
    path: '/advance-plot',
    component: AdvancePlotContainer,
    visible: true
  },
  {
    name: 'Advanced Analysis',
    path: '/analysis',
    component: AdvancedAnalysis,
    visible: true
  },
  {
    name: 'Data Management',
    path: '/data',
    component: DataManagement,
    visible: true
  }
];

export default routes;


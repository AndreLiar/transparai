// src/App.tsx
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes';
import './i18n'; // add this at the top

const App = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;

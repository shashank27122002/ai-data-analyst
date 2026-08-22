import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import AppLayout from "./layouts/AppLayout";

import Dashboard from "./pages/Dashboard";
import Datasets from "./pages/Datasets";
import Analyst from "./pages/Analyst";
import Reports from "./pages/Reports";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route element={<AppLayout />}>

          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/datasets"
            element={<Datasets />}
          />

          <Route
            path="/analyst"
            element={<Analyst />}
          />

          <Route
            path="/reports"
            element={<Reports />}
          />

        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;
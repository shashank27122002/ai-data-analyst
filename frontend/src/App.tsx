import {
  useEffect,
  useState,
} from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import AppLayout from "./layouts/AppLayout";

import Dashboard from "./pages/Dashboard";
import Datasets from "./pages/Datasets";
import Analyst from "./pages/Analyst";
import Reports from "./pages/Reports";

import Auth from "./Auth";

import {
  restoreSession,
  getCurrentUser,
  
} from "./api/api";


// ============================================================
// PROTECTED ROUTE
// ============================================================

function ProtectedRoute() {

  const location =
    useLocation();

  const [checkingAuth, setCheckingAuth] =
    useState(true);

  const [authenticated, setAuthenticated] =
    useState(false);


  useEffect(() => {

    async function checkAuthentication() {

      try {

        const restored =
          await restoreSession();

        if (!restored) {
          setAuthenticated(false);
          return;
        }

        await getCurrentUser();

        setAuthenticated(true);

      } catch (error) {

        console.error(
          "Authentication check failed:",
          error
        );

        setAuthenticated(false);

      } finally {

        setCheckingAuth(false);
      }
    }


    checkAuthentication();

  }, []);


  if (checkingAuth) {

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f4f7fb",
          color: "#111827",
          fontSize: "16px",
          fontWeight: 600,
        }}
      >
        Checking authentication...
      </div>
    );
  }


  if (!authenticated) {

    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname,
        }}
      />
    );
  }


  return <Outlet />;
}


// ============================================================
// LOGIN PAGE
// ============================================================

function LoginPage() {

  const navigate =
    useNavigate();


  return (
    <Auth
      onLoginSuccess={() => {
        navigate(
          "/",
          {
            replace: true,
          }
        );
      }}
    />
  );
}


// ============================================================
// REGISTER PAGE
// ============================================================

function RegisterPage() {

  const navigate =
    useNavigate();


  return (
    <Auth
      onLoginSuccess={() => {
        navigate(
          "/",
          {
            replace: true,
          }
        );
      }}
    />
  );
}


// ============================================================
// APPLICATION
// ============================================================

function App() {

  return (
    <BrowserRouter>

      <Routes>

        {/* ================================================== */}
        {/* AUTH */}
        {/* ================================================== */}

        <Route
          path="/login"
          element={
            <LoginPage />
          }
        />

        <Route
          path="/register"
          element={
            <RegisterPage />
          }
        />


        {/* ================================================== */}
        {/* PROTECTED APPLICATION */}
        {/* ================================================== */}

        <Route
          element={
            <ProtectedRoute />
          }
        >

          <Route
            element={
              <AppLayout />
            }
          >

            <Route
              path="/"
              element={
                <Dashboard />
              }
            />

            <Route
              path="/datasets"
              element={
                <Datasets />
              }
            />

            <Route
              path="/analyst"
              element={
                <Analyst />
              }
            />

            <Route
              path="/reports"
              element={
                <Reports />
              }
            />

          </Route>

        </Route>


        {/* ================================================== */}
        {/* UNKNOWN ROUTE */}
        {/* ================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;
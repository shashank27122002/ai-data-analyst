import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { logout } from "../api/api";

function AppLayout() {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Reload the application so the in-memory access token is cleared
      window.location.replace("/login");
    }
  }

  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            padding: "12px 20px",
          }}
        >
          <button
            type="button"
            onClick={handleLogout}
            style={{
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              padding: "8px 16px",
              background: "#ffffff",
              color: "#111827",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>

        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="brand">

        <div className="brand-icon">
          AI
        </div>

        <div>
          <h2>
            AI Data Analyst
          </h2>

          <span>
            Intelligent analytics
          </span>
        </div>

      </div>


      <nav className="navigation">

        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `nav-item ${
              isActive ? "active" : ""
            }`
          }
        >
          <span>⌂</span>
          Dashboard
        </NavLink>


        <NavLink
          to="/datasets"
          className={({ isActive }) =>
            `nav-item ${
              isActive ? "active" : ""
            }`
          }
        >
          <span>▣</span>
          Datasets
        </NavLink>


        <NavLink
          to="/analyst"
          className={({ isActive }) =>
            `nav-item ${
              isActive ? "active" : ""
            }`
          }
        >
          <span>◉</span>
          AI Analyst
        </NavLink>


        <NavLink
          to="/reports"
          className={({ isActive }) =>
            `nav-item ${
              isActive ? "active" : ""
            }`
          }
        >
          <span>▤</span>
          Reports
        </NavLink>

      </nav>


      <div className="sidebar-bottom">

        <div className="status">

          <span className="status-dot"></span>

          Backend connected

        </div>

      </div>

    </aside>
  );
}

export default Sidebar;
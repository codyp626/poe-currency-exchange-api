import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Graph from "./components/Graph";

const App = () => {
  const location = useLocation();
  const showGraph = location.pathname === "/graph" || location.pathname.startsWith("/graph");

  // add 'dark' here to enable dark mode globally.
  // later you can make this dynamic (toggle) by replacing the literal with state.
  return (
    <div className="dark min-h-screen bg-slate-900 text-slate-100 antialiased">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <Navbar />
        <main className="mt-6">
          {showGraph ? <Graph /> : <Outlet />}
        </main>
      </div>
    </div>
  );
};
export default App;
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Graph from "./components/Graph";

const App = () => {
  const location = useLocation();
  const showGraph = location.pathname === "/graph" || location.pathname.startsWith("/graph");

  return (
    <div className="w-full p-6">
      <Navbar />
      {showGraph ? <Graph /> : <Outlet />}
    </div>
  );
};
export default App;
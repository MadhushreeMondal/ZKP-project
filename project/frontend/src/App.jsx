import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import FarmerDashboard from "./pages/FarmerDashboard";
import RegulatorDashboard from "./pages/RegulatorDashboard";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<FarmerDashboard />} />
        <Route path="/regulator" element={<RegulatorDashboard />} />
      </Routes>
    </Layout>
  );
}

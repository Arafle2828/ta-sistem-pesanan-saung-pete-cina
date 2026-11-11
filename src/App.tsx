import { Navigate, Route, Routes } from "react-router-dom";
import CustomerOrder from "./pages/CustomerOrder";
import OrderMonitor from "./pages/OrderMonitor";
import AdminLayout from "./pages/AdminLayout";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CustomerOrder />} />
      <Route path="/order" element={<CustomerOrder />} />
      <Route path="/kitchen" element={<OrderMonitor />} />
      <Route path="/admin" element={<AdminLayout />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}


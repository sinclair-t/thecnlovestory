import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import MusicPlayer from './components/ui/MusicPlayer';
import AccommodationNotice from './components/ui/AccommodationNotice';
import Home from './pages/Home';
import WeddingDetails from './pages/WeddingDetails';
import RSVP from './pages/RSVP';
import AsoebeStore from './pages/AsoebeStore';
import AsoebeProduct from './pages/AsoebeProduct';
import GiftPage from './pages/GiftPage';
import FAQ from './pages/FAQ';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminGuests from './pages/admin/Guests';
import AdminRSVPs from './pages/admin/RSVPs';
import AdminOrders from './pages/admin/Orders';
import AdminGifts from './pages/admin/Gifts';
import AdminProducts from './pages/admin/Products';
import AdminSettings from './pages/admin/Settings';
import AdminLayout from './pages/admin/AdminLayout';
import ProtectedRoute from './pages/admin/ProtectedRoute';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <AccommodationNotice />
      <main>{children}</main>
      <Footer />
      <MusicPlayer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/wedding-details" element={<PublicLayout><WeddingDetails /></PublicLayout>} />
        <Route path="/rsvp" element={<PublicLayout><RSVP /></PublicLayout>} />
        <Route path="/asoebe" element={<PublicLayout><AsoebeStore /></PublicLayout>} />
        <Route path="/asoebe/:id" element={<PublicLayout><AsoebeProduct /></PublicLayout>} />
        <Route path="/gifts" element={<PublicLayout><GiftPage /></PublicLayout>} />
        <Route path="/faq" element={<PublicLayout><FAQ /></PublicLayout>} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="guests" element={<AdminGuests />} />
          <Route path="rsvps" element={<AdminRSVPs />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="gifts" element={<AdminGifts />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

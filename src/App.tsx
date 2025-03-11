import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Search from './pages/Search';
import Clubs from './pages/Clubs';
import Ladies from './pages/Ladies';
import Reviews from './pages/Reviews';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Register from './pages/Register';
import Advertisement from './pages/Advertisement';
import AdvertisementPro from './pages/AdvertisementPro';
import ClubAdvertisement from './pages/ClubAdvertisement';
import FAQ from './pages/FAQ';
import WriteReview from './pages/WriteReview';
import Support from './pages/Support';
import Contact from './pages/Contact';
import FanPosts from './pages/FanPosts';
import SendGift from './pages/SendGift';
import Cookies from './pages/Cookies';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import MembershipTier from './pages/dashboard/MembershipTier';
import BumpAdvertisement from './pages/BumpAdvertisement';
import LadyDashboard from './pages/dashboard/LadyDashboard';
import LadyDashboardFree from './pages/dashboard/LadyDashboardFree';
import AllActivity from './pages/dashboard/AllActivity';
import GiftsReceived from './pages/dashboard/GiftsReceived';
import AccountSettings from './pages/dashboard/AccountSettings';
import DKCredits from './pages/dashboard/DKCredits';
import FanEarnings from './pages/dashboard/FanEarnings';
import LadySettings from './pages/dashboard/LadySettings';
import ExchangeCredits from './pages/dashboard/ExchangeCredits';
import Booking from './pages/Booking';
import ManageFanPosts from './pages/dashboard/ManageFanPosts';
import CreateFanPost from './pages/CreateFanPost';
import ManageBookings from './pages/dashboard/ManageBookings';
import ClientDashboard from './pages/dashboard/ClientDashboard';
import ClientBookings from './pages/dashboard/ClientBookings';
import ClientReviews from './pages/dashboard/ClientReviews';
import ClientGifts from './pages/dashboard/ClientGifts';
import ClientFanPosts from './pages/dashboard/ClientFanPosts';
import ClientSettings from './pages/dashboard/ClientSettings';
import ClientFavorites from './pages/dashboard/ClientFavorites';
import ClientCredits from './pages/dashboard/ClientCredits';
import ReplyReviews from './pages/dashboard/ReplyReviews';
import Verification from './pages/Verification';
import ClubDashboard from './pages/dashboard/ClubDashboard';
import ClubLadies from './pages/dashboard/ClubLadies';
import ClubPromo from './pages/dashboard/ClubPromo';
import ClubCredits from './pages/dashboard/ClubCredits';
import ClubSettings from './pages/dashboard/ClubSettings';
import ClubVerification from './pages/ClubVerification';
import ClubLady from './pages/dashboard/ClubLady';
import UpgradeMembership from './pages/dashboard/UpgradeMembership';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Ladies />} />
              <Route path="/search" element={<Search />} />
              <Route path="/clubs" element={<Clubs />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/register" element={<Register />} />
              <Route path="/ladies/:id" element={<Advertisement />} />
              <Route path="/ladies/pro/:id" element={<AdvertisementPro />} />
              <Route path="/clubs/:id" element={<ClubAdvertisement />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/write-review/:id" element={<WriteReview />} />
              <Route path="/booking/:id" element={<Booking />} />
              <Route path="/support" element={<Support />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/send-gift/:name" element={<SendGift />} />
              <Route path="/fan-posts" element={<FanPosts />} />
              <Route path="/fan-posts/:name" element={<FanPosts />} />
              <Route path="/dashboard/lady" element={<LadyDashboard />} />
              <Route path="/dashboard/lady/free" element={<LadyDashboardFree />} />
              <Route path="/dashboard/lady/settings" element={<LadySettings />} />
              <Route path="/dashboard/lady/bump" element={<BumpAdvertisement />} />
              <Route path="/dashboard/lady/activity" element={<AllActivity />} />
              <Route path="/dashboard/lady/gifts" element={<GiftsReceived />} />
              <Route path="/dashboard/lady/fan-earnings" element={<FanEarnings />} />
              <Route path="/dashboard/lady/credits" element={<DKCredits />} />
              <Route path="/dashboard/lady/exchange-credits" element={<ExchangeCredits />} />
              <Route path="/dashboard/lady/upgrade" element={<MembershipTier />} />
              <Route path="/dashboard/lady/schedule" element={<ManageBookings />} />
              <Route path="/dashboard/lady/fan-posts" element={<ManageFanPosts />} />
              <Route path="/fan-posts/create" element={<CreateFanPost />} />
              <Route path="/dashboard/lady/reviews" element={<ReplyReviews />} />
              <Route path="/dashboard/lady/upgrade/membership" element={<UpgradeMembership />} />
              <Route path="/verification" element={<Verification />} />
              <Route path="/dashboard/client" element={<ClientDashboard />} />
              <Route path="/dashboard/client/bookings" element={<ClientBookings />} />
              <Route path="/dashboard/client/reviews" element={<ClientReviews />} />
              <Route path="/dashboard/client/gifts" element={<ClientGifts />} />
              <Route path="/dashboard/client/fan-posts" element={<ClientFanPosts />} />
              <Route path="/dashboard/client/credits" element={<ClientCredits />} />
              <Route path="/dashboard/client/favorites" element={<ClientFavorites />} />
              <Route path="/dashboard/client/settings" element={<ClientSettings />} />
              <Route path="/dashboard/lady/account" element={<AccountSettings />} />
              <Route path="/dashboard/club" element={<ClubDashboard />} />
              <Route path="/dashboard/club/ladies" element={<ClubLadies />} />
              <Route path="/dashboard/club/promo" element={<ClubPromo />} />
              <Route path="/dashboard/club/credits" element={<ClubCredits />} />
              <Route path="/dashboard/club/settings" element={<ClubSettings />} />
              <Route path="/dashboard/club/verify" element={<ClubVerification />} />
              <Route path="/dashboard/club/lady/add" element={<ClubLady />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/privacy" element={<Privacy />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </BrowserRouter>
  );
}
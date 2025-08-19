import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleBasedRedirect } from './components/auth/RoleBasedRedirect';
import { MembershipGuard } from './components/auth/MembershipGuard';
import ClubVerificationGuard from './components/auth/ClubVerificationGuard';
import VerificationGuard from './components/auth/VerificationGuard';
import ClientVerificationGuard from './components/auth/ClientVerificationGuard';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import Header from './components/Header';
import Footer from './components/Footer';
import Search from './pages/Search';
import SearchResults from './pages/SearchResults';
import Clubs from './pages/Clubs';
import Reviews from './pages/Reviews';
import Ladies from './pages/Ladies';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Register from './pages/Register';
import Advertisement from './pages/Advertisement';
import AdvertisementPro from './pages/AdvertisementPro';
import ClubAdvertisement from './pages/ClubAdvertisement';
import FAQ from './pages/FAQ';
import WriteReview from './pages/WriteReview';
import Support from './pages/Support';
import Contact from './pages/Contact';
import SendGift from './pages/SendGift';
import Cookies from './pages/Cookies';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import FanPosts from './pages/FanPosts';
import MembershipTier from './pages/dashboard/MembershipTier';
import BumpAdvertisement from './pages/BumpAdvertisement';
// Admin Components
import { AdminGuard } from './components/admin/AdminGuard';
// import { DocumentViewer } from './components/admin/DocumentViewer';
import AdminDashboard from './pages/admin/AdminDashboard';
import VerificationQueue from './pages/admin/VerificationQueue';
import VerificationDetails from './pages/admin/VerificationDetails';
// import AdminUserManagement from './pages/admin/AdminUserManagement';
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
import LadyReviews from './pages/dashboard/LadyReviews';
import LadyPayouts from './pages/dashboard/LadyPayouts';
// Import removed as it's not used
import ClubDashboard from './pages/dashboard/ClubDashboard';
import ClubLadies from './pages/dashboard/ClubLadies';
import ClubPromo from './pages/dashboard/ClubPromo';
import ClubCredits from './pages/dashboard/ClubCredits';
import ClubBump from './pages/dashboard/ClubBump';
import ClubUpgrade from './pages/dashboard/ClubUpgrade';
import ClubReviews from './pages/dashboard/ClubReviews';
import ClubSettings from './pages/dashboard/ClubSettings';
import ClubVerification from './pages/ClubVerification';
import ClubLady from './pages/dashboard/ClubLady';
import UpgradeMembership from './pages/dashboard/UpgradeMembership';
import Verification from './pages/Verification';
import ClientVerification from './pages/ClientVerification';
import UserManagement from './pages/admin/UserManagement';
import MediaModeration from './pages/admin/MediaModeration';
import CommentModeration from './pages/admin/CommentModeration';
import FinancialDashboard from './pages/admin/FinancialDashboard';
import Analytics from './pages/admin/Analytics';
import AdminSettings from './pages/admin/Settings';
import AdminPayouts from './pages/admin/AdminPayouts';
import CreditStore from './pages/dashboard/CreditStore';
import CreditHistory from './pages/dashboard/CreditHistory';

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <AppRoutes />
        <Footer />
      </Router>
    </AuthProvider>
  );
}

// Separate component that can use hooks
function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
    </div>;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Ladies />} />
      <Route path="/search" element={<Search />} />
      <Route path="/search/results" element={<SearchResults />} />
      <Route path="/clubs" element={<Clubs />} />
      <Route path="/ladies" element={<Ladies />} />
      <Route path="/reviews" element={<Reviews />} />
      <Route path="/login" element={
        user ? <RoleBasedRedirect /> : <Login />
      } />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/register" element={
        user ? <RoleBasedRedirect /> : <Register />
      } />
      <Route path="/ladies/:id" element={<Advertisement />} />
      <Route path="/ladies/pro/:id" element={<AdvertisementPro />} />
      <Route path="/clubs/:id" element={<ClubAdvertisement />} />
      <Route path="/faq" element={<FAQ />} />
      {/* Club reviews use an explicit club prefix to avoid param collision */}
      <Route path="/write-review/club/:id" element={<WriteReview />} />
      <Route path="/booking/:id" element={<Booking />} />
      <Route path="/support" element={<Support />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/send-gift/:name" element={<SendGift />} />
      <Route path="/fan-posts" element={<FanPosts />} />
      <Route path="/fan-posts/:name" element={<FanPosts />} />
      <Route path="/cookies" element={<Cookies />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      
      {/* Protected Dashboard Routes */}
      <Route path="/dashboard/lady" element={
        <ProtectedRoute requiredRole="lady">
          <VerificationGuard>
            <MembershipGuard requiredTier="PRO" redirectTo="/dashboard/lady/free">
              <LadyDashboard />
            </MembershipGuard>
          </VerificationGuard>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/lady/free" element={
        <ProtectedRoute requiredRole="lady">
          <VerificationGuard>
            <LadyDashboardFree />
          </VerificationGuard>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/lady/settings" element={
        <ProtectedRoute requiredRole="lady">
          <VerificationGuard>
            <LadySettings />
          </VerificationGuard>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/lady/bump" element={
        <ProtectedRoute requiredRole="lady">
          <VerificationGuard>
            <BumpAdvertisement />
          </VerificationGuard>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/lady/activity" element={
        <ProtectedRoute requiredRole="lady">
          <VerificationGuard>
            <AllActivity />
          </VerificationGuard>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/lady/gifts" element={
        <ProtectedRoute requiredRole="lady">
          <VerificationGuard>
            <MembershipGuard requiredTier="PRO" redirectTo="/dashboard/lady/upgrade">
              <GiftsReceived />
            </MembershipGuard>
          </VerificationGuard>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/lady/fan-earnings" element={
        <ProtectedRoute requiredRole="lady">
          <VerificationGuard>
            <MembershipGuard requiredTier="PRO" redirectTo="/dashboard/lady/upgrade">
              <FanEarnings />
            </MembershipGuard>
          </VerificationGuard>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/lady/credits" element={
        <ProtectedRoute requiredRole="lady">
          <VerificationGuard>
            <DKCredits />
          </VerificationGuard>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/lady/payouts" element={
        <ProtectedRoute requiredRole="lady">
          <VerificationGuard>
            <LadyPayouts />
          </VerificationGuard>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/lady/exchange-credits" element={
        <ProtectedRoute requiredRole="lady">
          <VerificationGuard>
            <ExchangeCredits />
          </VerificationGuard>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/lady/upgrade" element={
        <ProtectedRoute requiredRole="lady">
          <VerificationGuard>
            <MembershipTier />
          </VerificationGuard>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/lady/schedule" element={
        <ProtectedRoute requiredRole="lady">
          <VerificationGuard>
            <MembershipGuard requiredTier="PRO" redirectTo="/dashboard/lady/upgrade">
              <ManageBookings />
            </MembershipGuard>
          </VerificationGuard>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/lady/fan-posts" element={
        <ProtectedRoute requiredRole="lady">
          <VerificationGuard>
            <MembershipGuard requiredTier="PRO" redirectTo="/dashboard/lady/upgrade">
              <ManageFanPosts />
            </MembershipGuard>
          </VerificationGuard>
        </ProtectedRoute>
      } />
      <Route path="/fan-posts/create" element={
        <ProtectedRoute requiredRole="lady">
          <VerificationGuard>
            <MembershipGuard requiredTier="PRO" redirectTo="/dashboard/lady/upgrade">
              <CreateFanPost />
            </MembershipGuard>
          </VerificationGuard>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/lady/reviews" element={
        <ProtectedRoute requiredRole="lady">
          <VerificationGuard>
            <LadyReviews />
          </VerificationGuard>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/lady/upgrade/membership" element={
        <ProtectedRoute requiredRole="lady">
          <VerificationGuard>
            <UpgradeMembership />
          </VerificationGuard>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/lady/account" element={
        <ProtectedRoute requiredRole="lady">
          <VerificationGuard>
            <AccountSettings />
          </VerificationGuard>
        </ProtectedRoute>
      } />
      <Route path="/verification" element={
        <ProtectedRoute requiredRole="lady">
          <Verification />
        </ProtectedRoute>
      } />
      <Route path="/verification/client" element={
        <ProtectedRoute requiredRole="client">
          <ClientVerification />
        </ProtectedRoute>
      } />
      <Route path="/club-verification" element={
        <ProtectedRoute requiredRole="club">
          <ClubVerification />
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard/club" element={
        <ProtectedRoute requiredRole="club">
          <ClubVerificationGuard>
            <ClubDashboard />
          </ClubVerificationGuard>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/club/ladies" element={
        <ProtectedRoute requiredRole="club">
          <ClubVerificationGuard>
            <ClubLadies />
          </ClubVerificationGuard>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/club/promo" element={
        <ProtectedRoute requiredRole="club">
          <ClubVerificationGuard>
            <ClubPromo />
          </ClubVerificationGuard>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/club/bump" element={
        <ProtectedRoute requiredRole="club">
          <ClubVerificationGuard>
            <ClubBump />
          </ClubVerificationGuard>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/club/upgrade" element={
        <ProtectedRoute requiredRole="club">
          <ClubVerificationGuard>
            <ClubUpgrade />
          </ClubVerificationGuard>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/club/reviews" element={
        <ProtectedRoute requiredRole="club">
          <ClubVerificationGuard>
            <ClubReviews />
          </ClubVerificationGuard>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/club/credits" element={
        <ProtectedRoute requiredRole="club">
          <ClubVerificationGuard>
            <ClubCredits />
          </ClubVerificationGuard>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/club/credits/buy" element={
        <ProtectedRoute requiredRole="club">
          <ClubVerificationGuard>
            <ClubCredits />
          </ClubVerificationGuard>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/club/credits/history" element={
        <ProtectedRoute requiredRole="club">
          <ClubVerificationGuard>
            <ClubCredits />
          </ClubVerificationGuard>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/club/settings" element={
        <ProtectedRoute requiredRole="club">
          <ClubVerificationGuard>
            <ClubSettings />
          </ClubVerificationGuard>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/club/verify" element={
        <ProtectedRoute requiredRole="club">
          <ClubVerification />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/club/lady/add" element={
        <ProtectedRoute requiredRole="club">
          <ClubVerificationGuard>
            <ClubLady />
          </ClubVerificationGuard>
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard/client" element={
        <ProtectedRoute requiredRole="client">
          <ClientVerificationGuard>
            <ClientDashboard />
          </ClientVerificationGuard>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/client/bookings" element={
        <ProtectedRoute requiredRole="client">
          <ClientVerificationGuard>
            <ClientBookings />
          </ClientVerificationGuard>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/client/reviews" element={
        <ProtectedRoute requiredRole="client">
          <ClientVerificationGuard>
            <ClientReviews />
          </ClientVerificationGuard>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/client/gifts" element={
        <ProtectedRoute requiredRole="client">
          <ClientVerificationGuard>
            <ClientGifts />
          </ClientVerificationGuard>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/client/fan-posts" element={
        <ProtectedRoute requiredRole="client">
          <ClientVerificationGuard>
            <ClientFanPosts />
          </ClientVerificationGuard>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/client/settings" element={
        <ProtectedRoute requiredRole="client">
          <ClientVerificationGuard>
            <ClientSettings />
          </ClientVerificationGuard>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/client/favorites" element={
        <ProtectedRoute requiredRole="client">
          <ClientVerificationGuard>
            <ClientFavorites />
          </ClientVerificationGuard>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/client/credits" element={
        <ProtectedRoute requiredRole="client">
          <ClientVerificationGuard>
            <ClientCredits />
          </ClientVerificationGuard>
        </ProtectedRoute>
      } />
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <AdminGuard>
          <AdminDashboard />
        </AdminGuard>
      } />
      <Route path="/admin/verifications" element={
        <AdminGuard>
          <VerificationQueue />
        </AdminGuard>
      } />
      <Route path="/admin/verifications/:id" element={
        <AdminGuard>
          <VerificationDetails />
        </AdminGuard>
      } />
      <Route path="/admin/users" element={
        <AdminGuard>
          <UserManagement />
        </AdminGuard>
      } />
      <Route path="/admin/media" element={
        <AdminGuard>
          <MediaModeration />
        </AdminGuard>
      } />
                <Route path="/admin/comments" element={
            <AdminGuard>
              <CommentModeration />
            </AdminGuard>
          } />
          <Route path="/admin/financial" element={
            <AdminGuard>
              <FinancialDashboard />
            </AdminGuard>
          } />
          <Route path="/admin/payouts" element={
            <AdminGuard>
              <AdminPayouts />
            </AdminGuard>
          } />
      <Route path="/admin/analytics" element={
        <AdminGuard>
          <Analytics />
        </AdminGuard>
      } />
      <Route path="/admin/settings" element={
        <AdminGuard>
          <AdminSettings />
        </AdminGuard>
      } />
      
      {/* Credit Store and History Routes */}
      <Route path="/write-review/:ladyId" element={
        <ProtectedRoute requiredRole="client">
          <ClientVerificationGuard>
            <WriteReview />
          </ClientVerificationGuard>
        </ProtectedRoute>
      } />
      <Route path="/credit-store" element={
        <ProtectedRoute requiredRole="client">
          <CreditStore />
        </ProtectedRoute>
      } />
      <Route path="/credit-history" element={
        <ProtectedRoute requiredRole="client">
          <CreditHistory />
        </ProtectedRoute>
      } />
      
      {/* Catch-all route for unknown paths */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
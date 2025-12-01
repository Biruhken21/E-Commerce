
import './css/App.css'

import Home from './pages/Home';
import { Routes, Route } from 'react-router-dom';
import Favorite from './pages/Favorite';
import Login from './pages/Login';
import Register from './pages/Register';
import BrokerContact from './pages/BrokerContact';
import AdminDashboard from './pages/AdminDashboard';
import ProductDetails from './pages/ProductDetails';
import TestPage from './pages/TestPage';

import Navbar from './components/NavBar';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <div>
        <Navbar/>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/test" element={<TestPage />} />
            <Route 
              path="/favorite" 
              element={
                <ProtectedRoute>
                  <Favorite />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/broker-contact" 
              element={
                <ProtectedRoute>
                  <BrokerContact />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/product-details" 
              element={
                <ProtectedRoute>
                  <ProductDetails />
                </ProtectedRoute>
              } 
            />

          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}


  

export default App

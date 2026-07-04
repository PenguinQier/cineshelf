import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Popular from './pages/Popular';
import NotFound from './pages/NotFound';
import SearchResults from './pages/SearchResults';
import Footer from './components/Footer';
import UploadMovie from './pages/UploadMovie';
import MovieDetail from './pages/MovieDetail';
import Categories from './pages/Categories';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Membership from './pages/Membership';
import Favorites from './pages/Favorites';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AuthProvider from './contexts/AuthContext';

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <AuthProvider>
    <Router>
      <div className="app">
        <Header onSearch={handleSearch} />
        <main>
          <Routes>
            <Route path="/" element={<Home searchQuery={searchQuery} />} />
              <Route path="/popular" element={<Popular />} />
            <Route path="/search" element={<SearchResults />} />
              <Route path="/movie/:id" element={<MovieDetail />} />
              <Route path="/upload" element={
                <AdminRoute>
                  <UploadMovie />
                </AdminRoute>
              } />
              <Route path="/categories" element={<Categories />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/favorites" element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/membership" element={
                <ProtectedRoute>
                  <Membership />
                </ProtectedRoute>
              } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
    </AuthProvider>
  );
}

export default App;
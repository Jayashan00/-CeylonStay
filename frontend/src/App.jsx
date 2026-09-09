import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import Home from './pages/Home.jsx'
import HotelListing from './pages/HotelListing.jsx'
import HotelDetails from './pages/HotelDetails.jsx'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import GuestBookings from './pages/guest/GuestBookings.jsx'
import BookingConfirmation from './pages/guest/BookingConfirmation.jsx'

import OwnerOverview from './pages/owner/OwnerOverview.jsx'
import OwnerProperties from './pages/owner/OwnerProperties.jsx'
import OwnerHotelForm from './pages/owner/OwnerHotelForm.jsx'
import OwnerHotelRooms from './pages/owner/OwnerHotelRooms.jsx'
import OwnerRoomCalendar from './pages/owner/OwnerRoomCalendar.jsx'
import OwnerBookings from './pages/owner/OwnerBookings.jsx'
import OwnerBookingPayments from './pages/owner/OwnerBookingPayments.jsx'
import OwnerPayments from './pages/owner/OwnerPayments.jsx'

import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminHotels from './pages/admin/AdminHotels.jsx'
import AdminUsers from './pages/admin/AdminUsers.jsx'
import AdminBookings from './pages/admin/AdminBookings.jsx'
import AdminSettings from './pages/admin/AdminSettings.jsx'

import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hotels" element={<HotelListing />} />
          <Route path="/hotels/:id" element={<HotelDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/booking-confirmation/:id" element={
            <ProtectedRoute roles={['GUEST', 'ADMIN', 'HOTEL_OWNER']}><BookingConfirmation /></ProtectedRoute>
          } />
          <Route path="/my-bookings" element={
            <ProtectedRoute roles={['GUEST', 'ADMIN', 'HOTEL_OWNER']}><GuestBookings /></ProtectedRoute>
          } />

          <Route path="/owner" element={
            <ProtectedRoute roles={['HOTEL_OWNER', 'ADMIN']}><OwnerOverview /></ProtectedRoute>
          } />
          <Route path="/owner/properties" element={
            <ProtectedRoute roles={['HOTEL_OWNER', 'ADMIN']}><OwnerProperties /></ProtectedRoute>
          } />
          <Route path="/owner/hotels/new" element={
            <ProtectedRoute roles={['HOTEL_OWNER', 'ADMIN']}><OwnerHotelForm /></ProtectedRoute>
          } />
          <Route path="/owner/hotels/:id/edit" element={
            <ProtectedRoute roles={['HOTEL_OWNER', 'ADMIN']}><OwnerHotelForm /></ProtectedRoute>
          } />
          <Route path="/owner/hotels/:id/rooms" element={
            <ProtectedRoute roles={['HOTEL_OWNER', 'ADMIN']}><OwnerHotelRooms /></ProtectedRoute>
          } />
          <Route path="/owner/rooms/:roomId/calendar" element={
            <ProtectedRoute roles={['HOTEL_OWNER', 'ADMIN']}><OwnerRoomCalendar /></ProtectedRoute>
          } />
          <Route path="/owner/bookings" element={
            <ProtectedRoute roles={['HOTEL_OWNER', 'ADMIN']}><OwnerBookings /></ProtectedRoute>
          } />
          <Route path="/owner/bookings/:id/payments" element={
            <ProtectedRoute roles={['HOTEL_OWNER', 'ADMIN']}><OwnerBookingPayments /></ProtectedRoute>
          } />
          <Route path="/owner/payments" element={
            <ProtectedRoute roles={['HOTEL_OWNER', 'ADMIN']}><OwnerPayments /></ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/hotels" element={
            <ProtectedRoute roles={['ADMIN']}><AdminHotels /></ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute roles={['ADMIN']}><AdminUsers /></ProtectedRoute>
          } />
          <Route path="/admin/bookings" element={
            <ProtectedRoute roles={['ADMIN']}><AdminBookings /></ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute roles={['ADMIN']}><AdminSettings /></ProtectedRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

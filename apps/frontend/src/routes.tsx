import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppLayout } from './components/AppLayout';
import { CatalogPage } from './pages/guest/CatalogPage';
import { BookingPage } from './pages/guest/BookingPage';
import { BookingsPage } from './pages/admin/BookingsPage';
import { EventTypesPage } from './pages/admin/EventTypesPage';
import { AvailabilityPage } from './pages/admin/AvailabilityPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <CatalogPage /> },
      { path: 'book/:eventTypeId', element: <BookingPage /> },
      {
        path: 'admin',
        children: [
          { index: true, element: <Navigate to="bookings" replace /> },
          { path: 'bookings', element: <BookingsPage /> },
          { path: 'event-types', element: <EventTypesPage /> },
          { path: 'availability', element: <AvailabilityPage /> },
        ],
      },
    ],
  },
]);

import { Router, Redirect } from '@reach/router';
import * as React from 'react';
import { PrivateRoutes as Routes } from './constants/routes';
import { BookingsPage } from './pages/BookingsPage/BookingsPage';
import { EscapeRoomPage } from './pages/EscapeRoomPage/EscapeRoomPage';
import { EscapeRoomsPage } from './pages/EscapeRoomsPage/EscapeRoomsPage';
import { OrganizationPage } from './pages/OrganizationPage/OrganizationPage';
import { PageNotFound } from './pages/PageNotFound';
import { useUser } from './shared/hooks/useUser';

const RequireOrganization = ({
  component,
  path,
  ...rest
}: {
  component: React.ReactType<{ path: string }>;
  path: string;
}) => {
  const { memberships, isLoading } = useUser();

  console.log(memberships, isLoading);

  const Route = component;

  return memberships?.[0] ? (
    <Route path={path} {...rest} />
  ) : (
    <Redirect noThrow replace from={path} to={Routes.Organization} />
  );
};

export function PrivateRoutes() {
  return (
    <Router>
      <OrganizationPage path={Routes.Organization} />
      <RequireOrganization component={BookingsPage} path={Routes.Bookings} />
      <RequireOrganization
        component={EscapeRoomPage}
        path={Routes.EscapeRoom}
      />
      <RequireOrganization
        component={EscapeRoomsPage}
        path={Routes.EscapeRooms}
      />
      <PageNotFound default />
    </Router>
  );
}

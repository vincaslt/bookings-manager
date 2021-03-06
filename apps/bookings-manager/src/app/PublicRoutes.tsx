import { Router } from '@reach/router';
import * as React from 'react';
import { PublicRoutes as Routes } from './constants/routes';
import { LoginPage } from './pages/LoginPage/LoginPage';
import { RegistrationPage } from './pages/RegistrationPage/RegistrationPage';

export function PublicRoutes() {
  return (
    <Router>
      <RegistrationPage path={Routes.Landing} />
      <LoginPage path={Routes.SignIn} />
    </Router>
  );
}

import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import SpinCentered from 'components/spin-centered/SpinCentered';

export const SuspenseLayout = () => (
  <Suspense fallback={<SpinCentered />}>
    <Outlet />
  </Suspense>
);

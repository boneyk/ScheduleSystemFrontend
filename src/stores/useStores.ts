import { useContext } from 'react';

import { StoresContext } from './stores.context';

export const useStores = () => {
  return useContext(StoresContext);
};

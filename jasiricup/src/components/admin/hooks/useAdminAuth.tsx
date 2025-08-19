import { useState } from 'react';

const useAdminAuth = () => {
  const [adminToken, setAdminToken] = useState('');

  return { adminToken, setAdminToken };
};

export default useAdminAuth;
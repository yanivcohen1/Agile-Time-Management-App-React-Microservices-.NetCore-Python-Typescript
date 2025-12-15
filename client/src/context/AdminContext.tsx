import React, { createContext, useContext, useState } from 'react';

interface AdminContextType {
  isAdminSwitchOn: boolean;
  toggleAdminSwitch: () => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminSwitchOn, setIsAdminSwitchOn] = useState(false);

  const toggleAdminSwitch = () => {
    setIsAdminSwitchOn(prev => !prev);
  };

  return (
    <AdminContext.Provider value={{ isAdminSwitchOn, toggleAdminSwitch }}>
      {children}
    </AdminContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within an AdminProvider');
  return context;
};

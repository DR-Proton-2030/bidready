'use client';

import { useState } from 'react';
import { 
  PERMISSIONS_DATA, 
  ACCESS_REQUESTS_DATA, 
  ACCESS_MANAGEMENT_TEXT 
} from '@/constants/accessManagement/accessManagement.constant';

export const useAccessManagement = () => {
  const [permissions] = useState(PERMISSIONS_DATA);
  const [accessRequests, setAccessRequests] = useState(ACCESS_REQUESTS_DATA);

  const handleCreatePermission = () => {
    console.log('Creating new permission...');
    // Add actual permission creation logic here
  };

  const handleEditPermission = (id: number) => {
    console.log(`Editing permission with id: ${id}`);
    // Add permission editing logic here
  };

  const handleApproveRequest = (id: number) => {
    setAccessRequests(prev => 
      prev.map(request => 
        request.id === id 
          ? { ...request, status: 'Approved' as const }
          : request
      )
    );
  };

  const handleDenyRequest = (id: number) => {
    setAccessRequests(prev => 
      prev.map(request => 
        request.id === id 
          ? { ...request, status: 'Denied' as const }
          : request
      )
    );
  };

  const handleRoleClick = (role: string) => {
    console.log(`Role clicked: ${role}`);
    // Add role management logic here
  };

  return {
    permissions,
    accessRequests,
    handleCreatePermission,
    handleEditPermission,
    handleApproveRequest,
    handleDenyRequest,
    handleRoleClick,
  };
};

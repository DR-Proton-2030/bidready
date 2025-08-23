'use client';

import React from 'react';
import { Key, Shield } from 'lucide-react';
import { PageHeader, PermissionCard, AccessRequestCard, RoleCard } from '@/components/shared';
import { useAccessManagement } from '@/hooks/useAccessManagement/useAccessManagement';
import { 
  SYSTEM_ROLES, 
  ACCESS_MANAGEMENT_TEXT 
} from '@/constants/accessManagement/accessManagement.constant';

const AccessManagement: React.FC = () => {
  const {
    permissions,
    accessRequests,
    handleCreatePermission,
    handleEditPermission,
    handleApproveRequest,
    handleDenyRequest,
    handleRoleClick,
  } = useAccessManagement();

  return (
    <div className="space-y-6">
      <PageHeader 
        title={ACCESS_MANAGEMENT_TEXT.pageTitle}
        buttonText={ACCESS_MANAGEMENT_TEXT.createPermissionButton}
        onButtonClick={handleCreatePermission}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Permissions Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            {ACCESS_MANAGEMENT_TEXT.permissionsTitle}
          </h2>
          <div className="space-y-4">
            {permissions.map((permission) => (
              <PermissionCard
                key={permission.id}
                {...permission}
                onEdit={handleEditPermission}
              />
            ))}
          </div>
        </div>

        {/* Access Requests Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {ACCESS_MANAGEMENT_TEXT.accessRequestsTitle}
          </h2>
          <div className="space-y-4">
            {accessRequests.map((request) => (
              <AccessRequestCard
                key={request.id}
                {...request}
                onApprove={handleApproveRequest}
                onDeny={handleDenyRequest}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Role-based Access Control */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {ACCESS_MANAGEMENT_TEXT.roleBasedAccessTitle}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SYSTEM_ROLES.map((role) => (
            <RoleCard
              key={role.name}
              {...role}
              onClick={handleRoleClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccessManagement;

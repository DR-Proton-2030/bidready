"use client";

import Users from '@/components/pages/users/Users';
import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthContext from "@/contexts/authContext/authContext";
import { LoadingSpinner } from "@/components/shared";

const AccessManagementPage = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  // Check if user is admin hhh

  // mnnn

  const isAdmin = React.useMemo(() => {
    const role = user?.role?.toUpperCase() || "";
    return role === "COMPANY_ADMIN" || role === "ADMIN" || role === "SUPER_ADMIN";
  }, [user?.role]);

  useEffect(() => {
    // Wait a moment for auth context to hydrate
    const timer = setTimeout(() => {
      setIsChecking(false);
      // Redirect non-admin users to dashboard
      if (user && !isAdmin) {
        router.replace("/dashboard");
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user, isAdmin, router]);

  // Show loading while checking auth
  if (isChecking || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  // Don't render if not admin (will redirect)
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Access Denied</h2>
          <p className="text-gray-500 mt-2">You don&apos;t have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return <Users />;
};

export default AccessManagementPage;

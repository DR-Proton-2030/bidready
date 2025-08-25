import Link from "next/link";
import React from "react";

const HaveNoAccount = () => {
  return (
    <div id="account-not-found-container">
      <div
        id="account-not-found"
        className="flex justify-start text-sm text-gray-600"
      >
        Have No Account?&nbsp;
        <Link href="/signup" className="text-link hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  );
};

export default HaveNoAccount;

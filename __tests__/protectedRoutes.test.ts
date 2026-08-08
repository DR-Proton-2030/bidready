import { ProtectedRoutes } from "@/constants/protectedRoutes/ProtectedRoutes";

/**
 * Mirrors the check in contexts/authContext/Provider.tsx. AuthContext only
 * fetches the signed-in user on a protected route, so anything relying on
 * `user` — presence avatars and collaboration identity included — is silently
 * inert on a page that is missing from this list.
 */
const isProtected = (pathname: string) => {
  const currentPath = pathname.split("/")[1];
  return ProtectedRoutes.some((route) =>
    currentPath.startsWith(route.replace("/", "")),
  );
};

describe("ProtectedRoutes", () => {
  it("covers the plan review page that collaboration runs on", () => {
    expect(isProtected("/blueprint_detection/abc123")).toBe(true);
  });

  it("still covers the other dashboard pages", () => {
    expect(isProtected("/dashboard")).toBe(true);
    expect(isProtected("/blueprints/xyz")).toBe(true);
    expect(isProtected("/projects")).toBe(true);
    expect(isProtected("/project-details/1")).toBe(true);
  });

  it("leaves public routes unprotected", () => {
    expect(isProtected("/login")).toBe(false);
    expect(isProtected("/signup")).toBe(false);
    expect(isProtected("/")).toBe(false);
  });
});

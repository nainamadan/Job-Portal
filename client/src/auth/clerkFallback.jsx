/* eslint-disable react-refresh/only-export-components -- this file mimics a library module */
// Stand-in for "@clerk/clerk-react" used ONLY when VITE_CLERK_PUBLISHABLE_KEY is not set.
// vite.config.js swaps this file in automatically, so the website still opens
// (everyone is treated as "signed out"). Add the key to client/.env to turn real login back on.
import { Children, cloneElement, isValidElement } from "react";
import { toast } from "react-toastify";

const notConfigured = () =>
  toast.info("Job seeker login is not set up yet. Add VITE_CLERK_PUBLISHABLE_KEY to client/.env to enable it.");

export const ClerkProvider = ({ children }) => <>{children}</>;
export const SignedIn = () => null;
export const SignedOut = ({ children }) => <>{children}</>;
export const UserButton = () => null;

export const SignInButton = ({ children }) => {
  const child = Children.only(children);
  return isValidElement(child)
    ? cloneElement(child, { onClick: notConfigured })
    : <button onClick={notConfigured}>Sign in</button>;
};

export const useUser = () => ({ isLoaded: true, isSignedIn: false, user: null });
export const useAuth = () => ({
  isLoaded: true,
  isSignedIn: false,
  userId: null,
  getToken: async () => null,
});
export const useClerk = () => ({ openSignIn: notConfigured, signOut: async () => {} });

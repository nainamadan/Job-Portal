import { useCallback } from "react";
import { useAuth, useClerk, useUser } from "@clerk/clerk-react";
import MessagesInbox from "../components/MessagesInbox";

// Job seeker inbox: conversations with recruiters about jobs.
const Messages = () => {
  const { isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { openSignIn } = useClerk();

  const getHeaders = useCallback(async () => ({ Authorization: `Bearer ${await getToken()}` }), [getToken]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 min-h-[70vh]">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">My Messages</h1>
      <p className="text-slate-500 mt-1 mb-6">Questions you've asked recruiters about jobs, and their replies.</p>

      {!isLoaded ? null : isSignedIn ? (
        <MessagesInbox side="user" getHeaders={getHeaders} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <p className="text-4xl mb-3">🔒</p>
          <p className="text-slate-600 mb-4">Please log in to message recruiters and see their replies.</p>
          <button onClick={() => openSignIn()} className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700">
            Login / Register
          </button>
        </div>
      )}
    </div>
  );
};

export default Messages;

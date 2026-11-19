import { useCallback, useContext } from "react";
import { AppContext } from "../context/AppContext";
import MessagesInbox from "../components/MessagesInbox";

// Recruiter dashboard inbox: questions from job seekers about this company's jobs.
const RecruiterMessages = () => {
  const { companyToken } = useContext(AppContext);

  const getHeaders = useCallback(
    async () => ({ token: companyToken || localStorage.getItem("companyToken") }),
    [companyToken]
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
      <p className="text-slate-500 mt-1 mb-6">Reply to job seekers' questions about your job posts and updates.</p>
      <MessagesInbox side="company" getHeaders={getHeaders} />
    </div>
  );
};

export default RecruiterMessages;

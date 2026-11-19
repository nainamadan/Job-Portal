import { useEffect, useState } from "react";

// A job is open until its application deadline (the server sets it to 23:59:59 on the last day).
// Older jobs without a deadline stay open. Same rule as openJobsOnly in server/utils/jobFilters.js.
export const isJobOpen = (job, now = Date.now()) => {
  if (!job?.applicationDeadline) return true;
  const deadline = new Date(job.applicationDeadline).getTime();
  return Number.isNaN(deadline) || deadline > now;
};

/** The current time, refreshed every `intervalMs`, so expired jobs disappear while a page stays open. */
export const useNow = (intervalMs = 60000) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
};

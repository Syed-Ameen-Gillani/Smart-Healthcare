import React, { useEffect, useState } from "react";

export default function OfflineBanner() {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const showOnline = () => setOnline(true);
    const showOffline = () => setOnline(false);
    window.addEventListener("online", showOnline);
    window.addEventListener("offline", showOffline);
    return () => {
      window.removeEventListener("online", showOnline);
      window.removeEventListener("offline", showOffline);
    };
  }, []);

  if (online) return null;
  return <div className="offline-banner" role="status">You are offline. Some Smart Health features are unavailable.</div>;
}

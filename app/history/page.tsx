"use client";

import { useEffect, useState } from "react";
import ProfileGate from "@/components/ProfileGate";
import CheckinHistoryList from "@/components/CheckinHistoryList";
import type { CheckinDTO } from "@/lib/types";

function HistoryContent({ profileName }: { profileName: string }) {
  const [checkins, setCheckins] = useState<CheckinDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/checkins?profileName=${encodeURIComponent(profileName)}`);
        const data = await res.json();
        if (active && res.ok) {
          setCheckins(data.checkins ?? []);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [profileName]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Your history</h1>
        <p className="text-slate-600">See how your check-ins have evolved over time.</p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-3xl bg-slate-100" />
          ))}
        </div>
      ) : (
        <CheckinHistoryList checkins={checkins} />
      )}
    </div>
  );
}

export default function HistoryPage() {
  return <ProfileGate>{(profileName) => <HistoryContent profileName={profileName} />}</ProfileGate>;
}

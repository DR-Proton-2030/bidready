"use client";

import React, { useMemo } from "react";
import { CollabPeer, CollabStatus, CollabUser } from "@/@types/collab/collab.types";

interface PresenceBarProps {
  status: CollabStatus;
  peers: CollabPeer[];
  self: CollabUser | null;
  /** Avatars beyond this collapse into a "+N" chip. */
  maxVisible?: number;
}

const initialsOf = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";

const STATUS_META: Record<
  CollabStatus,
  { dot: string; label: string; pulse: boolean }
> = {
  disabled: { dot: "bg-slate-400", label: "Solo", pulse: false },
  connecting: { dot: "bg-amber-400", label: "Connecting", pulse: true },
  connected: { dot: "bg-emerald-400", label: "Live", pulse: false },
  reconnecting: { dot: "bg-amber-400", label: "Reconnecting", pulse: true },
  error: { dot: "bg-red-500", label: "Offline", pulse: false },
};

/**
 * Avatar stack of everyone currently on this plan, plus connection state.
 *
 * Peers are collapsed by user id, so one person with two tabs open shows as a
 * single avatar rather than a duplicate.
 */
export const PresenceBar: React.FC<PresenceBarProps> = ({
  status,
  peers,
  self,
  maxVisible = 4,
}) => {
  const uniquePeers = useMemo(() => {
    const byUser = new Map<string, CollabUser>();
    for (const peer of peers) {
      if (!byUser.has(peer.user.id)) byUser.set(peer.user.id, peer.user);
    }
    // The local user may also appear via another tab; never list them twice.
    if (self) byUser.delete(self.id);
    return Array.from(byUser.values());
  }, [peers, self]);

  if (status === "disabled") return null;

  const meta = STATUS_META[status];
  const visible = uniquePeers.slice(0, maxVisible);
  const overflow = uniquePeers.length - visible.length;

  return (
    <div className="flex items-center gap-3 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm">
      <div className="flex items-center gap-1.5" title={`Collaboration: ${meta.label}`}>
        <span className="relative flex h-2 w-2">
          {meta.pulse && (
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${meta.dot}`}
            />
          )}
          <span className={`relative inline-flex h-2 w-2 rounded-full ${meta.dot}`} />
        </span>
        <span className="text-xs font-medium text-white/80">{meta.label}</span>
      </div>

      {uniquePeers.length > 0 && (
        <>
          <span className="h-4 w-px bg-white/20" />
          <div className="flex items-center -space-x-2">
            {self && (
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-900 text-[10px] font-bold text-white"
                style={{ backgroundColor: self.color }}
                title={`${self.name} (you)`}
              >
                {initialsOf(self.name)}
              </div>
            )}
            {visible.map((user) => (
              <div
                key={user.id}
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-900 text-[10px] font-bold text-white"
                style={{ backgroundColor: user.color }}
                title={user.email ? `${user.name} — ${user.email}` : user.name}
              >
                {initialsOf(user.name)}
              </div>
            ))}
            {overflow > 0 && (
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-600 text-[10px] font-bold text-white"
                title={uniquePeers
                  .slice(maxVisible)
                  .map((u) => u.name)
                  .join(", ")}
              >
                +{overflow}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PresenceBar;

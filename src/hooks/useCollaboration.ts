"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ClientMessage,
  CollabDraft,
  CollabOp,
  CollabPeer,
  CollabSnapshot,
  CollabStatus,
  CollabUser,
  PeerPresence,
  Point,
  ServerMessage,
  StampedOp,
} from "@/@types/collab/collab.types";

/** Presence palette — deterministic per user so colours are stable across sessions. */
const PRESENCE_COLORS = [
  "#2563eb",
  "#db2777",
  "#059669",
  "#d97706",
  "#7c3aed",
  "#0891b2",
  "#dc2626",
  "#4f46e5",
];

/** Cursor updates are throttled to keep the socket quiet during fast drags. */
const CURSOR_THROTTLE_MS = 50;
const DRAFT_THROTTLE_MS = 60;
const RECONNECT_BASE_MS = 500;
const RECONNECT_MAX_MS = 15000;
const HEARTBEAT_MS = 25000;

export const colorForUserId = (id: string): string => {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return PRESENCE_COLORS[Math.abs(hash) % PRESENCE_COLORS.length];
};

const resolveWsUrl = (): string => {
  const explicit = process.env.NEXT_PUBLIC_COLLAB_WS_URL;
  if (explicit) return explicit;

  if (typeof window !== "undefined") {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.hostname || "localhost";
    return `${protocol}//${host}:8991`;
  }

  return "ws://localhost:8991";
};

export type UseCollaborationOptions = {
  /** Room key, typically `${blueprintId}:${imageId}`. Null disables collaboration. */
  roomId: string | null;
  /** Local user identity. Null disables collaboration. */
  user: CollabUser | null;
  /** Master switch — when false the hook stays completely inert. */
  enabled?: boolean;
  /** Called for remote ops only; the sender's own ops are filtered out. */
  onRemoteOp?: (op: StampedOp) => void;
  /** Called on join and on every successful reconnect, with authoritative state. */
  onSnapshot?: (snapshot: CollabSnapshot) => void;
};

export type UseCollaborationResult = {
  status: CollabStatus;
  /** Peers excluding self, in join order. */
  peers: CollabPeer[];
  /** Live cursor/draft state per peer clientId. */
  presence: Record<string, PeerPresence>;
  selfClientId: string | null;
  publish: (op: CollabOp) => void;
  publishCursor: (point: Point | null, tool?: string) => void;
  publishDraft: (draft: CollabDraft | null) => void;
  isConnected: boolean;
};

export function useCollaboration({
  roomId,
  user,
  enabled = true,
  onRemoteOp,
  onSnapshot,
}: UseCollaborationOptions): UseCollaborationResult {
  const active = Boolean(enabled && roomId && user);

  const [status, setStatus] = useState<CollabStatus>("disabled");
  const [peers, setPeers] = useState<CollabPeer[]>([]);
  const [presence, setPresence] = useState<Record<string, PeerPresence>>({});
  const [selfClientId, setSelfClientId] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const selfClientIdRef = useRef<string | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptRef = useRef(0);
  /** Guards against a queued reconnect firing after the effect tore down. */
  const disposedRef = useRef(false);
  const lastCursorSentRef = useRef(0);
  const lastDraftSentRef = useRef(0);
  /** opIds this client originated, so echoes can be ignored. */
  const ownOpsRef = useRef<Set<string>>(new Set());

  // Callbacks live in refs so a re-render never tears down the socket.
  const onRemoteOpRef = useRef(onRemoteOp);
  const onSnapshotRef = useRef(onSnapshot);
  const userRef = useRef(user);

  useEffect(() => {
    onRemoteOpRef.current = onRemoteOp;
  }, [onRemoteOp]);

  useEffect(() => {
    onSnapshotRef.current = onSnapshot;
  }, [onSnapshot]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Identity fields that should force a rejoin when they change.
  const userKey = user ? `${user.id}|${user.name}|${user.color}` : null;

  const sendRaw = useCallback((message: ClientMessage) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    try {
      ws.send(JSON.stringify(message));
      return true;
    } catch {
      return false;
    }
  }, []);

  const handleServerMessage = useCallback((message: ServerMessage) => {
    switch (message.type) {
      case "welcome": {
        selfClientIdRef.current = message.clientId;
        setSelfClientId(message.clientId);
        setStatus("connected");
        attemptRef.current = 0;
        setPeers(message.peers);
        setPresence((prev) => {
          const next: Record<string, PeerPresence> = {};
          for (const peer of message.peers) {
            next[peer.clientId] = prev[peer.clientId] ?? {
              peer,
              point: null,
              draft: null,
              updatedAt: Date.now(),
            };
          }
          return next;
        });
        onSnapshotRef.current?.(message.snapshot);
        break;
      }

      case "peer_join": {
        setPeers((prev) =>
          prev.some((p) => p.clientId === message.peer.clientId)
            ? prev
            : [...prev, message.peer],
        );
        setPresence((prev) => ({
          ...prev,
          [message.peer.clientId]: {
            peer: message.peer,
            point: null,
            draft: null,
            updatedAt: Date.now(),
          },
        }));
        break;
      }

      case "peer_leave": {
        setPeers((prev) => prev.filter((p) => p.clientId !== message.clientId));
        setPresence((prev) => {
          if (!prev[message.clientId]) return prev;
          const next = { ...prev };
          delete next[message.clientId];
          return next;
        });
        break;
      }

      case "op": {
        // Skip our own echo — the local state already applied it optimistically.
        if (ownOpsRef.current.delete(message.op.opId)) return;
        onRemoteOpRef.current?.(message.op);
        break;
      }

      case "cursor": {
        setPresence((prev) => {
          const existing = prev[message.clientId];
          if (!existing) return prev;
          return {
            ...prev,
            [message.clientId]: {
              ...existing,
              point: message.point,
              tool: message.tool,
              updatedAt: Date.now(),
            },
          };
        });
        break;
      }

      case "draft": {
        setPresence((prev) => {
          const existing = prev[message.clientId];
          if (!existing) return prev;
          return {
            ...prev,
            [message.clientId]: {
              ...existing,
              draft: message.draft,
              updatedAt: Date.now(),
            },
          };
        });
        break;
      }

      case "error": {
        console.error("[collab] server error:", message.message);
        if (message.fatal) setStatus("error");
        break;
      }

      default:
        break;
    }
  }, []);

  useEffect(() => {
    if (!active || !roomId) {
      setStatus("disabled");
      setPeers([]);
      setPresence({});
      setSelfClientId(null);
      return;
    }

    disposedRef.current = false;
    attemptRef.current = 0;

    const clearTimers = () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }
    };

    const scheduleReconnect = () => {
      if (disposedRef.current) return;

      attemptRef.current += 1;
      const backoff = Math.min(
        RECONNECT_BASE_MS * 2 ** (attemptRef.current - 1),
        RECONNECT_MAX_MS,
      );
      // Jitter avoids every client stampeding the server after a restart.
      const delay = backoff * (0.5 + Math.random() * 0.5);

      setStatus("reconnecting");
      reconnectTimerRef.current = setTimeout(() => {
        reconnectTimerRef.current = null;
        connect();
      }, delay);
    };

    const connect = () => {
      if (disposedRef.current) return;

      const currentUser = userRef.current;
      if (!currentUser) return;

      let ws: WebSocket;
      try {
        ws = new WebSocket(resolveWsUrl());
      } catch (err) {
        console.error("[collab] failed to open socket:", err);
        scheduleReconnect();
        return;
      }

      wsRef.current = ws;
      setStatus((prev) => (prev === "reconnecting" ? prev : "connecting"));

      ws.onopen = () => {
        if (disposedRef.current) {
          ws.close();
          return;
        }
        ws.send(
          JSON.stringify({
            type: "join",
            roomId,
            user: currentUser,
          } satisfies ClientMessage),
        );

        heartbeatTimerRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" } satisfies ClientMessage));
          }
        }, HEARTBEAT_MS);
      };

      ws.onmessage = (event) => {
        try {
          handleServerMessage(JSON.parse(event.data) as ServerMessage);
        } catch (err) {
          console.error("[collab] failed to parse message:", err);
        }
      };

      ws.onerror = () => {
        // `onclose` always follows, so reconnection is handled there.
      };

      ws.onclose = () => {
        if (wsRef.current === ws) wsRef.current = null;
        if (heartbeatTimerRef.current) {
          clearInterval(heartbeatTimerRef.current);
          heartbeatTimerRef.current = null;
        }

        selfClientIdRef.current = null;
        setSelfClientId(null);
        setPeers([]);
        setPresence({});
        ownOpsRef.current.clear();

        if (!disposedRef.current) scheduleReconnect();
      };
    };

    connect();

    return () => {
      disposedRef.current = true;
      clearTimers();

      const ws = wsRef.current;
      wsRef.current = null;
      if (ws) {
        ws.onclose = null;
        ws.onerror = null;
        ws.onmessage = null;
        ws.onopen = null;
        try {
          ws.close();
        } catch {
          // already closing
        }
      }

      selfClientIdRef.current = null;
      ownOpsRef.current.clear();
      setStatus("disabled");
      setPeers([]);
      setPresence({});
      setSelfClientId(null);
    };
  }, [active, roomId, userKey, handleServerMessage]);

  const publish = useCallback(
    (op: CollabOp) => {
      if (!active) return;

      const opId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      ownOpsRef.current.add(opId);
      // Bound the set in case the socket drops before echoes come back.
      if (ownOpsRef.current.size > 500) {
        const iterator = ownOpsRef.current.values();
        for (let i = 0; i < 100; i += 1) {
          const entry = iterator.next();
          if (entry.done) break;
          ownOpsRef.current.delete(entry.value);
        }
      }

      const sent = sendRaw({ type: "op", op, opId });
      if (!sent) ownOpsRef.current.delete(opId);
    },
    [active, sendRaw],
  );

  const publishCursor = useCallback(
    (point: Point | null, tool?: string) => {
      if (!active) return;

      const now = Date.now();
      // A null point means "cursor left" and must never be dropped.
      if (point && now - lastCursorSentRef.current < CURSOR_THROTTLE_MS) return;
      lastCursorSentRef.current = now;

      sendRaw({ type: "cursor", point, tool });
    },
    [active, sendRaw],
  );

  const publishDraft = useCallback(
    (draft: CollabDraft | null) => {
      if (!active) return;

      const now = Date.now();
      if (draft && now - lastDraftSentRef.current < DRAFT_THROTTLE_MS) return;
      lastDraftSentRef.current = now;

      sendRaw({ type: "draft", draft });
    },
    [active, sendRaw],
  );

  return useMemo(
    () => ({
      status,
      peers,
      presence,
      selfClientId,
      publish,
      publishCursor,
      publishDraft,
      isConnected: status === "connected",
    }),
    [status, peers, presence, selfClientId, publish, publishCursor, publishDraft],
  );
}

export default useCollaboration;

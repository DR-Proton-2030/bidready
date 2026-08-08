/**
 * Wire protocol for realtime blueprint collaboration.
 *
 * The server is the single serialization point: every mutating op is stamped
 * with a monotonically increasing `seq` per room and rebroadcast in that order,
 * so applying ops in received order converges every client onto the same state.
 *
 * Keep this file structurally in sync with the server copy at
 * bidready-pdf-converter/src/collab/types.ts
 */

export type Point = { x: number; y: number };

/** A drawn shape — mirrors the `Detection` shape used by FullScreenImageViewer. */
export type CollabAnnotation = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  class?: string;
  confidence?: number;
  color: string;
  points?: Point[];
  meta?: Record<string, any>;
  source?: string;
};

/** A linear measurement — mirrors `MeasurementOverlay`. */
export type CollabMeasurement = {
  id: string;
  start: Point;
  end: Point;
  lengthPx: number;
  value: number;
  unit: string;
  label: string;
  hasCalibration: boolean;
};

export type CollabUser = {
  /** Stable identity across tabs/reconnects (email or user id). */
  id: string;
  name: string;
  email?: string;
  /** Presence colour, assigned client-side from a fixed palette. */
  color: string;
  avatar?: string;
};

/** A peer currently in the room. */
export type CollabPeer = {
  clientId: string;
  user: CollabUser;
  joinedAt: number;
};

/** Mutating operations. `seq`/`actor` are stamped by the server. */
export type CollabOp =
  | { kind: "annotation.upsert"; id: string; data: CollabAnnotation }
  | { kind: "annotation.delete"; id: string }
  | { kind: "measurement.upsert"; id: string; data: CollabMeasurement }
  | { kind: "measurement.delete"; id: string }
  | { kind: "detection.dismiss"; id: string }
  | { kind: "detection.restore"; id: string };

export type StampedOp = CollabOp & {
  seq: number;
  actor: string;
  at: number;
  /** Client-generated id, echoed back so the sender can skip its own op. */
  opId: string;
};

/** An in-progress shape, broadcast while a peer is mid-draw. Never persisted. */
export type CollabDraft =
  | {
      tool: "annotate";
      rect: { x: number; y: number; width: number; height: number };
    }
  | { tool: "polygon"; points: Point[] }
  | { tool: "measure"; start: Point; end: Point };

/** The full replicated document for one room. */
export type CollabSnapshot = {
  annotations: CollabAnnotation[];
  measurements: CollabMeasurement[];
  dismissed: string[];
  seq: number;
};

export type ClientMessage =
  | { type: "join"; roomId: string; user: CollabUser }
  | { type: "op"; op: CollabOp; opId: string }
  | { type: "cursor"; point: Point | null; tool?: string }
  | { type: "draft"; draft: CollabDraft | null }
  | { type: "ping" };

export type ServerMessage =
  | {
      type: "welcome";
      clientId: string;
      roomId: string;
      snapshot: CollabSnapshot;
      peers: CollabPeer[];
    }
  | { type: "peer_join"; peer: CollabPeer }
  | { type: "peer_leave"; clientId: string }
  | { type: "op"; op: StampedOp }
  | { type: "cursor"; clientId: string; point: Point | null; tool?: string }
  | { type: "draft"; clientId: string; draft: CollabDraft | null }
  | { type: "pong" }
  | { type: "error"; message: string; fatal?: boolean };

export type CollabStatus =
  | "disabled"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "error";

/** Live presence entry for a peer, keyed by clientId. */
export type PeerPresence = {
  peer: CollabPeer;
  point: Point | null;
  tool?: string;
  draft: CollabDraft | null;
  /** Timestamp of the last cursor/draft update, used to fade idle cursors. */
  updatedAt: number;
};

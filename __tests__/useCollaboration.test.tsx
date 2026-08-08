import { act, renderHook, waitFor } from "@testing-library/react";
import useCollaboration, { colorForUserId } from "@/hooks/useCollaboration";
import type {
  CollabSnapshot,
  CollabUser,
  ServerMessage,
  StampedOp,
} from "@/@types/collab/collab.types";

/** Minimal controllable WebSocket stand-in. */
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  static instances: MockWebSocket[] = [];

  readyState = MockWebSocket.CONNECTING;
  sent: string[] = [];
  url: string;

  onopen: (() => void) | null = null;
  onmessage: ((e: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: (() => void) | null = null;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  send(data: string) {
    this.sent.push(data);
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.();
  }

  /* ── test helpers ── */
  open() {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.();
  }

  emit(message: ServerMessage) {
    this.onmessage?.({ data: JSON.stringify(message) });
  }

  get parsedSent() {
    return this.sent.map((s) => JSON.parse(s));
  }

  static latest() {
    return MockWebSocket.instances[MockWebSocket.instances.length - 1];
  }

  static reset() {
    MockWebSocket.instances = [];
  }
}

const user: CollabUser = {
  id: "alice@example.com",
  name: "Alice",
  color: "#2563eb",
};

const emptySnapshot: CollabSnapshot = {
  annotations: [],
  measurements: [],
  dismissed: [],
  seq: 0,
};

const welcome = (clientId = "client-self", peers: any[] = []): ServerMessage => ({
  type: "welcome",
  clientId,
  roomId: "bp-1:img-1",
  snapshot: emptySnapshot,
  peers,
});

const peer = (clientId: string, name: string) => ({
  clientId,
  user: { id: `${name}@example.com`, name, color: "#db2777" },
  joinedAt: Date.now(),
});

beforeEach(() => {
  MockWebSocket.reset();
  (global as any).WebSocket = MockWebSocket;
  jest.spyOn(console, "error").mockImplementation(() => { });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("useCollaboration", () => {
  it("stays completely inert without a room or user", () => {
    const { result } = renderHook(() =>
      useCollaboration({ roomId: null, user: null }),
    );

    expect(MockWebSocket.instances).toHaveLength(0);
    expect(result.current.status).toBe("disabled");
    expect(result.current.isConnected).toBe(false);
  });

  it("does not connect when explicitly disabled", () => {
    renderHook(() =>
      useCollaboration({ roomId: "bp-1:img-1", user, enabled: false }),
    );

    expect(MockWebSocket.instances).toHaveLength(0);
  });

  it("sends a join for the room once the socket opens", async () => {
    renderHook(() => useCollaboration({ roomId: "bp-1:img-1", user }));

    expect(MockWebSocket.instances).toHaveLength(1);
    act(() => MockWebSocket.latest().open());

    const join = MockWebSocket.latest().parsedSent[0];
    expect(join.type).toBe("join");
    expect(join.roomId).toBe("bp-1:img-1");
    expect(join.user.name).toBe("Alice");
  });

  it("reports connected and hands the snapshot to the caller", async () => {
    const onSnapshot = jest.fn();
    const { result } = renderHook(() =>
      useCollaboration({ roomId: "bp-1:img-1", user, onSnapshot }),
    );

    act(() => MockWebSocket.latest().open());
    act(() => MockWebSocket.latest().emit(welcome()));

    await waitFor(() => expect(result.current.status).toBe("connected"));
    expect(result.current.isConnected).toBe(true);
    expect(result.current.selfClientId).toBe("client-self");
    expect(onSnapshot).toHaveBeenCalledWith(emptySnapshot);
  });

  it("delivers remote ops but filters out the echo of its own", async () => {
    const onRemoteOp = jest.fn();
    const { result } = renderHook(() =>
      useCollaboration({ roomId: "bp-1:img-1", user, onRemoteOp }),
    );

    act(() => MockWebSocket.latest().open());
    act(() => MockWebSocket.latest().emit(welcome()));
    await waitFor(() => expect(result.current.status).toBe("connected"));

    // Publish locally, then replay the server's echo of that same op.
    act(() =>
      result.current.publish({
        kind: "annotation.delete",
        id: "user-annotation-1",
      }),
    );

    const published = MockWebSocket.latest().parsedSent.find(
      (m) => m.type === "op",
    );
    expect(published).toBeDefined();

    const echo: StampedOp = {
      kind: "annotation.delete",
      id: "user-annotation-1",
      seq: 1,
      actor: "client-self",
      at: Date.now(),
      opId: published.opId,
    };
    act(() => MockWebSocket.latest().emit({ type: "op", op: echo }));

    expect(onRemoteOp).not.toHaveBeenCalled();

    // A genuinely remote op must come through.
    const remote: StampedOp = { ...echo, seq: 2, opId: "someone-elses-op" };
    act(() => MockWebSocket.latest().emit({ type: "op", op: remote }));

    expect(onRemoteOp).toHaveBeenCalledTimes(1);
    expect(onRemoteOp).toHaveBeenCalledWith(remote);
  });

  it("does not publish while disconnected", () => {
    const { result } = renderHook(() =>
      useCollaboration({ roomId: "bp-1:img-1", user }),
    );

    // Socket exists but has not opened yet.
    act(() =>
      result.current.publish({ kind: "detection.dismiss", id: "det-1" }),
    );

    expect(
      MockWebSocket.latest().parsedSent.filter((m) => m.type === "op"),
    ).toHaveLength(0);
  });

  it("tracks peers joining and leaving", async () => {
    const { result } = renderHook(() =>
      useCollaboration({ roomId: "bp-1:img-1", user }),
    );

    act(() => MockWebSocket.latest().open());
    act(() =>
      MockWebSocket.latest().emit(welcome("client-self", [peer("c-bob", "Bob")])),
    );
    await waitFor(() => expect(result.current.peers).toHaveLength(1));

    act(() =>
      MockWebSocket.latest().emit({
        type: "peer_join",
        peer: peer("c-carol", "Carol"),
      }),
    );
    await waitFor(() => expect(result.current.peers).toHaveLength(2));

    act(() =>
      MockWebSocket.latest().emit({ type: "peer_leave", clientId: "c-bob" }),
    );
    await waitFor(() => expect(result.current.peers).toHaveLength(1));
    expect(result.current.peers[0].user.name).toBe("Carol");
    expect(result.current.presence["c-bob"]).toBeUndefined();
  });

  it("records peer cursor positions in presence", async () => {
    const { result } = renderHook(() =>
      useCollaboration({ roomId: "bp-1:img-1", user }),
    );

    act(() => MockWebSocket.latest().open());
    act(() =>
      MockWebSocket.latest().emit(welcome("client-self", [peer("c-bob", "Bob")])),
    );
    await waitFor(() => expect(result.current.peers).toHaveLength(1));

    act(() =>
      MockWebSocket.latest().emit({
        type: "cursor",
        clientId: "c-bob",
        point: { x: 42, y: 99 },
        tool: "polygon",
      }),
    );

    await waitFor(() =>
      expect(result.current.presence["c-bob"].point).toEqual({ x: 42, y: 99 }),
    );
    expect(result.current.presence["c-bob"].tool).toBe("polygon");
  });

  it("throttles cursors but never drops the 'cursor left' signal", async () => {
    const { result } = renderHook(() =>
      useCollaboration({ roomId: "bp-1:img-1", user }),
    );

    act(() => MockWebSocket.latest().open());
    act(() => MockWebSocket.latest().emit(welcome()));
    await waitFor(() => expect(result.current.status).toBe("connected"));

    act(() => {
      for (let i = 0; i < 20; i += 1) {
        result.current.publishCursor({ x: i, y: i });
      }
    });

    const cursorMsgs = MockWebSocket.latest().parsedSent.filter(
      (m) => m.type === "cursor",
    );
    expect(cursorMsgs.length).toBeLessThan(20);

    act(() => result.current.publishCursor(null));
    const last = MockWebSocket.latest().parsedSent.at(-1);
    expect(last.type).toBe("cursor");
    expect(last.point).toBeNull();
  });

  it("reconnects after an unexpected close", async () => {
    jest.useFakeTimers();
    try {
      const { result } = renderHook(() =>
        useCollaboration({ roomId: "bp-1:img-1", user }),
      );

      act(() => MockWebSocket.latest().open());
      act(() => MockWebSocket.latest().emit(welcome()));
      await waitFor(() => expect(result.current.status).toBe("connected"));

      expect(MockWebSocket.instances).toHaveLength(1);

      act(() => MockWebSocket.latest().close());
      expect(result.current.status).toBe("reconnecting");

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(MockWebSocket.instances.length).toBeGreaterThan(1);
    } finally {
      jest.useRealTimers();
    }
  });

  it("closes the socket and stops reconnecting on unmount", async () => {
    jest.useFakeTimers();
    try {
      const { result, unmount } = renderHook(() =>
        useCollaboration({ roomId: "bp-1:img-1", user }),
      );

      act(() => MockWebSocket.latest().open());
      act(() => MockWebSocket.latest().emit(welcome()));
      await waitFor(() => expect(result.current.status).toBe("connected"));

      const socket = MockWebSocket.latest();
      unmount();

      expect(socket.readyState).toBe(MockWebSocket.CLOSED);

      const countAtUnmount = MockWebSocket.instances.length;
      act(() => {
        jest.advanceTimersByTime(30000);
      });
      expect(MockWebSocket.instances).toHaveLength(countAtUnmount);
    } finally {
      jest.useRealTimers();
    }
  });

  it("gives a user the same presence colour every time", () => {
    expect(colorForUserId("alice@example.com")).toBe(
      colorForUserId("alice@example.com"),
    );
    expect(colorForUserId("alice@example.com")).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("survives a malformed frame without tearing down", async () => {
    const onRemoteOp = jest.fn();
    const { result } = renderHook(() =>
      useCollaboration({ roomId: "bp-1:img-1", user, onRemoteOp }),
    );

    act(() => MockWebSocket.latest().open());
    act(() => MockWebSocket.latest().emit(welcome()));
    await waitFor(() => expect(result.current.status).toBe("connected"));

    act(() => MockWebSocket.latest().onmessage?.({ data: "{not json" }));

    expect(result.current.status).toBe("connected");
    expect(onRemoteOp).not.toHaveBeenCalled();
  });
});

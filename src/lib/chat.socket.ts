class ChatSocket {
  private ws: WebSocket | null = null;
  private listeners = new Map<string, Set<Function>>();

  private token: string | null = null;

  /* =========================
     CONNECT
  ========================== */
  connect(token: string) {
    this.token = token;

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.ws = new WebSocket(
      `${import.meta.env.VITE_WS_URL}?token=${token}`
    );

    this.ws.onopen = () => {
      console.log("✅ Chat socket connected");
    };

    this.ws.onclose = () => {
      console.warn("⚠️ Chat socket disconnected");
    };

    this.ws.onerror = (err) => {
      console.error("❌ Chat socket error", err);
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (!data?.type) return;

        this.emit(data.type, data.payload ?? data);
      } catch (err) {
        console.error("Invalid WS message", err);
      }
    };
  }

  /* =========================
     SEND MESSAGE
  ========================== */
  send(type: string, payload: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    this.ws.send(
      JSON.stringify({
        type,
        payload,
      })
    );
  }

  /* =========================
     SUBSCRIBE
  ========================== */
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(callback);
  }

  /* =========================
     UNSUBSCRIBE (IMPORTANT FIX)
  ========================== */
  off(event: string, callback: Function) {
    const handlers = this.listeners.get(event);
    if (!handlers) return;

    handlers.delete(callback);

    if (handlers.size === 0) {
      this.listeners.delete(event);
    }
  }

  /* =========================
     EMIT EVENTS
  ========================== */
  private emit(event: string, data: any) {
    const handlers = this.listeners.get(event);
    if (!handlers) return;

    handlers.forEach((cb) => {
      try {
        cb(data);
      } catch (err) {
        console.error("WS handler error:", err);
      }
    });
  }

  /* =========================
     DISCONNECT CLEANLY
  ========================== */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.listeners.clear();
  }

  /* =========================
     RECONNECT (simple version)
  ========================== */
  reconnect() {
    if (this.token) {
      this.connect(this.token);
    }
  }
}

export const chatSocket = new ChatSocket();
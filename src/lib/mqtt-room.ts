import {
  parseRoomPayload,
  serializeRoomPayload,
  type RoomPayload,
} from "./sync-core";

const BROKERS = [
  "wss://broker.hivemq.com:8884/mqtt",
  "wss://broker.emqx.io:8084/mqtt",
];

const TOPIC_PREFIX = "dongpal/v1/";

export function liveTopic(syncId: string) {
  return `${TOPIC_PREFIX}${syncId}`;
}

export function newClientId() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return `dp-${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}

type MqttMod = typeof import("mqtt");
type MqttClient = import("mqtt").MqttClient;

let mqttPromise: Promise<MqttMod> | null = null;

function loadMqtt() {
  mqttPromise ??= import("mqtt") as Promise<MqttMod>;
  return mqttPromise;
}

function envelope(payload: RoomPayload, src: string) {
  return JSON.stringify({
    pack: payload.pack,
    tombstones: payload.tombstones,
    src,
    t: Date.now(),
  });
}

function decodeEnvelope(raw: string): (RoomPayload & { src?: string }) | null {
  const parsed = parseRoomPayload(raw);
  if (!parsed) return null;
  let src: string | undefined;
  try {
    const obj = JSON.parse(raw) as { src?: unknown };
    if (typeof obj.src === "string") src = obj.src;
  } catch {
    /* ignore */
  }
  return { ...parsed, src };
}

async function connectBroker(
  clientId: string,
  reconnectPeriod = 2500,
): Promise<MqttClient> {
  const mqttNs = (await loadMqtt()) as unknown as {
    connect: MqttMod["connect"];
    default?: { connect: MqttMod["connect"] };
  };
  const connect = mqttNs.default?.connect ?? mqttNs.connect;
  if (typeof connect !== "function") {
    throw new Error("mqtt_connect_missing");
  }
  let lastErr: unknown;
  for (const url of BROKERS) {
    try {
      const client = await new Promise<MqttClient>((resolve, reject) => {
        const c = connect(url, {
          clientId,
          connectTimeout: 8000,
          reconnectPeriod,
          clean: true,
          keepalive: 30,
          protocolVersion: 4,
        });
        const timer = setTimeout(() => {
          onErr(new Error("mqtt_timeout"));
        }, 9000);
        const onErr = (err: Error) => {
          clearTimeout(timer);
          c.removeAllListeners();
          try {
            c.end(true);
          } catch {
            /* ignore */
          }
          reject(err);
        };
        c.once("connect", () => {
          clearTimeout(timer);
          c.off("error", onErr);
          resolve(c);
        });
        c.once("error", onErr);
      });
      return client;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("mqtt_connect_failed");
}

export async function fetchLivePack(
  syncId: string,
  timeoutMs = 5000,
): Promise<RoomPayload | null> {
  if (typeof window === "undefined") return null;
  let client: MqttClient | null = null;
  try {
    client = await connectBroker(`dp-join-${newClientId()}`, 0);
    const topic = liveTopic(syncId);
    const payload = await new Promise<RoomPayload | null>((resolve) => {
      const timer = setTimeout(() => resolve(null), timeoutMs);
      client!.subscribe(topic, { qos: 1 }, (err) => {
        if (err) {
          clearTimeout(timer);
          resolve(null);
        }
      });
      client!.on("message", (_t, buf) => {
        const parsed = decodeEnvelope(buf.toString());
        if (!parsed) return;
        clearTimeout(timer);
        resolve(parsed);
      });
    });
    return payload;
  } catch {
    return null;
  } finally {
    try {
      client?.end(true);
    } catch {
      /* ignore */
    }
  }
}

export type LiveSession = {
  src: string;
  ready: Promise<void>;
  publish: (payload: RoomPayload) => Promise<void>;
  close: () => void;
};

export function openLiveSession(
  syncId: string,
  onRemote: (payload: RoomPayload) => void,
): LiveSession {
  const src = newClientId();
  let closed = false;
  let client: MqttClient | null = null;
  const topic = liveTopic(syncId);

  const ready = (async () => {
    if (typeof window === "undefined") return;
    client = await connectBroker(src);
    if (closed) {
      client.end(true);
      return;
    }
    client.on("message", (_t, buf) => {
      const parsed = decodeEnvelope(buf.toString());
      if (!parsed) return;
      if (parsed.src === src) return;
      onRemote(parsed);
    });
    await new Promise<void>((resolve, reject) => {
      client!.subscribe(topic, { qos: 1 }, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  })();

  return {
    src,
    ready,
    publish: async (payload) => {
      await ready;
      if (closed || !client) throw new Error("mqtt_closed");
      const body = envelope(payload, src);
      await new Promise<void>((resolve, reject) => {
        client!.publish(topic, body, { qos: 1, retain: true }, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    },
    close: () => {
      closed = true;
      try {
        client?.end(true);
      } catch {
        /* ignore */
      }
      client = null;
    },
  };
}

export { serializeRoomPayload };

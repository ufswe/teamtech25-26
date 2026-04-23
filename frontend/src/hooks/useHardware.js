// frontend/src/hooks/useHardware.js
//
// Drop this into any component to respond to physical hardware events.
// The slide switch gates everything — events only fire when system is ON.
//
// Usage:
//   useHardware({
//     onEnter:         () => submitAnswer(),
//     onClear:         () => clearSelection(),
//     onEncoderRotate: (e) => setTopic(e.topic),   // e.topic = "topic_1/2/3"
//     onEncoderPress:  (e) => confirmTopic(e.topic),
//     onSlideSwitch:   (e) => setSystemOn(e.value === "on"),
//   });

import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL || "http://localhost:5001";

export function useHardware({
  onEnter,
  onClear,
  onEncoderRotate,
  onEncoderPress,
  onSlideSwitch,
} = {}) {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () =>
      console.log("[Hardware] Socket connected ✓")
    );
    socket.on("disconnect", () =>
      console.log("[Hardware] Socket disconnected")
    );

    socket.on("hardware_event", (event) => {
      console.log("[Hardware]", event);
      switch (event.type) {
        case "button_enter":    onEnter?.(event);          break;
        case "button_clear":    onClear?.(event);          break;
        case "encoder_rotate":  onEncoderRotate?.(event);  break;
        case "encoder_press":   onEncoderPress?.(event);   break;
        case "slide_switch":    onSlideSwitch?.(event);    break;
        default: break;
      }
    });

    return () => socket.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return socketRef;
}

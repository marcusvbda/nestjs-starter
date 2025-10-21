import { io } from "socket.io-client";

const socket = io("http://localhost:3000/events");

socket.on("connect", () => {
    console.log("✅ Conectado:", socket.id);
});

socket.on("disconnect", () => {
    console.log("❌ Desconectado do servidor");
});

socket.on("event", (data) => {
    console.log("📩 Recebeu evento do servidor:", data);
    if (data.event == "hello") {
        console.log("👋 Oi para você também!");
    }
});
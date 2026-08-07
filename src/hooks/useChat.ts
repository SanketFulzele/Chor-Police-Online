import { useCallback, useEffect } from "react";
import { useSocketStore } from "../store/socketStore";
import { useRoomStore } from "../store/roomStore";
import { useChatStore } from "../store/chatStore";
import { SocketEvents } from "../../shared/socket/events";
import type { ChatMessage } from "../types";
import { sanitizeChatText } from "../utils/chat";

export function useChat() {
  const socket = useSocketStore((s) => s.socket);
  const room = useRoomStore((s) => s.room);

  useEffect(() => {
    if (!socket) return;

    const handleReceive = ({ message }: { message: ChatMessage }) => {
      useChatStore.getState().receiveMessage(message);
    };
    const handleHistory = ({ messages }: { messages: ChatMessage[] }) => {
      useChatStore.getState().setHistory(messages);
    };
    const handleClear = () => {
      useChatStore.getState().clearMessages();
    };
    const handleTyping = ({
      playerId,
      playerName,
      isTyping,
    }: {
      playerId: string;
      playerName: string;
      isTyping: boolean;
    }) => {
      useChatStore.getState().setTyping(playerId, playerName, Boolean(isTyping));
    };

    socket.on(SocketEvents.CHAT_RECEIVE, handleReceive);
    socket.on(SocketEvents.CHAT_HISTORY, handleHistory);
    socket.on(SocketEvents.CHAT_CLEAR, handleClear);
    socket.on(SocketEvents.CHAT_TYPING, handleTyping);

    return () => {
      socket.off(SocketEvents.CHAT_RECEIVE, handleReceive);
      socket.off(SocketEvents.CHAT_HISTORY, handleHistory);
      socket.off(SocketEvents.CHAT_CLEAR, handleClear);
      socket.off(SocketEvents.CHAT_TYPING, handleTyping);
    };
  }, [socket]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      useChatStore.getState().pruneTyping(Date.now());
    }, 500);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (room?.phase === "finished") {
      useChatStore.getState().clearMessages();
    }
  }, [room?.phase]);

  useEffect(() => {
    if (!room) {
      useChatStore.getState().reset();
    }
  }, [room]);

  const sendMessage = useCallback(
    (text: string) => {
      const clean = sanitizeChatText(text);
      if (!clean) return;
      socket?.emit(SocketEvents.CHAT_SEND, { text: clean });
    },
    [socket]
  );

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      socket?.emit(SocketEvents.CHAT_TYPING, { isTyping });
    },
    [socket]
  );

  const toggleCollapsed = useCallback(() => {
    useChatStore.getState().toggleCollapsed();
  }, []);

  const messages = useChatStore((s) => s.messages);
  const typingUsers = useChatStore((s) => s.typingUsers);
  const unread = useChatStore((s) => s.unread);
  const isCollapsed = useChatStore((s) => s.isCollapsed);

  return {
    messages,
    typingUsers,
    unread,
    isCollapsed,
    toggleCollapsed,
    sendMessage,
    sendTyping,
  };
}

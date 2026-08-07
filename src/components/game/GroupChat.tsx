import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { RoyalPanel } from "../ui/RoyalPanel";
import { useChat } from "../../hooks/useChat";
import { useRoomStore } from "../../store/roomStore";
import { MAX_PLAYERS } from "../../constants/game";
import { CHAT_MAX_LENGTH, sanitizeChatText } from "../../utils/chat";
import type { ChatMessage } from "../../types";

interface GroupChatProps {
  className?: string;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function ChevronIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function SendIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

function LockIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function MessageRow({ message, isOwn }: { message: ChatMessage; isOwn: boolean }) {
  if (message.isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex justify-center"
      >
        <p className="inline-flex items-center gap-2 rounded-full border border-gold/15 bg-gold/[0.05] px-3 py-1 text-center text-[11px] font-medium text-gold/80">
          {message.text}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : ""}`}
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ring-1 ring-white/10"
        style={{ backgroundColor: message.avatarColor }}
      >
        {message.playerName.charAt(0).toUpperCase()}
      </span>

      <div className={`flex max-w-[78%] flex-col ${isOwn ? "items-end" : "items-start"}`}>
        <div className={`mb-1 flex items-baseline gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
          <span className="text-[11px] font-bold text-text-primary">{message.playerName}</span>
          <span className="text-[10px] font-medium text-text-muted">{formatTime(message.timestamp)}</span>
        </div>
        <div
          className={`whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm leading-relaxed transition-all duration-300 ${
            isOwn
              ? "rounded-br-md border border-royal/40 bg-gradient-to-br from-royal/80 to-purple-950/90 text-white hover:shadow-[0_0_20px_rgba(167,139,250,0.25)]"
              : "rounded-bl-md border border-white/[0.08] bg-white/[0.04] text-text-primary hover:border-gold/25 hover:bg-white/[0.06] hover:shadow-[0_0_18px_rgba(255,215,0,0.1)]"
          }`}
        >
          {message.text}
        </div>
      </div>
    </motion.div>
  );
}

function TypingIndicator({ names }: { names: string[] }) {
  if (names.length === 0) return null;
  const label =
    names.length === 1 ? `${names[0]} is typing` : `${names.length} players are typing`;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-2 px-1 text-[11px] font-medium text-text-muted"
    >
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY, delay: i * 0.2 }}
            className="h-1 w-1 rounded-full bg-gold/70"
          />
        ))}
      </span>
      <span>{label}...</span>
    </motion.div>
  );
}

export function GroupChat({ className = "" }: GroupChatProps) {
  const room = useRoomStore((s) => s.room);
  const playerId = useRoomStore((s) => s.playerId);
  const {
    messages,
    typingUsers,
    unread,
    isCollapsed,
    toggleCollapsed,
    sendMessage,
    sendTyping,
  } = useChat();

  const [draft, setDraft] = useState("");
  const [canSend, setCanSend] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showJump, setShowJump] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastTypingRef = useRef(0);

  const gameFinished = room?.phase === "finished";
  const connectedCount = room?.players.filter((p) => p.isConnected).length ?? 0;
  const typingList = Object.values(typingUsers);

  useEffect(() => {
    const el = scrollRef.current;
    if (el && autoScroll) el.scrollTop = el.scrollHeight;
  }, [messages, typingList.length, autoScroll, isCollapsed]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    setAutoScroll(nearBottom);
    setShowJump(!nearBottom);
  };

  const jumpToBottom = () => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    setAutoScroll(true);
    setShowJump(false);
  };

  const emitTyping = (value: boolean) => {
    const now = Date.now();
    if (value && now - lastTypingRef.current < 800) return;
    lastTypingRef.current = now;
    sendTyping(value);
  };

  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  };

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(event.target.value);
    resizeTextarea();
    emitTyping(event.target.value.trim().length > 0);
  };

  const handleSubmit = () => {
    if (gameFinished || !canSend) return;
    const clean = sanitizeChatText(draft);
    if (!clean) return;

    sendMessage(clean);
    setDraft("");
    setCanSend(false);
    window.setTimeout(() => setCanSend(true), 700);
    emitTyping(false);

    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      requestAnimationFrame(() => el.focus());
    }
  };

  const remaining = CHAT_MAX_LENGTH - draft.length;
  const showCounter = remaining <= 30;
  const canSubmit = draft.trim().length > 0 && canSend && !gameFinished;

  return (
    <RoyalPanel className={`flex flex-col overflow-hidden ${className}`}>
      {/* Header */}
      <button
        type="button"
        onClick={toggleCollapsed}
        aria-expanded={!isCollapsed}
        className="group flex w-full cursor-pointer items-center justify-between gap-3 border-b border-gold/15 bg-gradient-to-r from-gold/[0.08] via-transparent to-royal/[0.08] px-4 py-3 text-left transition-colors duration-300 hover:from-gold/[0.14] hover:to-royal/[0.14]"
      >
        <span className="flex items-center gap-2.5">
          <span className="text-base leading-none">💬</span>
          <span className="text-sm font-black tracking-[0.25em] gold-gradient">GROUP CHAT</span>
        </span>

        <span className="flex items-center gap-2.5">
          <span className="hidden items-center gap-1.5 text-[11px] font-medium text-text-muted sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
            Players Online: {connectedCount} / {MAX_PLAYERS}
          </span>
          <AnimatePresence>
            {unread > 0 && (
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5 text-[11px] font-bold text-black shadow-[0_0_12px_rgba(255,215,0,0.5)]"
              >
                {unread > 99 ? "99+" : unread}
              </motion.span>
            )}
          </AnimatePresence>
          <motion.span
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.25 }}
            className="text-gold/70"
          >
            <ChevronIcon />
          </motion.span>
        </span>
      </button>

      {!isCollapsed && (
        <div className="flex min-h-0 flex-col">
          {/* Messages */}
          <div className="relative">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex h-[clamp(220px,38dvh,360px)] flex-col gap-3 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4"
            >
              {messages.length === 0 && !gameFinished && (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                  <span className="text-2xl">👋</span>
                  <p className="text-sm text-text-muted">No messages yet. Say hi!</p>
                </div>
              )}

              {messages.length === 0 && gameFinished && (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                  <span className="text-2xl">🏁</span>
                  <p className="text-sm text-text-muted">Game Finished. Chat closed.</p>
                </div>
              )}

              {messages.map((message) => (
                <MessageRow
                  key={message.id}
                  message={message}
                  isOwn={!message.isSystem && message.playerId === playerId}
                />
              ))}

              <TypingIndicator names={typingList.map((u) => u.playerName)} />
            </div>

            <AnimatePresence>
              {showJump && (
                <motion.button
                  type="button"
                  onClick={jumpToBottom}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2 cursor-pointer rounded-full border border-gold/40 bg-surface-light/95 px-3 py-1.5 text-[11px] font-bold text-gold shadow-[0_0_20px_rgba(255,215,0,0.25)] transition-all duration-300 hover:bg-gold hover:text-black"
                >
                  ↓ New Messages
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Input */}
          {gameFinished ? (
            <div className="flex items-center justify-center gap-2 border-t border-white/[0.06] bg-white/[0.02] px-4 py-3 text-xs font-semibold text-text-muted">
              <LockIcon className="h-3.5 w-3.5" />
              Game Finished. Chat closed.
            </div>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleSubmit();
              }}
              className="flex items-end gap-2 border-t border-white/[0.06] bg-surface/60 px-3 py-2.5"
            >
              <div className="relative flex-1">
                <textarea
                  ref={textareaRef}
                  value={draft}
                  onChange={handleChange}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleSubmit();
                    }
                  }}
                  onBlur={() => emitTyping(false)}
                  maxLength={CHAT_MAX_LENGTH}
                  rows={1}
                  placeholder="Type a message..."
                  aria-label="Chat message"
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-3 pr-10 text-sm text-text-primary placeholder:text-text-muted transition-all duration-300 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/40"
                />
                {showCounter && (
                  <span className="pointer-events-none absolute bottom-2 right-3 text-[10px] font-semibold text-gold/70">
                    {remaining}
                  </span>
                )}
              </div>
              <motion.button
                type="submit"
                disabled={!canSubmit}
                whileHover={canSubmit ? { scale: 1.05 } : {}}
                whileTap={canSubmit ? { scale: 0.95 } : {}}
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-gradient-to-b from-gold-light via-gold to-gold-dark text-black shadow-[0_8px_30px_rgba(255,215,0,0.35)] transition-all duration-300 hover:shadow-[0_10px_40px_rgba(255,215,0,0.55)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                <SendIcon />
              </motion.button>
            </form>
          )}
        </div>
      )}
    </RoyalPanel>
  );
}

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useSocketStore } from "../store/socketStore";
import { useRoomStore } from "../store/roomStore";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { CrownIcon } from "../components/ui/CrownIcon";
import { RoyalPanel } from "../components/ui/RoyalPanel";
import { PremiumBackground } from "../components/layout/PremiumBackground";
import { useState } from "react";
import { SocketEvents } from "../../shared/socket/events";
import { saveSession } from "../utils/session";

interface CreateRoomForm {
  name: string;
}

export function CreateRoom() {
  const navigate = useNavigate();
  const socket = useSocketStore((s) => s.socket);
  const status = useSocketStore((s) => s.status);
  const setRoom = useRoomStore((s) => s.setRoom);
  const setPlayerId = useRoomStore((s) => s.setPlayerId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CreateRoomForm>({ mode: "onChange" });

  const onSubmit = (data: CreateRoomForm) => {
    if (!socket) {
      setError("Not connected to server. Please wait...");
      return;
    }

    setLoading(true);
    setError("");

    socket.emit(SocketEvents.CREATE_ROOM, { playerName: data.name });

    socket.once(SocketEvents.ROOM_CREATED, ({ roomCode, playerId, room }) => {
      setPlayerId(playerId);
      setRoom(room);
      saveSession({ roomCode, playerId, playerName: data.name, isHost: true });
      setLoading(false);
      navigate(`/room?code=${roomCode}`);
    });

    socket.once(SocketEvents.ERROR_MESSAGE, ({ message }) => {
      setError(message);
      setLoading(false);
    });
  };

  return (
    <div className="relative flex-1 flex items-center justify-center px-4 py-12 overflow-hidden">
      <PremiumBackground />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        <RoyalPanel className="p-8 sm:p-10">
          <div className="flex flex-col items-center text-center">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-b from-gold/20 to-transparent border border-gold/30 shadow-[0_0_40px_rgba(255,215,0,0.25)] mb-6"
            >
              <CrownIcon className="w-7 h-7 text-gold" />
            </motion.div>

              <h1 className="text-3xl font-black font-serif tracking-[0.18em] gold-gradient text-glow leading-none">
                CREATE ROOM
              </h1>

              <div className="flex items-center justify-center gap-3 mt-5 mb-8">
                <span className="h-px w-14 bg-gradient-to-r from-transparent to-gold/60" />
                <span className="w-1.5 h-1.5 rotate-45 bg-gold shadow-[0_0_8px_rgba(255,215,0,0.8)]" />
                <span className="h-px w-14 bg-gradient-to-l from-transparent to-gold/60" />
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Your Name"
                placeholder="Enter your name"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                  </svg>
                }
                {...register("name", {
                  required: "Name is required",
                  minLength: { value: 2, message: "At least 2 characters" },
                  maxLength: { value: 16, message: "Max 16 characters" },
                })}
                error={errors.name?.message}
              />
              {error && (
                <p className="text-sm text-rose text-center">{error}</p>
              )}
              {status === "disconnected" && (
                <p className="text-sm text-amber text-center">
                  Connecting to server...
                </p>
              )}
              <Button
                type="submit"
                size="lg"
                fullWidth
                variant="gold-gradient"
                disabled={!isValid || loading || status !== "connected"}
                className="tracking-wide"
              >
                {loading ? "Creating..." : "Create Room"}
              </Button>
            </form>

            <div className="mt-8 flex justify-center">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/")}
                className="group inline-flex items-center gap-2 text-gold/80 hover:text-gold text-sm font-medium tracking-wide transition-colors duration-200 cursor-pointer"
              >
                <svg
                  className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back
              </motion.button>
            </div>
        </RoyalPanel>
      </motion.div>
    </div>
  );
}

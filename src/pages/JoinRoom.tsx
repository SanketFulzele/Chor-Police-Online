import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useSocketStore } from "../store/socketStore";
import { useRoomStore } from "../store/roomStore";
import { Button } from "../components/ui/Button";
import { RoyalPanel } from "../components/ui/RoyalPanel";
import { Input } from "../components/ui/Input";
import { SocketEvents } from "../../shared/socket/events";
import { saveSession } from "../utils/session";

interface JoinRoomForm {
  name: string;
  code: string;
}

export function JoinRoom() {
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
  } = useForm<JoinRoomForm>({ mode: "onChange" });

  const onSubmit = (data: JoinRoomForm) => {
    if (!socket) {
      setError("Not connected to server. Please wait...");
      return;
    }

    setLoading(true);
    setError("");

    socket.emit(SocketEvents.JOIN_ROOM, {
      roomCode: data.code.toUpperCase(),
      playerName: data.name,
    });

    socket.once(SocketEvents.ROOM_JOINED, ({ room, playerId }) => {
      setPlayerId(playerId);
      setRoom(room);
      saveSession({ roomCode: room.code, playerId, playerName: data.name, isHost: false });
      setLoading(false);
      navigate(`/room?code=${room.code}`);
    });

    socket.once(SocketEvents.ERROR_MESSAGE, ({ message }) => {
      setError(message);
      setLoading(false);
    });
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <RoyalPanel className="p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-center mb-6 gold-gradient">
            Join Room
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Your Name"
              placeholder="Enter your name"
              {...register("name", {
                required: "Name is required",
                minLength: { value: 2, message: "At least 2 characters" },
                maxLength: { value: 16, message: "Max 16 characters" },
              })}
              error={errors.name?.message}
            />
            <Input
              label="Room Code"
              placeholder="Enter room code"
              maxLength={6}
              className="uppercase tracking-widest text-center text-lg font-bold"
              {...register("code", {
                required: "Room code is required",
                minLength: { value: 4, message: "Invalid code" },
                maxLength: { value: 6, message: "Invalid code" },
              })}
              error={errors.code?.message}
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
              variant="gold-gradient"
              size="lg"
              fullWidth
              disabled={!isValid || loading || status !== "connected"}
            >
              {loading ? "Joining..." : "Join"}
            </Button>
          </form>
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            className="mt-4"
            onClick={() => navigate("/")}
          >
            Back
          </Button>
        </RoyalPanel>
      </motion.div>
    </div>
  );
}

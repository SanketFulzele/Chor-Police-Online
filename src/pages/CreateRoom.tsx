import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useSocketStore } from "../store/socketStore";
import { useRoomStore } from "../store/roomStore";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
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
    <div className="flex-1 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <Card>
          <h2 className="text-2xl font-bold text-center mb-6 gold-gradient">
            Create Room
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              variant="gold"
              size="lg"
              fullWidth
              disabled={!isValid || loading || status !== "connected"}
            >
              {loading ? "Creating..." : "Create"}
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
        </Card>
      </motion.div>
    </div>
  );
}

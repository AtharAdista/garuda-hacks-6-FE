import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useSocket } from "@/hooks/useSocket";
import { v4 as uuidv4 } from "uuid";
import People1 from "../../public/People_1.svg";
import People2 from "../../public/People_2.svg";
import House1 from "../../public/House_1.svg";
import House2 from "../../public/House_2.svg";
import Clouds1 from "../../public/Clouds_1.svg";
import Logo3 from "../../public/Logo_3_pink.svg";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/features/user/api";
import { useAuth } from "@/features/auth/useAuth";

export default function HomePage() {
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const [roomCode, setRoomCode] = useState("");
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    async function fetchUser() {
      try {
        await getCurrentUser();
      } catch (err: any) {
        console.error(err);
      }
    }

    fetchUser();
  }, []);

  const handleVersusAi = async () => {
    const roomId = crypto.randomUUID();
    navigate(`/room/${roomId}`);
  };

  const handleCreateRoom = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    if (!socket || !isConnected) return;

    const roomId = uuidv4().slice(0, 6);
    const userId = localStorage.getItem("id");

    const onRoomCreated = ({
      roomId,
      userId,
      health,
    }: {
      roomId: string;
      userId: string;
      health: any;
    }) => {
      socket.off("roomCreated", onRoomCreated);
      socket.off("error", onError);
      navigate("/room", {
        state: { roomId, playerId: userId, health },
      });
    };

    const onError = (err: { message: any }) => {
      console.log(err);
      alert(err.message);
      socket.off("roomCreated", onRoomCreated);
      socket.off("error", onError);
    };

    socket.emit("createRoom", { roomId, userId });
    socket.on("roomCreated", onRoomCreated);
    socket.on("error", onError);
  };

  const handleJoinRoom = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    if (!roomCode || !socket || !isConnected) return;

    const userId = localStorage.getItem("id");

    const onJoinedRoom = ({
      roomId,
      userId,
      health,
    }: {
      roomId: string;
      userId: string;
      health: any;
    }) => {
      console.log("Joined Room:", roomId, userId, health);
      socket.off("joinedRoom", onJoinedRoom);
      socket.off("error", onError);
      navigate("/room", {
        state: { roomId, playerId: userId, health },
      });
    };

    const onError = (err: { message: any }) => {
      console.log(err);
      alert(err.message);
      socket.off("joinedRoom", onJoinedRoom);
      socket.off("error", onError);
    };

    socket.emit("joinRoom", { roomId: roomCode, userId });

    socket.on("joinedRoom", onJoinedRoom);

    socket.on("error", onError);
  };

  return (
    <div className="w-full min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-white via-rose-200 to-rose-500 my-[-2rem]">
        {/* Background Elements */}
        <div className="absolute inset-0 w-full h-full">
          {/* Clouds Background */}
          <div className="absolute top-20 left-60 z-10">
            <div className="w-72 h-20 rounded-full flex items-center justify-center">
              <img src={Clouds1} alt="" />
            </div>
          </div>
          <div className="absolute top-66 right-40 z-10">
            <div className="w-82 h-20 rounded-full flex items-center justify-center">
              <img src={Clouds1} alt="" />
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-30 flex flex-col items-center text-center px-4 mb-12 mt-60 rounded-xl">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-800 leading-none mb-4 drop-shadow-2xl">
            Bridge The Gap
          </h1>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow">
            one culture at a time
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-rose-400  mb-8 max-w-2xl drop-shadow font-bold">
            Learn Indonesian Culture while having Fun
          </p>

            {/* Create & Join Room Side by Side */}
            <div className="flex flex-row items-center justify-center gap-6 w-full max-w-xl mb-4">
            <button
              onClick={handleVersusAi}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-rose-400 via-rose-500 to-pink-500 hover:from-rose-500 hover:via-rose-600 hover:to-pink-600 text-white font-bold rounded-xl text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              Versus AI
            </button>

            {/* Create Room */}
            <button
              onClick={handleCreateRoom}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-rose-400 via-rose-500 to-pink-500 hover:from-rose-500 hover:via-rose-600 hover:to-pink-600 text-white font-bold rounded-xl text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              Create Room
            </button>
            </div>
            
            {/* Join Room Form Below */}
            <form
            onSubmit={(e) => {
              e.preventDefault();
              handleJoinRoom();
            }}
            className="flex items-center bg-white rounded-xl shadow-md px-2 py-1 gap-2 border border-gray-200 w-full max-w-xl mx-auto"
            >
            <input
              type="text"
              placeholder="Enter Room Code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg text-lg focus:outline-none"
              maxLength={8}
              autoComplete="off"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-rose-400 hover:bg-rose-500 text-white font-bold rounded-lg text-lg shadow transition-all duration-200"
            >
              Join
            </button>
            </form>
        </div>

        {/* Illustration Area */}
        <div className="relative z-20 w-full max-w-6xl mx-auto px-4">
          <div className="relative flex items-center justify-center min-h-[400px]">
            {/* Left House */}
            <div className="absolute left-[-30rem] bottom-70 z-10">
              <div className="w-160 h-40 rounded-lg flex flex-col items-center justify-center">
                <img src={House1} alt="" />
              </div>
            </div>

            {/* Right House */}
            <div className="absolute right-[-30rem] bottom-70 z-10">
              <div className="w-160 h-40 rounded-lg flex flex-col items-center justify-center">
                <img src={House2} alt="" />
              </div>
            </div>

            {/* Center Characters */}
            <div className="flex items-end justify-center space-x-[-4rem] z-20 relative bottom-[6rem]">
              <div className="md:w-80 w-50 h-50 rounded-lg flex flex-col items-center justify-center">
                <img src={People1} alt="" />
              </div>
              <div className="md:w-90 w-50 h-40 rounded-lg flex flex-col items-center justify-center">
                <img src={People2} alt="" />
              </div>
            </div>
          </div>
        </div>

        {/* Curved White Transition */}
        <div className="absolute bottom-0 left-0 right-0 z-40">
          <svg
            viewBox="0 0 1440 120"
            className="w-full h-24 md:h-32"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0 Q720,240 1440,0 L1440,120 L0,120 Z"
              fill="white"
              className="drop-shadow-lg"
            />
          </svg>
        </div>
      </section>

      {/* Section: Play with Different People */}
      <section className="relative w-full py-20 bg-white z-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            Play with Different People in Real Time
          </h3>
          <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Connect with players worldwide and learn new things every day
          </p>

          {/* Logo Section */}
          <div className="mt-40 mb-40">
            <div className="mx-auto mb-4 flex items-center justify-center">
              <img src={Logo3} alt="Logo" className="w-120" />
            </div>
          </div>
        </div>
      </section>

      {/* Section: Features */}
      <section className="relative w-full py-20 bg-gradient-to-b from-white via-gray-50 to-white z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
              Test Your Knowledge about Indonesian Culture
            </h3>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Where do you stand compared to other players?
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: Live Leaderboard */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-center group border border-gray-100">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-3">
                Connecting Cultures
              </h4>
              <p className="text-gray-600 leading-relaxed">
                Engage with players from around the world and see how you rank
              </p>
            </div>

            {/* Feature 2: Fun Gameplay */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-center group border border-gray-100">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-3">
                Fun Gameplay
              </h4>
              <p className="text-gray-600 leading-relaxed">
                Learning should not be{" "}
                <span className="font-semibold text-gray-800">boring</span>, so
                we made it fun and engaging!
              </p>
            </div>

            {/* Feature 3: Learn Cultures */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-center group border border-gray-100">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-3">
                Learn Cultures
              </h4>
              <p className="text-gray-600 leading-relaxed">
                With our{" "}
                <span className="font-semibold text-gray-800">
                  AI Assistant
                </span>
                . , we help you learn more and make the experience{" "}
                <span className="font-semibold text-gray-800">enjoyable</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative w-full py-20 bg-gradient-to-r from-rose-400 via-rose-500 to-pink-500 z-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Cultural Journey?
          </h3>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Be one of the players learning about Indonesian culture through
            Culturate
          </p>
          <Link
            to="/game"
            className="inline-block px-8 py-4 bg-white text-rose-500 hover:text-rose-600 font-bold rounded-full text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            Start Playing Now
          </Link>
        </div>
      </section>
    </div>
  );
}

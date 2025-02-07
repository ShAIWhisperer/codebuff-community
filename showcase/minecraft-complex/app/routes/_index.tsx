import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold mb-4">Minecraft Clone</h1>
      <div className="text-center mb-4">
        <p>A simple Minecraft-like game where you can:</p>
        <ul className="list-disc text-left mt-2 mb-4">
          <li>Move around with WASD</li>
          <li>Look around with the mouse</li>
          <li>Mine blocks with left click</li>
        </ul>
      </div>
      <Link
        to="/minecraft"
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-lg font-medium"
      >
        Start Playing
      </Link>
    </div>
  );
}

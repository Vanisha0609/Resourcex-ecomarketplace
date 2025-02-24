import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="p-6 text-center">
      <h1 className="text-4xl font-bold">Welcome to Regen Marketplace</h1>
      <Link to="/marketplace">
        <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Go to Marketplace</button>
      </Link>
    </div>
  );
}

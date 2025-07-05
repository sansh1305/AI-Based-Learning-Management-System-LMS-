import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Sign() {
  const navigate = useNavigate(); // ✅ Hook at the top

  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  console.log(user);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const roles = ["admin", "teacher", "student"];

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);

        if (data.user.role === "student") {
          navigate("/stud", { state: { user: data.user } });
        } else if (data.user.role === "teacher") {
          navigate("/teacher", { state: { user: data.user } });
        } else if (data.user.role === "admin") {
          navigate("/admin", { state: { user: data.user } });
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Network error. Try again.");
    }
  };

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setError(null);
  };

  if (!role) {
    // Role selection screen
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-6">
        <h1 className="text-3xl font-bold">Select your role</h1>
        {roles.map((r) => (
          <button
            key={r}
            className="px-8 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={() => {
              setRole(r);
              resetForm();
            }}
          >
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>
    );
  }

  // Sign-in screen for selected role
  return (
    <div className="flex flex-col items-center justify-center h-screen max-w-md mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Sign In as {role}</h2>
      <form className="w-full flex flex-col gap-4" onSubmit={handleLogin}>
        <input type="text" placeholder="Username" className="border p-2 rounded" value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
        <input type="password" placeholder="Password" className="border p-2 rounded" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
          Sign In
        </button>
      </form>
      {error && <p className="mt-4 text-red-600">{error}</p>}
      <button
        className="mt-6 text-blue-600 underline"
        onClick={() => {
          setRole(null);
          resetForm();
        }}
      >
        Back to Role Selection
      </button>
    </div>
  );
}

export default Sign;

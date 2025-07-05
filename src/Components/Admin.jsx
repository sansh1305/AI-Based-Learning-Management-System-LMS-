import { useState } from "react";

const Admin = () => {
  const [form, setForm] = useState({
    role: "student",
    name: "",
    username: "",
    password: "",
    regNum: "",
    teacherID: "",
    coursesTeaching: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      coursesTeaching: form.role === "teacher" ? form.coursesTeaching.split(",").map((c) => c.trim()) : undefined,
    };

    try {
      const res = await fetch("http://localhost:5000/admin/addUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      console.error("Error adding user:", err);
      alert("Failed to add user");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Add User (Admin Panel)</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select name="role" value={form.role} onChange={handleChange} className="border p-2 w-full">
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>

        <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} className="border p-2 w-full" required />

        <input type="text" name="username" placeholder="Username" value={form.username} onChange={handleChange} className="border p-2 w-full" required />

        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} className="border p-2 w-full" required />

        {form.role === "student" && <input type="text" name="regNum" placeholder="Registration Number" value={form.regNum} onChange={handleChange} className="border p-2 w-full" required />}

        {form.role === "teacher" && (
          <>
            <input type="text" name="teacherID" placeholder="Teacher ID" value={form.teacherID} onChange={handleChange} className="border p-2 w-full" required />

            <input type="text" name="coursesTeaching" placeholder="Courses Teaching (comma separated)" value={form.coursesTeaching} onChange={handleChange} className="border p-2 w-full" required />
          </>
        )}

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add User
        </button>
      </form>
    </div>
  );
};

export default Admin;

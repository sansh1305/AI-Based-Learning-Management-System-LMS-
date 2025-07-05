import { useEffect, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";

function TeacherCourseFile() {
  const { courseId } = useParams();
  const location = useLocation();
  const { user } = location.state || {};

  const [course, setCourse] = useState(null);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (user?.role === "teacher") {
      fetch(`http://localhost:5000/teacher/${user._id}/courses`)
        .then((res) => res.json())
        .then((data) => {
          const match = data.find((c) => c.courseId === courseId);
          setCourse(match);
        })
        .catch((err) => console.error("Failed to fetch courses", err));
    }
  }, [user, courseId]);

  // Fetch uploaded files
  useEffect(() => {
    if (courseId) {
      fetch(`http://localhost:5000/files/${courseId}`)
        .then((res) => res.json())
        .then((data) => setFiles(data))
        .catch((err) => console.error("Failed to fetch files", err));
    }
  }, [courseId]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`http://localhost:5000/upload/${courseId}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        alert(`File uploaded: ${data.file.filename}`);
        setFiles((prev) => [...prev, data.file]); // update UI
      } else {
        alert("Upload failed: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading file");
    }
  };

  const handleDelete = async (filename) => {
    const confirmDelete = window.confirm(`Delete ${filename}?`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:5000/delete/${courseId}/${filename}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        alert("File deleted");
        setFiles((prev) => prev.filter((f) => f.name !== filename));
      } else {
        alert("Delete failed: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting file");
    }
  };

  if (!user || user.role !== "teacher") {
    return <p className="text-red-600 text-center mt-10">Unauthorized. You are not a teacher.</p>;
  }

  if (!course) {
    return <p className="text-center mt-10">Loading course info...</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-2">{course.name}</h2>
      <p className="mb-2">{course.description}</p>
      <p className="mb-4">Course ID: {course.courseId}</p>

      {/* Upload file */}
      <input type="file" onChange={handleFileUpload} className="mb-4" />

      <h3 className="text-lg font-semibold mt-6 mb-2">Uploaded Files</h3>
      {files.length > 0 ? (
        <div className="space-y-2">
          {files.map((file, idx) => (
            <div key={idx} className="flex justify-between items-center border p-2 rounded">
              <a href={`http://localhost:5000/${file.url}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                {file.name}
              </a>
              <button onClick={() => handleDelete(file.name)} className="text-red-600 hover:underline">
                Delete
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No files uploaded yet.</p>
      )}
      <Link to="/teacher" state={{ user }}>
        <button className="bg-blue-600 text-white px-4 m-10 py-2 rounded hover:bg-blue-700">Go Back</button>
      </Link>
    </div>
  );
}

export default TeacherCourseFile;

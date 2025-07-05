import { useLocation, useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";

const CourseFiles = () => {
  const { courseId } = useParams();
  const [files, setFiles] = useState([]);
  const location = useLocation();
  const { user } = location.state || {};

  useEffect(() => {
    fetch(`http://localhost:5000/files/${courseId}`)
      .then((res) => res.json())
      .then((data) => setFiles(data))
      .catch((err) => console.error("Error loading files:", err));
  }, [courseId]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Files for Course: {courseId}</h2>

      {files.length > 0 ? (
        <ul className="space-y-2">
          {files.map((file, index) => (
            <li key={index} className="border p-2 rounded bg-gray-50 flex justify-between items-center">
              <a href={`http://localhost:5000/${file.url}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                {file.name}
              </a>
              <a href={`http://localhost:5000/${file.url}`} download className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 ml-4">
                Download
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No files uploaded yet.</p>
      )}

      <Link to="/stud" state={{ user }}>
        <button className="bg-blue-600 text-white px-4 m-10 py-2 rounded hover:bg-blue-700">Go Back</button>
      </Link>
    </div>
  );
};

export default CourseFiles;

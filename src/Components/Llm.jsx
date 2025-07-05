import { useState } from "react";
import { useLocation, Link } from "react-router-dom";

function Llm() {
  const [files, setFiles] = useState([]);
  const [questions, setQuestions] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const location = useLocation();
  const { user } = location.state || {};

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        alert(`File uploaded: ${data.file.name}`);
        setFiles((prev) => [...prev, data.file]);
        setUploadedFileName(data.file.filename);
        setQuestions(null); // Clear previous results
      } else {
        alert("Upload failed: " + data.error);
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      alert("Error uploading file");
    }
  };

  const handleGenerateQuestions = async () => {
    if (!uploadedFileName) return alert("No file uploaded yet.");

    setProcessing(true);
    try {
      const res = await fetch(`http://localhost:5000/process-pdf?filename=${uploadedFileName}`);
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      console.error("Error generating questions:", err);
      alert("Error generating questions");
    }
    setProcessing(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl mb-4 font-semibold">Upload a PDF File to ML Folder</h1>

      <input type="file" accept=".pdf" onChange={handleFileUpload} className="mb-4" />

      {files.length > 0 && (
        <div className="mt-4">
          <h2 className="text-lg">Uploaded Files:</h2>
          <ul className="list-disc pl-5">
            {files.map((file, idx) => (
              <li key={idx}>
                <a href={`http://localhost:5000${file.url}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  {file.name}
                </a>
              </li>
            ))}
          </ul>

          <button onClick={handleGenerateQuestions} className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" disabled={processing}>
            {processing ? "Generating..." : "Generate Questions"}
          </button>
        </div>
      )}

      {questions && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Generated Questions:</h2>
          {Object.entries(questions).map(([key, qns]) => (
            <div key={key} className="mb-4">
              <h3 className="font-bold">{key}</h3>
              <pre className="bg-gray-100 p-3 rounded">{qns}</pre>
            </div>
          ))}
        </div>
      )}

      <Link to="/teacher" state={{ user }}>
        <button className="bg-blue-600 text-white px-4 m-10 py-2 rounded hover:bg-blue-700">Go Back</button>
      </Link>
    </div>
  );
}

export default Llm;

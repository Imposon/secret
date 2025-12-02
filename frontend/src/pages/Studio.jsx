import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import SQLEditor from "../components/SQLEditor";
import { useState } from "react";

export default function Studio() {
  const [query, setQuery] = useState("");

  return (
    <>
      <Navbar />

      <div className="studio-container">
        <Sidebar />

        <div className="editor-panel">
          <h2>Editor</h2>
          <SQLEditor value={query} onChange={setQuery} />
        </div>

        <div className="result-panel">
          <h2>Results</h2>
          <p>Run a query to view results...</p>
        </div>
      </div>
    </>
  );
}

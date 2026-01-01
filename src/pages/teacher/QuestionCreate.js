// src/pages/teacher/QuestionCreate.jsx
import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSave,
  FaTimes,
  FaSpinner,
  FaPlusCircle,
} from "react-icons/fa";
import axios from "axios";

const MAX_OPTIONS = 5;
const MIN_REQUIRED_OPTIONS = 2;

const quillModules = {
  toolbar: {
    container: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image", "code-block", "formula"],
      ["clean"],
    ],
    handlers: {},
  },
};

function emptyOption() {
  return { content: "", is_correct: false };
}

export default function QuestionCreate() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ topic: "", course: "" });

  // For demo: replace with real API fetches
  const [topics, setTopics] = useState([
    { id: 1, title: "Algebra" },
    { id: 2, title: "Geometry" },
    { id: 3, title: "Trigonometry" },
  ]);
  const [courses, setCourses] = useState([
    { id: 1, title: "Mathematics" },
    { id: 2, title: "Physics" },
  ]);

  // newQuestion state
  const [qstate, setQstate] = useState({
    id: null,
    topic_id: "",
    course_id: "",
    content: "",
    language: "en",
    points: 1,
    options: [emptyOption(), emptyOption(), emptyOption()],
  });

  // Load existing questions (mocked)
  useEffect(() => {
    // Replace with real fetch: /api/questions or /api/teacher/questions
    setLoading(true);
    (async () => {
      try {
        // const res = await axios.get('/api/questions'); setQuestions(res.data);
        await new Promise((r) => setTimeout(r, 600)); // mock delay
        setQuestions([]); // start empty for demo
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Helpers
  const nonEmptyOptionsCount = (opts = qstate.options) =>
    opts.filter((o) => o.content && o.content.trim() !== "").length;

  const canRemoveOption = (index) => {
    // disable remove if removing would drop below MIN_REQUIRED_OPTIONS non-empty options
    const opts = qstate.options.slice();
    // if option at index is empty, removing it only reduces allowed slots, but rule uses non-empty count
    // simulate removal
    opts.splice(index, 1);
    return nonEmptyOptionsCount(opts) >= MIN_REQUIRED_OPTIONS;
  };

  function handleAddOption() {
    if (qstate.options.length >= MAX_OPTIONS) return;
    setQstate((s) => ({ ...s, options: [...s.options, emptyOption()] }));
  }

  function handleRemoveOption(i) {
    // only allow if resulting non-empty options >= MIN_REQUIRED_OPTIONS AND options length > 2 (to keep UI sane)
    const opts = qstate.options.slice();
    if (opts.length <= 2) return; // keep at least 2 option fields visually
    opts.splice(i, 1);
    // check non-empty count
    if (nonEmptyOptionsCount(opts) < MIN_REQUIRED_OPTIONS) {
      alert(`At least ${MIN_REQUIRED_OPTIONS} options must be provided.`);
      return;
    }
    setQstate((s) => ({ ...s, options: opts }));
  }

  function handleOptionChange(i, patch) {
    const opts = qstate.options.slice();
    opts[i] = { ...opts[i], ...patch };
    setQstate((s) => ({ ...s, options: opts }));
  }

  function resetForm() {
    setQstate({
      id: null,
      topic_id: "",
      course_id: "",
      content: "",
      language: "en",
      points: 1,
      options: [emptyOption(), emptyOption(), emptyOption()],
    });
    setEditing(null);
  }

  async function handleSave() {
    // validate
    if (!qstate.content || qstate.content.trim() === "") {
      alert("Please add question content.");
      return;
    }
    const nonEmpty = nonEmptyOptionsCount(qstate.options);
    if (nonEmpty < MIN_REQUIRED_OPTIONS) {
      alert(`Please provide at least ${MIN_REQUIRED_OPTIONS} options.`);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        topic_id: qstate.topic_id || null,
        course_id: qstate.course_id || null,
        content: qstate.content,
        language: qstate.language,
        points: qstate.points,
        options: qstate.options
          .filter((o) => o.content && o.content.trim() !== "")
          .map((o, idx) => ({ content: o.content, is_correct: !!o.is_correct, position: idx + 1 })),
      };

      if (editing) {
        // PUT to server
        // await axios.put(`/api/questions/${qstate.id}`, payload);
        setQuestions((prev) => prev.map((p) => (p.id === qstate.id ? { ...payload, id: qstate.id } : p)));
      } else {
        // POST to server
        // const res = await axios.post('/api/questions', payload);
        // use res.data
        const fakeId = Date.now();
        setQuestions((prev) => [{ ...payload, id: fakeId }, ...prev]);
      }

      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save question.");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(q) {
    // prepare state for editing: ensure at least 3 option slots visible
    const opts = (q.options || []).map((o) => ({ content: o.content || "", is_correct: !!o.is_correct }));
    while (opts.length < 3) opts.push(emptyOption());
    setQstate({
      id: q.id,
      topic_id: q.topic_id || "",
      course_id: q.course_id || "",
      content: q.content || "",
      language: q.language || "en",
      points: q.points || 1,
      options: opts,
    });
    setEditing(q);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this question?")) return;
    setLoading(true);
    try {
      // await axios.delete(`/api/questions/${id}`);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    } finally {
      setLoading(false);
    }
  }

  // Filters + search on client for the demo
  const filtered = questions.filter((q) => {
    const matchesSearch =
      !search ||
      (q.content && q.content.toLowerCase().includes(search.toLowerCase())) ||
      (q.options && q.options.some((o) => o.content && o.content.toLowerCase().includes(search.toLowerCase())));
    const matchesTopic = !filters.topic || (q.topic_id && q.topic_id.toString() === filters.topic);
    const matchesCourse = !filters.course || (q.course_id && q.course_id.toString() === filters.course);
    return matchesSearch && matchesTopic && matchesCourse;
  });

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/70">
            <FaSpinner className="animate-spin text-4xl text-indigo-600" />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">Question Management</h2>
              <p className="text-sm text-gray-500 mt-1">Create, edit and manage topic-wise questions</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Search questions or option text..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="px-3 py-2 border rounded-lg w-72 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <select
                  value={filters.topic}
                  onChange={(e) => setFilters((s) => ({ ...s, topic: e.target.value }))}
                  className="px-3 py-2 border rounded-lg"
                >
                  <option value="">All Topics</option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.course}
                  onChange={(e) => setFilters((s) => ({ ...s, course: e.target.value }))}
                  className="px-3 py-2 border rounded-lg"
                >
                  <option value="">All Courses</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <button
                id="add-question-btn"
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow"
              >
                <FaPlusCircle /> Add Question
              </button>
              <Tooltip anchorSelect="#add-question-btn" place="top">Create a new question</Tooltip>
            </div>
          </div>

          {/* FORM */}
          {showForm && (
            <div className="mb-6 bg-indigo-50 border border-indigo-100 rounded-xl p-5 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <select
                  value={qstate.course_id}
                  onChange={(e) => setQstate((s) => ({ ...s, course_id: e.target.value }))}
                  className="col-span-1 px-3 py-2 border rounded-lg"
                >
                  <option value="">Select Course (optional)</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>

                <select
                  value={qstate.topic_id}
                  onChange={(e) => setQstate((s) => ({ ...s, topic_id: e.target.value }))}
                  className="col-span-1 px-3 py-2 border rounded-lg"
                >
                  <option value="">Select Topic (optional)</option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>

                <input
                  type="number"
                  min={1}
                  value={qstate.points}
                  onChange={(e) => setQstate((s) => ({ ...s, points: Number(e.target.value || 1) }))}
                  className="col-span-1 px-3 py-2 border rounded-lg"
                  placeholder="Points"
                />
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-2">Question Content</label>
              <div className="mb-2 border rounded-lg overflow-hidden">
                <ReactQuill
                  theme="snow"
                  value={qstate.content}
                  onChange={(v) => setQstate((s) => ({ ...s, content: v }))}
                  modules={quillModules}
                  placeholder="Type the question, add images, formatting, or use the formula tool..."
                  style={{
                    minHeight: 200,
                    fontSize: "16px",
                    lineHeight: "1.6",
                    backgroundColor: "var(--lightgrey)", // light gray background
                    padding: "10px",
                    borderRadius: "8px",
                    border: "0px", // light border
                  }}
                />
                <Tooltip anchorSelect=".ql-bold" content="Bold" place="top" />
                <Tooltip anchorSelect=".ql-italic" content="Italic" place="top" />
                <Tooltip anchorSelect=".ql-underline" content="Underline" place="top" />
                <Tooltip anchorSelect=".ql-strike" content="Strike" place="top" />
                <Tooltip anchorSelect=".ql-link" content="Insert link" place="top" />
                <Tooltip anchorSelect=".ql-image" content="Insert image" place="top" />
                <Tooltip anchorSelect=".ql-code-block" content="Code block" place="top" />
                <Tooltip anchorSelect=".ql-formula" content="Insert formula" place="top" />
                <Tooltip anchorSelect=".ql-clean" content="Remove formatting" place="top" />
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Tip: use the <code>formula</code> button for math or embed LaTeX like{" "}
                <code>{'$$x = \\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}$$'}</code>. Preview below.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Options (min 2, max 5)</label>
                <div className="space-y-3">
                  {qstate.options.map((opt, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={opt.content}
                          onChange={(e) => handleOptionChange(i, { content: e.target.value })}
                          placeholder={`Option ${i + 1}`}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                        <div className="text-xs text-gray-400 mt-1">You can include formatting and inline math here.</div>
                      </div>

                      <div className="flex flex-col items-center gap-2">
                        <label className="flex items-center gap-2 text-sm select-none">
                          <input
                            type="checkbox"
                            checked={opt.is_correct}
                            onChange={(e) => handleOptionChange(i, { is_correct: e.target.checked })}
                            className="h-4 w-4"
                          />
                          <span className="text-sm text-gray-600">Correct</span>
                        </label>

                        <button
                          className={`p-2 rounded-md transition ${canRemoveOption(i) && qstate.options.length > 2 ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                          onClick={() => canRemoveOption(i) && qstate.options.length > 2 && handleRemoveOption(i)}
                          disabled={!canRemoveOption(i) || qstate.options.length <= 2}
                          title={qstate.options.length <= 2 ? "At least 2 options required" : "Remove option"}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <button
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-md ${qstate.options.length >= MAX_OPTIONS ? 'bg-gray-200 text-gray-400' : 'bg-green-600 text-white hover:bg-green-700'}`}
                    onClick={handleAddOption}
                    disabled={qstate.options.length >= MAX_OPTIONS}
                    id="add-option-btn"
                  >
                    <FaPlus /> Add option
                  </button>
                  <Tooltip anchorSelect="#add-option-btn" place="top">Add another option (max 5)</Tooltip>

                  <div className="text-sm text-gray-500 ml-auto">
                    {nonEmptyOptionsCount(qstate.options)} options filled • {qstate.options.length} shown
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  id="save-question"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  onClick={handleSave}
                >
                  <FaSave /> {editing ? "Update Question" : "Save Question"}
                </button>
                <Tooltip anchorSelect="#save-question" place="top">Save question to database</Tooltip>
              </div>
            </div>
          )}

          {/* List */}
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Added Questions</h3>

            {filtered.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                No questions found. Click <strong>Add Question</strong> to get started.
              </div>
            ) : (
              <div className="grid gap-4">
                {filtered.map((q) => (
                  <div key={q.id} className="bg-white border rounded-lg p-4 shadow-sm">
                    <div className="prose max-w-none mb-3" dangerouslySetInnerHTML={{ __html: q.content }} />
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {q.topic_id ? `Topic: ${q.topic_id}` : "No topic"} • {q.course_id ? `Course: ${q.course_id}` : "No course"}
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1 rounded-md bg-yellow-500 text-white hover:bg-yellow-600 flex items-center gap-2" onClick={() => handleEdit(q)}>
                          <FaEdit /> Edit
                        </button>
                        <button className="px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 flex items-center gap-2" onClick={() => handleDelete(q.id)}>
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
export default function AddQuestions() {
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
  return (
    <div className="mb-6 bg-indigo-50 border border-indigo-100 rounded-xl p-5 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <select
          value={qstate.course_id}
          onChange={(e) =>
            setQstate((s) => ({ ...s, course_id: e.target.value }))
          }
          className="col-span-1 px-3 py-2 border rounded-lg"
        >
          <option value="">Select Course (optional)</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>

        <select
          value={qstate.topic_id}
          onChange={(e) =>
            setQstate((s) => ({ ...s, topic_id: e.target.value }))
          }
          className="col-span-1 px-3 py-2 border rounded-lg"
        >
          <option value="">Select Topic (optional)</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>

        <input
          type="number"
          min={1}
          value={qstate.points}
          onChange={(e) =>
            setQstate((s) => ({ ...s, points: Number(e.target.value || 1) }))
          }
          className="col-span-1 px-3 py-2 border rounded-lg"
          placeholder="Points"
        />
      </div>

      <label className="block text-sm font-medium text-gray-700 mb-2">
        Question Content
      </label>
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
            backgroundColor: "#f9fafb", // light gray background
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
        <Tooltip
          anchorSelect=".ql-code-block"
          content="Code block"
          place="top"
        />
        <Tooltip
          anchorSelect=".ql-formula"
          content="Insert formula"
          place="top"
        />
        <Tooltip
          anchorSelect=".ql-clean"
          content="Remove formatting"
          place="top"
        />
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Tip: use the <code>formula</code> button for math or embed LaTeX like{" "}
        <code>{"$$x = \\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}$$"}</code>. Preview
        below.
      </p>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Options (min 2, max 5)
        </label>
        <div className="space-y-3">
          {qstate.options.map((opt, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="flex-1">
                <input
                  type="text"
                  value={opt.content}
                  onChange={(e) =>
                    handleOptionChange(i, { content: e.target.value })
                  }
                  placeholder={`Option ${i + 1}`}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <div className="text-xs text-gray-400 mt-1">
                  You can include formatting and inline math here.
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <label className="flex items-center gap-2 text-sm select-none">
                  <input
                    type="checkbox"
                    checked={opt.is_correct}
                    onChange={(e) =>
                      handleOptionChange(i, { is_correct: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-gray-600">Correct</span>
                </label>

                <button
                  className={`p-2 rounded-md transition ${
                    canRemoveOption(i) && qstate.options.length > 2
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                  onClick={() =>
                    canRemoveOption(i) &&
                    qstate.options.length > 2 &&
                    handleRemoveOption(i)
                  }
                  disabled={!canRemoveOption(i) || qstate.options.length <= 2}
                  title={
                    qstate.options.length <= 2
                      ? "At least 2 options required"
                      : "Remove option"
                  }
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-3">
          <button
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-md ${
              qstate.options.length >= MAX_OPTIONS
                ? "bg-gray-200 text-gray-400"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
            onClick={handleAddOption}
            disabled={qstate.options.length >= MAX_OPTIONS}
            id="add-option-btn"
          >
            <FaPlus /> Add option
          </button>
          <Tooltip anchorSelect="#add-option-btn" place="top">
            Add another option (max 5)
          </Tooltip>

          <div className="text-sm text-gray-500 ml-auto">
            {nonEmptyOptionsCount(qstate.options)} options filled •{" "}
            {qstate.options.length} shown
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
        <Tooltip anchorSelect="#save-question" place="top">
          Save question to database
        </Tooltip>
      </div>
    </div>
  );
}

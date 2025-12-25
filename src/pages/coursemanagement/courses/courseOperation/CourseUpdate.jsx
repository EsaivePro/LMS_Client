import React, { useEffect } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import SlideDialog from "../../../../components/common/dialog/SlideDialog";
import { useDispatch } from "react-redux";
import { updateCourse } from "../../../../redux/slices/coursesSlice";
import useCommon from "../../../../hooks/useCommon";
import { errorValidation } from "../../../../utils/resolver.utils";

export default function CourseUpdate({ openDialog, setOpenDialog, selectedCourse }) {
  const dispatch = useDispatch();
  const { showLoader, hideLoader, showError, showSuccess } = useCommon();
  const [open, setOpen] = React.useState(false);
  const [courseForm, setCourseForm] = React.useState({
    title: "",
    description: ""
  });
  const [titleError, setTitleError] = React.useState("");
  const [descriptionError, setDescriptionError] = React.useState("");


  useEffect(() => {
    setOpen(openDialog);
  }, [openDialog]);

  useEffect(() => {
    if (selectedCourse) {
      setCourseForm({
        title: selectedCourse.title,
        description: selectedCourse.description,
      });
    }
  }, [selectedCourse]);

  const handleUpdateCourse = () => {
    if (!courseForm.title.trim()) {
      setTitleError("Course title is required");
      return;
    } else if (!courseForm.description.trim()) {
      setDescriptionError("Course description is required");
      return;
    }
    setTitleError("");
    setDescriptionError("");
    (async () => {
      showLoader();
      try {
        const res = await dispatch(updateCourse({ id: selectedCourse.id, data: courseForm })).unwrap();
        hideLoader();
        if (!errorValidation(res)) {
          setOpenDialog(false);
          showSuccess("Course updated successfully");
        } else {
          showError("Failed to update course");
        }
      } catch (err) {
        hideLoader();
        showError(err?.message || "Something went wrong");
      }
    })();
  };

  return (
    <Box>
      <SlideDialog
        open={open}
        onClose={() => {
          setOpenDialog(false);
          setTitleError("");
          setDescriptionError("");
        }}
        title="Update Course"
        onSubmit={handleUpdateCourse}
        submitLabel="Update"
        cancelLabel="Cancel"
      >
        <Box mt={1}>
          <Box mb={2}>
            <TextField
              fullWidth
              disabled
              label="Course ID"
              variant="standard"
              value={selectedCourse?.id || ""}
            />
          </Box>

          <Box mb={2}>
            <TextField
              fullWidth
              required
              label="Course Title"
              variant="standard"
              value={courseForm.title}
              error={Boolean(titleError)}
              helperText={titleError}
              onChange={(e) => {
                setCourseForm({ ...courseForm, title: e.target.value });
                setTitleError("");
              }}
            />
          </Box>

          <Box mb={2}>
            <TextField
              fullWidth
              required
              rows={3}
              label="Short Description"
              variant="standard"
              value={courseForm.description}
              error={Boolean(descriptionError)}
              helperText={descriptionError}
              onChange={(e) => {
                setCourseForm({ ...courseForm, description: e.target.value });
                setDescriptionError("");
              }}
            />
          </Box>
        </Box>
      </SlideDialog>
    </Box>
  );
}

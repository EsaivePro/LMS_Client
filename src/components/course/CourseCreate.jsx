import React, { useEffect } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import SlideDialog from "../../components/common/dialog/SlideDialog";
import { useDispatch } from "react-redux";
import { addCourse } from "../../redux/slices/coursesSlice";
import useCommon from "../../hooks/useCommon";
import { errorValidation } from "../../utils/resolver.utils";
import { presignAndUploadFile } from "../../services/awscloud/S3Services";
import { Button } from "@mui/material";

export default function CourseCreate({ openDialog, setOpenDialog }) {
  const dispatch = useDispatch();

  const [open, setOpen] = React.useState(false);
  const [courseForm, setCourseForm] = React.useState({
    title: "",
    description: ""
  });
  const [selectedImageFile, setSelectedImageFile] = React.useState(null);
  const [selectedImageName, setSelectedImageName] = React.useState("");
  const [titleError, setTitleError] = React.useState("");
  const [descriptionError, setDescriptionError] = React.useState("");


  useEffect(() => {
    setOpen(openDialog);
  }, [openDialog]);

  const { showLoader, hideLoader, showError, showSuccess } = useCommon();

  const handleCreateCourse = () => {
    if (!courseForm.title.trim()) {
      setTitleError("Course title is required");
      return;
    }
    else if (!courseForm.description.trim()) {
      setDescriptionError("Course description is required");
      return;
    }
    setTitleError("");
    setDescriptionError("");
    const payload = { ...courseForm, created_by: 4 };
    (async () => {
      showLoader();
      try {
        // if image selected, upload first and attach URL
        if (selectedImageFile) {
          try {
            const { cdnUrl } = await presignAndUploadFile({ file: selectedImageFile, key: `images/courses/${Date.now()}-${selectedImageFile.name}` });
            payload.imageurl = cdnUrl;
          } catch (e) {
            hideLoader();
            showError("Image upload failed");
            return;
          }
        }
        const res = await dispatch(addCourse(payload)).unwrap();
        hideLoader();
        if (!errorValidation(res)) {
          setOpen(false);
          setOpenDialog(false);
          setCourseForm({ title: "", description: "" });
          showSuccess("Course created successfully");
        } else {
          showError("Failed to create course");
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
          setCourseForm({ title: "", description: "" });
          setTitleError("");
          setDescriptionError("");
        }}
        title="Create Course"
        onSubmit={handleCreateCourse}
        submitLabel="Create"
        cancelLabel="Cancel"
      >
        <Box mt={1}>
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
                setTitleError(""); // remove error while typing
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
                setDescriptionError(""); // remove error while typing
              }}
            />
          </Box>

          <Box>
            <input
              type="file"
              accept="image/*"
              id="course-image-file"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                setSelectedImageFile(f || null);
                setSelectedImageName(f ? f.name : "");
              }}
            />
            <label htmlFor="course-image-file">
              <Button variant="outlined" component="span">{selectedImageName || "Choose Image"}</Button>
            </label>
          </Box>
        </Box>
      </SlideDialog>
    </Box>
  );
}

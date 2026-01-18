import React, { useEffect } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import SlideDialog from "../../components/common/dialog/SlideDialog";
import { useDispatch } from "react-redux";
import { updateCourse } from "../../redux/slices/coursesSlice";
import useCommon from "../../hooks/useCommon";
import { errorValidation } from "../../utils/resolver.utils";
import { presignAndUploadFile, deleteFromS3 } from "../../services/awscloud/S3Services";

export default function CourseUpdate({ openDialog, setOpenDialog, selectedCourse }) {
  const dispatch = useDispatch();
  const { showLoader, hideLoader, showError, showSuccess } = useCommon();
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

  useEffect(() => {
    if (selectedCourse) {
      setCourseForm({
        title: selectedCourse.title,
        description: selectedCourse.description,
      });
      setSelectedImageName(selectedCourse.imageurl ? selectedCourse.imageurl.split('/').pop() : "");
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
        const dataToSend = { ...courseForm };
        const oldImageUrl = selectedCourse?.imageurl;
        let newlyUploadedUrl = null;

        if (selectedImageFile) {
          try {
            const { cdnUrl } = await presignAndUploadFile({ file: selectedImageFile, key: `images/courses/${Date.now()}-${selectedImageFile.name}` });
            dataToSend.imageurl = cdnUrl;
            newlyUploadedUrl = cdnUrl;
          } catch (e) {
            hideLoader();
            showError("Image upload failed");
            return;
          }
        }

        const res = await dispatch(updateCourse({ id: selectedCourse.id, data: dataToSend })).unwrap();
        hideLoader();
        if (!errorValidation(res)) {
          setOpenDialog(false);
          showSuccess("Course updated successfully");
          // If update succeeded and there was a previous image, delete it from S3
          if (selectedImageFile && oldImageUrl && oldImageUrl !== newlyUploadedUrl) {
            try {
              await deleteFromS3(oldImageUrl);
            } catch (e) {
              console.warn("Failed to delete old image from S3", e);
            }
          }
        } else {
          showError("Failed to update course");
          // rollback: if update failed but we uploaded a new image, delete the newly uploaded file
          if (newlyUploadedUrl) {
            try {
              await deleteFromS3(newlyUploadedUrl);
            } catch (e) {
              console.warn("Failed to rollback new image after update failure", e);
            }
          }
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
          setSelectedImageFile(null);
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
          <Box>
            <input
              type="file"
              accept="image/*"
              id="course-image-file-update"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                setSelectedImageFile(f || null);
                setSelectedImageName(f ? f.name : "");
              }}
            />
            <label htmlFor="course-image-file-update">
              <Button variant="outlined" component="span">{selectedImageName || "Choose Image"}</Button>
            </label>
          </Box>
        </Box>
      </SlideDialog>
    </Box>
  );
}

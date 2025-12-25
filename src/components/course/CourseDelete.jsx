import React, { useEffect } from "react";
import Box from "@mui/material/Box";
import ShowPopup from "../../components/common/dialog/ShowPopup";
import { useDispatch } from "react-redux";
import { deleteCourse } from "../../redux/slices/coursesSlice";
import useCommon from "../../hooks/useCommon";
import { errorValidation } from "../../utils/resolver.utils";

export default function CourseDelete({ openDialog, setOpenDialog, deleteCourseId }) {
  const dispatch = useDispatch();
  const { showLoader, hideLoader, showError, showSuccess } = useCommon();
  const [open, setOpen] = React.useState(false);
  const [courseId, setCourseId] = React.useState(0);

  useEffect(() => {
    setOpen(openDialog);
  }, [openDialog]);

  useEffect(() => {
    if (deleteCourseId) {
      setCourseId(deleteCourseId)
    }
  }, [deleteCourseId]);

  const handleDeleteCourse = () => {
    (async () => {
      showLoader();
      try {
        const res = await dispatch(deleteCourse(courseId)).unwrap();
        hideLoader();
        if (!errorValidation(res)) {
          setOpenDialog(false);
          showSuccess("Course deleted successfully");
        } else {
          showError("Failed to delete course");
        }
      } catch (err) {
        hideLoader();
        showError(err?.message || "Something went wrong");
      }
    })();
  };

  return (
    <Box>
      <ShowPopup
        open={open}
        onClose={() => setOpenDialog(false)}
        title="Delete Course"
        onSubmit={handleDeleteCourse}
        submitLabel="Delete"
        cancelLabel="Cancel"
      >
        <Box mt={1}>
          <Box mb={2}>
            Are you sure want to delete this course id {courseId}?
          </Box>
        </Box>
      </ShowPopup>
    </Box>
  );
}

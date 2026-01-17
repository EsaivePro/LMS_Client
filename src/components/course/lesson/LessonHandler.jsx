import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import SlideDialog from "../../../components/common/dialog/SlideDialog";
import ShowPopup from "../../../components/common/dialog/ShowPopup";
import { useDispatch } from "react-redux";
import { addLesson, updateLesson, deleteLesson } from "../../../redux/slices/lessonsSlice";
import { useAuth } from "../../../hooks/useAuth";
import { useParams } from "react-router-dom";
import {
    LinearProgress,
    Button,
    Typography,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Backdrop, Stack
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { presignAndUploadFile, deleteFromS3 } from "../../../services/awscloud/S3Services";
import { errorValidation, secondsToTime } from "../../../utils/resolver.utils";
import useCommon from "../../../hooks/useCommon";
import { CONSTANTS } from "../../../constants";

const MAX_VIDEO_SIZE = 1024 * 1024 * 1024; // 1GB
const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50MB

const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
};

export default function LessonHandler({
    action,
    openDialog,
    setOpenDialog,
    selectedTopicId,
    selectedLessonId,
    curriculum,
    setCurriculum
}) {
    const dispatch = useDispatch();
    const { user } = useAuth();
    const userId = user?.id;
    const { id: courseId } = useParams();
    const { showLoader, hideLoader, showError, showSuccess } = useCommon();

    const [titleError, setTitleError] = useState("");
    const [descriptionError, setDescriptionError] = useState("");
    const [fileError, setFileError] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);

    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedFileSize, setSelectedFileSize] = useState("");

    const [lessonForm, setLessonForm] = useState({
        id: "",
        title: "",
        description: "",
        duration: 0,
        type: "Video",
        video_url: ""
    });

    // ---------------- RESET ----------------
    const resetForm = () => {
        setLessonForm({
            id: "",
            title: "",
            description: "",
            duration: 0,
            type: "Video",
            video_url: ""
        });
        setSelectedFile(null);
        setSelectedFileSize("");
        setFileError("");
        setUploadProgress(0);
        setTitleError("");
        setDescriptionError("");
    };

    // ----------- LOAD FOR UPDATE -----------
    useEffect(() => {
        if (!openDialog) return;

        if (action === "Update") {
            const topic = curriculum.find((t) => t.id == selectedTopicId);
            const lesson = topic?.lessons.find((l) => l.id == selectedLessonId);

            if (lesson) {
                setLessonForm({
                    id: lesson.id,
                    title: lesson.title,
                    description: lesson.description,
                    duration: lesson.duration || 0,
                    type: lesson.type,
                    video_url: lesson.video_url
                });
            }
        } else {
            resetForm();
        }
    }, [openDialog]);

    // -------------- VALIDATE --------------
    const validate = () => {
        if (!lessonForm.title.trim()) {
            setTitleError("Lesson title is required");
            return false;
        }
        if (!lessonForm.description.trim()) {
            setDescriptionError("Description is required");
            return false;
        }
        // if (action === "Create" && !selectedFile) {
        //     setFileError("Please select a file.");
        //     return false;
        // }
        if (action === "Update" && !lessonForm.video_url && !selectedFile) {
            setFileError("Please select a file.");
            return false;
        }
        return true;
    };

    // ---------------- HANDLE FILE ----------------
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        setSelectedFileSize(formatFileSize(file.size));
        setFileError("");

        // File size validation
        if (lessonForm.type === "PDF" && file.size > MAX_PDF_SIZE) {
            setFileError("PDF must be less than 50 MB.");
            setSelectedFile(null);
            setSelectedFileSize("");
            return;
        }
        if (lessonForm.type === "Video" && file.size > MAX_VIDEO_SIZE) {
            setFileError("Video must be less than 1 GB.");
            setSelectedFile(null);
            setSelectedFileSize("");
            return;
        }

        // Extract video duration BEFORE upload
        if (lessonForm.type === "Video") {
            const video = document.createElement("video");
            video.src = URL.createObjectURL(file);
            video.onloadedmetadata = () => {
                const secs = Math.floor(video.duration);
                setLessonForm((p) => ({ ...p, duration: secs }));
            };
        } else {
            setLessonForm((p) => ({ ...p, duration: 0 }));
        }
    };

    // ---------------- S3 UPLOAD USING MODULE ----------------
    const uploadToS3 = async (file, lessonId) => {
        const key = `videos/courses/${courseId}/topics/${selectedTopicId}/lessons/${lessonId}/${Date.now()}-${file.name}`;
        try {
            // reset progress and upload with progress callback
            setUploadProgress(0);
            hideLoader();
            const result = await presignAndUploadFile({
                file,
                key,
                onProgress: (pct) => {
                    setUploadProgress(Math.round(pct));
                    if (pct >= 100) {
                        showLoader();
                    }
                }
            });

            // ensure full completion state briefly
            // showLoader();
            setUploadProgress(100);
            // small delay to let UI show 100% progress, then reset in caller
            return result.cdnUrl;
        } catch (e) {
            console.error("Upload error:", e);
            showError(CONSTANTS?.SOMETING_WENT_WORNG_IN_SERVER);
            return null;
        }
    };

    // ---------------- SUBMIT ----------------
    const handleLessonSubmit = async () => {
        // DELETE
        if (action === "Delete") {
            const oldLesson = curriculum
                .find((t) => t.id === selectedTopicId)
                ?.lessons.find((l) => l.id === selectedLessonId);
            let s3Delete = true;
            if (oldLesson?.video_url) {
                s3Delete = false;
                showLoader();
                s3Delete = !errorValidation(await deleteFromS3(oldLesson.video_url));
                hideLoader();
            }

            if (s3Delete) {
                const res = await dispatch(deleteLesson(selectedLessonId)).unwrap();
                if (!errorValidation(res)) {
                    resetForm();
                    setOpenDialog(false);
                    showSuccess(CONSTANTS?.LESSON_DELETED);
                } else {
                    showError(CONSTANTS?.SOMETING_WENT_WORNG);
                }
            } else {
                showError(CONSTANTS?.SOMETING_WENT_WORNG_IN_SERVER);
            }

            return;
        }

        if (!validate()) return;

        let fileUrl = lessonForm.video_url;

        // Replace old file → delete existing from S3
        if (selectedFile && lessonForm.video_url) {
            showLoader();
            const s3DeleteResponse = await deleteFromS3(lessonForm.video_url);
            hideLoader();
            if (errorValidation(s3DeleteResponse)) {
                showError(CONSTANTS?.SOMETING_WENT_WORNG_IN_SERVER);
                return;
            }
        }
        if (selectedFile && action === "Update") {
            showLoader();
            fileUrl = await uploadToS3(selectedFile, selectedLessonId);
            hideLoader();
            if (!fileUrl) {
                setUploadProgress(0);
                return;
            }
        }
        const payload = {
            title: lessonForm.title,
            description: lessonForm.description,
            duration: lessonForm.type === "Video" ? lessonForm.duration : 0,
            type: lessonForm.type,
            video_url: fileUrl,
            topic_id: selectedTopicId,
            created_by: userId,
            course_id: courseId
        };

        // CREATE
        if (action === "Create") {
            const res = await dispatch(addLesson(payload)).unwrap();
            if (!errorValidation(res)) {
                const created = res?.data?.response;
                resetForm();
                setOpenDialog(false);
                showSuccess(CONSTANTS?.LESSON_ADDED);
            } else {
                showError(CONSTANTS?.SOMETING_WENT_WORNG);
            }
            return;
        }

        // UPDATE
        if (action === "Update") {
            const res = await dispatch(updateLesson({ id: selectedLessonId, data: payload })).unwrap();
            if (!errorValidation(res)) {
                const updated = res?.data?.response;
                resetForm();
                setOpenDialog(false);
                setUploadProgress(0);
                showSuccess(CONSTANTS?.LESSON_UPDATED);
            } else {
                showError(CONSTANTS?.SOMETING_WENT_WORNG);
            }
        }
    };

    // UI ------------------------------
    return (
        <Box>
            {action === "Delete" ? (
                <ShowPopup
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                    title="Delete Lesson"
                    onSubmit={handleLessonSubmit}
                    submitLabel="Delete"
                    cancelLabel="Cancel"
                >
                    Are you sure you want to delete lesson ID {selectedLessonId}?
                </ShowPopup>
            ) : (
                <SlideDialog
                    open={openDialog}
                    onClose={() => { resetForm(); setOpenDialog(false); }}
                    title={`${action} Lesson`}
                    onSubmit={handleLessonSubmit}
                    submitLabel={action}
                    cancelLabel="Cancel"
                >
                    <Box mt={1} sx={{ position: 'relative' }}>

                        {/* Title */}
                        <TextField
                            fullWidth
                            label="Lesson Title"
                            variant="standard"
                            required
                            value={lessonForm.title}
                            onChange={(e) =>
                                setLessonForm({ ...lessonForm, title: e.target.value })
                            }
                            error={Boolean(titleError)}
                            helperText={titleError}
                            sx={{ mb: 2 }}
                        />

                        {/* Type */}
                        <FormControl fullWidth variant="standard" sx={{ mb: 2 }}>
                            <InputLabel>Content Type</InputLabel>
                            <Select
                                value={lessonForm.type}
                                onChange={(e) => {
                                    setLessonForm({
                                        ...lessonForm,
                                        type: e.target.value,
                                        duration: 0,
                                        video_url: ""
                                    });
                                    setSelectedFile(null);
                                    setSelectedFileSize("");
                                    setFileError("");
                                }}
                            >
                                <MenuItem value="Video">Video</MenuItem>
                                <MenuItem value="PDF">PDF</MenuItem>
                            </Select>
                        </FormControl>

                        {/* Description */}
                        <TextField
                            fullWidth
                            required
                            label="Description"
                            variant="standard"
                            multiline
                            rows={3}
                            value={lessonForm.description}
                            onChange={(e) =>
                                setLessonForm({ ...lessonForm, description: e.target.value })
                            }
                            error={Boolean(descriptionError)}
                            helperText={descriptionError}
                            sx={{ mb: 2 }}
                        />

                        {/* ---------- VIDEO UPLOAD ---------- */}
                        {action !== "Create" && lessonForm.type === "Video" && (
                            <Box>
                                <Typography fontWeight={600}>

                                    {lessonForm.video_url ? "Replace Video (Max: 1GB)" : "Select Video (Max: 1GB)"}
                                </Typography>

                                <input
                                    type="file"
                                    accept="video/*"
                                    id="video-file"
                                    style={{ display: "none" }}
                                    onChange={handleFileChange}
                                />

                                <label htmlFor="video-file">
                                    <Button
                                        variant="outlined"
                                        startIcon={<UploadFileIcon />}
                                        component="span"
                                        sx={{ mt: 1 }}
                                    >
                                        {lessonForm.video_url ? "Lesson.mp4" : "Choose Video"}
                                    </Button>
                                </label>

                                {selectedFileSize && (
                                    <Typography mt={1}>Size: {selectedFileSize}</Typography>
                                )}

                                {fileError && <Typography color="error">{fileError}</Typography>}

                                {lessonForm.duration > 0 && (
                                    <Typography mt={1}>Duration: {secondsToTime(lessonForm.duration)}</Typography>
                                )}

                                {uploadProgress > 0 && uploadProgress < 100 && (
                                    <Box mt={2}>
                                        <LinearProgress variant="determinate" value={uploadProgress} />
                                        <Typography variant="caption">
                                            Upload Progress {uploadProgress}%
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        )}

                        {/* ---------- PDF UPLOAD ---------- */}
                        {action !== "Create" && lessonForm.type === "PDF" && (
                            <Box>
                                <Typography fontWeight={600}>
                                    {lessonForm.video_url ? "Replace PDF (Max: 50MB)" : "Select PDF (Max: 50MB)"}
                                </Typography>

                                <input
                                    type="file"
                                    accept="application/pdf"
                                    id="pdf-file"
                                    style={{ display: "none" }}
                                    onChange={handleFileChange}
                                />

                                <label htmlFor="pdf-file">
                                    <Button
                                        variant="outlined"
                                        startIcon={<UploadFileIcon />}
                                        component="span"
                                        sx={{ mt: 1 }}
                                    >
                                        {lessonForm.video_url ? "Lesson.pdf" : "Choose PDF"}
                                    </Button>
                                </label>

                                {selectedFileSize && (
                                    <Typography mt={1}>Size: {selectedFileSize}</Typography>
                                )}

                                {fileError && <Typography color="error">{fileError}</Typography>}
                            </Box>
                        )}

                    </Box>
                    <Backdrop
                        open={uploadProgress > 0 && uploadProgress < 100}
                        sx={{
                            inset: 0,
                            zIndex: (theme) => theme.zIndex.modal + 100,
                            color: "#fff",
                        }}
                    >
                        <Stack alignItems="center">
                            <Box sx={{ width: '100%' }}>
                                <LinearProgress variant="determinate" value={uploadProgress} sx={{ height: 12, borderRadius: 6 }} />
                                <Typography align="center" sx={{ color: '#fff', mt: 1 }}>{`Upload Inprogress ${uploadProgress}%`}</Typography>
                                <Typography align="center" sx={{ color: '#fff', mt: 1 }}>Please wait — don't leave this page.</Typography>
                            </Box>
                        </Stack>
                    </Backdrop>

                </SlideDialog>
            )}
        </Box>
    );
}

import React, { useEffect } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import SlideDialog from "../../../components/common/dialog/SlideDialog";
import ShowPopup from "../../../components/common/dialog/ShowPopup";
import { useDispatch } from "react-redux";
import { addTopic, updateTopic, deleteTopic } from "../../../redux/slices/topicsSlice";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { errorValidation } from "../../../utils/resolver.utils";
import useCommon from "../../../hooks/useCommon";
import { CONSTANTS } from "../../../constants";

export default function TopicHandler({ action, openDialog, setOpenDialog, selectedTopicId, curriculum, setCurriculum }) {
    const dispatch = useDispatch();
    const { id } = useParams();
    const { user } = useAuth();
    const userid = user?.id;
    const { showLoader, hideLoader, showError, showSuccess } = useCommon();

    // STATE
    const [titleError, setTitleError] = React.useState("");
    const [descriptionError, setDescriptionError] = React.useState("");

    const [topicForm, setTopicForm] = React.useState({
        id: "",
        title: "",
        description: "",
        lessons: []
    });

    // -------------------------------
    // CENTRAL RESET FUNCTION
    // -------------------------------
    const resetForm = () => {
        setTopicForm({ id: "", title: "", description: "", lessons: [] });
        setTitleError("");
        setDescriptionError("");
    };

    // -------------------------------
    // HANDLE OPEN (CREATE / UPDATE)
    // -------------------------------
    useEffect(() => {
        if (!openDialog) return;

        if (action === "Update" && selectedTopicId) {
            const topic = curriculum.find((t) => t.id == selectedTopicId);
            if (topic) {
                setTopicForm({
                    id: topic.id,
                    title: topic.title,
                    description: topic.description,
                    lessons: topic.lessons || []
                });
            }
        } else {
            // Create → clear previous values
            resetForm();
        }
    }, [openDialog, action, selectedTopicId, curriculum]);

    // -------------------------------
    // FORM SUBMIT HANDLER
    // -------------------------------
    const handleTopicSubmit = async () => {
        // ------------ DELETE ------------
        if (action === "Delete") {
            try {
                showLoader();
                const res = await dispatch(deleteTopic(selectedTopicId)).unwrap();
                hideLoader();
                if (!errorValidation(res)) {
                    resetForm();
                    setOpenDialog(false);
                    showSuccess(CONSTANTS?.TOPIC_DELETED || "Topic deleted");
                } else {
                    showError(CONSTANTS?.SOMETING_WENT_WORNG);
                }
            } catch (e) {
                hideLoader();
                showError(CONSTANTS?.SOMETING_WENT_WORNG_IN_SERVER);
            }
            return;
        }

        // ------------ VALIDATION ------------
        if (!topicForm.title.trim()) {
            setTitleError("Topic title is required");
            return;
        }
        if (!topicForm.description.trim()) {
            setDescriptionError("Topic description is required");
            return;
        }

        setTitleError("");
        setDescriptionError("");

        const payload = {
            title: topicForm.title,
            description: topicForm.description,
            created_by: userid,
            course_id: id
        };

        // ------------ CREATE ------------
        if (action === "Create") {
            try {
                showLoader();
                const res = await dispatch(addTopic(payload)).unwrap();
                hideLoader();
                if (!errorValidation(res)) {
                    const created = res?.data?.response;
                    resetForm();
                    setOpenDialog(false);
                    showSuccess(CONSTANTS?.TOPIC_ADDED || "Topic added");
                } else {
                    showError(CONSTANTS?.SOMETING_WENT_WORNG);
                }
            } catch (e) {
                hideLoader();
                showError(CONSTANTS?.SOMETING_WENT_WORNG_IN_SERVER);
            }
            return;
        }

        // ------------ UPDATE ------------
        else if (action === "Update") {
            try {
                showLoader();
                const res = await dispatch(updateTopic({ id: selectedTopicId, data: payload })).unwrap();
                hideLoader();
                if (!errorValidation(res)) {
                    resetForm();
                    setOpenDialog(false);
                    showSuccess(CONSTANTS?.TOPIC_UPDATED || "Topic updated");
                } else {
                    showError(CONSTANTS?.SOMETING_WENT_WORNG);
                }
            } catch (e) {
                hideLoader();
                showError(CONSTANTS?.SOMETING_WENT_WORNG_IN_SERVER);
            }
        }
    };

    return (
        <Box>

            {/* ---------- DELETE POPUP ---------- */}
            {action === "Delete" ? (
                <ShowPopup
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                    title={`${action} Topic`}
                    onSubmit={handleTopicSubmit}
                    submitLabel="Delete"
                    cancelLabel="Cancel"
                >
                    <Box mt={1}>
                        Are you sure you want to delete topic ID {selectedTopicId}?
                    </Box>
                </ShowPopup>
            ) : (

                /* ---------- CREATE / UPDATE FORM ---------- */
                <SlideDialog
                    open={openDialog}
                    onClose={() => {
                        resetForm();
                        setOpenDialog(false);
                    }}
                    title={`${action} Topic`}
                    onSubmit={handleTopicSubmit}
                    submitLabel={action}
                    cancelLabel="Cancel"
                >
                    <Box mt={1}>

                        {action === "Update" && (
                            <Box mb={2}>
                                <TextField
                                    fullWidth
                                    disabled
                                    label="Topic ID"
                                    variant="standard"
                                    value={selectedTopicId || ""}
                                />
                            </Box>
                        )}

                        <Box mb={2}>
                            <TextField
                                fullWidth
                                required
                                label="Topic Title"
                                variant="standard"
                                value={topicForm.title}
                                error={Boolean(titleError)}
                                helperText={titleError}
                                onChange={(e) =>
                                    setTopicForm({ ...topicForm, title: e.target.value })
                                }
                            />
                        </Box>

                        <Box mb={2}>
                            <TextField
                                fullWidth
                                required
                                multiline
                                rows={3}
                                label="Description"
                                variant="standard"
                                value={topicForm.description}
                                error={Boolean(descriptionError)}
                                helperText={descriptionError}
                                onChange={(e) =>
                                    setTopicForm({ ...topicForm, description: e.target.value })
                                }
                            />
                        </Box>
                    </Box>
                </SlideDialog>
            )}
        </Box>
    );
}

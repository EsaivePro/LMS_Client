import React, { useState, useEffect } from "react";
import {
    Box,
    Paper,
    Typography,
    Button,
    LinearProgress,
    Grid,
    Card,
    CardContent,
    IconButton
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { motion } from "framer-motion";

export default function FileUploadPage() {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadedFiles, setUploadedFiles] = useState([]);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        const res = await axios.get("/api/files");
        setUploadedFiles(res.data);
    };

    const handleFileChange = (e) => {
        setFiles([...e.target.files]);
    };

    const uploadFile = async () => {
        if (!files.length) return;

        const formData = new FormData();
        formData.append("file", files[0]);

        setUploading(true);

        try {
            await axios.post("/api/upload", formData, {
                onUploadProgress: (p) => {
                    const percent = Math.round((p.loaded * 100) / p.total);
                    setProgress(percent);
                }
            });

            setUploading(false);
            setProgress(0);
            setFiles([]);
            fetchFiles();

        } catch (err) {
            console.error(err);
            setUploading(false);
        }
    };

    const deleteFile = async (id) => {
        await axios.delete(`/api/files/${id}`);
        fetchFiles();
    };

    return (
        <Box p={3}>
            <Typography variant="h5" mb={2}>
                File Upload
            </Typography>

            <motion.div whileHover={{ scale: 1.02 }}>
                <Paper
                    sx={{
                        p: 4,
                        textAlign: "center",
                        border: "2px dashed #ccc",
                        borderRadius: 3
                    }}
                >
                    <input type="file" onChange={handleFileChange} />

                    <Box mt={2}>
                        <Button
                            variant="contained"
                            startIcon={<CloudUploadIcon />}
                            onClick={uploadFile}
                            disabled={uploading}
                        >
                            Upload
                        </Button>
                    </Box>

                    {uploading && (
                        <Box mt={2}>
                            <LinearProgress variant="determinate" value={progress} />
                            <Typography>{progress}%</Typography>
                        </Box>
                    )}
                </Paper>
            </motion.div>

            <Grid container spacing={2} mt={3}>
                {uploadedFiles.map((file) => (
                    <Grid item xs={12} md={4} key={file.id}>
                        <motion.div whileHover={{ scale: 1.05 }}>
                            <Card sx={{ borderRadius: 3 }}>
                                <CardContent>
                                    <Typography variant="body2">
                                        {file.file_name}
                                    </Typography>

                                    <Typography variant="caption">
                                        {file.mime_type}
                                    </Typography>

                                    <Box display="flex" justifyContent="flex-end">
                                        <IconButton onClick={() => deleteFile(file.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

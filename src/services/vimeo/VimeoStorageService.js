import * as tus from "tus-js-client";
import axiosInstance from "../../apiClient/axiosInstance";

/**
 * 🚀 Direct upload to Vimeo using backend ticket and TUS protocol
 * Usage: uploadToVimeoDirect({ file, onProgress, onSuccess, onError })
 */
export async function uploadToVimeoDirect({ file, onProgress, onSuccess, onError }) {
    try {
        // 1️⃣ Get upload ticket from backend
        const { data } = await axiosInstance.post(
            "/upload-service/vimeo/upload-ticket",
            {
                size: file.size,
                name: file.name,
            }
        );

        const { uploadLink, videoId } = data?.response || {};

        // 2️⃣ Upload directly to Vimeo using TUS
        // uploadUrl (not endpoint) because Vimeo already created the upload via the ticket —
        // tus must PATCH directly rather than POST to create a new one (which causes 405).
        const upload = new tus.Upload(file, {
            uploadUrl: uploadLink,
            retryDelays: [0, 1000, 3000, 5000],
            metadata: {
                filename: file.name,
                filetype: file.type,
            },
            onError: (error) => {
                console.error("Vimeo upload failed:", error);
                if (onError) onError(error);
            },
            onProgress: (bytesUploaded, bytesTotal) => {
                const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
                if (onProgress) onProgress(Number(percentage));
            },
            onSuccess: () => {
                console.log("Vimeo upload complete!");
                if (onSuccess) {
                    onSuccess({
                        videoId,
                        url: `https://vimeo.com/${videoId}`,
                    });
                }
            },
        });

        upload.start();
    } catch (err) {
        console.error("Vimeo upload error:", err);
        if (onError) onError(err);
    }
}

/**
 * Add a video to a Vimeo album (showcase) using backend API
 * @param {string} videoId - The Vimeo video ID to add
 * @param {string} albumId - The Vimeo album (showcase) ID
 * @returns {Promise<object>} - Backend API response
 *
 * Usage:
 *   await addVideoToVimeoAlbum({ videoId, albumId })
 */
export async function addVideoToVimeoAlbum({ videoId, albumId }) {
    if (!videoId || !albumId) {
        throw new Error("videoId and albumId are required");
    }
    try {
        const { data } = await axiosInstance.post("/upload-service/vimeo/add-to-album", {
            videoId,
            albumId,
        });
        return data;
    } catch (err) {
        console.error("Failed to add video to Vimeo album (backend):", err);
        throw err;
    }
}

/**
 * Delete a Vimeo video using backend API
 * @param {string} videoId - The Vimeo video ID to delete
 * @returns {Promise<object>} - Backend API response
 * Usage: await deleteVimeoVideo({ videoId })
 */
export async function deleteVimeoVideo({ videoId }) {
    if (!videoId) throw new Error("videoId is required");
    try {
        const { data } = await axiosInstance.post("/upload-service/vimeo/delete", { videoId });
        return data;
    } catch (err) {
        console.error("Failed to delete Vimeo video (backend):", err);
        throw err;
    }
}

/**
 * Edit a Vimeo video (name/description) using backend API
 * @param {string} videoId - The Vimeo video ID to edit
 * @param {string} [name] - New name/title
 * @param {string} [description] - New description
 * @returns {Promise<object>} - Backend API response
 * Usage: await editVimeoVideo({ videoId, name, description })
 */
export async function editVimeoVideo({ videoId, name, description }) {
    if (!videoId) throw new Error("videoId is required");
    try {
        const { data } = await axiosInstance.post("/upload-service/vimeo/edit", { videoId, name, description });
        return data;
    } catch (err) {
        console.error("Failed to edit Vimeo video (backend):", err);
        throw err;
    }
}
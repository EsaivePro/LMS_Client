import axiosInstance from "../../apiClient/axiosInstance";

/**
 * Upload file to Supabase Storage (multipart/form-data)
 * Returns: { publicUrl, key, ... }
 */
export async function supabasePresignAndUploadFile({ file, bucket = "default", key, onProgress } = {}) {
    // The backend expects the file as multipart/form-data field 'file', not in req.body
    try {
        const formData = new FormData();
        formData.append("file", file); // This will be available as req.file on backend
        formData.append("bucket", bucket);
        if (key) formData.append("key", key);

        // DO NOT send as JSON! Must be multipart/form-data
        const response = await axiosInstance.post(
            "/upload-service/supabase/upload",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress(percent);
                    }
                },
            }
        );

        if (response.data?.error) {
            throw new Error(response.data.message || "Supabase upload failed");
        }

        // Should return { signedUrl, path, fileName, ... }
        return response.data.data;
    } catch (err) {
        console.error("Supabase upload failed:", err);
        throw err;
    }
}


/**
 * Get signed URL for secure/private file access
 * Returns: signedUrl (string)
 */
export async function getSupabaseSignedUrl({ bucket, key, expiresIn = 60 } = {}) {
    try {
        const res = await axiosInstance.post(
            "/upload-service/supabase/presign",
            { bucket, key, expiresIn }
        );
        if (res.data?.error) {
            throw new Error(res.data.message || "Supabase presign failed");
        }
        return res.data.signedUrl;
    } catch (err) {
        console.error("Supabase presign failed:", err);
        throw err;
    }
}


/**
 * Delete file from Supabase Storage
 * Accepts: { bucket, key }
 * Returns: true on success
 */
export async function deleteFromSupabase({ bucket, key } = {}) {
    try {
        const res = await axiosInstance.post(
            "/upload-service/supabase/delete",
            { bucket, key }
        );
        if (res.data?.error) {
            throw new Error(res.data.message || "Supabase delete failed");
        }
        return true;
    } catch (err) {
        console.error("Supabase delete failed:", err);
        throw err;
    }
}
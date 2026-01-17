import axiosInstance from "../../apiClient/axiosInstance";

/**
 * request presigned url then upload using PUT
 * returns { cdnUrl, key } on success
 */
const CLOUDFRONT_DOMAIN = "https://d1fsxe4g48oy4v.cloudfront.net";

export async function presignAndUploadFile({ file, key, onProgress } = {}) {
    // 1) ask backend for presigned url
    const { data } = await axiosInstance.post("/upload/presign", {
        fileName: file.name,
        contentType: file.type,
        key,
    });

    if (data.error) throw new Error(data.message || "Presign failed");

    const presignedUrl = data.presignedUrl;

    // Use XMLHttpRequest to track upload progress via onprogress
    return await new Promise((resolve, reject) => {
        try {
            const xhr = new XMLHttpRequest();
            xhr.open("PUT", presignedUrl, true);
            xhr.setRequestHeader("Content-Type", file.type);

            if (xhr.upload && typeof onProgress === 'function') {
                xhr.upload.onprogress = (evt) => {
                    if (evt.lengthComputable) {
                        const percent = Math.round((evt.loaded / evt.total) * 100);
                        try { onProgress(percent); } catch (e) { /* ignore callback errors */ }
                    }
                };
            }

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve({ cdnUrl: data.cdnUrl, key: data.key });
                } else {
                    reject(new Error("Upload failed: " + (xhr.statusText || xhr.status)));
                }
            };

            xhr.onerror = () => reject(new Error("Upload failed"));
            xhr.send(file);
        } catch (e) {
            reject(e);
        }
    });
}

// ---------------- S3 DELETE ----------------
export async function deleteFromS3(url) {
    const key = extractS3Key(url);
    if (!key) return;
    try {
        const res = await axiosInstance.post("/upload/delete", { key });
        return res;
    } catch (e) {
        console.error("S3 delete failed", e);
    }
};

const extractS3Key = (url) => {
    if (!url) return null;
    return url.replace(`${CLOUDFRONT_DOMAIN}/`, "");
};
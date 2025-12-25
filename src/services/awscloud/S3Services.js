import axiosInstance from "../../apiClient/axiosInstance";

/**
 * request presigned url then upload using PUT
 * returns { cdnUrl, key } on success
 */
const CLOUDFRONT_DOMAIN = "https://d1fsxe4g48oy4v.cloudfront.net";

export async function presignAndUploadFile({ file, key }) {
    // 1) ask backend for presigned url
    const { data } = await axiosInstance.post("/upload/presign", {
        fileName: file.name,
        contentType: file.type,
        key,
    });

    if (data.error) throw new Error(data.message || "Presign failed");

    const presignedUrl = data.presignedUrl;
    const putRes = await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
    });

    if (!putRes.ok) {
        const text = await putRes.text();
        throw new Error("Upload failed: " + text);
    }

    return { cdnUrl: data.cdnUrl, key: data.key };
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
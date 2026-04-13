// src/services/awscloud/StorageProvider.js
import { presignAndUploadFile, deleteFromS3 } from "./awscloud/S3Services";
import { supabasePresignAndUploadFile, deleteFromSupabase } from "../services/supabasecloud/SupabaseStorageService";

// Configuration: 's3' or 'supabase'
const STORAGE_BACKEND = 'supabase'; // or 's3'

export function getStorageBackend() {
    return STORAGE_BACKEND;
}

export async function uploadFile({ file, key, onProgress, bucket }) {
    if (STORAGE_BACKEND === 'supabase') {
        return await supabasePresignAndUploadFile({ file, key, bucket, onProgress });
    } else {
        return await presignAndUploadFile({ file, key, onProgress });
    }
}

export async function deleteFile({ url, bucket, key }) {
    if (STORAGE_BACKEND === 'supabase') {
        // url or key must be provided
        return await deleteFromSupabase({ bucket, key: key || url });
    } else {
        return await deleteFromS3(url);
    }
}

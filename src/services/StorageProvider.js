// src/services/awscloud/StorageProvider.js
import { presignAndUploadFile, deleteFromS3 } from "./awscloud/S3Services";
import { supabasePresignAndUploadFile, getSupabaseSignedUrl, deleteFromSupabase } from "../services/supabasecloud/SupabaseStorageService";

// Configuration: 's3' or 'supabase'
const STORAGE_BACKEND = 'supabase'; // or 's3'

export function getStorageBackend() {
    return STORAGE_BACKEND;
}

export async function uploadFile({ file, key, onProgress }) {
    if (STORAGE_BACKEND === 'supabase') {
        return await supabasePresignAndUploadFile({ file, key, onProgress });
    } else {
        return await presignAndUploadFile({ file, key, onProgress });
    }
}

export async function getSignedUrl({ key }) {
    if (STORAGE_BACKEND === 'supabase') {
        return await getSupabaseSignedUrl({ key });
    } else {
        // TODO: Implement getSignedUrl for S3 if needed, or return the public URL if files are public
    }
}

export async function deleteFile({ key }) {
    if (STORAGE_BACKEND === 'supabase') {
        return await deleteFromSupabase({ key });
    } else {
        return await deleteFromS3({ key });
    }
}

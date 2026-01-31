// Utility to manage a persistent device id and collect device info
import { v4 as uuidv4 } from "uuid";
import { tokenStorage } from "./tokenStorage.utils";

const DEVICE_KEY = "lms_device_id";

export function getDeviceId() {
    try {
        let id = localStorage.getItem(DEVICE_KEY);
        if (!id) {
            id = uuidv4();
            localStorage.setItem(DEVICE_KEY, id);
        }
        return id;
    } catch (e) {
        return uuidv4();
    }
}

export function getDeviceInfo() {
    const ua = navigator.userAgent || "";
    const platform = navigator.platform || "";
    return {
        device_type: platform,
        device_info: ua,
    };
}

export async function getPublicIp() {
    try {
        const res = await fetch("https://api.ipify.org?format=json");
        if (!res.ok) return null;
        const j = await res.json();
        return j.ip || null;
    } catch (e) {
        return null;
    }
}

export default {
    getDeviceId,
    getDeviceInfo,
    getPublicIp,
};

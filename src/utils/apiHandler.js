import { showLoading, hideLoading, successAlert, errorAlert } from "../redux/slices/commonSlice";
import { CONSTANTS } from "../constants";
export default function useApiHandler() {
    const apiHandler = async (dispatch, apiFunction, ...params) => {
        let res = null;
        try {
            dispatch(showLoading());
            res = await apiFunction(...params);
            return res;
        } catch (err) {
            dispatch(errorAlert(err?.response?.data?.message || err.message || CONSTANTS.UNEXPECTED_ERROR));
            return { isError: true, message: err.message };
        } finally {
            dispatch(hideLoading());
        }
    };

    const apiHandlerWithoutLoader = async (dispatch, apiFunction, ...params) => {
        let res = null;
        try {
            res = await apiFunction(...params);
            return res;
        } catch (err) {
            dispatch(errorAlert(err?.response?.data?.message || err.message || CONSTANTS.UNEXPECTED_ERROR));
            return { isError: true, message: err.message };
        }
    };
    return { apiHandler, apiHandlerWithoutLoader };
}

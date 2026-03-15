import { httpClient } from '../../../apiClient/httpClient';
import { store } from '../../../redux/store/store';
import { showLoading, hideLoading, errorAlert } from '../../../redux/slices/commonSlice';

async function callExecute(name, body) {
    // show global loader
    try {
        store.dispatch(showLoading('Loading...'));
        const res = await httpClient.execute(name, body);
        // axios returns response with `data` payload
        const data = res?.data ?? res;
        store.dispatch(hideLoading());
        return data;
    } catch (err) {
        store.dispatch(hideLoading());
        const msg = err?.response?.data?.message || err?.response?.data || err?.message || String(err);
        store.dispatch(errorAlert(typeof msg === 'string' ? msg : JSON.stringify(msg)));
        throw err;
    }
}

export async function getUserExamDetails({ exam_id, user_id }) {
    const body = { params: { exam_id, user_id } };
    return await callExecute('get_user_exam_details', body);
}

export async function getExamQuestions({ exam_id, user_id, attempt_id, section_id }) {
    const body = { params: { exam_id, user_id, attempt_id, section_id } };
    return await callExecute('get_exam_questions', body);
}

export default {
    getUserExamDetails,
    getExamQuestions,
};

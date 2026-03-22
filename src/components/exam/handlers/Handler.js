import { httpClient } from '../../../apiClient/httpClient';
import { store } from '../../../redux/store/store';
import { showLoading, hideLoading, errorAlert } from '../../../redux/slices/commonSlice';

async function callExecute(name, body, loader = true) {
    // show global loader
    try {
        if (loader) {
            store.dispatch(showLoading('Loading...'));
        }
        const res = await httpClient.execute(name, body);
        // axios returns response with `data` payload
        const data = res?.data ?? res;
        store.dispatch(hideLoading());
        return data;
    } catch (err) {
        store.dispatch(hideLoading());
        const msg = err?.data?.data?.message || err?.response?.data || err?.message || String(err);
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

export async function upsertUserExamAnswer({
    user_id,
    answer_id,
    marked,
    question_id,
    exam_id,
    attempt_id
}) {
    const body = {
        params: {
            user_id,
            answer_id,
            marked,
            question_id,
            exam_id,
            attempt_id
        }
    };

    return await callExecute('upsert_user_exam_answer', body, false);
}

export async function startExamAttempt({ attempt_id, user_id, exam_id, started_at }) {
    const body = { params: { attempt_id, user_id, exam_id, started_at } };
    return await callExecute('start_exam_attempt', body, false);
}

export async function submit_exam({ exam_id, user_id, attempt_id, submitted_at }) {
    const body = { params: { attempt_id, user_id, exam_id, submitted_at } };
    return await callExecute('submit_exam', body);
}

export default {
    getUserExamDetails,
    getExamQuestions,
    upsertUserExamAnswer,
    startExamAttempt,
    submit_exam
};

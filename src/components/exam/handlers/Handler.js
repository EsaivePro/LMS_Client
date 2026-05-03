import { store } from '../../../redux/store/store';
import {
    examAttemptStart,
    examAttemptSubmit,
    examAttemptAnswer,
    getExamDetails,
    getUserExamDetailsDirect,
} from '../../../services/LMSGateway';
import { httpClient } from '../../../apiClient/httpClient';
import { showLoading, hideLoading, errorAlert } from '../../../redux/slices/commonSlice';

// Kept for getExamQuestions which has no new REST endpoint yet
async function callExecute(name, body, loader = true) {
    try {
        if (loader) store.dispatch(showLoading('Loading...'));
        const res = await httpClient.execute(name, body);
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
    const dispatch = store.dispatch;
    const res = await getUserExamDetailsDirect(dispatch, exam_id, { user_id });
    return res?.data ?? res;
}

export async function getExamQuestions({ exam_id, user_id, attempt_id, section_id }) {
    const body = { params: { exam_id, user_id, attempt_id, section_id } };
    return await callExecute('get_exam_questions', body);
}

export async function upsertUserExamAnswer({ user_id, answer_id, marked, question_id, exam_id, attempt_id }) {
    const dispatch = store.dispatch;
    const res = await examAttemptAnswer(dispatch, { user_id, answer_id, marked, question_id, exam_id, attempt_id });
    return res?.data ?? res;
}

export async function startExamAttempt({ attempt_id, user_id, exam_id, started_at }) {
    const dispatch = store.dispatch;
    const res = await examAttemptStart(dispatch, { attempt_id, user_id, exam_id, started_at });
    return res?.data ?? res;
}

export async function submit_exam({ exam_id, user_id, attempt_id, submitted_at }) {
    const dispatch = store.dispatch;
    const res = await examAttemptSubmit(dispatch, { exam_id, user_id, attempt_id, submitted_at });
    return res?.data ?? res;
}

export default {
    getUserExamDetails,
    getExamQuestions,
    upsertUserExamAnswer,
    startExamAttempt,
    submit_exam,
};

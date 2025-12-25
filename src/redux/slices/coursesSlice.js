import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchAllCourses,
  createCourse,
  updateCourse as updateCourseAPI,
  deleteCourse as deleteCourseAPI,
  createTopic,
  updateTopic as updateTopicAPI,
  deleteTopic as deleteTopicAPI,
  fetchCourseDeatils as fetchCourseDeatilsAPI
} from "../../services/LMSGateway";
import { addTopic, updateTopic as topicUpdateThunk, deleteTopic as topicDeleteThunk } from "./topicsSlice";
import { addLesson, updateLesson as lessonUpdateThunk, deleteLesson as lessonDeleteThunk } from "./lessonsSlice";

export const fetchCourses = createAsyncThunk(
  "courses/fetch",
  async (_, { dispatch }) => {
    const res = fetchAllCourses(dispatch);
    return res;
  }
);

export const fetchCourseDeatils = createAsyncThunk(
  "courses/getCourseDetails",
  async (courseid, { dispatch }) => {
    const res = fetchCourseDeatilsAPI(dispatch, courseid);
    return res;
  }
);

export const addCourse = createAsyncThunk(
  "courses/create",
  async (course, { dispatch }) => {
    const res = createCourse(dispatch, course);
    return res;
  }
);

export const updateCourse = createAsyncThunk(
  "courses/update",
  async ({ id, data }, { dispatch }) => {
    const res = updateCourseAPI(dispatch, id, data);
    return res;
  }
);

export const deleteCourse = createAsyncThunk(
  "courses/delete",
  async (id, { dispatch }) => {
    const res = deleteCourseAPI(dispatch, id);
    return res;
  }
);

const courseSlice = createSlice({
  name: "courses",
  initialState: {
    allCourses: [],
    courseDetails: [],
    currentCourseId: 0,
    currentCourseDetail: {},
    currentEditingCourseId: null,
    loading: false,
    error: true,
    message: null
  },
  reducers: {
    setCourseDetail: (state, action) => {
      state.courseDetails = action.payload;
    },
    setCurrentCourseDetail: (state, action) => {
      state.currentCourseId = action.payload;
      const index = state.courseDetails.findIndex(
        (course) => course.courseId === state.currentCourseId
      );
      if (index !== -1) {
        state.currentCourseDetail = state.courseDetails[index];
      }
    },
    setCurrentEditingCourseId: (state, action) => {
      state.currentEditingCourseId = action.payload;
    },
    changeTopicInCourse: (state, action) => {
      if (state.currentCourseDetail) {
        state.courseDetails.push(action.payload?.data?.response);
      }
    }
  },
  extraReducers: (builder) => {
    builder

      /* FETCH */
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.allCourses = action?.payload?.data?.response;
        state.error = action?.payload?.data?.error;
        state.message = action?.payload?.data?.message;
      })
      .addCase(fetchCourses.rejected, (state) => {
        state.loading = false;
      })

      /* FETCH COURSE DETAILS */
      .addCase(fetchCourseDeatils.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCourseDeatils.fulfilled, (state, action) => {
        state.loading = false;
        state.error = action?.payload?.data?.error || action?.payload?.isError;
        state.message = action?.payload?.data?.message;
        if (!(state.error)) {
          const index = state.courseDetails.findIndex(
            (course) => course.courseId === action.payload?.data?.response?.courseId
          );
          if (index == -1) {
            state.courseDetails.push(action.payload?.data?.response);
          }
        }
      })
      .addCase(fetchCourseDeatils.rejected, (state) => {
        state.loading = false;
      })

      /* CREATE */
      .addCase(addCourse.fulfilled, (state, action) => {
        state.error = action?.payload?.data?.error;
        state.message = action?.payload?.data?.message;
        if (!(state.error) && !(action?.payload?.isError)) {
          const created = action?.payload?.data?.response;
          // Update allCourses
          state.allCourses.push(created);
          // Sync into courseDetails: add if missing or merge basic fields
          if (created) {
            const idx = state.courseDetails.findIndex(
              (c) => c?.id == created?.id || c?.courseId == created?.id || c?.course_id == created?.id
            );
            if (idx === -1) {
              state.courseDetails.push(created);
            } else {
              const topics = state.courseDetails[idx]?.topics;
              state.courseDetails[idx] = { ...state.courseDetails[idx], ...created, topics };
            }
          }
        }
      })

      /* UPDATE */
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.error = action?.payload?.data?.error;
        state.message = action?.payload?.data?.message;
        if (!(state.error) && !(action?.payload?.isError)) {
          const updated = action?.payload?.data?.response;
          // Update allCourses
          const index = state.allCourses.findIndex((course) => course.id === updated?.id);
          if (index !== -1) state.allCourses[index] = updated;
          // Sync into courseDetails: merge title/description etc., preserve topics
          const dIdx = state.courseDetails.findIndex(
            (c) => c?.id == updated?.id || c?.courseId == updated?.id || c?.course_id == updated?.id
          );
          if (dIdx !== -1) {
            const topics = state.courseDetails[dIdx]?.topics;
            state.courseDetails[dIdx] = { ...state.courseDetails[dIdx], ...updated, topics };
          }
        }
      })

      /* DELETE */
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.error = action?.payload?.data?.error;
        state.message = action?.payload?.data?.message;
        if (!(state.error)) {
          const deletedId = action.payload?.data?.response?.id;
          // Update allCourses
          state.allCourses = state.allCourses.filter((course) => course.id !== deletedId);
          // Remove from courseDetails
          state.courseDetails = state.courseDetails.filter(
            (c) => !(c?.id === deletedId || c?.courseId === deletedId || c?.course_id === deletedId)
          );
        }
      })

      /* TOPIC - CREATE */
      .addCase(addTopic.fulfilled, (state, action) => {
        state.error = action?.payload?.data?.error;
        state.message = action?.payload?.data?.message;
        if (!(state.error) && !(action?.payload?.isError)) {
          const created = action?.payload?.data?.response || action?.payload?.response || action?.payload;
          const editingCourseId = state.currentEditingCourseId;
          const idx = state.courseDetails.findIndex(c =>
            (c.courseId == editingCourseId || c.course_id == editingCourseId || c.id == editingCourseId)
          );
          if (idx !== -1) {
            state.courseDetails[idx].topics = state.courseDetails[idx].topics || [];
            state.courseDetails[idx].topics.push({ ...created, lessons: [] });
          }
        }
      })

      /* TOPIC - UPDATE */
      .addCase(topicUpdateThunk.fulfilled, (state, action) => {
        state.error = action?.payload?.data?.error;
        state.message = action?.payload?.data?.message;
        if (!(state.error) && !(action?.payload?.isError)) {
          const updated = action?.payload?.data?.response || action?.payload?.response || action?.payload;
          const editingCourseId = state.currentEditingCourseId;
          const courseIdx = state.courseDetails.findIndex(c =>
            (c.courseId == editingCourseId || c.course_id == editingCourseId || c.id == editingCourseId)
          );
          if (courseIdx !== -1) {
            const topics = state.courseDetails[courseIdx].topics || [];
            const tIdx = topics.findIndex(t => t.id === updated.id);
            if (tIdx !== -1) {
              state.courseDetails[courseIdx].topics[tIdx] = { ...state.courseDetails[courseIdx].topics[tIdx], ...updated };
            }
          }
        }
      })

      /* TOPIC - DELETE */
      .addCase(topicDeleteThunk.fulfilled, (state, action) => {
        state.error = action?.payload?.data?.error;
        state.message = action?.payload?.data?.message;
        if (!(state.error)) {
          const deleted = action?.payload?.data?.response || action?.payload?.response || action?.payload;
          const topicId = deleted.id || deleted.topicId || action?.meta?.arg;
          const editingCourseId = state.currentEditingCourseId;
          const courseIdx = state.courseDetails.findIndex(c =>
            (c.courseId == editingCourseId || c.course_id == editingCourseId || c.id == editingCourseId)
          );
          if (courseIdx !== -1) {
            state.courseDetails[courseIdx].topics = (state.courseDetails[courseIdx].topics || []).filter(t => t.id !== topicId);
          }
        }
      })

      /* LESSON - CREATE */
      .addCase(addLesson.fulfilled, (state, action) => {
        state.error = action?.payload?.data?.error;
        state.message = action?.payload?.data?.message;
        if (!(state.error) && !(action?.payload?.isError)) {
          const created = action?.payload?.data?.response || action?.payload?.response || action?.payload;
          const topicId = created.topic_id || created.topicId || created.topicId;
          const editingCourseId = state.currentEditingCourseId;
          const courseIdx = state.courseDetails.findIndex(c =>
            (c.courseId == editingCourseId || c.course_id == editingCourseId || c.id == editingCourseId)
          );
          if (courseIdx !== -1) {
            const topic = state.courseDetails[courseIdx].topics?.find(t => t.id === topicId);
            if (topic) {
              topic.lessons = topic.lessons || [];
              topic.lessons.push(created);
            }
          }
        }
      })

      /* LESSON - UPDATE */
      .addCase(lessonUpdateThunk.fulfilled, (state, action) => {
        state.error = action?.payload?.data?.error;
        state.message = action?.payload?.data?.message;
        if (!(state.error) && !(action?.payload?.isError)) {
          const updated = action?.payload?.data?.response || action?.payload?.response || action?.payload;
          const topicId = updated.topic_id || updated.topicId || updated.topicId;
          const editingCourseId = state.currentEditingCourseId;
          const courseIdx = state.courseDetails.findIndex(c =>
            (c.courseId == editingCourseId || c.course_id == editingCourseId || c.id == editingCourseId)
          );
          if (courseIdx !== -1) {
            const topic = state.courseDetails[courseIdx].topics?.find(t => t.id === topicId);
            if (topic) {
              const lIdx = (topic.lessons || []).findIndex(l => l.id === updated.id);
              if (lIdx !== -1) topic.lessons[lIdx] = updated;
            }
          }
        }
      })

      /* LESSON - DELETE */
      .addCase(lessonDeleteThunk.fulfilled, (state, action) => {
        state.error = action?.payload?.data?.error;
        state.message = action?.payload?.data?.message;
        if (!(state.error)) {
          const deleted = action?.payload?.data?.response || action?.payload?.response || action?.payload;
          const lessonId = deleted.id || deleted.lessonId || action?.meta?.arg;
          const editingCourseId = state.currentEditingCourseId;
          const courseIdx = state.courseDetails.findIndex(c =>
            (c.courseId == editingCourseId || c.course_id == editingCourseId || c.id == editingCourseId)
          );
          if (courseIdx !== -1) {
            const topics = state.courseDetails[courseIdx].topics || [];
            topics.forEach(t => {
              t.lessons = (t.lessons || []).filter(l => l.id !== lessonId);
            });
          }
        }
      });
  },
});


export const {
  setCourseDetail,
  setCurrentEditingCourseId
} = courseSlice.actions;

export default courseSlice.reducer;
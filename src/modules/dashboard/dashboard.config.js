export const WIDGETS = {
    // ── Original dashboard widgets ──
    welcome: { type: "welcome" },
    counts: { type: "count", title: "Counts" },
    myCourses: { type: "course", title: "My Courses" },
    courses: { type: "course", title: "Available Courses" },
    courseCategory: { type: "courseCategory", title: "Course Categories" },
    scheduledCourses: { type: "scheduledCourses", title: "Upcoming" },
    studentCounts: { type: "studentCounts", title: "Student Counts" },

    // ── Enrollment dashboard widgets ──
    statsCards: { type: "statsCards" },
    enrolledWidget: { type: "enrolledWidget", title: "Your Enrollments" },
    progressAnalytics: { type: "progressAnalytics", title: "Learning Analytics" },
    upcomingSchedule: { type: "upcomingSchedule", title: "Schedule & Deadlines" },

    // ── Exam dashboard widget ──
    examWidget: { type: "examWidget", title: "Assessments & Exams" },
};

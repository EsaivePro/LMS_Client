export const WIDGETS = {
    // ── Original dashboard widgets ──
    welcome:            { type: "welcome",          title: "Welcome"              },
    counts:             { type: "count",            title: "Counts"               },
    myCourses:          { type: "course",           title: "Your Learning"        },
    courses:            { type: "course",           title: "Available Courses"    },
    courseCategory:     { type: "courseCategory",   title: "Course Categories"    },
    scheduledCourses:   { type: "scheduledCourses", title: "Upcoming"             },
    studentCounts:      { type: "studentCounts",    title: "Student Counts"       },
    enrollment:         { type: "enrollment",       title: "Enrollments"          },
    progress:           { type: "progress",         title: "Progress"             },
    chart:              { type: "chart",            title: "Chart"                },
    stat:               { type: "stat",             title: "Stat"                 },

    // ── Enrollment detail widgets ──
    enrollmentInfo:     { type: "enrollmentInfo",   title: "Enrollment Info"      },
    updateSchedule:     { type: "updateSchedule",   title: "Update Schedule"      },
    reEnroll:           { type: "reEnroll",         title: "Re-enroll"            },
    revokeEnrollment:   { type: "revokeEnrollment", title: "Revoke Enrollment"    },

    // ── Enrollment dashboard widgets ──
    statsCards:         { type: "statsCards",       title: "Stats"                },
    enrollmentFilters:  { type: "enrollmentFilters",title: "Filters"              },
    enrollmentList:     { type: "enrollmentList",   title: "Enrollment List"      },
    progressAnalytics:  { type: "progressAnalytics",title: "Learning Analytics"   },
    upcomingSchedule:   { type: "upcomingSchedule", title: "Schedule & Deadlines" },
};

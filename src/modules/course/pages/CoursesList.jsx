import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  IconButton,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { fetchCourses } from "../../../redux/slices/coursesSlice";
import DataTableV1 from "../../../components/common/table/DataTableV1";
import CourseCreate from "../../../components/course/CourseCreate";
import CourseUpdate from "../../../components/course/CourseUpdate";
import CourseDelete from "../../../components/course/CourseDelete";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import GlobalAlert from "../../../components/common/alert/GlobalAlert";
import { useNavigate } from "react-router-dom";
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import useCourseCategory from "../../../hooks/useCourseCategory";

function ActionsCell({ onEdit, onDelete }) {
  const [anchor, setAnchor] = useState(null);
  const open = Boolean(anchor);

  return (
    <>
      <Tooltip title="More" placement="top" disableInteractive>
        <IconButton size="small" onClick={(event) => setAnchor(event.currentTarget)} sx={{ color: "var(--dark)" }}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { elevation: 2, sx: { minWidth: 120, borderRadius: 1.5 } } }}
      >
        <MenuItem onClick={() => { setAnchor(null); onEdit(); }} sx={{ gap: 0 }}>
          <ListItemIcon sx={{ minWidth: 0 }}>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={() => { setAnchor(null); onDelete(); }} sx={{ gap: 0, color: "error.main" }}>
          <ListItemIcon sx={{ minWidth: 0, color: "error.main" }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
    </>
  );
}

export default function CoursesList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { allCourses } = useCourseCategory();
  useEffect(() => {
    const loadCourses = async () => {
      if (allCourses.length === 0) {
        try {
          await dispatch(fetchCourses()).unwrap();
        } catch (err) {
          // optional: handle load error
        }
      }
    };

    loadCourses();
  }, []);

  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState({ open: false, type: "", message: "" });
  const [openUpdate, setOpenUpdate] = React.useState(false);
  const [selectedCourse, setSelectedCourse] = React.useState(null);
  const [openDelete, setOpenDelete] = React.useState(false);
  const [deleteCourse, setDeleteCourse] = React.useState(0);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const defaultNoRows = {
    title: "No Course Found",
    subtitle: "Click “Add Course” to create your first course.",
  };

  const openUpdateCourse = (course) => {
    setSelectedCourse(course);
    setOpenUpdate(true);
  };

  const openDeleteCourse = (id) => {
    setDeleteCourse(id);
    setOpenDelete(true);
  };

  const handleFetchData = useCallback(async (queryString) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(queryString);
      const page = parseInt(params.get("page") || "1", 10);
      const limit = parseInt(params.get("limit") || "10", 10);
      const q = (params.get("q") || "").trim().toLowerCase();
      const sortBy = params.get("sort_by") || "";
      const sortOrder = params.get("sort_order") || "asc";

      let working = Array.isArray(allCourses) ? [...allCourses] : [];

      if (q) {
        working = working.filter((course) => {
          const title = String(course?.title || "").toLowerCase();
          const description = String(course?.description || "").toLowerCase();
          return title.includes(q) || description.includes(q);
        });
      }

      if (sortBy) {
        const direction = sortOrder === "desc" ? -1 : 1;
        working.sort((left, right) => {
          const leftValue = left?.[sortBy];
          const rightValue = right?.[sortBy];
          if (leftValue == null && rightValue == null) return 0;
          if (leftValue == null) return -1 * direction;
          if (rightValue == null) return 1 * direction;
          if (typeof leftValue === "number" && typeof rightValue === "number") {
            return (leftValue - rightValue) * direction;
          }
          return String(leftValue).localeCompare(String(rightValue), undefined, { numeric: true, sensitivity: "base" }) * direction;
        });
      }

      const start = (page - 1) * limit;
      const end = start + limit;
      setTotal(working.length);
      setRows(working.slice(start, end));
    } finally {
      setLoading(false);
    }
  }, [allCourses]);

  const columns = useMemo(() => [
    {
      field: "id",
      headerName: "ID",
      flex: 0.5,
      maxWidth: 100,
    },
    {
      field: "title",
      headerName: "TITLE",
      flex: 1,
      minWidth: 250,
      sortable: false,
      align: "center",
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            justifyContent: "start",
            alignItems: "center",
            gap: 1,
            width: "100%",
            height: "100%",
            cursor: "pointer",
            color: "primary.main",
            "&:hover": { color: "primary.dark", textDecoration: "underline" },
          }}
          onClick={() => navigate(`/course/view/${params.row.id}`)}
        >
          <Typography
            sx={{


            }}
          >
            {params.row.title}
          </Typography>
        </Box>
      ),
    },
    {
      field: "description",
      headerName: "SHORT DESCRIPTION",
      flex: 2,
      maxWidth: 450,
      type: "string",
      filterable: true,
    },
    {
      field: "total_topics",
      headerName: "Total Topics",
      flex: 2,
      maxWidth: 450,
      type: "string",
    },
    {
      field: "total_lessons",
      headerName: "Total Lessons",
      flex: 2,
      maxWidth: 450,
      type: "string",
    },
    {
      field: "duration",
      headerName: "Duration",
      flex: 2,
      maxWidth: 450,
      type: "string",
    },
    {
      field: "actions",
      headerName: "ACTIONS",
      pinned: "right",
      minWidth: 60,
      maxWidth: 60,
      sortable: false,
      align: "center",
      renderCell: (params) => (
        <ActionsCell
          onEdit={() => openUpdateCourse(params.row)}
          onDelete={() => openDeleteCourse(params.row.id)}
        />
      ),
    },
    {
      field: "manage",
      headerName: "MANAGE",
      pinned: "left",
      flex: 1,
      maxWidth: 100,
      sortable: false,
      align: "center",
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            justifyContent: "start",
            alignItems: "center",
            gap: 1,
            width: "100%",
            height: "100%",
          }}
        >
          <IconButton
            color="primary"
            size="small"
            onClick={() => navigate(`/course/edit/${params.row.id}`)}
          >
            <ManageAccountsIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ], [navigate]);

  return (
    <Box p={2}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          mb: 3
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{ color: "var(--textPrimary)", mb: 0.3, p: .7 }}
            >
              <Button disabled>
                Total Courses: {total}
              </Button>
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={() => setOpen(true)}
          >
            <AddIcon sx={{ fontSize: 20 }} />
            Add Course
          </Button>
        </Box>
      </Box>

      {/* Dialogs */}
      <CourseCreate openDialog={open} setOpenDialog={setOpen} setAlert={setAlert} />

      {selectedCourse && (
        <CourseUpdate
          openDialog={openUpdate}
          setOpenDialog={setOpenUpdate}
          selectedCourse={selectedCourse}
          setAlert={setAlert}
        />
      )}

      <CourseDelete
        openDialog={openDelete}
        setOpenDialog={setOpenDelete}
        deleteCourseId={deleteCourse}
        setAlert={setAlert}
      />

      <GlobalAlert alert={alert} setAlert={setAlert} />

      {/* DATATABLE */}
      <DataTableV1
        rows={rows}
        totalCount={total}
        loading={loading}
        columns={columns}
        noRowsContent={defaultNoRows}
        serverSide
        tableKey="courses-table"
        tableName="courses"
        onFetchData={handleFetchData}
      />
    </Box>
  );
}

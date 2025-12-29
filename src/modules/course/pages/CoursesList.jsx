import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { fetchCourses } from "../../../redux/slices/coursesSlice";
import DataTable from "../../../components/common/table/DataTable";
import CourseCreate from "../../../components/course/CourseCreate";
import CourseUpdate from "../../../components/course/CourseUpdate";
import CourseDelete from "../../../components/course/CourseDelete";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import GlobalAlert from "../../../components/common/alert/GlobalAlert";
import { useNavigate } from "react-router-dom";
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import useCourseCategory from "../../../hooks/useCourseCategory";

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
  }, [allCourses]);

  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState({ open: false, type: "", message: "" });
  const [openUpdate, setOpenUpdate] = React.useState(false);
  const [selectedCourse, setSelectedCourse] = React.useState(null);
  const [openDelete, setOpenDelete] = React.useState(false);
  const [deleteCourse, setDeleteCourse] = React.useState(0);

  // NEW: Search State
  const [search, setSearch] = useState("");

  // Filter logic (client-side)
  const filteredCourses = allCourses?.filter(
    (c) =>
      c?.title?.toLowerCase().includes(search.toLowerCase()) ||
      c?.description?.toLowerCase().includes(search.toLowerCase())
  );

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

  const columns = [
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
      field: "actions",
      headerName: "ACTIONS",
      flex: 1,
      maxWidth: 120,
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
            onClick={() => openUpdateCourse(params.row)}
          >
            <EditIcon fontSize="small" />
          </IconButton>

          <IconButton
            color="error"
            size="small"
            onClick={() => openDeleteCourse(params.row.id)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
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
  ];

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
              sx={{ color: "#1e293b", mb: 0.3, p: .7 }}
            >
              <Button disabled>
                Total Courses: {filteredCourses?.length ?? 0}
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

        <TextField
          size="medium"
          fullWidth
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            mt: 1,
            backgroundColor: "white",
            borderRadius: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#64748b" }} />
              </InputAdornment>
            ),
          }}
        />
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
      <DataTable
        rows={filteredCourses}
        columns={columns}
        noRowsContent={defaultNoRows}
        serverSide={false}
      />
    </Box>
  );
}

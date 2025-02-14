import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  TextField,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from '@mui/icons-material/Add';
import axios from "axios";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";


const Attribute = () => {
  const [rows, setRows] = useState([]); // List of attributes
  const [categories, setCategories] = useState([]); // Store categories
  const [isAddItemView, setIsAddItemView] = useState(false); // Toggle for views

  const [newAttributes, setNewAttributes] = useState([
    { name: "", input_type: "", input_values: "", category: "", status: "" },
  ]);

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editData, setEditData] = useState(null);
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [message, setMessage] = useState('')

  // Fetch attributes list
  const fetchAttributes = async () => {
    try {
      const response = await axios.get(
        "https://spinryte.in/draw/api/Category/attributeList"
      );
      if (response.data && Array.isArray(response.data.dataList)) {
        setRows(response.data.dataList);
      } else {
        console.error("Error: Data is not in expected format", response.data);
      }
    } catch (error) {
      console.error("Error fetching attribute list:", error);
    }
  };

  // Fetch categories list
  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "https://spinryte.in/draw/api/Category/categoryList"
      );
      if (response.data && Array.isArray(response.data.dataList)) {
        setCategories(response.data.dataList);
      } else {
        console.error("Error: Categories data is not in expected format", response.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchAttributes();
    fetchCategories();
  }, []);

  const handleAddRow = () => {
    setNewAttributes([
      ...newAttributes,
      { name: "", input_type: "", input_values: "", category: "", status: "" },
    ]);
  };

 // Handle input changes
 const handleInputChange = (index, field, value) => {
  setNewAttributes((prev) => {
    const updatedAttributes = [...prev];
    updatedAttributes[index][field] = value;

    return updatedAttributes;
  });
};

const handleSave = async () => {
  const categoryID = newAttributes[0]?.category;

  if (!categoryID) {
    alert("Category must be selected for all attributes.");

    return;
  }

  const isValid = newAttributes.every(
    (attr) => attr.name && attr.input_type && attr.input_values && attr.status
  );

  if (!isValid) {
    alert("All fields must be filled out.");

    return;
  }

  const payload = {
    category: categoryID,
    attributes: newAttributes.map((attr) => ({
      name: attr.name,
      input_type: attr.input_type,
      input_values: attr.input_values,
      status: attr.status,
    })),
  };

  try {
    const response = await axios.post(
      "https://spinryte.in/draw/api/Category/create_attribute",
      payload
    );
    if (response.data.status) {
      fetchAttributes();
      setIsAddItemView(false);
    } else {
      console.error("Failed to save attributes:", response.data.message);
    }
  } catch (error) {
    console.error("Error saving attributes:", error);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  const showMessage = msg => {
    setMessage(msg)
    setOpenSnackbar(true)
  }

  const handleDelete = async (id) => {
    try {
      const response = await axios.post(
        "https://spinryte.in/draw/api/Category/attribute_delete",
        { id }
      );
      if (response.data.status) {
        setRows((prevRows) => prevRows.filter((row) => row.id !== id));
        showMessage('Item deleted successfully')
      } else {
        showMessage('Failed to delete item');
      }
    } catch (error) {
      console.error("Error while calling the delete API:", error);
      showMessage('Error deleting item')
    }
  };

  const handleEdit = (id) => {
    const selectedRow = rows.find((row) => row.id === id);
    if (selectedRow) {
      setEditData({ ...selectedRow }); // Ensure a copy is made to avoid direct state mutation
      setOpenEditDialog(true);
    }
  };

  // Handle deleting a row
  const handleDeleteRow = (index) => {
    setNewAttributes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveEdit = async () => {
    if (!editData) return; // Ensure editData is set

    const payload = {
      id: editData.id,
      category_id: editData.category_id,
      name: editData.name,
      input_type: editData.input_type,
      input_values: editData.input_values,
      status: editData.status,
    };

    try {
      const response = await axios.post(
        "https://spinryte.in/draw/api/Category/attribute_update",
        payload
      );
      if (response.data.status) {
        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === editData.id ? { ...row, ...editData } : row
          )
        );
        setOpenEditDialog(false); // Close dialog on success
        showMessage("Attribute updated successfully");
      } else {
        showMessage(`Failed to update attribute: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error updating attribute:", error);
      showMessage("Error updating attribute");
    }
  };

  const renderAddItemView = () => (
    <Box
      component={Paper}
      sx={{
        padding: 4,
        backgroundColor: "#f9f9f9",
        borderRadius: 2,
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#333" }}>
          Add Attributes
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#ffbd03",
              "&:hover": { backgroundColor: "#e0a702" },
            }}
            onClick={() => setIsAddItemView(false)}
          >
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{ "&:hover": { backgroundColor: "#1a73e8" } }}
            onClick={handleSave}
          >
            Save
          </Button>
        </Box>
      </Box>

      <hr />

      {/* Category Selection Section */}
      <Box sx={{ marginTop: 4 }}>
        <Typography variant="h6" sx={{ marginBottom: 1, fontWeight: 500 }}>
          Category:
        </Typography>
        <FormControl fullWidth sx={{ maxWidth: 400 }}>
          <Select
            value={newAttributes[0]?.category || ""}
            onChange={(e) => {
              const selectedCategory = e.target.value;
              setNewAttributes((prev) =>
                prev.map((attr) => ({
                  ...attr,
                  category: selectedCategory,
                }))
              );
            }}
            displayEmpty
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 200,
                  overflowY: "auto",
                },
              },
            }}
          >
            <MenuItem
              value=""
              disabled
              sx={{ color: "#9e9e9e", fontStyle: "italic" }}
            >
              Select Category
            </MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Attributes Table Section */}
      <Grid container spacing={3} sx={{ marginTop: 6 }}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end" marginBottom={2}>
            <Button
              variant="contained"
              color="info"
              onClick={handleAddRow}
              startIcon={<AddIcon />}
              sx={{
                fontWeight: 500,
                "&:hover": { backgroundColor: "#0288d1" },
              }}
            >
              New
            </Button>
          </Box>
          <TableContainer
            component={Paper}
            sx={{
              boxShadow: "none",
              border: "1px solid #ddd",
              borderRadius: 2,
            }}
          >
            <Table>
              <TableHead>
                <TableRow
                  sx={{ backgroundColor: "#eaeaea", "& th": { fontWeight: "bold" } }}
                >
                  <TableCell>Attribute Name</TableCell>
                  <TableCell>Input Type</TableCell>
                  <TableCell>Values</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {newAttributes.map((attr, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      "&:hover": { backgroundColor: "#f7f7f7" },
                    }}
                  >
                    <TableCell>
                      <TextField
                        fullWidth
                        value={attr.name}
                        onChange={(e) => handleInputChange(index, "name", e.target.value)}
                        placeholder="Enter Attribute Name"
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <FormControl fullWidth>
                        <Select
                          value={attr.input_type}
                          onChange={(e) =>
                            handleInputChange(index, "input_type", e.target.value)
                          }
                          displayEmpty
                          size="small"
                        >
                          <MenuItem value="Dropdown">Dropdown</MenuItem>
                          <MenuItem value="Radio button">Radio button</MenuItem>
                          <MenuItem value="Text box">Text box</MenuItem>
                          <MenuItem value="Date picker">Date picker</MenuItem>
                          <MenuItem value="Time picker">Time picker</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        value={attr.input_values}
                        onChange={(e) =>
                          handleInputChange(index, "input_values", e.target.value)
                        }
                        placeholder="Enter Values"
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <FormControl fullWidth>
                        <Select
                          value={attr.status}
                          onChange={(e) =>
                            handleInputChange(index, "status", e.target.value)
                          }
                          displayEmpty
                          size="small"
                        >
                          <MenuItem value="1">Active</MenuItem>
                          <MenuItem value="2">Inactive</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleDeleteRow(index)}
                        sx={{
                          color: "red",
                          "&:hover": { color: "darkred" },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );


  const renderAttributeList = () => (
    <TableContainer component={Paper} sx={{ boxShadow: 0, backgroundColor: "#f9f9f9" }}>
    <Table>
      <TableHead>
        <TableRow sx={{ backgroundColor: "#eaeaea" }}>
          {["SL No", "Attribute Name", "Value Type", "Values", "Category", "Status", "Action"].map((header) => (
            <TableCell
              key={header}
              align={header === "Action" || header === "Status" || header === "Category" ? "center" : "left"}
              sx={{ fontWeight: "bold", color: "#333", borderBottom: "none" }}
            >
              <Typography variant="subtitle2">{header}</Typography>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, index) => (
          <TableRow
            key={index}
            sx={{
              "&:hover": { backgroundColor: "#f1f1f1" },
              borderBottom: "none",
            }}
          >
            <TableCell>
              <Typography variant="body2">{index + 1}</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2">{row.name}</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2">{row.input_type}</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2">{row.input_values}</Typography>
            </TableCell>
            <TableCell align="center">
              <Typography variant="body2">{row.category_name}</Typography>
            </TableCell>
            <TableCell align="center">
              <Typography variant="body2">{row.status}</Typography>
            </TableCell>
            <TableCell align="center">
              <IconButton
                onClick={() => handleEdit(row.id)}
                title="Edit"
                sx={{ color: "blue", "&:hover": { color: "darkblue" } }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                onClick={() => {
                  handleDelete(row.id);
                  setOpenSnackbar(true); // Open Snackbar
                }}
                title="Delete"
                sx={{ color: "red", "&:hover": { color: "darkred" } }}
              >
                <DeleteIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
  );

  return (
    <div>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginBottom={2}
      >
        <h1 style={{ margin: 0 }}>{isAddItemView ? "" : "Attribute List"}</h1>
        {!isAddItemView && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsAddItemView(true)}
          >
            Add Item
          </Button>
        )}
      </Box>
      {isAddItemView ? renderAddItemView() : renderAttributeList()}

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} fullWidth maxWidth="sm">
  <DialogTitle>Edit Attribute</DialogTitle>
  <DialogContent>
    <Box display="flex" flexDirection="column" gap={2}>
      <TextField
        label="Attribute Name"
        value={editData?.name || ""}
        onChange={(e) =>
          setEditData((prev) => ({ ...prev, name: e.target.value }))
        }
      />
      <FormControl fullWidth>
        <InputLabel>Input Type</InputLabel>
        <Select
          value={editData?.input_type || ""}
          onChange={(e) =>
            setEditData((prev) => ({ ...prev, input_type: e.target.value }))
          }
        >
          <MenuItem value="Dropdown">Dropdown</MenuItem>
          <MenuItem value="Radio button">Radio button</MenuItem>
          <MenuItem value="Text box">Text box</MenuItem>
          <MenuItem value="Date picker">Date picker</MenuItem>
          <MenuItem value="Time picker">Time picker</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Input Values"
        value={editData?.input_values || ""}
        onChange={(e) =>
          setEditData((prev) => ({ ...prev, input_values: e.target.value }))
        }
      />
      <FormControl fullWidth>
        <InputLabel>Category</InputLabel>
        <Select
          value={editData?.category_id || ""}
          onChange={(e) =>
            setEditData((prev) => ({ ...prev, category_id: e.target.value }))
          }
        >
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth>
  <InputLabel>Status</InputLabel>
  <Select
    value={editData?.status || ""} // Use nullish coalescing to handle undefined/null
    onChange={(e) =>
      setEditData((prev) => ({ ...prev, status: e.target.value }))
    }
  >
    <MenuItem value="1">Active</MenuItem>
    <MenuItem value="2">Inactive</MenuItem>
  </Select>
</FormControl>
    </Box>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
    <Button variant="contained" onClick={handleSaveEdit}>
      Save
    </Button>
  </DialogActions>
</Dialog>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <MuiAlert elevation={6} variant='filled' onClose={handleCloseSnackbar} severity='success'>
         {message}
        </MuiAlert>
      </Snackbar>
    </div>
  );
};

export default Attribute;

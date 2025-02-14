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
  Snackbar,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import axios from "axios";


const Attribute = () => {
  const [rows, setRows] = useState([]); // List of attributes
  const [isViewPage, setIsViewPage] = useState(false); // Toggle for view page
  const [viewData, setViewData] = useState([]); // Data for view page
  const [categoryName, setCategoryName] = useState(""); // Store category name
  const [loading, setLoading] = useState(false); // Loading state for API calls
  const [openSnackbar, setOpenSnackbar] = useState(false); // Snackbar state
  const [message, setMessage] = useState("");
  const [isEditPage, setIsEditPage] = useState(false); // Toggle for edit page
  const [severity, setSeverity] = useState("success");
  const [categories, setCategories] = useState([]);
  const [isAddFormVisible, setIsAddFormVisible] = useState(false);
  const [categoryId, setCategoryId] = useState(null);


  const [newAttribute, setNewAttribute] = useState({
    name: "",
    input_type: "",
    input_values: "",
    status: "",
  });

  const [editData, setEditData] = useState({
    name: '',
    input_type: '',
    input_values: '',
    status: '',
    category_id: '', // Make sure category_id is initialized
  });


  const fetchAttributes = async () => {
    try {
      const response = await axios.get(
        "https://spinryte.in/draw/api/Attributes/attributeList"
      );

      if (response.data?.dataList) {
        setRows(response.data.dataList);
      } else {
        console.error("Invalid response format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching attributes:", error);
      showMessage("Failed to fetch attributes", "error");
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  // Fetch the categories when the component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("https://spinryte.in/draw/api/Category/categoryList");
        const data = await response.json();
        setCategories(data.categories); // Assuming the API returns a list of categories
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);


  const handleCloseSnackbar = () => setOpenSnackbar(false);

  const showMessage = (msg, severity = "success") => {
    setMessage(msg);
    setSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleSaveEdit = async () => {
    if (!editData) return;

    const payload = {
      id: editData.id, // Attribute ID
      category_id: editData.category_id, // Category ID
      name: editData.name, // Attribute name
      input_type: editData.input_type, // Input type (e.g., Dropdown, Radio button)
      input_values: editData.input_values, // Values for the attribute
      status: editData.status, // Status (e.g., 1 for active, 2 for inactive)
    };

    console.log("Payload being sent to API:", payload);

    try {
      const response = await axios.post(
        "https://spinryte.in/draw/api/Attributes/attribute_update",
        payload
      );

      console.log("API Response:", response.data);

      if (response.data.status) {
        // Update local state to reflect the changes
        setViewData((prev) =>
          prev.map((item) =>
            item.id === editData.id ? { ...item, ...editData } : item
          )
        );

        // Exit edit page and show success message
        setIsEditPage(false);
        showMessage("Attribute updated successfully");
      } else {
        // Handle unsuccessful update
        console.error("API Update Failed:", response.data.message);
        showMessage(`Failed to update attribute: ${response.data.message}`, "error");
      }
    } catch (error) {
      console.error("Error during API call:", error);
      showMessage("Error updating attribute", "error");
    }
  };

const handleDelete = async (id) => {
  try {
    const response = await axios.post(
      "https://spinryte.in/draw/api/Category/attribute_delete",
      { id }
    );
    console.log("Delete Response:", response.data); // Log API response
    if (response.data.status) {
      setRows((prevRows) => prevRows.filter((row) => row.id !== id));
      showMessage("Item deleted successfully");
    } else {
      showMessage("Failed to delete item");
    }
  } catch (error) {
    console.error("Error while calling the delete API:", error);
    showMessage("Error deleting item");
  }
};

  const handleEditClick = (item) => {
    setEditData({
      id: item.id,
      category_id: item.category_id,
      name: item.name,
      input_type: item.input_type,
      input_values: item.input_values,
      status: item.status || "1", // Default to "1" (Active) if status is missing
    });
    setIsEditPage(true);
  };

  const handleViewClick = async (categoryId) => {
    setLoading(true);

    try {
      const selectedCategory = rows.find((row) => row.id === categoryId);

      if (selectedCategory) {
        setCategoryName(selectedCategory.name);
        setCategoryId(selectedCategory.id); // Ensure categoryId is updated
      }

      // Fetch attributes data for the category
      const response = await axios.get(
        `https://spinryte.in/draw/api/Attributes/SingleAttribute/${categoryId}`
      );

      if (response.data.status && response.data.attributes.length) {
        setViewData(response.data.attributes);
        setIsViewPage(true);
      } else {
        showMessage("No data found for the selected attribute.", "info");
        setViewData([]);
      }
    } catch (error) {
      console.error("Error fetching view data:", error);
      showMessage("Failed to fetch data. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };


  const handleAddAttribute = async () => {
    try {
      // Ensure categoryId is a valid ID and newAttribute has all required fields
      if (!categoryId) {
        showMessage("Category ID is not available. Please try again.", "warning");

        return;
      }

      if (
        !newAttribute.name ||
        !newAttribute.input_type ||
        !newAttribute.input_values ||
        !newAttribute.status
      ) {
        showMessage("Please fill in all attribute fields.", "warning");

        return;
      }

      // Prepare payload for the API request
      const payload = {
        category: categoryId, // Use categoryId instead of categoryName
        attributes: [
          {
            name: newAttribute.name,
            input_type: newAttribute.input_type,
            input_values: newAttribute.input_values,
            status: newAttribute.status,
          },
        ],
      };

      // Make the API call
      const response = await axios.post(
        "https://spinryte.in/draw/api/Category/create_attribute",
        payload
      );

      // Check response status
      if (response.data && response.data.status) {
        // Update the local state with the new attribute
        setViewData((prevData) => [
          ...prevData,
          { id: Date.now(), ...newAttribute }, // Add mock `id` if not returned by the API
        ]);

        // Notify the user of success
        showMessage("Attribute added successfully!", "success");

        // Reset the form and close the 'Add Attribute' form
        setIsAddFormVisible(false);
        setNewAttribute({ name: "", input_type: "", input_values: "", status: "" });
      } else {
        // Handle API failure response
        showMessage(
          response.data?.message || "Failed to add attribute. Please try again.",
          "error"
        );
      }
    } catch (error) {
      // Handle unexpected errors
      console.error("Error adding attribute:", error);
      showMessage(
        error.response?.data?.message || "An error occurred. Please try again later.",
        "error"
      );
    }
  };

  const renderViewPage = () => (
    <Box>
      {/* Add Attribute Form */}
      <Box
        style={{
          padding: "16px",
          maxWidth: "600px",
          margin: "auto",
          marginBottom: "32px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          backgroundColor: "#f7f7f7",
        }}
      >
        <Typography variant="h6" style={{ marginBottom: "16px" }}>
          Add New Attribute
        </Typography>
        <TextField
          fullWidth
          label="Attribute Name"
          value={newAttribute.name}
          onChange={(e) => setNewAttribute({ ...newAttribute, name: e.target.value })}
          style={{ marginBottom: "16px" }}
        />
        <TextField
          fullWidth
          select
          label="Input Type"
          value={newAttribute.input_type}
          onChange={(e) => setNewAttribute({ ...newAttribute, input_type: e.target.value })}
          style={{ marginBottom: "16px" }}
        >
          <MenuItem value="Dropdown">Dropdown</MenuItem>
          <MenuItem value="Radio button">Radio button</MenuItem>
          <MenuItem value="Text box">Text box</MenuItem>
          <MenuItem value="Date picker">Date picker</MenuItem>
          <MenuItem value="Time picker">Time picker</MenuItem>
        </TextField>
        <TextField
          fullWidth
          label="Input Values (comma-separated)"
          value={newAttribute.input_values}
          onChange={(e) => setNewAttribute({ ...newAttribute, input_values: e.target.value })}
          style={{ marginBottom: "16px" }}
        />
        <FormControl fullWidth style={{ marginBottom: "16px" }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={newAttribute.status}
            onChange={(e) => setNewAttribute({ ...newAttribute, status: e.target.value })}
          >
            <MenuItem value="1">Active</MenuItem>
            <MenuItem value="2">Inactive</MenuItem>
          </Select>
        </FormControl>
        <Box style={{ textAlign: "right" }}>
          <Button
            onClick={() => handleAddAttribute()}
            variant="contained"
            style={{
              backgroundColor: "#4caf50",
              color: "#fff",
              marginRight: "8px",
            }}
          >
            Save
          </Button>
          <Button
            onClick={() => clearForm()}
            variant="outlined"
            style={{
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Clear
          </Button>
        </Box>
      </Box>

      {/* Attribute List Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                colSpan={6}
                style={{
                  fontWeight: 600,
                  fontSize: "1.25rem",
                  textAlign: "center",
                  backgroundColor: "#f7f7f7",
                  borderBottom: "1px solid #ddd",
                  padding: "16px",
                }}
              >
                {categoryName || "Category Name"}
              </TableCell>
            </TableRow>
            <TableRow style={{ backgroundColor: "#f9f9f9" }}>
              <TableCell style={{ fontWeight: 500 }}>SL No</TableCell>
              <TableCell style={{ fontWeight: 500 }}>Attribute Name</TableCell>
              <TableCell style={{ fontWeight: 500 }}>Input Type</TableCell>
              <TableCell style={{ fontWeight: 500 }}>Values</TableCell>
              <TableCell style={{ fontWeight: 500 }}>Status</TableCell>
              <TableCell style={{ fontWeight: 500, textAlign: "center" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} style={{ textAlign: "center" }}>
                  <Typography>Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : viewData.length ? (
              viewData.map((item, index) => (
                <TableRow key={index} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.input_type}</TableCell>
                  <TableCell>{item.input_values}</TableCell>
                  <TableCell>{item.status}</TableCell>
                  <TableCell style={{ textAlign: "center" }}>
                    <Button
                      variant="outlined"
                      size="small"
                      style={{
                        borderColor: "#1976d2",
                        color: "#1976d2",
                        textTransform: "none",
                        fontWeight: 400,
                        padding: "4px 12px",
                        marginRight: "8px",
                      }}
                      onClick={() => handleEditClick(item)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      style={{
                        borderColor: "#d32f2f",
                        color: "#d32f2f",
                        textTransform: "none",
                        fontWeight: 400,
                        padding: "4px 12px",
                      }}
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} style={{ textAlign: "center" }}>
                  <Typography>No data available</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Back Button */}
      <Box style={{ marginTop: "16px", textAlign: "left" }}>
        <Button
          onClick={() => setIsViewPage(false)}
          variant="contained"
          style={{
            backgroundColor: "#1976d2",
            color: "#fff",
            textTransform: "none",
            fontWeight: 500,
          }}
        >
          Back
        </Button>
      </Box>
    </Box>
  );

  const renderAddAttributeForm = () => (
    <Box sx={{ padding: 4, maxWidth: 600, margin: "auto" }}>
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        Add New Attribute
      </Typography>
      <TextField
        fullWidth
        label="Attribute Name"
        value={newAttribute.name || ""}
        onChange={(e) => setNewAttribute({ ...newAttribute, name: e.target.value })}
        error={!newAttribute.name}
        helperText={!newAttribute.name ? "Attribute Name is required" : ""}
        sx={{ marginBottom: 2 }}
      />
      <TextField
        fullWidth
        select
        label="Input Type"
        value={newAttribute.input_type || ""}
        onChange={(e) => setNewAttribute({ ...newAttribute, input_type: e.target.value })}
        error={!newAttribute.input_type}
        helperText={!newAttribute.input_type ? "Please select an input type" : ""}
        sx={{ marginBottom: 2 }}
      >
        {["Dropdown", "Radio button", "Text box", "Date picker", "Time picker"].map((type) => (
          <MenuItem key={type} value={type}>
            {type}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        fullWidth
        label="Input Values (comma-separated)"
        value={newAttribute.input_values || ""}
        onChange={(e) => setNewAttribute({ ...newAttribute, input_values: e.target.value })}
        helperText="Enter values separated by commas (e.g., Red,Green,Blue)"
        sx={{ marginBottom: 2 }}
      />
      <FormControl fullWidth sx={{ marginBottom: 2 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={newAttribute.status || ""}
          onChange={(e) => setNewAttribute({ ...newAttribute, status: e.target.value })}
          error={!newAttribute.status}
        >
          <MenuItem value="1">Active</MenuItem>
          <MenuItem value="2">Inactive</MenuItem>
        </Select>
        {!newAttribute.status && (
          <Typography variant="caption" color="error">
            Status is required
          </Typography>
        )}
      </FormControl>
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button
          onClick={() => handleAddAttribute()}
          variant="contained"
          color="success"
          sx={{ textTransform: "none" }}
        >
          Save
        </Button>
        <Button
          onClick={() => setIsAddFormVisible(false)}
          variant="outlined"
          sx={{ textTransform: "none" }}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );

  const renderEditPage = () => (
    <Box
      sx={{
        maxWidth: 600,
        margin: "0 auto",
        padding: "24px",
        borderRadius: "8px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#fff",
      }}
    >
      <Typography
        variant="h5"
        gutterBottom
        sx={{ fontWeight: 600, textAlign: "center", marginBottom: "16px" }}
      >
        Edit Attribute
      </Typography>
      <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Attribute Name */}
        <TextField
          label="Attribute Name"
          variant="outlined"
          value={editData?.name || ""}
          onChange={(e) =>
            setEditData((prev) => ({ ...prev, name: e.target.value }))
          }
          fullWidth
        />

        {/* Input Type */}
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

        {/* Input Values */}
        <TextField
          label="Input Values"
          variant="outlined"
          value={editData?.input_values || ""}
          onChange={(e) =>
            setEditData((prev) => ({ ...prev, input_values: e.target.value }))
          }
          fullWidth
        />

        {/* Status */}
        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            value={editData?.status || ""}
            onChange={(e) =>
              setEditData((prev) => ({ ...prev, status: e.target.value }))
            }
          >
            <MenuItem value="1">Active</MenuItem>
            <MenuItem value="2">Inactive</MenuItem>
          </Select>
        </FormControl>

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "16px",
          }}
        >
          <Button
            onClick={() => setIsEditPage(false)}
            variant="outlined"
            color="secondary"
            sx={{
              textTransform: "none",
              fontWeight: 500,
              padding: "8px 24px",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            color="primary"
            sx={{
              textTransform: "none",
              fontWeight: 500,
              padding: "8px 24px",
            }}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Box>
  );


  const renderAttributeList = () => (
    <TableContainer
      component={Paper}
      elevation={0}
      style={{
        border: "1px solid #ddd", // Light gray border
        borderRadius: "8px", // Rounded corners
        overflow: "hidden", // To clip any overflow
      }}
    >
      <Table>
        <TableHead>
          {/* Header row for the table title */}
          <TableRow>
            <TableCell
              colSpan={3}
              style={{
                fontWeight: 600,
                fontSize: "1.25rem",
                textAlign: "center",
                backgroundColor: "#f7f7f7",
                borderBottom: "1px solid #ddd",
                padding: "16px",
              }}
            >
              Attribute List
            </TableCell>
          </TableRow>
          {/* Column headers */}
          <TableRow style={{ backgroundColor: "#f9f9f9" }}>
            <TableCell style={{ fontWeight: 500 }}>SL No</TableCell>
            <TableCell style={{ fontWeight: 500 }}>Category</TableCell>
            <TableCell style={{ fontWeight: 500, textAlign: "center" }}>
              Action
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
  {rows.length ? (
    rows.map((row, index) => (
      <TableRow key={index} hover>
        <TableCell>{index + 1}</TableCell>
        <TableCell>{row.name}</TableCell>
        <TableCell style={{ textAlign: "center" }}>
          <Button
            variant="outlined"
            size="small"
            style={{
              borderColor: "#1976d2",
              color: "#1976d2",
              textTransform: "none",
              fontWeight: 400,
              padding: "4px 12px",
            }}
            onClick={() => handleViewClick(row.id)}
          >
            View
          </Button>
        </TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={3} style={{ textAlign: "center" }}>
        <Typography>No attributes available</Typography>
      </TableCell>
    </TableRow>
  )}
</TableBody>
      </Table>
    </TableContainer>
  );




  return (
    <Box style={{ padding: "16px" }}>
    <Snackbar
      open={openSnackbar}
      autoHideDuration={3000}
      onClose={handleCloseSnackbar}
    >
      <MuiAlert
        onClose={handleCloseSnackbar}
        severity={severity}
        sx={{ width: "100%" }}
      >
        {message}
      </MuiAlert>
    </Snackbar>

    {isAddFormVisible && renderAddAttributeForm()}
    {!isAddFormVisible && isViewPage && renderViewPage()}
    {!isAddFormVisible && isEditPage && renderEditPage()}

    {!isAddFormVisible && !isViewPage && !isEditPage && (
     <Box>
     <TableContainer
       component={Paper}
       elevation={0}
       style={{
         border: "1px solid #ddd",
         borderRadius: "8px",
         overflow: "hidden",
       }}
     >
       <Table>
         <TableHead>
           <TableRow>
             <TableCell
               colSpan={3}
               style={{
                 fontWeight: 600,
                 fontSize: "1.25rem",
                 textAlign: "center",
                 backgroundColor: "#f7f7f7",
                 borderBottom: "1px solid #ddd",
                 padding: "16px",
               }}
             >
               Attribute List
             </TableCell>
           </TableRow>
           <TableRow style={{ backgroundColor: "#f9f9f9" }}>
             <TableCell style={{ fontWeight: 500 }}>SL No</TableCell>
             <TableCell style={{ fontWeight: 500 }}>Category Name</TableCell>
             <TableCell style={{ fontWeight: 500, textAlign: "center" }}>Actions</TableCell>
           </TableRow>
         </TableHead>
         <TableBody>
           {rows.length ? (
             rows.map((row, index) => (
               <TableRow key={row.id} hover>
                 <TableCell>{index + 1}</TableCell>
                 <TableCell>{row.name}</TableCell>
                 <TableCell style={{ textAlign: "center" }}>
                   <Button
                     variant="outlined"
                     size="small"
                     style={{
                       borderColor: "#1976d2",
                       color: "#1976d2",
                       textTransform: "none",
                       fontWeight: 400,
                       padding: "4px 12px",
                       marginRight: "8px",
                     }}
                     onClick={() => handleViewClick(row.id)}
                   >
                     View
                   </Button>
                 </TableCell>
               </TableRow>
             ))
           ) : (
             <TableRow>
               <TableCell colSpan={3} style={{ textAlign: "center" }}>
                 <Typography>No data available</Typography>
               </TableCell>
             </TableRow>
           )}
         </TableBody>
       </Table>
     </TableContainer>
   </Box>
    )}
  </Box>
  );

};

export default Attribute;

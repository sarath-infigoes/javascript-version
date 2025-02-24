import React, { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import {TextField, RadioGroup,
FormControlLabel,
Radio} from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import axios from 'axios';
import { Autocomplete, Box, Menu, Snackbar, Typography,Grid,FormControl,Select } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { useFormik } from 'formik';
import IconButton from '@mui/material/IconButton';
import { Edit, Delete } from "@mui/icons-material";


const ProductManagement = () =>{
  const [rows, setRows] = useState([]);
  const [productId, setProductId] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [inputCategory, setInputCategory] = useState('');
  const [statusNumericValue, setStatusNumericValue] = useState(null)
  const [existingImages, setExistingImages] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [openEditImageDialog, setOpenEditImageDialog] = useState(false);
    const [attributes, setAttributes] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
     fetchAttribute();
  }, []);

  const fetchProducts = () => {
    fetch('https://spinryte.in/draw/api/Product/get_productList')
      .then(response => response.json())
      .then(data => {
        if (data && data.status && data.status === true && data.dataList) {
          setRows(data.dataList);
        } else {
          console.error('Error fetching products: Invalid response format');
        }
      })
      .catch(error => {
        console.error('Error fetching products:', error);
      });
  };

  const fetchCategories = () => {
    axios.get('https://spinryte.in/draw/api/Category/categoryList')
      .then(response => {
        if (response.data && response.data.dataList) {
          setCategories(response.data.dataList);
        } else {
          console.error('Error fetching categories: Invalid response format');
        }
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });
  };

  const fetchAttribute = async (categoryId) => {
    if (!categoryId) {
      console.error("Error: categoryId is missing or invalid", categoryId);

      return;
    }

    try {
      console.log("Fetching attributes for categoryId:", categoryId);
      const response = await axios.get(`https://spinryte.in/draw/api/Attributes/FetchAttribute/${categoryId}`);

      console.log("API Response:", response.data);

      if (response.data?.status && response.data?.attributes) {
        setAttributes(response.data.attributes);
      } else {
        setAttributes([]);
        console.error("Invalid API response format:", response.data);
      }
    } catch (error) {
      console.error("API Request Failed:", error.response?.data || error.message);
      setAttributes([]);
    }
  };

  useEffect(() => {
    console.log("Selected Category:", selectedCategory);
    if (selectedCategory) {
      fetchAttribute(selectedCategory);
    } else {
      console.error("Error: selectedCategory is missing");
    }
  }, [selectedCategory]);


  const [openDialog, setOpenDialog] = useState(false);
  const [editItemId, setEditItemId] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [message, setMessage] = useState('');
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
  const [openAddImageDialog, setOpenAddImageDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDeleteClick = (id) => {
    setOpenDeleteDialog(true);
    setEditingItemId(id);
  };

  const handleDeleteConfirm = async () => {
    if (editingItemId) {
      try {
        const response = await axios.post(`https://spinryte.in/draw/api/Product/product_delete`, { id: editingItemId });

        if (response) {
          setRows((prevRows) => prevRows.filter((row) => row.id !== editingItemId));
          setEditingItemId(null);
          setOpenDeleteDialog(false);
          showMessage('Item deleted successfully');
        } else {
          showMessage('Failed to delete item');
        }
      } catch (error) {
        console.error('Error deleting item:', error.message);
        showMessage('Error deleting item');
      }
    }
  };

  const formik = useFormik({
    initialValues: {
      id: '',
      name: '',
      description: '',
      price: '',
      status: '',
      category: '',
      productImage: [], // Ensure this is an empty array
      attributes: {}, // Store attribute values as an object { id: value }
    },

    onSubmit: async (values) => {
      console.log("Submitting form values:", values);

       const formattedAttributes = Object.keys(values.attributes).map((atr_id) => ({
         id: Number(atr_id), // Ensure correct attribute ID
         input_values: values.attributes[atr_id] || "", // Ensure correct input value
       }));

      const productData = {
        id: editItemId || "", // Ensure correct ID for edit case
        name: values.name,
        description: values.description,
        price: values.price,
        category: selectedCategory || values.category, // Ensure category is set correctly
        status: values.status === "Active" ? "1" : "2",
        attributes: formattedAttributes, // Ensure attributes are correctly structured
      };

      console.log("Final product data being sent:", productData);
      console.log("Edit item ID:", editItemId);

      try {
        let response;
        if (editItemId) {
          response = await axios.post(
            `https://spinryte.in/draw/api/Product/update_product/${editItemId}`,
            productData
          );
          console.log("Update response:", response.data);
          showMessage("Product Updated successfully");
        } else {
          response = await axios.post(
            "https://spinryte.in/draw/api/Product/create_product",
            productData
          );
          console.log("Create response:", response.data);
          showMessage("Product Added successfully");

          const newProductId = response.data.output?.product_id;
          if (newProductId) {
            associateImagesWithProduct(newProductId);
            setOpenAddImageDialog(true);
          }
        }

        handleDialogClose();
        fetchProducts();
      } catch (error) {
        console.error("Error adding/updating product:", error.response?.data || error.message);
        showMessage("Product Add/Update Failed");
      }
    },
  });

  const handleAttributeChange = (attributeId, value) => {
    formik.setValues((prevValues) => ({
      ...prevValues,
      attributes: {
        ...prevValues.attributes,
        [attributeId]: value, // Store value using attribute ID as key
      },
    }));
  };

  const handleDialogClose = () => {
    setEditItemId(null);
    setOpenDialog(false);
    formik.resetForm();
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleStatusMenuOpen = (event) => {
    setStatusMenuAnchor(event.currentTarget);
  };

  const handleAddImage = () => {
    if (formik.values.productImage.length < 5) {
      formik.setValues((prevValues) => ({
        ...prevValues,
        productImage: [...prevValues.productImage, '']
      }));
    } else {
      showMessage('Maximum 5 images allowed.');
    }
  };

  const handleUploadClick = () => {
    const imagesToUpload = formik.values.productImage.filter(image => image instanceof File);

    if (imagesToUpload.length > 0) {
      const formData = new FormData();

      // Append images correctly
      imagesToUpload.forEach((productImage, index) => {
        formData.append(`images[]`, productImage); // ✅ Corrected Syntax
      });

      formData.append('product_id', editItemId); // Ensure this is correct

      axios.post("https://spinryte.in/draw/api/Product/image_upload", formData)
        .then(response => {
          showMessage('Images uploaded successfully');
          setOpenAddImageDialog(false);
          fetchProducts(); // ✅ Ensure this updates the product list
        })
        .catch(error => {
          console.error('Error uploading images:', error);
          showMessage('Error uploading images');
        });
    } else {
      showMessage('No images selected for upload');
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    formik.setFieldValue("productImage", [...(formik.values.productImage || []), ...files]);
  };

  const handleImageChange = (imageUrl, index) => {
    console.log(imageUrl)
    console.log(index)
  };

  const associateImagesWithProduct = (productId) => {
    setProductId(productId);
    const imagesToUpload = formik.values.productImage.filter(productImage => typeof productImage === 'object');
    if (imagesToUpload.length > 0) {
      const formData = new FormData();
      imagesToUpload.forEach((productImage, index) => {
        formData.append('images', productImage);
      });
      formData.append('product_id', productId);
      axios.post(`https://spinryte.in/draw/api/Product/image_upload`, formData)
        .then(response => {
          showMessage('Images Uploaded ');
          setOpenAddImageDialog(false)
        })
        .catch(error => {
          console.error('Error uploading images:', error);
          showMessage('Error uploading images');
        });
    }
  };
console.log (productId)

const handleImageSelection = (index) => {
  const updatedImages = formik.values.productImage.map((image, i) => ({
    ...image,
    selected: i === index,
  }));
  formik.setValues((prevValues) => ({
    ...prevValues,
    productImage: updatedImages,
  }));
};


  const handleCategorySearch = (inputValue) => {
    axios.get(`https://spinryte.in/draw/api/Category/categoryList?name=${inputValue}`)
      .then(response => {
        if (response.data && response.data.dataList) {
          setCategories(response.data.dataList);
        } else {
          console.error('Error fetching categories: Invalid response format');
        }
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });
  };



  const handleCategorySelect = async (categoryId) => {
    setSelectedCategory(categoryId);
    formik.setFieldValue("category", categoryId); // Ensure category is updated in Formik

    try {
      const response = await axios.get(`https://spinryte.in/draw/api/Attributes/FetchAttribute/${categoryId}`);

      if (response.data && response.data.status) {
        const fetchedAttributes = response.data.attributes || [];

        // Ensure input_values are formatted correctly
        const processedAttributes = fetchedAttributes.map(attr => ({
          ...attr,
          input_values: typeof attr.input_values === "string"
            ? attr.input_values.split(",")
            : Array.isArray(attr.input_values)
            ? attr.input_values
            : [],
        }));

        // Initialize formik attributes state
        const initialAttributes = {};
        processedAttributes.forEach(attr => {
          initialAttributes[attr.id] = ""; // Default empty value
        });

        setAttributes(processedAttributes);
        await formik.setFieldValue("attributes", initialAttributes); // Ensure Formik updates correctly
      } else {
        console.error("No attributes found for this category");
        setAttributes([]);
        await formik.setFieldValue("attributes", {}); // Reset attributes
      }
    } catch (error) {
      console.error("Error fetching attributes:", error.response?.data || error.message);
      setAttributes([]);
      await formik.setFieldValue("attributes", {}); // Reset attributes on error
    }
  };

  const handleStatusMenuClose = (value) => {
    formik.setFieldValue("status", value);
    setStatusMenuAnchor(null);
  };

  const handleEditClick = async (productId) => {
    try {
      const response = await axios.get(`https://spinryte.in/draw/api/Product/single_view/${productId}`);
      const productDetails = response.data;

      if (productDetails && productDetails.dataList) {
        const {
          id, name, description, price, created_at, status,
          category_id, attributes, product_images
        } = productDetails.dataList;

        // Fetch attributes based on the selected category
        const attrResponse = await axios.get(`https://spinryte.in/draw/api/Attributes/FetchAttribute/${category_id}`);
        const fetchedAttributes = attrResponse.data.attributes || [];

        // Map attributes
        const attributeValues = {};
        fetchedAttributes.forEach(attr => {
          const productAttr = attributes.find(pa => pa.id === attr.id);
          attributeValues[attr.id] = productAttr?.input_values || attr.input_values[0] || "";
        });

        // Set form values including images
        formik.setValues({
          id,
          name,
          description,
          price,
          created_at: created_at || '',
          status: status === 'Active' ? 1 : 2,
          category: category_id,
          productImage: product_images.map(image => ({ id: image.id, url: image.image })), // Set images
          attributes: attributeValues,
        });

        // Store product images separately for the edit image UI
        setExistingImages(product_images.map(image => ({ id: image.id, url: image.image })));

        // Open Image Edit Dialog first
        setEditItemId(id);
        setOpenEditImageDialog(true); // Open Edit Image Section First
        setSelectedCategory(category_id);
        setOpenDialog(true);
        setAttributes(fetchedAttributes);
      } else {
        showMessage("Error fetching product details: Product details not found");
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      showMessage("Error fetching product details");
    }
  };


  const placeholderImage = 'https://dummyimage.com/600x400/000/fff';

  const removeImage = async (imageId, index) => {
    if (!imageId) {
      // If no imageId, it's a new (unsaved) image, just remove it from UI
      formik.setFieldValue(
        "productImage",
        formik.values.productImage.filter((_, i) => i !== index)
      );

      return;
    }

    try {
      console.log("Removing image ID:", imageId); // Debugging

      const response = await axios.post("https://spinryte.in/draw/api/Product/remove_image", {
        id: imageId, // Ensure correct request format
      });

      console.log("API Response:", response.data);

      if (response.data.status) {
        showMessage("Image removed successfully");
        formik.setFieldValue(
          "productImage",
          formik.values.productImage.filter((_, i) => i !== index)
        );
      } else {
        showMessage("Failed to remove image from server.");
      }
    } catch (error) {
      console.error("Error removing image:", error);
      showMessage("Error removing image. Please try again.");
    }
  };

  const handleSearchChange = (event) => {
    const { value } = event.target;
    setSearchQuery(value);


    axios.get(`https://spinryte.in/draw/api/Product/get_productList?name=${value}`)
      .then(response => {
        if (response.data && response.data.status && response.data.dataList) {
          // Filter the rows based on the search query
          const filteredRows = response.data.dataList.filter(row => row.name.toLowerCase().includes(value.toLowerCase()));
          setRows(filteredRows);
        } else {
          console.error('Error fetching products: Invalid response format');
        }
      })
      .catch(error => {
        console.error('Error fetching products:', error);
      });
  };

  return (
    <div style={{ margin: '20px', marginLeft: 'auto', marginRight: 'auto' }}>
       <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2, overflow: "hidden", p: 2 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
      <Typography variant="h5" fontWeight="bold">Product List</Typography>
        <Button variant="contained" color="primary" onClick={() => setOpenDialog(true)}>
          Add Item
        </Button>
      </div>
      <Table sx={{ minWidth: 750 }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#1976d2", color: "white" }}>
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>SL NO</TableCell>
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>Product Name</TableCell>
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>Description</TableCell>
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>Price</TableCell>
            <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center">Images</TableCell>
            <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center">Status</TableCell>
            <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center">Category</TableCell>
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={index}
              sx={{
                "&:nth-of-type(odd)": { backgroundColor: "#f5f5f5" },
                "&:hover": { backgroundColor: "#e3f2fd" },
              }}
            >
              <TableCell>{index + 1}</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.description}</TableCell>
              <TableCell>${row.price}</TableCell>
              <TableCell align="center">
                <img
                  src={row.image ? row.image : placeholderImage}
                  alt={row.name || "No Image"}
                  style={{ width: "70px", height: "70px", borderRadius: "6px", objectFit: "cover" }}
                />
              </TableCell>
              <TableCell align="center">{row.status}</TableCell>
              <TableCell align="center">{row.category}</TableCell>
              <TableCell>
                <IconButton color="primary" onClick={() => handleEditClick(row.id)}>
                  <Edit />
                </IconButton>
                <IconButton color="error" onClick={() => handleDeleteClick(row.id)}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    <Dialog open={openDialog} onClose={handleDialogClose}>
  <DialogTitle>{editItemId ? "Edit Item" : "Add New Item"}</DialogTitle>
  <DialogContent>
    <Box component={Paper} sx={{ padding: 4, paddingBottom: 8 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box>
            {/* Header Section */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={3} mb={3}>
              <h1 style={{ margin: 0 }}>Add Attributes</h1>
              <Button variant="contained" style={{ backgroundColor: "#FF007F" }} onClick={handleDialogClose}>
                Back to List
              </Button>
            </Box>
            <hr />

            {/* Category Dropdown */}
            <Box mt={1} mb={2}>
              <h1 style={{ fontWeight: "400" }}>Category:</h1>
              <FormControl style={{ width: "500px" }}>
                <Select
                  value={selectedCategory || ""}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                  displayEmpty
                  MenuProps={{
                    PaperProps: { style: { maxHeight: 200, overflowY: "auto" } },
                  }}
                >
                  <MenuItem value="" disabled style={{ color: "#9e9e9e" }}>Select Category</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Dynamic Attributes Form */}
            <Grid container spacing={3}>
              {attributes.length > 0 ? (
                attributes.map((attr) => (
                  <Grid item xs={12} sm={6} key={attr.id}>
                    <FormControl fullWidth>
                      <h3>{attr.name}</h3>

                      {/* Text Box Input */}
                      {attr.input_type === "Text box" && (
                        <TextField
                          placeholder="Enter value"
                          variant="outlined"
                          fullWidth
                          value={formik.values.attributes[attr.id] || ""}
                          onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                        />
                      )}

                      {/* Dropdown Input */}
                      {attr.input_type === "Dropdown" && (
                        <Select
                          value={formik.values.attributes[attr.id] || ""}
                          onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                        >
                          {typeof attr.input_values === "string"
                            ? attr.input_values.split(",").map((value, index) => (
                                <MenuItem key={index} value={value}>{value}</MenuItem>
                              ))
                            : Array.isArray(attr.input_values)
                            ? attr.input_values.map((value, index) => (
                                <MenuItem key={index} value={value}>{value}</MenuItem>
                              ))
                            : null}
                        </Select>
                      )}

                      {/* Radio Button Input */}
                      {attr.input_type === "Radio button" && (
                        <RadioGroup
                          value={formik.values.attributes[attr.id] || ""}
                          onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                        >
                          {typeof attr.input_values === "string"
                            ? attr.input_values.split(",").map((value, index) => (
                                <FormControlLabel key={index} value={value} control={<Radio />} label={value} />
                              ))
                            : Array.isArray(attr.input_values)
                            ? attr.input_values.map((value, index) => (
                                <FormControlLabel key={index} value={value} control={<Radio />} label={value} />
                              ))
                            : null}
                        </RadioGroup>
                      )}

                    {/* Date Picker Input */}
{attr.input_type === "Date picker" && (
  <TextField
    type="date"
    variant="outlined"
    fullWidth
    value={formik.values.attributes[attr.id] || ""}
    onChange={(e) => {
      formik.setFieldValue(`attributes.${attr.id}`, e.target.value);
    }}
  />
)}

{/* Time Picker Input */}
{attr.input_type === "Time picker" && (
  <TextField
    type="time"
    variant="outlined"
    fullWidth
    value={formik.values.attributes[attr.id] || ""}
    onChange={(e) => {
      formik.setFieldValue(`attributes.${attr.id}`, e.target.value);
    }}
  />
)}

                    </FormControl>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <p>No attributes available</p>
                </Grid>
              )}
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Box>

    {/* Product Details */}
    <TextField label="Product Name" id="name" fullWidth value={formik.values.name} onChange={formik.handleChange} />
    <TextField label="Description" id="description" fullWidth value={formik.values.description} onChange={formik.handleChange} />
    <TextField label="Price" id="price" fullWidth value={formik.values.price} onChange={formik.handleChange} />

    {/* Status Selection */}
    <Button variant="outlined" onClick={handleStatusMenuOpen} style={{ marginTop: "10px" }}>
      Status *
    </Button>
    <Menu anchorEl={statusMenuAnchor} open={Boolean(statusMenuAnchor)} onClose={() => handleStatusMenuClose(formik.values.status)}>
      <MenuItem onClick={() => handleStatusMenuClose("Active")}>Active</MenuItem>
      <MenuItem onClick={() => handleStatusMenuClose("Inactive")}>Inactive</MenuItem>
    </Menu>
    <TextField fullWidth value={formik.values.status} onChange={formik.handleChange} />
  </DialogContent>

  {/* Buttons */}
  <DialogActions>
    <Button variant="contained" color="primary" onClick={formik.handleSubmit}>
      Save
    </Button>
  </DialogActions>
</Dialog>

        <div style={{ margin: '20px', marginLeft: 'auto', marginRight: 'auto' }}>
        <Dialog open={openAddImageDialog} onClose={() => setOpenAddImageDialog(false)} maxWidth="sm">
  <DialogTitle>Add Images</DialogTitle>
  <DialogContent>
    <div>
      {(formik.values.productImage || []).map((image, index) => (
        <div key={index} style={{ marginBottom: '10px' }}>
          <img
            src={image instanceof File ? URL.createObjectURL(image) : image.url || image}
            alt={`Product Image ${index + 1}`}
            style={{ width: "100px", height: "auto" }}
          />
          <Button
            onClick={() => removeImage(image.id || null, index)}
            color="secondary"
          >
            Remove Image
          </Button>
        </div>
      ))}
      <input
        type="file"
        name="images"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
      />
      <Button onClick={handleUploadClick} color="primary">
        Upload Images
      </Button>
    </div>
  </DialogContent>
</Dialog>
      </div>
      <div style={{ margin: '20px', marginLeft: 'auto', marginRight: 'auto' }}>
      <Dialog open={openEditImageDialog} onClose={() => setOpenEditImageDialog(false)} maxWidth="sm">
  <DialogTitle>Edit Images</DialogTitle>
  <DialogContent>
    <div>
      {existingImages.map((image, index) => (
        <div key={image.id} style={{ marginBottom: '10px' }}>
          <img src={image.url} alt={`Product Image ${index + 1}`} style={{ width: "100px", height: "auto" }} />
          <Button onClick={() => removeImage(image.id, index)} color="secondary">
            Remove Image
          </Button>
        </div>
      ))}
      <input type="file" name="newImages" accept="image/*" multiple onChange={handleFileUpload} />
      <Button onClick={handleUploadClick} color="primary">
        Upload New Images
      </Button>
    </div>
  </DialogContent>
</Dialog>

      </div>
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Delete Item</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this item?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <MuiAlert elevation={6} variant="filled" onClose={handleCloseSnackbar} severity="success">
          {message}
        </MuiAlert>
      </Snackbar>
    </div>
  );
};

export default ProductManagement;

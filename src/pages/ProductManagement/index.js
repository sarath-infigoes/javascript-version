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
      created_at: '',
      status: '',
      category: '',
      productImage: [],
      attributes: {}, // Use an object instead of an array to store key-value pairs
    },

    onSubmit: async (values) => {
      const productData = {
        name: values.name,
        description: values.description,
        price: values.price,
        category: selectedCategory,
        status: values.status === "Active" ? 1 : 2,
        attributes: attributes.map((attr) => ({
          atr_id: attr.id, // Ensure correct attribute ID
          atr_value: values.attributes[attr.id] || "", // Get the value from formik state
        })),
      };


      try {
        if (editItemId) {
          await axios.post(`https://spinryte.in/draw/api/Product/update_product/${editItemId}`, productData);
          showMessage('Product Updated successfully');
        } else {
          const response = await axios.post('https://spinryte.in/draw/api/Product/create_product', productData);
          showMessage('Product Added successfully');

          const newProductId = response.data.output.product_id;
          associateImagesWithProduct(newProductId);
          setOpenAddImageDialog(true);
        }

        handleDialogClose();
        fetchProducts();
        setOpenDialog(false);
      } catch (error) {
        console.error('Error adding/updating product:', error);
        showMessage('Product Add/Update Failed');
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
    const imagesToUpload = formik.values.productImage.filter(image => typeof image === 'object');

    if (imagesToUpload.length > 0) {
      const formData = new FormData();
      imagesToUpload.forEach((productImage, index) => {formData.append(`productImage[${index}]`, productImage);

      });

      formData.append('product_id', productId);

      axios.post(`https://spinryte.in/draw/api/Product/image_upload`, formData)
        .then(response => {
          showMessage('Images Uploaded successfully');
          setOpenAddImageDialog(false);
          fetchProducts();
        })
        .catch(error => {
          console.error('Error uploading images:', error);
          showMessage('Error uploading images');
        });
    } else {
      showMessage('No images selected for upload');
    }
  };

  const handleFileUpload = e => {
    const files = Array.from(e.target.files) // Convert files to array
    const newProductImages = [...formik.values.productImage]

    files.forEach(file => {
      if (newProductImages.length < 5) {
        // Max limit check
        newProductImages.push(file)
      }
    })

    formik.setFieldValue('productImage', newProductImages)
  }

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



  const handleCategorySelect = (selectedCategoryId, selectedCategoryName) => {
    setSelectedCategory(selectedCategoryId);
    setSelectedCategoryName(selectedCategoryName);

    formik.setFieldValue('category_id', selectedCategoryId);
  };

  const handleStatusMenuClose = status => {
    setStatusMenuAnchor(null)
    formik.setFieldValue('status', status) // Set string value in Formik

    // Update numeric value for API
    setStatusNumericValue(status === 'Active' ? 1 : 2)
  }

  const handleEditClick = async (productId) => {
    try {
      const response = await axios.get(`https://spinryte.in/draw/api/Product/single_view/${productId}`);
      const productDetails = response.data;

      if (productDetails && productDetails.dataList) {
        const { id, name, description, price, created_at, status, category_id, product_images } = productDetails.dataList;

        // Set formik values with the retrieved product details
        formik.setValues({
          id: id,
          name: name,
          description: description,
          price: price,
          created_at: created_at || '',
          status: status === 'Active' ? 1 : 2,
          category: category_id,
          productImage: product_images.map(image => ({ id: image.id, url: image.image })),
        });

        // Open the edit dialog
        setEditItemId(id);
        setOpenDialog(true);
        setOpenAddImageDialog(true);

        // Display productId and selected category name
        setProductId(productId);
        setSelectedCategoryName(category_id);

        // Print images with delete code
        console.log('Images:', product_images.map(image => ({ id: image.id, url: image.image })));
      } else {
        console.error('Error fetching product details: Product details not found');
        showMessage('Error fetching product details: Product details not found');
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      showMessage('Error fetching product details');
    }
  };

  const placeholderImage = 'https://dummyimage.com/600x400/000/fff';

  const removeImage = async (productImage, id, index) => {
    try {
      const response = await axios.post('https://spinryte.in/draw/api/Product/remove_image', {
        id: id,
      });

      if (response) {
        showMessage('Image removed successfully');

        const newProductImages = productImage.filter(image => image.id !== id);
        formik.setFieldValue('productImage', newProductImages);
      } else {
        showMessage('Failed to remove image. Please try again.');
      }
    } catch (error) {
      console.error('Error removing image:', error);
      showMessage('Error removing image. Please try again.');
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
      <Dialog open={openDialog} onClose={handleDialogClose} >
          <DialogTitle>{editItemId ? "Edit Item" : ""}</DialogTitle>
          <DialogContent>
            <Box component={Paper} sx={{ padding: 4, paddingBottom: 8 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box>
                    {/* Header Section with Title and Buttons */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={3} mb={3}>
                      <h1 style={{ margin: 0 }}>Add Attributes</h1>
                      <Box display="flex" gap={2}>
                        <Button variant="contained" style={{ backgroundColor: "#FF007F" }} onClick={handleDialogClose}>
                          Backt to list
                        </Button>
                      </Box>
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
                            PaperProps: {
                              style: { maxHeight: 200, overflowY: "auto" },
                            },
                          }}
                        >
                          <MenuItem value="" disabled style={{ color: "#9e9e9e" }}>
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
              {Array.isArray(attr.input_values)
                ? attr.input_values.map((value, index) => (
                    <MenuItem key={index} value={value}>
                      {value}
                    </MenuItem>
                  ))
                : typeof attr.input_values === "string"
                ? attr.input_values.split(",").map((value, index) => (
                    <MenuItem key={index} value={value}>
                      {value}
                    </MenuItem>
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
              {Array.isArray(attr.input_values)
                ? attr.input_values.map((value, index) => (
                    <FormControlLabel key={index} value={value} control={<Radio />} label={value} />
                  ))
                : typeof attr.input_values === "string"
                ? attr.input_values.split(",").map((value, index) => (
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
    onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
  />
)}

    {/* Time Picker Input */}
    {attr.input_type === "Time picker" && (
      <TextField
        type="time"
        variant="outlined"
        fullWidth
        value={formik.values.attributes[attr.id] || ""}
        onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
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
            <TextField
            label='Product Name'
            id='name'
            fullWidth
            value={formik.values.name}
            onChange={formik.handleChange}
          />
          <TextField
            label='Description'
            id='description'
            fullWidth
            value={formik.values.description}
            onChange={formik.handleChange}
          />
          <TextField label='Price' id='price' fullWidth value={formik.values.price} onChange={formik.handleChange} />
          <Button variant='outlined' onClick={handleStatusMenuOpen} style={{ marginTop: '10px' }}>
            Status *
          </Button>
          <Menu
            anchorEl={statusMenuAnchor}
            open={Boolean(statusMenuAnchor)}
            onClose={() => handleStatusMenuClose(formik.values.status)}
          >
            <MenuItem onClick={() => handleStatusMenuClose('Active')}>Active</MenuItem>
            <MenuItem onClick={() => handleStatusMenuClose('Inactive')}>Inactive</MenuItem>
          </Menu>
          <TextField fullWidth value={formik.values.status} onChange={formik.handleChange} />
          </DialogContent>

          {/* Buttons */}
          <DialogActions>

            <Button variant="contained" color="primary" onClick={formik.handleSubmit}>
              add
            </Button>
          </DialogActions>
        </Dialog>
        <div style={{ margin: '20px', marginLeft: 'auto', marginRight: 'auto' }}>
        <Dialog open={openAddImageDialog} onClose={() => setOpenAddImageDialog(false)} maxWidth='120px'>
          <DialogTitle>Add Images</DialogTitle>
          <DialogContent>
            <form encType='multipart/form-data'>
              {formik.values.productImage.map((image, index) => (
                <div key={index}>
                  {typeof image === 'object' && image.url ? (
                    <img
                      src={image.url}
                      alt={`Product Image ${index + 1}`}
                      style={{ width: '100px', height: 'auto' }}
                    />
                  ) : (
                    <img
                      src={image instanceof File ? URL.createObjectURL(image) : image}
                      alt={`Product Image ${index + 1}`}
                      style={{ width: '100px', height: 'auto' }}
                    />
                  )}
                  <Button onClick={() => removeImage(formik.values.productImage, image.id, index)} color='primary'>
                    Remove Image
                  </Button>
                </div>
              ))}
              <input
                type='file'
                name='images'
                accept='image/*'
                multiple // Allow multiple images to be selected
                onChange={handleFileUpload}
              />
              <Button onClick={handleAddImage}>Add Image</Button>
              <Button onClick={handleUploadClick} color='primary'>
                Upload Images
              </Button>
            </form>
          </DialogContent>
          <DialogActions></DialogActions>
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

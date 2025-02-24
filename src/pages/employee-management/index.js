import React, { useState, useEffect } from 'react'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import { MenuItem } from '@mui/material'
import axios from 'axios'
import { Autocomplete, Menu, Snackbar, Typography } from '@mui/material'
import MuiAlert from '@mui/material/Alert'
import { useFormik } from 'formik'

const createData = (id, name, email, mobile, status, createdDate, lastLogin) => {
  return { id, name, email, mobile, status, createdDate, lastLogin }
}

const EmployeeManagement = () => {
  const [rows, setRows] = useState([
    //  createData(1, 'John Doe', 'john@example.com', '123-456-7890', true, '2023-01-01', '2023-01-05 12:30'),
    //  createData(2, 'Jane Doe', 'jane@example.com', '987-654-3210', false, '2023-01-02', '2023-01-04 15:45'),
    //  createData(3, 'Alice Smith', 'alice@example.com', '555-123-4567', true, '2023-01-03', '2023-01-03 09:20'),
    // createData(4, 'Bob Johnson', 'bob@example.com', '111-222-3333', false, '2023-01-04', '2023-01-02 18:10'),
    // createData(5, 'Charlie Brown', 'charlie@example.com', '444-555-6666', true, '2023-01-05', '2023-01-01 21:55'),
  ])
  const [productId, setProductId] = useState(null)
  const [editingItemId, setEditingItemId] = useState(null)
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedCategoryName, setSelectedCategoryName] = useState('')
  const [inputCategory, setInputCategory] = useState('')

  /*const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'filterName') {
      setFilterTermName(value);
    } else if (name === 'filterEmail') {
      setFilterTermEmail(value);
    } else if (name === 'filterMobile') {
      setFilterTermMobile(value);
    } else if (name === 'filterStatus') {
      setFilterTermStatus(value);
    }
  };*/
  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = () => {
    fetch('https://spinryte.in/draw/api/Product/get_productList')
      .then(response => response.json())
      .then(data => {
        if (data && data.status && data.status === true && data.dataList) {
          setRows(data.dataList)
        } else {
          console.error('Error fetching products: Invalid response format')
        }
      })
      .catch(error => {
        console.error('Error fetching products:', error)
      })
  }

  const fetchCategories = () => {
    axios
      .get('https://spinryte.in/draw/api/Category/categoryList')
      .then(response => {
        if (response.data && response.data.dataList) {
          setCategories(response.data.dataList)
        } else {
          console.error('Error fetching categories: Invalid response format')
        }
      })
      .catch(error => {
        console.error('Error fetching categories:', error)
      })
  }

  const [openDialog, setOpenDialog] = useState(false)
  const [editItemId, setEditItemId] = useState(null)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [message, setMessage] = useState('')
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null)
  const [openAddImageDialog, setOpenAddImageDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleDeleteClick = id => {
    setOpenDeleteDialog(true)
    setEditingItemId(id)
  }

  const handleDeleteConfirm = async () => {
    if (editingItemId) {
      try {
        const response = await axios.post(`https://spinryte.in/draw/api/Product/product_delete`, { id: editingItemId })

        if (response) {
          setRows(prevRows => prevRows.filter(row => row.id !== editingItemId))
          setEditingItemId(null)
          setOpenDeleteDialog(false)
          showMessage('Item deleted successfully')
        } else {
          showMessage('Failed to delete item')
        }
      } catch (error) {
        console.error('Error deleting item:', error.message)
        showMessage('Error deleting item')
      }
    }
  }

  const formik = useFormik({
    initialValues: {
      id: '',
      name: '',
      description: '',
      price: '',
      created_at: '',
      status: '',
      category: '',
      productImage: [


      ]
    },
    onSubmit: async values => {
      const productData = {
        name: values.name,
        description: values.description,
        price: values.price,
        category: values.category,
        status: values.status === 'Active' ? 1 : 2,
        id: productId
      }

      try {
        if (editItemId) {
          // If editItemId exists, it means we are updating an existing product
          const response = await axios.post(
            `https://spinryte.in/draw/api/Product/update_product/${editItemId}`,
            productData
          )
          showMessage('Product Updated successfully')
          setOpenDialog(false)
          handleDialogClose()
          fetchProducts()
        } else {
          // If editItemId doesn't exist, it means we are adding a new product
          const response = await axios.post('https://spinryte.in/draw/api/Product/create_product', productData)
          showMessage('Product Added successfully')

          const newProductId = response.data.output.product_id

          associateImagesWithProduct(newProductId)
          handleDialogClose()
          fetchProducts()
          setOpenAddImageDialog(true)
          setOpenDialog(false)
        }
      } catch (error) {
        console.error('Error adding/updating product:', error)
        showMessage('Product Add/Update Failed')
      }
    }
  })

  const handleDialogClose = () => {
    setEditItemId(null)
    setOpenDialog(false)
    formik.resetForm()
  }

  const showMessage = msg => {
    setMessage(msg)
    setOpenSnackbar(true)
  }

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  const handleStatusMenuOpen = event => {
    setStatusMenuAnchor(event.currentTarget)
  }

  const handleAddImage = () => {
    if (formik.values.productImage.length < 5) {
      formik.setValues(prevValues => ({
        ...prevValues,
        productImage: [...prevValues.productImage, '']
      }))
    } else {
      showMessage('Maximum 5 images allowed.')
    }
  }

  const handleFileUpload = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      const newImages = Array.from(files).map((file) => ({
        file, // Store the file itself
        url: URL.createObjectURL(file) // Create a preview URL
      }));

      // Update formik values
      formik.setFieldValue('productImage', [...formik.values.productImage, ...newImages]);
    }
  };

  const handleUploadClick = () => {
    const imagesToUpload = formik.values.productImage.filter(image => image.file instanceof File);

    if (imagesToUpload.length > 0) {
      const formData = new FormData();

      imagesToUpload.forEach((productImage, index) => {
        formData.append(`productImage[${index}]`, productImage.file); // Extract the file, not the object
      });

      formData.append('product_id', productId);

      axios
        .post(`https://spinryte.in/draw/api/Product/image_upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(response => {
          console.log('Upload response:', response.data);
          showMessage('Images Uploaded successfully');
          setOpenAddImageDialog(false);
          fetchProducts();
        })
        .catch(error => {
          console.error('Error uploading images:', error.response?.data || error);
          showMessage('Error uploading images');
        });
    } else {
      showMessage('No images selected for upload');
    }
  };


  const handleImageChange = (imageUrl, index) => {
    console.log(imageUrl)

    console.log(index)
  }

  const associateImagesWithProduct = productId => {
    setProductId(productId)
    const imagesToUpload = formik.values.productImage.filter(productImage => typeof productImage === 'object')
    if (imagesToUpload.length > 0) {
      const formData = new FormData()
      imagesToUpload.forEach((productImage, index) => {
        formData.append('images', productImage)
      })
      formData.append('product_id', productId)
      axios
        .post(`https://spinryte.in/draw/api/Product/image_upload`, formData)
        .then(response => {
          showMessage('Images Uploaded ')
          setOpenAddImageDialog(false)
        })
        .catch(error => {
          console.error('Error uploading images:', error)
          showMessage('Error uploading images')
        })
    }
  }

  const handleImageSelection = index => {
    const updatedImages = formik.values.productImage.map((image, i) => ({
      ...image,
      selected: i === index
    }))
    formik.setValues(prevValues => ({
      ...prevValues,
      productImage: updatedImages
    }))
  }

  const handleCategorySearch = inputValue => {
    axios
      .get(`https://spinryte.in/draw/api/Category/categoryList?name=${inputValue}`)
      .then(response => {
        if (response.data && response.data.dataList) {
          setCategories(response.data.dataList)
        } else {
          console.error('Error fetching categories: Invalid response format')
        }
      })
      .catch(error => {
        console.error('Error fetching categories:', error)
      })
  }

  const handleCategorySelect = (selectedCategoryId, selectedCategoryName) => {
    setSelectedCategory(selectedCategoryId)
    setSelectedCategoryName(selectedCategoryName)

    formik.setFieldValue('category_id', selectedCategoryId)
  }

  const [statusNumericValue, setStatusNumericValue] = useState(null)

  const handleStatusMenuClose = status => {
    setStatusMenuAnchor(null)
    formik.setFieldValue('status', status) // Set string value in Formik

    // Update numeric value for API
    setStatusNumericValue(status === 'Active' ? 1 : 2)
  }

  const handleSave = () => {
    console.log("Images saved:", images);
    setIsSelectionOpen(false); // Close the selection on Save
  };

  const handleEditClick = async productId => {
    try {
      const response = await axios.get(`https://spinryte.in/draw/api/Product/single_view/${productId}`)
      const productDetails = response.data

      if (productDetails && productDetails.dataList) {
        const { id, name, description, price, created_at, status, category_id, product_images } =
          productDetails.dataList

        // Set formik values with the retrieved product details
        formik.setValues({
          id: id,
          name: name,
          description: description,
          price: price,
          created_at: created_at || '',
          status: status === 'Active' ? 'Active' : 'Inactive',
          category: category_id,
          productImage: product_images.map(image => ({ id: image.id, url: image.image }))
        })

        // Open the edit dialog
        setEditItemId(id)
        setOpenDialog(true)
        setOpenAddImageDialog(true)

        // Display productId and selected category name
        setProductId(productId)
        setSelectedCategoryName(category_id)

        // Print images with delete code
        console.log(
          'Images:',
          product_images.map(image => ({ id: image.id, url: image.image }))
        )
      } else {
        console.error('Error fetching product details: Product details not found')
        showMessage('Error fetching product details: Product details not found')
      }
    } catch (error) {
      console.error('Error fetching product details:', error)
      showMessage('Error fetching product details')
    }
  }

  const removeImage = async (productImage, id, index) => {
    try {
      if (id) {
        const response = await axios.post('https://spinryte.in/draw/api/Product/remove_image', { id });

        if (response.data && response.data.status) {
          showMessage('Image removed successfully');
        } else {
          showMessage('Failed to remove image. Please try again.');

          return; // Stop execution if API fails
        }
      }

      // Remove from local state, regardless of whether it's uploaded or not
      const newProductImages = productImage.filter((image, imgIndex) => image.id !== id && imgIndex !== index);
      formik.setFieldValue('productImage', newProductImages);
    } catch (error) {
      console.error('Error removing image:', error);
      showMessage('Error removing image. Please try again.');
    }
  };


  const handleSearchChange = event => {
    const { value } = event.target
    setSearchQuery(value)

    // Fetch products based on the search query
    axios
      .get(`https://spinryte.in/draw/api/Product/get_productList?name=${value}`)
      .then(response => {
        if (response.data && response.data.status && response.data.dataList) {
          // Filter the rows based on the search query
          const filteredRows = response.data.dataList.filter(row =>
            row.name.toLowerCase().includes(value.toLowerCase())
          )
          setRows(filteredRows)
        } else {
          console.error('Error fetching products: Invalid response format')
        }
      })
      .catch(error => {
        console.error('Error fetching products:', error)
      })
  }

  return (
    <div style={{ margin: '20px', marginLeft: 'auto', marginRight: 'auto' }}>
      <TableContainer component={Paper}>
        <Button
          variant='contained'
          color='primary'
          style={{ float: 'right', margin: 'zzz10px' }}
          onClick={() => setOpenDialog(true)}
        >
          Add Item
        </Button>
        <TextField
          label='Search by Name'
          value={searchQuery}
          onChange={handleSearchChange}
          style={{ marginBottom: '20px' }}
        />
        <Table sx={{ minWidth: 650 }} aria-label='simple table'>
          <TableHead>
            <TableRow>
              <TableCell>SL NO</TableCell>
              <TableCell>Product Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Images</TableCell>
              <TableCell align='center'>Status</TableCell>
              <TableCell align='center'>Category </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow
                key={index}
                sx={{
                  '&:last-of-type td, &:last-of-type th': {
                    border: 0
                  }
                }}
              >
                <TableCell component='th' scope='row'>
                  {index + 1}
                </TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell>{row.price}</TableCell>
                <TableCell>
                  <img
                    src={row.image || 'https://via.placeholder.com/50'}
                    alt={`Product Image`}
                    style={{ width: '50px', height: '50px' }}
                    onError={e => {
                      e.target.onerror = null // Prevents looping
                      e.target.src = 'https://via.placeholder.com/50' // Fallback image URL
                    }}
                  />
                </TableCell>
                <TableCell align='center'>{row.status}</TableCell>
                <TableCell align='center'>{row.category}</TableCell>
                <TableCell>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='16'
                    height='16'
                    fill='currentColor'
                    className='bi bi-pencil-square'
                    viewBox='0 0 16 16'
                    style={{ color: 'blue', cursor: 'pointer', marginRight: '8px' }}
                    onClick={() => handleEditClick(row.id)}
                  >
                    <path d='M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z' />
                  </svg>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='16'
                    height='16'
                    fill='currentColor'
                    className='bi bi-trash3'
                    viewBox='0 0 16 16'
                    style={{ color: 'red', cursor: 'pointer' }}
                    onClick={() => handleDeleteClick(row.id)}
                  >
                    <path d='M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5' />
                  </svg>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth='120px'>
        <DialogTitle>{editItemId ? 'Edit Item' : 'Add Item'}</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={categories}
            getOptionLabel={option => option.name}
            value={categories.find(cat => cat.id === formik.values.category) || null}
            onChange={(event, newValue) => {
              if (newValue) {
                formik.setFieldValue('category', newValue.id) // Update formik's category field with the selected category ID
              } else {
                formik.setFieldValue('category', '') // Clear category if no selection
              }
            }}
            inputValue={inputCategory}
            onInputChange={(event, newInputValue) => {
              setInputCategory(newInputValue)
              handleCategorySearch(newInputValue)
            }}
            renderInput={params => <TextField {...params} label='Category' fullWidth />}
          />

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
        <DialogActions>
          <Button onClick={handleDialogClose} color='primary'>
            Cancel
          </Button>
          <Button onClick={formik.handleSubmit} color='primary'>
            Save
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
    <img
      src={image.url || (image instanceof File ? URL.createObjectURL(image) : image)}
      alt={`Product Image ${index + 1}`}
      style={{ width: '100px', height: 'auto' }}
    />
    <Button onClick={() => removeImage(index)} color='primary'>
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
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Item</DialogTitle>
        <DialogContent>Are you sure you want to delete this item?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color='primary'>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color='secondary'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <MuiAlert elevation={6} variant='filled' onClose={handleCloseSnackbar} severity='success'>
          {message}
        </MuiAlert>
      </Snackbar>
    </div>
  )
}

export default EmployeeManagement

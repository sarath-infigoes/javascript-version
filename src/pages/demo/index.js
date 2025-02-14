import React, { useEffect, useState } from 'react'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import Select from '@mui/material/Alert'
import { useFormik } from 'formik'
import axios from 'axios'

const LinksManagement = () => {
  const [rows, setRows] = useState([{ id: 1, name: '', type: '', values: '', status: '' }]);
  const [isAddItemView, setIsAddItemView] = useState(false)
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('');
  const [openDialog, setOpenDialog] = useState(false)
  const [editingItemId, setEditingItemId] = useState(null)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [message, setMessage] = useState('')
  const [formValues, setFormValues] = useState({ heading: '', link: '', page: '', status: 'Active' })
  const [searchQuery, setSearchQuery] = useState('')
  const [typeOptions, setTypeOptions] = useState([]);


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('https://spinryte.in/draw/api/Category/attributeList');
        if (response.data && response.data.status && response.data.status === true && response.data.dataList) {
          setCategories(response.data.dataList); // Store categories for dropdown
          setRows(response.data.dataList); // Continue to set rows if needed for list view
        } else {
          console.error('Error fetching categories: Invalid response format');
        }
      } catch (error) {
        console.error('Error fetching categories:', error.message);
      }
    };

    fetchCategories();
  }, []);// Empty dependency array ensures this runs only once on mount

  const formik = useFormik({
    initialValues: formValues,

    // enableReinitialize: true,
    onSubmit: values => {
      if (editingItemId) {
        handleEditItem(values)
      } else {
        handleAddItem(values)
      }
    }
  })

  const handleEditClick = id => {
    const itemToEdit = rows.find(row => row.id === id)
    if (itemToEdit) {
      formik.setValues({
        id: itemToEdit.id,
        name: itemToEdit.name,
        status: itemToEdit.status
      })
      setEditingItemId(id)
      setOpenDialog(true)
    } else {
      console.error(`Item with id ${id} not found.`)
    }
  }

  const handleAddItem = async (values) => {
    try {
      const requestData = {
        ...values,
        status: values.status === 'Active' ? 1 : 2
      };

      await axios.post('https://spinryte.in/draw/api/Category/create_attribute', requestData);

      fetchProducts(); // Refresh the list after adding
      showMessage('Item added successfully');
    } catch (error) {
      console.error('Error adding item:', error.message);
      showMessage('Error adding item');
    } finally {
      setOpenDialog(false);   // Close dialog
      formik.resetForm();      // Clear the form
      setEditingItemId(null);  // Clear editing state
    }
  };

  // const handleEditItem = async values => {
  //   try {
  //     const requestData = {
  //       id: values.id,
  //       heading: values.heading,
  //       link: values.link,
  //       page: values.page,
  //       status: values.status === 'Active' ? 1 : 2
  //     }
  //     await axios.post(`https://spinryte.in/draw/api/External_links/update_externalLink/${editingItemId}`, requestData)
  //     fetchProducts()
  //     showMessage('Item updated successfully')
  //   } catch (error) {
  //     console.error('Error updating item:', error.message)
  //     showMessage('Error updating item')
  //   }
  //   setOpenDialog(false)
  //   formik.resetForm()
  //   setEditingItemId(null)
  // }

  // const handleDeleteClick = id => {
  //   setOpenDeleteDialog(true)
  //   setEditingItemId(id)
  // }

  const handleDeleteConfirm = async () => {
    if (editingItemId) {
      try {
        const response = await axios.post(`https://spinryte.in/draw/api/External_links/externalLink_delete`, {
          id: editingItemId
        })

        if (response.data && response.data.status) {
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

  const handleStatusMenuOpen = event => {
    setStatusMenuAnchor(event.currentTarget)
  }

  const handleStatusMenuClose = status => {
    setStatusMenuAnchor(null)
    formik.setFieldValue('status', status)
  }

  const showMessage = msg => {
    setMessage(msg)
    setOpenSnackbar(true)
  }

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  const handleSearchChange = event => {
    const { value } = event.target
    setSearchQuery(value)

    axios
      .get(`https://spinryte.in/draw/api/External_links/ExternalLinks?heading=${value}`)
      .then(response => {
        if (response.data && response.data.status && response.data.dataList) {
          const filteredRows = response.data.dataList.filter(row =>
            row.heading.toLowerCase().includes(value.toLowerCase())
          )
          setRows(filteredRows)
        } else {
          console.error('Error fetching links: Invalid response format')
        }
      })
      .catch(error => {
        console.error('Error fetching links:', error)
      })
  }

  const handleBackClick = () => setIsAddItemView(false);

  const handleSave = () => {
    // Logic to save data
    showMessage("Attributes saved successfully!");
  };

  const handleAddItemClick = () => {
    setIsAddItemView(true) // Switch to Add Item view
  }

  const handleAddRow = () => {
    const newItem = { id: rows.length + 1, name: '', type: '', values: '', status: '' };
    setRows([...rows, newItem]);
  };

  const handleInputChange = (index, field, value) => {
    setRows(prevRows => {
      // Create a shallow copy of rows
      const updatedRows = [...prevRows];

      // Ensure row exists at the specified index
      if (!updatedRows[index]) {
        // Optionally, add a new row if the index is out of bounds
        updatedRows[index] = { id: index + 1, name: '', type: '', values: '', status: '' };
      }

      // Update the specified field in the row at the given index
      updatedRows[index][field] = value;

      return updatedRows;
    });
  };

  const handleDeleteClick = (id) => {
    setRows(rows.filter(row => row.id !== id));
  };

  const handleShowDetailsClick = (id) => {
    console.log('Show details for row with ID:', id);

    // Implement your show details logic here
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  return (
    <div style={{ margin: '20px', marginLeft: 'auto', marginRight: 'auto' }}>
      {isAddItemView ? (

      // Add Item View
        <TableContainer component={Paper}>
          <Button variant='contained' color='primary' onClick={handleSave} style={{ margin: '10px', float: 'right' }}>
            Save
          </Button>
          <Button
            variant='contained'
            onClick={handleBackClick}
            color='warning'
            style={{ margin: '10px', float: 'right' }}
          >
            Back
          </Button>
          <h1 style={{ marginTop: '20px', marginLeft: '15px' }}>{'Add Attributes'}</h1>
          <h2 style={{ marginTop: '20px', marginLeft: '15px', fontWeight: '400', marginBottom: '20px' }}>
            {'Inheritted Attributes:'}
          </h2>
          <Button variant='contained' color='primary' onClick={handleAddRow} style={{ margin: '10px', float: 'right' }}>
        Add
      </Button>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="left">Name</TableCell>
            <TableCell align="left">Type</TableCell>
            <TableCell align="left">Values</TableCell>
            <TableCell align="left">category</TableCell>
            <TableCell align="left">Status</TableCell>
            <TableCell align="left">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={row.id}>
              <TableCell>
                <TextField
label='Attribute name'
value={row.name}
onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                  style={{ width: '100%', margin: '0px' }}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
              <TextField
                      select
                      label='Type'
                      value={row.input_type}
                      onChange={(e) => handleInputChange(index, 'input_type', e.target.value)}
                      variant='outlined'
                      style={{ width: '100%' }}
                    >
                      <MenuItem value='Text'>Text box</MenuItem>
                      <MenuItem value='Radio button'>Radio button</MenuItem>
                      <MenuItem value='Dropdown'>Dropdown</MenuItem>
                      <MenuItem value='Date picker'>Date picker</MenuItem>
                      <MenuItem value='Time picker'>Time picker</MenuItem>

                    </TextField>
              </TableCell>
              <TableCell>
              <TextField
                      label='Values'
                      value={row.input_values}
                      onChange={(e) => handleInputChange(index, 'input_values', e.target.value)}
                      variant="outlined"
                      style={{ width: '100%' }}
                    />
              </TableCell>
              <TextField
        select
        label='Select Category'
        value={row.category_name}
        onChange={(e) => handleInputChange(index,'category_name', e.target.value)}
        variant='outlined'
        style={{ width: '100%'}}
      >
         <MenuItem value='keyboard'>Keyboard</MenuItem>
         <MenuItem value='car'>Car</MenuItem>
      </TextField>
              <TableCell align="left">
              <TextField
                      select
                      label='Status'
                      value={row.status}
                      onChange={(e) => handleInputChange(index, 'status', e.target.value)}
                      variant='outlined'
                      style={{ width: '100%' }}
                    >
                      <MenuItem value='Active'>Active</MenuItem>
                      <MenuItem value='Inactive'>Inactive</MenuItem>
                    </TextField>
              </TableCell>
              <TableCell align="right">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-trash3"
                  viewBox="0 0 16 16"
                  style={{ color: 'red', cursor: 'pointer' }}
                  onClick={() => handleDeleteClick(row.id)}
                >
                  <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
                </svg>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
        </TableContainer>
      ) : (

        // Main View with Table
        <TableContainer component={Paper}>
          <Button
            variant='contained'
            color='primary'
            style={{ float: 'right', margin: '10px' }}
            onClick={handleAddItemClick}
          >
            Add Item
          </Button>

          <h1 style={{ marginTop: '20px', marginLeft: '15px' }}>Search Parameters</h1>
          {/* <TextField
            select
            label='Select category'
            value={formik.values.page}
            onChange={formik.handleChange}
            variant='outlined'
            margin='normal'
            id='page'
            name='page'
            style={{ width: '200px', margin: '15px 15px 20px 10px' }}
          >
            <MenuItem value='Home'>mobile</MenuItem>
            <MenuItem value='SinglePage'>Single View Page</MenuItem>
            <MenuItem value='Contact'>laptop</MenuItem>
            <MenuItem value='Checkout'>tv</MenuItem>
          </TextField> */}
          {/* <TextField
            select
            label='Attribute name'
            value={formik.values.page}
            onChange={formik.handleChange}
            variant='outlined'
            margin='normal'
            id='page'
            name='page'
            style={{ width: '200px', margin: '15px 15px 20px 10px' }}
          >
            <MenuItem value='Home'>Home</MenuItem>
            <MenuItem value='SinglePage'>Single View Page</MenuItem>
            <MenuItem value='Contact'>Contact</MenuItem>
            <MenuItem value='Checkout'>Checkout</MenuItem>
          </TextField> */}
          {/* <TextField
            label='Values'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ margin: '15px 15px 20px 10px' }}
          />
          <TextField
            select
            label='Values type'
            style={{ margin: '15px 15px 20px 10px', width: '200px' }}
            variant='outlined'
            margin='normal'
            id='page'
            name='page'
          >
            <MenuItem value='Test 1'>Test 1</MenuItem>
            <MenuItem value='Test 2'>Test 2</MenuItem>
            <MenuItem value='Test 3'>Test 3</MenuItem>
          </TextField> */}
          {/* <TextField
            select
            label='Status'
            variant='outlined'
            margin='normal'
            id='page'
            name='page'
            style={{ width: '200px', margin: '15px 15px 20px 10px' }}
          >
            <MenuItem value='Active'>Active</MenuItem>
            <MenuItem value='Inactive'>Inactive</MenuItem>
          </TextField> */}
          {/* <Button variant='contained' color='primary' style={{ float: 'right', margin: '10px' }}>
            Search
          </Button>
          <Button variant='contained' color='secondary' style={{ float: 'right', margin: '10px' }}>
            Reset
          </Button> */}

          <h1 style={{ marginTop: '20px', marginLeft: '15px' }}>Attributes</h1>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label='simple table'>
              <TableHead>
                <TableRow>
                  <TableCell>SL NO</TableCell>
                  <TableCell>Attribute Name</TableCell>
                  <TableCell>Value Type</TableCell>
                  <TableCell>Values</TableCell>
                  <TableCell align='center'>Category</TableCell>
                  <TableCell align='center'>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.input_type}</TableCell>
                    <TableCell>{row.input_values}</TableCell>
                    <TableCell align='center'>{row.category_name}</TableCell>
                    <TableCell align='center'>{row.status}</TableCell>
                    <TableCell align="cente">
                {/* Show Details Button */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-eye"
                  viewBox="0 0 16 16"
                  style={{ color: 'green', cursor: 'pointer', marginRight: '10px' }}
                  onClick={() => handleShowDetailsClick(row.id)}
                >
                  <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zm-8 4.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z" />
                  <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                </svg>
 {/* Edit Button */}
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
              </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TableContainer>
      )}
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
        <MuiAlert elevation={6} variant='filled' severity='success' onClose={() => setOpenSnackbar(false)}>
          {message}
        </MuiAlert>
      </Snackbar>
    </div>
  )
}

export default LinksManagement

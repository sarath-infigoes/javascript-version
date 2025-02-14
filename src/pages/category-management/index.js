/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react'
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
import axios from 'axios'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import { useFormik } from 'formik'

const createData = (id, name, status, createdDate) => {
  return { id, name, status, createdDate }
}

const CategoryManagement = () => {
  const [rows, setRows] = useState([
    // createData(1, 'Frozen yoghurt', 'Active', '2023-01-01'),
    // createData(2, 'Ice cream sandwich', 'Inactive', '2023-01-02'),
    // createData(3, 'Eclair', 'Active', '2023-01-03'),
    // createData(4, 'Cupcake', 'Inactive', '2023-01-04'),
    // createData(5, 'Gingerbread', 'Active', '2023-01-05'),
  ])

  const [openDialog, setOpenDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false) // Add state for delete confirmation dialog
  const [newItemName, setNewItemName] = useState('')
  const [newItemStatus, setNewItemStatus] = useState('Active')
  const [newItemCreatedDate, setNewItemCreatedDate] = useState('')
  const [editingItemId, setEditingItemId] = useState(null)
  const [message, setMessage] = useState('')
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [formValues, setFormValues] = useState({ name: '', status: 'Active' })
  const [itemToDelete, setItemToDelete] = useState(null)
  const [searchQuery, setSearchQuery] = useState('') // Add state for tracking the item to delete

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await axios.get('https://spinryte.in/draw/api/Category/categoryList?iphone=14')
      if (response.data && response.data.status && response.data.status === true && response.data.dataList) {
        setRows(response.data.dataList)
      } else {
        console.error('Error fetching products: Invalid response format')
        showMessage('Error fetching products')
      }
    } catch (error) {
      console.error('Error fetching products:', error.message)
      showMessage('Error fetching products')
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const formik = useFormik({
    initialValues: formValues, // Set initialValues to formValues
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

  const handleAddItem = async values => {
    try {
      const requestData = {
        ...values,
        status: values.status === 'Active' ? 1 : 2
      }

      await axios.post('https://spinryte.in/draw/api/Category/create_category', requestData)
      fetchProducts()
      showMessage('Item Added successfully')
    } catch (error) {
      console.error('Error adding item:', error.message)
      showMessage('Error adding item')
    }
    setOpenDialog(false)
    formik.resetForm()
    setEditingItemId(null)
  }

  const handleEditItem = async values => {
    try {
      // Map status values to 1 for "Active" and 2 for "Inactive"
      const requestData = {
        id: values.id,
        image: values.image,
        name: values.name,
        status: values.status === 'Active' ? 1 : 2
      }
      await axios.post(`https://spinryte.in/draw/api/Category/category_update/${editingItemId}`, requestData)
      fetchProducts()
      showMessage('Item updated successfully')
    } catch (error) {
      console.error('Error updating item:', error.message)
      showMessage('Error updating item')
    }
    setOpenDialog(false)
    formik.resetForm()
    setEditingItemId(null)
  }

  const handleDeleteClick = id => {
    setOpenDeleteDialog(true)
    setEditingItemId(id)
  }

  const handleDeleteConfirm = async () => {
    if (editingItemId) {
      try {
        const response = await axios.post(`https://spinryte.in/draw/api/Category/category_delete`, {
          id: editingItemId
        })

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
      .get(`https://spinryte.in/draw/api/Category/categoryList?name=${value}`)
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
    <div>
      <TableContainer component={Paper}>
        <Button
          variant='contained'
          color='primary'
          style={{ float: 'right', margin: '10px' }}
          onClick={() => setOpenDialog(true)}
        >
          Add Items
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
              <TableCell>Sl No</TableCell>
              {/* <TableCell align=''>Image</TableCell>*/}
              <TableCell align=''>Category</TableCell>
              <TableCell align='center'>Status</TableCell>
              <TableCell align='right'>Created Date</TableCell>
              <TableCell align='right'>Action</TableCell>
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

                {/* <TableCell align='left'>
                  <img src={row.image} alt={row.name} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                </TableCell>*/}
                <TableCell align='left'>{row.name}</TableCell>
                <TableCell align='center'>{row.status}</TableCell>
                <TableCell align='right'>{row.created_at}</TableCell>
                <TableCell align='right'>
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

      {/* Dialog for Add/Edit Item */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{editingItemId !== null ? 'Edit Item' : 'Add New Item'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            id='name'
            label='name'
            fullWidth
            value={formik.values.name}
            onChange={formik.handleChange}
          />
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
          <Button onClick={() => setOpenDialog(false)} color='primary'>
            Cancel
          </Button>
          <Button onClick={formik.handleSubmit} color='primary'>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for Delete Confirmation */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Item</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to delete {itemToDelete?.name}?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color='primary'>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color='primary'>
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

export default CategoryManagement

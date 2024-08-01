

'use client'
import Image from "next/image";
import { useState, useEffect } from 'react';
import { firestore } from '@/firebase';
import { Box, Typography, Modal, Stack, TextField, Button, IconButton, Paper, InputBase, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { tableCellClasses } from '@mui/material/TableCell';
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import * as React from 'react';
import { Unstable_NumberInput as BaseNumberInput } from '@mui/base/Unstable_NumberInput';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import CloseIcon from '@mui/icons-material/Close'; 
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

const theme = createTheme({
  palette: {
    black: {
      main: '#000000',
      contrastText: '#ffffff',
    },
  },
});



const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const NumberInput = React.forwardRef(function CustomNumberInput(props, ref) {
  return (
    <BaseNumberInput
      slots={{
        root: StyledInputRoot,
        input: StyledInput,
        incrementButton: StyledButton,
        decrementButton: StyledButton,
      }}
      slotProps={{
        incrementButton: {
          children: <AddIcon fontSize="small" />,
          className: 'increment',
        },
        decrementButton: {
          children: <RemoveIcon fontSize="small" />,
        },
      }}
      {...props}
      ref={ref}
    />
  );
});

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [editOpen, setEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data()
      });
    });
    setInventory(inventoryList);
    console.log(inventoryList);
  };

  const addItem = async (item, addQuantity) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + addQuantity });
    } else {
      await setDoc(docRef, { quantity: addQuantity });
    }

    await updateInventory();
  };

  const removeItem = async (item, removeQuantity) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - removeQuantity});
      }
    }

    await updateInventory();
  };

  const deleteItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    await deleteDoc(docRef);
    await updateInventory();
  };

  const editItem = async () => {
    const docRef = doc(collection(firestore, 'inventory'), editingItem);
    const docSnap = await getDoc(docRef);
  
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      // If the name has changed, create a new document with the new name
      if (itemName !== editingItem) {
        // Set the new item with the updated quantity
        await setDoc(doc(collection(firestore, 'inventory'), itemName), { quantity: itemQuantity });
        // Delete the old item
        await deleteDoc(docRef);
      } else {
        // Update the quantity if the name hasn't changed
        await setDoc(docRef, { quantity: itemQuantity });
      }
    }
  
    await updateInventory();
    //handleEditClose(); 
  };
  
 

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleEditOpen = (name, quantity) => {
    setItemName(name);
    setItemQuantity(quantity);
    setEditingItem(name);
    setEditOpen(true);
  };
  
  const handleEditClose = () => setEditOpen(false);

  const filteredInventory = inventory.filter(({ name }) =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      
      alignItems="center"
      gap={2}
      sx={{
        position: 'absolute',
        top: '10%',  // Adjust this value to control the vertical offset
        left: 0,
        right: 0,
        bottom: 0,
        marginTop: '10px', // Add margin if you prefer this method
      }}
    >
    
  

      <Modal open={open}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: 'translate(-50%, -50%)',
            borderRadius: '16px',
          }}
        >
         
          <Typography variant="h6" fontWeight="bold" textAlign="center">Add New Item</Typography>
          <ThemeProvider theme={theme}>
            <TextField
            variant='outlined'
            fullWidth
            label="Item name"
            color="black"
            value={itemName}
            onChange={(e) => {
              setItemName(e.target.value);
            }}
          />
          <NumberInput 
            aria-label="Quantity Input"
            min={1}
            value={itemQuantity} 
            onChange={(e, value) => {
              if (value == '' || value == null) {
                setItemQuantity(1);
              } else {
                setItemQuantity(value);
              }
              
            }}
          />
          </ThemeProvider>
          <Box display="flex" justifyContent="flex-end" gap={2}>
          <ThemeProvider theme={theme}>
            <Button
              sx={{
                textTransform: 'none', // Disable default uppercase transformation
                '&::first-letter': {
                  textTransform: 'capitalize', // Capitalize the first letter
                },
              }}
              color="black"
              variant="contained"
              onClick={() => {
                addItem(itemName, itemQuantity);
                setItemName('');
                setItemQuantity(1);
                handleClose();
              }}
            >
              Add
            </Button>
            <Button
              sx={{
                textTransform: 'none', // Disable default uppercase transformation
                '&::first-letter': {
                  textTransform: 'capitalize', // Capitalize the first letter
                },
              }}
              color="black"
              variant="outlined"
              onClick={() => {
                setItemName('');
                setItemQuantity(1);
                handleClose();
              }}
            >
              Cancel
            </Button>
            </ThemeProvider>
          </Box>
          
        </Box>
      </Modal>

      <Modal open={editOpen}>
      <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: 'translate(-50%, -50%)',
            borderRadius: '16px',
          }}
        >
         
          <Typography variant="h6" fontWeight="bold" textAlign="center">Edit Item</Typography>
          <ThemeProvider theme={theme}>
            <TextField
            variant='outlined'
            fullWidth
            label="Item name"
            color="black"
            value={itemName}
            onChange={(e) => {
              setItemName(e.target.value);
            }}
          />
          <NumberInput 
            aria-label="Quantity Input"
            min={1}
            value={itemQuantity} 
            onChange={(e, value) => {
              if (value == '' || value == null) {
                setItemQuantity(1);
              } else {
                setItemQuantity(value);
              }
            }}
          />
          </ThemeProvider>
          <Box display="flex" justifyContent="flex-end" gap={2}>
          <ThemeProvider theme={theme}>
            <Button
              sx={{
                textTransform: 'none', // Disable default uppercase transformation
                '&::first-letter': {
                  textTransform: 'capitalize', // Capitalize the first letter
                },
              }}
              color="black"
              variant="contained"
              onClick={() => {
                editItem();
                setItemName('');
                setItemQuantity(1);
                handleEditClose();
              }}
            >
              Update
            </Button>
            
            <Button
              sx={{
                textTransform: 'none', // Disable default uppercase transformation
                '&::first-letter': {
                  textTransform: 'capitalize', // Capitalize the first letter
                },
              }}
              color="black"
              variant="outlined"
              onClick={() => {
                setItemName('');
                setItemQuantity(1);
                handleEditClose();
                
              }}
            >
              Cancel
            </Button>
            </ThemeProvider>
          </Box>
          
        </Box>

        
      </Modal>
      <Typography variant="h5" fontWeight="bold">My Pantry</Typography>
      <Box sx={{
          marginY: 2,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
        }}>
          <Stack width="100%" direction="row" alignItems="center" spacing={2}>
            <Paper
              component="form"
              sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400}}
            >
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Search items.."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
                <SearchRoundedIcon />
              </IconButton>
            </Paper>
            <IconButton onClick={handleOpen}>
              <AddCircleRoundedIcon />
            </IconButton>
          </Stack>
          
        </Box>

      <Box width="800px">
      
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 700 }} aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell align="center">Item Name</StyledTableCell>
                <StyledTableCell align="center">Quantity</StyledTableCell>
                <StyledTableCell align="right"></StyledTableCell>
               
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInventory.map(({ name, quantity }) => (
                <StyledTableRow key={name}>
                  <StyledTableCell align="center" component="th" scope="row">
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                  <NumberInput 
                    aria-label="Quantity Input"
                    min={0}
                    value={quantity}
                    onChange={(e, value) => {
                      if (value == 0) {
                        deleteItem(name)
                      } else if (value == '' || value == null) {
                        setItemQuantity(quantity);
                      } else if (value > quantity) {
                        addItem(name, value - quantity);
                      } else if (value < quantity) {
                        removeItem(name, quantity - value);
                      }
                    }}
                    
           
              
           
                  />
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    
                    <IconButton onClick={() => handleEditOpen(name, quantity)}>
                      <EditRoundedIcon color="primary"/>
                    </IconButton>
                    <IconButton onClick={() => deleteItem(name)}>
                      <DeleteRoundedIcon color="error"/>
                    </IconButton>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}
const black = {
  100: '#e0e0e0',
  200: '#b0b0b0',
  300: '#808080',
  400: '#606060',
  500: '#404040',
  600: '#303030',
  700: '#202020',
  800: '#101010',
};

const grey = {
  50: '#F3F6F9',
  100: '#E5EAF2',
  200: '#DAE2ED',
  300: '#C7D0DD',
  400: '#B0B8C4',
  500: '#9DA8B7',
  600: '#6B7A90',
  700: '#434D5B',
  800: '#303740',
  900: '#1C2025',
};


const StyledInputRoot = styled('div')(
  ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 400;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[500]};
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
`,
);

const StyledInput = styled('input')(
  ({ theme }) => `
  font-size: 0.875rem;
  font-family: inherit;
  font-weight: 400;
  line-height: 1.375;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
  box-shadow: 0px 2px 4px ${
    theme.palette.mode === 'dark' ? 'rgba(0,0,0, 0.5)' : 'rgba(0,0,0, 0.05)'
  };
  border-radius: 8px;
  margin: 0 8px;
  padding: 10px 12px;
  outline: 0;
  min-width: 0;
  width: 4rem;
  text-align: center;

  &:hover {
    border-color: ${black[400]};
  }

  &:focus {
    border-color: ${black[400]};
  }

  &:focus-visible {
    outline: 0;
  }
`,
);

const StyledButton = styled('button')(
  ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.875rem;
  box-sizing: border-box;
  line-height: 1.5;
  border: 1px solid;
  border-radius: 999px;
  border-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[200]};
  background: ${theme.palette.mode === 'dark' ? grey[900] : grey[50]};
  color: ${theme.palette.mode === 'dark' ? grey[200] : grey[900]};
  width: 32px;
  height: 32px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 120ms;

  &:hover {
    cursor: pointer;
    background: ${theme.palette.mode === 'dark' ? black[500] : black[300]};
    border-color: ${theme.palette.mode === 'dark' ? black[300] : black[200]};
    color: ${grey[50]};
  }

  &:focus-visible {
    outline: 0;
  }

  &.increment {
    order: 1;
  }
`,
);

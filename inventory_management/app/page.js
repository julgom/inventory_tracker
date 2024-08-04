
'use client'
import Image from "next/image";
import { useState, useEffect } from 'react';
import { firestore, storage } from '@/firebase';
import { ref, uploadBytes, getDownloadURL, uploadString} from 'firebase/storage';
import { Box, Typography, Modal, Stack, TextField, Button, IconButton, Paper, InputBase, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,  List, ListItem, ListItemText, Card, CardContent, Container, Grid } from '@mui/material';
import { tableCellClasses } from '@mui/material/TableCell';
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc, updateDoc } from 'firebase/firestore';
import * as React from 'react';
import { Unstable_NumberInput as BaseNumberInput } from '@mui/base/Unstable_NumberInput';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import axios from 'axios';
import Webcam from 'react-webcam';



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

  
  const [isLoading, setIsLoading] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [recipeOpen, setRecipeOpen] = useState(false);

  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [showInput, setShowInput] = useState(false);


  const [capturedImage, setCapturedImage] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const webcamRef = React.useRef(null);

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


  // Function to generate recipes
  const generateRecipes = async () => {
    
      try {
        setIsLoading(true);
        setErrorMessage(null);
        // Make a POST request to your backend server
        const response = await axios.post('http://127.0.0.1:5000/generate-recipes', {
          ingredients: inventory.map(item => item.name),
        });
        
        // Set the received recipes to state
        const jsonArray = response.data.recipe;
        
        // Wrap the data in an array if it's not already an array
        const jsArray = JSON.parse(jsonArray);
      
  
        setRecipes(jsArray);
        setIsLoading(false);
        setRecipeOpen(true);
        
      } catch (error) {
        setIsLoading(false);
        setErrorMessage('There was an error generating recipes. Please try again.');
        setErrorOpen(true);
      }
  };

  const handleRetry = async () => {
    setErrorOpen(false);
    try {
      setIsLoading(true);
      setErrorMessage(null);
      // Make a POST request to your backend server
      const response = await axios.post('http://127.0.0.1:5000/generate-recipes', {
        ingredients: inventory.map(item => item.name),
      });
      
      // Set the received recipes to state
      const jsonArray = response.data.recipe;
      
      // Wrap the data in an array if it's not already an array
      const jsArray = JSON.parse(jsonArray);
    

      setRecipes(jsArray);
      setIsLoading(false);
      setRecipeOpen(true);
      
    } catch (error) {
      setIsLoading(false);
      setErrorMessage('There was an error generating recipes. Please try again.');
      setErrorOpen(true);
    }
  };
  console.log(recipes);

  const handleCloseModal = () => {
    setRecipeOpen(false);
  };

  const handleCloseErrorModal = () => {
    setErrorOpen(false);
  };

  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      const file = event.target.files[0]; // this Object holds a reference to the file on disk
      const url = URL.createObjectURL(file);
      setFile(file);
      setPreview(url);
      setShowInput(false); // Hide the file input field after selecting a file
    }
  }

  const uploadImage = async() => {
    if (!file && !capturedImage) {
      const url = '/no image.png';
      setUploadedUrl(url);
      return url;
    }
    
    if (capturedImage) {
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const storageRef = ref(storage, `images/${capturedImage.name}`);
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      setUploadedUrl(url);
      return url;
    }
    if (preview) {
      const storageRef = ref(storage, `images/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setUploadedUrl(url);
      return url;
      
    }
   
    return null;
  };
  

  const addItem = async (item, addQuantity, imageUrl) => {
    

    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + addQuantity, imageUrl});
    } else {
      await setDoc(docRef, { quantity: addQuantity, imageUrl });
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
        const { quantity, imageUrl } = docSnap.data(); // Fetch existing data

       /* if (file) {
          const url = await uploadImage();
        }*/
        file ? console.log("yes") : console.log("no");
        capturedImage ? console.log("yes") : console.log("no");
        preview ? console.log("yes") : console.log("no");
        // If the name has changed, create a new document with the new name
        if (itemName !== editingItem) {
            // Set the new item with the updated quantity and imageUrl
            await setDoc(doc(collection(firestore, 'inventory'), itemName), { 
                quantity: itemQuantity,
                imageUrl: file || capturedImage ? await uploadImage() : imageUrl // Use the existing imageUrl or update as needed
            });
            // Delete the old item
            await deleteDoc(docRef);
        } else {
            // Update the quantity and optionally imageUrl if the name hasn't changed
            await setDoc(docRef, { 
                quantity: itemQuantity,
                imageUrl: file || capturedImage ? await uploadImage() : imageUrl // Update imageUrl if needed
            });
        }
    }

    await updateInventory();
};

 

  useEffect(() => {
    updateInventory();

  }, []);

  
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleEditOpen = (name, quantity, imageUrl) => {
    setItemName(name);
    setItemQuantity(quantity);
    setEditingItem(name);
    setPreview(imageUrl);
    setEditOpen(true);
  };
  
  const handleEditClose = () => setEditOpen(false);

  const handleUploadClick = () => {
    setShowInput(true);
    setShowWebcam(false);
    setCapturedImage(null); 
  };

  const handleCaptureClick = () => {
    setShowInput(false);
    setShowWebcam(true);
    setPreview(null);
  };

  const handleCapture = React.useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setShowWebcam(false);
    //setShowInput(false); // Hide file input when using webcam
  }, [webcamRef]);

  const handleRetake = () => {
    setCapturedImage(null);
    setShowWebcam(true);
    //setShowInput(false); // Hide file input when retaking photo
  };

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
        top: '3%', // Adjust this value to control the vertical offset
        left: 0,
        right: 0,
        bottom: 0,
        marginTop: '8px', // Add margin if you prefer this method
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
          
          <Button
            sx={{
              textTransform: 'none', // Disable default uppercase transformation
              '&::first-letter': {
                textTransform: 'capitalize', // Capitalize the first letter
              },
            }}
            color="black"
            variant="contained"
            onClick={handleUploadClick}
          >
            Upload Image
          </Button>
          <Button
            sx={{
              textTransform: 'none', // Disable default uppercase transformation
              '&::first-letter': {
                textTransform: 'capitalize', // Capitalize the first letter
              },
            }}
            color="black"
            variant="contained"
            onClick={handleCaptureClick}
          >
            Capture Image
          </Button>

          {showInput && (
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'block', marginTop: '10px' }} // Show the input element
            />
          )}

{showWebcam && !capturedImage && (
            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
              <Webcam
                audio={false}
                height={200}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={220}
                videoConstraints={{ width: 220, height: 200, facingMode: "user" }}
              />
              <Button
                onClick={handleCapture}
                sx={{
                  textTransform: 'none', // Disable default uppercase transformation
                  '&::first-letter': {
                    textTransform: 'capitalize', // Capitalize the first letter
                  },
                }}
                color="black"
                variant="contained"
              >
                Capture
              </Button>
            </Box>
          )}

          {capturedImage && (
            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
              <Image
                src={capturedImage}
                alt="Captured image"
                width={200}
                height={200}
                layout="responsive"
              />
              <Button
                onClick={handleRetake}
                sx={{
                  textTransform: 'none', // Disable default uppercase transformation
                  '&::first-letter': {
                    textTransform: 'capitalize', // Capitalize the first letter
                  },
                }}
                color="black"
                variant="contained"
              >
                Retake Image
              </Button>
            </Box>
          )}

          {preview && !showWebcam && !capturedImage && (
            <Box display="flex" flexDirection="column" alignItems="center">
              <Image
                src={preview}
                alt="Uploaded image"
                width={200}
                height={200}
                layout="responsive"
              />
            </Box>
          )}
          
          

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
              onClick={async () => {
                
                addItem(itemName, itemQuantity, await uploadImage());
                setItemName('');
                setItemQuantity(1);
                setShowInput(false);
                setShowWebcam(false);
                setFile(null);
                setPreview(null);
                setUploadedUrl(null);
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
                setShowInput(false);
                setShowWebcam(false);
                setFile(null);
                setPreview(null);
                setUploadedUrl(null);
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

<Button
            sx={{
              textTransform: 'none', // Disable default uppercase transformation
              '&::first-letter': {
                textTransform: 'capitalize', // Capitalize the first letter
              },
            }}
            color="black"
            variant="contained"
            onClick={handleUploadClick}
          >
            Upload Image
          </Button>
          <Button
            sx={{
              textTransform: 'none', // Disable default uppercase transformation
              '&::first-letter': {
                textTransform: 'capitalize', // Capitalize the first letter
              },
            }}
            color="black"
            variant="contained"
            onClick={handleCaptureClick}
          >
            Capture Image
          </Button>

          {showInput && (
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'block', marginTop: '10px' }} // Show the input element
            />
          )}

{showWebcam && !capturedImage && (
            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
              <Webcam
                audio={false}
                height={200}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={220}
                videoConstraints={{ width: 220, height: 200, facingMode: "user" }}
              />
              <Button
                onClick={handleCapture}
                sx={{
                  textTransform: 'none', // Disable default uppercase transformation
                  '&::first-letter': {
                    textTransform: 'capitalize', // Capitalize the first letter
                  },
                }}
                color="black"
                variant="contained"
              >
                Capture
              </Button>
            </Box>
          )}

          {capturedImage && (
            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
              <Image
                src={capturedImage}
                alt="Captured image"
                width={200}
                height={200}
                layout="responsive"
              />
              <Button
                onClick={handleRetake}
                sx={{
                  textTransform: 'none', // Disable default uppercase transformation
                  '&::first-letter': {
                    textTransform: 'capitalize', // Capitalize the first letter
                  },
                }}
                color="black"
                variant="contained"
              >
                Retake Image
              </Button>
            </Box>
          )}

          {preview && !showWebcam && !capturedImage && (
            <Box display="flex" flexDirection="column" alignItems="center">
              <Image
                src={preview}
                alt="Uploaded image"
                width={200}
                height={200}
                layout="responsive"
              />
            </Box>
          )}
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
              onClick={ () => {
                editItem();
                setItemName('');
                setItemQuantity(1);
                setShowInput(false);
                setShowWebcam(false);
                setFile(null);
                setPreview(null);
                setUploadedUrl(null);
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
                setShowInput(false);
                setShowWebcam(false);
                setFile(null);
                setPreview(null);
                setUploadedUrl(null);
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

      <Box width="800px" >
      
      <TableContainer component={Paper} sx={{ maxHeight: 500, overflow: 'auto' }} >
          <Table stickyHeader sx={{ minWidth: 700, tableLayout: 'fixed'}} aria-label="customized table">
            <TableHead>
              <TableRow >
                <StyledTableCell align="center">Image</StyledTableCell>
                <StyledTableCell align="center">Item Name</StyledTableCell>
                <StyledTableCell align="center">Quantity</StyledTableCell>
                <StyledTableCell align="right"></StyledTableCell>
               
              </TableRow>
            </TableHead>
            <TableBody >
              {filteredInventory.map(({ name, quantity, imageUrl }) => (
                <StyledTableRow key={name} >
                  <StyledTableCell align="center">
                    {imageUrl && <Image src={imageUrl} alt="Uploaded image" width={50} height={50} layout="responsive" />}
                  </StyledTableCell>
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
                    
                    <IconButton onClick={() => handleEditOpen(name, quantity, imageUrl)}>
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
        <ThemeProvider theme={theme}>
          <Box  
            sx={{
              marginY: 4,
              display: 'flex',
              justifyContent: 'center',
            }}>
            <Button
              sx={{
                textTransform: 'none', // Disable default uppercase transformation
                '&::first-letter': {
                  textTransform: 'capitalize', // Capitalize the first letter
                },
              }}
              color="black"
              variant="contained"
              onClick={generateRecipes}
             >
            Generate Recipes
            </Button>
          </Box>
          <main style={{ padding: '16px' }}>
            {isLoading && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress style={{ color: 'black' }} />
              </div>
            )}

            {!isLoading && recipes.length > 0 && (
              <Dialog open={recipeOpen} onClose={handleCloseModal} fullWidth maxWidth="md">
                <DialogContent style={{ paddingTop: '32px' }}>
                  <Grid container spacing={4}>
                    {recipes.map((recipe, i) => (
                      <Grid item xs={12} md={4} key={i}>
                        <Card key={recipe.id} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                          <h2 style={{ textAlign: 'center', marginBottom: '16px' }}>{recipe.name}</h2>
                          <p style={{ textAlign: 'center', marginBottom: '24px' }}>{recipe.description}</p>
                          <CardContent style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                            <h3 style={{ textAlign: 'center', marginBottom: '8px' }}>Ingredients:</h3>
                            <div style={{ backgroundColor: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', padding: '8px', marginBottom: '24px' }}>
                              <ul style={{ paddingLeft: '20px' }}>
                                {recipe.ingredients.map((ingredient, j) => (
                                  <li key={ingredient.id || j} style={{ marginBottom: '8px' }}>{ingredient}</li>
                                ))}
                              </ul>
                            </div>
                            <h3 style={{ textAlign: 'center', marginBottom: '8px' }}>Instructions:</h3>
                            <ol style={{ paddingLeft: '20px' }}>
                              {recipe.instructions.map((instruction, k) => (
                                <li key={instruction.id || k} style={{ marginBottom: '8px' }}>{instruction}</li>
                              ))}
                            </ol>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </DialogContent>
                <DialogActions
                  sx={{
                    justifyContent: 'center',
                    marginBottom: '12px',
                    position: 'relative',
                  }}
                >
                  <Button
                    sx={{
                      textTransform: 'none',
                      '&::first-letter': {
                        textTransform: 'capitalize',
                      },
                    }}
                    color="black"
                    variant="contained"
                    onClick={handleCloseModal}
                  >
                  Close
                  </Button>
               </DialogActions>
              </Dialog>
            )}
          </main>
          <Dialog open={errorOpen} onClose={handleCloseErrorModal}>
            <DialogContent style={{ paddingTop: '32px' }}>
              <p style={{ textAlign: 'center', marginBottom: '24px' }}>{errorMessage}</p>
            </DialogContent>
            <DialogActions  
              sx={{
                justifyContent: 'center',
                marginBottom: '12px',
                position: 'relative',
              }}>
            <Button
                    sx={{
                      textTransform: 'none',
                      '&::first-letter': {
                        textTransform: 'capitalize',
                      },
                    }}
                    color="black"
                    variant="contained"
                    onClick={handleRetry}
                  >
                  Try Again
                  </Button>
              <Button
                    sx={{
                      textTransform: 'none',
                      '&::first-letter': {
                        textTransform: 'capitalize',
                      },
                    }}
                    color="black"
                    variant="contained"
                    onClick={handleCloseErrorModal}
                  >
                  Close
                  </Button>
            </DialogActions>
          </Dialog>
        </ThemeProvider>
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

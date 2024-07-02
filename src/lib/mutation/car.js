import axios from '../../services/api';

// Add a new car
export const addCar = async (carData) => {
  try {
    const response = await axios.post('/cars', carData);
    return response.data;
  } catch (error) {
    console.error('Error adding car:', error);
    throw error;
  }
};

// Update an existing car
export const updateCar = async (id, carData) => {
  try {
    const response = await axios.put(`/cars/${id}`, carData);
    return response.data;
  } catch (error) {
    console.error('Error updating car:', error);
    throw error;
  }
};

// Delete a car
export const deleteCar = async (id) => {
  try {
    const response = await axios.delete(`/cars/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting car:', error);
    throw error;
  }
};

import axios from '../../services/api';

// Fetch all cars
export const fetchCars = async () => {
  try {
    const response = await axios.get('/cars');
    return response.data;
  } catch (error) {
    console.error('Error fetching cars:', error);
    throw error;
  }
};

// Fetch a single car by ID
export const fetchCarById = async (id) => {
  try {
    const response = await axios.get(`/cars/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching car by ID:', error);
    throw error;
  }
};

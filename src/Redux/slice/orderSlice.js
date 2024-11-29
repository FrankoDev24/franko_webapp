// src/Redux/Slice/orderSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Async thunks
export const fetchOrdersByDate = createAsyncThunk(
  "orders/fetchOrdersByDate",
  async ({ from, to }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/Order/GetOrdersByDate/${from}/${to}`
      );
      return response.data; // Ensure this returns the expected data format
    } catch (error) {
      console.error("Error fetching orders by date:", error); // Log the error for debugging
      return rejectWithValue(
        error.response?.data || "Failed to fetch orders by date"
      );
    }
  }
);

export const checkOutOrder = createAsyncThunk(
  "orders/checkOutOrder",
  async (
    { Cartid, orderCode, customerId, PaymentMode, paymentService,  PaymentAccountNumber, customerAccountType }, 
    { rejectWithValue }
  ) => {
    try {
      // Prepare the request payload with the required parameters
      const payload = {
        Cartid: Cartid,
        orderCode: orderCode,
        customerId: customerId,
        
      PaymentMode: PaymentMode,
        paymentService: paymentService,
        PaymentAccountNumber: PaymentAccountNumber,
        customerAccountType: customerAccountType
      };

      // Make the API request to checkout the order
      const response = await axios.post(
        `${API_BASE_URL}/Order/CheckOut`,
        payload
      );

      // Return the response data if the request is successful
      return response.data;
    } catch (error) {
      // Handle error and reject with a message
      return rejectWithValue(
        error.response?.data || "Failed to checkout order"
      );
    }
  }
);
// New async thunk for fetching orders by customer or agent
export const fetchOrdersByCustomer = createAsyncThunk(
  "orders/fetchOrdersByCustomerOrAgent",
  async ({ from, to, customerId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/Order/GetOrderByCustomer`,
        {
          params: { from, to, customerId },
        }
      );
      return response.data; // Ensure this returns the expected data format
    } catch (error) {
      console.error("Error fetching orders by customer:", error); // Log the error for debugging
      return rejectWithValue(
        error.response?.data || "Failed to fetch orders by customer"
      );
    }
  }
);
export const fetchOrdersByThirdParty = createAsyncThunk(
  "orders/fetchOrdersByThirdParty",
  async ({ from, to, ThirdPartyAccountNumber }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/Order/GetOrderByThirdParty`,
        {
          params: { from, to, ThirdPartyAccountNumber },
        }
      );
      return response.data; // Ensure this returns the expected data format
    } catch (error) {
      console.error("Error fetching orders by  agent:", error); // Log the error for debugging
      return rejectWithValue(
        error.response?.data || "Failed to fetch orders by  agent"
      );
    }
  }
);
export const updateOrderTransition = createAsyncThunk(
  "orders/updateOrderTransition",
  async ({ cycleName, orderId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/Order/UpdateOrderTransition/${cycleName}/${orderId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to update order transition"
      );
    }
  }
);

export const fetchOrderLifeCycle = createAsyncThunk(
  "orders/fetchOrderLifeCycle",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/Order/OrderLifeCycle-Get`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch order lifecycle"
      );
    }
  }
);

export const fetchSalesOrderById = createAsyncThunk(
  "orders/fetchSalesOrderById",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/Order/SalesOrderGet/${orderId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch sales order"
      );
    }
  }
);

export const updateOrderDelivery = createAsyncThunk(
  "orders/updateOrderDelivery",
  async (orderCode, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/Order/OrderDeliveryUpdate/${orderCode}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to update order delivery"
      );
    }
  }
);

export const orderAddress = createAsyncThunk(
  "orders/OrderAddress",
  async (
    { customerId, OrderCode, address, geoLocation ,RecipientName, RecipientContactNumber, orderNote},
    { rejectWithValue }
  ) => {
    try {
      // Create both camelCase and PascalCase fields
      const requestData = {
        // camelCase version
        customerId,
        OrderCode,
        address,
        geoLocation,RecipientName,RecipientContactNumber, orderNote,
        
       
      };

      const response = await axios.post(`${API_BASE_URL}/Order/OrderAddress`, requestData);

      // Return the response data if the request is successful
      return response.data;
    } catch (error) {
      // Return the error response if the request fails
      return rejectWithValue(
        error.response?.data || "Failed to update order address"
      );
    }
  }
);

export const fetchOrderDeliveryAddress = createAsyncThunk(
  "orders/fetchOrderDeliveryAddress",
  async (orderCode, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/Order/GetOrderDeliveryAddress/${orderCode}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch delivery address"
      );
    }
  }
);

// Slice
const orderSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [], // Local orders stored here
    salesOrder: [],
    lifeCycle: null,
    deliveryAddress: null,
    deliveryUpdate: null,
    orderDetails: null,
    loading: {
      orders: false,
      salesOrder: false,
      lifeCycle: false,
      deliveryAddress: false,
      deliveryUpdate: false,
    },
    error: {
      orders: null,
      salesOrder: null,
      lifeCycle: null,
      deliveryAddress: null,
      deliveryUpdate: null,
    },
  },
  reducers: {
    // Reducer to add a new order locally
     // Store the local order
     storeLocalOrder: (state, action) => {
      const { userId, orderId } = action.payload;
    
      // Retrieve existing orders from localStorage
      const storedOrders = JSON.parse(localStorage.getItem("userOrders")) || [];
    
      // Check if the order already exists
      const existingOrderIndex = storedOrders.findIndex(
        (order) => order.userId === userId && order.orderId === orderId
      );
    
      // If the order exists, update it, otherwise, add a new order
      if (existingOrderIndex !== -1) {
        storedOrders[existingOrderIndex] = action.payload; // Update existing order
      } else {
        storedOrders.push(action.payload); // Add a new order
      }
    
      // Update the state with the new order list
      state.orders = storedOrders;
    
      // Store the updated orders in localStorage without clearing previous ones
      localStorage.setItem("userOrders", JSON.stringify(storedOrders));
    
      console.log("Orders after storeLocalOrder:", storedOrders);
    },
    
  
    
    // Set loading state for orders
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Set error state for orders
    setError: (state, action) => {
      state.error = action.payload;
    },
  
    fetchOrdersByUser(state, action) {
      const userId = action.payload;
      console.log("UserID for filter:", userId);
      console.log("Orders before filter:", state.orders);
    
      // Filter orders based on the userId
      const filteredOrders = state.orders.filter(
        (order) => order.userId === userId
      );
      
      console.log("Orders after filter:", filteredOrders);
    
      // Update the state with filtered orders
      state.orders = filteredOrders;
    },
    
   clearOrders(state) {
      state.orders = [];
      state.salesOrder = null;
      state.lifeCycle = null;
      state.deliveryAddress = null;
      state.deliveryUpdate = null;
      state.error = {};
      state.loading = {};
    },
  },  extraReducers: (builder) => {
    builder
      .addCase(fetchOrdersByDate.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrdersByDate.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = Array.isArray(action.payload) ? action.payload : []; // Ensure it's an array
      })
      
      .addCase(fetchOrdersByDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error; // Store error information
      })

      // Handle updateOrderTransition similarly
      .addCase(updateOrderTransition.pending, (state) => {
        state.loading = true;
        state.error.orders = null;
      })
      .addCase(updateOrderTransition.fulfilled, (state, action) => {
        state.loading = false;
        const updatedOrder = action.payload; // Ensure `payload` is an order object
        const index = state.orders.findIndex(
          (order) => order.orderId === updatedOrder.orderId
        );
        if (index !== -1) {
          state.orders[index] = updatedOrder; // Update the order in place
        }
      })
      .addCase(updateOrderTransition.rejected, (state, action) => {
        state.loading.orders = false;
        state.error.orders = action.payload; // Capture error message
      })

      .addCase(fetchOrderLifeCycle.pending, (state) => {
        state.loading.lifeCycle = true;
        state.error.lifeCycle = null;
      })
      .addCase(fetchOrderLifeCycle.fulfilled, (state, action) => {
        state.loading.lifeCycle = false;
        state.lifeCycle = action.payload;
      })
      .addCase(fetchOrderLifeCycle.rejected, (state, action) => {
        state.loading.lifeCycle = false;
        state.error.lifeCycle = action.payload;
      })

      .addCase(checkOutOrder.pending, (state) => {
        state.loading.orders = true;
        state.error.orders = null;
      })
      .addCase(checkOutOrder.fulfilled, (state, action) => {
        state.loading.orders = false;
        state.orders = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(checkOutOrder.rejected, (state, action) => {
        state.loading.orders = false;
        state.error.orders = action.payload;
      })

      .addCase(orderAddress.pending, (state) => {
        state.loading.deliveryAddress = true;
        state.error.deliveryAddress = null;
      })
      .addCase(orderAddress.fulfilled, (state, action) => {
        state.loading.deliveryAddress = false;
        state.deliveryAddress = action.payload; // Optionally, you may want to store the updated address here
      })
      .addCase(orderAddress.rejected, (state, action) => {
        state.loading.deliveryAddress = false;
        state.error.deliveryAddress = action.payload;
      })

      .addCase(fetchOrderDeliveryAddress.pending, (state) => {
        state.loading.deliveryAddress = true;
        state.error.deliveryAddress = null;
      })
      .addCase(fetchOrderDeliveryAddress.fulfilled, (state, action) => {
        state.loading.deliveryAddress = false;
        state.deliveryAddress = action.payload;
      })
      .addCase(fetchOrderDeliveryAddress.rejected, (state, action) => {
        state.loading.deliveryAddress = false;
        state.error.deliveryAddress = action.payload;
      })

      .addCase(updateOrderDelivery.pending, (state) => {
        state.loading.deliveryUpdate = true;
        state.error.deliveryUpdate = null;
      })
      .addCase(updateOrderDelivery.fulfilled, (state, action) => {
        state.loading.deliveryUpdate = false;
        state.deliveryUpdate = action.payload;
      })
      .addCase(updateOrderDelivery.rejected, (state, action) => {
        state.loading.deliveryUpdate = false;
        state.error.deliveryUpdate = action.payload;
      })
      .addCase(fetchOrdersByCustomer.pending, (state) => {
        state.loading.orders = true;
        state.error.orders = null;
      })
      .addCase(fetchOrdersByCustomer.fulfilled, (state, action) => {
        state.loading.orders = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrdersByCustomer.rejected, (state, action) => {
        state.loading.orders = false;
        state.error.orders = action.payload || "Failed to fetch orders";
      })
      .addCase(fetchOrdersByThirdParty.pending, (state) => {
        state.loading.orders = true;
        state.error.orders = null;
      })
      .addCase(fetchOrdersByThirdParty.fulfilled, (state, action) => {
        state.loading.orders = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrdersByThirdParty.rejected, (state, action) => {
        state.loading.orders = false;
        state.error.orders = action.payload || "Failed to fetch orders";
      })
      .addCase(fetchSalesOrderById.pending, (state) => {
        state.loading.salesOrder = true;
        state.error.salesOrder = null;
      })
      .addCase(fetchSalesOrderById.fulfilled, (state, action) => {
        state.loading.salesOrder = false;
        state.salesOrder = action.payload;
      })
      .addCase(fetchSalesOrderById.rejected, (state, action) => {
        state.loading.salesOrder = false;
        state.error.salesOrder = action.payload || "Failed to fetch sales order";
      });
    },
});

export const { storeLocalOrder, fetchOrdersByUser, clearOrders } = orderSlice.actions;
export default orderSlice.reducer;

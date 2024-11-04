import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchShowrooms } from '../../Redux/slice/showRoomSlice';
import { fetchProductsByShowroom } from '../../Redux/slice/productSlice';
import { addToCart } from '../../Redux/slice/cartSlice';
import { Alert, Card, Row, Col, Button } from 'antd';
import { ShoppingCartOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const ShowroomPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showrooms, loading, error } = useSelector((state) => state.showrooms);
  const { productsByShowroom = {}, loading: loadingProducts, error: errorProducts } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchShowrooms()).unwrap().catch(error => console.error("Error fetching showrooms:", error));
  }, [dispatch]);

  useEffect(() => {
    if (showrooms.length > 0) {
      showrooms.forEach(showroom => dispatch(fetchProductsByShowroom(showroom.showRoomID)).unwrap());
    }
  }, [dispatch, showrooms]);

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    console.log(`Product ${product.productName} added to cart`);
  };

  const renderImage = (imagePath) => {
    const backendBaseURL = 'https://api.salesmate.app';
    const imageUrl = `${backendBaseURL}/Media/Products_Images/${imagePath.split('\\').pop()}`;
    
    return (
      <img
        src={imageUrl}
        alt="Product"
        className="w-full h-40 object-cover rounded-lg"
      />
    );
  };

  const formatCurrency = (amount) => amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (loading || loadingProducts) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-red-500">Shop By Showrooms</h1>
        <Row gutter={16}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Col key={index} xs={12} sm={12} md={8} lg={6} style={{ marginBottom: '20px' }}>
              <div className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    );
  }

  if (error || errorProducts) {
    return <Alert message="Error fetching data" description={error || errorProducts} type="error" />;
  }

  return (
    <div className="container mx-auto p-4">
  <h1 className="text-2xl font-bold mb-4 text-red-500">Shop By Showrooms</h1>
      <Row gutter={[16, 16]}>
        {showrooms
          .filter((showroom) => productsByShowroom[showroom.showRoomID]?.length > 0)
          .slice(0, 4)
          .map((showroom) => {
            const showroomProducts = productsByShowroom[showroom.showRoomID] || [];
            // Create a copy of the array to sort it
            const sortedProducts = [...showroomProducts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            return (
              <Col key={showroom.showRoomID} xs={24} sm={24} md={12} lg={6} style={{ marginBottom: '20px' }}>
                <div className="p-4 border rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-sm md:text-xl font-semibold text-green-800">{showroom.showRoomName}</h2>
                    <Link to={`/showroom/${showroom.showRoomID}`}>
                      <Button 
                        shape="round" 
                        icon={<ArrowRightOutlined />} 
                        className="text-sm bg-red-500 text-white px-4 py-2 md:px-6 md:py-3 md:text-base"
                      >
                        View More
                      </Button>
                    </Link>
                  </div>
                  <Row gutter={[16, 16]}>
                    {sortedProducts.slice(0, 2).map((product) => (
                      <Col 
                        key={product.productID} 
                        xs={12} 
                        sm={12} 
                        md={12} 
                        lg={12} 
                        style={{ marginBottom: '20px' }}
                      >
                        <Card
                          hoverable
                          className="border rounded-lg relative group flex flex-col transition-transform transform hover:scale-105"
                          style={{ height: '100%' }}
                          cover={
                            <div
                              onClick={() => navigate(`/product/${product.productID}`)}
                              className="cursor-pointer"
                            >
                              {renderImage(product.productImage)}
                            </div>
                          }
                        >
                          <Card.Meta 
                            title={<p className="text-gray-700 font-semibold text-sm truncate">{product.productName}</p>} 
                            description={
                              <div className="flex flex-col mt-2">
                                <p className="text-sm font-bold text-red-500">{`₵${formatCurrency(product.price)}`}</p>
                                {product.oldPrice > 0 && (
                                  <p className="text-xs text-gray-500 line-through">{`₵${formatCurrency(product.oldPrice)}`}</p>
                                )}
                              </div>
                            } 
                          />
                          <div
                            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product);
                            }}
                          >
                            <ShoppingCartOutlined className="text-2xl text-primary text-red-500 hover:text-red-600 transition-colors duration-200" />
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              </Col>
            );
          })}
      </Row>
    </div>
  );
};

export default ShowroomPage;

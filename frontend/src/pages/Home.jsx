import Navbar from '../Compoents/Navbar.jsx';
import Footer from '../Compoents/Footer.jsx';
import BestAgency from '../Compoents/BestAgency.jsx';
import Card from '../Compoents/Card.jsx';
import HeroSection from '../Compoents/HeroSection.jsx';
import { useTheme } from '../Compoents/ThemeContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Home = () => {
  const { darkMode } = useTheme();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_BASEURL}/api/destinations`
        );

        if (response?.data?.destinations && Array.isArray(response.data.destinations)) {
          const popularDestinations = response.data.destinations.filter(dest => dest?.popular);
          setDestinations(popularDestinations);
        } else {
          throw new Error('Invalid API response');
        }
      } catch (error) {
        console.error('Error fetching destinations:', error);
        toast.error('Failed to load destinations. Showing fallback data.');

        // Fallback data
        setDestinations([
          {
            _id: 'fallback-1',
            img: '/assets/Hampi-temple.jpg',
            location: 'Hampi, Karnataka',
            name: 'Ancient Hampi Ruins',
            description: 'Explore the UNESCO World Heritage site with ancient temples and ruins.',
            rating: '4.8',
            duration: '2 Days',
            price: '8500'
          },
          {
            _id: 'fallback-2',
            img: '/assets/Mysore-place.jpg',
            location: 'Mysore, Karnataka',
            name: 'Royal Mysore Tour',
            description: 'Visit the magnificent Mysore Palace and experience royal heritage.',
            rating: '4.7',
            duration: '3 Days',
            price: '12000'
          },
          {
            _id: 'fallback-3',
            img: '/assets/Kundamundi.jpg',
            location: 'Kundamundi, Karnataka',
            name: 'Hill Station Retreat',
            description: 'Relax in the serene hills with breathtaking views and fresh air.',
            rating: '4.6',
            duration: '2 Days',
            price: '6500'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  const sampleCards = destinations.map(dest => ({
  img: dest?.img || dest?.image || '/assets/fallback.jpg',
  location: typeof dest?.location === 'string' ? dest.location : '',
  title: typeof dest?.name === 'string' ? dest.name : 'Unknown',
  desc: typeof dest?.description === 'string' ? dest.description.replace(/<[^>]*>/g, '') : '',
  rating: typeof dest?.rating === 'string' || typeof dest?.rating === 'number' ? dest.rating.toString() : '0',
  reviews: '(0 reviews)',
  duration: typeof dest?.duration === 'string' ? dest.duration : '',
  price: typeof dest?.price === 'string' || typeof dest?.price === 'number' ? `$${dest.price}` : '$0'
}));


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-2xl text-gray-600 dark:text-gray-300">Loading...</span>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <HeroSection />
      <BestAgency />

      <div className={`py-16 px-6 md:px-12 transition-colors duration-500 ${darkMode ? 'bg-gray-900' : 'bg-green-50'}`}>
        <h2 className={`text-4xl md:text-5xl font-extrabold text-center mb-12 tracking-tight ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Top Pick Packages
        </h2>

        <Card
          cardsData={sampleCards}
          cardClassName={`transition-transform duration-300 hover:scale-105 shadow-xl rounded-2xl ${darkMode ? 'bg-gray-800/80 hover:bg-gray-700/80' : 'bg-white/80 hover:bg-green-100/80'}`}
        />
      </div>

      <Footer />

      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? 'dark' : 'light'}
      />
    </>
  );
};

export default Home;

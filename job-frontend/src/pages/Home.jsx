import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiSearch } from 'react-icons/fi';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-16">
      <section className="text-center py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-dark-primary mb-6">
            Find Your <span className="text-blue-600 dark:text-blue-400">Dream Job</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-dark-secondary mb-8 max-w-2xl mx-auto">
            Connect with top employers and discover opportunities that match your skills and aspirations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/jobs"
              className="inline-flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
            >
              <FiSearch className="mr-2" />
              Browse Jobs
            </Link>
            {!isAuthenticated && (
              <Link
                to="/signup"
                className="inline-flex items-center px-8 py-3 border border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors font-medium"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      </section>

      
      <section className="bg-blue-600 dark:bg-blue-500 text-white py-16 rounded-lg">
        <div className="max-w-4xl mx-auto text-center mt-10 pt-10">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Take the Next Step?
          </h2>
        
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/signup"
                  className="inline-flex items-center px-8 py-3 bg-white text-blue-600 dark:bg-gray-100 dark:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-200 transition-colors font-medium"
                >
                  Sign Up Now
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center px-8 py-3 border border-white text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
                >
                  Login
                </Link>
              </>
            ) : (
              <>
                
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

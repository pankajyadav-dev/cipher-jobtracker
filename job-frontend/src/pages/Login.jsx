import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    const { email, password } = data;
    const result = await login(email, password);
    if (result.success) {
      toast.success('Logged in successfully!');
      navigate('/');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-8 bg-white dark:bg-dark-secondary rounded-lg shadow-md">
      <form onSubmit={handleSubmit(onSubmit)}>
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-dark-primary">
          Login to Your Account
        </h1>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-dark-secondary">Email Address</label>
          <input
            type="email"
            className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm bg-white dark:bg-dark-accent text-gray-900 dark:text-dark-primary focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-dark-primary'}`}
            {...register('email', { required: 'Email is required' })}
          />
          {errors.email && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.email.message}</p>}
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-dark-secondary">Password</label>
          <input
            type="password"
            className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm bg-white dark:bg-dark-accent text-gray-900 dark:text-dark-primary focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-dark-primary'}`}
            {...register('password', { required: 'Password is required' })}
          />
          {errors.password && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.password.message}</p>}
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-dark-muted">
            Don't have an account? <Link to="/signup" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">Sign up</Link>.
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;

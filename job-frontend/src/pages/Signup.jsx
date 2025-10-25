import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm();

  const onSubmit = async (data) => {
    const { firstname, lastname, email, password, type } = data;
    const result = await signup({ firstname, lastname, email, password, type });
    if (result.success) {
      toast.success('Account created successfully!');
      navigate('/');
    } else {
      toast.error(result.error);
    }
  };

  const password = watch('password');

  return (
    <div className="max-w-md mx-auto mt-8 p-8 bg-white dark:bg-dark-secondary rounded-lg shadow-md">
      <form onSubmit={handleSubmit(onSubmit)}>
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-dark-primary">
          Create Your Account
        </h1>

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-dark-secondary">First Name</label>
          <input
            type="text"
            className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm bg-white dark:bg-dark-accent text-gray-900 dark:text-dark-primary focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.firstname ? 'border-red-500' : 'border-gray-300 dark:border-dark-primary'}`}
            {...register('firstname', {
              required: 'First name is required',
              minLength: { value: 3, message: 'First name must be at least 3 characters' }
            })}
          />
          {errors.firstname && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.firstname.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-dark-secondary">Last Name</label>
          <input
            type="text"
            className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm bg-white dark:bg-dark-accent text-gray-900 dark:text-dark-primary focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.lastname ? 'border-red-500' : 'border-gray-300 dark:border-dark-primary'}`}
            {...register('lastname', {
              required: 'Last name is required',
              minLength: { value: 3, message: 'Last name must be at least 3 characters' }
            })}
          />
          {errors.lastname && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.lastname.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-dark-secondary">Email Address</label>
          <input
            type="email"
            className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm bg-white dark:bg-dark-accent text-gray-900 dark:text-dark-primary focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-dark-primary'}`}
            {...register('email', { required: 'Email is required' })}
          />
          {errors.email && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-dark-secondary">Password</label>
          <input
            type="password"
            className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm bg-white dark:bg-dark-accent text-gray-900 dark:text-dark-primary focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-dark-primary'}`}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' }
            })}
          />
          {errors.password && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-dark-secondary">Confirm Password</label>
          <input
            type="password"
            className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm bg-white dark:bg-dark-accent text-gray-900 dark:text-dark-primary focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-dark-primary'}`}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === password || 'Passwords do not match'
            })}
          />
          {errors.confirmPassword && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 dark:text-dark-secondary">Account Type</label>
          <select
            className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm bg-white dark:bg-dark-accent text-gray-900 dark:text-dark-primary focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.type ? 'border-red-500' : 'border-gray-300 dark:border-dark-primary'}`}
            {...register('type', { required: 'Account type is required' })}
          >
            <option value="">Select account type</option>
            <option value="USER">Member</option>
            <option value="ADMIN">Organisation</option>
          </select>
          {errors.type && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.type.message}</p>}
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-dark-muted">
            Already have an account? <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">Login</Link>.
          </p>
        </div>
      </form>
    </div>
  );
};

export default Signup;

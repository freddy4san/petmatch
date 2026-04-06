import { useState } from 'react';

import { loginUser, registerUser } from './api';

const INITIAL_FORM_STATE = {
  confirmPassword: '',
  email: '',
  fullName: '',
  password: '',
  phoneNumber: ''
};

export function useAuthForm({ mode, onAuthSuccess, onNavigate }) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignupSubmit = async (event) => {
    event.preventDefault();

    if (!formData.email.trim() || !formData.password) {
      setErrorMessage('Email and password are required.');
      return;
    }

    if (!formData.fullName.trim() || !formData.phoneNumber.trim()) {
      setErrorMessage('Full name and phone number are required.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const result = await registerUser({
        email: formData.email,
        fullName: formData.fullName,
        password: formData.password,
        phoneNumber: formData.phoneNumber
      });

      onAuthSuccess(result);
      onNavigate('petSetup');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();

    if (!formData.email.trim() || !formData.password) {
      setErrorMessage('Email and password are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const result = await loginUser({
        email: formData.email,
        password: formData.password
      });

      onAuthSuccess(result);
      onNavigate('home');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    errorMessage,
    formData,
    handleChange,
    handleLoginSubmit,
    handleSignupSubmit,
    isSubmitting,
    mode
  };
}

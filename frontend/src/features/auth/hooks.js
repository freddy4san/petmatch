import { useState } from 'react';

import { loginUser, registerUser, requestPasswordReset, resetPassword } from './api';

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

    const signupError = validateSignupForm(formData);

    if (signupError) {
      setErrorMessage(signupError);
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

export function useForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setErrorMessage('Email address is required.');
      setSuccessMessage('');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const result = await requestPasswordReset({ email });
      setSuccessMessage(result?.message || 'If an account exists for that email, a password reset link has been sent.');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    email,
    errorMessage,
    handleSubmit,
    isSubmitting,
    setEmail,
    successMessage
  };
}

export function useResetPasswordForm({ onNavigate, token }) {
  const [formData, setFormData] = useState({
    confirmPassword: '',
    password: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = getPasswordValidationMessages(formData.password, formData.confirmPassword).join(' ');

    if (validationError) {
      setErrorMessage(validationError);
      setSuccessMessage('');
      return;
    }

    if (!token) {
      setErrorMessage('Password reset link is missing or invalid.');
      setSuccessMessage('');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await resetPassword({
        token,
        password: formData.password
      });
      setSuccessMessage('Password reset successful. Redirecting to sign in...');
      clearPasswordResetTokenFromUrl();
      window.setTimeout(() => onNavigate('login'), 900);
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
    handleSubmit,
    isSubmitting,
    successMessage
  };
}

function validateSignupForm(formData) {
  const messages = [];

  if (!formData.fullName.trim()) {
    messages.push('Full name is required.');
  }

  if (!formData.email.trim()) {
    messages.push('Email address is required.');
  }

  if (!formData.phoneNumber.trim()) {
    messages.push('Phone number is required.');
  }

  messages.push(...getPasswordValidationMessages(formData.password, formData.confirmPassword));

  return messages.join(' ');
}

function getPasswordValidationMessages(password, confirmPassword) {
  const messages = [];

  if (!password) {
    messages.push('Password is required.');
  } else if (password.length < 8) {
    messages.push('Password is too weak: use at least 8 characters.');
  }

  if (!confirmPassword) {
    messages.push('Please confirm your password.');
  } else if (password && password !== confirmPassword) {
    messages.push('Passwords do not match: type the same password in both fields.');
  }

  return messages;
}

function clearPasswordResetTokenFromUrl() {
  if (typeof window === 'undefined' || typeof window.history?.replaceState !== 'function') {
    return;
  }

  const url = new URL(window.location.href);

  if (!url.searchParams.has('token')) {
    return;
  }

  url.searchParams.delete('token');
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

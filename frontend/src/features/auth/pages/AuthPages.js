import { ArrowLeft } from 'lucide-react';

import { useAuthForm } from '../hooks';

export function WelcomePage({ onNavigate }) {
  return (
    <div className="h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-start justify-center p-6 pt-12">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
        <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-6xl">🐾</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to PetMatch</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">Find perfect playmates, breeding partners, and new friends for your beloved pets in a safe, verified community.</p>
        <button onClick={() => onNavigate('signup')} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 rounded-full font-semibold mb-4 hover:shadow-lg transition-all">Get Started</button>
        <button onClick={() => onNavigate('login')} className="w-full border-2 border-gray-300 text-purple-600 py-4 rounded-full font-semibold hover:border-purple-600 transition-all">I Have an Account</button>
      </div>
    </div>
  );
}

export function LoginPage({ app, onNavigate }) {
  const {
    errorMessage,
    formData,
    handleChange,
    handleLoginSubmit,
    isSubmitting
  } = useAuthForm({
    mode: 'login',
    onAuthSuccess: app.handleAuthSuccess,
    onNavigate
  });

  return (
    <div className="h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-t-3xl p-8 text-white relative">
          <button onClick={() => onNavigate('welcome')} className="absolute left-4 top-4 w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
            <ArrowLeft size={20} />
          </button>
          <div className="w-20 h-20 mx-auto mb-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span className="text-4xl">🐾</span>
          </div>
          <h2 className="text-2xl font-bold text-center">Welcome Back</h2>
        </div>
        <form className="p-8" onSubmit={handleLoginSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" placeholder="Enter your email" />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input name="password" type="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" placeholder="Enter password" />
          </div>
          {errorMessage ? (
            <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{errorMessage}</p>
          ) : null}
          <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 rounded-full font-semibold mb-4 hover:shadow-lg transition-all disabled:opacity-70">
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
          <p className="text-center text-sm text-gray-600">Don't have an account? <span onClick={() => onNavigate('signup')} className="text-purple-600 font-semibold cursor-pointer hover:underline">Sign Up</span></p>
        </form>
      </div>
    </div>
  );
}

export function SignupPage({ app, onNavigate }) {
  const {
    errorMessage,
    formData,
    handleChange,
    handleSignupSubmit,
    isSubmitting
  } = useAuthForm({
    mode: 'signup',
    onAuthSuccess: app.handleAuthSuccess,
    onNavigate
  });

  return (
    <div className="h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-start justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-t-3xl p-8 text-white relative">
          <button onClick={() => onNavigate('welcome')} className="absolute left-4 top-4 w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
            <ArrowLeft size={20} />
          </button>
          <div className="w-20 h-20 mx-auto mb-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span className="text-4xl">🐾</span>
          </div>
          <h2 className="text-2xl font-bold text-center">Create Account</h2>
        </div>
        <form className="p-8 max-h-96 overflow-y-auto" onSubmit={handleSignupSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
            <input name="fullName" type="text" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Enter your full name" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Enter your email" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
            <input name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Enter phone for verification" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input name="password" type="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Create password" />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
            <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Confirm password" />
          </div>
          {errorMessage ? (
            <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{errorMessage}</p>
          ) : null}
          <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 rounded-full font-semibold hover:shadow-lg transition-all disabled:opacity-70">
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
          <p className="text-center text-sm text-gray-600 mt-4">Already have an account? <span onClick={() => onNavigate('login')} className="text-purple-600 font-semibold cursor-pointer hover:underline">Sign In</span></p>
        </form>
      </div>
    </div>
  );
}

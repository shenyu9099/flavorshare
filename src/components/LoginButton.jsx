import React, { useState } from 'react';
import { LogIn, LogOut, X } from 'lucide-react';
import { useAuth } from './AuthProvider';

const LoginButton = () => {
  const { user, isAuthenticated, login, register, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isRegister) {
        result = await register(formData.name, formData.email, formData.password);
      } else {
        result = await login(formData.email, formData.password);
      }

      if (result.success) {
        setShowModal(false);
        setFormData({ name: '', email: '', password: '' });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-full">
          <div className="w-8 h-8 bg-flavor-orange rounded-full flex items-center justify-center text-white font-medium">
            {user.name?.charAt(0) || 'U'}
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">
            {user.name}
          </span>
        </div>
        <button
          onClick={logout}
          className="flex items-center px-3 py-2 text-gray-600 hover:text-red-500 transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center px-4 py-2 bg-flavor-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
      >
        <LogIn className="w-4 h-4 mr-2" />
        <span>Sign In</span>
      </button>

      {/* Login/Register Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-display text-2xl font-bold text-center mb-6">
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flavor-orange focus:border-transparent"
                    placeholder="Your name"
                    required={isRegister}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flavor-orange focus:border-transparent"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flavor-orange focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-flavor-orange text-white rounded-lg font-medium hover:bg-orange-600 transition disabled:opacity-50"
              >
                {loading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Sign In')}
              </button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-600">
              {isRegister ? (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => setIsRegister(false)}
                    className="text-flavor-orange hover:underline font-medium"
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button
                    onClick={() => setIsRegister(true)}
                    className="text-flavor-orange hover:underline font-medium"
                  >
                    Create one
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginButton;

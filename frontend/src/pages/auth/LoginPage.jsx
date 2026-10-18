import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  Clapperboard,
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Film
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/home';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const user = await login(data);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick autofill buttons for testing
  const autofill = (email, password = 'Password123') => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl rounded-3xl bg-[#0e111a] border border-slate-800/80 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        {/* Left: Form Panel */}
        <div className="p-8 sm:p-12 flex flex-col justify-between text-left">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
                <Clapperboard className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white font-display">Moodie</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mb-6">
              Enter your credentials to access your mood profile and custom recommendations.
            </p>

            {/* Quick Demo Credentials Pill Box */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs mb-6">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-2">
                Quick Demo Accounts (Click to Fill)
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => autofill('student@mca.edu')}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs transition-colors"
                >
                  Demo User: student@mca.edu
                </button>
                <button
                  type="button"
                  onClick={() => autofill('admin@moodie.app')}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs transition-colors"
                >
                  Admin: admin@moodie.app
                </button>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="e.g. student@mca.edu"
                  leftIcon={Mail}
                  error={errors.email?.message}
                  {...register('email', {
                    required: 'Email address is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
              </div>

              <div>
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    leftIcon={Lock}
                    error={errors.password?.message}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-8 text-slate-400 hover:text-slate-200 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-rose-500/30"
                  />
                  <span>Remember session</span>
                </label>
                <span className="text-slate-400 hover:text-rose-400 transition-colors cursor-pointer">
                  Forgot password?
                </span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                isLoading={isSubmitting}
                rightIcon={ArrowRight}
              >
                Sign In
              </Button>
            </form>
          </div>

          <div className="pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400 mt-6">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-rose-400 hover:text-rose-300 font-semibold underline">
              Create an account
            </Link>
          </div>
        </div>

        {/* Right: Visual Cinematic Panel (Hidden on mobile) */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#1b1226] via-[#121524] to-[#090b12] border-l border-slate-800/60 relative overflow-hidden text-left">
          {/* Ambient luminous glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <Badge variant="rose" size="md" className="mb-4">
              AI Mood-Based Cinema
            </Badge>
            <h2 className="text-3xl font-extrabold text-white tracking-tight leading-snug font-display">
              Cinema that matches the heartbeat of your mood.
            </h2>
          </div>

          <div className="relative z-10 space-y-4 my-8">
            <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Zero-Breakage Fallback</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Even without external APIs active, Moodie serves offline recommendations from our bundled 24+ movie catalog.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold">
                <Film className="w-4 h-4" />
                <span>8 Supported Emotional States</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Happy, Sad, Romantic, Angry, Excited, Relaxed, Fearful, and Motivated directly mapped to weighted genre clusters.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>MCA Capstone Project</span>
            <span>React + Vite + Node REST</span>
          </div>
        </div>
      </div>
    </div>
  );
}

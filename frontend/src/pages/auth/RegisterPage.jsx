import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Clapperboard,
  Sparkles,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/home';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const passwordValue = watch('password');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const user = await registerAuth({
        name: data.name,
        email: data.email,
        password: data.password
      });
      toast.success(`Account created successfully! Welcome, ${user.name}`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl rounded-3xl bg-[#0e111a] border border-slate-800/80 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        {/* Left: Registration Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-between text-left">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
                <Clapperboard className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white font-display">Moodie</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
              Create your account
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mb-6">
              Join Moodie to experience emotional movie discovery and personalized watchlists.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="e.g. Maya Lin"
                  leftIcon={User}
                  error={errors.name?.message}
                  {...register('name', {
                    required: 'Full name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters'
                    }
                  })}
                />
              </div>

              <div>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="e.g. maya@example.com"
                  leftIcon={Mail}
                  helperText='Tip: Use an email with "admin" (e.g. admin@moodie.app) for admin testing'
                  error={errors.email?.message}
                  {...register('email', {
                    required: 'Email address is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address format'
                    }
                  })}
                />
              </div>

              <div>
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 8 characters with at least one number"
                    leftIcon={Lock}
                    error={errors.password?.message}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      },
                      validate: {
                        hasNumber: (value) =>
                          /\d/.test(value) || 'Password must contain at least one number'
                      }
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-8 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <div className="relative">
                  <Input
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-type your password"
                    leftIcon={Lock}
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) =>
                        value === passwordValue || 'Passwords do not match'
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-8 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-3"
                isLoading={isSubmitting}
                rightIcon={ArrowRight}
              >
                Create Account
              </Button>
            </form>
          </div>

          <div className="pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400 mt-6">
            Already registered?{' '}
            <Link to="/login" className="text-rose-400 hover:text-rose-300 font-semibold underline">
              Sign into your account
            </Link>
          </div>
        </div>

        {/* Right: Visual Cinematic Panel */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#1d1222] via-[#14172a] to-[#090b12] border-l border-slate-800/60 relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <Badge variant="amber" size="md" className="mb-4">
              Join the Cinema Experience
            </Badge>
            <h2 className="text-3xl font-extrabold text-white tracking-tight leading-snug font-display">
              Never waste an evening choosing a movie again.
            </h2>
          </div>

          <div className="relative z-10 space-y-4 my-8">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-black/40 border border-white/10 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Sentiment Mood Engine</p>
                <p className="text-slate-400 mt-0.5">
                  Natural language emotion parsing without complex query keywords.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-black/40 border border-white/10 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Personal Watchlist Sync</p>
                <p className="text-slate-400 mt-0.5">
                  Save candidates with one tap and organize your favorites collection.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-black/40 border border-white/10 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Guaranteed Fallback Catalog</p>
                <p className="text-slate-400 mt-0.5">
                  High-speed local movie catalog ensures zero downtime.
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>MCA Project Standards</span>
            <span>Security & Validation Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

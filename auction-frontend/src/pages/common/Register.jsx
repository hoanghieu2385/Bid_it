import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { register as registerUser } from '../../services/user-api';
// import '../../assets/styles/client/login.css';
import '../../assets/styles/client/register.css';

function Register() {
	const [form, setForm] = useState({
		email: '',
		phoneNumber: '',
		password: '',
		confirmPassword: '',
		firstName: '',
		lastName: '',
	});

	const [errors, setErrors] = useState({});
	const [message, setMessage] = useState('');
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const navigate = useNavigate();

	useEffect(() => {
		document.title = 'Register | Bid it';
		const token = Cookies.get('jwt');
		if (token) navigate('/');
	}, []);

	useEffect(() => {
		if (message.toLowerCase().includes('check your email')) {
			const timer = setTimeout(() => navigate('/login'), 5000);
			return () => clearTimeout(timer);
		}
	}, [message]);

	const validateField = (name, value) => {
		let error = '';

		switch (name) {
			case 'email': {
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (!emailRegex.test(value)) error = 'Invalid email address';
				break;
			}

			case 'phoneNumber': {
				const phoneRegex = /^[0-9]{9,}$/;
				if (!phoneRegex.test(value)) error = 'Invalid phone number';
				break;
			}

			case 'password': {
				// if (value.length < 6) error = 'Password must be at least 6 characters';
				if (form.confirmPassword && value !== form.confirmPassword) {
					setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
				} else {
					setErrors((prev) => ({ ...prev, confirmPassword: '' }));
				}
				break;
			}

			case 'confirmPassword': {
				if (value !== form.password) error = 'Passwords do not match';
				break;
			}

			default:
				break;
		}

		setErrors((prev) => ({ ...prev, [name]: error }));
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
		validateField(name, value);
	};

	const validateForm = () => {
		return Object.values(errors).every((val) => !val) && Object.values(form).every((val) => val);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const submitForm = {
				email: form.email,
				password: form.password,
				firstName: form.firstName,
				lastName: form.lastName,
				// phoneNumber: form.phoneNumber,
			};

			const res = await registerUser(submitForm);
			setMessage(res.message || 'Registration successful! Please check your email to verify your account.');
		} catch (err) {
			setMessage(err.response?.data?.message || err.message || 'Registration failed.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<section className="login-section vh-100">
			<div className="container-fluid login-container h-custom">
				<div className="row d-flex justify-content-center align-items-center h-100">
					<div className="col-md-9 col-lg-6 col-xl-5">
						<img
							src="../../../public/istockphoto-1077553098-1024x1024.jpg"
							className="img-fluid login-image"
							alt="Auction illustration"
						/>
					</div>

					<div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
						<form onSubmit={handleSubmit} className="login-form">
							<h3 className="mb-4 text-center">Create Your Account</h3>

							{/* First Name + Last Name Row */}
							<div className="register-form-group register-name-row">
								<div className="form-floating">
									<input
										type="text"
										name="firstName"
										className="form-control"
										placeholder="First Name"
										required
										value={form.firstName}
										onChange={handleChange}
									/>
									<label>First Name</label>
								</div>
								<div className="form-floating">
									<input
										type="text"
										name="lastName"
										className="form-control"
										placeholder="Last Name"
										required
										value={form.lastName}
										onChange={handleChange}
									/>
									<label>Last Name</label>
								</div>
							</div>

							{/* Email */}
							<div className="form-floating register-form-group">
								<input
									type="email"
									name="email"
									className={`form-control ${errors.email ? 'is-invalid' : ''}`}
									placeholder="Email"
									required
									value={form.email}
									onChange={handleChange}
								/>
								<label>Email</label>
								{errors.email && <div className="invalid-feedback">{errors.email}</div>}
							</div>

							{/* Phone Number with hint */}
							{/* <div className="form-floating register-form-group position-relative">
								<input
									type="text"
									name="phoneNumber"
									className={`form-control ${errors.phoneNumber ? 'is-invalid' : ''}`}
									placeholder="Phone Number (optional)"
									value={form.phoneNumber}
									onChange={handleChange}
								/>
								<label>Phone Number</label>
							</div> */}

							{/* Password */}
							<div className="form-floating position-relative register-form-group">
								<input
									type={showPassword ? 'text' : 'password'}
									name="password"
									className={`form-control ${errors.password ? 'is-invalid' : ''}`}
									placeholder="Password"
									required
									value={form.password}
									onChange={handleChange}
								/>
								<label>Password</label>
								<span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
									<i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
								</span>
								{errors.password && <div className="invalid-feedback">{errors.password}</div>}
							</div>

							{/* Confirm Password */}
							<div className="form-floating position-relative register-form-group">
								<input
									type={showConfirmPassword ? 'text' : 'password'}
									name="confirmPassword"
									className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
									placeholder="Confirm Password"
									required
									value={form.confirmPassword}
									onChange={handleChange}
								/>
								<label>Confirm Password</label>
								<span className="password-toggle-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
									<i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
								</span>
								{errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
							</div>

							{/* Register Button */}
							<button
								type="submit"
								className="btn btn-primary w-100 mb-3 register-btn"
								disabled={!validateForm() || loading}
							>
								{loading ? (
									<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
								) : (
									'Register'
								)}
							</button>

							{message && (
								<div
									className={`alert mt-3 text-center login-message ${
										message.toLowerCase().includes('successful') ? 'alert-success' : 'alert-danger'
									}`}
								>
									{message}
								</div>
							)}

							<div className="text-center mt-4 pt-2">
								<p className="small fw-bold mb-1">
									Already have an account?{' '}
									<Link to="/login" className="auth-switch-link">
										Login
									</Link>
								</p>
								<p className="small">
									<Link to="/forgot-password" className="auth-forgot-link">
										Forgot password?
									</Link>
								</p>
							</div>
						</form>
					</div>
				</div>
			</div>
		</section>
	);
}

export default Register;

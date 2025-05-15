import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { getAllBanks } from '../../services/bank-api';
import { register as registerUser } from '../../services/user-api';
import '../../assets/styles/client/login.css';
import '../../assets/styles/client/register.css';

function Register() {
	const [form, setForm] = useState({
		email: '',
		phoneNumber: '',
		password: '',
		confirmPassword: '',
		firstName: '',
		lastName: '',
		bankId: '',
		bankAccountNumber: '',
	});
	const [step, setStep] = useState(1);
	const [banks, setBanks] = useState([]);
	const [message, setMessage] = useState('');
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const navigate = useNavigate();

	useEffect(() => {
		document.title = 'Register | Bid it';
	}, []);


	useEffect(() => {
		const token = Cookies.get('jwt');
		if (token) navigate('/');
		getAllBanks().then(setBanks).catch(console.error);
	}, []);

	useEffect(() => {
		if (message.toLowerCase().includes('check your email')) {
			const timer = setTimeout(() => navigate('/login'), 5000);
			return () => clearTimeout(timer);
		}
	}, [message]);

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const validateStepOne = () => {
		return (
			form.email &&
			form.phoneNumber &&
			form.password &&
			form.confirmPassword &&
			form.password === form.confirmPassword
		);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const submitForm = { ...form };
			delete submitForm.confirmPassword;

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

							{/* Step 1 */}
							<div className={`fade-container ${step === 1 ? 'fade-in' : 'fade-out d-none'}`}>
								<div className="form-floating mb-3">
									<input
										type="email"
										name="email"
										className="form-control"
										placeholder="Email"
										required
										value={form.email}
										onChange={handleChange}
									/>
									<label>Email</label>
								</div>
								<div className="form-floating mb-3">
									<input
										type="text"
										name="phoneNumber"
										className="form-control"
										placeholder="Phone Number"
										required
										value={form.phoneNumber}
										onChange={handleChange}
									/>
									<label>Phone Number</label>
								</div>

								<div className="form-floating mb-3 position-relative">
									<input
										type={showPassword ? 'text' : 'password'}
										name="password"
										className={`form-control ${form.confirmPassword && form.password !== form.confirmPassword ? 'is-invalid' : ''}`}
										placeholder="Password"
										required
										value={form.password}
										onChange={handleChange}
									/>
									<label>Password</label>
									<span
										className="password-toggle-icon"
										onClick={() => setShowPassword(!showPassword)}
									>
										<i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
									</span>
								</div>

								<div className="form-floating mb-3 position-relative">
									<input
										type={showConfirmPassword ? 'text' : 'password'}
										name="confirmPassword"
										className={`form-control ${form.confirmPassword && form.password !== form.confirmPassword ? 'is-invalid' : ''}`}
										placeholder="Confirm Password"
										required
										value={form.confirmPassword}
										onChange={handleChange}
									/>
									<label>Confirm Password</label>
									<span
										className="password-toggle-icon"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									>
										<i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
									</span>
									{form.confirmPassword && form.password !== form.confirmPassword && (
										<small className="text-danger position-absolute" style={{ top: '100%', left: '0' }}>
											Passwords do not match.
										</small>
									)}
								</div>

								<button
									type="button"
									className="btn btn-primary w-100 mb-3"
									onClick={() => validateStepOne() && setStep(2)}
									disabled={!validateStepOne()}
								>
									Next
								</button>
							</div>

							{/* Step 2 */}
							<div className={`fade-container ${step === 2 ? 'fade-in' : 'fade-out d-none'}`}>
								<div className="row mb-3">
									<div className="col">
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
									</div>
									<div className="col">
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
								</div>

								<div className="form-floating mb-3">
									<select className="form-select" name="bankId" required value={form.bankId} onChange={handleChange}>
										<option value="">Select a bank</option>
										{banks.map((bank) => (
											<option key={bank.id} value={bank.id}>
												{bank.name}
											</option>
										))}
									</select>
									<label>Bank</label>
								</div>

								<div className="form-floating mb-4">
									<input
										type="text"
										name="bankAccountNumber"
										className="form-control"
										placeholder="Bank Account Number"
										value={form.bankAccountNumber}
										onChange={handleChange}
									/>
									<label>Bank Account Number</label>
								</div>

								<div className="d-flex justify-content-between mb-3">
									<button type="button" className="btn btn-outline-secondary" onClick={() => setStep(1)}>
										Back
									</button>
									<button type="submit" className="btn btn-primary w-50" disabled={loading}>
										{loading ? (
											<span className="spinner-border spinner-border" style={{ width: '1.5rem', height: '1.5rem' }} role="status" aria-hidden="true"></span>
										) : (
											'Register'
										)}
									</button>
								</div>
							</div>

							{/* Alert Message */}
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
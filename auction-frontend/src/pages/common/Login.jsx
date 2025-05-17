// src/pages/common/Login.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, getCurrentUser } from '../../services/user-api';
import { UserContext } from '../../contexts/UserContext.jsx';
import '../../assets/styles/client/login.css';

function Login() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [message, setMessage] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);

	const { loginUser } = useContext(UserContext);
	const navigate = useNavigate();

	useEffect(() => {
		document.title = 'Login | Bid it';
	}, []);

	const handleLogin = async (e) => {
		e.preventDefault();
		setMessage('');
		setLoading(true);

		try {
			const response = await login(email, password);
			if (!response.token) {
				setMessage('Login failed: No token received');
				return;
			}
			localStorage.setItem('jwt', response.token);

			try {
				const userData = await getCurrentUser();
				loginUser(userData);
				setMessage('Login successful!');
				navigate('/');
			} catch (err) {
				localStorage.removeItem('jwt');
				setMessage(err.response?.data?.message || 'Invalid token or session expired.');
			}
		} catch (error) {
			setMessage(error.response?.data?.message || 'Login failed.');
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
						<form onSubmit={handleLogin} className="login-form">
							<div className="d-flex flex-row align-items-center justify-content-center justify-content-lg-start mb-3">
								<p className="lead fw-normal mb-0 me-3">Sign in with</p>
								<button type="button" className="btn btn-primary btn-floating mx-1 login-social-btn">
									<i className="fab fa-facebook-f"></i>
								</button>
								<button type="button" className="btn btn-primary btn-floating mx-1 login-social-btn">
									<i className="fab fa-twitter"></i>
								</button>
								<button type="button" className="btn btn-primary btn-floating mx-1 login-social-btn">
									<i className="fab fa-linkedin-in"></i>
								</button>
							</div>

							<div className="login-divider d-flex align-items-center my-4">
								<p className="text-center fw-bold mx-3 mb-0">Or</p>
							</div>

							<div className="form-floating mb-4 login-input-wrapper">
								<input
									type="email"
									id="login-email"
									className="form-control login-input"
									placeholder="Email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
								<label htmlFor="login-email">Email</label>
							</div>

							<div className="form-floating mb-4 position-relative login-input-wrapper">
								<input
									type={showPassword ? 'text' : 'password'}
									id="login-password"
									className="form-control login-input pe-5"
									placeholder="Password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
								/>
								<label htmlFor="login-password">Password</label>
								<span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
									<i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
								</span>
							</div>

							<div className="d-flex justify-content-between align-items-center mb-3">
								<div className="form-check">
									<input className="form-check-input" type="checkbox" id="login-remember" />
									<label className="form-check-label" htmlFor="login-remember">
										Remember me
									</label>
								</div>
								<button type="button" className="btn btn-link p-0" onClick={() => navigate('/forgot-password')}>
									Forgot password?
								</button>
							</div>

							<div className="text-center text-lg-start mt-4 pt-2">
								<button type="submit" className="btn btn-primary btn-lg px-5 w-100 login-submit-btn" disabled={loading}>
									{loading ? (
										<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
									) : (
										'Login'
									)}
								</button>
								<p className="small fw-bold mt-3 mb-0 text-center">
									Don’t have an account?{' '}
									<button
										type="button"
										className="btn btn-link p-0 login-switch-btn"
										onClick={() => navigate('/register')}
									>
										Register
									</button>
								</p>
							</div>

							{message && (
								<div
									className={`alert mt-3 text-center login-message ${
										message.toLowerCase().includes('success') ? 'alert-success' : 'alert-danger'
									}`}
									role="alert"
								>
									{message}
								</div>
							)}
						</form>
					</div>
				</div>
			</div>
		</section>
	);
}

export default Login;

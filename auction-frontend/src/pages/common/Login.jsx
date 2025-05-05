// src/pages/common/Login.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { login, register } from '../../services/user-api';
import { UserContext } from '../../contexts/UserContext.jsx';
import '../../assets/styles/client/login.css';

function Login() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [message, setMessage] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [isLogin] = useState(true);

	const { loginUser } = useContext(UserContext);
	const navigate = useNavigate();

	useEffect(() => {
		const token = Cookies.get('jwt');
		if (token) {
			navigate('/');
		}
	}, []);

	const handleLogin = async (e) => {
		e.preventDefault();
		try {
			const response = await login(username, password);
			if (response.token) {
				Cookies.set('jwt', response.token, { expires: 7 });
				const userData = {
					id: response.id,
					email: response.email,
					firstName: response.firstName,
					lastName: response.lastName,
					score: response.score,
				};
				loginUser(userData);
				setMessage('Login successful!');
				navigate('/');
			} else {
				setMessage('Login failed: Invalid response');
			}
		} catch (error) {
			setMessage(error.message || 'Login failed.');
		}
	};

	const handleRegister = async (e) => {
		e.preventDefault();
		try {
			const response = await register(username, password);
			setMessage(response.message || 'Register successful!');
		} catch (error) {
			setMessage(error.message || 'Registration failed.');
		}
	};

	const toggleForm = () => {
		navigate('/register');
	};

	return (
		<section className="login-section vh-100">
			<div className="container-fluid login-container h-custom">
				<div className="row d-flex justify-content-center align-items-center h-100">
					{/* Auction-themed image */}
					<div className="col-md-9 col-lg-6 col-xl-5">
						<img
							src="../../../public/istockphoto-1077553098-1024x1024.jpg"
							className="img-fluid login-image"
							alt="Auction illustration"
						/>
					</div>

					{/* Login/Register form */}
					<div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
						<form onSubmit={isLogin ? handleLogin : handleRegister} className="login-form">
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

							{/* Username (floating input) */}
							<div className="form-floating mb-4 login-input-wrapper">
								<input
									type="text"
									id="login-username"
									className="form-control login-input"
									placeholder="Username"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									required
								/>
								<label htmlFor="login-username">Username</label>
							</div>

							{/* Password (floating input) */}
							<div className="form-floating mb-3 login-input-wrapper">
								<input
									type={showPassword ? 'text' : 'password'}
									id="login-password"
									className="form-control login-input"
									placeholder="Password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
								/>
								<label htmlFor="login-password">Password</label>
							</div>

							{/* Remember + toggle password */}
							<div className="d-flex justify-content-between align-items-center mb-3">
								<div className="form-check">
									<input className="form-check-input" type="checkbox" id="login-remember" />
									<label className="form-check-label" htmlFor="login-remember">
										Remember me
									</label>
								</div>
								<button
									type="button"
									className="btn btn-sm login-toggle-password"
									onClick={() => setShowPassword(!showPassword)}
								>
									{showPassword ? 'Hide password' : 'Show password'}
								</button>
							</div>

							<div className="text-center text-lg-start mt-4 pt-2">
								<button type="submit" className="btn btn-primary btn-lg px-5 w-100 login-submit-btn">
									{isLogin ? 'Login' : 'Register'}
								</button>
								<p className="small fw-bold mt-3 mb-0 text-center">
									{isLogin ? (
										<>
											Don’t have an account?{' '}
											<button type="button" className="btn btn-link p-0 login-switch-btn" onClick={toggleForm}>
												Register
											</button>
										</>
									) : (
										<>
											Already have an account?{' '}
											<button type="button" className="btn btn-link p-0 login-switch-btn" onClick={toggleForm}>
												Login
											</button>
										</>
									)}
								</p>
							</div>

							{/* Message alert */}
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

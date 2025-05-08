import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:mobile_app/core/constants/app_colors.dart';
import 'package:mobile_app/core/widgets/custom_button.dart';
import 'package:mobile_app/features/auth/screens/login_screen.dart';
import 'package:mobile_app/features/auth/screens/start_screen.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _isPasswordVisible = false;
  bool _isConfirmPasswordVisible = false;
  bool _isTermsAccepted = false;

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _register() async {
    if (!_formKey.currentState!.validate()) return;

    if (!_isTermsAccepted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please agree to the terms and conditions')),
      );
      return;
    }

    try {
      final userCredential = await FirebaseAuth.instance.createUserWithEmailAndPassword(
        email: _emailController.text.trim(),
        password: _passwordController.text.trim(),
      );

      final user = userCredential.user;

      if (user != null) {
        await user.updateDisplayName(
          '${_firstNameController.text.trim()} ${_lastNameController.text.trim()}',
        );

        await FirebaseFirestore.instance.collection('users').doc(user.uid).set({
          'uid': user.uid,
          'email': user.email,
          'firstName': _firstNameController.text.trim(),
          'lastName': _lastNameController.text.trim(),
          'createdAt': FieldValue.serverTimestamp(),
          'role': 'user',
        });

        // Chuyển đến LoginPage kèm thông báo
        if (!mounted) return;
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => const LoginPage(),
          ),
        );
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Registration successful. Please log in to continue.')),
        );
      }
    } on FirebaseAuthException catch (e) {
      String error = 'Registration failed';
      if (e.code == 'email-already-in-use') {
        error = 'This email is already in use.';
      } else if (e.code == 'invalid-email') {
        error = 'Invalid email address.';
      } else if (e.code == 'weak-password') {
        error = 'Password is too weak.';
      }
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error)));
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('An unexpected error occurred.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Container(
          color: AppColors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
          child: Form(
            key: _formKey,
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 20),
                  IconButton(
                    icon: const Icon(Icons.arrow_back, size: 30, color: AppColors.black),
                    onPressed: () => Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(builder: (_) => const StartPage()),
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    "It's a pleasure to meet you!",
                    style: TextStyle(fontSize: 30, fontWeight: FontWeight.bold, color: AppColors.black),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    "Sign up and get started",
                    style: TextStyle(fontSize: 16, color: Colors.grey),
                  ),
                  const SizedBox(height: 40),

                  // Name fields
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _firstNameController,
                          decoration: const InputDecoration(
                            labelText: 'First Name',
                            border: OutlineInputBorder(),
                            filled: true,
                            fillColor: Colors.white,
                          ),
                          validator: (value) =>
                          value == null || value.isEmpty ? 'Enter first name' : null,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: TextFormField(
                          controller: _lastNameController,
                          decoration: const InputDecoration(
                            labelText: 'Last Name',
                            border: OutlineInputBorder(),
                            filled: true,
                            fillColor: Colors.white,
                          ),
                          validator: (value) =>
                          value == null || value.isEmpty ? 'Enter last name' : null,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Email
                  TextFormField(
                    controller: _emailController,
                    decoration: const InputDecoration(
                      labelText: 'Email',
                      border: OutlineInputBorder(),
                      filled: true,
                      fillColor: Colors.white,
                    ),
                    keyboardType: TextInputType.emailAddress,
                    validator: (value) {
                      if (value == null || value.isEmpty) return 'Enter email';
                      if (!RegExp(r'^[^@]+@[^@]+\.[^@]+').hasMatch(value)) return 'Invalid email';
                      return null;
                    },
                  ),
                  const SizedBox(height: 20),

                  // Password
                  TextFormField(
                    controller: _passwordController,
                    obscureText: !_isPasswordVisible,
                    decoration: InputDecoration(
                      labelText: 'Password',
                      border: const OutlineInputBorder(),
                      filled: true,
                      fillColor: Colors.white,
                      suffixIcon: IconButton(
                        icon: Icon(
                          _isPasswordVisible ? Icons.visibility : Icons.visibility_off,
                          color: Colors.grey,
                        ),
                        onPressed: () => setState(() {
                          _isPasswordVisible = !_isPasswordVisible;
                        }),
                      ),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) return 'Enter password';
                      if (value.length < 6) return 'Password must be at least 6 characters';
                      return null;
                    },
                  ),
                  const SizedBox(height: 20),

                  // Confirm Password
                  TextFormField(
                    controller: _confirmPasswordController,
                    obscureText: !_isConfirmPasswordVisible,
                    decoration: InputDecoration(
                      labelText: 'Confirm Password',
                      border: const OutlineInputBorder(),
                      filled: true,
                      fillColor: Colors.white,
                      suffixIcon: IconButton(
                        icon: Icon(
                          _isConfirmPasswordVisible ? Icons.visibility : Icons.visibility_off,
                          color: Colors.grey,
                        ),
                        onPressed: () => setState(() {
                          _isConfirmPasswordVisible = !_isConfirmPasswordVisible;
                        }),
                      ),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) return 'Confirm your password';
                      if (value != _passwordController.text) return 'Passwords do not match';
                      return null;
                    },
                  ),
                  const SizedBox(height: 20),

                  // Terms
                  Row(
                    children: [
                      Checkbox(
                        value: _isTermsAccepted,
                        onChanged: (value) =>
                            setState(() => _isTermsAccepted = value ?? false),
                      ),
                      const Text('I agree to the ', style: TextStyle(color: AppColors.black)),
                      GestureDetector(
                        onTap: () {},
                        child: const Text(
                          'terms and conditions',
                          style: TextStyle(
                            color: Colors.orange,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 30),

                  // Submit
                  CustomButton(
                    text: 'Register',
                    onPressed: _register,
                    backgroundColor: AppColors.black,
                    textColor: AppColors.white,
                  ),
                  const SizedBox(height: 20),

                  // Sign In
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text('Already have an account? ', style: TextStyle(color: AppColors.black)),
                      TextButton(
                        onPressed: () {
                          Navigator.pushReplacement(
                            context,
                            MaterialPageRoute(builder: (_) => const LoginPage()),
                          );
                        },
                        child: const Text(
                          'Sign In',
                          style: TextStyle(
                            color: AppColors.black,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

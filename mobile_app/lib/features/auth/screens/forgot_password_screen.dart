// lib/features/auth/screens/forgot_password_screen.dart
import 'package:flutter/material.dart';
import 'package:mobile_app/core/constants/app_colors.dart';
import 'package:mobile_app/core/widgets/custom_button.dart';
import 'package:mobile_app/features/auth/screens/login_screen.dart';
import 'package:mobile_app/core/services/auth_service.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _emailController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  String? _message;

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _message = null;
    });

    try {
      final result = await AuthService.forgotPassword(_emailController.text.trim());
      if (result != null && result['error'] != true) {
        setState(() {
          _message = 'Reset link sent! Please check your email.';
        });
      } else {
        setState(() {
          _message = result?['message'] ?? 'Failed to send reset link.';
        });
      }
    } catch (e) {
      setState(() {
        _message = 'Error: ${e.toString()}';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: const Text('Forgot Password'),
        ),
        body: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Form(
              key: _formKey,
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                  const SizedBox(height: 20),
              const Text(
                  'Enter your email address below and we will send you a link to reset your password.',
                  style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 30),
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
            const SizedBox(height: 30),
            _isLoading
                ? const Center(child: CircularProgressIndicator())
                : CustomButton(
              text: 'Send Reset Link',
              onPressed: _submit,
              backgroundColor: AppColors.black,
              textColor: AppColors.white,
            ),
            if (_message != null) ...[
        const SizedBox(height: 20),
    Center(
    child: Text(
    _message!,
    style: TextStyle(
    color: _message!.toLowerCase().contains('sent') ? Colors.green : Colors.red,
    ),
    textAlign: TextAlign.center,
    ),
    ),
    ],
    const Spacer(),
    Center(
    child: TextButton(
    onPressed: () => Navigator.pushReplacement(
    context,
    MaterialPageRoute(builder: (_) => const LoginPage()),
    ),
    child: const Text('Back to Login', style: TextStyle(color: Colors.orange)),
    ),
    )
    ],
    ),
    ),
    ),
    );
  }
}

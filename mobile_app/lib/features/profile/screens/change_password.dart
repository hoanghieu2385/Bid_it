// File: change_password_page.dart
// Purpose: Allows the user to change their password

import 'package:flutter/material.dart';
import 'package:mobile_app/core/services/user_service.dart';
import 'package:mobile_app/core/constants/app_colors.dart';

class ChangePasswordPage extends StatefulWidget {
  const ChangePasswordPage({super.key});

  @override
  State<ChangePasswordPage> createState() => _ChangePasswordPageState();
}

class _ChangePasswordPageState extends State<ChangePasswordPage> {
  final _formKey = GlobalKey<FormState>();
  final currentPassword = TextEditingController();
  final newPassword = TextEditingController();
  final confirmPassword = TextEditingController();
  bool isLoading = false;

  Future<void> _handleChangePassword() async {
    if (!_formKey.currentState!.validate()) return;
    if (newPassword.text != confirmPassword.text) {
      _showMessage('New password does not match the confirmation');
      return;
    }

    setState(() => isLoading = true);
    final success = await UserService.changePassword(
      currentPassword.text,
      newPassword.text,
    );
    setState(() => isLoading = false);

    _showMessage(success ? 'Password changed successfully' : 'Password change failed');
    if (success) Navigator.pop(context);
  }

  void _showMessage(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Change Password')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              _buildInput('Current Password', currentPassword, true),
              _buildInput('New Password', newPassword, true),
              _buildInput('Confirm New Password', confirmPassword, true),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: isLoading ? null : _handleChangePassword,
                child: isLoading
                    ? const CircularProgressIndicator()
                    : const Text('Confirm'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInput(String label, TextEditingController controller, bool obscure) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextFormField(
        controller: controller,
        obscureText: obscure,
        decoration: InputDecoration(labelText: label, border: const OutlineInputBorder()),
        validator: (val) => val == null || val.isEmpty ? 'This field is required' : null,
      ),
    );
  }
}

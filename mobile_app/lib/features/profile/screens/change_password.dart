// File: change_password_page.dart
// Purpose: Allows the user to change their password with eye icon and improved UI

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
  bool isCurrentObscured = true;
  bool isNewObscured = true;
  bool isConfirmObscured = true;

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
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              _buildPasswordInput(
                label: 'Current Password',
                controller: currentPassword,
                obscure: isCurrentObscured,
                toggle: () => setState(() => isCurrentObscured = !isCurrentObscured),
              ),
              _buildPasswordInput(
                label: 'New Password',
                controller: newPassword,
                obscure: isNewObscured,
                toggle: () => setState(() => isNewObscured = !isNewObscured),
              ),
              _buildPasswordInput(
                label: 'Confirm New Password',
                controller: confirmPassword,
                obscure: isConfirmObscured,
                toggle: () => setState(() => isConfirmObscured = !isConfirmObscured),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: isLoading ? null : _handleChangePassword,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    backgroundColor: Colors.orange,
                    foregroundColor: Colors.white
                  ),
                  child: isLoading
                      ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                  )
                      : const Text('Confirm', style: TextStyle(fontSize: 16)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPasswordInput({
    required String label,
    required TextEditingController controller,
    required bool obscure,
    required VoidCallback toggle,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: TextFormField(
        controller: controller,
        obscureText: obscure,
        decoration: InputDecoration(
          labelText: label,
          border: const OutlineInputBorder(),
          suffixIcon: IconButton(
            icon: Icon(obscure ? Icons.visibility_off : Icons.visibility),
            onPressed: toggle,
          ),
        ),
        validator: (val) => val == null || val.isEmpty ? 'This field is required' : null,
      ),
    );
  }
}

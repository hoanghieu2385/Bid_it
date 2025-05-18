// lib/features/auth/screens/start_screen.dart
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobile_app/core/constants/app_colors.dart';
import 'package:mobile_app/core/widgets/custom_button.dart';
import 'package:mobile_app/core/utils/navigation.dart';
import 'package:mobile_app/features/auth/screens/login_screen.dart';
import 'package:mobile_app/features/auth/screens/register_screen.dart';
import 'package:mobile_app/features/home/screens/home_screen.dart';

class StartPage extends StatefulWidget {
  const StartPage({super.key});

  @override
  State<StartPage> createState() => _StartPageState();
}

class _StartPageState extends State<StartPage> {
  @override
  void initState() {
    super.initState();
    _checkLoginStatus();
  }

  Future<void> _checkLoginStatus() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    final remember = prefs.getBool('remember_me') ?? false;

    // Only auto-populate if token is present and user selects Remember me
    if (token != null && token.isNotEmpty && remember) {
      Future.microtask(() {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const HomePage()),
        );
      });
    }
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.white,
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('Welcome to', style: TextStyle(fontSize: 24, color: AppColors.black)),
                const SizedBox(height: 10),
                const Text(
                  'AuctionHub',
                  style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: AppColors.black),
                ),
                const SizedBox(height: 50),
                CustomButton(
                  text: 'Register',
                  onPressed: () => navigateTo(context, const RegisterPage()),
                  backgroundColor: AppColors.black,
                  textColor: AppColors.white,
                ),
                const SizedBox(height: 20),
                CustomButton(
                  text: 'Sign In',
                  onPressed: () => navigateTo(context, const LoginPage()),
                  backgroundColor: AppColors.white,
                  textColor: AppColors.black,
                  isOutlined: true,
                ),
                const SizedBox(height: 20),
                TextButton(
                  onPressed: () async {
                    final prefs = await SharedPreferences.getInstance();
                    await prefs.remove('jwt_token'); // xóa token nếu có
                    Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const HomePage()));
                  },
                  child: const Text(
                    'Skip for now',
                    style: TextStyle(fontSize: 16, color: AppColors.black, decoration: TextDecoration.underline),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

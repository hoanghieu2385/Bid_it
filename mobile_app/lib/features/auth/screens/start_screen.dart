import 'package:mobile_app/core/constants/app_colors.dart';
import 'package:mobile_app/core/utils/navigation.dart';
import 'package:mobile_app/core/widgets/custom_button.dart';
import 'package:mobile_app/features/auth/screens/login_screen.dart';
import 'package:mobile_app/features/auth/screens/register_screen.dart';
import 'package:mobile_app/features/home/screens/home_screen.dart';
import 'package:flutter/material.dart';

class StartPage extends StatelessWidget {
  const StartPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.white,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'Welcome to',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w400,
                color: AppColors.black,
              ),
            ),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const SizedBox(width: 10),
                const Text(
                  'AuctionHub',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: AppColors.black,
                    letterSpacing: 1.2,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 50),
            CustomButton(
              text: 'Register',
              onPressed: () {
                navigateTo(context, const RegisterPage());
              },
              backgroundColor: AppColors.black,
              textColor: AppColors.white,
            ),
            const SizedBox(height: 20),
            CustomButton(
              text: 'Sign In',
              onPressed: () {
                navigateTo(context, const LoginPage());
              },
              backgroundColor: AppColors.white,
              textColor: AppColors.black,
              isOutlined: true,
            ),
            const SizedBox(height: 20),
            TextButton(
              onPressed: () {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (context) => const HomePage()),
                );
                print('Skipped');
              },
              child: const Text(
                'Skip for now',
                style: TextStyle(
                  fontSize: 16,
                  color: AppColors.black,
                  decoration: TextDecoration.underline,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
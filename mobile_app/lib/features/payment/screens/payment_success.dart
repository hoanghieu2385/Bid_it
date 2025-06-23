import 'dart:async';
import 'package:flutter/material.dart';
import 'package:mobile_app/features/home/screens/home_screen.dart';

import '../../order/screens/order_detail.dart';

class PaymentSuccessScreen extends StatefulWidget {
  final int auctionId;
  const PaymentSuccessScreen({super.key, required this.auctionId});

  @override
  State<PaymentSuccessScreen> createState() => _PaymentSuccessScreenState();
}

class _PaymentSuccessScreenState extends State<PaymentSuccessScreen> {
  int _secondsRemaining = 5;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startCountdown();
  }

  void _startCountdown() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsRemaining == 1) {
        timer.cancel();
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => HomeScreen(),
          ),

        );
      } else {
        setState(() => _secondsRemaining--);
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;

    return WillPopScope(
      onWillPop: () async {
        Navigator.pushReplacementNamed(context, '/auction-winner');
        return false;
      },
      child: Scaffold(
        backgroundColor: const Color(0xFFF5F5F5),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.check_circle,
                size: screenWidth * 0.2,
                color: const Color(0xFF4CAF50),
              ),
              SizedBox(height: screenHeight * 0.03),
              Text(
                'Payment Successful!',
                style: TextStyle(
                  fontSize: screenWidth * 0.07,
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF1A1A1A),
                ),
              ),
              SizedBox(height: screenHeight * 0.02),
              Text(
                'Thank you for your purchase.',
                style: TextStyle(
                  fontSize: screenWidth * 0.045,
                  color: const Color(0xFF666666),
                ),
              ),
              SizedBox(height: screenHeight * 0.05),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFF4CAF50).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Text(
                  'Redirecting in $_secondsRemaining seconds...',
                  style: TextStyle(
                    fontSize: screenWidth * 0.045,
                    fontWeight: FontWeight.w500,
                    color: const Color(0xFF4CAF50),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// File: lib/core/widgets/custom_bottom_nav.dart
// Chức năng: BottomNavigationBar tái sử dụng được trong toàn ứng dụng

import 'package:flutter/material.dart';
import 'package:mobile_app/core/constants/app_colors.dart';

class CustomBottomNav extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;

  const CustomBottomNav({
    super.key,
    required this.currentIndex,
    required this.onTap, required String title,
  });

  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      type: BottomNavigationBarType.fixed,
      currentIndex: currentIndex,
      selectedItemColor: AppColors.black,
      unselectedItemColor: AppColors.grey,
      onTap: onTap,
      items: const [
        BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
        BottomNavigationBarItem(icon: Icon(Icons.search), label: 'Search'),
        BottomNavigationBarItem(icon: Icon(Icons.add_circle_outline), label: 'Create'),
        BottomNavigationBarItem(icon: Icon(Icons.favorite_border), label: 'Watchlist'),
        BottomNavigationBarItem(icon: Icon(Icons.person_outline), label: 'User'),
      ],
    );
  }
}

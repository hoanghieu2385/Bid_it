import 'package:flutter/material.dart';
import 'package:convex_bottom_bar/convex_bottom_bar.dart';

class CustomBottomNav extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;

  const CustomBottomNav({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ConvexAppBar(
      style: TabStyle.reactCircle,
      backgroundColor: Colors.white,
      activeColor: Colors.orange,
      color: Colors.grey,
      items: const [
        TabItem(icon: Icons.home, title: 'Home'),
        TabItem(icon: Icons.search, title: 'Search'),
        TabItem(icon: Icons.add, title: 'Create'),
        TabItem(icon: Icons.favorite_border, title: 'Watchlist'),
        TabItem(icon: Icons.person_outline, title: 'User'),
      ],
      initialActiveIndex: currentIndex,
      onTap: onTap,
    );
  }
}

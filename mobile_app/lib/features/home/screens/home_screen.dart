// File: home_page.dart
// Chức năng: Màn hình chính của ứng dụng, bao gồm danh sách category từ API và bottom nav

import 'package:flutter/material.dart';
import 'package:mobile_app/core/constants/app_colors.dart';
import 'package:mobile_app/core/services/category_service.dart';
import 'package:mobile_app/core/models/category_model.dart';
import 'package:mobile_app/core/widgets/custom_app_bar.dart';
import 'package:mobile_app/core/widgets/custom_bottom_nav.dart';
import 'package:mobile_app/features/search/screens/search_screen.dart';
import 'package:mobile_app/features/auction/screens/watchlist_screen.dart';
import 'package:mobile_app/features/auction/screens/create_aution.dart';
import 'package:mobile_app/features/profile/screens/user_screen.dart';
import '../../profile/screens/my_autions_screen.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _selectedIndex = 0;

  static const List<Widget> _pages = <Widget>[
    HomeContent(),
    SearchPage(),
    CreateAuctionPage(),
    WatchlistPage(),
    UserPage(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(title: 'AuctionHub'),
      body: _pages[_selectedIndex],
      bottomNavigationBar: CustomBottomNav(
        currentIndex: _selectedIndex,
        onTap: _onItemTapped, title: '',
      ),
    );
  }
}

class HomeContent extends StatefulWidget {
  const HomeContent({super.key});

  @override
  State<HomeContent> createState() => _HomeContentState();
}

class _HomeContentState extends State<HomeContent> {
  List<Category> categories = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    loadCategories();
  }

  Future<void> loadCategories() async {
    try {
      final data = await CategoryService.fetchCategories();
      setState(() {
        categories = data;
        isLoading = false;
      });
    } catch (e) {
      print('Error loading categories: \$e');
      setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          child: TextField(
            decoration: InputDecoration(
              hintText: 'Search',
              prefixIcon: const Icon(Icons.search, color: AppColors.grey),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8.0),
                borderSide: const BorderSide(color: AppColors.grey),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8.0),
                borderSide: const BorderSide(color: AppColors.grey),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8.0),
                borderSide: const BorderSide(color: AppColors.black),
              ),
            ),
            onChanged: (value) {
              print('Search query: \$value');
            },
          ),
        ),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          child: Text('Categories', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        ),
        SizedBox(
          height: 100,
          child: isLoading
              ? const Center(child: CircularProgressIndicator())
              : ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: categories.length,
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            itemBuilder: (context, index) {
              final category = categories[index];
              return CategoryItem(
                icon: Icons.category,
                label: category.name,
              );
            },
          ),
        ),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Featured Auctions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              Text('View All', style: TextStyle(color: AppColors.black)),
            ],
          ),
        ),
      ]),
    );
  }
}

class CategoryItem extends StatelessWidget {
  final IconData icon;
  final String label;

  const CategoryItem({super.key, required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 16.0),
      child: Column(
        children: [
          CircleAvatar(
            radius: 30,
            backgroundColor: Colors.orange.withOpacity(0.2),
            child: Icon(icon, size: 30, color: Colors.orange),
          ),
          const SizedBox(height: 8),
          Text(label, style: const TextStyle(fontSize: 14)),
        ],
      ),
    );
  }
}

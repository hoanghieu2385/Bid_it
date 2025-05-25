// File: home_page.dart
// Description: Main screen that displays the list of categories and auction sessions,
// including sellerName and categoryName (joined from services)

import 'package:flutter/material.dart';
import 'package:mobile_app/core/constants/app_colors.dart';
import 'package:mobile_app/core/services/category_service.dart';
import 'package:mobile_app/core/services/auction_service.dart';
import 'package:mobile_app/core/models/category_model.dart';
import 'package:mobile_app/core/models/auction_model.dart';
import 'package:mobile_app/core/widgets/custom_app_bar.dart';
import 'package:mobile_app/core/widgets/custom_bottom_nav.dart';
import 'package:mobile_app/features/search/screens/search_screen.dart';
import 'package:mobile_app/features/auction/screens/create_aution.dart';
import 'package:mobile_app/features/auction/screens/watchlist_screen.dart';
import 'package:mobile_app/features/profile/screens/user_screen.dart';

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
  List<Auction> auctions = [];
  bool isLoading = true;
  bool showAllAuctions = false;

  @override
  void initState() {
    super.initState();
    loadData();
  }

  Future<void> loadData() async {
    try {
      final fetchedCategories = await CategoryService.fetchCategories();
      final fetchedAuctions = await AuctionService.fetchAuctions();
      setState(() {
        categories = fetchedCategories;
        auctions = fetchedAuctions;
        isLoading = false;
      });
    } catch (e) {
      print('❌ Error loading data: $e');
      setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return isLoading
        ? const Center(child: CircularProgressIndicator())
        : SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Search Box
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
                print('Search query: $value');
              },
            ),
          ),

          // Category List
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: Text('Categories', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          ),
          SizedBox(
            height: 100,
            child: ListView.builder(
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

          // Auction List Title
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: Text('Auctions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          ),

          // Auction Cards
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            scrollDirection: Axis.vertical,
            itemCount: showAllAuctions ? auctions.length : (auctions.length >= 5 ? 5 : auctions.length),
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            itemBuilder: (context, index) {
              final auction = auctions[index];
              return Container(
                margin: const EdgeInsets.only(bottom: 16.0),
                child: Card(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 3,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      ClipRRect(
                        borderRadius: const BorderRadius.only(
                          topLeft: Radius.circular(12),
                          topRight: Radius.circular(12),
                        ),
                        child: Image.asset(
                          'assets/images/product-img.png',
                          width: double.infinity,
                          height: 160,
                          fit: BoxFit.cover,
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(12.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              auction.title,
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 6),
                            Row(
                              children: [
                                const Icon(Icons.person_outline, size: 14, color: Colors.grey),
                                const SizedBox(width: 4),
                                Text('Seller: ${auction.sellerName}', style: const TextStyle(fontSize: 13)),
                                const SizedBox(width: 16),
                                const Icon(Icons.category_outlined, size: 14, color: Colors.grey),
                                const SizedBox(width: 4),
                                Text('Category: ${auction.categoryName}', style: const TextStyle(fontSize: 13)),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: Colors.orange.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    auction.status,
                                    style: const TextStyle(fontSize: 12, color: Colors.orange),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                const Icon(Icons.access_time, size: 14, color: Colors.grey),
                                const SizedBox(width: 4),
                                Text(
                                  'Start: ${auction.startTime.day}/${auction.startTime.month}/${auction.startTime.year}',
                                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    const Icon(Icons.attach_money, size: 16, color: Colors.orange),
                                    const SizedBox(width: 4),
                                    Text(
                                      '${auction.startingPrice.toStringAsFixed(0)}',
                                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.orange),
                                    ),
                                  ],
                                ),
                                Row(
                                  children: [
                                    const Icon(Icons.calendar_today, size: 14, color: Colors.grey),
                                    const SizedBox(width: 4),
                                    Text(
                                      'Created: ${auction.createdAt.day}/${auction.createdAt.month}/${auction.createdAt.year}',
                                      style: const TextStyle(fontSize: 12, color: Colors.grey),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),

          if (auctions.length > 5)
            Center(
              child: TextButton(
                onPressed: () {
                  setState(() {
                    showAllAuctions = !showAllAuctions;
                  });
                },
                child: Text(
                  showAllAuctions ? 'Show Less' : 'View All',
                  style: const TextStyle(color: Colors.orange),
                ),
              ),
            ),
        ],
      ),
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

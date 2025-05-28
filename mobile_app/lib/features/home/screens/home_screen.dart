// File: home_page.dart
// Description: Home page with modern UI, category filter, improved auction cards, and View All toggle.

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile_app/core/constants/app_colors.dart';
import 'package:mobile_app/core/models/auction_model.dart';
import 'package:mobile_app/core/models/category_model.dart';
import 'package:mobile_app/core/services/auction_service.dart';
import 'package:mobile_app/core/services/category_service.dart';
import 'package:mobile_app/core/widgets/custom_app_bar.dart';
import 'package:mobile_app/core/widgets/custom_bottom_nav.dart';
import 'package:mobile_app/features/auction/screens/category_auctions.dart';
import 'package:mobile_app/features/auction/screens/create_aution.dart';
import 'package:mobile_app/features/auction/screens/watchlist_screen.dart';
import 'package:mobile_app/features/profile/screens/user_screen.dart';
import 'package:mobile_app/features/search/screens/search_screen.dart';

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
        onTap: _onItemTapped,
        title: '',
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
  int displayLimit = 3;

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
      setState(() => isLoading = false);
    }
  }

  Widget _buildAuctionCard(Auction auction) {
    final dateFormatter = DateFormat('dd/MM/yyyy');
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: Card(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        elevation: 3,
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            auction.thumbnailUrl != null
                ? Image.network(
              auction.thumbnailUrl!,
              width: double.infinity,
              height: 180,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Image.asset(
                'assets/images/product-img.png',
                width: double.infinity,
                height: 180,
                fit: BoxFit.cover,
              ),
            )
                : Image.asset(
              'assets/images/product-img.png',
              width: double.infinity,
              height: 180,
              fit: BoxFit.cover,
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(auction.title,
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  Text(
                    auction.description,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 13, color: Colors.black87),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.access_time, size: 14, color: Colors.grey),
                      const SizedBox(width: 4),
                      Text('Start: ${dateFormatter.format(auction.startTime)}',
                          style: const TextStyle(fontSize: 12, color: Colors.grey)),
                      const SizedBox(width: 12),
                      const Icon(Icons.flag, size: 14, color: Colors.grey),
                      const SizedBox(width: 4),
                      Text('End: ${dateFormatter.format(auction.endTime)}',
                          style: const TextStyle(fontSize: 12, color: Colors.grey)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('${auction.startingPrice.toStringAsFixed(0)} VNĐ',
                          style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              color: Colors.orange)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.orange.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(auction.status,
                            style: const TextStyle(fontSize: 12, color: Colors.orange)),
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
  }

  @override
  Widget build(BuildContext context) {
    final visibleAuctions = auctions.take(displayLimit).toList();
    return isLoading
        ? const Center(child: CircularProgressIndicator())
        : RefreshIndicator(
      onRefresh: loadData,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.only(bottom: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: TextField(
                decoration: InputDecoration(
                  hintText: 'Search auctions...',
                  prefixIcon: const Icon(Icons.search, color: AppColors.grey),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: AppColors.grey),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: AppColors.grey),
                  ),
                ),
              ),
            ),

            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Text('Categories',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ),
            SizedBox(
              height: 100,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: categories.length,
                separatorBuilder: (_, __) => const SizedBox(width: 12),
                itemBuilder: (context, index) {
                  final category = categories[index];
                  return GestureDetector(
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => CategoryAuctionsPage(
                          categoryId: category.id,
                          categoryName: category.name,
                        ),
                      ),
                    ),
                    child: Column(
                      children: [
                        CircleAvatar(
                          radius: 30,
                          backgroundColor: Colors.orange.withOpacity(0.2),
                          child: const Icon(Icons.category, color: Colors.orange),
                        ),
                        const SizedBox(height: 6),
                        Text(category.name, style: const TextStyle(fontSize: 13)),
                      ],
                    ),
                  );
                },
              ),
            ),

            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Text('Latest Auctions',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: ListView.builder(
                itemCount: visibleAuctions.length,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemBuilder: (context, index) => _buildAuctionCard(visibleAuctions[index]),
              ),
            ),
            if (displayLimit < auctions.length)
              Center(
                child: TextButton(
                  onPressed: () {
                    setState(() => displayLimit += 3);
                  },
                  child: const Text('View More',
                      style: TextStyle(color: Colors.orange, fontSize: 14)),
                ),
              )
            else if (auctions.length > 3)
              Center(
                child: TextButton(
                  onPressed: () {
                    setState(() => displayLimit = 3);
                  },
                  child: const Text('Show Less',
                      style: TextStyle(color: Colors.orange, fontSize: 14)),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

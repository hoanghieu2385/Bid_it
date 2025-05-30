// File: home_page.dart
// Description: Home Page with auto-updating countdown, keyword search, and auction grouping. Hiển thị ảnh đúng logic mediaUrls > thumbnailUrl > default.

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
import 'package:mobile_app/features/auction/screens/auction_detail.dart';

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
  List<Auction> ongoingAuctions = [];
  List<Auction> upcomingAuctions = [];
  List<Auction> allAuctions = [];
  bool isLoading = true;

  final TextEditingController _searchController = TextEditingController();
  String _searchKeyword = '';
  Timer? _countdownTimer;

  @override
  void initState() {
    super.initState();
    loadData();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() {});
    });
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> loadData() async {
    try {
      final fetchedCategories = await CategoryService.fetchCategories();
      final fetchedAuctions = await AuctionService.fetchAuctions();
      final now = DateTime.now();

      final validAuctions =
      fetchedAuctions.where((a) => a.endTime.isAfter(now)).toList();

      final ongoing = validAuctions
          .where((a) => now.isAfter(a.startTime) && now.isBefore(a.endTime))
          .toList();

      final upcoming = validAuctions
          .where((a) => now.isBefore(a.startTime))
          .toList();

      final all = List<Auction>.from(validAuctions)
        ..sort((a, b) => b.createdAt.compareTo(a.createdAt));

      setState(() {
        categories = fetchedCategories;
        ongoingAuctions = ongoing;
        upcomingAuctions = upcoming;
        allAuctions = all;
        isLoading = false;
      });
    } catch (e) {
      setState(() => isLoading = false);
    }
  }

  String getCountdownText(DateTime time) {
    final now = DateTime.now();
    final difference = time.difference(now);
    if (difference.isNegative) return '00:00:00';
    final hours = difference.inHours;
    final minutes = difference.inMinutes % 60;
    final seconds = difference.inSeconds % 60;
    return '${hours.toString().padLeft(2, '0')}:'
        '${minutes.toString().padLeft(2, '0')}:'
        '${seconds.toString().padLeft(2, '0')}';
  }

  Widget _buildAuctionCard(Auction auction) {
    final dateFormatter = DateFormat('dd/MM/yyyy HH:mm');
    final duration = auction.endTime.difference(DateTime.now());
    final days = duration.inDays;
    final hours = duration.inHours % 24;
    final minutes = duration.inMinutes % 60;
    final seconds = duration.inSeconds % 60;
    String? displayImage;
    if (auction.mediaUrls.isNotEmpty) {
      displayImage = auction.mediaUrls.first;
    } else if (auction.thumbnailUrl != null && auction.thumbnailUrl!.isNotEmpty) {
      displayImage = auction.thumbnailUrl;
    } else {
      displayImage = null;
    }

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => AuctionDetailPage(auction: auction),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.shade300),
          color: Colors.white,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(12), topRight: Radius.circular(12)),
                  child: displayImage != null && displayImage.isNotEmpty
                      ? Image.network(
                    displayImage,
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
                ),
                Positioned(
                  top: 8,
                  left: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.85),
                      borderRadius: BorderRadius.circular(20),
                    ),
                  ),
                ),
              ],
            ),
            Container(
              width: double.infinity,
              color: Colors.black87,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _buildTimeItem('$days', 'Days'),
                      _buildTimeItem('$hours', 'Hours'),
                      _buildTimeItem('$minutes', 'Minutes'),
                      _buildTimeItem('$seconds', 'Seconds'),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Center(
                    child: Text(
                      'End time: ${dateFormatter.format(auction.endTime)}',
                      style: const TextStyle(color: Colors.white, fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(12),
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
                      const Text('Starting Price: '),
                      Text('${auction.startingPrice.toStringAsFixed(0)} đ',
                          style: const TextStyle(color: Colors.green))
                    ],
                  ),
                  Row(
                    children: [
                      const Text('Current Bid: '),
                      Text('${auction.startingPrice.toStringAsFixed(0)} đ',
                          style: const TextStyle(color: Colors.green))
                    ],
                  ),
                  Row(
                    children: [
                      const Text('Bid Count: '),
                      Text('0 bids', style: const TextStyle(color: Colors.green))
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

  Widget _buildTimeItem(String value, String label) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
              fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
        ),
        Text(label, style: const TextStyle(color: Colors.white, fontSize: 12))
      ],
    );
  }

  Widget _buildSection(String title, List<Auction> auctionList) {
    if (auctionList.isEmpty) return const SizedBox.shrink();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            children: [
              Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.orange.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  '${auctionList.length}',
                  style: const TextStyle(color: Colors.orange, fontSize: 13),
                ),
              ),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: ListView.builder(
            itemCount: auctionList.length,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemBuilder: (context, index) => _buildAuctionCard(auctionList[index]),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final filteredAllAuctions = allAuctions
        .where((a) => a.title.toLowerCase().contains(_searchKeyword.toLowerCase()))
        .toList();

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
                controller: _searchController,
                onChanged: (value) {
                  setState(() => _searchKeyword = value.trim());
                },
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
            _buildSection('Ongoing Auctions', ongoingAuctions),
            _buildSection('Upcoming Auctions', upcomingAuctions),
            _buildSection('All Auctions (Newest First)', filteredAllAuctions),
          ],
        ),
      ),
    );
  }
}

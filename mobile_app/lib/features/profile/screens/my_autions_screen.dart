// 📦 File: home_page.dart

import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:mobile_app/core/constants/app_colors.dart';
import 'package:mobile_app/core/widgets/custom_button.dart';
import 'package:mobile_app/features/auth/screens/start_screen.dart';
import 'package:mobile_app/features/search/screens/search_screen.dart';
import 'package:mobile_app/features/auction/screens/watchlist_screen.dart';
import 'package:mobile_app/features/auction/screens/create_aution.dart';
import 'package:mobile_app/features/profile/screens/user_screen.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _selectedIndex = 0;

  final List<Widget> _pages = const [
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

  void _logout() async {
    await FirebaseAuth.instance.signOut();
    if (context.mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const StartPage()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColors.white,
        elevation: 0.5,
        leading: Builder(
          builder: (context) {
            return IconButton(
              icon: const Icon(Icons.menu, color: AppColors.black),
              onPressed: () => Scaffold.of(context).openDrawer(),
            );
          },
        ),
        title: const Text(
          'AuctionHub',
          style: TextStyle(
            color: AppColors.black,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined, color: AppColors.black),
            onPressed: () => print('Notifications pressed'),
          ),
        ],
      ),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            const DrawerHeader(
              decoration: BoxDecoration(color: AppColors.grey),
              child: Text(
                'AuctionHub',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppColors.black,
                ),
              ),
            ),
            _buildDrawerItem(Icons.home, 'Home', 0),
            _buildDrawerItem(Icons.search, 'Search', 1),
            _buildDrawerItem(Icons.add_circle_outline, 'Create Auction', 2),
            _buildDrawerItem(Icons.favorite_border, 'Watchlist', 3),
            _buildDrawerItem(Icons.person_outline, 'Profile', 4),
            ListTile(
              leading: const Icon(Icons.logout),
              title: const Text('Logout'),
              onTap: _logout,
            ),
          ],
        ),
      ),
      body: _pages[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: _selectedIndex,
        selectedItemColor: AppColors.black,
        unselectedItemColor: AppColors.grey,
        onTap: _onItemTapped,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.search), label: 'Search'),
          BottomNavigationBarItem(icon: Icon(Icons.add_circle_outline), label: 'Create'),
          BottomNavigationBarItem(icon: Icon(Icons.favorite_border), label: 'Watchlist'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), label: 'User'),
        ],
      ),
    );
  }

  ListTile _buildDrawerItem(IconData icon, String title, int index) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      onTap: () {
        Navigator.pop(context);
        setState(() {
          _selectedIndex = index;
        });
      },
    );
  }
}

class HomeContent extends StatelessWidget {
  const HomeContent({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: const [
          _SearchBar(),
          _CategoryList(),
          _FeaturedHeader(),
          AuctionList(),
        ],
      ),
    );
  }
}

class _SearchBar extends StatelessWidget {
  const _SearchBar();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
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
        onChanged: (value) => print('Search query: \$value'),
      ),
    );
  }
}

class _CategoryList extends StatelessWidget {
  const _CategoryList();

  @override
  Widget build(BuildContext context) {
    final categories = [
      {'icon': Icons.directions_car, 'label': 'Cars/Trucks'},
      {'icon': Icons.motorcycle, 'label': 'Motorcycles'},
      {'icon': Icons.diamond, 'label': 'Jewelry'},
      {'icon': Icons.watch, 'label': 'Watches'},
      {'icon': Icons.electrical_services, 'label': 'Electronics'},
    ];

    return SizedBox(
      height: 100,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16.0),
        itemCount: categories.length,
        itemBuilder: (context, index) {
          final category = categories[index];
          return Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: Column(
              children: [
                CircleAvatar(
                  radius: 30,
                  backgroundColor: Colors.orange.withOpacity(0.2),
                  child: Icon(category['icon'] as IconData, size: 30, color: Colors.orange),
                ),
                const SizedBox(height: 8),
                Text(category['label'] as String, style: const TextStyle(fontSize: 14)),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _FeaturedHeader extends StatelessWidget {
  const _FeaturedHeader();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text(
            'Featured Auctions',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          TextButton(
            onPressed: () => print('View All pressed'),
            child: const Text('View All', style: TextStyle(color: AppColors.black)),
          ),
        ],
      ),
    );
  }
}

class AuctionList extends StatelessWidget {
  const AuctionList({super.key});

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> auctionItems = [];

    return FutureBuilder(
      future: Future.delayed(const Duration(seconds: 2)), // giả lập loading
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          // hiệu ứng shimmer loading
          return ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: 2,
            itemBuilder: (context, index) => Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
              child: Container(
                height: 220,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          );
        }

        auctionItems.addAll([
          {
            'image': 'assets/images/product-img.jpg',
            'title': 'Toyota AIGID a Class',
            'seller': 'Christopher Anderson',
            'sellerImage': 'assets/images/seller1.jpg',
            'startingPrice': '\$90,000.00',
            'currentBid': '\$90,000.00',
            'bids': 0,
            'timeLeft': '04:15:50:38',
          },
          {
            'image': 'assets/images/product-img.jpg',
            'title': 'Havit HV-091 USB Black',
            'seller': 'Double Game Pad',
            'sellerImage': 'assets/images/seller2.jpg',
            'startingPrice': '\$120.00',
            'currentBid': '\$120.00',
            'bids': 0,
            'timeLeft': '01:15:50:38',
          },
        ]);

        return ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: auctionItems.length,
          itemBuilder: (context, index) {
            final item = auctionItems[index];
            return Card(
              margin: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
              child: Padding(
                padding: const EdgeInsets.all(12.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8.0),
                      child: Image.asset(
                        item['image'],
                        height: 160,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => Container(
                          height: 160,
                          color: AppColors.grey,
                          child: const Icon(Icons.broken_image, color: AppColors.white),
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(item['title'], style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 12,
                          backgroundImage: AssetImage(item['sellerImage']),
                        ),
                        const SizedBox(width: 8),
                        Text(item['seller'], style: const TextStyle(fontSize: 14, color: AppColors.grey)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        _priceColumn('Starting Price', item['startingPrice']),
                        const SizedBox(width: 16),
                        _priceColumn('Current Bid', item['currentBid']),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.gavel, size: 16, color: AppColors.grey),
                            const SizedBox(width: 4),
                            Text('${item['bids']} bids', style: const TextStyle(color: AppColors.grey)),
                          ],
                        ),
                        IconButton(
                          icon: const Icon(Icons.favorite_border),
                          onPressed: () => print('Add to watchlist'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(item['timeLeft'], style: const TextStyle(color: AppColors.grey)),
                    const SizedBox(height: 8),
                    CustomButton(
                      text: 'Join Auction',
                      onPressed: () => print('Join Auction: ${item['title']}'),
                      backgroundColor: AppColors.black,
                      textColor: AppColors.white,
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _priceColumn(String label, String price) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, color: AppColors.grey)),
        Text(price, style: const TextStyle(fontSize: 14)),
      ],
    );
  }
}

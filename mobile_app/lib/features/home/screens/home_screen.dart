import 'package:mobile_app/core/constants/app_colors.dart';
import 'package:mobile_app/core/utils/navigation.dart';
import 'package:mobile_app/core/widgets/custom_button.dart';
import 'package:mobile_app/features/auth/screens/login_screen.dart';
import 'package:mobile_app/features/auth/screens/register_screen.dart';
import 'package:mobile_app/features/search/screens/search_screen.dart';
import 'package:mobile_app/features/auction/screens/watchlist_screen.dart';
import 'package:mobile_app/features/auction/screens/create_aution.dart';
import 'package:mobile_app/features/profile/screens/user_screen.dart';
import 'package:flutter/material.dart';

import '../../auth/screens/start_screen.dart';

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
      appBar: AppBar(
        leading: Builder(
          builder: (BuildContext context) {
            return IconButton(
              icon: const Icon(Icons.menu, color: AppColors.black),
              onPressed: () {
                print('Menu button pressed');
                Scaffold.of(context).openDrawer();
              },
            );
          },
        ),
        title: Row(
          children: [
            const SizedBox(width: 8),
            const Text(
              'AuctionHub',
              style: TextStyle(
                color: AppColors.black,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined, color: AppColors.black),
            onPressed: () {
              print('Notifications pressed');
            },
          ),
        ],
        backgroundColor: AppColors.white,
        elevation: 0,
      ),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            const DrawerHeader(
              decoration: BoxDecoration(
                color: AppColors.grey,
              ),
              child: Row(
                children: [
                  const SizedBox(width: 10),
                  const Text(
                    'AuctionHub',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: AppColors.black,
                    ),
                  ),
                ],
              ),
            ),
            ListTile(
              leading: const Icon(Icons.home),
              title: const Text('Home'),
              onTap: () {
                Navigator.pop(context);
                setState(() {
                  _selectedIndex = 0;
                });
              },
            ),
            ListTile(
              leading: const Icon(Icons.search),
              title: const Text('Search'),
              onTap: () {
                Navigator.pop(context);
                setState(() {
                  _selectedIndex = 1;
                });
              },
            ),
            ListTile(
              leading: const Icon(Icons.add_circle_outline),
              title: const Text('Create Auction'),
              onTap: () {
                Navigator.pop(context);
                setState(() {
                  _selectedIndex = 2;
                });
              },
            ),
            ListTile(
              leading: const Icon(Icons.favorite_border),
              title: const Text('Watchlist'),
              onTap: () {
                Navigator.pop(context);
                setState(() {
                  _selectedIndex = 3;
                });
              },
            ),
            ListTile(
              leading: const Icon(Icons.person_outline),
              title: const Text('Profile'),
              onTap: () {
                Navigator.pop(context);
                setState(() {
                  _selectedIndex = 4;
                });
              },
            ),
            ListTile(
              leading: const Icon(Icons.logout),
              title: const Text('Logout'),
              onTap: () {
                Navigator.pop(context);
                onPressed: () {
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(builder: (context) => const StartPage()),
                  );
                };
              },
            ),
          ],
        ),
      ),
      body: _pages[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.search), label: 'Search'),
          BottomNavigationBarItem(icon: Icon(Icons.add_circle_outline), label: 'Create'),
          BottomNavigationBarItem(icon: Icon(Icons.favorite_border), label: 'Watchlist'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), label: 'User'),
        ],
        currentIndex: _selectedIndex,
        selectedItemColor: AppColors.black,
        unselectedItemColor: AppColors.grey,
        onTap: _onItemTapped,
      ),
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
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search',
                prefixIcon: const Icon(Icons.search, color: AppColors.grey),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8.0),
                  borderSide: BorderSide(color: AppColors.grey),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8.0),
                  borderSide: BorderSide(color: AppColors.grey),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8.0),
                  borderSide: BorderSide(color: AppColors.black),
                ),
              ),
              onChanged: (value) {
                print('Search query: $value');
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: const Text(
              'Categories',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
          ),
          SizedBox(
            height: 100,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              children: const [
                CategoryItem(icon: Icons.directions_car, label: 'Cars/Trucks'),
                CategoryItem(icon: Icons.motorcycle, label: 'Motorcycles'),
                CategoryItem(icon: Icons.diamond, label: 'Jewelry'),
                CategoryItem(icon: Icons.watch, label: 'Watches'),
                CategoryItem(icon: Icons.electrical_services, label: 'Electronics'),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Featured Auctions',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                TextButton(
                  onPressed: () {
                    print('View All pressed');
                  },
                  child: const Text(
                    'View All',
                    style: TextStyle(color: AppColors.black),
                  ),
                ),
              ],
            ),
          ),
          const AuctionList(),
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
          Text(
            label,
            style: const TextStyle(fontSize: 14),
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
    final List<Map<String, dynamic>> auctionItems = [
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
    ];

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: auctionItems.length,
      itemBuilder: (context, index) {
        final item = auctionItems[index];
        return Card(
          margin: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          child: Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8.0),
                        child: Image.asset(
                          item['image'],
                          width: 100,
                          height: 100,

                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return Container(

                              width: 500,
                              height: 200,
                              color: AppColors.grey,
                              child: const Icon(Icons.broken_image, color: AppColors.white), // Icon hình ảnh lỗi, màu trắng
                            );
                          },
                        ),
                      ),
                      Text(
                        item['title'],
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          CircleAvatar(
                            radius: 12,
                            backgroundImage: AssetImage(item['sellerImage']),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            item['seller'],
                            style: const TextStyle(fontSize: 14, color: AppColors.grey),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Starting Price',
                                style: TextStyle(fontSize: 12, color: AppColors.grey),
                              ),
                              Text(
                                item['startingPrice'],
                                style: const TextStyle(fontSize: 14),
                              ),
                            ],
                          ),
                          const SizedBox(width: 16),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Current Bid',
                                style: TextStyle(fontSize: 12, color: AppColors.grey),
                              ),
                              Text(
                                item['currentBid'],
                                style: const TextStyle(fontSize: 14),
                              ),
                            ],
                          ),
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
                              Text(
                                '${item['bids']} bids',
                                style: const TextStyle(fontSize: 14, color: AppColors.grey),
                              ),
                            ],
                          ),
                          IconButton(
                            icon: const Icon(Icons.favorite_border),
                            onPressed: () {
                              print('Add to watchlist');
                            },
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        item['timeLeft'],
                        style: const TextStyle(fontSize: 14, color: AppColors.grey),
                      ),
                      const SizedBox(height: 8),
                      CustomButton(
                        text: 'Join Auction',
                        onPressed: () {
                          print('Join Auction pressed for ${item['title']}');
                        },
                        backgroundColor: AppColors.black,
                        textColor: AppColors.white,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
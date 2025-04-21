import 'package:flutter/material.dart';
import 'package:mobile_app/core/constants/app_colors.dart';

class MyAuctionsScreen extends StatelessWidget {
  const MyAuctionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Auctions'),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: () => _shareAuction(context),
            tooltip: 'Share Auction',
          ),
          IconButton(
            icon: const Icon(Icons.favorite_border),
            onPressed: () => _addToWatchlist(context),
            tooltip: 'Add to Watchlist',
          ),
        ],
      ),
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(child: _buildSearchBar()),
          SliverToBoxAdapter(child: _buildCategoriesHeader()),
          SliverToBoxAdapter(child: _buildCategoryList()),
          SliverToBoxAdapter(child: _buildAuctionsHeader()),
          const SliverFillRemaining(child: MyAuctionList()),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: TextField(
        decoration: InputDecoration(
          hintText: 'Search my auctions',
          prefixIcon: const Icon(Icons.search, color: AppColors.grey),
          filled: true,
          fillColor: AppColors.grey.withOpacity(0.1),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12.0),
            borderSide: BorderSide.none,
          ),
        ),
        onChanged: (value) {
          // Implement search logic here
          debugPrint('Search query: $value');
        },
      ),
    );
  }

  Widget _buildCategoriesHeader() {
    return const Padding(
      padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Text(
        'Categories',
        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildCategoryList() {
    return SizedBox(
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
    );
  }

  Widget _buildAuctionsHeader() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text(
            'My Auctions',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          TextButton(
            onPressed: () {
              debugPrint('View All pressed');
            },
            child: const Text(
              'View All',
              style: TextStyle(color: AppColors.black),
            ),
          ),
        ],
      ),
    );
  }

  void _shareAuction(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Sharing auction...')),
    );
  }

  void _addToWatchlist(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Added to watchlist')),
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
      child: InkWell(
        onTap: () {
          debugPrint('Category $label tapped');
        },
        child: Column(
          mainAxisSize: MainAxisSize.min,
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
      ),
    );
  }
}

class MyAuctionList extends StatelessWidget {
  const MyAuctionList({super.key});

  static const List<Map<String, dynamic>> _auctions = [
    {
      'title': 'Luxury Sedan',
      'category': 'Cars/Trucks',
      'startingPrice': '\$50,000.00',
      'currentBid': '\$55,000.00',
      'bids': 15,
      'status': 'Active',
      'imageUrl': 'assets/images/sedan.jpg',
    },
    {
      'title': 'Vintage Watch',
      'category': 'Watches',
      'startingPrice': '\$5,000.00',
      'currentBid': '\$6,200.00',
      'bids': 8,
      'status': 'Active',
      'imageUrl': 'assets/images/watch.jpg',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: _auctions.length,
      itemBuilder: (context, index) {
        final item = _auctions[index];
        return Card(
          margin: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12.0),
          ),
          child: InkWell(
            onTap: () {
              debugPrint('Auction ${item['title']} tapped');
            },
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8.0),
                    child: Image.asset(
                      item['imageUrl'],
                      width: 80,
                      height: 80,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) =>
                      const Icon(Icons.image_not_supported, size: 80),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item['title'],
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Category: ${item['category']}',
                          style: const TextStyle(
                            fontSize: 14,
                            color: AppColors.grey,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            _buildPriceColumn('Starting', item['startingPrice']),
                            const SizedBox(width: 16),
                            _buildPriceColumn('Current', item['currentBid']),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.gavel,
                                    size: 16, color: AppColors.grey),
                                const SizedBox(width: 4),
                                Text(
                                  '${item['bids']} bids',
                                  style: const TextStyle(
                                    fontSize: 14,
                                    color: AppColors.grey,
                                  ),
                                ),
                              ],
                            ),
                            Text(
                              'Status: ${item['status']}',
                              style: const TextStyle(
                                fontSize: 14,
                                color: AppColors.grey,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildPriceColumn(String label, String price) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '$label Price',
          style: const TextStyle(fontSize: 12, color: AppColors.grey),
        ),
        Text(
          price,
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
        ),
      ],
    );
  }
}
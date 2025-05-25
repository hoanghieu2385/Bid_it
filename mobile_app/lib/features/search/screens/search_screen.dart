import 'package:flutter/material.dart';
import 'package:mobile_app/core/constants/app_colors.dart';
import 'package:mobile_app/core/widgets/custom_button.dart';

class SearchPage extends StatefulWidget {
  const SearchPage({super.key});

  @override
  State<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends State<SearchPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        title: const Text(
          'Search',
          style: TextStyle(
            color: Colors.black,
            fontWeight: FontWeight.bold,
            fontSize: 22,
          ),
        ),
        iconTheme: const IconThemeData(color: Colors.black),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48.0),
          child: Container(
            color: Colors.white,
            child: TabBar(
              controller: _tabController,
              isScrollable: true,
              labelColor: AppColors.black,
              unselectedLabelColor: AppColors.grey,
              indicatorColor: Colors.orange,
              indicatorWeight: 3,
              labelStyle: const TextStyle(fontWeight: FontWeight.w600),
              tabs: const [
                Tab(text: 'Newly Listed'),
                Tab(text: 'Ending Soon'),
                Tab(text: 'Best Bids'),
                Tab(text: 'Most Watched'),
              ],
            ),
          ),
        ),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Material(
              elevation: 1,
              borderRadius: BorderRadius.circular(30),
              child: TextField(
                controller: _searchController,
                decoration: InputDecoration(
                  hintText: 'Search items, categories... ',
                  filled: true,
                  fillColor: Colors.white,
                  prefixIcon: const Icon(Icons.search, color: AppColors.grey),
                  contentPadding: const EdgeInsets.symmetric(vertical: 0),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(30.0),
                    borderSide: BorderSide.none,
                  ),
                ),
                onChanged: (value) {
                  print('Search query: $value');
                },
              ),
            ),
          ),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                SearchResults(tab: 'Newly Listed'),
                SearchResults(tab: 'Ending Soon'),
                SearchResults(tab: 'Best Bids'),
                SearchResults(tab: 'Most Watched'),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class SearchResults extends StatelessWidget {
  final String tab;

  const SearchResults({super.key, required this.tab});

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> searchItems = [
      {
        'image': 'https://via.placeholder.com/150',
        'title': 'BMW AIGID a Class',
        'currentBid': '\$90,000.00',
        'bids': 12,
      },
      {
        'image': 'https://via.placeholder.com/150',
        'title': 'Watercolor 2.5 for Sale',
        'currentBid': '\$90,000.00',
        'bids': 12,
      },
      {
        'image': 'https://via.placeholder.com/150',
        'title': 'Michael Korian Gold',
        'currentBid': '\$90,000.00',
        'bids': 12,
      },
      {
        'image': 'https://via.placeholder.com/150',
        'title': 'Watercolor A8 for Variants',
        'currentBid': '\$90,000.00',
        'bids': 12,
      },
    ];

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      itemCount: searchItems.length,
      itemBuilder: (context, index) {
        final item = searchItems[index];
        return Container(
          margin: const EdgeInsets.only(bottom: 16.0),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.grey.withOpacity(0.1),
                blurRadius: 10,
                offset: const Offset(0, 5),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(12.0),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.asset(
                    'assets/images/product-img.png',
                    width: 90,
                    height: 90,
                    fit: BoxFit.cover,
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
                          fontWeight: FontWeight.w600,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 6),
                      Text(
                        '${item['bids']} bids',
                        style: const TextStyle(fontSize: 13, color: AppColors.grey),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Current Bid: ${item['currentBid']}',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: AppColors.black,
                        ),
                      ),
                      const SizedBox(height: 8),
                      SizedBox(
                        width: 140,
                        child: CustomButton(
                          text: 'Join Auction',
                          onPressed: () {
                            print('Join Auction pressed');
                          },
                          backgroundColor: AppColors.black,
                          textColor: AppColors.white,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.favorite_border),
                  onPressed: () {
                    print('Add to watchlist');
                    },
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

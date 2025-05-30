import 'package:flutter/material.dart';
import 'package:mobile_app/core/constants/app_colors.dart';
import 'package:mobile_app/core/widgets/custom_button.dart';
import 'package:mobile_app/core/models/auction_model.dart';
import 'package:mobile_app/core/services/auction_service.dart';
import '../../auction/screens/auction_detail.dart';

class SearchPage extends StatefulWidget {
  const SearchPage({super.key});

  @override
  State<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends State<SearchPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _searchController = TextEditingController();
  String _searchKeyword = '';

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
        automaticallyImplyLeading: false,
        elevation: 0.5,
        title: const Text(
          'Search',
          style: TextStyle(
            color: Colors.black,
            fontWeight: FontWeight.bold,
            fontSize: 22,
          ),
        ),
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
                  setState(() {
                    _searchKeyword = value.trim();
                  });
                },
              ),
            ),
          ),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                SearchResults(
                  tab: 'new',
                  searchKeyword: _searchKeyword,
                ),
                SearchResults(
                  tab: 'ending',
                  searchKeyword: _searchKeyword,
                ),
                SearchResults(
                  tab: 'bids',
                  searchKeyword: _searchKeyword,
                ),
                const Center(child: Text('Coming soon...')),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class SearchResults extends StatefulWidget {
  final String tab;
  final String searchKeyword;

  const SearchResults({super.key, required this.tab, required this.searchKeyword});

  @override
  State<SearchResults> createState() => _SearchResultsState();
}

class _SearchResultsState extends State<SearchResults> {
  int showCount = 5;

  String? getAuctionImage(Auction auction) {
    if (auction.mediaUrls.isNotEmpty) {
      return auction.mediaUrls.first;
    }
    if (auction.thumbnailUrl != null && auction.thumbnailUrl!.isNotEmpty) {
      return auction.thumbnailUrl;
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<Auction>>(
      future: AuctionService.fetchAuctions(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return Center(child: Text('Failed to load auctions: ${snapshot.error}'));
        }

        List<Auction> auctions = snapshot.data ?? [];
        if (widget.searchKeyword.isNotEmpty) {
          auctions = auctions.where((a) =>
          a.title.toLowerCase().contains(widget.searchKeyword.toLowerCase()) ||
              a.description.toLowerCase().contains(widget.searchKeyword.toLowerCase())).toList();
        }
        if (widget.tab == 'new') {
          auctions.sort((a, b) => b.createdAt.compareTo(a.createdAt));
        } else if (widget.tab == 'ending') {
          auctions.sort((a, b) => a.endTime.compareTo(b.endTime));
        } else if (widget.tab == 'bids') {
          auctions.sort((a, b) => (b.bidCount ?? 0).compareTo(a.bidCount ?? 0));
        }

        if (auctions.isEmpty) {
          return const Center(child: Text('No auctions found.'));
        }

        final displayAuctions = auctions.take(showCount).toList();

        return ListView.builder(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          itemCount: displayAuctions.length + ((auctions.length > 5) ? 1 : 0),
          itemBuilder: (context, index) {
            if (index == displayAuctions.length && auctions.length > 5) {
              return Center(
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 14),
                  child: TextButton(
                    onPressed: () {
                      setState(() {
                        if (showCount < auctions.length) {
                          showCount = (showCount + 5).clamp(5, auctions.length);
                        } else {
                          showCount = 5;
                        }
                      });
                    },
                    child: Text(
                      showCount < auctions.length ? 'View More' : 'Show Less',
                      style: const TextStyle(color: Colors.orange, fontWeight: FontWeight.w600),
                    ),
                  ),
                ),
              );
            }

            final auction = displayAuctions[index];
            final imgUrl = getAuctionImage(auction);

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
                      child: imgUrl != null && imgUrl.isNotEmpty
                          ? Image.network(
                        imgUrl,
                        width: 90,
                        height: 90,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Image.asset(
                          'assets/images/product-img.png',
                          width: 90,
                          height: 90,
                          fit: BoxFit.cover,
                        ),
                      )
                          : Image.asset(
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
                            auction.title,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 6),
                          Text(
                            '${auction.bidCount} bids',
                            style: const TextStyle(fontSize: 13, color: AppColors.grey),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Current Bid: ₫${(auction.currentBid ?? auction.startingPrice).toStringAsFixed(0)}',
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
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => AuctionDetailPage(auction: auction),
                                  ),
                                );
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
                      onPressed: () {},
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
}

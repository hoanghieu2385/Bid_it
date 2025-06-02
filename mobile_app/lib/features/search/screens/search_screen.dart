import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile_app/core/constants/app_colors.dart';
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
                Tab(text: 'Premium Auctions'),
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
                SearchResults(tab: 'new', searchKeyword: _searchKeyword),
                SearchResults(tab: 'ending', searchKeyword: _searchKeyword),
                SearchResults(tab: 'bids', searchKeyword: _searchKeyword),
                SearchResults(tab: 'premium', searchKeyword: _searchKeyword),
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
  int showCount = 6;
  final currencyFormat = NumberFormat.currency(locale: 'vi_VN', symbol: '₫');

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

        auctions = auctions.where((a) =>
        (a.status?.toUpperCase() != 'ENDED') &&
            a.endTime.isAfter(DateTime.now())
        ).toList();

        if (widget.searchKeyword.isNotEmpty) {
          auctions = auctions.where((a) =>
          a.title.toLowerCase().contains(widget.searchKeyword.toLowerCase()) ||
              a.description.toLowerCase().contains(widget.searchKeyword.toLowerCase())
          ).toList();
        }
        if (widget.tab == 'new') {
          auctions.sort((a, b) => b.createdAt.compareTo(a.createdAt));
        } else if (widget.tab == 'ending') {
          final now = DateTime.now();
          final in20Minutes = now.add(const Duration(minutes: 20));
          auctions = auctions
              .where((a) => a.endTime.isAfter(now) && a.endTime.isBefore(in20Minutes))
              .toList();
          auctions.sort((a, b) => a.endTime.compareTo(b.endTime));
        } else if (widget.tab == 'bids') {
          auctions.sort((a, b) => (b.bidCount ?? 0).compareTo(a.bidCount ?? 0));
        } else if (widget.tab == 'premium') {
          auctions.sort((a, b) => (b.startingPrice).compareTo(a.startingPrice));
        }

        if (auctions.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.search_off,
                  size: 60,
                  color: Colors.grey.withOpacity(0.4),
                ),
                const SizedBox(height: 18),
                Text(
                  'No auctions found.',
                  style: TextStyle(
                    fontSize: 18,
                    color: Colors.grey[700],
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Try another keyword or check back later.',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[500],
                  ),
                ),
              ],
            ),
          );
        }

        final displayAuctions = auctions.take(showCount).toList();

        return GridView.builder(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisSpacing: 14,
            crossAxisSpacing: 14,
            childAspectRatio: 0.82, // Tăng tỉ lệ này lên (0.8~1.0) để tránh overflow
          ),
          itemCount: displayAuctions.length + ((auctions.length > 6) ? 1 : 0),
          itemBuilder: (context, index) {
            if (index == displayAuctions.length && auctions.length > 6) {
              return Center(
                child: TextButton(
                  onPressed: () {
                    setState(() {
                      if (showCount < auctions.length) {
                        showCount = (showCount + 6).clamp(6, auctions.length);
                      } else {
                        showCount = 6;
                      }
                    });
                  },
                  child: Text(
                    showCount < auctions.length ? 'View More' : 'Show Less',
                    style: const TextStyle(color: Colors.orange, fontWeight: FontWeight.w600),
                  ),
                ),
              );
            }

            final auction = displayAuctions[index];
            final imgUrl = getAuctionImage(auction);

            return Material(
              borderRadius: BorderRadius.circular(16),
              elevation: 2,
              color: Colors.white,
              child: InkWell(
                borderRadius: BorderRadius.circular(16),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => AuctionDetailPage(auction: auction),
                    ),
                  );
                },
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    ClipRRect(
                      borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(16),
                        topRight: Radius.circular(16),
                      ),
                      child: imgUrl != null && imgUrl.isNotEmpty
                          ? Image.network(
                        imgUrl,
                        height: 96, // Giảm chiều cao hình ảnh xuống
                        fit: BoxFit.cover,
                      )
                          : Image.asset(
                        'assets/images/product-img.png',
                        height: 96,
                        fit: BoxFit.cover,
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(10, 10, 10, 8),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            auction.title,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 15,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(vertical: 2, horizontal: 6),
                            decoration: BoxDecoration(
                              color: Colors.orange.withOpacity(0.10),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.attach_money, size: 13, color: Colors.deepOrange),
                                Text(
                                  currencyFormat.format(auction.startingPrice),
                                  style: const TextStyle(
                                    color: Colors.deepOrange,
                                    fontWeight: FontWeight.w700,
                                    fontSize: 13,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 3),
                          Row(
                            children: [
                              Icon(Icons.gavel, size: 12, color: Colors.grey[600]),
                              const SizedBox(width: 3),
                              Text(
                                '${auction.bidCount} bids',
                                style: TextStyle(fontSize: 12, color: Colors.grey[700]),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          SizedBox(
                            width: double.infinity,
                            height: 30,
                            child: ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.black,
                                foregroundColor: AppColors.white,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                elevation: 0,
                                padding: EdgeInsets.zero,
                              ),
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => AuctionDetailPage(auction: auction),
                                  ),
                                );
                              },
                              child: const Text(
                                'Join Auction',
                                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                              ),
                            ),
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
      },
    );
  }
}

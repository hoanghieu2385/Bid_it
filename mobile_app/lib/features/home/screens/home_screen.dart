import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
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
import 'package:mobile_app/core/services/websocket_service.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});
  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _selectedIndex = 0;
  final WebSocketService _webSocketService = WebSocketService();
  final GlobalKey<HomeContentState> _homeContentKey = GlobalKey<HomeContentState>();
  final GlobalKey<WatchlistPageState> _watchlistKey = GlobalKey<WatchlistPageState>();
  late final List<Widget> _pages;

  @override
  void initState() {
    super.initState();

    _pages = <Widget>[
      HomeContent(key: _homeContentKey),
      const SearchPage(),
      const CreateAuctionPage(),
      WatchlistPage(key: _watchlistKey),
      const UserPage(),
    ];
  }

  void _onItemTapped(int index) async {
    setState(() {
      _selectedIndex = index;
    });
    if (index == 0) {
      // Khi về Home, reload watchlist ids
      await _homeContentKey.currentState?.loadWatchlistIds();
    }
    if (index == 3) {
      await _watchlistKey.currentState?.loadUserAndWatchlist();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(title: 'AuctionHub'),
      body: IndexedStack(
        index: _selectedIndex,
        children: _pages,
      ),
      bottomNavigationBar: CustomBottomNav(
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
      ),
    );
  }
}

class HomeContent extends StatefulWidget {
  const HomeContent({Key? key}) : super(key: key);
  @override
  HomeContentState createState() => HomeContentState();
}

class HomeContentState extends State<HomeContent> {
  List<Category> categories = [];
  List<Auction> ongoingAuctions = [];
  List<Auction> upcomingAuctions = [];
  List<Auction> allAuctions = [];
  bool isLoading = true;

  late final WebSocketService _webSocketService;

  final TextEditingController _searchController = TextEditingController();
  String _searchKeyword = '';
  Timer? _countdownTimer;
  final NumberFormat _vndFormat = NumberFormat("#,##0", "vi_VN");
  Set<int> watchlistIds = {};

  @override
  void initState() {
    super.initState();
    _webSocketService = WebSocketService();
    _initWebSocket();
    loadData();
    loadWatchlistIds();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() {});
    });
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    _webSocketService.disconnect();
    _searchController.dispose();
    super.dispose();
  }

  Future<int?> _getCurrentUserId() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString('user_info');
    if (userJson == null) return null;
    final user = jsonDecode(userJson);
    final rawId = user['id'];
    return rawId is int ? rawId : int.tryParse(rawId.toString());
  }

  Future<void> loadData() async {
    try {
      final fetchedCategories = await CategoryService.fetchCategories();
      final fetchedAuctions = await AuctionService.fetchAuctions();
      final now = DateTime.now();

      final validAuctions = fetchedAuctions.where((a) => a.endTime.isAfter(now)).toList();

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

  Future<void> loadWatchlistIds() async {
    final userId = await _getCurrentUserId();
    if (userId == null) {
      setState(() {
        watchlistIds = {};
      });
      return;
    }
    final prefs = await SharedPreferences.getInstance();
    final list = prefs.getStringList('watchlist_$userId') ?? [];
    setState(() {
      watchlistIds = list.map((e) => int.tryParse(e) ?? -1).where((id) => id > 0).toSet();
    });
  }

  Future<void> _initWebSocket() async {
    final userId = await _getCurrentUserId();
    if (userId == null) return;

    WebSocketService().connect(
      auctionId: -1,
      userId: userId,
      username: 'User$userId',
      onActivity: (data) {
        if (data['type'] == 'NEW_BID') {
          final int auctionId = data['auctionId'];
          final double newBid = data['bidAmount']?.toDouble() ?? 0;
          final int bidCount = data['bidCount'] ?? 0;

          setState(() {
            for (var auction in allAuctions) {
              if (auction.id == auctionId) {
                auction.currentBid = newBid;
                auction.bidCount = bidCount;
                print('📡 Received bid: ${data['bidAmount']}');
                break;
              }
            }
          });
        }
      },
      onError: (err) {
        debugPrint('WebSocket error: $err');
      },
    );
  }

  Future<void> _toggleWatchlist(Auction auction) async {
    final userId = await _getCurrentUserId();
    if (userId == null) {
      _showSnackBar("Please log in to use watchlist.");
      return;
    }
    final prefs = await SharedPreferences.getInstance();
    final key = 'watchlist_$userId';
    List<String> list = prefs.getStringList(key) ?? [];
    final id = auction.id.toString();
    bool added = false;
    if (watchlistIds.contains(auction.id)) {
      list.remove(id);
      added = false;
    } else {
      list.add(id);
      added = true;
    }
    await prefs.setStringList(key, list);
    await loadWatchlistIds();
    _showSnackBar(
      added ? "Added to your watchlist." : "Removed from watchlist.",
      action: SnackBarAction(
        label: "View",
        textColor: Colors.orange,
        onPressed: () async {
          await Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const WatchlistPage()),
          );
          await loadWatchlistIds();
          setState(() {});
        },
      ),
    );
  }

  void _showSnackBar(String message, {SnackBarAction? action}) {
    final snackBar = SnackBar(
      backgroundColor: Colors.white,
      elevation: 10,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      behavior: SnackBarBehavior.floating,
      duration: const Duration(seconds: 3),
      content: Row(
        children: [
          Icon(
            message.contains('Added') ? Icons.favorite : Icons.favorite_border,
            color: Colors.orange,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              message,
              style: const TextStyle(color: Colors.black, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
      action: action,
    );
    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(snackBar);
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

    final String startingPrice = _vndFormat.format(auction.startingPrice);
    final String currentBid = _vndFormat.format(auction.currentBid ?? 0);

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
                  top: 10,
                  right: 12,
                  child: GestureDetector(
                    onTap: () async {
                      await _toggleWatchlist(auction);
                    },
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.orange.withOpacity(0.08),
                            blurRadius: 6,
                          )
                        ],
                      ),
                      padding: const EdgeInsets.all(6),
                      child: Icon(
                        watchlistIds.contains(auction.id)
                            ? Icons.favorite
                            : Icons.favorite_border,
                        color: Colors.orange,
                        size: 24,
                      ),
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
                      Text('$startingPrice đ', style: const TextStyle(color: Colors.green)),
                    ],
                  ),
                  Row(
                    children: [
                      const Text('Current Bid: '),
                      Text('$currentBid đ', style: const TextStyle(color: Colors.green)),
                    ],
                  ),
                  Row(
                    children: [
                      const Text('Bid Count: '),
                      Text('${auction.bidCount} bids', style: const TextStyle(color: Colors.green)),
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
      onRefresh: () async {
        await loadData();
        await loadWatchlistIds();
      },
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

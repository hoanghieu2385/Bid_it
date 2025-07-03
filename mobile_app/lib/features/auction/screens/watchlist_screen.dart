import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobile_app/core/models/auction_model.dart';
import 'package:mobile_app/core/services/auction_service.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_colors.dart';
import 'auction_detail.dart';

class WatchlistPage extends StatefulWidget {
  const WatchlistPage({Key? key}) : super(key: key);

  @override
  WatchlistPageState createState() => WatchlistPageState();
}

class WatchlistPageState extends State<WatchlistPage> with AutomaticKeepAliveClientMixin {
  List<Auction> auctions = [];
  bool isLoading = true;
  int? userId;
  final NumberFormat _vndFormat = NumberFormat("#,##0", "vi_VN");

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    loadUserAndWatchlist();
  }

  Future<void> loadUserAndWatchlist() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString('user_info');
    if (userJson == null) {
      setState(() {
        userId = null;
        auctions = [];
        isLoading = false;
      });
      return;
    }
    final user = jsonDecode(userJson);
    dynamic rawId = user['id'];
    userId = rawId is int ? rawId : int.tryParse(rawId.toString());
    await loadWatchlist();
  }

  Future<List<int>> getWatchlistForCurrentUser() async {
    final prefs = await SharedPreferences.getInstance();
    if (userId == null) return [];
    final key = 'watchlist_$userId';
    final raw = prefs.getStringList(key) ?? [];
    return raw.map((e) => int.tryParse(e) ?? -1).where((id) => id > 0).toList();
  }

  Future<void> loadWatchlist() async {
    if (userId == null) {
      setState(() {
        auctions = [];
        isLoading = false;
      });
      return;
    }
    setState(() => isLoading = true);
    final ids = await getWatchlistForCurrentUser();
    final futures = ids.map((id) => AuctionService.fetchAuctionById(id));
    final fetched = await Future.wait(futures);
    setState(() {
      auctions = fetched.whereType<Auction>().toList();
      isLoading = false;
    });
  }

  Future<void> removeFromWatchlist(int auctionId) async {
    final prefs = await SharedPreferences.getInstance();
    if (userId == null) return;
    final key = 'watchlist_$userId';
    List<String> watchlist = prefs.getStringList(key) ?? [];
    watchlist.remove(auctionId.toString());
    await prefs.setStringList(key, watchlist);
    await loadWatchlist();
  }

  Widget _buildNotLoggedIn(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32.0, vertical: 20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.asset(
              'assets/images/login_illustration.png',
              width: 150,
              height: 150,
              fit: BoxFit.contain,
            ),
            const SizedBox(height: 32),
            Text(
              'Access Restricted',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.orange,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            Text(
              'Please log in to access your watchlist and track your favorite auctions.',
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey,
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 40),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.orange,
                foregroundColor: AppColors.white,
                padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                elevation: 2,
              ),
              onPressed: () {
                Navigator.pushNamed(context, '/login');
              },
              child: const Text(
                'Log In Now',
                style: TextStyle(fontSize: 17, fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAuctionCard(Auction auction) {
    final now = DateTime.now();
    final duration = auction.endTime.difference(now);
    final days = duration.inDays;
    final hours = duration.inHours % 24;
    final minutes = duration.inMinutes % 60;
    final seconds = duration.inSeconds % 60;
    final dateFormatter = DateFormat('dd/MM/yyyy HH:mm');
    final isEnded = auction.endTime.isBefore(now);

    String? displayImage;
    if (auction.mediaUrls.isNotEmpty && auction.mediaUrls.first.isNotEmpty) {
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
        margin: const EdgeInsets.only(bottom: 18),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.grey.shade300),
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.03),
              blurRadius: 8,
              offset: const Offset(0, 4),
            )
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(14), topRight: Radius.circular(14)),
                  child: displayImage != null && displayImage.isNotEmpty
                      ? Image.network(
                    displayImage,
                    width: double.infinity,
                    height: 180,
                    fit: BoxFit.contain,
                    errorBuilder: (_, __, ___) => Image.asset(
                      'assets/images/product-img.png',
                      width: double.infinity,
                      height: 180,
                      fit: BoxFit.contain,
                    ),
                  )
                      : Image.asset(
                    'assets/images/product-img.png',
                    width: double.infinity,
                    height: 180,
                    fit: BoxFit.contain,
                  ),
                ),
                Positioned(
                  top: 12,
                  left: 14,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: isEnded
                          ? Colors.red.withOpacity(0.13)
                          : Colors.green.withOpacity(0.14),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Text(
                      isEnded ? "Ended" : "Ongoing",
                      style: TextStyle(
                        color: isEnded ? Colors.red : Colors.green,
                        fontWeight: FontWeight.w600,
                        fontSize: 13.5,
                      ),
                    ),
                  ),
                ),
                Positioned(
                  top: 12,
                  right: 14,
                  child: InkWell(
                    borderRadius: BorderRadius.circular(20),
                    onTap: () async {
                      final confirmed = await showDialog<bool>(
                        context: context,
                        builder: (ctx) => AlertDialog(
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(18)),
                          title: const Text('Remove from watchlist?'),
                          content: const Text(
                              'Are you sure you want to remove this auction from your watchlist?'),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.of(ctx).pop(false),
                              child: const Text('Cancel'),
                            ),
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.redAccent,
                                foregroundColor: Colors.white,
                              ),
                              onPressed: () => Navigator.of(ctx).pop(true),
                              child: const Text('Remove'),
                            ),
                          ],
                        ),
                      );
                      if (confirmed == true) {
                        await removeFromWatchlist(auction.id);
                      }
                    },
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.red.withOpacity(0.08),
                            blurRadius: 6,
                          )
                        ],
                      ),
                      child: const Icon(Icons.delete_outline, color: Colors.red, size: 22),
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
                      Text('\$$startingPrice', style: const TextStyle(color: Colors.green)),
                    ],
                  ),
                  Row(
                    children: [
                      const Text('Current Bid: '),
                      Text('\$$currentBid', style: const TextStyle(color: Colors.green)),
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

  @override
  Widget build(BuildContext context) {
    super.build(context);
    if (userId == null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('My Watchlist', style: TextStyle(color: Colors.black)),
          backgroundColor: Colors.white,
          iconTheme: const IconThemeData(color: Colors.black),
          elevation: 0.5,
        ),
        body: _buildNotLoggedIn(context),
      );
    }
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Watchlist', style: TextStyle(color: Colors.black)),
        backgroundColor: Colors.white,
        automaticallyImplyLeading: false,
        iconTheme: const IconThemeData(color: Colors.black),
        elevation: 0.5,
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : auctions.isEmpty
          ? Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.favorite_border,
                size: 70, color: Colors.orange.withOpacity(0.35)),
            const SizedBox(height: 20),
            const Text(
              'No items in your watchlist yet.',
              style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w500,
                  color: Colors.black54),
            ),
            const SizedBox(height: 8),
            const Text(
              'Start adding auctions you want to track!',
              style: TextStyle(fontSize: 15, color: Colors.grey),
            ),
          ],
        ),
      )
          : RefreshIndicator(
        onRefresh: loadWatchlist,
        child: ListView.builder(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 20),
          itemCount: auctions.length,
          itemBuilder: (context, index) {
            final auction = auctions[index];
            return _buildAuctionCard(auction);
          },
        ),
      ),
    );
  }
}

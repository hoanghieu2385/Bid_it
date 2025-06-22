import 'dart:async';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobile_app/core/models/auction_model.dart';

import '../../../core/services/auction_service.dart';
import '../../../core/services/bid_service.dart';
import '../../../core/services/user_service.dart';
import '../../../core/services/websocket_service.dart';
import 'edit_auction_page.dart';

class AuctionDetailPage extends StatefulWidget {
  final Auction auction;
  AuctionDetailPage({super.key, required this.auction});

  @override
  State<AuctionDetailPage> createState() => _AuctionDetailPageState();
}

class _AuctionDetailPageState extends State<AuctionDetailPage> with SingleTickerProviderStateMixin {
  late Auction currentAuction;
  late Duration remaining;
  Timer? countdownTimer;
  bool isDescriptionExpanded = false;
  int currentImageIndex = 0;
  late AnimationController fadeInController;
  bool showImageViewer = false;
  late PageController _pageController;
  final TextEditingController bidController = TextEditingController();
  List<int> bidSuggestions = [];
  bool isWatchlisted = false;
  int? selectedBidAmount;
  bool isSeller = false;
  bool isLoggedIn = false;
  String countdownLabel = "Time Left";

  bool canEdit = false;


  @override
  void initState() {
    super.initState();
    currentAuction = widget.auction;
    fadeInController = AnimationController(vsync: this, duration: const Duration(milliseconds: 800))..forward();
    updateRemaining();
    countdownTimer = Timer.periodic(const Duration(seconds: 1), (_) => updateRemaining());
    _pageController = PageController(viewportFraction: 0.95, initialPage: 0);

    _generateBidSuggestions();
    _checkWatchlist();
    _initWebSocket();
    _checkIfSeller();
    _checkLoginStatus();
  }

  Future<void> _loadAuctionDetails() async {
    try {
      final updated = await AuctionService.fetchAuctionById(currentAuction.id);
      if (updated != null) {
        setState(() {
          currentAuction = updated;
          _generateBidSuggestions();
          updateRemaining();
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Reload failed: $e')),
      );
    }
  }



  Future<void> _checkIfSeller() async {
    final user = await UserService.getCurrentUser();
    final now = DateTime.now();

    if (user != null && user['id'] == widget.auction.sellerId) {
      final diff = widget.auction.startTime.difference(now).inMinutes;
      setState(() {
        isSeller = true;
        canEdit = diff >= 60;
      });
    }
  }


  Future<void> _checkLoginStatus() async {
    final token = await UserService.getToken();
    setState(() {
      isLoggedIn = token != null && token.isNotEmpty;
    });
  }

  void updateRemaining() {
    final now = DateTime.now();
    final start = widget.auction.startTime;
    final end = widget.auction.endTime;

    setState(() {
      if (now.isBefore(start)) {
        remaining = start.difference(now);
        countdownLabel = "Starts In";
      } else if (now.isBefore(end)) {
        remaining = end.difference(now);
        countdownLabel = "Ends In";
      } else {
        remaining = Duration.zero;
        countdownLabel = "Ended";
      }
    });
  }

  Future<void> fetchAuctionDetail() async {
    try {
      final updatedAuction = await AuctionService.fetchAuctionById(widget.auction.id);
      if (updatedAuction != null) {
        setState(() {
          widget.auction.currentBid = updatedAuction.currentBid;
          widget.auction.bidCount = updatedAuction.bidCount;
        });
      }
    } catch (e) {
      print('Error fetching auction: $e');
    }
  }

  void _generateBidSuggestions() {
    final auction = widget.auction;
    final increment = auction.incrementAmount.toInt() ?? 0;
    final current = (auction.currentBid ?? auction.startingPrice).toInt() ?? 0;
    if (increment <= 0 || current <= 0) {
      debugPrint('[BidSuggest] Invalid increment: $increment or current: $current');
      return;
    }
    final start = current + increment;
    setState(() {
      bidSuggestions = List.generate(3, (i) => start + increment * i);
      debugPrint('[BidSuggest] Suggestions: $bidSuggestions');
    });
  }

  Future<void> _checkWatchlist() async {
    final prefs = await SharedPreferences.getInstance();
    final list = prefs.getStringList('watchlist') ?? [];
    setState(() {
      isWatchlisted = list.contains(widget.auction.id.toString());
    });
  }

  Future<void> _toggleWatchlist() async {
    final prefs = await SharedPreferences.getInstance();
    List<String> list = prefs.getStringList('watchlist') ?? [];
    final id = widget.auction.id.toString();
    bool added = false;
    if (isWatchlisted) {
      list.remove(id);
      added = false;
    } else {
      list.add(id);
      added = true;
    }
    await prefs.setStringList('watchlist', list);
    setState(() {
      isWatchlisted = !isWatchlisted;
    });
    _showWatchlistSnack(added);
  }

  void _showWatchlistSnack(bool added) {
    final scaffoldMessenger = ScaffoldMessenger.of(context);
    scaffoldMessenger.clearSnackBars();
    final snackBar = SnackBar(
      content: Row(
        children: [
          Icon(added ? Icons.favorite : Icons.favorite_border, color: Colors.white, size: 24),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              added ? 'Added to Watchlist' : 'Removed from Watchlist',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500, color: Colors.white),
            ),
          ),
        ],
      ),
      backgroundColor: added ? const Color(0xFF1E88E5) : Colors.grey[800],
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      duration: const Duration(seconds: 3),
      elevation: 8,
    );
    scaffoldMessenger.showSnackBar(snackBar);
  }

  void _initWebSocket() async {
    final user = await UserService.getCurrentUser();
    final token = await UserService.getToken();

    if (user != null && token != null) {
      WebSocketService().connect(
        auctionId: widget.auction.id,
        userId: user['id'],
        username: user['username'] ?? 'anonymous',
        token: token,
        onInit: (data) {
          setState(() {
            widget.auction.currentBid = (data['currentHighestBid'] as num?)?.toDouble();
            widget.auction.bidCount = data['totalBids'] ?? 0;
          });
        },
        onActivity: (data) {
          debugPrint('[WebSocket] Received: $data');
          if (data['type'] == 'NEW_BID') {
            setState(() {
              widget.auction.currentBid = (data['currentHighestBid'] as num?)?.toDouble() ?? widget.auction.currentBid;
              widget.auction.bidCount = (data['totalBids'] as int?) ?? widget.auction.bidCount;
              _generateBidSuggestions();
            });
          }
          if (data.containsKey('message')) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(data['message']),
                backgroundColor: Colors.black87,
                duration: const Duration(seconds: 2),
              ),
            );
          }
        },
        onError: (err) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('WebSocket Error: ${err.toString()}'),
              backgroundColor: Colors.red,
              duration: const Duration(seconds: 3),
            ),
          );
          Timer.periodic(const Duration(seconds: 1), (timer) async {
            if (!mounted) {
              timer.cancel();
              return;
            }
            await fetchAuctionDetail();
          });
        },
      );
    }
  }

  @override
  void dispose() {
    countdownTimer?.cancel();
    fadeInController.dispose();
    _pageController.dispose();
    bidController.dispose();
    super.dispose();
  }

  String formatDuration(Duration d) {
    if (d == Duration.zero) return "Ended";
    final days = d.inDays;
    final hours = d.inHours % 24;
    final minutes = d.inMinutes % 60;
    final seconds = d.inSeconds % 60;
    if (days > 0) {
      return '${days}d ${hours.toString().padLeft(2, '0')}:${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
    }
    return '${hours.toString().padLeft(2, '0')}:${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  Color getCountdownColor(Duration d) {
    if (d.inSeconds <= 0) return Colors.red;
    if (d.inMinutes < 2) return Colors.orange;
    if (d.inMinutes < 10) return Colors.yellow.shade800;
    return Colors.green;
  }

  @override
  Widget build(BuildContext context) {
    var auction = currentAuction;
    final numberFormat = NumberFormat("#,##0", "vi_VN");
    final mediaList = auction.mediaUrls.isNotEmpty
        ? auction.mediaUrls
        : [auction.thumbnailUrl ?? ''];
    final now = DateTime.now();
    final hasStarted = now.isAfter(auction.startTime);
    final hasEnded = now.isAfter(auction.endTime);

    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(
        title: const Text("Auction Detail", style: TextStyle(color: Colors.black)),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0.3,
        actions: [
          if (canEdit)
            IconButton(
              icon: const Icon(Icons.edit, color: Colors.blue),
              tooltip: 'Edit Auction',
                onPressed: () async {
                  final result = await Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => UpdateAuctionPage(auction: currentAuction),
                    ),
                  );

                  if (result == true) {
                    await _loadAuctionDetails();
                  }
                }

            ),
          IconButton(
            onPressed: _toggleWatchlist,
            icon: Icon(
              isWatchlisted ? Icons.favorite : Icons.favorite_border,
              color: Colors.orange,
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: FadeTransition(
          opacity: fadeInController,
          child: Stack(
            children: [
              SingleChildScrollView(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 500),
                        curve: Curves.ease,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(16),
                          color: Colors.white,
                          boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 8, offset: Offset(0, 2))],
                        ),
                        child: Stack(
                          alignment: Alignment.bottomCenter,
                          children: [
                            SizedBox(
                              height: 200,
                              width: double.infinity,
                              child: PageView.builder(
                                itemCount: mediaList.length,
                                controller: _pageController,
                                physics: const BouncingScrollPhysics(),
                                onPageChanged: (index) => setState(() => currentImageIndex = index),
                                itemBuilder: (context, index) {
                                  final url = mediaList[index];
                                  final selected = index == currentImageIndex;
                                  return GestureDetector(
                                    onTap: () {
                                      setState(() {
                                        showImageViewer = true;
                                      });
                                    },
                                    child: AnimatedOpacity(
                                      duration: const Duration(milliseconds: 400),
                                      opacity: selected ? 1.0 : 0.72,
                                      child: AnimatedScale(
                                        duration: const Duration(milliseconds: 400),
                                        scale: selected ? 1.05 : 1,
                                        curve: Curves.easeOutBack,
                                        child: Padding(
                                          padding: const EdgeInsets.symmetric(horizontal: 2),
                                          child: ClipRRect(
                                            borderRadius: BorderRadius.circular(16),
                                            child: Container(
                                              color: Colors.white,
                                              child: Image.network(
                                                url,
                                                fit: BoxFit.contain,
                                                width: double.infinity,
                                                height: double.infinity,
                                                errorBuilder: (_, __, ___) =>
                                                    Image.asset(
                                                      'assets/images/product-img.png',
                                                      fit: BoxFit.contain,
                                                      width: double.infinity,
                                                      height: double.infinity,
                                                    ),
                                              ),
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ),
                            if (mediaList.length > 1)
                              Padding(
                                padding: const EdgeInsets.only(bottom: 12),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: List.generate(
                                    mediaList.length,
                                        (index) => AnimatedContainer(
                                      duration: const Duration(milliseconds: 300),
                                      margin: const EdgeInsets.symmetric(horizontal: 3),
                                      width: currentImageIndex == index ? 12 : 8,
                                      height: currentImageIndex == index ? 12 : 8,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        color: currentImageIndex == index
                                            ? Colors.orange
                                            : Colors.grey[300],
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      Container(
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.04),
                              blurRadius: 10,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 18),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Expanded(
                                  child: Text(
                                    auction.title,
                                    style: const TextStyle(
                                        fontSize: 22,
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF22223B)
                                    ),
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 5),
                                  decoration: BoxDecoration(
                                    color: auction.status == "UPCOMING"
                                        ? Colors.orange.withOpacity(0.15)
                                        : Colors.green.withOpacity(0.11),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    auction.status,
                                    style: TextStyle(
                                        color: auction.status == "UPCOMING"
                                            ? Colors.orange
                                            : Colors.green[700],
                                        fontWeight: FontWeight.w600,
                                        fontSize: 13
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              auction.description,
                              style: const TextStyle(fontSize: 15, color: Colors.black87),
                              maxLines: isDescriptionExpanded ? null : 2,
                              overflow: isDescriptionExpanded ? null : TextOverflow.ellipsis,
                            ),
                            if (auction.description.length > 80)
                              Align(
                                alignment: Alignment.centerRight,
                                child: GestureDetector(
                                  onTap: () => setState(() => isDescriptionExpanded = !isDescriptionExpanded),
                                  child: Padding(
                                    padding: const EdgeInsets.only(top: 2),
                                    child: Text(
                                      isDescriptionExpanded ? "Show less" : "Read more",
                                      style: const TextStyle(
                                          color: Color(0xFFFF8C32), fontWeight: FontWeight.w500, fontSize: 13),
                                    ),
                                  ),
                                ),
                              ),
                            const SizedBox(height: 10),
                            Row(
                              children: [
                                Expanded(
                                  child: Container(
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFFFF3E8),
                                      borderRadius: BorderRadius.circular(14),
                                    ),
                                    padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 10),
                                    child: Column(
                                      children: [
                                        const Icon(Icons.price_check, color: Color(0xFFF97316), size: 26),
                                        const SizedBox(height: 6),
                                        FittedBox(
                                          fit: BoxFit.scaleDown,
                                          child: Text(
                                            '${numberFormat.format(auction.currentBid ?? 0)} đ',
                                            style: const TextStyle(
                                                fontSize: 20,
                                                color: Color(0xFFF97316),
                                                fontWeight: FontWeight.bold),
                                            maxLines: 1,
                                          ),
                                        ),
                                        const SizedBox(height: 3),
                                        const Text('Current Price', style: TextStyle(color: Color(0xFFF97316), fontSize: 13)),
                                      ],
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Container(
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFE8FDF2),
                                      borderRadius: BorderRadius.circular(14),
                                    ),
                                    padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 10),
                                    child: Column(
                                      children: [
                                        const Icon(Icons.timer, color: Color(0xFF16A34A), size: 25),
                                        const SizedBox(height: 6),
                                        Text(
                                          formatDuration(remaining),
                                          style: TextStyle(
                                            fontSize: 18,
                                            color: getCountdownColor(remaining),
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        const SizedBox(height: 3),
                                        Text(countdownLabel,
                                            style: TextStyle(
                                              color: getCountdownColor(remaining),
                                              fontSize: 13,
                                            )),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 14),
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.1),
                                    blurRadius: 10,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const SizedBox(height: 12),
                                      if (isLoggedIn && !isSeller && bidSuggestions.isNotEmpty)
                                        Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            const Text(
                                              'Select Your Bid',
                                              style: TextStyle(
                                                fontSize: 18,
                                                fontWeight: FontWeight.bold,
                                                color: Color(0xFF22223B),
                                              ),
                                            ),
                                            const SizedBox(height: 12),
                                            Container(
                                              padding: const EdgeInsets.symmetric(vertical: 12),
                                              decoration: BoxDecoration(
                                                color: const Color(0xFFF7FAFC),
                                                borderRadius: BorderRadius.circular(16),
                                                border: Border.all(color: const Color(0xFFE2E8F0)),
                                              ),
                                              child: SingleChildScrollView(
                                                scrollDirection: Axis.horizontal,
                                                padding: const EdgeInsets.symmetric(horizontal: 12),
                                                child: Row(
                                                  children: bidSuggestions.map((price) {
                                                    final isSelected = selectedBidAmount == price;
                                                    return Padding(
                                                      padding: const EdgeInsets.only(right: 12),
                                                      child: GestureDetector(
                                                        onTap: (!hasStarted || hasEnded)
                                                            ? null
                                                            : () {
                                                          setState(() {
                                                            selectedBidAmount = price;
                                                            fetchAuctionDetail().then((_) => _generateBidSuggestions());
                                                          });
                                                        },
                                                        child: AnimatedContainer(
                                                          duration: const Duration(milliseconds: 200),
                                                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                                                          decoration: BoxDecoration(
                                                            color: isSelected ? const Color(0xFFF97316) : Colors.white,
                                                            borderRadius: BorderRadius.circular(12),
                                                            border: Border.all(
                                                              color: isSelected ? const Color(0xFFF97316) : const Color(0xFFD1D5DB),
                                                              width: 1.5,
                                                            ),
                                                            boxShadow: isSelected
                                                                ? [
                                                              BoxShadow(
                                                                color: Colors.orange.withOpacity(0.25),
                                                                blurRadius: 10,
                                                                offset: const Offset(0, 4),
                                                              )
                                                            ]
                                                                : [],
                                                          ),
                                                          child: Text(
                                                            '${NumberFormat("#,##0", "vi_VN").format(price)} đ',
                                                            style: TextStyle(
                                                              fontSize: 16,
                                                              fontWeight: FontWeight.w600,
                                                              color: isSelected ? Colors.white : const Color(0xFF4B5563),
                                                            ),
                                                          ),
                                                        ),
                                                      ),
                                                    );
                                                  }).toList(),
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      if (!isLoggedIn)
                                        Container(
                                          width: double.infinity,
                                          padding: const EdgeInsets.all(16),
                                          decoration: BoxDecoration(
                                            color: Colors.red.shade50,
                                            borderRadius: BorderRadius.circular(8),
                                            border: Border.all(color: Colors.red.shade100),
                                          ),
                                          child: const Text(
                                            'Please log in to place a bid.',
                                            style: TextStyle(color: Colors.red, fontSize: 16),
                                            textAlign: TextAlign.center,
                                          ),
                                        ),
                                      if (isLoggedIn && isSeller)
                                        Container(
                                          width: double.infinity,
                                          padding: const EdgeInsets.all(16),
                                          decoration: BoxDecoration(
                                            color: Colors.orange.shade50,
                                            borderRadius: BorderRadius.circular(8),
                                            border: Border.all(color: Colors.orange.shade100),
                                          ),
                                          child: const Text(
                                            'You cannot bid on your own auction.',
                                            style: TextStyle(color: Colors.orange, fontSize: 16),
                                            textAlign: TextAlign.center,
                                          ),
                                        ),
                                      const SizedBox(height: 16),
                                      SizedBox(
                                        width: double.infinity,
                                        height: 48,
                                        child: ElevatedButton(
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: const Color(0xFFF97316),
                                            foregroundColor: Colors.white,
                                            shape: RoundedRectangleBorder(
                                              borderRadius: BorderRadius.circular(12),
                                            ),
                                            elevation: 2,
                                          ),
                                          onPressed: (!hasStarted || hasEnded || selectedBidAmount == null || isSeller || !isLoggedIn)
                                              ? null
                                              : () async {
                                            final token = await UserService.getToken() ?? '';
                                            if (token.isEmpty) {
                                              ScaffoldMessenger.of(context).showSnackBar(
                                                const SnackBar(
                                                  content: Text('You must be logged in to place a bid.'),
                                                  backgroundColor: Colors.red,
                                                ),
                                              );
                                              return;
                                            }

                                            if (isSeller) {
                                              ScaffoldMessenger.of(context).showSnackBar(
                                                const SnackBar(
                                                  content: Text('You cannot place a bid because you are the seller.'),
                                                  backgroundColor: Colors.orange,
                                                ),
                                              );
                                              return;
                                            }

                                            try {
                                              final user = await UserService.getCurrentUser();
                                              if (user == null) throw 'User not found';
                                              final userId = user['id'] as int;
                                              WebSocketService().sendBid(
                                                auctionId: widget.auction.id,
                                                userId: userId,
                                                bidAmount: selectedBidAmount!.toInt(),
                                              );
                                              await Future.delayed(Duration(milliseconds: 500));
                                              await fetchAuctionDetail();
                                              _generateBidSuggestions();

                                              ScaffoldMessenger.of(context).showSnackBar(
                                                const SnackBar(
                                                  content: Text('Bid sent successfully'),
                                                  backgroundColor: Colors.green,
                                                ),
                                              );

                                              setState(() {
                                                selectedBidAmount = null;
                                              });
                                            } catch (e) {
                                              ScaffoldMessenger.of(context).showSnackBar(
                                                SnackBar(
                                                  content: Text(e.toString()),
                                                  backgroundColor: Colors.red,
                                                ),
                                              );
                                            }
                                          },
                                          child: const Text(
                                            'Place Bid',
                                            style: TextStyle(
                                              fontSize: 15,
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 12),
                            BidHistoryCard(auctionId: widget.auction.id),
                            const SizedBox(height: 10),
                            if (!hasStarted)
                              Container(
                                width: double.infinity,
                                margin: const EdgeInsets.only(top: 10),
                                padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
                                decoration: BoxDecoration(
                                  color: Colors.cyan.shade50,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: Colors.cyan.shade100),
                                ),
                                child: const Text(
                                  "Auction hasn't started yet. Please wait...",
                                  style: TextStyle(color: Colors.cyan, fontSize: 16),
                                  textAlign: TextAlign.center,
                                ),
                              ),
                            if (hasEnded)
                              Container(
                                width: double.infinity,
                                margin: const EdgeInsets.only(top: 10),
                                padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
                                decoration: BoxDecoration(
                                  color: Colors.red.shade50,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: Colors.red.shade100),
                                ),
                                child: const Text(
                                  "Auction has ended.",
                                  style: TextStyle(color: Colors.red, fontSize: 16),
                                  textAlign: TextAlign.center,
                                ),
                              ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],
                  ),
                ),
              ),
              if (showImageViewer)
                Positioned.fill(
                  child: AnimatedOpacity(
                    opacity: showImageViewer ? 1 : 0,
                    duration: const Duration(milliseconds: 200),
                    child: Container(
                      color: Colors.black.withOpacity(0.97),
                      child: Stack(
                        children: [
                          Center(
                            child: InteractiveViewer(
                              minScale: 1,
                              maxScale: 4,
                              child: Image.network(
                                mediaList[currentImageIndex],
                                fit: BoxFit.contain,
                                width: double.infinity,
                                errorBuilder: (_, __, ___) =>
                                    Image.asset(
                                      'assets/images/product-img.png',
                                      fit: BoxFit.contain,
                                      width: double.infinity,
                                    ),
                              ),
                            ),
                          ),
                          Positioned(
                            top: 36,
                            right: 24,
                            child: GestureDetector(
                              onTap: () {
                                setState(() => showImageViewer = false);
                              },
                              child: Container(
                                decoration: BoxDecoration(
                                  color: Colors.black45,
                                  shape: BoxShape.circle,
                                ),
                                padding: const EdgeInsets.all(8),
                                child: const Icon(Icons.close, color: Colors.white, size: 30),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class BidHistoryCard extends StatefulWidget {
  final int auctionId;
  const BidHistoryCard({super.key, required this.auctionId});

  @override
  State<BidHistoryCard> createState() => _BidHistoryCardState();
}

class _BidHistoryCardState extends State<BidHistoryCard> {
  final ScrollController _scrollController = ScrollController();
  List<Map<String, dynamic>> allBids = [];
  bool loading = true;
  String? error;
  int? currentUserId;
  bool showAll = false;
  Timer? refreshTimer;

  @override
  void initState() {
    super.initState();
    _loadBidHistory();
    _initWebSocket();
  }

  @override
  void dispose() {
    WebSocketService().disconnect();
    refreshTimer?.cancel();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _loadBidHistory() async {
    final isAtBottom = _scrollController.hasClients && _scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 20;
    try {
      final token = await UserService.getToken() ?? '';
      final user = await UserService.getCurrentUser();
      if (token.isEmpty || user == null) throw 'User not logged in';
      currentUserId = user['id'];
      final all = await BidService.fetchAllAuctionBids(widget.auctionId, token: token);
      setState(() {
        allBids = all;
        if (isAtBottom && _scrollController.hasClients) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            _scrollController.animateTo(
              _scrollController.position.maxScrollExtent,
              duration: const Duration(milliseconds: 500),
              curve: Curves.easeOut,
            );
          });
        }
        loading = false;
      });
    } catch (e) {
      setState(() {
        error = e.toString();
        loading = false;
      });
    }
  }

  Future<void> _initWebSocket() async {
    final user = await UserService.getCurrentUser();
    if (user == null) return;
    final token = await UserService.getToken();

    WebSocketService().connect(
      auctionId: widget.auctionId,
      userId: user['id'],
      username: user['username'],
      token: token!,
      onActivity: (data) {
        if (data['type'] == 'NEW_BID') {
          setState(() {
            _loadBidHistory();
            if (mounted) setState(() {});
          });
        }
      },
      onError: (err) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('WebSocket Error: $err'),
            backgroundColor: Colors.red,
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final numberFormat = NumberFormat("#,##0", "vi_VN");
    final bids = showAll ? allBids : allBids.take(5).toList();

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(top: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: loading
          ? const Center(child: CircularProgressIndicator())
          : error != null
          ? Text('Error: $error', style: const TextStyle(color: Colors.red))
          : Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Bid History (${allBids.length})',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF22223B),
                ),
              ),
              if (allBids.length > 5)
                TextButton.icon(
                  onPressed: () => setState(() => showAll = !showAll),
                  icon: Icon(
                    showAll ? Icons.expand_less : Icons.expand_more,
                    color: Color(0xFFF97316),
                    size: 18,
                  ),
                  label: Text(
                    showAll ? 'Show Less' : 'View All',
                    style: const TextStyle(
                      color: Color(0xFFF97316),
                      fontWeight: FontWeight.w500,
                      fontSize: 14,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),
          if (bids.isEmpty)
            const Text('No bids placed yet.', style: TextStyle(fontSize: 14, color: Colors.grey))
          else
            SizedBox(
              height: 240,
              child: Scrollbar(
                thumbVisibility: true,
                controller: _scrollController,
                child: ListView.separated(
                  controller: _scrollController,
                  itemCount: bids.length,
                  separatorBuilder: (_, __) => const Divider(height: 16),
                  itemBuilder: (_, i) {
                    final bid = bids[i];
                    final amount = numberFormat.format(bid['bidAmount'] ?? 0);
                    final bidTime = DateFormat('yyyy-MM-dd HH:mm').format(DateTime.tryParse(bid['bidTime'] ?? '') ?? DateTime.now());
                    final isCurrentUser = bid['userId'] == currentUserId;
                    final isLatest = i == 0;

                    return Container(
                      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
                      decoration: isLatest
                          ? BoxDecoration(
                        color: Colors.orange.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(8),
                      )
                          : null,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Text('$amount đ', style: const TextStyle(fontWeight: FontWeight.w600)),
                              if (isCurrentUser)
                                Container(
                                  margin: const EdgeInsets.only(left: 8),
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: Colors.blue.shade50,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: const Text(
                                    'You',
                                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.blue),
                                  ),
                                ),
                            ],
                          ),
                          Text(bidTime, style: const TextStyle(color: Colors.grey, fontSize: 13)),
                        ],
                      ),
                    );
                  },
                ),
              ),
            ),
        ],
      ),
    );
  }
}
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobile_app/core/models/auction_model.dart';

class AuctionDetailPage extends StatefulWidget {
  final Auction auction;
  const AuctionDetailPage({super.key, required this.auction});
  @override
  State<AuctionDetailPage> createState() => _AuctionDetailPageState();
}

class _AuctionDetailPageState extends State<AuctionDetailPage>
    with SingleTickerProviderStateMixin {
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

  @override
  void initState() {
    super.initState();
    fadeInController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    )..forward();
    updateRemaining();
    countdownTimer = Timer.periodic(const Duration(seconds: 1), (_) => updateRemaining());
    _pageController = PageController(viewportFraction: 0.92, initialPage: 0);
    bidController.addListener(_handleBidInput);
    _checkWatchlist();
  }

  void updateRemaining() {
    final now = DateTime.now();
    final end = widget.auction.endTime;
    setState(() {
      remaining = end.isAfter(now) ? end.difference(now) : Duration.zero;
    });
  }

  void _handleBidInput() {
    final auction = widget.auction;
    final increment = auction.incrementAmount.toInt();
    final current = (auction.currentBid ?? auction.startingPrice).toInt();
    String inputText = bidController.text.replaceAll('.', '').replaceAll(',', '');
    int inputValue = int.tryParse(inputText) ?? 0;
    int suggestStart = inputValue > current ? inputValue : current + increment;
    List<int> suggestions = [];
    for (int i = 0; i < 3; i++) {
      suggestions.add(suggestStart + increment * i);
    }
    setState(() {
      bidSuggestions = inputText.isNotEmpty ? suggestions : [];
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
    ScaffoldMessenger.of(context).clearSnackBars();
    final snackBar = SnackBar(
      content: Row(
        children: [
          Icon(
            added ? Icons.favorite : Icons.favorite_border,
            color: Colors.white,
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Text(
              added
                  ? 'Added to Watchlist!'
                  : 'Removed from Watchlist.',
              style: const TextStyle(fontSize: 15),
            ),
          ),
        ],
      ),
      backgroundColor: added ? Colors.orange : Colors.grey[700],
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
      ),
      margin: const EdgeInsets.fromLTRB(18, 12, 18, 12),
      duration: const Duration(seconds: 2),
      elevation: 10,
    );
    ScaffoldMessenger.of(context).showSnackBar(snackBar);
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
    final days = d.inDays;
    final hours = d.inHours % 24;
    final minutes = d.inMinutes % 60;
    final seconds = d.inSeconds % 60;
    if (d == Duration.zero) return "Ended";
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
    final auction = widget.auction;
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
                                        Text('Time Left',
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
                              padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
                              decoration: BoxDecoration(
                                color: Colors.grey[50],
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(color: Colors.grey.shade200),
                              ),
                              child: Column(
                                children: [
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            const Text("Starting Price",
                                                style: TextStyle(fontSize: 13, color: Colors.grey)),
                                            Text(
                                              "${numberFormat.format(auction.startingPrice)} đ",
                                              style: const TextStyle(
                                                  fontSize: 16,
                                                  fontWeight: FontWeight.bold,
                                                  color: Colors.orange),
                                            ),
                                          ],
                                        ),
                                      ),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            const Text("Increment",
                                                style: TextStyle(fontSize: 13, color: Colors.grey)),
                                            Text(
                                              "${numberFormat.format(auction.incrementAmount)} đ",
                                              style: const TextStyle(
                                                  fontSize: 16,
                                                  fontWeight: FontWeight.bold,
                                                  color: Colors.blue),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 7),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            const Text("Deposit",
                                                style: TextStyle(fontSize: 13, color: Colors.grey)),
                                            Text(
                                              "${numberFormat.format(auction.securityDeposit)} đ",
                                              style: const TextStyle(
                                                  fontSize: 16,
                                                  fontWeight: FontWeight.bold,
                                                  color: Colors.deepPurple),
                                            ),
                                          ],
                                        ),
                                      ),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            const Text("Bids",
                                                style: TextStyle(fontSize: 13, color: Colors.grey)),
                                            Text(
                                              auction.bidCount.toString(),
                                              style: const TextStyle(
                                                  fontSize: 16,
                                                  fontWeight: FontWeight.bold,
                                                  color: Colors.teal),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 14),

                            Row(
                              children: [
                                Expanded(
                                  flex: 2,
                                  child: TextField(
                                    controller: bidController,
                                    keyboardType: TextInputType.number,
                                    decoration: InputDecoration(
                                      hintText: 'Your bid...',
                                      prefixIcon: const Icon(Icons.edit, size: 20),
                                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                      contentPadding: const EdgeInsets.symmetric(vertical: 6, horizontal: 8),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  flex: 1,
                                  child: SizedBox(
                                    height: 44,
                                    child: ElevatedButton(
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: const Color(0xFFF97316),
                                        shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(10)),
                                        elevation: 0,
                                      ),
                                      onPressed: (!hasStarted || hasEnded) ? null : () {
                                        // handle bid submit
                                      },
                                      child: const Text("Bid", style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.white)),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            if (bidController.text.isNotEmpty)
                              Padding(
                                padding: const EdgeInsets.only(top: 6.0, left: 2),
                                child: Wrap(
                                  spacing: 10,
                                  children: bidSuggestions.map((price) => ActionChip(
                                    label: Text(
                                      numberFormat.format(price) + ' đ',
                                      style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 15),
                                    ),
                                    onPressed: () {
                                      bidController.text = price.toString();
                                      bidController.selection = TextSelection.fromPosition(TextPosition(offset: bidController.text.length));
                                    },
                                    backgroundColor: Colors.orange.withOpacity(0.15),
                                  )).toList(),
                                ),
                              ),

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

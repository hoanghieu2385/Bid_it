// File: auction_detail.dart
// Description: Auction Detail Page with description "Read more / Show less" only when description is long.

import 'dart:async';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
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

  @override
  void initState() {
    super.initState();
    fadeInController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    )..forward();
    updateRemaining();
    countdownTimer = Timer.periodic(const Duration(seconds: 1), (_) => updateRemaining());
  }

  void updateRemaining() {
    final now = DateTime.now();
    final end = widget.auction.endTime;
    setState(() {
      remaining = end.isAfter(now) ? end.difference(now) : Duration.zero;
    });
  }

  @override
  void dispose() {
    countdownTimer?.cancel();
    fadeInController.dispose();
    super.dispose();
  }

  String formatDuration(Duration d) {
    final days = d.inDays;
    final hours = d.inHours % 24;
    final minutes = d.inMinutes % 60;
    final seconds = d.inSeconds % 60;
    if (d == Duration.zero) return "Ended";
    if (days > 0) {
      return '${days}d ${hours.toString().padLeft(2, '0')}:'
          '${minutes.toString().padLeft(2, '0')}:'
          '${seconds.toString().padLeft(2, '0')}';
    }
    return '${hours.toString().padLeft(2, '0')}:'
        '${minutes.toString().padLeft(2, '0')}:'
        '${seconds.toString().padLeft(2, '0')}';
  }

  String formatDateTime(DateTime? dt) {
    return dt != null ? DateFormat('yyyy-MM-dd HH:mm').format(dt) : 'N/A';
  }

  Color getCountdownColor(Duration d) {
    if (d.inSeconds <= 0) return Colors.red;
    if (d.inMinutes < 2) return Colors.orange;
    if (d.inMinutes < 10) return Colors.yellow.shade800;
    return Colors.green;
  }

  Widget _infoRow(String label, String value, {Color? valueColor}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          "$label:",
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            color: Color(0xFF374151),
            fontSize: 15,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontWeight: FontWeight.w500,
            fontSize: 15,
            color: valueColor ?? const Color(0xFF111827),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final auction = widget.auction;
    final numberFormat = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ', decimalDigits: 0);
    final mediaList = auction.mediaUrls.isNotEmpty
        ? auction.mediaUrls
        : [auction.thumbnailUrl ?? ''];
    final now = DateTime.now();
    final hasStarted = now.isAfter(auction.startTime);
    final hasEnded = now.isAfter(auction.endTime);
    final descriptionThreshold = 120;
    final isLongDescription = auction.description.length > descriptionThreshold;

    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(
        title: const Text("Auction Detail", style: TextStyle(color: Colors.black)),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0.3,
      ),
      body: FadeTransition(
        opacity: fadeInController,
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
          children: [
            Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                color: Colors.white,
                boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 6, offset: Offset(0, 2))],
              ),
              child: Stack(
                alignment: Alignment.bottomCenter,
                children: [
                  SizedBox(
                    height: 220,
                    width: double.infinity,
                    child: PageView.builder(
                      itemCount: mediaList.length,
                      controller: PageController(viewportFraction: 0.92),
                      onPageChanged: (index) => setState(() => currentImageIndex = index),
                      itemBuilder: (context, index) {
                        final url = mediaList[index];
                        final selected = index == currentImageIndex;
                        return AnimatedScale(
                          scale: selected ? 1 : 0.93,
                          duration: const Duration(milliseconds: 350),
                          curve: Curves.easeInOut,
                          child: AnimatedOpacity(
                            opacity: selected ? 1 : 0.6,
                            duration: const Duration(milliseconds: 350),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 4),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(16),
                                child: Image.network(
                                  url,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) =>
                                      Image.asset('assets/images/product-img.png', fit: BoxFit.cover),
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
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(
                          mediaList.length,
                              (index) => AnimatedContainer(
                            duration: const Duration(milliseconds: 300),
                            margin: const EdgeInsets.symmetric(horizontal: 4),
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
            const SizedBox(height: 20),
            Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Expanded(
                  child: AnimatedSwitcher(
                    duration: const Duration(milliseconds: 350),
                    child: Text(
                      auction.title,
                      key: ValueKey(auction.title),
                      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF111827)),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                AnimatedContainer(
                  duration: const Duration(milliseconds: 400),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    color: auction.status == "ONGOING" ? Colors.green[100] : Colors.grey[200],
                  ),
                  child: Text(
                    auction.status,
                    style: TextStyle(
                      color: auction.status == "ONGOING" ? Colors.green[800] : Colors.grey[800],
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 5, offset: Offset(0, 2))],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text("Current Price", style: TextStyle(fontSize: 15, color: Colors.black54)),
                        const SizedBox(height: 5),
                        AnimatedSwitcher(
                          duration: const Duration(milliseconds: 300),
                          child: Text(
                            numberFormat.format(auction.currentBid ?? auction.startingPrice),
                            key: ValueKey(auction.currentBid ?? auction.startingPrice),
                            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.orange),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 18),
                Expanded(
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 350),
                    padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 5, offset: Offset(0, 2))],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text("Time Left", style: TextStyle(fontSize: 15, color: Colors.black54)),
                        const SizedBox(height: 5),
                        AnimatedSwitcher(
                          duration: const Duration(milliseconds: 400),
                          child: Text(
                            formatDuration(remaining),
                            key: ValueKey(remaining),
                            style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              color: getCountdownColor(remaining),
                              letterSpacing: 1,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            if (!hasStarted)
              Container(
                width: double.infinity,
                margin: const EdgeInsets.only(top: 10),
                padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
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
                padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
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
            const SizedBox(height: 18),
            Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black12,
                    blurRadius: 6,
                    offset: Offset(0, 3),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _infoRow("Starting Price", numberFormat.format(auction.startingPrice), valueColor: Colors.orange),
                  const SizedBox(height: 8),
                  _infoRow("Increment", numberFormat.format(auction.incrementAmount)),
                  const SizedBox(height: 8),
                  _infoRow("Security Deposit", numberFormat.format(auction.securityDeposit)),
                  const SizedBox(height: 8),
                  _infoRow("Bids", auction.bidCount.toString()),
                ],
              ),
            ),
            Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 4)],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _infoRow("Start Time", formatDateTime(auction.startTime)),
                  const SizedBox(height: 6),
                  _infoRow("End Time", formatDateTime(auction.endTime)),
                  const SizedBox(height: 6),
                  _infoRow("Created At", formatDateTime(auction.createdAt)),
                ],
              ),
            ),
            const SizedBox(height: 8),
            const Text("Description", style: TextStyle(fontSize: 17, fontWeight: FontWeight.w600, color: Color(0xFF111827))),
            const SizedBox(height: 8),
            AnimatedCrossFade(
              firstChild: Text(
                auction.description,
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 15, height: 1.6, color: Color(0xFF374151)),
              ),
              secondChild: Text(
                auction.description,
                style: const TextStyle(fontSize: 15, height: 1.6, color: Color(0xFF374151)),
              ),
              crossFadeState: isDescriptionExpanded ? CrossFadeState.showSecond : CrossFadeState.showFirst,
              duration: const Duration(milliseconds: 400),
            ),
            if (isLongDescription)
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () => setState(() => isDescriptionExpanded = !isDescriptionExpanded),
                  child: Text(
                    isDescriptionExpanded ? "Show less" : "Read more",
                    style: const TextStyle(color: Color(0xFFEF4444), fontWeight: FontWeight.w500),
                  ),
                ),
              ),
            const SizedBox(height: 20),
            AnimatedScale(
              scale: 1,
              duration: const Duration(milliseconds: 300),
              child: SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFF97316),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 1,
                  ),
                  onPressed: (!hasStarted || hasEnded) ? null : () {},
                  child: const Text("Place your bid!", style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

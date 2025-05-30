// File: category_auctions_page.dart
// Description: Displays auctions filtered by selected category, card design matches homepage, only shows auctions that haven't ended.

import 'dart:async';
import 'package:flutter/material.dart';
import 'package:mobile_app/core/models/auction_model.dart';
import 'package:mobile_app/core/services/auction_service.dart';

class CategoryAuctionsPage extends StatefulWidget {
  final int categoryId;
  final String categoryName;

  const CategoryAuctionsPage({
    super.key,
    required this.categoryId,
    required this.categoryName,
  });

  @override
  State<CategoryAuctionsPage> createState() => _CategoryAuctionsPageState();
}

class _CategoryAuctionsPageState extends State<CategoryAuctionsPage> {
  late Future<List<Auction>> _futureAuctions;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _futureAuctions = AuctionService.fetchAuctionsByCategory(widget.categoryId);
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() {}); // Cập nhật countdown động
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String formatCountdown(DateTime endTime) {
    final now = DateTime.now();
    final diff = endTime.difference(now);
    if (diff.isNegative) return '00:00:00:00';
    final days = diff.inDays;
    final hours = diff.inHours % 24;
    final minutes = diff.inMinutes % 60;
    final seconds = diff.inSeconds % 60;
    return '${days.toString().padLeft(2, '0')}:'
        '${hours.toString().padLeft(2, '0')}:'
        '${minutes.toString().padLeft(2, '0')}:'
        '${seconds.toString().padLeft(2, '0')}';
  }

  Widget _buildAuctionCard(Auction auction) {
    return GestureDetector(
      onTap: () {
        // TODO: Điều hướng đến trang chi tiết auction nếu muốn
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
            ClipRRect(
              borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(12), topRight: Radius.circular(12)),
              child: auction.thumbnailUrl != null
                  ? Image.network(
                auction.thumbnailUrl!,
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
            // Countdown
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
                      _buildTimeItem(formatCountdown(auction.endTime).split(':')[0], 'Days'),
                      _buildTimeItem(formatCountdown(auction.endTime).split(':')[1], 'Hours'),
                      _buildTimeItem(formatCountdown(auction.endTime).split(':')[2], 'Minutes'),
                      _buildTimeItem(formatCountdown(auction.endTime).split(':')[3], 'Seconds'),
                    ],
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
                  Text(
                    auction.description,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 13, color: Colors.black87),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Text('Starting Price: '),
                      Text('${auction.startingPrice.toStringAsFixed(0)} đ',
                          style: const TextStyle(color: Colors.green)),
                    ],
                  ),
                  Row(
                    children: [
                      const Text('Current Bid: '),
                      Text('${auction.currentBid?.toStringAsFixed(0) ?? auction.startingPrice.toStringAsFixed(0)} đ',
                          style: const TextStyle(color: Colors.green)),
                    ],
                  ),
                  Row(
                    children: [
                      const Text('Bid Count: '),
                      Text('${auction.bidCount} bids',
                          style: const TextStyle(color: Colors.green)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.orange.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          auction.status,
                          style: const TextStyle(fontSize: 12, color: Colors.orange),
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
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.categoryName),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        backgroundColor: Colors.white,
        elevation: 0.5,
        centerTitle: true,
        titleTextStyle: const TextStyle(
          color: Colors.black,
          fontWeight: FontWeight.bold,
          fontSize: 20,
        ),
      ),
      body: FutureBuilder<List<Auction>>(
        future: _futureAuctions,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Failed to load auctions: ${snapshot.error}'));
          }
          final allAuctions = snapshot.data ?? [];
          final now = DateTime.now();
          final auctions = allAuctions.where((a) => a.endTime.isAfter(now)).toList();
          if (auctions.isEmpty) {
            return const Center(child: Text('No auctions found for this category.'));
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: auctions.length,
            itemBuilder: (context, index) {
              final auction = auctions[index];
              return _buildAuctionCard(auction);
            },
          );
        },
      ),
    );
  }
}

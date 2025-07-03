import 'dart:async';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile_app/core/models/auction_model.dart';
import 'package:mobile_app/core/services/auction_service.dart';

import 'auction_detail.dart';

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
  final NumberFormat _vndFormat = NumberFormat("#,##0", "vi_VN");

  @override
  void initState() {
    super.initState();
    _futureAuctions = AuctionService.fetchAuctionsByCategory(widget.categoryId);
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() {});
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
    final String startingPrice = _vndFormat.format(auction.startingPrice);
    final String currentBid = _vndFormat.format(auction.currentBid ?? auction.startingPrice);

    String imageUrl = '';
    if (auction.mediaUrls.isNotEmpty && auction.mediaUrls[0].isNotEmpty) {
      imageUrl = auction.mediaUrls[0];
    } else if (auction.thumbnailUrl != null && auction.thumbnailUrl!.isNotEmpty) {
      imageUrl = auction.thumbnailUrl!;
    }

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
            ClipRRect(
              borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(12), topRight: Radius.circular(12)),
              child: imageUrl.isNotEmpty
                  ? Image.network(
                imageUrl,
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
            Container(
              width: double.infinity,
              color: Colors.black87,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildTimeItem(formatCountdown(auction.endTime).split(':')[0], 'Days'),
                  _buildTimeItem(formatCountdown(auction.endTime).split(':')[1], 'Hours'),
                  _buildTimeItem(formatCountdown(auction.endTime).split(':')[2], 'Minutes'),
                  _buildTimeItem(formatCountdown(auction.endTime).split(':')[3], 'Seconds'),
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
                      Text('\$$startingPrice',
                          style: const TextStyle(color: Colors.green)),
                    ],
                  ),
                  Row(
                    children: [
                      const Text('Current Bid: '),
                      Text('\$$currentBid',
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
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.category_outlined,
                    size: 68,
                    color: Colors.grey.withOpacity(0.3),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    'No auctions found!',
                    style: TextStyle(
                      fontSize: 18,
                      color: Colors.grey[800],
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'There are currently no auctions for this category.',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[500],
                    ),
                  ),
                ],
              ),
            );
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

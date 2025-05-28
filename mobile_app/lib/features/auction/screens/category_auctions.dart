// File: category_auctions_page.dart
// Description: Displays auctions filtered by selected category, with a back button to Home.

import 'package:flutter/material.dart';
import 'package:mobile_app/core/models/auction_model.dart';
import 'package:mobile_app/core/services/auction_service.dart';
import 'package:mobile_app/core/constants/app_colors.dart';

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

  @override
  void initState() {
    super.initState();
    _futureAuctions = AuctionService.fetchAuctionsByCategory(widget.categoryId);
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
            return Center(child: Text('Failed to load auctions: \${snapshot.error}'));
          }

          final auctions = snapshot.data ?? [];

          if (auctions.isEmpty) {
            return const Center(child: Text('No auctions found for this category.'));
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: auctions.length,
            itemBuilder: (context, index) {
              final auction = auctions[index];
              return Card(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 4,
                margin: const EdgeInsets.only(bottom: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ClipRRect(
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                      child: Image.asset(
                        'assets/images/product-img.png',
                        width: double.infinity,
                        height: 160,
                        fit: BoxFit.cover,
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(12.0),
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
                              const Icon(Icons.access_time, size: 14, color: Colors.grey),
                              const SizedBox(width: 4),
                              Text(
                                'Start: ${auction.startTime.day}/${auction.startTime.month}/${auction.startTime.year}',
                                style: const TextStyle(fontSize: 12, color: Colors.grey),
                              ),
                              const SizedBox(width: 12),
                              const Icon(Icons.flag, size: 14, color: Colors.grey),
                              const SizedBox(width: 4),
                              Text(
                                'End: ${auction.endTime.day}/${auction.endTime.month}/${auction.endTime.year}',
                                style: const TextStyle(fontSize: 12, color: Colors.grey),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  const Icon(Icons.attach_money, size: 16, color: Colors.orange),
                                  const SizedBox(width: 4),
                                  Text(
                                    auction.startingPrice.toStringAsFixed(0),
                                    style: const TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.orange,
                                    ),
                                  ),
                                ],
                              ),
                              Row(
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
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }
}

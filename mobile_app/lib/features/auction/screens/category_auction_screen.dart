// File: category_auction_screen.dart
// Chức năng: Hiển thị danh sách phiên đấu giá theo categoryId, lấy từ backend thông qua API.

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:mobile_app/core/constants/app_colors.dart';
import 'package:mobile_app/core/widgets/custom_button.dart';
import 'package:mobile_app/core/services/api_service.dart';

class CategoryAuctionScreen extends StatefulWidget {
  final int categoryId;

  const CategoryAuctionScreen({super.key, required this.categoryId});

  @override
  State<CategoryAuctionScreen> createState() => _CategoryAuctionScreenState();
}

class _CategoryAuctionScreenState extends State<CategoryAuctionScreen> {
  List<dynamic> auctions = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchAuctionsByCategoryId(widget.categoryId);
  }

  Future<void> fetchAuctionsByCategoryId(int categoryId) async {
    try {
      final uri = Uri.parse(ApiService.categoryBaseUrl);
      final response = await http.get(uri);
      if (response.statusCode == 200) {
        setState(() {
          auctions = jsonDecode(response.body);
          isLoading = false;
        });
      } else {
        print('❌ Error: ${response.statusCode}');
        setState(() => isLoading = false);
      }
    } catch (e) {
      print('❌ Exception: $e');
      setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Category Auctions'),
        backgroundColor: AppColors.white,
        foregroundColor: AppColors.black,
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : auctions.isEmpty
          ? const Center(child: Text('No auctions found in this category.'))
          : ListView.builder(
        itemCount: auctions.length,
        itemBuilder: (context, index) {
          final item = auctions[index];
          return Card(
            margin: const EdgeInsets.all(12),
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item['title'] ?? 'No title',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text('Starting Price: \$${item['startingPrice'] ?? '0'}'),
                  Text('Current Bid: \$${item['currentBid'] ?? '0'}'),
                  Text('Bids: ${item['bids'] ?? 0}'),
                  Text('Time Left: ${item['timeLeft'] ?? '--:--'}'),
                  const SizedBox(height: 8),
                  CustomButton(
                    text: 'Join Auction',
                    onPressed: () {
                      print('Join ${item['title']}');
                    },
                    backgroundColor: AppColors.black,
                    textColor: AppColors.white,
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

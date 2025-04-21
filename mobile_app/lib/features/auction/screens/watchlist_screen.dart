import 'package:mobile_app/core/constants/app_colors.dart';
import 'package:mobile_app/features/auction/screens/auction_detail.dart';
import 'package:flutter/material.dart';

class WatchlistPage extends StatelessWidget {
  const WatchlistPage({super.key});

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> watchlistItems = [
      {
        'title': 'BMW AIGID A CLASS HATCH M26 MOTOR BIKE',
        'seller': 'Christopher Anderson',
        'imageUrl': 'https://via.placeholder.com/400',
        'startingPrice': 500000.0,
        'currentBid': 2000000.0,
        'bids': 323,
        'timeLeft': '02:15:48:50',
        'bidHistory': [81000000.0, 82000000.0, 82500000.0],
      },
      {
        'title': 'Vintage Rolex Watch',
        'seller': 'John Doe',
        'imageUrl': 'https://via.placeholder.com/400',
        'startingPrice': 1000000.0,
        'currentBid': 3000000.0,
        'bids': 150,
        'timeLeft': '01:05:30:20',
        'bidHistory': [28000000.0, 29000000.0, 30000000.0],
      },
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Watchlist'),
        backgroundColor: AppColors.white,
        foregroundColor: AppColors.black,
      ),
      body: watchlistItems.isEmpty
          ? const Center(
        child: Text(
          'No items in your watchlist',
          style: TextStyle(
            fontSize: 18,
            color: AppColors.grey,
            fontStyle: FontStyle.italic,
          ),
        ),
      )
          : ListView.builder(
        padding: const EdgeInsets.all(16.0),
        itemCount: watchlistItems.length,
        itemBuilder: (context, index) {
          final item = watchlistItems[index];
          return Card(
            elevation: 2,
            margin: const EdgeInsets.only(bottom: 16.0),
            child: ListTile(
              title: Text(
                item['title'],
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppColors.black,
                ),
              ),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 4.0),
                  Text(
                    'Current Bid: ${item['currentBid'].toStringAsFixed(0)}đ',
                    style: const TextStyle(fontSize: 14, color: AppColors.grey),
                  ),
                  const SizedBox(height: 4.0),
                  Row(
                    children: [
                      const Icon(Icons.timer, color: Colors.orange, size: 16),
                      const SizedBox(width: 4.0),
                      Text(
                        item['timeLeft'],
                        style: const TextStyle(fontSize: 14, color: Colors.orange),
                      ),
                    ],
                  ),
                ],
              ),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => AuctionDetailPage(
                      title: item['title'],
                      seller: item['seller'],
                      imageUrl: item['imageUrl'],
                      startingPrice: item['startingPrice'],
                      currentBid: item['currentBid'],
                      bids: item['bids'],
                      timeLeft: item['timeLeft'],
                      bidHistory: List<double>.from(item['bidHistory']),
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
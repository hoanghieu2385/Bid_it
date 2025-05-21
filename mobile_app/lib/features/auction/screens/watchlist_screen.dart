// File: watchlist_screen.dart
// Chức năng: Hiển thị danh sách các phiên đấu giá mà người dùng theo dõi (Watchlist), với giao diện thẻ đẹp mắt.

import 'package:flutter/material.dart';

class WatchlistPage extends StatelessWidget {
  const WatchlistPage({super.key});

  @override
  Widget build(BuildContext context) {
    // Dữ liệu mẫu
    final List<Map<String, String>> watchlistItems = [
      {
        'title': 'Apple Watch Series 9',
        'status': 'Ongoing',
        'endTime': '2025-06-01 18:00',
      },
      {
        'title': 'Sony WH-1000XM5',
        'status': 'Ended',
        'endTime': '2025-05-15 21:30',
      },
    ];

    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: watchlistItems.isEmpty
            ? const Center(
          child: Text('No items in your watchlist yet.',
              style: TextStyle(fontSize: 16)),
        )
            : ListView.builder(
          itemCount: watchlistItems.length,
          itemBuilder: (context, index) {
            final item = watchlistItems[index];
            final isEnded = item['status'] == 'Ended';

            return Card(
              elevation: 3,
              margin: const EdgeInsets.only(bottom: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: ListTile(
                contentPadding: const EdgeInsets.all(12),
                leading: CircleAvatar(
                  radius: 28,
                  backgroundColor: Colors.orange.withOpacity(0.15),
                  child: const Icon(Icons.image, size: 30, color: Colors.orange),
                ),
                title: Text(
                  item['title']!,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                subtitle: Padding(
                  padding: const EdgeInsets.only(top: 4.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Status: ${item['status']}',
                        style: TextStyle(
                          color: isEnded ? Colors.red : Colors.green,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Ends at: ${item['endTime']}',
                        style: const TextStyle(fontSize: 13),
                      ),
                    ],
                  ),
                ),
                trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                onTap: () {
                  //Mở trang chi tiết đấu giá
                },
              ),
            );
          },
        ),
      ),
    );
  }
}

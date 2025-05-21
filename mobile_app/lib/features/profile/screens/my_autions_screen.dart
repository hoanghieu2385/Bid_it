// File: my_auctions_page.dart
// Chức năng: Hiển thị danh sách các phiên đấu giá do người dùng tạo ra.

import 'package:flutter/material.dart';

class MyAuctionsPage extends StatelessWidget {
  const MyAuctionsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final myAuctions = [
      {'title': 'MacBook M3', 'status': 'Ongoing', 'endTime': '2025-06-01'},
      {'title': 'AirPods Pro 2', 'status': 'Ended', 'endTime': '2025-05-10'},
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('My Auctions')),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: myAuctions.length,
        itemBuilder: (context, index) {
          final auction = myAuctions[index];
          final isEnded = auction['status'] == 'Ended';

          return Card(
            elevation: 4,
            margin: const EdgeInsets.only(bottom: 16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: ListTile(
              leading: const Icon(Icons.gavel, color: Colors.orange),
              title: Text(auction['title']!, style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Status: ${auction['status']}', style: TextStyle(color: isEnded ? Colors.red : Colors.green)),
                  Text('Ends at: ${auction['endTime']}'),
                ],
              ),
              trailing: const Icon(Icons.arrow_forward_ios, size: 16),
              onTap: () {},
            ),
          );
        },
      ),
    );
  }
}

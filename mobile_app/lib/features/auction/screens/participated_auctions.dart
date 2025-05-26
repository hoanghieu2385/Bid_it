// File: participated_auctions_page.dart
// Chức năng: Hiển thị các phiên đấu giá mà người dùng đã từng tham gia.

import 'package:flutter/material.dart';

class ParticipatedAuctionsPage extends StatelessWidget {
  const ParticipatedAuctionsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final auctions = [
      {'title': 'Samsung Galaxy S24', 'status': 'Ongoing'},
      {'title': 'Apple Vision Pro', 'status': 'Ended'},
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Participated Auctions')),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: auctions.length,
        itemBuilder: (context, index) {
          final auction = auctions[index];
          final isEnded = auction['status'] == 'Ended';

          return Card(
            elevation: 4,
            margin: const EdgeInsets.only(bottom: 16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: ListTile(
              leading: const Icon(Icons.how_to_vote, color: Colors.green),
              title: Text(auction['title']!, style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text('Status: ${auction['status']}', style: TextStyle(color: isEnded ? Colors.red : Colors.green)),
              trailing: const Icon(Icons.arrow_forward_ios, size: 16),
              onTap: () {},
            ),
          );
        },
      ),
    );
  }
}

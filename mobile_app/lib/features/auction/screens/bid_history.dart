import 'package:flutter/material.dart';

class BidHistoryPage extends StatelessWidget {
  const BidHistoryPage({super.key});

  @override
  Widget build(BuildContext context) {
    final bids = [
      {'title': 'iPhone 15', 'amount': '950', 'time': '2025-05-08 10:12'},
      {'title': 'Camera Canon R6', 'amount': '1450', 'time': '2025-05-03 21:40'},
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Bid History')),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: bids.length,
        itemBuilder: (context, index) {
          final bid = bids[index];

          return Card(
            elevation: 4,
            margin: const EdgeInsets.only(bottom: 16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: ListTile(
              leading: const Icon(Icons.history, color: Colors.blue),
              title: Text(bid['title']!, style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Bid at: \$${bid['amount']}'),
                  Text('Time: ${bid['time']}'),
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

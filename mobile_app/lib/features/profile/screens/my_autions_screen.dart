// File: my_auctions_page.dart
// Chức năng: Hiển thị danh sách các phiên đấu giá do người dùng tạo ra, có nút quay lại về UserPage.

import 'package:flutter/material.dart';
import 'package:mobile_app/core/models/auction_model.dart';
import 'package:mobile_app/core/services/auction_service.dart';
import 'package:mobile_app/features/profile/screens/user_screen.dart';

class MyAuctionsPage extends StatefulWidget {
  const MyAuctionsPage({super.key});

  @override
  State<MyAuctionsPage> createState() => _MyAuctionsPageState();
}

class _MyAuctionsPageState extends State<MyAuctionsPage> {
  late Future<List<Auction>> _futureAuctions;

  @override
  void initState() {
    super.initState();
    _futureAuctions = AuctionService.getMyAuctions();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Auctions'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (context) => const UserPage()),
            );
          },
        ),
        backgroundColor: Colors.white,
        elevation: 0.5,
        centerTitle: true,
        titleTextStyle: const TextStyle(
          color: Colors.black,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
      body: FutureBuilder<List<Auction>>(
        future: _futureAuctions,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Lỗi khi tải dữ liệu: ${snapshot.error}'));
          }

          final myAuctions = snapshot.data ?? [];

          if (myAuctions.isEmpty) {
            return const Center(child: Text('Bạn chưa tạo phiên đấu giá nào.'));
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: myAuctions.length,
            itemBuilder: (context, index) {
              final auction = myAuctions[index];
              final isEnded = auction.status.toUpperCase() == 'ENDED';

              return Card(
                elevation: 4,
                margin: const EdgeInsets.only(bottom: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: ListTile(
                  leading: const Icon(Icons.gavel, color: Colors.orange),
                  title: Text(auction.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Status: ${auction.status}',
                          style: TextStyle(color: isEnded ? Colors.red : Colors.green)),
                      Text('Ends at: ${auction.endTime.toString()}'),
                    ],
                  ),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: () {
                    // Tùy chọn: mở trang chi tiết phiên đấu giá
                  },
                ),
              );
            },
          );
        },
      ),
    );
  }
}

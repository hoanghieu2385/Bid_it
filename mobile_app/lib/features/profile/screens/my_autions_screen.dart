import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile_app/core/models/auction_model.dart';
import 'package:mobile_app/core/services/auction_service.dart';
import '../../auction/screens/auction_detail.dart';
import '../../home/screens/home_screen.dart';

class MyAuctionsPage extends StatefulWidget {
  const MyAuctionsPage({super.key});

  @override
  State<MyAuctionsPage> createState() => _MyAuctionsPageState();
}

class _MyAuctionsPageState extends State<MyAuctionsPage> {
  late Future<List<Auction>> _futureAuctions;
  String selectedStatus = 'All';
  bool showAll = false;

  final List<String> statusOptions = [
    'All',
    'UPCOMING',
    'OPENED',
    'CLOSED',
    'SOLD',
    'FAILED',
    'COMPLETED',
  ];

  @override
  void initState() {
    super.initState();
    _loadAuctions();
  }

  void _loadAuctions() {
    setState(() {
      if (selectedStatus == 'All') {
        _futureAuctions = AuctionService.getMyAuctions();
      } else {
        _futureAuctions = AuctionService.getMyAuctionsByStatus(selectedStatus);
      }
    });
  }

  Color getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'UPCOMING':
        return Colors.green;
      case 'OPENED':
        return Colors.orange;
      case 'CLOSED':
        return Colors.grey;
      case 'SOLD':
        return Colors.blueGrey;
      case 'FAILED':
        return Colors.red;
      case 'COMPLETED':
        return Colors.indigo;
      default:
        return Colors.black;
    }
  }

  String formatDate(DateTime date) {
    return DateFormat('dd/MM/yyyy HH:mm').format(date);
  }

  String? getAuctionImage(Auction auction) {
    if (auction.mediaUrls.isNotEmpty) {
      return auction.mediaUrls.first;
    }
    if (auction.thumbnailUrl != null && auction.thumbnailUrl!.isNotEmpty) {
      return auction.thumbnailUrl;
    }
    return null;
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
              MaterialPageRoute(builder: (context) => const HomePage()),
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
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: DropdownButtonFormField<String>(
              value: selectedStatus,
              items: statusOptions.map((status) {
                return DropdownMenuItem(
                  value: status,
                  child: Text(status),
                );
              }).toList(),
              decoration: const InputDecoration(
                labelText: 'Filter by Status',
                border: OutlineInputBorder(),
              ),
              onChanged: (value) {
                if (value != null) {
                  selectedStatus = value;
                  showAll = false;
                  _loadAuctions();
                }
              },
            ),
          ),
          Expanded(
            child: FutureBuilder<List<Auction>>(
              future: _futureAuctions,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  return Center(child: Text('Failed to load data: ${snapshot.error}'));
                }

                final allAuctions = snapshot.data ?? [];

                if (allAuctions.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.inbox_rounded,
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
                          'You have not created any auctions with this status.',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[500],
                          ),
                        ),
                      ],
                    ),
                  );
                }

                allAuctions.sort((a, b) => b.createdAt.compareTo(a.createdAt));
                final displayAuctions = showAll
                    ? allAuctions
                    : allAuctions.take(5).toList();

                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: displayAuctions.length + 1,
                  itemBuilder: (context, index) {
                    if (index == displayAuctions.length) {
                      return (allAuctions.length > 5)
                          ? Center(
                        child: TextButton(
                          onPressed: () {
                            setState(() => showAll = !showAll);
                          },
                          child: Text(
                            showAll ? 'Show Less' : 'View More',
                            style: const TextStyle(color: Colors.orange),
                          ),
                        ),
                      )
                          : const SizedBox.shrink();
                    }

                    final auction = displayAuctions[index];
                    final statusColor = getStatusColor(auction.status);
                    final imgUrl = getAuctionImage(auction);

                    return Card(
                      elevation: 3,
                      margin: const EdgeInsets.only(bottom: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: ListTile(
                        contentPadding: const EdgeInsets.all(12),
                        leading: ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: imgUrl != null && imgUrl.isNotEmpty
                              ? Image.network(
                            imgUrl,
                            width: 60,
                            height: 60,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => Image.asset(
                              'assets/images/product-img.png',
                              width: 60,
                              height: 60,
                              fit: BoxFit.cover,
                            ),
                          )
                              : Image.asset(
                            'assets/images/product-img.png',
                            width: 60,
                            height: 60,
                            fit: BoxFit.cover,
                          ),
                        ),
                        title: Text(
                          auction.title,
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Status: ${auction.status}',
                              style: TextStyle(color: statusColor),
                            ),
                            Text('Ends: ${formatDate(auction.endTime)}'),
                            Text('Start Price: ₫${auction.startingPrice.toStringAsFixed(0)}'),
                          ],
                        ),
                        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => AuctionDetailPage(auction: auction),
                            ),
                          );
                        },
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}


// Improved ParticipatedAuctionsPage UI with polished styling and responsive layout
import 'dart:collection';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile_app/core/services/bid_service.dart';
import 'package:mobile_app/core/services/user_service.dart';
import 'package:mobile_app/core/services/auction_service.dart';
import 'package:mobile_app/features/auction/screens/auction_detail.dart';
import 'package:mobile_app/core/models/auction_model.dart';

class ParticipatedAuctionsPage extends StatefulWidget {
  const ParticipatedAuctionsPage({super.key});

  @override
  State<ParticipatedAuctionsPage> createState() => _ParticipatedAuctionsPageState();
}

class _ParticipatedAuctionsPageState extends State<ParticipatedAuctionsPage> {
  bool isLoading = true;
  bool showAll = false;
  List<Map<String, dynamic>> auctions = [];
  List<Map<String, dynamic>> filteredAuctions = [];
  String selectedFilter = 'All';

  @override
  void initState() {
    super.initState();
    _fetchUserAuctions();
  }

  Future<void> _fetchUserAuctions() async {
    try {
      final user = await UserService.getCurrentUser();
      if (user == null) return;
      final token = await UserService.getToken() ?? '';
      final bids = await BidService.fetchAllUserBids(user['id'], token: token);

      final Map<int, Map<String, dynamic>> grouped = HashMap();
      for (final bid in bids) {
        final id = bid['auctionId'];
        if (!grouped.containsKey(id)) {
          grouped[id] = {
            'auctionId': id,
            'title': bid['auctionTitle'],
            'status': bid['status'],
            'isWinning': bid['isWinning'],
            'isPaid': bid['isPaid'],
          };
        }
      }

      setState(() {
        auctions = grouped.values.toList();
        _applyFilter();
        isLoading = false;
      });
    } catch (e) {
      setState(() => isLoading = false);
    }
  }

  void _applyFilter() {
    List<Map<String, dynamic>> base;
    if (selectedFilter == 'All') {
      base = auctions;
    } else if (selectedFilter == 'Ongoing') {
      base = auctions.where((e) => e['status'] != 'ENDED').toList();
    } else if (selectedFilter == 'Won') {
      base = auctions.where((e) => e['status'] == 'ENDED' && e['isWinning'] == true).toList();
    } else {
      base = auctions.where((e) => e['status'] == 'ENDED' && e['isWinning'] == false).toList();
    }
    setState(() {
      filteredAuctions = showAll ? base : base.take(3).toList();
    });
  }

  Widget _buildFilterChips() {
    final filters = ['All', 'Ongoing', 'Won', 'Lost'];
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12),
      child: Row(
        children: filters.map((f) {
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: ChoiceChip(
              label: Text(
                f,
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: selectedFilter == f ? Colors.white : Colors.grey[700],
                ),
              ),
              selected: selectedFilter == f,
              selectedColor: Colors.blue[700],
              backgroundColor: Colors.grey[100],
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: BorderSide(color: Colors.grey[300]!),
              ),
              onSelected: (_) {
                setState(() {
                  selectedFilter = f;
                  showAll = false;
                  _applyFilter();
                });
              },
            ),
          );
        }).toList(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'My Auctions',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 24,
            color: Colors.black87,
          ),
        ),
        centerTitle: true,
        backgroundColor: Colors.white,
        elevation: 0,
        shadowColor: Colors.black12,
      ),
      backgroundColor: const Color(0xFFF5F7FA),
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.blue))
          : Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildFilterChips(),
          Expanded(
            child: filteredAuctions.isEmpty
                ? _buildEmptyState()
                : ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemCount: filteredAuctions.length,
              itemBuilder: (context, index) {
                final auction = filteredAuctions[index];
                final isWinning = auction['isWinning'] == true;
                final isPaid = auction['isPaid'] == true;

                return FutureBuilder(
                  future: AuctionService.fetchAuctionById(auction['auctionId']),
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.waiting) {
                      return const SizedBox(
                        height: 200,
                        child: Center(child: CircularProgressIndicator(color: Colors.blue)),
                      );
                    } else if (snapshot.hasData) {
                      final Auction a = snapshot.data!;
                      final numberFormat = NumberFormat("#,##0", "vi_VN");
                      final imageUrl = a.mediaUrls.isNotEmpty ? a.mediaUrls.first : a.thumbnailUrl ?? '';

                      return GestureDetector(
                        onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => AuctionDetailPage(auction: a)),
                        ),
                        child: Card(
                          elevation: 2,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              ClipRRect(
                                borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                                child: Image.network(
                                  imageUrl,
                                  width: double.infinity,
                                  height: 180,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => Image.asset(
                                    'assets/images/product-img.png',
                                    width: double.infinity,
                                    height: 180,
                                    fit: BoxFit.cover,
                                  ),
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      a.title,
                                      style: const TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.black87,
                                      ),
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      'Current Bid: ${numberFormat.format(a.currentBid ?? a.startingPrice)} đ',
                                      style: TextStyle(
                                        fontSize: 16,
                                        color: Colors.green[700],
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      a.endTime.isBefore(DateTime.now())
                                          ? (isWinning
                                          ? isPaid
                                          ? '✅ Paid - You won this auction!'
                                          : '🎉 You won this auction! (Unpaid)'
                                          : 'You did not win')
                                          : 'Auction is ongoing',
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                        color: a.endTime.isBefore(DateTime.now())
                                            ? (isWinning
                                            ? (isPaid ? Colors.teal[700] : Colors.orange[700])
                                            : Colors.red[700])
                                            : Colors.blue[700],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    } else {
                      return const SizedBox();
                    }
                  },
                );
              },
            ),
          ),
          if (!isLoading &&
              filteredAuctions.length <
                  auctions.where((e) =>
                  selectedFilter == 'All' ||
                      (selectedFilter == 'Ongoing' && e['status'] != 'ENDED') ||
                      (selectedFilter == 'Won' && e['status'] == 'ENDED' && e['isWinning']) ||
                      (selectedFilter == 'Lost' && e['status'] == 'ENDED' && !e['isWinning'])
                  ).length)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 16),
              child: Center(
                child: ElevatedButton(
                  onPressed: () {
                    setState(() => showAll = true);
                    _applyFilter();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue[700],
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  ),
                  child: const Text(
                    'Show More',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildTimeItem(String value, String label) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.hourglass_empty, size: 100, color: Colors.grey[400]),
            const SizedBox(height: 24),
            Text(
              'No Auctions Yet',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.grey[700]),
            ),
            const SizedBox(height: 8),
            Text(
              'You haven’t participated in any auctions yet. Start bidding now!',
              style: TextStyle(fontSize: 16, color: Colors.grey[600]),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

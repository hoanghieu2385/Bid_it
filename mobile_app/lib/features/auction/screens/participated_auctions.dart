import 'dart:collection';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile_app/core/services/bid_service.dart';
import 'package:mobile_app/core/services/user_service.dart';
import 'package:mobile_app/core/services/auction_service.dart';
import 'package:mobile_app/core/services/payment_service.dart';
import 'package:mobile_app/features/auction/screens/auction_detail.dart';
import 'package:mobile_app/core/models/auction_model.dart';
import 'dart:convert';
import 'dart:developer' as developer;

class ParticipatedAuctionsPage extends StatefulWidget {
  const ParticipatedAuctionsPage({super.key});

  @override
  State<ParticipatedAuctionsPage> createState() => _ParticipatedAuctionsPageState();
}

class _ParticipatedAuctionsPageState extends State<ParticipatedAuctionsPage> {
  final ScrollController _scrollController = ScrollController();
  bool isLoading = true;
  List<Map<String, dynamic>> auctions = [];
  String filterStatus = 'ALL';
  String searchQuery = '';
  bool showAll = false;
  String? errorMessage;


  @override
  void initState() {
    super.initState();
    _fetchUserAuctions();
  }

  Future<void> _fetchUserAuctions() async {
    try {
      setState(() => errorMessage = null);
      final user = await UserService.getCurrentUser();
      if (user == null) {
        throw Exception('User not logged in');
      }
      final token = await UserService.getToken() ?? '';
      final timestamp = DateTime.now().toIso8601String();
      developer.log('[$timestamp] User ID: ${user['id']}', name: 'UserService');
      developer.log('[$timestamp] Token: $token', name: 'UserService');

      final bids = await BidService.fetchAllUserBids(user['id'], token: token);
      developer.log('[$timestamp] Bids JSON Response: ${jsonEncode(bids)}', name: 'BidService');

      final Map<int, Map<String, dynamic>> grouped = HashMap();
      for (final bid in bids) {
        final id = bid['auctionId'];
        if (id == null) continue;
        if (!grouped.containsKey(id)) {
          grouped[id] = {
            'auctionId': id,
            'title': bid['auctionTitle'] ?? 'Untitled Auction',
            'status': bid['status'] ?? '',
            'isWinning': bid['isWinning'] ?? false,
          };
          developer.log('[$timestamp] Grouped Auction ID $id: ${jsonEncode(grouped[id])}', name: 'AuctionGroup');
        } else if (bid['isWinning'] == true) {
          grouped[id]!['isWinning'] = true;
        }
      }

      final List<Map<String, dynamic>> mappedAuctions = [];
      for (final group in grouped.values) {
        final int id = group['auctionId'];
        developer.log('[$timestamp] Fetching Auction ID: $id', name: 'AuctionService');

        final Auction? auction = await AuctionService.fetchAuctionById(id);
        if (auction == null) {
          throw Exception('Failed to fetch auction with ID: $id');
        }
        developer.log('[$timestamp] Auction JSON Response for ID $id: ${jsonEncode(auction.toJson())}', name: 'AuctionService');

        final bool paid = await PaymentService.hasCompletedPayment(id, token);
        developer.log('[$timestamp] Payment Status for Auction ID $id: $paid', name: 'PaymentService');

        mappedAuctions.add({
          'auction': auction,
          'title': group['title'],
          'status': group['status'],
          'isWinning': group['isWinning'],
          'isPaid': paid,
        });
        developer.log('[$timestamp] Mapped Auctions: ${jsonEncode(mappedAuctions)}', name: 'AuctionMapping');
      }
      mappedAuctions.sort((a, b) {
        final Auction auctionA = a['auction'];
        final Auction auctionB = b['auction'];
        return auctionB.startTime.compareTo(auctionA.startTime);
      });
      setState(() {
        auctions = mappedAuctions;
        isLoading = false;
      });
    } catch (e) {
      final timestamp = DateTime.now().toIso8601String();
      developer.log('[$timestamp] Error fetching auctions: $e', name: 'ErrorHandler');
      setState(() {
        isLoading = false;
        errorMessage = e.toString();
      });
    }
  }

  List<Map<String, dynamic>> get filteredAuctions {
    final now = DateTime.now();

    final filtered = auctions.where((entry) {
      final Auction auction = entry['auction'];
      final bool isWinning = entry['isWinning'];
      final bool isPaid = entry['isPaid'];
      final bool isOngoing = now.isBefore(auction.endTime);

      bool matchesStatus = true;
      switch (filterStatus) {
        case 'WINNING':
          matchesStatus = isWinning;
          break;
        case 'UNPAID':
          matchesStatus = isWinning && !isPaid;
          break;
        case 'EXPIRED':
          matchesStatus = isWinning &&
              !isPaid &&
              auction.winnerPaymentDeadline != null &&
              now.isAfter(auction.winnerPaymentDeadline!);
          break;
        case 'ONGOING':
          matchesStatus = isOngoing;
          break;
        case 'ALL':
        default:
          matchesStatus = true;
          break;
      }

      final matchesSearch = auction.title.toLowerCase().contains(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    }).toList();

    return showAll ? filtered : filtered.take(3).toList();
  }


  Widget _buildFilterChip(String value, String label) {
    final isSelected = filterStatus == value;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 6),
      child: ChoiceChip(
        label: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.blue[900],
            fontWeight: FontWeight.w600,
          ),
        ),
        selected: isSelected,
        selectedColor: Colors.blue[700],
        backgroundColor: Colors.grey[200],
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(
            color: isSelected ? Colors.blue[700]! : Colors.grey[300]!,
            width: 1.5,
          ),
        ),
        onSelected: (_) => setState(() {
          filterStatus = value;
          showAll = false;
        }),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        elevation: isSelected ? 4 : 0,
      ),
    );
  }

  void _toggleShowMore() {
    setState(() => showAll = !showAll);
    if (!showAll) {
      _scrollController.animateTo(
        0,
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOut,
      );
    } else {
      Future.delayed(const Duration(milliseconds: 100), () {
        if (_scrollController.hasClients) {
          _scrollController.animateTo(
            _scrollController.position.maxScrollExtent,
            duration: const Duration(milliseconds: 400),
            curve: Curves.easeOut,
          );
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final totalCount = auctions.length;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Participated Auctions', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 1,
        centerTitle: true,
      ),
      backgroundColor: const Color(0xFFF0F2F5),
      body: Column(
        children: [
          Container(
            margin: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                )
              ],
            ),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search by auction name...',
                prefixIcon: const Icon(Icons.search),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.all(16),
              ),
              onChanged: (val) => setState(() => searchQuery = val),
            ),
          ),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                _buildFilterChip('ALL', 'All'),
                _buildFilterChip('ONGOING', 'Ongoing'),
                _buildFilterChip('WINNING', 'Won'),
                _buildFilterChip('UNPAID', 'Unpaid'),
                _buildFilterChip('EXPIRED', 'Expired'),
              ],
            ),
          ),
          Expanded(
            child: isLoading
                ? const Center(child: CircularProgressIndicator())
                : errorMessage != null
                ? Center(child: Text('Error: $errorMessage', style: TextStyle(color: Colors.red)))
                : filteredAuctions.isEmpty
                ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.inbox, size: 80, color: Colors.grey[400]),
                  const SizedBox(height: 16),
                  Text('No Auctions Found',
                      style: TextStyle(
                          fontSize: 20, fontWeight: FontWeight.bold, color: Colors.grey[700])),
                  const SizedBox(height: 8),
                  Text('You haven’t participated in any auctions yet.',
                      style: TextStyle(fontSize: 16, color: Colors.grey[600]))
                ],
              ),
            )
                : ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: filteredAuctions.length + (filteredAuctions.length < totalCount ? 1 : 0),
              itemBuilder: (context, index) {
                if (index < filteredAuctions.length) {
                  final entry = filteredAuctions[index];
                  final Auction a = entry['auction'];
                  return GestureDetector(
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => AuctionDetailPage(auction: a)),
                    ),
                    child: _buildAuctionCard(a, entry['isWinning'], entry['isPaid']),
                  );
                } else {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 24),
                      child: GestureDetector(
                        onTap: _toggleShowMore,
                        child: Text(
                          showAll ? 'Show Less' : 'Show More',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Colors.blue[700],
                          ),
                        ),
                      ),
                    ),
                  );
                }
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAuctionCard(Auction a, bool isWinning, bool isPaid) {
    final numberFormat = NumberFormat("#,##0", "vi_VN");
    final imageUrl = a.mediaUrls.isNotEmpty ? a.mediaUrls.first : a.thumbnailUrl ?? '';

    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 3,
      margin: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(16),
              topRight: Radius.circular(16),
            ),
            child: Image.network(
              imageUrl,
              width: double.infinity,
              height: 180,
              fit: BoxFit.contain,
              errorBuilder: (_, __, ___) => Image.asset(
                'assets/images/product-img.png',
                width: double.infinity,
                height: 180,
                fit: BoxFit.contain,
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        a.title,
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (isPaid) const Icon(Icons.verified, color: Colors.teal, size: 20),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(Icons.monetization_on, color: Colors.orange[700], size: 18),
                    const SizedBox(width: 6),
                    Text('Starting Price: ${numberFormat.format(a.startingPrice)} \$')
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(Icons.gavel, color: Colors.green[700], size: 18),
                    const SizedBox(width: 6),
                    Text('Current Bid: ${numberFormat.format(a.currentBid ?? a.startingPrice)} \$')
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(Icons.people, color: Colors.deepPurple, size: 18),
                    const SizedBox(width: 6),
                    Text('Bids: ${a.bidCount}'),
                  ],
                ),
                if (isWinning && a.winnerPaymentDeadline != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Row(
                      children: [
                        const Icon(Icons.access_time, color: Colors.red, size: 18),
                        const SizedBox(width: 6),
                        Text(
                          'Deadline Payment: ${DateFormat('yyyy-MM-dd HH:mm').format(a.winnerPaymentDeadline!)}',
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: Colors.red,
                          ),
                        ),
                      ],
                    ),
                  ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: a.endTime.isBefore(DateTime.now())
                        ? (isWinning
                        ? (isPaid ? Colors.teal[100] : Colors.orange[100])
                        : Colors.red[100])
                        : Colors.blue[100],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                        () {
                      final now = DateTime.now();
                      final hasEnded = a.endTime.isBefore(now);
                      final isExpired = isWinning &&
                          !isPaid &&
                          a.winnerPaymentDeadline != null &&
                          now.isAfter(a.winnerPaymentDeadline!);

                      if (hasEnded) {
                        if (isWinning) {
                          if (isPaid) return '✅ Paid - You won!';
                          if (isExpired) return '⚠ Payment deadline expired!';
                          return '🎉 You won! (Unpaid)';
                        } else {
                          return 'You did not win';
                        }
                      } else {
                        return 'Auction is ongoing';
                      }
                    }(),
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                      color: a.endTime.isBefore(DateTime.now())
                          ? (isWinning ? (isPaid ? Colors.teal[800] : Colors.orange[800]) : Colors.red[800])
                          : Colors.blue[800],
                    ),
                  ),
                )
              ],
            ),
          )
        ],
      ),
    );
  }
}
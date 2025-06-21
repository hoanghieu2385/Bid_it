import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile_app/core/models/auction_model.dart';
import 'package:mobile_app/core/services/auction_service.dart';
import '../../../core/services/user_service.dart';
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
  void _confirmDeleteAuction(int auctionId) {
    showDialog(
      context: context,
      barrierDismissible: false, // Không cho đóng khi nhấn bên ngoài
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        titlePadding: const EdgeInsets.fromLTRB(24, 24, 24, 12),
        contentPadding: const EdgeInsets.symmetric(horizontal: 24),
        actionsPadding: const EdgeInsets.only(bottom: 16, right: 16),

        title: Row(
          children: const [
            Icon(Icons.warning_amber_rounded, color: Colors.redAccent),
            SizedBox(width: 10),
            Text(
              'Confirm Deletion',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
          ],
        ),

        content: const Text(
          'Are you sure you want to delete this auction? This action cannot be undone.',
          style: TextStyle(fontSize: 15),
        ),

        actions: [
          TextButton.icon(
            onPressed: () => Navigator.of(ctx).pop(),
            icon: const Icon(Icons.cancel, color: Colors.grey),
            label: const Text('Cancel'),
            style: TextButton.styleFrom(
              foregroundColor: Colors.grey[700],
              textStyle: const TextStyle(fontWeight: FontWeight.w500),
            ),
          ),
          TextButton.icon(
            onPressed: () async {
              Navigator.of(ctx).pop();
              try {
                final user = await UserService.getCurrentUser();
                await AuctionService.deleteAuction(auctionId, user?['id'],);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Auction deleted successfully'),
                    backgroundColor: Colors.green,
                  ),
                );
                _loadAuctions(); // Refresh list
              } catch (e) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Failed to delete auction: $e'),
                    backgroundColor: Colors.red,
                  ),
                );
              }
            },
            icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
            label: const Text('Delete'),
            style: TextButton.styleFrom(
              foregroundColor: Colors.redAccent,
              textStyle: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
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
                        trailing: PopupMenuButton<String>(
                          tooltip: 'Options',
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          elevation: 4,
                          offset: const Offset(0, 40),
                          icon: const Icon(Icons.more_vert, color: Colors.grey),
                          onSelected: (value) {
                            if (value == 'view') {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => AuctionDetailPage(auction: auction),
                                ),
                              );
                            } else if (value == 'delete') {
                              _confirmDeleteAuction(auction.id);
                            }
                          },
                          itemBuilder: (BuildContext context) => [
                            PopupMenuItem<String>(
                              value: 'view',
                              child: Row(
                                children: const [
                                  Icon(Icons.visibility, color: Colors.blueAccent),
                                  SizedBox(width: 10),
                                  Text('View Details'),
                                ],
                              ),
                            ),
                            PopupMenuItem<String>(
                              value: 'delete',
                              child: Row(
                                children: const [
                                  Icon(Icons.delete, color: Colors.redAccent),
                                  SizedBox(width: 10),
                                  Text('Delete Auction'),
                                ],
                              ),
                            ),
                          ],
                        ),


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

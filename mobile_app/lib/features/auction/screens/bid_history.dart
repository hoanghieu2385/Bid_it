// lib/pages/bid_history_page.dart
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile_app/core/services/bid_service.dart';
import 'package:mobile_app/core/services/user_service.dart';

class BidHistoryPage extends StatefulWidget {
  const BidHistoryPage({super.key});

  @override
  State<BidHistoryPage> createState() => _BidHistoryPageState();
}

class _BidHistoryPageState extends State<BidHistoryPage> {
  List<Map<String, dynamic>> bids = [];
  bool isLoading = true;
  final numberFormat = NumberFormat("#,##0", "vi_VN");
  String filterStatus = 'ALL';
  String searchQuery = '';

  @override
  void initState() {
    super.initState();
    _fetchBidHistory();
  }

  Future<void> _fetchBidHistory() async {
    try {
      final user = await UserService.getCurrentUser();
      if (user == null) return;
      final token = await UserService.getToken() ?? '';
      final casted = await BidService.fetchAllUserBids(user['id'], token: token);
      setState(() {
        bids = casted;
        isLoading = false;
      });
    } catch (e) {
      setState(() => isLoading = false);
    }
  }

  List<Map<String, dynamic>> get filteredBids {
    return bids.where((b) {
      final matchesStatus = filterStatus == 'ALL' ||
          (filterStatus == 'WINNING' && b['isWinning'] == true) ||
          (filterStatus == 'OUTBID' && b['isWinning'] == false);
      final matchesSearch = b['auctionTitle']
          ?.toString()
          .toLowerCase()
          .contains(searchQuery.toLowerCase()) ??
          false;
      return matchesStatus && matchesSearch;
    }).toList();
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'ACTIVE':
        return Colors.blue;
      case 'OUTBID':
        return Colors.red;
      case 'WINNING':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }

  String _groupByDay(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date).inDays;
    if (diff == 0) return "Today";
    if (diff == 1) return "Yesterday";
    return DateFormat('dd MMM yyyy').format(date);
  }

  int get totalBids => filteredBids.length;
  double get totalAmount =>
      filteredBids.fold(0.0, (sum, b) => sum + (b['bidAmount'] ?? 0));

  @override
  Widget build(BuildContext context) {
    final grouped = <String, List<Map<String, dynamic>>>{};
    for (final bid in filteredBids) {
      final created = bid['createdAt'] ?? bid['bidTime'];
      final dateTime = DateTime.tryParse(created ?? '') ?? DateTime.now();
      final label = _groupByDay(dateTime);
      grouped.putIfAbsent(label, () => []).add(bid);
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Bid History', style: TextStyle(fontWeight: FontWeight.bold)),
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
                  color: Colors.black.withOpacity(0.05),
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
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildFilterChip('ALL', 'All'),
                _buildFilterChip('WINNING', 'Winning'),
                _buildFilterChip('OUTBID', 'Outbid'),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Total: $totalBids bids', style: const TextStyle(fontWeight: FontWeight.w500)),
                Text('Amount: ${numberFormat.format(totalAmount)} đ',
                    style: const TextStyle(color: Colors.deepPurple, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
          Expanded(
            child: isLoading
                ? const Center(child: CircularProgressIndicator())
                : filteredBids.isEmpty
                ? const Center(child: Text('No bid history available.'))
                : RefreshIndicator(
              onRefresh: _fetchBidHistory,
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: grouped.length,
                itemBuilder: (context, index) {
                  final key = grouped.keys.elementAt(index);
                  final items = grouped[key]!;
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: Text(key,
                            style: const TextStyle(
                                fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black54)),
                      ),
                      ...items.map((bid) => _buildBidCard(bid)).toList(),
                    ],
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
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
        onSelected: (_) => setState(() => filterStatus = value),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        elevation: isSelected ? 4 : 0,
      ),
    );
  }

  Widget _buildBidCard(Map<String, dynamic> bid) {
    final amount = numberFormat.format(bid['bidAmount']);
    final created = bid['createdAt'] ?? bid['bidTime'];
    final dateTime = DateTime.tryParse(created ?? '');
    final time = dateTime != null ? DateFormat('HH:mm dd/MM/yyyy').format(dateTime) : 'Unknown';
    final isWinning = bid['isWinning'] == true;
    final status = bid['status'] ?? '';

    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 2,
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CircleAvatar(
              backgroundColor: isWinning ? Colors.green.shade100 : Colors.red.shade100,
              radius: 24,
              child: Icon(isWinning ? Icons.emoji_events : Icons.gavel,
                  color: isWinning ? Colors.green : Colors.red),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(bid['auctionTitle'] ?? 'No title',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  Text('$amount đ',
                      style: const TextStyle(color: Colors.deepOrange, fontWeight: FontWeight.w500)),
                  const SizedBox(height: 4),
                  Text(time, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                  const SizedBox(height: 4),
                  Text(status, style: TextStyle(color: _statusColor(status), fontSize: 13)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: Colors.grey),
          ],
        ),
      ),
    );
  }
}

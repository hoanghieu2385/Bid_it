import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../core/models/auction_model.dart';
import '../../../core/services/auction_service.dart';
import '../../../core/services/user_service.dart';
import '../../auction/screens/auction_winner.dart';
import '../../home/screens/home_screen.dart';
import '../../payment/screens/payment_screen.dart';

class OrderDetailPage extends StatefulWidget {
  final int auctionId;

  const OrderDetailPage({super.key, required this.auctionId});

  @override
  _OrderDetailPageState createState() => _OrderDetailPageState();
}

class _OrderDetailPageState extends State<OrderDetailPage>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _cardFadeAnimation;
  late Animation<Offset> _cardSlideAnimation;
  late Animation<double> _headerScaleAnimation;
  late Animation<double> _buttonFadeAnimation;
  late Animation<double> _buttonScaleAnimation;
  late Future<Auction?> _auctionFuture;

  String? _winnerName;


  @override
  @override
  void initState() {
    super.initState();
    _auctionFuture = AuctionService.fetchAuctionById(widget.auctionId);
    _auctionFuture.then((auction) async {
      if (auction?.winnerId != null) {
        try {
          print(auction!.winnerId!);
          final seller = await UserService.getSellerById(auction.winnerId!);
          final fullName = seller['fullName'] ?? '';
          debugPrint(fullName);
          if (mounted) {
            setState(() {
              _winnerName = '$fullName'.trim();
              print(_winnerName);
            });
          }
        } catch (e) {
          if (mounted) {
            setState(() {
              _winnerName = 'Unknown';
            });
          }
        }
      }
    });
    _initAnimations();
  }


  void _initAnimations() {
    _controller = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );

    _cardFadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.5, curve: Curves.easeOut),
      ),
    );
    _cardSlideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.2),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.5, curve: Curves.easeOutCubic),
      ),
    );
    _headerScaleAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.2, 0.6, curve: Curves.easeOutBack),
      ),
    );
    _buttonFadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.5, 0.8, curve: Curves.easeOut),
      ),
    );
    _buttonScaleAnimation = Tween<double>(begin: 0.9, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.5, 0.8, curve: Curves.easeOutBack),
      ),
    );

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.reverse().then((_) => _controller.dispose());
    super.dispose();
  }

  Future<void> _exitPage() async {
    await _controller.reverse();
    if (mounted) Navigator.of(context).pop();
  }

  Future<void> _goToHome() async {
    await _controller.reverse();
    if (mounted) {
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => const HomePage()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        await _exitPage();
        return false;
      },
      child: Scaffold(
        backgroundColor: const Color(0xFFF5F5F5),
        body: SafeArea(
          child: FutureBuilder<Auction?>(
            future: _auctionFuture,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              } else if (snapshot.hasError) {
                return Center(child: Text('Error: ${snapshot.error}'));
              } else if (!snapshot.hasData || snapshot.data == null) {
                return const Center(child: Text('Không tìm thấy đấu giá'));
              }

              final auction = snapshot.data!;
              return _buildOrderContent(auction);
            },
          ),
        ),
      ),
    );
  }

  Widget _buildOrderContent(Auction auction) {
    final numberFormat = NumberFormat("#,##0.00", "en_US");
    final now = DateTime.now();
    final isPaymentDue = auction.winnerPaymentDeadline != null &&
        now.isBefore(auction.winnerPaymentDeadline!) &&
        auction.status == 'SOLD';

    return GestureDetector(
      onHorizontalDragEnd: (details) {
        if (details.velocity.pixelsPerSecond.dx > 0) _exitPage();
      },
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: FadeTransition(
          opacity: _cardFadeAnimation,
          child: SlideTransition(
            position: _cardSlideAnimation,
            child: Card(
              elevation: 4,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ScaleTransition(
                      scale: _headerScaleAnimation,
                      child: Row(
                        children: [
                          const Icon(Icons.gavel, color: Colors.orange, size: 32),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              auction.title,
                              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    _buildInfoTile(Icons.event, 'Start Time', DateFormat('yyyy-MM-dd HH:mm').format(auction.startTime)),
                    _buildInfoTile(Icons.event, 'End Time', DateFormat('yyyy-MM-dd HH:mm').format(auction.endTime)),
                    _buildInfoTile(Icons.check_circle, 'Status', auction.status),
                    _buildInfoTile(Icons.attach_money, 'Winning Bid', '\$${numberFormat.format(auction.currentBid ?? 0)}'),
                    _buildInfoTile(Icons.person, 'Winner', _winnerName ?? 'Loading...'),

                    _buildInfoTile(
                      Icons.hourglass_bottom,
                      'Payment Deadline',
                      auction.winnerPaymentDeadline != null
                          ? DateFormat('yyyy-MM-dd HH:mm').format(auction.winnerPaymentDeadline!)
                          : 'N/A',
                    ),
                    const SizedBox(height: 24),
                    auction.mediaUrls.isNotEmpty
                        ? Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8.0),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.network(
                          auction.mediaUrls.first,
                          height: 180,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) =>
                          const Text('Failed to load image'),
                        ),
                      ),
                    )
                        : _buildInfoTile(Icons.image, 'Thumbnail', 'None'),
                    const SizedBox(height: 24),
                    FadeTransition(
                      opacity: _buttonFadeAnimation,
                      child: ScaleTransition(
                        scale: _buttonScaleAnimation,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: ElevatedButton(
                                onPressed: () {
                                  Navigator.pushReplacement(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => AuctionWinnerPage(auctionId: widget.auctionId),
                                    ),
                                  );
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.grey[400],
                                  foregroundColor: Colors.white,
                                  padding: EdgeInsets.symmetric(
                                    vertical: 14,
                                    horizontal: MediaQuery.of(context).size.width * 0.03,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  elevation: 2,
                                  textStyle: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                child: const Text('Back'),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: ElevatedButton(
                                onPressed: () {
                                  Navigator.pushReplacement(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => PaymentScreen(auctionId: widget.auctionId),
                                    ),
                                  );
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFFFFA726),
                                  foregroundColor: Colors.white,
                                  padding: EdgeInsets.symmetric(
                                    vertical: 14,
                                    horizontal: MediaQuery.of(context).size.width * 0.03,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  elevation: 2,
                                  textStyle: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                child: const Text('Continue'),
                              ),
                            ),
                          ],
                        ),
                      ),
                    )
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildInfoTile(IconData icon, String title, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        children: [
          Icon(icon, color: Colors.orange),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 14, color: Colors.grey)),
                const SizedBox(height: 4),
                Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

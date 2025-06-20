import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:flutter/services.dart';
import 'package:mobile_app/features/payment/screens/payment_success.dart';

import '../../../core/models/auction_model.dart';
import '../../payment/screens/payment_screen.dart';
import 'package:mobile_app/core/services/auction_service.dart';

class AuctionWinnerPage extends StatefulWidget {
  final int auctionId;

  const AuctionWinnerPage({super.key, required this.auctionId});

  @override
  _AuctionWinnerPageState createState() => _AuctionWinnerPageState();
}

class _AuctionWinnerPageState extends State<AuctionWinnerPage> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _cardFadeAnimation;
  late Animation<Offset> _cardSlideAnimation;
  late Animation<double> _trophyScaleAnimation;
  late List<Animation<double>> _tileFadeAnimations;
  late Animation<double> _buttonFadeAnimation;
  late Animation<double> _buttonScaleAnimation;
  bool _isLoading = false;

  Map<String, dynamic>? winnerData;
  Map<String, dynamic>? userData;
  Auction? auctionData;

  String errorMessage = '';
  final AuctionService _auctionService = AuctionService();

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );

    _cardFadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.0, 0.5, curve: Curves.easeOut)),
    );
    _cardSlideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.2),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.0, 0.5, curve: Curves.easeOutCubic)),
    );

    _trophyScaleAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.2, 0.6, curve: Curves.easeOutBack)),
    );

    _tileFadeAnimations = List.generate(
      4,
          (index) => Tween<double>(begin: 0.0, end: 1.0).animate(
        CurvedAnimation(
          parent: _controller,
          curve: Interval(0.3 + index * 0.1, 0.6 + index * 0.1, curve: Curves.easeOut),
        ),
      ),
    );

    _buttonFadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.5, 0.8, curve: Curves.easeOut)),
    );
    _buttonScaleAnimation = Tween<double>(begin: 0.9, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.5, 0.8, curve: Curves.easeOutBack)),
    );

    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() {
      _isLoading = true;
      errorMessage = '';
    });

    try {
      final winner = await _auctionService.fetchWinner(widget.auctionId);
      if (winner != null) {
        setState(() {
          winnerData = winner;
        });
        final user = await _auctionService.fetchUser(winner['userId']);
        setState(() {
          userData = user;
        });
        final auction = await AuctionService.fetchAuctionById(widget.auctionId);
        setState(() {
          auctionData = auction;
        });
      }
    } catch (e) {
      setState(() {
        errorMessage = 'Error: \$e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
      if (errorMessage.isEmpty) {
        _controller.forward();
      }
    }
  }

  @override
  void dispose() {
    _controller.reverse().then((_) => _controller.dispose());
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final numberFormat = NumberFormat("#,##0", "en_US");
    final bidAmountRaw = winnerData?['bidAmount'];
    final double parsedBidAmount = bidAmountRaw is num
        ? bidAmountRaw.toDouble()
        : double.tryParse(bidAmountRaw.toString()) ?? 0.0;

    final bidAmount = numberFormat.format(parsedBidAmount);

    final wonAt = winnerData != null
        ? DateFormat('yyyy-MM-dd HH:mm').format(DateTime.parse(winnerData!['bidTime']))
        : '';

    final paymentDeadline = auctionData?.winnerPaymentDeadline != null
        ? DateFormat('yyyy-MM-dd HH:mm').format(auctionData!.winnerPaymentDeadline!)
        : '';

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            child: Padding(
              padding: EdgeInsets.symmetric(
                horizontal: MediaQuery.of(context).size.width * 0.05,
                vertical: 24,
              ),
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : errorMessage.isNotEmpty
                  ? Center(child: Text(errorMessage, style: const TextStyle(color: Colors.red)))
                  : FadeTransition(
                opacity: _cardFadeAnimation,
                child: SlideTransition(
                  position: _cardSlideAnimation,
                  child: Card(
                    elevation: 4,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    color: Colors.white,
                    child: Container(
                      constraints: BoxConstraints(
                        maxWidth: MediaQuery.of(context).size.width * 0.9,
                      ),
                      padding: const EdgeInsets.all(32),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          ScaleTransition(
                            scale: _trophyScaleAnimation,
                            child: Stack(
                              alignment: Alignment.center,
                              children: [
                                Container(
                                  width: 80,
                                  height: 80,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: const Color(0xFFFFA726).withOpacity(0.1),
                                  ),
                                ),
                                const Icon(
                                  Icons.emoji_events,
                                  size: 48,
                                  color: Color(0xFFFFA726),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 24),
                          FadeTransition(
                            opacity: _cardFadeAnimation,
                            child: const Text(
                              'Congratulations!',
                              style: TextStyle(
                                fontSize: 28,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF1A1A1A),
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                          const SizedBox(height: 8),
                          FadeTransition(
                            opacity: _cardFadeAnimation,
                            child: Text(
                              'You won this auction ${auctionData?.title ?? ''}',
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w500,
                                color: Color(0xFF666666),
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                          const Divider(height: 24, color: Color(0xFFEEEEEE)),
                          FadeTransition(
                            opacity: _tileFadeAnimations[1],
                            child: _buildInfoTile(
                              context,
                              icon: Icons.email,
                              title: 'Email',
                              value: userData?['email'] ?? '',
                              trailing: IconButton(
                                icon: const Icon(Icons.copy, size: 20, color: Color(0xFF666666)),
                                onPressed: () {
                                  Clipboard.setData(ClipboardData(text: userData?['email'] ?? ''));
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: const Text('Email copied to clipboard'),
                                      backgroundColor: const Color(0xFF4CAF50),
                                      behavior: SnackBarBehavior.floating,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      duration: const Duration(seconds: 2),
                                    ),
                                  );
                                },
                              ),
                            ),
                          ),
                          const Divider(height: 24, color: Color(0xFFEEEEEE)),
                          FadeTransition(
                            opacity: _tileFadeAnimations[2],
                            child: _buildInfoTile(
                              context,
                              icon: Icons.attach_money,
                              title: 'Winning Bid',
                              value: '\$\$bidAmount',
                              valueStyle: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF4CAF50),
                              ),
                            ),
                          ),
                          const Divider(height: 24, color: Color(0xFFEEEEEE)),
                          FadeTransition(
                            opacity: _tileFadeAnimations[3],
                            child: _buildInfoTile(
                              context,
                              icon: Icons.access_time,
                              title: 'Won At',
                              value: wonAt,
                            ),
                          ),
                          const Divider(height: 24, color: Color(0xFFEEEEEE)),
                          FadeTransition(
                            opacity: _tileFadeAnimations[3],
                            child: _buildInfoTile(
                              context,
                              icon: Icons.hourglass_bottom,
                              title: 'Payment Deadline',
                              value: paymentDeadline,
                              valueStyle: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFFD32F2F),
                              ),
                            ),
                          ),
                          const SizedBox(height: 32),
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
                                        _controller.reverse().then((_) {
                                          Navigator.pop(context);
                                        });
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
                                    child: _isLoading
                                        ? const Center(
                                      child: CircularProgressIndicator(
                                        color: Color(0xFFFFA726),
                                      ),
                                    )
                                        : ElevatedButton(
                                      onPressed: () async {
                                        await _controller.reverse();
                                        Navigator.pushReplacement(
                                          context,
                                          MaterialPageRoute(
                                            builder: (_) => PaymentSuccessScreen(),
                                          ),
                                        );
                                        setState(() {
                                          _isLoading = false;
                                        });
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
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildInfoTile(
      BuildContext context, {
        required IconData icon,
        required String title,
        required String value,
        TextStyle? valueStyle,
        Widget? trailing,
      }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: const Color(0xFFFFA726).withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, size: 24, color: const Color(0xFFFFA726)),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: Color(0xFF666666),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: valueStyle ??
                    const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF1A1A1A),
                    ),
              ),
            ],
          ),
        ),
        if (trailing != null) trailing,
      ],
    );
  }
}

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:flutter/services.dart';
import 'package:mobile_app/features/payment/screens/paypal_payment.dart';
import '../../auction/screens/auction_winner.dart';
import '../../payment/screens/payment_success.dart';
import 'package:mobile_app/core/services/auction_service.dart';
import 'package:mobile_app/core/services/payment_service.dart';

class PaymentScreen extends StatefulWidget {
  final int auctionId;
  const PaymentScreen({super.key, required this.auctionId});

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _cardFadeAnimation;
  late Animation<Offset> _cardSlideAnimation;
  late Animation<double> _buttonFadeAnimation;
  late Animation<double> _buttonScaleAnimation;
  bool _isLoading = false;
  Map<String, dynamic>? winnerData;
  String? errorMessage;
  String _selectedMethod = 'PAYPAL';

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

    _buttonFadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.5, 0.8, curve: Curves.easeOut)),
    );
    _buttonScaleAnimation = Tween<double>(begin: 0.9, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.5, 0.8, curve: Curves.easeOutBack)),
    );

    _fetchWinner();
  }

  Future<void> _fetchWinner() async {
    try {
      final service = AuctionService();
      final data = await service.fetchWinner(widget.auctionId);
      if (data != null) {
        setState(() {
          winnerData = data;
        });
        _controller.forward();
      }
    } catch (e) {
      setState(() {
        errorMessage = 'Failed to load winner data: $e';
      });
    }
  }

  Future<void> _processPayment() async {
    if (winnerData == null) return;
    try {
      final dynamic rawAmount = winnerData!['bidAmount'];
      final double finalAmount = rawAmount is num
          ? rawAmount.toDouble()
          : double.tryParse(rawAmount.toString()) ?? 0.0;

      setState(() => _isLoading = true);
      await PaymentService.createAuctionPayment(
        winnerId: winnerData!['userId'],
        auctionId: widget.auctionId,
        finalAmount: finalAmount,
        depositAmount: 0.0,
        paymentMethod: _selectedMethod,
        returnUrl: 'https://myapp/success',
        cancelUrl: 'https://myapp/cancel',
      );
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Payment processed successfully!'),
          backgroundColor: Colors.green,
        ),
      );

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => PaypalPayment(amount: finalAmount, currency: "USD"),
      ));
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Payment failed: $e'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (errorMessage != null) {
      return Scaffold(
        body: Center(
          child: Text(errorMessage!, style: const TextStyle(color: Colors.red)),
        ),
      );
    }

    if (winnerData == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final numberFormat = NumberFormat("#,##0", "en_US");
    final bidAmountRaw = winnerData?['bidAmount'];
    final double parsedBidAmount = bidAmountRaw is num
        ? bidAmountRaw.toDouble()
        : double.tryParse(bidAmountRaw.toString()) ?? 0.0;

    final bidAmount = numberFormat.format(parsedBidAmount);

    final wonAt = DateFormat('yyyy-MM-dd HH:mm').format(DateTime.parse(winnerData!['bidTime']));

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
              child: FadeTransition(
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
                          const Icon(Icons.payment, size: 48, color: Color(0xFFFFA726)),
                          const SizedBox(height: 16),
                          const Text(
                            'Payment Summary',
                            style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: Color(0xFF1A1A1A)),
                          ),
                          const SizedBox(height: 10),
                          const Text(
                            'Review and confirm your payment to proceed.',
                            style: TextStyle(fontSize: 16, color: Color(0xFF666666)),
                          ),
                          const SizedBox(height: 32),
                          _buildDetailTile(Icons.attach_money, 'Amount to Pay', '\$$bidAmount'),
                          const Divider(height: 24, color: Color(0xFFEEEEEE)),
                          _buildDetailTile(Icons.access_time, 'Won At', wonAt),
                          const SizedBox(height: 24),
                          Align(
                            alignment: Alignment.centerLeft,
                            child: Text('Select Payment Method:', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              _buildPaymentOption('PAYPAL'),
                              const SizedBox(width: 16),
                              _buildPaymentOption('BANK TRANSFER'),
                            ],
                          ),
                          const SizedBox(height: 24),
                          FadeTransition(
                            opacity: _buttonFadeAnimation,
                            child: ScaleTransition(
                              scale: _buttonScaleAnimation,
                              child: Row(
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
                                        padding: const EdgeInsets.symmetric(vertical: 14),
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(12),
                                        ),
                                        elevation: 2,
                                      ),
                                      child: const Text('Back'),
                                    ),
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: _isLoading
                                        ? const Center(child: CircularProgressIndicator(color: Color(0xFFFFA726)))
                                        : ElevatedButton(
                                      onPressed: _processPayment,
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: const Color(0xFFFFA726),
                                        foregroundColor: Colors.white,
                                        padding: const EdgeInsets.symmetric(vertical: 14),
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(12),
                                        ),
                                        elevation: 2,
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
          ),
        ),
      ),
    );
  }

  Widget _buildPaymentOption(String method) {
    final isSelected = _selectedMethod == method;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedMethod = method),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            border: Border.all(color: isSelected ? const Color(0xFFFFA726) : Colors.grey[300]!),
            borderRadius: BorderRadius.circular(12),
            color: isSelected ? const Color(0xFFFFA726).withOpacity(0.1) : Colors.white,
          ),
          child: Column(
            children: [
              Icon(method == 'PAYPAL' ? Icons.account_balance_wallet : Icons.account_balance, size: 28, color: const Color(0xFFFFA726)),
              const SizedBox(height: 8),
              Text(method, style: const TextStyle(fontWeight: FontWeight.w600)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailTile(IconData icon, String title, String value) {
    return Row(
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
              Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Color(0xFF666666))),
              const SizedBox(height: 4),
              Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Color(0xFF1A1A1A))),
            ],
          ),
        ),
      ],
    );
  }
}

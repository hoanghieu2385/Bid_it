import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:flutter/services.dart';

class AuctionWinnerPage extends StatefulWidget {
  final Map<String, dynamic> winnerData = {
    'username': 'nguyenvana',
    'email': 'nguyenvana@example.com',
    'bidAmount': 12500000,
    'auctionTitle': 'MacBook Pro 16-inch 2021',
    'wonAt': DateTime.now().subtract(const Duration(minutes: 5)),
  };

  AuctionWinnerPage({super.key});

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

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );

    // Card animations (fade and slide up)
    _cardFadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.0, 0.5, curve: Curves.easeOut)),
    );
    _cardSlideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.2),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.0, 0.5, curve: Curves.easeOutCubic)),
    );

    // Trophy scale animation
    _trophyScaleAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.2, 0.6, curve: Curves.easeOutBack)),
    );

    // Tile fade animations (staggered)
    _tileFadeAnimations = List.generate(
      4,
          (index) => Tween<double>(begin: 0.0, end: 1.0).animate(
        CurvedAnimation(
          parent: _controller,
          curve: Interval(0.3 + index * 0.1, 0.6 + index * 0.1, curve: Curves.easeOut),
        ),
      ),
    );

    // Button animations
    _buttonFadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.5, 0.8, curve: Curves.easeOut)),
    );
    _buttonScaleAnimation = Tween<double>(begin: 0.9, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.5, 0.8, curve: Curves.easeOutBack)),
    );

    _controller.forward();
  }

  @override
  void dispose() {
    // Reverse animations for disappearance
    _controller.reverse().then((_) => _controller.dispose());
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final numberFormat = NumberFormat("#,##0", "en_US");
    final bidAmount = numberFormat.format(widget.winnerData['bidAmount']);
    final wonAt = DateFormat('yyyy-MM-dd HH:mm').format(widget.winnerData['wonAt']);

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
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
                      constraints: const BoxConstraints(maxWidth: 500),
                      padding: const EdgeInsets.all(32),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          // Trophy with Scale Animation
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
                          // Title
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
                              'You won: ${widget.winnerData['auctionTitle']}',
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w500,
                                color: Color(0xFF666666),
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                          const SizedBox(height: 32),
                          // Info Tiles with Fade Animations
                          FadeTransition(
                            opacity: _tileFadeAnimations[0],
                            child: _buildInfoTile(
                              context,
                              icon: Icons.person,
                              title: 'Winner',
                              value: widget.winnerData['username'],
                            ),
                          ),
                          const Divider(height: 24, color: Color(0xFFEEEEEE)),
                          FadeTransition(
                            opacity: _tileFadeAnimations[1],
                            child: _buildInfoTile(
                              context,
                              icon: Icons.email,
                              title: 'Email',
                              value: widget.winnerData['email'],
                              trailing: IconButton(
                                icon: const Icon(Icons.copy, size: 20, color: Color(0xFF666666)),
                                onPressed: () {
                                  Clipboard.setData(ClipboardData(text: widget.winnerData['email']));
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
                              value: '\$$bidAmount',
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
                          const SizedBox(height: 32),
                          // Animated Button
                          FadeTransition(
                            opacity: _buttonFadeAnimation,
                            child: ScaleTransition(
                              scale: _buttonScaleAnimation,
                              child: SizedBox(
                                width: double.infinity,
                                child: ElevatedButton(
                                  onPressed: () {
                                    // Trigger exit animation before navigation
                                    _controller.reverse().then((_) {
                                      // Add navigation or action here
                                    });
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFFFFA726),
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(vertical: 16),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    elevation: 2,
                                    textStyle: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  child: const Text('Confirm & Proceed'),
                                ),
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
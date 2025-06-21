// lib/features/payment/screens/paypal_payment.dart
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:mobile_app/features/payment/screens/payment_success.dart';
import 'package:mobile_app/core/services/payment_service.dart';

class PaypalPayment extends StatefulWidget {
  final int winnerId;
  final int auctionId;
  final double finalAmount;
  final double depositAmount;

  const PaypalPayment({
    super.key,
    required this.winnerId,
    required this.auctionId,
    required this.finalAmount,
    required this.depositAmount,
  });

  @override
  State<PaypalPayment> createState() => _PaypalPaymentState();
}

class _PaypalPaymentState extends State<PaypalPayment> {
  late final WebViewController _controller;
  bool _isLoading = true;
  String? _approvalUrl;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (url) => debugPrint("➡️ Loading: $url"),
          onPageFinished: (url) => debugPrint("✅ Finished: $url"),
          onNavigationRequest: (request) {
            final url = request.url;
            debugPrint("📡 Redirected to: $url");

            if (url.startsWith("myapp://success")) {
              final uri = Uri.parse(url);
              final paymentId = uri.queryParameters['token'];
              final payerId = uri.queryParameters['PayerID'];

              if (paymentId != null && payerId != null) {
                PaymentService.executePayment(
                  paymentId: paymentId,
                  payerId: payerId,
                ).then((success) {
                  if (success && mounted) {
                    Navigator.of(context).pushAndRemoveUntil(
                      MaterialPageRoute(builder: (_) => const PaymentSuccessScreen()),
                          (route) => false,
                    );
                  } else {
                    _showError('Verification failed.');
                  }
                });
              }
              return NavigationDecision.prevent;
            }

            if (url.startsWith("myapp://cancel")) {
              Navigator.of(context).pop();
              return NavigationDecision.prevent;
            }

            return NavigationDecision.navigate;
          },
          onWebResourceError: (error) {
            if (!error.description.contains("ERR_UNKNOWN_URL_SCHEME")) {
              debugPrint("❌ Web error: ${error.description}");
            }
          },
        ),
      );
    _startPayment();
  }

  Future<void> _startPayment() async {
    try {
      final payment = await PaymentService.createAuctionPayment(
        winnerId: widget.winnerId,
        auctionId: widget.auctionId,
        finalAmount: widget.finalAmount,
        depositAmount: widget.depositAmount,
        paymentMethod: 'PAYPAL',
        returnUrl: 'myapp://success',
        cancelUrl: 'myapp://cancel',
      );
      debugPrint("🌐 approvalUrl: ${payment.approvalLink}");
      _approvalUrl = payment.approvalLink;
      await _controller.loadRequest(Uri.parse(payment.approvalLink));
      if (mounted) setState(() => _isLoading = false);
    } catch (e) {
      _showError('Failed to initiate payment: $e');
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.red),
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        actions: _approvalUrl != null
            ? [
          IconButton(
            icon: const Icon(Icons.open_in_browser),
            onPressed: () => debugPrint("🔗 URL: $_approvalUrl"),
          )
        ]
            : null,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : WebViewWidget(controller: _controller),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_paypal/flutter_paypal.dart';
import 'package:mobile_app/features/payment/screens/payment_success.dart';

class PaypalPayment extends StatelessWidget {
  final double amount;
  final String currency;

  const PaypalPayment({super.key, required this.amount, required this.currency});

  @override
  Widget build(BuildContext context) {
    return UsePaypal(
      sandboxMode: true,
      clientId: "ARd_reWUxpKfkLEyEWaow17fDAt4f1H9C6h0dsVVGwfx7uZM_6ABTFslOXDAaRIK-X50DHzzEeZZEKu9",
      secretKey: "EPkdO6ZqfUd9dPYJ6sJXKMmLC0DdLbhj7MAupcDpRRX-UDjGgZhfvFrdJhXdHeJBZ1i8-aAf7Aqdtt_o",
      returnURL: "https://example.com/return",
      cancelURL: "https://example.com/cancel",
      transactions: [
        {
          "amount": {
            "total": amount.toStringAsFixed(2),
            "currency": currency,
            "details": {
              "subtotal": amount.toStringAsFixed(2),
              "shipping": '0',
              "shipping_discount": 0
            }
          },
          "description": "Payment for auction item",
          "item_list": {
            "items": [
              {
                "name": "Auction item",
                "quantity": 1,
                "price": amount.toStringAsFixed(2),
                "currency": currency
              }
            ],
          }
        }
      ],
      note: "Contact us for any questions on your order.",
      onSuccess: (Map params) async {
        debugPrint("✅ onSuccess: $params");
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const PaymentSuccessScreen()),
        );
      },
      onError: (error) {
        debugPrint("❌ onError: $error");
        Navigator.pop(context, false);
      },
      onCancel: (params) {
        debugPrint("⚠️ Cancelled: $params");
        Navigator.pop(context, false);
      },
    );
  }
}

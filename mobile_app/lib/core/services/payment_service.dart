// lib/services/payment_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile_app/core/services/api_service.dart';
import 'package:mobile_app/core/services/user_service.dart';

class PaymentResponse {
  final String id;
  final String status;
  final String approvalLink;

  PaymentResponse({
    required this.id,
    required this.status,
    required this.approvalLink,
  });

  factory PaymentResponse.fromJson(Map<String, dynamic> json) {
    return PaymentResponse(
      id: json['id'].toString(),
      status: json['status'].toString(),
      approvalLink: json['approvalUrl'] ?? '',
    );
  }
}

class PaymentService {
  static const String _paymentBaseUrl = ApiService.paymentBaseUrl;
  static Future<List<Map<String, dynamic>>> fetchPaymentsByAuction(int auctionId, String token) async {
    final response = await http.get(
      Uri.parse('http://localhost:8080/payment-service/api/payment/auction/$auctionId'),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.cast<Map<String, dynamic>>();
    } else {
      throw Exception('Failed to load payments');
    }
  }

  static Future<bool> hasCompletedPayment(int auctionId, String token) async {
    final payments = await fetchPaymentsByAuction(auctionId, token);
    return payments.any((payment) => payment['status'] == 'COMPLETED');
  }

  static Future<bool> executePayment({
    required String paymentId,
    required String payerId,
  }) async {
    final url = Uri.parse('$_paymentBaseUrl/execute');

    try {
      final token = await UserService.getToken();
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          "paymentId": paymentId,
          "payerId": payerId,
        }),
      );

      if (response.statusCode == 200) {
        return true;
      } else {
        print("❌ Payment execution failed: ${response.statusCode} - ${response.body}");
        return false;
      }
    } catch (e) {
      print("❌ Exception during payment execution: $e");
      return false;
    }
  }

  static Future<PaymentResponse> createAuctionPayment({
    required int winnerId,
    required int auctionId,
    required double finalAmount,
    required double depositAmount,
    required String paymentMethod,
    String returnUrl = 'https://example.com/success',
    String cancelUrl = 'https://example.com/cancel',
  }) async {
    final token = await UserService.getToken();
    final payload = {
      'winnerId': winnerId,
      'auctionId': auctionId,
      'finalAmount': finalAmount,
      'depositAmount': depositAmount,
      'paymentMethod': paymentMethod,
      'returnUrl': returnUrl,
      'cancelUrl': cancelUrl,
    };
    print('📤 Payload gửi: ${jsonEncode(payload)}');

    final headers = {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };

    final res = await http.post(
      Uri.parse('$_paymentBaseUrl/auction'),
      headers: headers,
      body: jsonEncode(payload),
    );

    if (res.statusCode == 200) {
      return PaymentResponse.fromJson(jsonDecode(res.body));
    } else {
      print('❌ BACKEND ERROR: ${res.body}');
      throw Exception('Auction payment failed: ${res.statusCode} - ${res.body}');
    }
  }

  static Future<PaymentResponse> getPaymentById(int id) async {
    final res = await http.get(Uri.parse('$_paymentBaseUrl/$id'));
    if (res.statusCode == 200) {
      return PaymentResponse.fromJson(jsonDecode(res.body));
    } else {
      throw Exception('Get payment by ID failed');
    }
  }

  static Future<PaymentResponse> getPaymentByOrderId(String orderId) async {
    final res = await http.get(Uri.parse('$_paymentBaseUrl/order/$orderId'));
    if (res.statusCode == 200) {
      return PaymentResponse.fromJson(jsonDecode(res.body));
    } else {
      throw Exception('Get by orderId failed');
    }
  }

  static Future<List<PaymentResponse>> getPaymentsByUserId(int userId) async {
    final res = await http.get(Uri.parse('$_paymentBaseUrl/user/$userId'));
    if (res.statusCode == 200) {
      final list = jsonDecode(res.body) as List;
      return list.map((e) => PaymentResponse.fromJson(e)).toList();
    } else {
      throw Exception('Get payments by user failed');
    }
  }

  static Future<List<PaymentResponse>> getPaymentsByAuctionId(int auctionId) async {
    final res = await http.get(Uri.parse('$_paymentBaseUrl/auction/$auctionId'));
    if (res.statusCode == 200) {
      final list = jsonDecode(res.body) as List;
      return list.map((e) => PaymentResponse.fromJson(e)).toList();
    } else {
      throw Exception('Get payments by auction failed');
    }
  }

  static Future<String> updatePaymentStatus(int id, String status) async {
    final uri = Uri.parse('$_paymentBaseUrl/$id/status?status=$status');
    final res = await http.patch(uri);
    if (res.statusCode == 200) {
      return jsonDecode(res.body)['status'];
    } else {
      throw Exception('Update status failed');
    }
  }

  static Future<bool> isAuctionPaid(int auctionId) async {
    final res = await http.get(Uri.parse('$_paymentBaseUrl/check/auction/$auctionId'));
    if (res.statusCode == 200) {
      return jsonDecode(res.body) as bool;
    } else {
      throw Exception('Check auction paid failed');
    }
  }

  static Future<bool> hasUserPaidDeposit(int userId, int auctionId) async {
    final uri = Uri.parse('$_paymentBaseUrl/check/deposit?userId=$userId&auctionId=$auctionId');
    final res = await http.get(uri);
    if (res.statusCode == 200) {
      return jsonDecode(res.body) as bool;
    } else {
      throw Exception('Check deposit failed');
    }
  }

  static Future<String> cancelPayment(int id) async {
    final res = await http.delete(Uri.parse('$_paymentBaseUrl/$id'));
    if (res.statusCode == 200) {
      return jsonDecode(res.body)['status'];
    } else {
      throw Exception('Cancel payment failed');
    }
  }

  static Future<void> handleWebhook(String rawPayload) async {
    final res = await http.post(
      Uri.parse('$_paymentBaseUrl/webhook'),
      headers: {'Content-Type': 'application/json'},
      body: rawPayload,
    );
    if (res.statusCode != 200) {
      throw Exception('Webhook failed: ${res.statusCode}');
    }
  }
}

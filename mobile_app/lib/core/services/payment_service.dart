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
      approvalLink: json['approvalLink'] ?? '',
    );
  }
}

class PaymentService {
  static const String _paymentBaseUrl = ApiService.paymentBaseUrl;
  // 2. Tạo thanh toán cho winner khi kết thúc auction
  static Future<PaymentResponse> createAuctionPayment({
    required int winnerId,
    required int auctionId,
    required double finalAmount,
    required double depositAmount,
    required String paymentMethod,
    required String returnUrl,
    required String cancelUrl,
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

// Hàm gọi API backend để lấy approvalUrl từ orderId
  static Future<String> getApprovalUrl(String orderId) async {
    final res = await http.get(
      Uri.parse('$_paymentBaseUrl/payment/order/$orderId'),
      headers: {'Content-Type': 'application/json'},
    );

    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      if (data['approvalUrl'] != null) return data['approvalUrl'];
      throw Exception('approvalUrl not found');
    } else {
      throw Exception('Failed to get approvalUrl: ${res.statusCode} ${res.body}');
    }
  }

  // 3. Thực thi thanh toán PayPal sau khi người dùng approve
  static Future<String> executePayment(String payerId, String paymentId) async {
    final payload = {'payerId': payerId, 'paymentId': paymentId};
    final res = await http.post(
      Uri.parse('$_paymentBaseUrl/execute'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(payload),
    );
    if (res.statusCode == 200) {
      return jsonDecode(res.body)['status'];
    } else {
      throw Exception('Execute payment failed: ${res.statusCode}');
    }
  }

  // 4. Lấy payment theo ID
  static Future<PaymentResponse> getPaymentById(int id) async {
    final res = await http.get(Uri.parse('$_paymentBaseUrl/$id'));
    if (res.statusCode == 200) {
      return PaymentResponse.fromJson(jsonDecode(res.body));
    } else {
      throw Exception('Get payment by ID failed');
    }
  }

  // 5. Lấy payment theo orderId PayPal
  static Future<PaymentResponse> getPaymentByOrderId(String orderId) async {
    final res = await http.get(Uri.parse('$_paymentBaseUrl/order/$orderId'));
    if (res.statusCode == 200) {
      return PaymentResponse.fromJson(jsonDecode(res.body));
    } else {
      throw Exception('Get by orderId failed');
    }
  }

  // 6. Lấy payment theo user
  static Future<List<PaymentResponse>> getPaymentsByUserId(int userId) async {
    final res = await http.get(Uri.parse('$_paymentBaseUrl/user/$userId'));
    if (res.statusCode == 200) {
      final list = jsonDecode(res.body) as List;
      return list.map((e) => PaymentResponse.fromJson(e)).toList();
    } else {
      throw Exception('Get payments by user failed');
    }
  }

  // 7. Lấy payment theo auction
  static Future<List<PaymentResponse>> getPaymentsByAuctionId(int auctionId) async {
    final res = await http.get(Uri.parse('$_paymentBaseUrl/auction/$auctionId'));
    if (res.statusCode == 200) {
      final list = jsonDecode(res.body) as List;
      return list.map((e) => PaymentResponse.fromJson(e)).toList();
    } else {
      throw Exception('Get payments by auction failed');
    }
  }

  // 8. Cập nhật trạng thái payment
  static Future<String> updatePaymentStatus(int id, String status) async {
    final uri = Uri.parse('$_paymentBaseUrl/$id/status?status=$status');
    final res = await http.patch(uri);
    if (res.statusCode == 200) {
      return jsonDecode(res.body)['status'];
    } else {
      throw Exception('Update status failed');
    }
  }

  // 9. Kiểm tra auction đã thanh toán hay chưa
  static Future<bool> isAuctionPaid(int auctionId) async {
    final res = await http.get(Uri.parse('$_paymentBaseUrl/check/auction/$auctionId'));
    if (res.statusCode == 200) {
      return jsonDecode(res.body) as bool;
    } else {
      throw Exception('Check auction paid failed');
    }
  }

  // 10. Kiểm tra user đã nộp tiền đặt cọc hay chưa
  static Future<bool> hasUserPaidDeposit(int userId, int auctionId) async {
    final uri = Uri.parse('$_paymentBaseUrl/check/deposit?userId=$userId&auctionId=$auctionId');
    final res = await http.get(uri);
    if (res.statusCode == 200) {
      return jsonDecode(res.body) as bool;
    } else {
      throw Exception('Check deposit failed');
    }
  }

  // 11. Hủy payment chưa hoàn tất
  static Future<String> cancelPayment(int id) async {
    final res = await http.delete(Uri.parse('$_paymentBaseUrl/$id'));
    if (res.statusCode == 200) {
      return jsonDecode(res.body)['status'];
    } else {
      throw Exception('Cancel payment failed');
    }
  }

  // 12. Gửi webhook payload từ PayPal (nếu dùng webhook)
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

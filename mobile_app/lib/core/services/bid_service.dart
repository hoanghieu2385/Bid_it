import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile_app/core/services/api_service.dart';

class BidService {
  static const String bidbaseUrl = ApiService.bidBaseUrl;

  static Future<Map<String, dynamic>> placeBid({
    required int auctionId,
    required int userId,
    required int bidAmount,
    required String token,
  }) async {
    final url = Uri.parse('$bidbaseUrl/bids');
    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'auctionId': auctionId,
        'userId': userId,
        'bidAmount': bidAmount.toInt(),
      }),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      print(response);
      throw Exception('Failed to place bid: ${response.body}');
    }
  }
}

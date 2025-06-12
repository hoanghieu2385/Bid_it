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
        'bidAmount': bidAmount,
      }),
    );


    final decoded = jsonDecode(utf8.decode(response.bodyBytes));
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return decoded;
    } else {
      throw decoded;
    }
  }
  static Future<List<Map<String, dynamic>>> fetchBidHistory(int auctionId) async {
    final url = Uri.parse('$bidbaseUrl/bids/auction/$auctionId/bid');
    final response = await http.get(url);

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.cast<Map<String, dynamic>>();
    } else {
      throw Exception('Failed to load bid history');
    }
  }
}

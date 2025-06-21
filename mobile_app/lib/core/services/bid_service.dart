import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile_app/core/services/api_service.dart';
import 'package:mobile_app/core/services/user_service.dart';

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
  static Future<List<Map<String, dynamic>>> fetchAllUserBids(int userId, {required String token}) async {
    final url = Uri.parse('$bidbaseUrl/bids/user/$userId');
    final response = await http.get(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body);
      final List<dynamic> data = decoded['data'] ?? [];
      final bids = data.cast<Map<String, dynamic>>();
      bids.sort((a, b) {
        final aTime = DateTime.tryParse(a['createdAt'] ?? a['bidTime'] ?? '') ?? DateTime.fromMillisecondsSinceEpoch(0);
        final bTime = DateTime.tryParse(b['createdAt'] ?? b['bidTime'] ?? '') ?? DateTime.fromMillisecondsSinceEpoch(0);
        return bTime.compareTo(aTime);
      });
      return bids;
    } else {
      throw Exception('Failed to load user bids');
    }
  }
  Future<List<Map<String, dynamic>>> fetchDistinctUserAuctions(int userId, {required String token}) async {
    final rawBids = await fetchAllUserBids(userId, token: token);
    final Map<int, Map<String, dynamic>> auctions = {};

    for (final bid in rawBids) {
      final auctionId = bid['auctionId'];
      if (!auctions.containsKey(auctionId)) {
        auctions[auctionId] = {
          'auctionId': auctionId,
          'auctionTitle': bid['auctionTitle'],
          'lastBidAmount': bid['bidAmount'],
          'lastBidTime': bid['bidTime'],
          'isWinning': bid['isWinning'],
          'status': bid['status'],
        };
      }
    }

    return auctions.values.toList();
  }
  static Future<List<Map<String, dynamic>>> fetchAllAuctionBids(int auctionId, {required String token}) async {
    final url = Uri.parse('$bidbaseUrl//bids/auction/$auctionId/history');
    final response = await http.get(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body);
      final List<dynamic> data = decoded['data'] ?? [];
      final bids = data.cast<Map<String, dynamic>>();
      bids.sort((a, b) {
        final aTime = DateTime.tryParse(a['createdAt'] ?? a['bidTime'] ?? '') ?? DateTime.fromMillisecondsSinceEpoch(0);
        final bTime = DateTime.tryParse(b['createdAt'] ?? b['bidTime'] ?? '') ?? DateTime.fromMillisecondsSinceEpoch(0);
        return bTime.compareTo(aTime);
      });
      return bids;
    } else {
      throw Exception('Failed to load auction bids');
    }
  }

}

// File: auction_service.dart

import 'dart:convert';
import 'dart:typed_data';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/auction_model.dart';
import 'package:mobile_app/core/services/api_service.dart';
import 'package:mobile_app/core/services/user_service.dart';
import 'package:image_picker/image_picker.dart';

import '../models/auction_winner.dart';

class AuctionService {
  static const String baseAuctionUrl = ApiService.auctionBaseUrl;
  static const String categoryUrl = ApiService.categoryBaseUrl;
  static const String bidBaseUrl = ApiService.bidBaseUrl;
  static const String userBaseUrl = ApiService.userBaseUrl;

  static Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    return (token != null && token.isNotEmpty) ? token : null;
  }

  static Future<List<Map<String, dynamic>>> fetchCategories() async {
    final token = await _getToken();
    if (token == null) return [];

    final res = await http.get(
      Uri.parse(categoryUrl),
      headers: {'Authorization': 'Bearer $token'},
    );

    if (res.statusCode == 200) {
      final List data = jsonDecode(res.body);
      return data.map<Map<String, dynamic>>((e) => {
        'id': e['id'],
        'name': e['name'],
      }).toList();
    }
    return [];
  }
  static Future<void> deleteImageById(int id) async {
    final url = '$baseAuctionUrl/api/media/$id';
    final response = await http.delete(Uri.parse(url));
    if (response.statusCode != 204) {
      throw Exception("Failed to delete image");
    }
  }

  static Future<Map<String, dynamic>?> createAuction(Map<String, dynamic> data) async {
    final token = await _getToken();
    if (token == null) return null;
    final user = await UserService.getCurrentUser();
    if (user == null || user['id'] == null) return null;

    final sellerId = user['id'];
    data['sellerId'] = sellerId;
    final response = await http.post(
      Uri.parse('$baseAuctionUrl/auctions?requesterId=$sellerId'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode(data),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      return {
        'message': jsonDecode(response.body)['message'] ?? 'Failed to create auction',
        'status': 'error'
      };
    }
  }
  static Future<List<Auction>> getMyAuctionsByStatus(String status) async {
    final token = await _getToken();
    final url = Uri.parse('$baseAuctionUrl/auctions/search/status?status=$status');

    final response = await http.get(url, headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    });

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((e) => Auction.fromJson(e)).toList();
    } else {
      throw Exception('Failed to load auctions by status');
    }
  }



  static Future<Map<String, dynamic>?> uploadImage(
      Uint8List bytes,
      String fileName,
      int? auctionId,
      bool? isThumbnail,
      ) async {
    try {
      final url = Uri.parse('$baseAuctionUrl/media/upload');
      final request = http.MultipartRequest('POST', url);

      final file = http.MultipartFile(
        'file',
        http.ByteStream.fromBytes(bytes),
        bytes.length,
        filename: fileName,
        contentType: MediaType('image', 'jpeg'),
      );

      request.files.add(file);
      if (auctionId != null) request.fields['auctionId'] = auctionId.toString();
      if (isThumbnail != null) request.fields['isThumbnail'] = isThumbnail.toString();

      final token = await _getToken();
      if (token != null) {
        request.headers['Authorization'] = 'Bearer $token';
      }

      final response = await request.send();
      if (response.statusCode == 201) {
        final data = await response.stream.bytesToString();
        return jsonDecode(data);
      } else {
        print('[AuctionService] uploadImage failed: ${response.statusCode}');
        return null;
      }
    } catch (e) {
      print('[AuctionService] uploadImage error: $e');
      return null;
    }
  }

  static Future<void> uploadImagesToAuction({
    required int auctionId,
    required List<XFile> images,
    XFile? thumbnail,
  }) async {
    if (thumbnail != null) {
      final bytes = await thumbnail.readAsBytes();
      await uploadImage(bytes, thumbnail.name, auctionId, true);
    }

    for (final image in images) {
      final bytes = await image.readAsBytes();
      await uploadImage(bytes, image.name, auctionId, false);
    }
  }

  static Future<List<Auction>> fetchAuctionsByCategory(int categoryId) async {
    final url = Uri.parse('$baseAuctionUrl/auctions/search/category?categoryId=$categoryId');

    try {
      final response = await http.get(url);
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Auction.fromJson(json)).toList();
      } else {
        print('[AuctionService] fetchAuctionsByCategory failed: ${response.statusCode}');
        return [];
      }
    } catch (e) {
      print('[AuctionService] fetchAuctionsByCategory error: $e');
      return [];
    }
  }

  static Future<List<Auction>> fetchAuctions() async {
    final token = await _getToken();
    final url = Uri.parse('$baseAuctionUrl/auctions');
    final response = await http.get(url, headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    });

    if (response.statusCode == 200) {
      final List jsonList = jsonDecode(response.body);
      return jsonList.map((json) => Auction.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load auctions');
    }
  }


  static Future<List<Auction>> getMyAuctions() async {
    final token = await _getToken();
    final user = await UserService.getCurrentUser();

    if (token == null || user == null || user['id'] == null) {
      throw Exception('Missing token or user info');
    }

    final sellerId = user['id'];
    final url = Uri.parse('$baseAuctionUrl/auctions/seller/$sellerId');

    try {
      final response = await http.get(
        url,
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Auction.fromJson(json)).toList();
      } else {
        print('[AuctionService] getMyAuctions failed: ${response.statusCode}');
        return [];
      }
    } catch (e) {
      print('[AuctionService] getMyAuctions error: $e');
      return [];
    }
  }

  static Future<Auction?> getLatestMyAuction() async {
    final token = await _getToken();
    final url = Uri.parse('$baseAuctionUrl/auctions/me/latest');

    final response = await http.get(
      url,
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      return Auction.fromJson(jsonDecode(response.body));
    } else {
      print('Get latest auction failed: ${response.body}');
      return null;
    }
  }
  static Future<Auction?> fetchAuctionById(int auctionId) async {
    final token = await _getToken();
    if (token == null) {
      throw Exception('Missing token');
    }
    final url = Uri.parse('$baseAuctionUrl/auctions/$auctionId');
    final res = await http.get(
      url,
      headers: {'Authorization': 'Bearer $token'},
    );
    if (res.statusCode == 200) {
      return Auction.fromJson(jsonDecode(res.body));
    }
    return null;
  }
  static Future<List<Auction>> fetchWatchlistAuctions(List<int> ids) async {
    final futures = ids.map(fetchAuctionById);
    final auctions = await Future.wait(futures);
    return auctions.whereType<Auction>().toList();
  }
  Future<Map<String, dynamic>?> fetchWinner(int auctionId) async {
    try {
      final token = await UserService.getToken();
      if (token == null) {
        throw Exception('Missing token. Please login again.');
      }

      final response = await http.get(
        Uri.parse('$bidBaseUrl/bids/auction/$auctionId/winner'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else if (response.statusCode == 401) {
        throw Exception('Unauthorized (401): Token may be expired or invalid.');
      } else {
        throw Exception('Failed to load winner: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching winner: $e');
    }
  }
  static Future<void> deleteAuction(int auctionId, int requesterId) async {
    final token = await UserService.getToken();
    if (token == null || token.isEmpty) {
      throw Exception('Authentication token missing. Please login again.');
    }

    final uri = Uri.parse('$baseAuctionUrl/auctions/$auctionId')
        .replace(queryParameters: {'requesterId': requesterId.toString()});

    final response = await http.delete(
      uri,
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode != 200) {
      final errorMsg = response.body.isNotEmpty
          ? response.body
          : 'Failed to delete auction with ID $auctionId';
      throw Exception('Error ${response.statusCode}: $errorMsg');
    }
  }


  static Future<Auction> updateAuction({
    required int id,
    required String title,
    required String description,
    required int startingPrice,
    required int incrementAmount,
    required DateTime startTime,
    required DateTime endTime,
    required int requesterId,
    required int categoryId,
  }) async {
    final token = await UserService.getToken();
    final uri = Uri.parse('$baseAuctionUrl/auctions/$id?requesterId=$requesterId');

    final formatter = DateFormat("yyyy-MM-ddTHH:mm");
    final response = await http.put(
      uri,
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'title': title,
        'description': description,
        'startingPrice': startingPrice,
        'incrementAmount': incrementAmount,
        'startTime': formatter.format(startTime.toLocal()),
        'endTime': formatter.format(endTime.toLocal()),
        'categoryId': categoryId,
        'status': 'UPCOMING',
        'mediaUrls': [],
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return Auction.fromJson(data);
    } else {
      throw Exception('Failed to update auction: ${response.statusCode} ${response.body}');
    }
  }
  Future<Map<String, dynamic>?> fetchUser(int userId) async {
    try {
      final token = await UserService.getToken();
      print('[fetchUser] token = $token');
      if (token == null || token.isEmpty) {
        throw Exception('Missing token. Please login again.');
      }

      final response = await http.get(
        Uri.parse('$userBaseUrl/$userId'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );
      print(userId);
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to load user: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching user: $e');
    }
  }
}

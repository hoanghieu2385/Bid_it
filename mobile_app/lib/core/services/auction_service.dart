// File: auction_service.dart
// Description: Handles API calls related to auctions, including fetching categories, creating auctions,
// getting all auctions, and filtering auctions by seller ID (my auctions).

import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/auction_model.dart';
import 'package:mobile_app/core/services/api_service.dart';
import 'package:mobile_app/core/services/user_service.dart';

class AuctionService {
  static const String baseAuctionUrl = ApiService.auctionBaseUrl;
  static const String categoryUrl = ApiService.categoryBaseUrl;

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

  static Future<bool> createAuction(Map<String, dynamic> auctionData) async {
    final token = await _getToken();
    if (token == null) {
      print("Token is null");
      return false;
    }

    final user = await UserService.getCurrentUser();
    if (user == null || user['error'] == true) {
      print("Failed to retrieve user or session expired");
      return false;
    }

    final sellerId = user['id'];
    if (sellerId == null) {
      print("sellerId is null");
      return false;
    }

    auctionData['sellerId'] = sellerId;

    final url = Uri.parse('$baseAuctionUrl/auctions?requesterId=$sellerId');
    final res = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode(auctionData),
    );

    return res.statusCode == 201 || res.statusCode == 200;
  }

  static Future<List<Auction>> fetchAuctions() async {
    final url = Uri.parse('$baseAuctionUrl/auctions');

    try {
      final response = await http.get(url);
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Auction.fromJson(json)).toList();
      } else {
        print('[AuctionService] Failed with status: ${response.statusCode}');
        throw Exception('Failed to load auctions');
      }
    } catch (e) {
      print('[AuctionService] Error: $e');
      rethrow;
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
}

import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

class WatchlistService {
  static const _key = 'watchlist';

  static Future<List<int>> getWatchlist() async {
    final prefs = await SharedPreferences.getInstance();
    final list = prefs.getStringList(_key) ?? [];
    return list.map((e) => int.parse(e)).toList();
  }

  static Future<void> addToWatchlist(int auctionId) async {
    final prefs = await SharedPreferences.getInstance();
    List<String> list = prefs.getStringList(_key) ?? [];
    if (!list.contains(auctionId.toString())) {
      list.add(auctionId.toString());
      await prefs.setStringList(_key, list);
    }
  }

  static Future<void> removeFromWatchlist(int auctionId) async {
    final prefs = await SharedPreferences.getInstance();
    List<String> list = prefs.getStringList(_key) ?? [];
    list.remove(auctionId.toString());
    await prefs.setStringList(_key, list);
  }
  Future<int?> getCurrentUserId() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString('user_info');
    if (userJson == null) return null;
    final user = jsonDecode(userJson);
    return user['id'] as int?;
  }
}

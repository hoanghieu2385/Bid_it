// File: lib/core/services/category_service.dart
// Mô tả: Service để gọi API lấy danh sách category

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/category_model.dart';
import 'package:mobile_app/core/services/api_service.dart';
class CategoryService {
  static const String baseUrl = ApiService.categoryBaseUrl;

  static Future<List<Category>> fetchCategories() async {
    final response = await http.get(Uri.parse('$baseUrl'));

    if (response.statusCode == 200) {
      List<dynamic> jsonList = json.decode(response.body);
      return jsonList.map((json) => Category.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load categories');
    }
  }
}
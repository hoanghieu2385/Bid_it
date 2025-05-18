// lib/core/services/auth_service.dart
import 'dart:convert';
import 'dart:async';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  static const String authBaseUrl = 'http://10.0.2.2:8080/user-service/auth';

  static Future<Map<String, dynamic>?> login(String email, String password, {bool rememberMe = false}) async {
    final url = Uri.parse('$authBaseUrl/login');

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      ).timeout(const Duration(seconds: 20));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final prefs = await SharedPreferences.getInstance();

        if (rememberMe) {
          await prefs.setBool('remember_me', true);
          await prefs.setString('jwt_token', data['token']);
        } else {
          await prefs.setBool('remember_me', false);
          await prefs.remove('jwt_token'); // tránh lưu token khi không nhớ
        }

        return data;
      } else {
        return {
          'error': true,
          'message': jsonDecode(response.body)['message'] ?? 'Login failed.',
        };
      }
    } on TimeoutException {
      return {'error': true, 'message': 'Request timed out'};
    } catch (e) {
      return {'error': true, 'message': e.toString()};
    }
  }

  static Future<Map<String, dynamic>?> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    // required String phoneNumber,
  }) async {
    final url = Uri.parse('$authBaseUrl/register');

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'id': 0,
          'email': email,
          'password': password,
          'firstName': firstName,
          'lastName': lastName,
          // 'phoneNumber': phoneNumber,
        }),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200 || response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        final body = jsonDecode(response.body);
        return {
          'error': true,
          'message': body['message'] ?? 'Unknown registration error',
        };
      }
    } on TimeoutException {
      return {'error': true, 'message': 'Request timed out'};
    } catch (e) {
      return {'error': true, 'message': e.toString()};
    }
  }

  static Future<Map<String, dynamic>?> forgotPassword(String email) async {
    final url = Uri.parse('$authBaseUrl/forgot-password');

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email}),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final body = jsonDecode(response.body);
        return {
          'error': true,
          'message': body['message'] ?? 'Failed to send reset link.',
        };
      }
    } on TimeoutException {
      return {'error': true, 'message': 'Request timed out'};
    } catch (e) {
      return {'error': true, 'message': e.toString()};
    }
  }
}

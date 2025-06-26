import 'dart:convert';
import 'dart:async';
import 'package:flutter/cupertino.dart';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:image_picker/image_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'auth_service.dart';
import 'package:mobile_app/core/services/api_service.dart';

class UserService {
  static const String _baseUrl = ApiService.userBaseUrl;
  static const String baseUrlAuth = ApiService.authBaseUrl;

  static Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    return (token != null && token.isNotEmpty) ? token : null;
  }
  static Future<Map<String, dynamic>?> getCurrentUser() async {
    final isValid = await AuthService.isTokenValid();
    if (!isValid) {
      await logout();
      return {'error': true, 'message': 'Session expired'};
    }

    final token = await _getToken();
    if (token == null) return null;

    final url = Uri.parse('$_baseUrl/me');

    try {
      final response = await http.get(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        return jsonDecode(utf8.decode(response.bodyBytes));
      } else {
        return {
          'error': true,
          'message': jsonDecode(utf8.decode(response.bodyBytes))['message'] ?? 'Failed to get user info',
        };
      }
    } on TimeoutException {
      return {'error': true, 'message': 'Request timed out'};
    } catch (e) {
      return {'error': true, 'message': e.toString()};
    }
  }

  static Future<bool> updateUserProfile(int id, Map<String, dynamic> data) async {
    final token = await _getToken();
    if (token == null) return false;

    final url = Uri.parse('$_baseUrl/$id/profile');

    try {
      final response = await http.put(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(data),
      );

      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('jwt_token');
    await prefs.remove('jwt_expires_at');
    await prefs.remove('remember_me');
  }

  static Future<bool> changePassword(String currentPassword, String newPassword) async {
    final token = await _getToken();
    if (token == null) return false;

    final url = Uri.parse('$baseUrlAuth/change-password');

    try {
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'email': (await getCurrentUser())?['email'],
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        }),
      );

      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }
  static Future<int?> getUserIdFromToken(String token) async {
    try {
      final parts = token.split('.');
      if (parts.length != 3) return null;

      final payload = _decodeBase64(parts[1]);
      final payloadMap = json.decode(payload);

      if (payloadMap is! Map<String, dynamic>) return null;

      return payloadMap['userId'] as int?;
    } catch (e) {
      print('Error decoding token: $e');
      return null;
    }
  }

  static String _decodeBase64(String str) {
    String output = str.replaceAll('-', '+').replaceAll('_', '/');
    while (output.length % 4 != 0) {
      output += '=';
    }
    return utf8.decode(base64Url.decode(output));
  }
  static Future<Map<String, dynamic>> getSellerById(int id) async {
    final url = Uri.parse("$_baseUrl/seller/$id");
    final response = await http.get(url);
    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception("Error when load user's information: ${response.statusCode}");
    }
  }
  Future<bool> sendPhoneVerificationOtp(String phone) async {
    try {
      final token = await _getToken();
      if (token == null) return false;
      final response = await http.post(
        Uri.parse('$_baseUrl/send-phone-otp?phone=$phone'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        return true;
      } else {
        throw Exception('Failed to send OTP: ${response.body}');
      }
    } catch (e) {
      throw Exception('Error sending OTP: $e');
    }
  }

  // Verify phone OTP
  Future<bool> verifyPhoneOtp(String phone, String otp) async {
    try {
      final token = await _getToken();
      if (token == null) return false;
      final response = await http.post(
        Uri.parse('$_baseUrl/verify-phone-otp'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'phone': phone,
          'otp': otp,
        }),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        return true;
      } else {
        throw Exception('Failed to verify OTP: ${response.body}');
      }
    } catch (e) {
      throw Exception('Error verifying OTP: $e');
    }
  }
  Future<Map<String, dynamic>> updateCCCD(String citizenId, XFile frontImage, XFile backImage) async {
    try {
      final token = await _getToken();
      if (token == null || token.isEmpty) {
        debugPrint('No token found');
        return {'success': false, 'message': 'No token found'};
      }
      debugPrint('Using token: $token');

      var request = http.MultipartRequest(
        'PUT',
        Uri.parse('$_baseUrl/update-cccd'),
      );
      request.headers['Authorization'] = 'Bearer $token';
      request.fields['citizenId'] = citizenId;
      request.files.add(await http.MultipartFile.fromPath(
        'frontImage',
        frontImage.path,
        contentType: MediaType('image', 'jpeg'),
      ));
      request.files.add(await http.MultipartFile.fromPath(
        'backImage',
        backImage.path,
        contentType: MediaType('image', 'jpeg'),
      ));

      debugPrint('Sending request to: ${request.url}');
      final response = await request.send().timeout(const Duration(seconds: 10));
      final responseBody = await response.stream.bytesToString();

      debugPrint('Server Response Status: ${response.statusCode}');
      debugPrint('Raw Response Body: $responseBody');

      if (response.statusCode == 200) {
        try {
          final data = jsonDecode(responseBody) as Map<String, dynamic>;
          debugPrint('Decoded Response: $data');
          return {
            'success': true,
            'frontImage': data['citizenIdFrontImage'],
            'backImage': data['citizenIdBackImage'],
          };
        } catch (e) {
          debugPrint('JSON decode failed: $e');
          return {
            'success': true,
            'message': responseBody,
          };
        }
      } else if (response.statusCode == 401) {
        debugPrint('Unauthorized: Invalid or expired token');
        return {
          'success': false,
          'message': 'Unauthorized: Please log in again',
        };
      } else {
        debugPrint('Failed to upload CCCD: $responseBody');
        return {
          'success': false,
          'message': 'Failed to upload CCCD: $responseBody',
        };
      }
    } catch (e) {
      debugPrint('Error uploading CCCD: $e');
      return {
        'success': false,
        'message': 'Error uploading CCCD: $e',
      };
    }
  }


  // Get list of users pending CCCD verification (Admin)
  Future<List<dynamic>> getPendingVerificationRequests() async {
    try {
      final token = await _getToken();
      if (token == null) throw Exception('No token found');

      final response = await http.get(
        Uri.parse('$_baseUrl/verify-requests'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        return jsonDecode(utf8.decode(response.bodyBytes)) as List<dynamic>;
      } else {
        throw Exception('Failed to fetch pending verification requests: ${response.body}');
      }
    } catch (e) {
      throw Exception('Error fetching pending verification requests: $e');
    }
  }

  // Approve CCCD verification (Admin)
  Future<bool> approveCCCDVerification(int userId) async {
    try {
      final token = await _getToken();
      if (token == null) return false;

      final response = await http.post(
        Uri.parse('$_baseUrl/$userId/verify/approve'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        return true;
      } else {
        throw Exception('Failed to approve CCCD: ${response.body}');
      }
    } catch (e) {
      throw Exception('Error approving CCCD: $e');
    }
  }

  // Deny CCCD verification (Admin)
  Future<bool> denyCCCDVerification(int userId) async {
    try {
      final token = await _getToken();
      if (token == null) return false;

      final response = await http.post(
        Uri.parse('$_baseUrl/$userId/verify/deny'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        return true;
      } else {
        throw Exception('Failed to deny CCCD: ${response.body}');
      }
    } catch (e) {
      throw Exception('Error denying CCCD: $e');
    }
  }

  // Get verification status for a user (Admin)
  Future<Map<String, dynamic>> getUserVerificationStatus(int userId) async {
    try {
      final token = await _getToken();
      if (token == null) throw Exception('No token found');

      final response = await http.get(
        Uri.parse('$_baseUrl/$userId/verify-status'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        return jsonDecode(utf8.decode(response.bodyBytes)) as Map<String, dynamic>;
      } else {
        throw Exception('Failed to fetch user verification status: ${response.body}');
      }
    } catch (e) {
      throw Exception('Error fetching user verification status: $e');
    }
  }

  // Get current user's verification status
  Future<Map<String, dynamic>> getCurrentUserVerificationStatus() async {
    try {
      final token = await _getToken();
      if (token == null) throw Exception('No token found');

      final response = await http.get(
        Uri.parse('$_baseUrl/me/verify-status'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        return jsonDecode(utf8.decode(response.bodyBytes)) as Map<String, dynamic>;
      } else {
        throw Exception('Failed to fetch current user verification status: ${response.body}');
      }
    } catch (e) {
      throw Exception('Error fetching current user verification status: $e');
    }
  }
  static Future<Map<String, dynamic>> checkEkycStatus(int userId) async {
    try {
      final user = await getCurrentUser();
      if (user == null || user['error'] == true) {
        return {
          'isVerified': false,
          'error': true,
          'message': user?['message'] ?? 'User not found',
        };
      }

      final isVerified = user['citizenId'] != null &&
          user['citizenIdFrontImage'] != null &&
          user['citizenIdBackImage'] != null;

      return {
        'isVerified': isVerified,
        'error': false,
        'message': isVerified
            ? 'eKYC verification completed'
            : 'eKYC verification not completed',
      };
    } catch (e) {
      return {
        'isVerified': false,
        'error': true,
        'message': 'Error checking eKYC status: $e',
      };
    }
  }
  static Future<void> saveEkycStatus(bool isVerified) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('isEkycVerified', isVerified);
  }

  static Future<bool> getEkycStatus() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool('isEkycVerified') ?? false;
  }

  static Future<void> resetEkycStatus() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('isEkycVerified', false);
  }
  static Future<String?> getToken() => _getToken();
}

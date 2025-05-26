// File: edit_profile_page.dart
// Chức năng: Màn hình chỉnh sửa hồ sơ người dùng, bao gồm tên, số điện thoại, địa chỉ chi tiết,
// và chọn tỉnh, quận, phường từ API provinces.open-api.vn. Có kiểm tra lỗi và loading state.

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:mobile_app/core/services/user_service.dart';
import 'package:mobile_app/core/constants/app_colors.dart';

class EditProfilePage extends StatefulWidget {
  const EditProfilePage({super.key});

  @override
  State<EditProfilePage> createState() => _EditProfilePageState();
}

class _EditProfilePageState extends State<EditProfilePage> {
  final _formKey = GlobalKey<FormState>();
  Map<String, dynamic>? user;

  final TextEditingController firstName = TextEditingController();
  final TextEditingController lastName = TextEditingController();
  final TextEditingController phone = TextEditingController();
  final TextEditingController detail = TextEditingController();

  List<dynamic> provinces = [], districts = [], wards = [];
  String? selectedProvince, selectedDistrict, selectedWard;

  bool isLoadingDistricts = false;
  bool isLoadingWards = false;

  @override
  void initState() {
    super.initState();
    _loadUserAndProvinces();
  }

  Future<void> _loadUserAndProvinces() async {
    try {
      final res = await UserService.getCurrentUser();
      if (res == null || res['error'] == true) return;

      user = res;
      firstName.text = res['firstName'] ?? '';
      lastName.text = res['lastName'] ?? '';
      phone.text = res['phoneNumber'] ?? '';

      final address = res['address'] ?? '';
      final parts = address.split(',').map((e) => e.trim()).toList();
      if (parts.length >= 4) {
        detail.text = parts[0];
      }

      final p = await http.get(Uri.parse('https://provinces.open-api.vn/api/?depth=1'));
      if (p.statusCode == 200) {
        provinces = jsonDecode(utf8.decode(p.bodyBytes));
      }

      if (parts.length >= 4) {
        try {
          final prov = provinces.firstWhere((e) => e['name'].toString().toLowerCase() == parts[3].toLowerCase());
          selectedProvince = prov['code'].toString();
          await _loadDistricts(selectedProvince!);

          final dist = districts.firstWhere((e) => e['name'].toString().toLowerCase() == parts[2].toLowerCase());
          selectedDistrict = dist['code'].toString();
          await _loadWards(selectedDistrict!);

          final ward = wards.firstWhere((e) => e['name'].toString().toLowerCase() == parts[1].toLowerCase());
          selectedWard = ward['code'].toString();
        } catch (_) {}
      }

      setState(() {});
    } catch (e) {
      print('Error loading user or provinces: $e');
    }
  }

  Future<void> _loadDistricts(String code) async {
    setState(() => isLoadingDistricts = true);
    try {
      final res = await http.get(Uri.parse('https://provinces.open-api.vn/api/p/$code?depth=2'));
      if (res.statusCode == 200) {
        districts = jsonDecode(utf8.decode(res.bodyBytes))['districts'];
      }
    } catch (e) {
      print('Error loading districts: $e');
    } finally {
      wards = [];
      setState(() => isLoadingDistricts = false);
    }
  }

  Future<void> _loadWards(String code) async {
    setState(() => isLoadingWards = true);
    try {
      final res = await http.get(Uri.parse('https://provinces.open-api.vn/api/d/$code?depth=2'));
      if (res.statusCode == 200) {
        wards = jsonDecode(utf8.decode(res.bodyBytes))['wards'];
      }
    } catch (e) {
      print('Error loading wards: $e');
    } finally {
      setState(() => isLoadingWards = false);
    }
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    Map? prov, dist, ward;

    try {
      prov = provinces.firstWhere((e) => e['code'].toString() == selectedProvince);
    } catch (_) {}

    try {
      dist = districts.firstWhere((e) => e['code'].toString() == selectedDistrict);
    } catch (_) {}

    try {
      ward = wards.firstWhere((e) => e['code'].toString() == selectedWard);
    } catch (_) {}

    if (prov == null || dist == null || ward == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a valid address')),
      );
      return;
    }

    final fullAddress = '${detail.text}, ${ward['name']}, ${dist['name']}, ${prov['name']}';

    final success = await UserService.updateUserProfile(user!['id'], {
      'firstName': firstName.text.trim(),
      'lastName': lastName.text.trim(),
      'phoneNumber': phone.text.trim(),
      'address': fullAddress,
    });

    if (!mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(success ? 'Profile updated successfully' : 'Update failed')),
    );

    if (success) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    if (user == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(title: const Text("Edit Profile")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              _inputField("First Name", firstName),
              _inputField("Last Name", lastName),
              _inputField("Phone Number", phone),
              _dropdown("Province", selectedProvince, provinces, isLoadingDistricts, (v) async {
                setState(() {
                  selectedProvince = v;
                  selectedDistrict = null;
                  selectedWard = null;
                });
                await _loadDistricts(v!);
              }),
              _dropdown("District", selectedDistrict, districts, isLoadingWards, (v) async {
                setState(() {
                  selectedDistrict = v;
                  selectedWard = null;
                });
                await _loadWards(v!);
              }),
              _dropdown("Ward", selectedWard, wards, false, (v) {
                setState(() => selectedWard = v);
              }),
              _inputField("Detail Address", detail),
              const SizedBox(height: 16),
              ElevatedButton(onPressed: _saveProfile, child: const Text("Save")),
            ],
          ),
        ),
      ),
    );
  }

  Widget _inputField(String label, TextEditingController controller) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextFormField(
        controller: controller,
        decoration: InputDecoration(labelText: label, border: const OutlineInputBorder()),
        validator: (val) => val == null || val.isEmpty ? 'Required' : null,
      ),
    );
  }

  Widget _dropdown(String label, String? selected, List options, bool isLoading, Function(String?) onChanged) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          DropdownButtonFormField<String>(
            value: selected,
            decoration: InputDecoration(labelText: label, border: const OutlineInputBorder()),
            items: options.map((e) {
              return DropdownMenuItem<String>(
                value: e['code'].toString(),
                child: Text(e['name']),
              );
            }).toList(),
            onChanged: isLoading ? null : onChanged,
            validator: (v) => v == null || v.isEmpty ? 'Required' : null,
          ),
          if (isLoading)
            const Padding(
              padding: EdgeInsets.only(top: 4),
              child: LinearProgressIndicator(minHeight: 2),
            )
        ],
      ),
    );
  }
}

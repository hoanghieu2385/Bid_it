import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:mobile_app/core/services/user_service.dart';

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

  @override
  void initState() {
    super.initState();
    _loadUserAndProvinces();
  }

  Future<void> _loadUserAndProvinces() async {
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
    provinces = jsonDecode(p.body);
    if (parts.length >= 4) {
      final prov = provinces.firstWhere((e) => e['name'] == parts[3], orElse: () => null);
      if (prov != null) {
        selectedProvince = prov['code'].toString();
        await _loadDistricts(selectedProvince!);
        final dist = districts.firstWhere((e) => e['name'] == parts[2], orElse: () => null);
        if (dist != null) {
          selectedDistrict = dist['code'].toString();
          await _loadWards(selectedDistrict!);
          final ward = wards.firstWhere((e) => e['name'] == parts[1], orElse: () => null);
          if (ward != null) {
            selectedWard = ward['code'].toString();
          }
        }
      }
    }

    setState(() {});
  }

  Future<void> _loadDistricts(String code) async {
    final res = await http.get(Uri.parse('https://provinces.open-api.vn/api/p/$code?depth=2'));
    districts = jsonDecode(res.body)['districts'];
    wards = [];
  }

  Future<void> _loadWards(String code) async {
    final res = await http.get(Uri.parse('https://provinces.open-api.vn/api/d/$code?depth=2'));
    wards = jsonDecode(res.body)['wards'];
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    final prov = provinces.firstWhere((e) => e['code'].toString() == selectedProvince, orElse: () => null);
    final dist = districts.firstWhere((e) => e['code'].toString() == selectedDistrict, orElse: () => null);
    final ward = wards.firstWhere((e) => e['code'].toString() == selectedWard, orElse: () => null);

    final fullAddress = '${detail.text}, ${ward?['name'] ?? ''}, ${dist?['name'] ?? ''}, ${prov?['name'] ?? ''}';

    final success = await UserService.updateUserProfile(user!['id'], {
      'firstName': firstName.text,
      'lastName': lastName.text,
      'phoneNumber': phone.text,
      'address': fullAddress,
    });

    if (success) {
      if (!mounted) return;
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Profile updated successfully')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Update failed')),
      );
    }
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
              _dropdown("Province", selectedProvince, provinces, (v) async {
                setState(() {
                  selectedProvince = v;
                  selectedDistrict = null;
                  selectedWard = null;
                });
                await _loadDistricts(v!);
              }),
              _dropdown("District", selectedDistrict, districts, (v) async {
                setState(() {
                  selectedDistrict = v;
                  selectedWard = null;
                });
                await _loadWards(v!);
              }),
              _dropdown("Ward", selectedWard, wards, (v) {
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

  Widget _dropdown(String label, String? selected, List options, Function(String?) onChanged) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: DropdownButtonFormField<String>(
        value: selected,
        decoration: InputDecoration(labelText: label, border: const OutlineInputBorder()),
        items: options
            .map((e) => DropdownMenuItem<String>(
          value: e['code'].toString(),
          child: Text(e['name']),
        ))
            .toList(),
        onChanged: onChanged,
        validator: (v) => v == null || v.isEmpty ? 'Required' : null,
      ),
    );
  }
}

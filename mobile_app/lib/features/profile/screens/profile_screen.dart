import 'package:flutter/material.dart';
import 'package:mobile_app/core/constants/app_colors.dart';
import 'package:mobile_app/core/services/user_service.dart';
import 'package:mobile_app/features/home/screens/home_screen.dart';
import 'package:mobile_app/features/profile/screens/edit_profile.dart';
import 'package:mobile_app/features/profile/screens/user_screen.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  Map<String, dynamic>? _user;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  Future<void> _loadUser() async {
    final user = await UserService.getCurrentUser();
    setState(() {
      _user = user;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_user == null || _user!['error'] == true) {
      return const Scaffold(
        body: Center(
          child: Text(
            'You are not logged in.',
            style: TextStyle(fontSize: 18),
          ),
        ),
      );
    }

    final avatar = _user!['avatar'] ?? '';
    final fullName = '${_user!['firstName'] ?? ''} ${_user!['lastName'] ?? ''}';
    final email = _user!['email'] ?? 'No email';
    final phone = _user!['phoneNumber'] ?? 'No phone';
    final address = _user!['address'] ?? 'No address';
    final score = _user!['score']?.toString() ?? '0';
    final createdAt = _user!['createdAt']?.toString().split('T').first ?? 'Unknown';

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (_) => const HomePage()),
          ),
        ),
        title: const Text('User Profile'),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.black,
        elevation: 0.5,
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: ListView(
          children: [
            Center(
              child: CircleAvatar(
                radius: 50,
                backgroundImage: avatar.isNotEmpty ? NetworkImage(avatar) : null,
                backgroundColor: AppColors.grey,
                child: avatar.isEmpty
                    ? const Icon(Icons.person, size: 50, color: AppColors.white)
                    : null,
              ),
            ),
            const SizedBox(height: 24),
            _infoRow('Full Name', fullName),
            const Divider(),
            _infoRow('Email', email),
            const Divider(),
            _infoRow('Phone', phone),
            const Divider(),
            _infoRow('Address', address),
            const Divider(),
            _infoRow('Score', score),
            const Divider(),
            _infoRow('Created At', createdAt),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.orange,
                foregroundColor: Colors.white,
                minimumSize: const Size.fromHeight(45),
              ),
              icon: const Icon(Icons.edit),
              label: const Text("Edit Profile"),
              onPressed: () async {
                await Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const EditProfilePage()),
                );
                await _loadUser(); // Reload info after edit
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              '$label:',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}

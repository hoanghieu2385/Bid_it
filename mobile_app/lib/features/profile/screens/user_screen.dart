// File: user_page.dart
// Chức năng: Màn hình hồ sơ người dùng, hiển thị thông tin cá nhân và chuyển đến các màn liên quan như hồ sơ, lịch sử đấu giá, các phiên đã tham gia, đổi mật khẩu, v.v.

import 'package:flutter/material.dart';
import 'package:mobile_app/core/constants/app_colors.dart';
import 'package:mobile_app/core/services/user_service.dart';
import 'package:mobile_app/core/widgets/custom_button.dart';
import 'package:mobile_app/features/auth/screens/start_screen.dart';
import 'package:mobile_app/features/auction/screens/watchlist_screen.dart';
import 'package:mobile_app/features/auction/screens/bid_history.dart';
import 'package:mobile_app/features/auction/screens/participated_auctions.dart';
import 'package:mobile_app/features/profile/screens/profile_screen.dart';
import 'package:mobile_app/features/profile/screens/change_password.dart';
import 'package:mobile_app/features/profile/screens/my_autions_screen.dart';

class UserPage extends StatefulWidget {
  const UserPage({super.key});

  @override
  State<UserPage> createState() => _UserPageState();
}

class _UserPageState extends State<UserPage> {
  Map<String, dynamic>? _userData;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  Future<void> _loadUser() async {
    final user = await UserService.getCurrentUser();
    setState(() {
      _userData = user;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_userData == null || _userData!['error'] == true) {
      return Scaffold(
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text(
                  'You are not logged in.',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 20),
                CustomButton(
                  text: 'Return to Start Page',
                  onPressed: () {
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(builder: (_) => const StartPage()),
                    );
                  },
                  backgroundColor: Colors.orange,
                  textColor: AppColors.white,
                ),
              ],
            ),
          ),
        ),
      );
    }

    final name = '${_userData!['firstName']} ${_userData!['lastName']}';
    final email = _userData!['email'] ?? '';
    final avatar = _userData!['avatar'] ?? '';

    return Scaffold(
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 24.0, horizontal: 16.0),
            child: Column(
              children: [
                CircleAvatar(
                  radius: 50,
                  backgroundColor: AppColors.grey,
                  backgroundImage: avatar.isNotEmpty ? NetworkImage(avatar) : null,
                  child: avatar.isEmpty
                      ? const Icon(Icons.person, size: 50, color: AppColors.white)
                      : null,
                ),
                const SizedBox(height: 16.0),
                Text(
                  name,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: AppColors.black,
                  ),
                ),
                const SizedBox(height: 8.0),
                Text(
                  email,
                  style: const TextStyle(
                    fontSize: 16,
                    color: AppColors.grey,
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView(
              children: [
                _buildMenuItem(
                  context: context,
                  icon: Icons.person_outline,
                  title: 'Profile',
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const ProfilePage()),
                  ),
                ),
                _buildMenuItem(
                  context: context,
                  icon: Icons.gavel,
                  title: 'My Auctions',
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const MyAuctionsPage()),
                  ),
                ),
                _buildMenuItem(
                  context: context,
                  icon: Icons.history,
                  title: 'Bid History',
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const BidHistoryPage()),
                  ),
                ),
                _buildMenuItem(
                  context: context,
                  icon: Icons.how_to_vote,
                  title: 'Participated Auctions',
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const ParticipatedAuctionsPage()),
                  ),
                ),
                _buildMenuItem(
                  context: context,
                  icon: Icons.lock_outline,
                  title: 'Change Password',
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const ChangePasswordPage()),
                  ),
                ),
                const SizedBox(height: 16.0),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: CustomButton(
                    text: 'Logout',
                    onPressed: () async {
                      await UserService.logout();
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(builder: (_) => const StartPage()),
                      );
                    },
                    backgroundColor: Colors.orange,
                    textColor: AppColors.white,
                  ),
                ),
                const SizedBox(height: 16.0),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItem({
    required BuildContext context,
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(icon, color: Colors.orange),
      title: Text(title, style: const TextStyle(fontSize: 16)),
      trailing: const Icon(Icons.arrow_forward_ios, size: 16, color: AppColors.grey),
      onTap: onTap,
    );
  }
}

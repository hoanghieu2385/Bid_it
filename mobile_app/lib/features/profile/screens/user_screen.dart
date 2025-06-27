import 'package:flutter/material.dart';
import 'package:mobile_app/core/constants/app_colors.dart';
import 'package:mobile_app/core/services/user_service.dart';
import 'package:mobile_app/core/widgets/custom_button.dart';
import 'package:mobile_app/features/auth/screens/start_screen.dart';
import 'package:mobile_app/features/auction/screens/bid_history.dart';
import 'package:mobile_app/features/auction/screens/participated_auctions.dart';
import 'package:mobile_app/features/profile/screens/change_password.dart';
import 'package:mobile_app/features/profile/screens/ekyc_verification.dart';
import 'package:mobile_app/features/profile/screens/my_autions_screen.dart';
import 'package:mobile_app/features/profile/screens/profile_screen.dart';

class UserPage extends StatefulWidget {
  const UserPage({super.key});

  @override
  State<UserPage> createState() => _UserPageState();
}

class _UserPageState extends State<UserPage> {
  Map<String, dynamic>? _userData;
  bool _isLoading = true;
  bool _isKycVerified = false;

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  Future<void> _loadUser() async {
    try {
      final user = await UserService.getCurrentUser();
      final ekyc = await UserService().getCurrentUserVerificationStatus();
      final status = ekyc['cccdStatus']?.toString().toUpperCase() ?? '';

      if (!mounted) return;

      setState(() {
        _userData = user;
        _isKycVerified = status == 'APPROVED';
        _isLoading = false;
      });

      print('cccdStatus: $status');
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _userData = null;
        _isKycVerified = false;
        _isLoading = false;
      });
      debugPrint('Failed to load user: $e');
    }
  }



  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(
            color: Colors.orange,
          ),
        ),
      );
    }

    if (_userData == null || _userData!['error'] == true) {
      return Scaffold(
        body: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32.0, vertical: 20.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Icon(
                  Icons.person_off_outlined,
                  size: 72,
                  color: Colors.orange[400],
                ),
                const SizedBox(height: 24),
                Text(
                  'Login Required',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w600,
                    color: AppColors.black.withOpacity(0.85),
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                Text(
                  'You need to be logged in to view your profile. Please log in to continue.',
                  style: TextStyle(
                    fontSize: 15,
                    color: AppColors.grey,
                    height: 1.5,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                CustomButton(
                  text: 'Go to Login',
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
                      ? Icon(Icons.person, size: 50, color: AppColors.white)
                      : null,
                ),
                const SizedBox(height: 16.0),
                Text(
                  name,
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: AppColors.black,
                  ),
                ),
                const SizedBox(height: 8.0),
                Text(
                  email,
                  style: TextStyle(
                    fontSize: 16,
                    color: AppColors.grey,
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
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
                ListTile(
                  leading: Icon(Icons.how_to_vote_outlined, color: Colors.orange, size: 24),
                  title: Row(
                    children: [
                      Text(
                        'eKYC Verification',
                        style: TextStyle(fontSize: 16, color: AppColors.black.withOpacity(0.8)),
                      ),
                      if (!_isKycVerified)
                        Padding(
                          padding: const EdgeInsets.only(left: 6.0),
                          child: Tooltip(
                            message: 'Please verify your eKYC',
                            child: Icon(Icons.warning_amber_rounded, color: Colors.orange, size: 20),
                          ),
                        ),
                    ],
                  ),
                  trailing: Icon(Icons.arrow_forward_ios, size: 16, color: AppColors.grey.withOpacity(0.7)),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const EkycVerificationPage()),
                    ).then((_) {
                      _loadUser();
                    });
                  },
                  contentPadding: EdgeInsets.symmetric(horizontal: 20.0, vertical: 4.0),
                ),
                _buildMenuItem(
                  context: context,
                  icon: Icons.gavel_outlined,
                  title: 'My Auctions',
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const MyAuctionsPage()),
                  ),
                ),
                _buildMenuItem(
                  context: context,
                  icon: Icons.how_to_vote_outlined,
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
                const SizedBox(height: 24.0),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20.0),
                  child: CustomButton(
                    text: 'Logout',
                    onPressed: () async {
                      await UserService.logout();
                      if (mounted) {
                        Navigator.pushAndRemoveUntil(
                          context,
                          MaterialPageRoute(builder: (_) => const StartPage()),
                              (route) => false,
                        );
                      }
                    },
                    backgroundColor: Colors.orange,
                    textColor: AppColors.white,
                  ),
                ),
                const SizedBox(height: 24.0),
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
      leading: Icon(icon, color: Colors.orange, size: 24),
      title: Text(
        title,
        style: TextStyle(fontSize: 16, color: AppColors.black.withOpacity(0.8)),
      ),
      trailing: Icon(Icons.arrow_forward_ios, size: 16, color: AppColors.grey.withOpacity(0.7)),
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 4.0),
    );
  }
}
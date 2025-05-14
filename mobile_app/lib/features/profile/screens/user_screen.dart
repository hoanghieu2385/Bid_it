import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:mobile_app/core/constants/app_colors.dart';
import 'package:mobile_app/core/widgets/custom_button.dart';
import 'package:mobile_app/features/auction/screens/watchlist_screen.dart';
import 'package:mobile_app/features/auth/screens/start_screen.dart';
import 'package:mobile_app/features/profile/screens/my_autions_screen.dart';
import 'package:mobile_app/features/profile/screens/profile_screen.dart';

class UserPage extends StatelessWidget {
  const UserPage({super.key});

  @override
  Widget build(BuildContext context) {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      return Scaffold(
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text(
                  'You did not logined.',
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

    final userProfile = {
      'name': user.displayName ?? 'User',
      'email': user.email ?? 'Dont have any email',
      'avatar': user.photoURL ?? '',
    };

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
                ),
                const SizedBox(height: 16.0),
                Text(
                  userProfile['name']!,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: AppColors.black,
                  ),
                ),
                const SizedBox(height: 8.0),
                Text(
                  userProfile['email']!,
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
                  onTap: () {
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(builder: (_) => const ProfilePage()),
                    );
                  },
                ),
                _buildMenuItem(
                  context: context,
                  icon: Icons.gavel,
                  title: 'My Auctions',
                  onTap: () {
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(builder: (_) => const WatchlistPage()),
                    );
                  },
                ),
                _buildMenuItem(
                  context: context,
                  icon: Icons.history,
                  title: 'Bidding History',
                  onTap: () {
                    print('Bidding History pressed');
                  },
                ),
                _buildMenuItem(
                  context: context,
                  icon: Icons.payment,
                  title: 'Disputes & Payments',
                  onTap: () {
                    print('Disputes & Payments pressed');
                  },
                ),
                _buildMenuItem(
                  context: context,
                  icon: Icons.warning,
                  title: 'Dispute Center',
                  onTap: () {
                    print('Dispute Center pressed');
                  },
                ),
                _buildMenuItem(
                  context: context,
                  icon: Icons.settings,
                  title: 'Settings',
                  onTap: () {
                    print('Settings pressed');
                  },
                ),
                const SizedBox(height: 16.0),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: CustomButton(
                    text: 'Logout',
                    onPressed: () async {
                      await FirebaseAuth.instance.signOut();
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
      leading: Icon(icon, color: Colors.orange, size: 24),
      title: Text(
        title,
        style: const TextStyle(
          fontSize: 16,
          color: AppColors.black,
        ),
      ),
      trailing: const Icon(
        Icons.arrow_forward_ios,
        size: 16,
        color: AppColors.grey,
      ),
      onTap: onTap,
    );
  }
}

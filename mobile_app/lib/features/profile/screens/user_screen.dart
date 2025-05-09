import 'package:mobile_app/core/constants/app_colors.dart';
import 'package:mobile_app/core/widgets/custom_button.dart';
import 'package:flutter/material.dart';
import 'package:mobile_app/features/auth/screens/start_screen.dart';
import 'package:mobile_app/features/profile/screens/my_autions_screen.dart';
class UserPage extends StatelessWidget {
  const UserPage({super.key});

  @override
  Widget build(BuildContext context) {
    final Map<String, dynamic> userProfile = {
      'name': 'Tran Hung',
      'email': 'user@email.com',
      'avatar': 'https://via.placeholder.com/150',
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
                  backgroundImage: NetworkImage(userProfile['avatar']),
                  backgroundColor: AppColors.grey,
                  child: userProfile['avatar'] == null
                      ? const Icon(Icons.person, size: 50, color: AppColors.white)
                      : null,
                ),
                const SizedBox(height: 16.0),
                Text(
                  userProfile['name'],
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: AppColors.black,
                  ),
                ),
                const SizedBox(height: 8.0),
                Text(
                  userProfile['email'],
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
                    print('Profile pressed');
                  },
                ),
                _buildMenuItem(
                  context: context,
                  icon: Icons.gavel,
                  title: 'My Auctions',
                  onTap: () {
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(builder: (context) => const MyAuctionList()),
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
                    onPressed: () {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(builder: (context) => const StartPage()),
                      );
                      print('Logouted');
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
      leading: Icon(
        icon,
        color: Colors.orange,
        size: 24,
      ),
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
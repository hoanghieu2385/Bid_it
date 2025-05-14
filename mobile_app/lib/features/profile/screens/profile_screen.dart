import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:mobile_app/core/constants/app_colors.dart';
import 'package:mobile_app/features/home/screens/home_screen.dart';
import 'package:mobile_app/features/profile/screens/user_screen.dart';

import 'edit_profile.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    final user = FirebaseAuth.instance.currentUser;

    if (user == null) {
      return const Scaffold(
        body: Center(
          child: Text(
            'You are not logged in.',
            style: TextStyle(fontSize: 18),
          ),
        ),
      );
    }

    final userProfile = {
      'name': user.displayName ?? 'No display name',
      'email': user.email ?? 'No email',
      'uid': user.uid,
      'creationTime': user.metadata.creationTime?.toString().split(' ').first ?? 'Unknown',
      'lastSignInTime': user.metadata.lastSignInTime?.toString().split(' ').first ?? 'Unknown',
      'avatar': user.photoURL ?? '',
    };

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (_) => const HomePage()),
            );
          },
        ),
        title: const Text('User Profile'),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.black,
        elevation: 0.5,
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: CircleAvatar(
                radius: 50,
                backgroundImage: userProfile['avatar']!.isNotEmpty
                    ? NetworkImage(userProfile['avatar']!)
                    : null,
                backgroundColor: AppColors.grey,
                child: userProfile['avatar']!.isEmpty
                    ? const Icon(Icons.person, size: 50, color: AppColors.white)
                    : null,
              ),
            ),
            const SizedBox(height: 24),
            _infoRow('Name', userProfile['name']!),
            const Divider(),
            _infoRow('Email', userProfile['email']!),
            const Divider(),
            _infoRow('Created On', userProfile['creationTime']!),
            const Divider(),
            _infoRow('Last Sign-In', userProfile['lastSignInTime']!),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.orange,
                foregroundColor: Colors.white,
                minimumSize: const Size.fromHeight(45),
              ),
              icon: const Icon(Icons.edit),
              label: const Text("Edit Profile"),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const EditProfilePage()),
                );
              },
            ),
            const SizedBox(height: 12),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.grey.shade800,
                foregroundColor: Colors.white,
                minimumSize: const Size.fromHeight(45),
              ),
              icon: const Icon(Icons.lock_reset),
              label: const Text("Change Password"),
              onPressed: () async {
                try {
                  await FirebaseAuth.instance.sendPasswordResetEmail(email: user.email!);
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Password reset email sent.')),
                    );
                  }
                } catch (e) {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Error: $e')),
                    );
                  }
                }
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

// File: lib/core/widgets/custom_app_bar.dart
// Chức năng: AppBar tùy chỉnh dùng lại trong nhiều màn hình

import 'package:flutter/material.dart';
import 'package:mobile_app/core/constants/app_colors.dart';

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final List<Widget>? actions;
  final bool showMenu;

  const CustomAppBar({
    super.key,
    required this.title,
    this.actions,
    this.showMenu = true,
  });

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: AppColors.white,
      elevation: 0.5,
      leading: showMenu
          ? IconButton(
        icon: const Icon(Icons.menu, color: AppColors.black),
        onPressed: () => Scaffold.of(context).openDrawer(),
      )
          : null,
      title: Text(
        title,
        style: const TextStyle(
          color: AppColors.black,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
      actions: actions,
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}

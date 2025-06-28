import 'package:flutter/material.dart';
import 'bootstrap_icon_map.dart';

class BootstrapIconResolver {
  static IconData resolve(String? iconName) {
    if (iconName == null || iconName.isEmpty) return Icons.category;
    final key = iconName.toLowerCase().trim();
    return bootstrapIconsMap[key] ?? Icons.category;
  }
}

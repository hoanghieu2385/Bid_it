// File: lib/core/models/category_model.dart
// Mô tả: Định nghĩa model Category dùng để ánh xạ dữ liệu từ API

class Category {
  final int id;
  final String name;

  Category({required this.id, required this.name});

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'],
      name: json['name'],
    );
  }
}
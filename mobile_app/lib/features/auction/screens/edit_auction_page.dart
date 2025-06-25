import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:mobile_app/core/constants/app_colors.dart';
import 'package:mobile_app/core/models/auction_model.dart';
import 'package:mobile_app/core/models/category_model.dart';
import 'package:mobile_app/core/services/auction_service.dart';
import 'package:mobile_app/core/services/user_service.dart';

class UpdateAuctionPage extends StatefulWidget {
  final Auction auction;
  const UpdateAuctionPage({super.key, required this.auction});
  @override
  State<UpdateAuctionPage> createState() => _UpdateAuctionPageState();
}

class _UpdateAuctionPageState extends State<UpdateAuctionPage> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _startingPriceController = TextEditingController();
  final _incrementAmountController = TextEditingController();
  final ImagePicker _picker = ImagePicker();

  List<XFile> _galleryImages = [];
  List<String> _existingImageUrls = [];
  bool _isUploading = false;
  List<Category> _categories = [];
  Category? _selectedCategory;
  bool _isLoadingCategories = true;
  bool _checkingLogin = true;
  bool _isLoggedIn = false;

  DateTime? _startTime;
  DateTime? _endTime;

  final _dateFormatter = DateFormat("yyyy-MM-ddTHH:mm");
  String formatDate(DateTime dt) => _dateFormatter.format(dt);

  @override
  void initState() {
    super.initState();
    _initAuctionData();
    _checkLoginStatus();
  }

  void _initAuctionData() {
    _titleController.text = widget.auction.title ?? '';
    _descriptionController.text = widget.auction.description ?? '';
    _startingPriceController.text = widget.auction.startingPrice.toString();
    _incrementAmountController.text = widget.auction.incrementAmount.toString();
    _startTime = widget.auction.startTime;
    _endTime = widget.auction.endTime;
    _existingImageUrls = widget.auction.mediaUrls;
  }

  Future<void> _checkLoginStatus() async {
    final user = await UserService.getCurrentUser();
    if (user != null && user['id'] != null) {
      setState(() {
        _isLoggedIn = true;
        _checkingLogin = false;
      });
      _loadCategories();
    } else {
      setState(() {
        _isLoggedIn = false;
        _checkingLogin = false;
      });
      _showCustomSnackBar('Please login to update auction.', Icons.error, Colors.red);
      Navigator.pop(context);
    }
  }

  Future<void> _loadCategories() async {
    try {
      final categoriesData = await AuctionService.fetchCategories();
      final parsed = categoriesData.map((e) => Category(id: e['id'], name: e['name'])).toList();
      setState(() {
        _categories = parsed;
        _selectedCategory = _categories.firstWhere(
              (c) => c.id == widget.auction.categoryId,
          orElse: () => _categories.isNotEmpty ? _categories[0] : (throw Exception('No categories')),
        ) ?? _categories[0];
        _isLoadingCategories = false;
      });
    } catch (_) {
      setState(() => _isLoadingCategories = false);
    }
  }

  Future<bool> _checkPhotoPermission() async {
    if (!_isLoggedIn) return false;
    if (Platform.isAndroid) {
      final androidInfo = await DeviceInfoPlugin().androidInfo;
      final sdkInt = androidInfo.version.sdkInt;
      final permission = sdkInt >= 33 ? Permission.photos : Permission.storage;
      final status = await permission.request();
      if (!status.isGranted) {
        _showCustomSnackBar('Photo permission denied.', Icons.warning, Colors.orange);
        return false;
      }
      return true;
    } else {
      final status = await Permission.photos.request();
      if (!status.isGranted) {
        _showCustomSnackBar('Photo permission denied.', Icons.warning, Colors.orange);
        return false;
      }
      return true;
    }
  }

  Future<void> _pickGalleryImages() async {
    final granted = await _checkPhotoPermission();
    if (!granted) return;
    final selected = await _picker.pickMultiImage();
    if (selected.isNotEmpty) {
      setState(() => _galleryImages.addAll(selected));
    } else {
      _showCustomSnackBar('No images selected.', Icons.info, Colors.blue);
    }
  }

  Future<void> _selectDate(BuildContext context, bool isStart) async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: isStart ? _startTime ?? now : _endTime ?? now,
      firstDate: now,
      lastDate: now.add(const Duration(days: 365)),
    );
    if (picked != null) {
      final time = await showTimePicker(
        context: context,
        initialTime: TimeOfDay.fromDateTime(isStart ? _startTime ?? now : _endTime ?? now),
      );
      if (time != null) {
        final fullDate = DateTime(picked.year, picked.month, picked.day, time.hour, time.minute);
        setState(() {
          if (isStart) {
            _startTime = fullDate;
            if (_endTime!.isBefore(fullDate)) {
              _endTime = fullDate.add(const Duration(hours: 1, minutes: 30));
            }
          } else {
            _endTime = fullDate;
          }
        });
      }
    }
  }

  Future<bool> _confirmDeleteImage(String url) async {
    return await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirm Delete'),
        content: const Text('Are you sure you want to remove this image?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Delete'),
          ),
        ],
      ),
    ) ?? false;
  }

  Future<bool> _confirmDeleteNewImage(int index) async {
    return await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirm Delete'),
        content: const Text('Are you sure you want to remove this image?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Delete'),
          ),
        ],
      ),
    ) ?? false;
  }

  Widget _buildSuggestions(String value, TextEditingController controller) {
    if (value.isEmpty) return const SizedBox.shrink();
    final raw = int.tryParse(value);
    if (raw == null || raw <= 0) return const SizedBox.shrink();
    final suggestions = ['0', '00', '000'].map((s) => raw.toString() + s).toList();
    return Wrap(
      spacing: 8,
      children: suggestions.map((s) {
        final formatted = NumberFormat('#,###', 'vi_VN').format(int.parse(s));
        return GestureDetector(
          onTap: () => setState(() => controller.text = s),
          child: Chip(
            label: Text('$formatted \$'),
            backgroundColor: Colors.grey.shade200,
          ),
        );
      }).toList(),
    );
  }

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) return;

    final now = DateTime.now();

    // Validate datetime fields
    if (_startTime == null || _endTime == null) {
      _showCustomSnackBar('Please select both start and end time.', Icons.error, Colors.red);
      return;
    }

    if (_startTime!.isBefore(now)) {
      _showCustomSnackBar('Start time cannot be in the past.', Icons.error, Colors.red);
      return;
    }

    if (_endTime!.isBefore(_startTime!)) {
      _showCustomSnackBar('End time must be after start time.', Icons.error, Colors.red);
      return;
    }

    if (_endTime!.difference(_startTime!).inMinutes < 60) {
      _showCustomSnackBar('Auction must last at least 60 minutes.', Icons.error, Colors.red);
      return;
    }

    // Validate pricing fields
    final startingPrice = double.tryParse(_startingPriceController.text);
    final incrementAmount = double.tryParse(_incrementAmountController.text);

    if (startingPrice == null || startingPrice <= 0) {
      _showCustomSnackBar('Starting price must be a positive number.', Icons.error, Colors.red);
      return;
    }

    if (incrementAmount == null || incrementAmount <= 0) {
      _showCustomSnackBar('Increment amount must be a positive number.', Icons.error, Colors.red);
      return;
    }

    // Validate text lengths
    if (_titleController.text.trim().length < 6) {
      _showCustomSnackBar('Title must be at least 6 characters.', Icons.error, Colors.red);
      return;
    }

    if (_descriptionController.text.trim().length < 10) {
      _showCustomSnackBar('Description must be at least 10 characters.', Icons.error, Colors.red);
      return;
    }

    // Validate images
    if (_existingImageUrls.isEmpty && _galleryImages.isEmpty) {
      _showCustomSnackBar('Please upload at least one image.', Icons.error, Colors.red);
      return;
    }

    final user = await UserService.getCurrentUser();
    if (user == null || user['id'] == null) {
      _showCustomSnackBar('You must be logged in to update auction.', Icons.error, Colors.red);
      return;
    }

    setState(() => _isUploading = true);
    try {
      final rawTitle = _titleController.text.trim();
      final rawDescription = _descriptionController.text.trim();

      final updatedAuction = await AuctionService.updateAuction(
        id: widget.auction.id,
        title: rawTitle,
        description: rawDescription,
        startingPrice: startingPrice.toInt(),
        incrementAmount: incrementAmount.toInt(),
        startTime: _dateFormatter.parse(_dateFormatter.format(_startTime!.toLocal())),
        endTime: _dateFormatter.parse(_dateFormatter.format(_endTime!.toLocal())),
        requesterId: user['id'],
        categoryId: _selectedCategory!.id,
      );

      if (_galleryImages.isNotEmpty) {
        await AuctionService.uploadImagesToAuction(
          auctionId: updatedAuction.id,
          images: _galleryImages,
          thumbnail: null,
        );
      }

      _showCustomSnackBar('Auction updated successfully!', Icons.check_circle, Colors.green);
      Navigator.pop(context, true);
    } catch (e) {
      _showCustomSnackBar('Failed to update auction: $e', Icons.error, Colors.red);
    } finally {
      setState(() => _isUploading = false);
    }
  }

  void _showCustomSnackBar(String message, IconData icon, Color color) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(icon, color: Colors.white, size: 24),
            const SizedBox(width: 12),
            Expanded(child: Text(message, style: const TextStyle(color: Colors.white, fontSize: 16))),
          ],
        ),
        backgroundColor: color,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        duration: const Duration(seconds: 3),
        margin: const EdgeInsets.all(16),
        elevation: 6,
      ),
    );
  }

  InputDecoration _inputDecoration(String label) {
    return InputDecoration(
      labelText: label,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8.0)),
    );
  }

  Widget _buildTextField(TextEditingController controller, String label,
      {int maxLines = 1, TextInputType keyboardType = TextInputType.text}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextFormField(
          controller: controller,
          decoration: _inputDecoration(label),
          keyboardType: keyboardType,
          maxLines: maxLines,
          enabled: _isLoggedIn,
          validator: (value) {
            if (!_isLoggedIn) return null;
            if (value == null || value.isEmpty) return 'Please enter ${label.toLowerCase()}';
            if ((label.contains('Price') || label.contains('Amount')) &&
                (double.tryParse(value) == null || double.parse(value) <= 0)) {
              return 'Please enter a valid ${label.toLowerCase()}';
            }
            return null;
          },
          onChanged: (_) => setState(() {}),
        ),
        if ((label.contains('Price') || label.contains('Amount')) && _isLoggedIn)
          _buildSuggestions(controller.text, controller),
      ],
    );
  }

  Widget _buildImagePicker() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("Upload Images", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        GestureDetector(
          onTap: _isLoggedIn ? _pickGalleryImages : null,
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 14),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.orange, width: 2),
              borderRadius: BorderRadius.circular(8),
              color: Colors.orange.withOpacity(0.1),
            ),
            child: Row(
              children: [
                const Icon(Icons.file_upload, color: Colors.orange, size: 28),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    _galleryImages.isEmpty
                        ? "Choose Files"
                        : "${_galleryImages.length} file${_galleryImages.length > 1 ? 's' : ''}",
                    style: const TextStyle(fontSize: 18, color: Colors.orange),
                  ),
                ),
              ],
            ),
          ),
        ),
        if (_existingImageUrls.isNotEmpty || _galleryImages.isNotEmpty) ...[
          const SizedBox(height: 10),
          SizedBox(
            height: 120,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _existingImageUrls.length + _galleryImages.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, index) {
                if (index < _existingImageUrls.length) {
                  final url = _existingImageUrls[index];
                  return Stack(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(14),
                        child: Image.network(
                          url,
                          width: 110,
                          height: 110,
                          fit: BoxFit.cover,
                        ),
                      ),
                      Positioned(
                        top: 4,
                        right: 4,
                        child: GestureDetector(
                          onTap: () async {
                            final confirm = await _confirmDeleteImage(url);
                            if (confirm) {
                              setState(() => _existingImageUrls.remove(url));
                              // Gọi API để xóa hình ảnh nếu cần ID media
                              // Hiện tại model không cung cấp ID, cần thêm logic nếu có
                            }
                          },
                          child: Container(
                            decoration: const BoxDecoration(
                              color: Colors.black54,
                              shape: BoxShape.circle,
                            ),
                            padding: const EdgeInsets.all(4),
                            child: const Icon(Icons.close, color: Colors.white, size: 18),
                          ),
                        ),
                      ),
                    ],
                  );
                } else {
                  final img = _galleryImages[index - _existingImageUrls.length];
                  return Stack(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(14),
                        child: Image.file(
                          File(img.path),
                          width: 110,
                          height: 110,
                          fit: BoxFit.cover,
                        ),
                      ),
                      Positioned(
                        top: 4,
                        right: 4,
                        child: GestureDetector(
                          onTap: () async {
                            final confirm = await _confirmDeleteNewImage(index - _existingImageUrls.length);
                            if (confirm) {
                              setState(() => _galleryImages.removeAt(index - _existingImageUrls.length));
                            }
                          },
                          child: Container(
                            decoration: const BoxDecoration(
                              color: Colors.black54,
                              shape: BoxShape.circle,
                            ),
                            padding: const EdgeInsets.all(4),
                            child: const Icon(Icons.close, color: Colors.white, size: 18),
                          ),
                        ),
                      ),
                    ],
                  );
                }
              },
            ),
          ),
        ],
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_checkingLogin || _isLoadingCategories) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }
    return Scaffold(
      appBar: AppBar(
        title: const Text('Update Auction'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0.5,
      ),
      backgroundColor: const Color(0xFFF9F9F9),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("Auction Information", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              _buildTextField(_titleController, 'Title'),
              const SizedBox(height: 12),
              _buildTextField(_descriptionController, 'Description', maxLines: 3),
              const SizedBox(height: 12),
              DropdownButtonFormField<Category>(
                decoration: _inputDecoration('Category'),
                value: _selectedCategory,
                borderRadius: BorderRadius.circular(8),
                icon: const Icon(Icons.keyboard_arrow_down_rounded),
                items: _categories.map((category) => DropdownMenuItem<Category>(
                  value: category,
                  child: Text(category.name),
                )).toList(),
                onChanged: _isLoggedIn ? (value) => setState(() => _selectedCategory = value) : null,
                validator: (value) => !_isLoggedIn ? null : value == null ? 'Please select a category' : null,
                disabledHint: const Text('Please login'),
              ),
              const SizedBox(height: 24),
              const Text("Pricing", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              _buildTextField(_startingPriceController, 'Starting Price (\$)', keyboardType: TextInputType.number),
              const SizedBox(height: 12),
              _buildTextField(_incrementAmountController, 'Increment Amount (\$)', keyboardType: TextInputType.number),
              const SizedBox(height: 24),
              const Text("Auction Schedule", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: _isLoggedIn ? () => _selectDate(context, true) : null,
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          border: Border.all(color: Colors.grey.shade300),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          _startTime != null
                              ? DateFormat('dd/MM/yyyy HH:mm').format(_startTime!)
                              : 'Select Start Time',
                          style: TextStyle(
                            fontSize: 15,
                            color: _isLoggedIn ? Colors.black : Colors.grey,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: GestureDetector(
                      onTap: _isLoggedIn ? () => _selectDate(context, false) : null,
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          border: Border.all(color: Colors.grey.shade300),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          _endTime != null
                              ? DateFormat('dd/MM/yyyy HH:mm').format(_endTime!)
                              : 'Select End Time',
                          style: TextStyle(
                            fontSize: 15,
                            color: _isLoggedIn ? Colors.black : Colors.grey,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              _buildImagePicker(),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _isUploading ? null : _submitForm,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.orange,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 4,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  child: Text(
                    _isUploading ? 'Updating...' : 'Update Auction',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
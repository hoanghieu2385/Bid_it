import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:mobile_app/core/constants/app_colors.dart';
import 'package:mobile_app/core/models/category_model.dart';
import 'package:mobile_app/core/services/auction_service.dart';
import 'package:mobile_app/core/services/user_service.dart';

class CreateAuctionPage extends StatefulWidget {
  const CreateAuctionPage({super.key});
  @override
  State<CreateAuctionPage> createState() => _CreateAuctionPageState();
}

class _CreateAuctionPageState extends State<CreateAuctionPage> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _startingPriceController = TextEditingController();
  final _incrementAmountController = TextEditingController();
  final _depositAmountController = TextEditingController();
  final ImagePicker _picker = ImagePicker();

  List<XFile> _galleryImages = [];
  bool _isUploading = false;
  List<Category> _categories = [];
  Category? _selectedCategory;
  bool _isLoadingCategories = true;
  bool _checkingLogin = true;
  bool _isLoggedIn = false;

  DateTime? _startTime;
  DateTime? _endTime;
  bool _requiresDeposit = false;

  bool _isEkycVerified = false;

  final _dateFormatter = DateFormat("yyyy-MM-ddTHH:mm");
  String formatDate(DateTime dt) => _dateFormatter.format(dt);

  Timer? _statusCheckTimer;

  int? _userScore;


  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _startTime = now.add(const Duration(hours: 1));
    _endTime = _startTime!.add(const Duration(hours: 1, minutes: 30));
    _checkLoginStatus();
    _startStatusPolling();
  }

  void _startStatusPolling() {
    _statusCheckTimer?.cancel();
    _statusCheckTimer = Timer.periodic(const Duration(seconds: 10), (_) async {
      final oldVerifiedStatus = _isEkycVerified;
      await _checkLoginStatus();
      if (oldVerifiedStatus && !_isEkycVerified) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Your eKYC status has changed. Please verify again.'),
            backgroundColor: Colors.red,
            duration: Duration(seconds: 3),
          ),
        );
      }
    });
  }

  Future<void> _checkLoginStatus() async {
    final user = await UserService.getCurrentUser();
    final score = user?['score'] ?? 0;

    if (user != null && user['id'] != null) {
      try {
        final ekycStatus = await UserService().getCurrentUserVerificationStatus();
        final isVerified = ekycStatus['cccdStatus']?.toUpperCase() == 'APPROVED';
        print('eKYC Status response: $ekycStatus');
        print('cccdStatus upper: ${ekycStatus['cccdStatus']?.toUpperCase()}');
        setState(() {
          _isLoggedIn = true;
          _isEkycVerified = isVerified;
          _userScore = score;
          print(_userScore);
          _checkingLogin = false;
        });
        _loadCategories();
      } catch (e) {
        setState(() {
          _isLoggedIn = true;
          _isEkycVerified = false;
          _checkingLogin = false;
        });
        _loadCategories();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to check eKYC status.')),
        );
      }
    } else {
      setState(() {
        _isLoggedIn = false;
        _checkingLogin = false;
        _isEkycVerified = false;
      });
      _loadCategories();
    }
  }

  Future<void> _loadCategories() async {
    try {
      final categoriesData = await AuctionService.fetchCategories();
      final parsed = categoriesData.map((e) => Category(id: e['id'], name: e['name'])).toList();
      setState(() {
        _categories = parsed;
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
      return sdkInt >= 33
          ? await Permission.photos.request().isGranted
          : await Permission.storage.request().isGranted;
    } else {
      return await Permission.photos.request().isGranted;
    }
  }

  Future<void> _pickGalleryImages() async {
    if (!_isLoggedIn) return;
    final granted = await _checkPhotoPermission();
    if (!granted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Photo permission denied.')),
      );
      return;
    }
    final selected = await _picker.pickMultiImage();
    if (selected.isNotEmpty) {
      setState(() => _galleryImages = selected);
    }
  }

  Future<void> _selectDate(BuildContext context, bool isStart) async {
    if (!_isLoggedIn) return;
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: now,
      firstDate: now,
      lastDate: now.add(const Duration(days: 365)),
    );
    if (picked != null) {
      final time = await showTimePicker(
        context: context,
        initialTime: TimeOfDay.fromDateTime(now),
      );
      if (time != null) {
        final fullDate = DateTime(picked.year, picked.month, picked.day, time.hour, time.minute);
        setState(() {
          if (isStart) {
            _startTime = fullDate;
            _endTime = fullDate.add(const Duration(hours: 1, minutes: 30));
          } else {
            _endTime = fullDate;
          }
        });
      }
    }
  }

  Future<bool> _confirmDelete() async {
    if (!_isLoggedIn) return false;
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
    if (!_isEkycVerified) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please complete eKYC verification before creating an auction.')),
      );
      return;
    }
    if (_userScore! < 70) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Your reputation score must be at least 70 to create an auction.')),
      );
      return;
    }
    if (!_isLoggedIn) return;
    if (!_formKey.currentState!.validate()) return;
    final now = DateTime.now();

    if (_startTime == null || _endTime == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select start and end time.')),
      );
      return;
    }
    if (_startTime!.isBefore(now)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Start time cannot be in the past.')),
      );
      return;
    }
    if (_endTime!.isBefore(_startTime!)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('End time must be after start time.')),
      );
      return;
    }
    if (_galleryImages.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select at least one image.')),
      );
      return;
    }
    if (_titleController.text.trim().length < 5) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Title must be at least 5 characters long.')),
      );
      return;
    }
    if (_descriptionController.text.trim().length < 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Description must be at least 10 characters long.')),
      );
      return;
    }
    bool _isEndTimeTooSoon() {
      if (_startTime == null || _endTime == null) return false;
      return _endTime!.difference(_startTime!) < const Duration(minutes: 60);
    }
    if (_isEndTimeTooSoon()) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('End time must be at least 60 minutes after start time.')),
      );
      return;
    }

    final startingPrice = double.tryParse(_startingPriceController.text);
    final incrementAmount = double.tryParse(_incrementAmountController.text);
    if (startingPrice == null || incrementAmount == null || _selectedCategory == null) return;
    if (_requiresDeposit) {
      final deposit = double.tryParse(_depositAmountController.text);
      if (deposit == null || deposit <= 0) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please enter a valid deposit amount.')),
        );
        return;
      }
    }
    final user = await UserService.getCurrentUser();
    if (user == null || user['id'] == null) {
      setState(() {
        _isLoggedIn = false;
        _isEkycVerified = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please log in to create an auction.')),
      );
      return;
    }
    final auctionData = {
      "title": _titleController.text.trim(),
      "description": _descriptionController.text.trim(),
      "categoryId": _selectedCategory!.id,
      "startTime": formatDate(_startTime!),
      "endTime": formatDate(_endTime!),
      "startingPrice": startingPrice,
      "incrementAmount": incrementAmount,
      "requiresDeposit": _requiresDeposit,
      "securityDeposit": _requiresDeposit
          ? double.tryParse(_depositAmountController.text) ?? 0
          : 0,
      "status": "UPCOMING",
      "bidCount": 0,
    };
    setState(() => _isUploading = true);
    final response = await AuctionService.createAuction(auctionData);

    if (response == null || response['success'] == false) {
      setState(() => _isUploading = false);
      final errorMsg = response?['message'] ?? '';
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(errorMsg)));
      return;
    }

    final auction = response;
    for (final image in _galleryImages) {
      final bytes = await image.readAsBytes();
      await AuctionService.uploadImage(bytes, image.name, auction?['id'], false);
    }

    _formKey.currentState?.reset();
    _titleController.clear();
    _descriptionController.clear();
    _startingPriceController.clear();
    _incrementAmountController.clear();
    _depositAmountController.clear();

    setState(() {
      _isUploading = false;
      _selectedCategory = null;
      _galleryImages = [];
      _requiresDeposit = false;
      final now = DateTime.now();
      _startTime = now.add(const Duration(hours: 1));
      _endTime = _startTime!.add(const Duration(hours: 1, minutes: 30));
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(response?["message"] ?? 'Auction created successfully.')),
    );
  }

  @override
  void dispose() {
    _statusCheckTimer?.cancel();
    super.dispose();
  }

  InputDecoration _inputDecoration(String label) {
    return InputDecoration(
      labelText: label,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8.0)),
    );
  }

  Widget _buildTextField(
      TextEditingController controller,
      String label, {
        int maxLines = 1,
        TextInputType keyboardType = TextInputType.text,
        required bool disabled,
      }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextFormField(
          controller: controller,
          decoration: _inputDecoration(label),
          keyboardType: keyboardType,
          maxLines: maxLines,
          enabled: !disabled,
          validator: (value) {
            if (disabled) return null;
            if (value == null || value.isEmpty) {
              return 'Please enter ${label.toLowerCase()}';
            }
            if ((label.contains('Price') || label.contains('Amount')) &&
                (double.tryParse(value) == null || double.parse(value) <= 0)) {
              return 'Please enter a valid ${label.toLowerCase()}';
            }
            return null;
          },
          onChanged: (_) => setState(() {}),
        ),
        if ((label.contains('Price') || label.contains('Amount')) && !disabled)
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
        if (_galleryImages.isNotEmpty) ...[
          const SizedBox(height: 10),
          SizedBox(
            height: 120,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _galleryImages.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, index) {
                final img = _galleryImages[index];
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
                    if (_isLoggedIn)
                      Positioned(
                        top: 4,
                        right: 4,
                        child: GestureDetector(
                          onTap: () async {
                            final confirm = await _confirmDelete();
                            if (confirm) setState(() => _galleryImages.removeAt(index));
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

    final bool _disabled = !_isLoggedIn || !_isEkycVerified || (_userScore != null && _userScore! < 70);

    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: const Text('Create Auction'),
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
              _buildTextField(_titleController, 'Title', disabled: _disabled),
              const SizedBox(height: 12),
              _buildTextField(_descriptionController, 'Description', maxLines: 3, disabled: _disabled),
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
                onChanged: !_disabled ? (value) => setState(() => _selectedCategory = value) : null,
                validator: (value) => _disabled ? null : value == null ? 'Please select a category' : null,
                disabledHint: Text(
                  !_isLoggedIn
                      ? 'Please login'
                      : !_isEkycVerified
                      ? 'Please complete eKYC verification'
                      : (_userScore != null && _userScore! < 70)
                      ? 'Your reputation score is too low'
                      : '',
                ),

              ),
              const SizedBox(height: 24),
              const Text("Pricing", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              _buildTextField(_startingPriceController, 'Starting Price (\$)', keyboardType: TextInputType.number, disabled: _disabled),
              const SizedBox(height: 12),
              _buildTextField(_incrementAmountController, 'Increment Amount (\$)', keyboardType: TextInputType.number, disabled: _disabled),
              SwitchListTile(
                value: _requiresDeposit,
                onChanged: !_disabled ? (val) {
                  setState(() => _requiresDeposit = val);
                  if (!val) _depositAmountController.clear();
                } : null,

                title: const Text('Requires Deposit?', style: TextStyle(fontWeight: FontWeight.w500)),
                activeColor: Colors.orange,
                contentPadding: EdgeInsets.zero,
              ),
              if (_requiresDeposit) ...[
                const SizedBox(height: 8),
                _buildTextField(_depositAmountController, 'Deposit Amount (\$)', keyboardType: TextInputType.number, disabled: _disabled),
              ],
              const SizedBox(height: 24),
              const Text("Auction Schedule", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              Row(
                children: [
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
              if (_isLoggedIn && _isEkycVerified && (_userScore != null && _userScore! >= 70))
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
                      _isUploading ? 'Creating...' : 'Create Auction',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              if (_disabled)
                Container(
                  margin: const EdgeInsets.only(top: 12),
                  padding: const EdgeInsets.symmetric(vertical: 18),
                  width: double.infinity,
                  child: Text(
                    !_isLoggedIn
                        ? 'Please login to create an auction'
                        : !_isEkycVerified
                        ? 'Please complete eKYC verification to create an auction'
                        : (_userScore != null && _userScore! < 70)
                        ? 'Your reputation score is too low to create an auction'
                        : '',
                    style: const TextStyle(
                      color: Colors.orange,
                      fontWeight: FontWeight.bold,
                      fontSize: 17,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

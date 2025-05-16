import 'package:firebase_core/firebase_core.dart';
import 'package:mobile_app/features/auth/screens/start_screen.dart';
import 'package:flutter/material.dart';
import 'package:mobile_app/features/home/screens/home_screen.dart';
import 'package:mobile_app/features/auction/screens/auction_detail.dart';
import 'package:mobile_app/features/profile/screens/my_autions_screen.dart';
import 'firebase_options.dart';

void main() async{
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(const AuctionHubApp());
}

class AuctionHubApp extends StatelessWidget {
  const AuctionHubApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'AuctionHub',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        scaffoldBackgroundColor: Colors.white,
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          elevation: 0,
          titleTextStyle: TextStyle(
            color: Colors.black,
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
          iconTheme: IconThemeData(color: Colors.black),
        ),
        textTheme: const TextTheme(
          bodyMedium: TextStyle(color: Colors.black),
        ),
      ),
      home: const StartPage(),
    );
  }
}
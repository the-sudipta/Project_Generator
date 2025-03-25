const C_plus_plus_Project_Structure = {


    // resources Files
    Folder_Structure: `
|-- 📁 resources
|   |-- 📄 Folder_Structure.txt
|-- 📁 build
|-- 📄 run.bat
|-- 📄 User.cpp
|-- 📄 User.h
|-- 📄 README.md
|-- 📄 .gitignore
|-- 📄 CMakeLists.txt
|-- 📄 main.cpp
    `,


    // Root Folder Files
    run: `
@echo off
if not exist build mkdir build
g++ -o build/main.exe src/main.cpp src/User.cpp
if %errorlevel% neq 0 (
    echo ❌ Compilation failed!
    pause
    exit /b %errorlevel%
)
echo ✅ Compilation successful!
echo Running the program...
build\\main.exe
echo.
echo Press any key to exit...
pause
    `,
    gitignore: `
# Compiled binaries
*.exe
*.out
*.o
*.obj
*.a
*.lib
*.so
*.dll

# CLion-specific files
.idea/
cmake-build-debug/
cmake-build-release/
CMakeFiles/
CMakeCache.txt
Testing/
CTestTestfile.cmake
Makefile
build/
*.cmake

# System files
.DS_Store
Thumbs.db

# Logs and temporary files
*.log
*.tmp
*.swp

# Code editor files
.vscode/
*.sublime-workspace
*.sublime-project
    `,
    README: ``,
    CMakeLists: `
cmake_minimum_required(VERSION 3.30)
project(C_Plus_Plus_Template)

set(CMAKE_CXX_STANDARD 20)

add_executable(C_Plus_Plus_Template
        main.cpp
        User.cpp  # Ensure User.cpp is included
)
    `,

    main: `
#include "User.h"

void showMenu() {
    cout << "\\n=== Login & Register CLI ===\\n";
    cout << "1. Register\\n";
    cout << "2. Login\\n";
    cout << "3. Exit\\n";
    cout << "Choose an option: ";
}

int main() {


    int choice;

    do {
        showMenu();
        cin >> choice;

        switch (choice) {
            case 1:
                registerUser();
            break;
            case 2:
                loginUser();
            break;
            case 3:
                cout << "Exiting program. Goodbye!\\n";
            break;
            default:
                cout << "❌ Invalid choice. Try again.\\n";
        }
    } while (choice != 3);

    return 0;
}
    `,

    user_cpp: `
#include "User.h"

vector<User> users; // Global user list


/**
 * file User.cpp
 * @brief Implements the User class methods.
 * This file contains the implementation of the User class methods,
 * keeping the logic separate from the declaration.
 *
 * @details
 * Organizes code by separating class logic from main.cpp.
 * Promotes encapsulation by hiding implementation details.
 * Enhances reusability, allowing the User class to be used across projects.
 * Improves compilation speed by avoiding unnecessary recompilation of the entire project.
 */

User::User(string uname, string pass) {
    username = uname;
    password = pass;
}

string User::getUsername() {
    return username;
}

bool User::checkPassword(string pass) {
    return password == pass;
}

void registerUser() {
    string uname, pass;
    cout << "Enter username: ";
    cin >> uname;
    cout << "Enter password: ";
    cin >> pass;

    users.push_back(User(uname, pass));
    cout << "✅ Registration successful!\\n";
}

void loginUser() {
    string uname, pass;
    cout << "Enter username: ";
    cin >> uname;
    cout << "Enter password: ";
    cin >> pass;

    for (User &u : users) {
        if (u.getUsername() == uname && u.checkPassword(pass)) {
            cout << "✅ Login successful! Welcome, " << uname << "!\\n";
            return;
        }
    }
    cout << "❌ Invalid username or password!\\n";
}
    `,
    user_h: `
#ifndef USER_H
#define USER_H

#include <iostream>
#include <vector>
using namespace std;

/**
 * file User.h
 * @brief Declares the User class and its interface.
 *
 * This header file defines the User class, including its attributes
 * and methods, while keeping implementation details separate.
 *
 * @note The header guard prevents multiple inclusions.
 *
 * @details
 * Defines the User class structure.
 * Uses \`#ifndef USER_H\` to prevent duplicate definitions.
 * Promotes encapsulation by hiding implementation details.
 * Enhances readability and debugging by separating declaration and logic.
 */

class User {
private:
    string username;
    string password;

public:
    User(string uname, string pass);

    string getUsername();
    bool checkPassword(string pass);
};

extern vector<User> users;

void registerUser();
void loginUser();

#endif
    `


};
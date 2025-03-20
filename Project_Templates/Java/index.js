const Java_Project_Structure = {


    // resources -> database Files
    database_sql: `
CREATE DATABASE java_cli_db;
USE java_cli_db;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);
    `,

    // resources Files
    Folder_Structure: `
|-- 📁 resources
|   |-- 📁 database
|   |   |-- 📄 database.sql
|   |-- 📄 Folder_Structure.txt
|-- 📁 src
|   |-- 📁 resources
|   |   |-- 📄 config.properties
|   |-- 📁 main
|   |   |-- 📁 service
|   |   |-- 📁 util
|   |   |-- 📁 entity
|   |   |-- 📁 model
|   |   |-- 📄 Main.java
|   |-- 📁 lib
|-- 📄 run.bat
|-- 📄 [YOUR_PROJECT_NAME].iml
|-- 📄 .gitignore
|-- 📄 README.md
    `,

    // src -> resources Files
    config_properties: `
# Database Configuration
db.url=jdbc:mysql://localhost:3306/java_cli_db
db.user=root
db.password=
    `,

    // src -> main -> entity
    User_java: `
package main.entity;

public class User {
    private int id;
    private String name;
    private String email;
    private String password;


    public User() {
//        Empty Constructor
    }

    public User(int id, String name, String email, String password) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
    }

    public void setId(int id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public int getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
}
    `,

    // src -> main -> model
    DatabaseConfig: `
package main.model;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;
import java.io.InputStream;
import java.io.IOException;

public class DatabaseConfig {
    private static Connection connection;
    private static final String CONFIG_FILE = "resources/config.properties";  // Corrected path

    public static Connection getConnection() {
        if (connection == null) {
            try {
                Properties props = new Properties();

                // Use correct ClassLoader
                InputStream input = Thread.currentThread().getContextClassLoader().getResourceAsStream(CONFIG_FILE);

                if (input == null) {
                    throw new IOException("config.properties file not found");
                }

                props.load(input);

                String url = props.getProperty("db.url");
                String user = props.getProperty("db.user");
                String password = props.getProperty("db.password");

                connection = DriverManager.getConnection(url, user, password);
                System.out.println("✅ Database connected successfully.");
            } catch (SQLException | IOException e) {
                e.printStackTrace();
                System.err.println("❌ Failed to connect to the database.");
            }
        }
        return connection;
    }
}
    `,
    UserRepo: `
package main.model;
public class UserRepo {

//    Write Functions for Database CRUD operations

}
`,

    // src -> main -> service
    UserService: `
package main.service;

import main.entity.User;
import main.model.DatabaseConfig;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import main.util.FunctionUtils;
import main.util.Object_Provider;
import main.util.StringUtils;

public class UserService {

    private static int user_id = 1;

    public boolean registerUser(String name, String email, String password) {
        if (StringUtils.isNullOrEmpty(name) || StringUtils.isNullOrEmpty(email) || StringUtils.isNullOrEmpty(password)) {
            System.out.println("❌ Name, email, or password cannot be empty.");
            return false;
        }

        String hashedPassword = StringUtils.hashPassword(password);
        User user = new User(user_id, name, email, hashedPassword);
        Object_Provider.addUser(user);
        user_id++;

        return user_id >= 1;
//        String query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
//        try (Connection conn = DatabaseConfig.getConnection();
//             PreparedStatement stmt = conn.prepareStatement(query)) {
//            stmt.setString(1, name);
//            stmt.setString(2, email);
//            stmt.setString(3, hashedPassword);
//            stmt.executeUpdate();
//            System.out.println("✅ User registered successfully!");
//        } catch (SQLException e) {
//            e.printStackTrace();
//            System.err.println("❌ Failed to register user.");
//        }

    }

    public boolean loginUser(String email, String password) {
//        String query = "SELECT password FROM users WHERE email = ?";
//        try (Connection conn = DatabaseConfig.getConnection();
//             PreparedStatement stmt = conn.prepareStatement(query)) {
//            stmt.setString(1, email);
//            ResultSet rs = stmt.executeQuery();
//            if (rs.next()) {
//                String storedPassword = rs.getString("password");
//                return StringUtils.verifyPassword(password, storedPassword);
//            }
//        } catch (SQLException e) {
//            e.printStackTrace();
//        }

        // ✅ Use UserSearcher to find user
        User user = FunctionUtils.findUserByEmail(Object_Provider.users, email);

        if (user == null) {
            System.out.println("❌ User not found.");
            return false;
        }

        // ✅ Verify the password
        return StringUtils.verifyPassword(password, user.getPassword());

    }
}
    `,

    // src -> main -> util
    DBUtils: `
package main.util;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class DBUtils {
    public static void closeConnection(Connection conn) {
        try {
            if (conn != null) {
                conn.close();
                System.out.println("Database connection closed.");
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public static void closeStatement(Statement stmt) {
        try {
            if (stmt != null) {
                stmt.close();
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public static void closeResultSet(ResultSet rs) {
        try {
            if (rs != null) {
                rs.close();
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
    `,
    FunctionUtils: `
package main.util;

import main.entity.User;

import java.util.List;

public class FunctionUtils {

    // ✅ Search for a user by email in the given list
    public static User findUserByEmail(List<User> users, String email) {
        for (User user : users) {
            if (user.getEmail().equalsIgnoreCase(email)) {
                return user;
            }
        }
        return null; // User not found
    }

}
    `,
    Object_Provider: `
package main.util;

import main.entity.User;
import java.util.ArrayList;
import java.util.List;

public class Object_Provider {

//    Declare all the classes from the entity folder here as static
// ✅ Store multiple users dynamically
    public static List<User> users = new ArrayList<>();

    // ✅ Add user to list
    public static void addUser(User user) {
        users.add(user);
    }
}
    `,
    StringUtils: `
package main.util;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class StringUtils {
    public static boolean isNullOrEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }

    public static String hashPassword(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hashedBytes = md.digest(password.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : hashedBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("❌ Error hashing password", e);
        }
    }

    public static boolean verifyPassword(String enteredPassword, String storedHash) {
        return hashPassword(enteredPassword).equals(storedHash);
    }
}
    `,

    // src -> main Files
    Main: `
package main;

import main.service.UserService;

import java.util.Scanner;

/**
 * This is the main entry point of the application.
 *
 * <p><b>Write your major Decisions In this file</b></p>
 * <ul>
 *     <li>Create features in the <code>UserService</code> class as functions and call them here based on different major conditions.</li>
 *     <li>Create different classes in the <code>entity</code> folder that will be used to hold data for a short time.</li>
 *     <li>Push the data into the database through respective functions, which should be created in the <code>model</code> folder.</li>
 *     <li>Ensure that you use a database name that exists in the server or host.</li>
 *     <li>Declare all classes from the <code>entity</code> folder as static inside the <code>util.ObjectProvider</code> class.</li>
 * </ul>
 */



public class Main {
    public static void main(String[] args) {
        System.out.println("RELAX DEVELOPER! YOUR PROJECT IS OKAY!");
        System.out.println("YOU CAN START BUILDING FROM HERE!");

        Scanner scanner = new Scanner(System.in);
        UserService userService = new UserService();

        while (true) {
            System.out.println("\\nWelcome to the Java CLI Login System!");
            System.out.println("1. Register");
            System.out.println("2. Login");
            System.out.println("3. Exit");
            System.out.print("Choose an option: ");

            int choice;
            if (scanner.hasNextInt()) {
                choice = scanner.nextInt();
                scanner.nextLine(); // Consume newline
            } else {
                System.out.println("❌ Invalid input! Please enter a number.");
                scanner.nextLine(); // Clear invalid input
                continue;
            }

            switch (choice) {
                case 1:
                    System.out.print("Enter name: ");
                    String name = scanner.nextLine();
                    System.out.print("Enter email: ");
                    String email = scanner.nextLine();
                    System.out.print("Enter password: ");
                    String password = scanner.nextLine();
                    boolean decision = userService.registerUser(name, email, password);

                    if (decision) {
                        System.out.println("✅ User registered successfully!");
                    } else {
                        System.out.println("❌ Error registering the user!");
                    }
                    break;

                case 2:
                    System.out.print("Enter email: ");
                    String loginEmail = scanner.nextLine();
                    System.out.print("Enter password: ");
                    String loginPassword = scanner.nextLine();

                    if (userService.loginUser(loginEmail, loginPassword)) {
                        System.out.println("✅ Login successful! 🎉");
                    } else {
                        System.out.println("❌ Invalid email or password!");
                    }
                    break;

                case 3:
                    System.out.println("👋 Exiting the system. Goodbye!");
                    scanner.close();
                    return; // Exit the program

                default:
                    System.out.println("❌ Invalid option! Please choose 1, 2, or 3.");
            }
        }
    }
}
    `,


    // Root Folder Files
    run: `
@echo off
javac -d bin -cp src src/main/app/Main.java
java -cp bin main.app.Main
pause
    `,
    gitignore: `
### IntelliJ IDEA ###
out/
!**/src/main/**/out/
!**/src/test/**/out/

### Eclipse ###
.apt_generated
.classpath
.factorypath
.project
.settings
.springBeans
.sts4-cache
bin/
!**/src/main/**/bin/
!**/src/test/**/bin/

### NetBeans ###
/nbproject/private/
/nbbuild/
/dist/
/nbdist/
/.nb-gradle/

### VS Code ###
.vscode/

### Mac OS ###
.DS_Store
    `,
    README: ``,
    Project_Name_iml: `
<?xml version="1.0" encoding="UTF-8"?>
<module type="JAVA_MODULE" version="4">
  <component name="NewModuleRootManager" inherit-compiler-output="true">
    <exclude-output />
    <content url="file://$MODULE_DIR$">
      <sourceFolder url="file://$MODULE_DIR$/src" isTestSource="false" />
    </content>
    <orderEntry type="inheritedJdk" />
    <orderEntry type="sourceFolder" forTests="false" />
  </component>
</module>
    `,


};
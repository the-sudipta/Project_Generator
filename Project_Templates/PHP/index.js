const PHP_Project_Structure = {

    // Root Folder Files
    htaccess: `ErrorDocument 404 /view/error/404_not_found_error.php`,
    index: `
<?php
global $routes;
require './routes.php';
session_start();
$login_page = $routes['login'];
header("Location: {$login_page}");
?>
    `,
    Project_Description_html: `Write Project Details with HTML, CSS and JavaScript`,
    routes: `  
<?php
// Frontend routes
$routes = [
    'INDEX' => '/index.php',
    'login' => '/view/Login.php',
    'loader' => '/view/Loader.php',
    'database_error' => '/view/error/_database_error.php',
    'not_found_error' => '/view/error/_404_not_found_error.php',
    'forbidden_error' => '/view/error/_403_forbidden_error.php',
    'internal_server_error' => '/view/error/_500_internal_server_error.php',
];
// Backend routes
$backend_routes = [
    'login_controller' => '/controller/LoginController.php',
    'logout_controller' => '/controller/LogoutController.php',
];
    `,
    README: ``,
    LICENSE: ``,
    utility_functions: `
<?php

global $routes;
require 'routes.php';
session_start(); // Make sure session is started

function show_error_page($error_location, $error_message, $error_type) {

    global $routes;
    if ($error_type === 'database_error') {
        $_SESSION['error_location'] = $error_location;
        $_SESSION['error_message'] = $error_message;
        header("Location: {$routes['database_error']}");
        exit;
    } elseif ($error_type === 'internal_server_error') {
        $_SESSION['internal_server_error_location'] = $error_location;
        $_SESSION['internal_server_error_message'] = $error_message;
        header("Location: {$routes['internal_server_error']}");
        exit;
    } else {
        // Fallback: if route not found, show plain error
        echo "<h2>Error:</h2><p>{$error_message}</p><p>Location: {$error_location}</p>";
        exit;
    }
}


// Custom error handler function to catch PHP errors and convert them to exceptions
function customErrorHandler($errno, $errstr, $errfile, $errline) {
    // You can customize the error levels to convert specific types of errors to exceptions
    if ($errno == E_WARNING || $errno == E_NOTICE || $errno == E_ERROR) {
        // You can throw an exception with custom error message or log the error.
        throw new Exception("Error [$errno]: $errstr in $errfile on line $errline");
    }
    // For other errors, you can handle them or log them.
    return true; // Return true to prevent PHP's internal error handler from running
}
function setCustomErrorHandler() {
    // Set the custom error handler globally
    set_error_handler("customErrorHandler");
}
function restoreCustomErrorHandler() {
    // Restore the original PHP error handler if needed
    restore_error_handler();
}
    `,

    // controller Folder Files
    LoginController: `
<?php
try{

    require_once dirname(__DIR__) . '/utility_functions.php'; // Responsible for show_error_page() Function
    setCustomErrorHandler();
    global $routes;
    require '../routes.php';

    require_once dirname(__DIR__) . '/model/userRepo.php';



    @session_start();


    $Login_page = $routes['login'];
    $Admin_Dashboard_page = $routes['admin_dashboard'];
    $Salesman_dashboard_page = $routes['salesman_dashboard'];

    $errorMessage = "";

//echo $_SERVER['REQUEST_METHOD'];
    $everythingOKCounter = 0;

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {

        echo "Got Req";

        //* Email Validation
        $Email = $_POST['Email'];
        if (empty($Email)) {

            $everythingOK = FALSE;
            $everythingOKCounter += 1;

            echo '<br>Email Error : Email is Empty<br>';
            $errorMessage = urldecode("Email has more than 120 Characters or It is empty");
        } else {
            $everythingOK = TRUE;
        }

        //* Password Validation
        $password = $_POST['password'];
        if (empty($password) || strlen($password) < 8) {
            // check if password size in 8 or more and  check if it is empty

            $everythingOK = FALSE;
            $everythingOKCounter += 1;
            echo '<br>Password Error : Password has less than 8 Characters or It is empty<br>';
            $errorMessage = urldecode("Password has less than 8 Characters or It is empty");
        } else {
            $everythingOK = TRUE;
        }


        if ($everythingOK && $everythingOKCounter === 0) {
            $data = findUserByEmailAndPassword($Email, $password);

//        echo '<br><br>';
            echo '<br>Everything is ok<br>';
            echo '<br>ID found = ' . isset($data["id"]) . ' <br>';
            if ($data && isset($data["id"])) {
                $_SESSION["data"] = $data;
                $_SESSION["user_id"] = $data["id"];
                $_SESSION["user_role"] = $data["role"];
                $_SESSION["user_status"] = $data["status"];

                if (strtolower($data['role']) === 'admin') {
                    header("Location: {$Admin_Dashboard_page}");
                    exit;
                } elseif (strtolower($data['role']) === 'salesman'){
                    header("Location: {$Salesman_dashboard_page}");
                    exit;
                } else {
                    $errorMessage = urldecode("Role did not match to any valid roles");
                    header("Location: {$Login_page}?message=$errorMessage");
                    exit;
                }
            } else {
                echo '<br>Returning to Login page because Email Password did not match<br>';
                $errorMessage = urldecode("Email and Password did not match");
                header("Location: {$Login_page}?message=$errorMessage");
                exit;
            }
        } else {
            echo '<br>Returning to Login page because The data user provided is not properly validated like 
                in password: 1-upper_case, 1-lower_case, 1-number, 1-special_character and at least 8 character long it must be provided <br>';
            header("Location: {$Login_page}?message=$errorMessage");
            exit;
        }


    }

} catch (Throwable $e){

//    Redirect to 500 Internal Server Error Page

    $error_location = "LoginController";
    $error_message = $e->getMessage();
    show_error_page($error_location, $error_message, "internal_server_error");


}
    `,
    LogoutController: `
<?php

//include_once '../Navigation_Links.php';

global $routes;
require '../routes.php';
$root_page = $routes['INDEX'];


session_start();


session_start();
$_SESSION["data"] = null;
$_SESSION["data"]["status"] = -1;
$_SESSION["user_id"] = -1;
session_destroy();


header("Location: {$root_page}");
    `,
    TestController: ``,


    // model Folder Files
    CalculationRepo: ``,
    db_connect: `
<?php

require __DIR__ . '/../routes.php';

global $routes;

$database_error_page = $routes["database_error"];

function db_conn()
{
    $servername = "localhost";
    $username = "root";
    $password = "#1";
    $dbname = "WRITE_YOUR_DATABASE_NAME_HERE";

    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);

    // Check connection
    if ($conn->connect_error) {

        $_SESSION['error_location'] = "db_connect";
        $_SESSION['database_error'] = $conn->connect_error;
        global $routes;
        $database_error_page = $routes["database_error"];
        header("Location: {$database_error_page}");

//        die("Connection failed: " . $conn->connect_error);
    }

    return $conn;
}
    `,
    userRepo: `
<?php

require_once __DIR__ . '/../model/db_connect.php';
require_once dirname(__DIR__) . '/utility_functions.php'; // Responsible for show_error_page() Function

require __DIR__ . '/../routes.php';
global $routes;

$database_error_page = $routes["database_error"];


function findAllUsers()
{
    $conn = db_conn();
    $selectQuery = 'SELECT * FROM \`user\`';

    try {
        $result = $conn->query($selectQuery);

        // Check if the query was successful
        if (!$result) {
            $error_location = "Database -> userRepo -> findAllUsers()";
            $error_message = "Query failed: " . $conn->error;
            show_error_page($error_location, $error_message, "database_error");
        }

        $rows = array();

        // Fetch rows one by one
        while ($row = $result->fetch_assoc()) {
            $rows[] = $row;
        }

        // Check for an empty result set
        if (empty($rows)) {
            return null;
        }

        return $rows;
    } catch (Exception $e) {
//        echo "Error: " . $e->getMessage();
        $error_location = "Database -> userRepo -> findAllUsers()";
        $error_message = "Error: " . $e->getMessage();
        show_error_page($error_location, $error_message, "database_error");
    } finally {
        // Close the database connection
        $conn->close();
    }
}


function findUserByEmailAndPassword($email, $password) {
    $conn = db_conn();

    // Use prepared statement to prevent SQL injection
    $selectQuery = 'SELECT * FROM \`user\` WHERE \`email\` = ?';

    try {
        $stmt = $conn->prepare($selectQuery);

        // Bind parameters
        $stmt->bind_param("s", $email);

        // Execute the statement
        $stmt->execute();

        // Get the result
        $result = $stmt->get_result();

        // Fetch the user as an associative array
        $user = $result->fetch_assoc();

        // Close the result set
        $result->close();

        // Close the statement
        $stmt->close();

        // Check if the user exists and if the password matches
        if ($user && password_verify($password, $user['password'])) {
            // Password is correct
            return $user;
        } else {
            // Password is incorrect or user doesn't exist
            return null;
        }
    } catch (Exception $e) {
//        echo $e->getMessage();
        $error_location = "Database -> userRepo -> findAllUsers()";
        $error_message = $e->getMessage();
        show_error_page($error_location, $error_message, "database_error");
        return null;
    } finally {
        // Close the database connection
        $conn->close();
    }
}


function findUserByUserID($id)
{
    $conn = db_conn();
    $selectQuery = 'SELECT * FROM \`user\` WHERE \`id\` = ?';

    try {
        $stmt = $conn->prepare($selectQuery);

        // Check if the prepare statement was successful
        if (!$stmt) {
//            throw new Exception("Prepare statement failed: " . $conn->error);
            $error_location = "Database -> userRepo -> findUserByUserID()";
            $error_message = "Prepare statement failed: " . $conn->error;
            show_error_page($error_location, $error_message, "database_error");
        }
        // Bind the parameter
        $stmt->bind_param("i", $id);

        // Execute the query
        $stmt->execute();

        // Get the result
        $result = $stmt->get_result();

        // Fetch the user as an associative array
        $user = $result->fetch_assoc();

        // Check for an empty result set
        if (!$user) {
            return null;
        }
        // Close the statement
        $stmt->close();
        return $user;
    } catch (Exception $e) {
//        echo "Error: " . $e->getMessage();
        $error_location = "Database -> userRepo -> findUserByID()";
        $error_message = "Error : " . $e->getMessage();;
        show_error_page($error_location, $error_message, "database_error");
    } finally {
        // Close the database connection
        $conn->close();
    }
}

function findUserByEmail($email)
{
    $conn = db_conn();
    $selectQuery = 'SELECT * FROM \`user\` WHERE \`email\` = ?';

    try {
        $stmt = $conn->prepare($selectQuery);

        // Check if the prepare statement was successful
        if (!$stmt) {
//            throw new Exception("Prepare statement failed: " . $conn->error);
            $error_location = "Database -> userRepo -> findUserByemail()";
            $error_message = "Prepare statement failed: " . $conn->error;
            show_error_page($error_location, $error_message, "database_error");
        }

        // Bind the parameter
        $stmt->bind_param("s", $email);

        // Execute the query
        $stmt->execute();

        // Get the result
        $result = $stmt->get_result();

        // Fetch the user as an associative array
        $user = $result->fetch_assoc();

        // Check for an empty result set
        if (!$user) {
            return null;
        }
        // Close the statement
        $stmt->close();
        return $user;
    } catch (Exception $e) {
//        echo "Error: " . $e->getMessage();
        $error_location = "Database -> userRepo -> findUserByemail()";
        $error_message = "Error : " . $e->getMessage();;
        show_error_page($error_location, $error_message, "database_error");
    } finally {
        // Close the database connection
        $conn->close();
    }
}


function updateUser($email, $password, $role, $status, $id)
{
    $conn = db_conn();

    // Construct the SQL query
    $updateQuery = "UPDATE \`user\` SET 
                    email = ?,
                    password = ?,
                    role = ?,
                    status =?
                    WHERE id = ?";

    try {
        // Prepare the statement
        $stmt = $conn->prepare($updateQuery);

        // Check if the prepare statement was successful
        if (!$stmt) {
//            throw new Exception("Prepare statement failed: " . $conn->error);
            $error_location = "Database -> userRepo -> updateUser()";
            $error_message = "Prepare statement failed: " . $conn->error;
            show_error_page($error_location, $error_message, "database_error");
        }

        // Bind parameters
        $stmt->bind_param('ssssi', $email, $password, $role, $status, $id);

        // Execute the query
        if ($stmt->execute()) {
            if ($stmt->affected_rows < 0) {
                return false;
            }
        } else {
            return false;
        }
        // Return true if the update is successful
        return true;
    } catch (Exception $e) {
        // Handle the exception, you might want to log it or return false
//        echo "Error: " . $e->getMessage();
        $error_location = "Database -> userRepo -> updateUser()";
        $error_message = "Error: " . $e->getMessage();
        show_error_page($error_location, $error_message, "database_error");
    } finally {
        // Close the statement
        $stmt->close();
        // Close the database connection
        $conn->close();
    }
}

function updateUserStatus($status, $id)
{
    $conn = db_conn();

    // Construct the SQL query
    $updateQuery = "UPDATE \`user\` SET 
                    status =?
                    WHERE id = ?";

    try {
        // Prepare the statement
        $stmt = $conn->prepare($updateQuery);

        // Check if the prepare statement was successful
        if (!$stmt) {
//            throw new Exception("Prepare statement failed: " . $conn->error);
            $error_location = "Database -> userRepo -> updateUserStatus()";
            $error_message = "Prepare statement failed: " . $conn->error;
            show_error_page($error_location, $error_message, "database_error");
        }

        // Bind parameters
        $stmt->bind_param('si', $status, $id);

        // Execute the query
        if ($stmt->execute()) {
            if ($stmt->affected_rows < 0) {
                return false;
            }
        } else {
            return false;
        }

        // Return true if the update is successful
        return true;
    } catch (Exception $e) {
        // Handle the exception, you might want to log it or return false
//        echo "Error: " . $e->getMessage();
        $error_location = "Database -> userRepo -> updateUserStatus()";
        $error_message = "Error: " . $e->getMessage();
        show_error_page($error_location, $error_message, "database_error");
    } finally {
        // Close the statement
        $stmt->close();
        // Close the database connection
        $conn->close();
    }
}


function deleteUser($id) {
    $conn = db_conn();

    // Construct the SQL query
    $updateQuery = "DELETE FROM \`user\`
                    WHERE id = ?";

    try {
        // Prepare the statement
        $stmt = $conn->prepare($updateQuery);

        // Check if the prepare statement was successful
        if (!$stmt) {
//            throw new Exception("Prepare statement failed: " . $conn->error);
            $error_location = "Database -> userRepo -> deleteUser()";
            $error_message = "Prepare statement failed: " . $conn->error;
            show_error_page($error_location, $error_message, "database_error");
        }

        // Bind parameter
        $stmt->bind_param('i', $id);

        // Execute the query
        $stmt->execute();

        // Return true if the update is successful
        return true;
    } catch (Exception $e) {
        // Handle the exception, you might want to log it or return false
//        echo "Error: " . $e->getMessage();
//        $error_location = "Database -> userRepo -> deleteUser()";
//        $error_message = $e->getMessage();
//        show_error_page($error_location, $error_message, "database_error");
        return false;
    } finally {
        // Close the statement
        $stmt->close();

        // Close the database connection
        $conn->close();
    }
}


function createUser($email, $password, $role, $status) {
    $conn = db_conn();

    // Hash the password using a secure hashing algorithm (e.g., password_hash)
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Construct the SQL query
    $insertQuery = "INSERT INTO \`user\` (email, password, role, status) VALUES (?, ?, ?, ?)";

    try {
        $newUserId = -1;
        // Prepare the statement
        $stmt = $conn->prepare($insertQuery);

        // Bind parameters
        $stmt->bind_param('ssss', $email, $hashedPassword, $role, $status);

        // Execute the query
        $stmt->execute();

        // Return the ID of the newly inserted user
        $newUserId = $stmt->insert_id;

        if($newUserId < 0){
            return -1;
        }

        // Close the statement
        $stmt->close();

        return $newUserId;
    } catch (Exception $e) {
        // Handle the exception, you might want to log it or return false
//        echo "Error: " . $e->getMessage();
        $error_location = "Database -> userRepo -> createUser()";
        $error_message = $e->getMessage();
        show_error_page($error_location, $error_message, "database_error");
    } finally {
        // Close the database connection
        $conn->close();
    }
}
    `,

    // view -> css -> database_error Folder Files
    style_css: `
body,
html {
    padding: 0;
    margin: 0;
    font-family: 'Quicksand', sans-serif;
    font-weight: 400;
    overflow: hidden;
}

.writing {
    width: 320px;
    height: 200px;
    background-color: #3f3f3f;
    border: 1px solid #bbbbbb;
    border-radius: 6px 6px 4px 4px;
    position: relative;
}

.writing .topbar{
    position: absolute;
    width: 100%;
    height: 12px;
    background-color: #f1f1f1;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
}

.writing .topbar div{
    height: 6px;
    width: 6px;
    border-radius: 50%;
    margin: 3px;
    float: left;
}

.writing .topbar div.green{
    background-color: #60d060;
}
.writing .topbar div.red{
    background-color: red;
}
.writing .topbar div.yellow{
    background-color: #e6c015;
}

.writing .code {
    padding: 15px;
}

.writing .code ul {
    list-style: none;
    margin: 0;
    padding: 0;
}

.writing .code ul li {
    background-color: #9e9e9e;
    width: 0;
    height: 7px;
    border-radius: 6px;
    margin: 10px 0;
}

.container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100%;
    transition: transform .5s;
}

.stack-container {
    position: relative;
    width: 420px;
    height: 210px;
    transition: width 1s, height 1s;
}

.pokeup {
    transition: all .3s ease;
}

.pokeup:hover {
    transform: translateY(-10px);
    transition: .3s ease;
}


.error {
    width: 400px;
    padding: 40px;
    text-align: center;
}

.error h1 {
    font-size: 125px;
    padding: 0;
    margin: 0;
    font-weight: 700;
}

.error h2 {
    margin: -30px 0 0 0;
    padding: 0px;
    font-size: 47px;
    letter-spacing: 12px;
}

.perspec {
    perspective: 1000px;
}

.writeLine{
    -webkit-animation: writeLine .4s linear forwards;
            animation: writeLine .4s linear forwards;
}

.explode{
    -webkit-animation: explode .5s ease-in-out forwards;
            animation: explode .5s ease-in-out forwards;
}

.card {
    -webkit-animation: tiltcard .5s ease-in-out 1s forwards;
            animation: tiltcard .5s ease-in-out 1s forwards;
    position: absolute;
}

@-webkit-keyframes tiltcard {
    0% {
        transform: rotateY(0deg);
    }

    100% {
        transform: rotateY(-30deg);
    }
}

@keyframes tiltcard {
    0% {
        transform: rotateY(0deg);
    }

    100% {
        transform: rotateY(-30deg);
    }
}

@-webkit-keyframes explode {
    0% {
        transform: translate(0, 0) scale(1);
    }

    100% {
        transform: translate(var(--spreaddist), var(--vertdist)) scale(var(--scaledist));
    }
}

@keyframes explode {
    0% {
        transform: translate(0, 0) scale(1);
    }

    100% {
        transform: translate(var(--spreaddist), var(--vertdist)) scale(var(--scaledist));
    }
}

@-webkit-keyframes writeLine {
    0% {
        width:0;
    }

    100% {
        width: var(--linelength);
    }
}

@keyframes writeLine {
    0% {
        width:0;
    }

    100% {
        width: var(--linelength);
    }
}

@media screen and (max-width: 1000px) {
    .container {
      transform: scale(.85);
    }
  }

  @media screen and (max-width: 850px) {
    .container {
      transform: scale(.75);
    }
  }

  @media screen and (max-width: 775px) {
    .container {
      flex-wrap: wrap-reverse;
      align-items: inherit;
    }
  }

  @media screen and (max-width: 370px) {
    .container {
        transform: scale(.6);
      }
  }
    `,

    // view -> error Folder Files
    _403_forbidden_error: `
<?php

?>
<!DOCTYPE html>
<html lang="en" >
<head>
  <meta charset="UTF-8">
  <title>Forbidden</title>
    <meta charset="utf-8">
    <meta name="description" content="CSS 403 Error, an exercise about chaining css animations by RGG">
    <meta content="IE=edge" http-equiv="X-UA-Compatible">
    <style>
      @import url("https://fonts.googleapis.com/css?family=Bree+Serif");
      @import url("https://fonts.googleapis.com/css?family=Open+Sans:300");
      html, body, div, span, applet, object, iframe,
      h1, h2, h3, h4, h5, h6, p, blockquote, pre,
      a, abbr, acronym, address, big, cite, code,
      del, dfn, em, img, ins, kbd, q, s, samp,
      small, strike, strong, sub, sup, tt, var,
      b, u, i, center,
      dl, dt, dd, ol, ul, li,
      fieldset, form, label, legend,
      table, caption, tbody, tfoot, thead, tr, th, td,
      article, aside, canvas, details, embed,
      figure, figcaption, footer, header, hgroup,
      menu, nav, output, ruby, section, summary,
      time, mark, audio, video {
        margin: 0;
        padding: 0;
        border: 0;
        font: inherit;
        font-size: 100%;
        vertical-align: baseline;
      }

      html {
        line-height: 1;
      }

      ol, ul {
        list-style: none;
      }

      table {
        border-collapse: collapse;
        border-spacing: 0;
      }

      caption, th, td {
        text-align: left;
        font-weight: normal;
        vertical-align: middle;
      }

      q, blockquote {
        quotes: none;
      }
      q:before, q:after, blockquote:before, blockquote:after {
        content: "";
        content: none;
      }

      a img {
        border: none;
      }

      article, aside, details, figcaption, figure, footer, header, hgroup, main, menu, nav, section, summary {
        display: block;
      }

      html,
      body,
      main {
        height: 100%;
        width: 100%;
        box-sizing: border-box;
        -webkit-overflow-scrolling: touch;
      }

      body {
        font-size: 1em;
        line-height: 1.4rem;
        color: #ecf0f1;
        background-color: #2c3e50;
        font-family: 'Open Sans', sans-serif;
      }

      .accessible-hide {
        position: absolute;
        height: 0;
        width: 0;
        overflow: hidden;
      }

      .flexy-center {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
      }

      .svg-icon {
        width: 1em;
        height: 1em;
        fill: #ecf0f1;
      }
      .svg-icon:nth-of-type(1) {
        transform: translate(-0.55em);
      }
      .svg-icon:nth-of-type(2) {
        transform: translate(0.55em);
      }

      .button {
        padding: 0.7rem 1.4rem;
        border-radius: .2em;
        background-color: #27ae60;
        margin: 0 1.4rem;
        transition: all 0.225s ease-in-out;
        cursor: pointer;
      }
      .button__container {
        display: flex;
      }
      .button--disabled {
        pointer-events: none;
        opacity: .2;
      }

      .container {
        font-size: 3em;
        height: .45em;
        width: 5em;
        margin-top: 7rem;
        perspective: 1200px;
        position: relative;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        background-image: radial-gradient(#ecf0f1 0.015em, rgba(0, 0, 0, 0) 0.02em);
        background-size: .25em .25em;
        background-repeat: repeat-x;
        background-position: 0 bottom;
        transition: all 2.7s ease-in-out;
      }
      .container__title {
        margin-top: 1em;
        font-size: 2em;
        opacity: 0;
        transition: opacity 0.225s ease-in-out;
      }
      .container__title--anim {
        opacity: 1;
      }
      .container__anim {
        background-position: 200% bottom;
      }
      .container:before {
        content: '';
        height: 1em;
        width: calc(100% + .15em);
        position: absolute;
        left: -.075em;
        bottom: -.48em;
        box-sizing: border-box;
        padding-bottom: .25em;
        border-radius: 0 0 .25em .25em;
        border: .05em solid white;
        border-bottom-color: transparent;
        border-top-color: transparent;
        transform-style: preserve-3d;
        transform-origin: 50% 0;
        transform: rotateX(63deg);
      }
      .container__jump {
        background-image: radial-gradient(#e74c3c 0.015em, rgba(0, 0, 0, 0) 0.02em);
      }
      .container__jump .response {
        -webkit-animation: responseMove 1.125s ease-out forwards;
                animation: responseMove 1.125s ease-out forwards;
      }
      .container__jump .response .item {
        opacity: 1;
        -webkit-animation: 0.9s linear forwards;
                animation: 0.9s linear forwards;
        -webkit-animation-delay: 0.1125s;
                animation-delay: 0.1125s;
      }
      .container__jump .response .item:nth-child(1) {
        -webkit-animation-name: jump4;
                animation-name: jump4;
      }
      .container__jump .response .item:nth-child(2) {
        -webkit-animation-name: jump0;
                animation-name: jump0;
      }
      .container__jump .response .item:nth-child(3) {
        -webkit-animation-name: jump3;
                animation-name: jump3;
      }
      .container__jump .response .sparks {
        transform: scale(2);
        opacity: 0;
        background-color: #e74c3c;
      }
      .container__jump .server {
        fill: #e74c3c;
      }
      .container__jump:before {
        border-right-color: #e74c3c;
      }
      .container .svg-icon {
        position: absolute;
        bottom: 100%;
      }
      .container .svg-icon:nth-of-type(1) {
        left: 0;
      }
      .container .svg-icon:nth-of-type(2) {
        right: 0;
      }

      .response {
        position: absolute;
        right: -.5em;
        top: -1em;
      }
      .response .item {
        opacity: 0;
        line-height: 1em;
        font-family: 'Bree Serif', serif;
      }

      .sparks {
        width: 1em;
        height: 1em;
        border-radius: 1em;
        background-color: white;
        transform: scale(0);
        transition: all 0.225s ease-out;
      }

      .item {
        top: 0;
        right: 0;
        position: absolute;
        width: 0.7em;
        z-index: 2;
        text-align: center;
        transition: all 0.45s ease-out;
        display: flex;
        align-items: center;
        line-height: .87em;
        justify-content: center;
      }

      @-webkit-keyframes responseMove {
        100% {
          transform: translate(-2.5em, 0.7em) scale(1.5);
        }
      }

      @keyframes responseMove {
        100% {
          transform: translate(-2.5em, 0.7em) scale(1.5);
        }
      }
      @-webkit-keyframes jump4 {
        0% {
          transform: translateY(0) translateX(0) rotate(0);
          -webkit-animation-timing-function: ease-out;
                  animation-timing-function: ease-out;
        }
        50% {
          transform: translateY(-3em) translateX(-0.35em) rotate(-340deg);
          -webkit-animation-timing-function: ease-in;
                  animation-timing-function: ease-in;
        }
        70% {
          transform: translateY(0) translateX(-0.45em) rotate(-360deg);
          -webkit-animation-timing-function: ease-out;
                  animation-timing-function: ease-out;
        }
        80% {
          transform: translateY(-1em) translateX(-0.55em) rotate(-360deg);
          -webkit-animation-timing-function: ease-in;
                  animation-timing-function: ease-in;
        }
        90%,
          100% {
          transform: translateY(0) translateX(-0.65em) rotate(-360deg);
          -webkit-animation-timing-function: ease-out;
                  animation-timing-function: ease-out;
          color: #e74c3c;
        }
      }
      @keyframes jump4 {
        0% {
          transform: translateY(0) translateX(0) rotate(0);
          -webkit-animation-timing-function: ease-out;
                  animation-timing-function: ease-out;
        }
        50% {
          transform: translateY(-3em) translateX(-0.35em) rotate(-340deg);
          -webkit-animation-timing-function: ease-in;
                  animation-timing-function: ease-in;
        }
        70% {
          transform: translateY(0) translateX(-0.45em) rotate(-360deg);
          -webkit-animation-timing-function: ease-out;
                  animation-timing-function: ease-out;
        }
        80% {
          transform: translateY(-1em) translateX(-0.55em) rotate(-360deg);
          -webkit-animation-timing-function: ease-in;
                  animation-timing-function: ease-in;
        }
        90%,
          100% {
          transform: translateY(0) translateX(-0.65em) rotate(-360deg);
          -webkit-animation-timing-function: ease-out;
                  animation-timing-function: ease-out;
          color: #e74c3c;
        }
      }
      @-webkit-keyframes jump0 {
        0% {
          transform: translateY(0) translateX(0) rotate(0);
          -webkit-animation-timing-function: ease-out;
                  animation-timing-function: ease-out;
        }
        50% {
          transform: translateY(-2em) translateX(-0.1em) rotate(-700deg);
          -webkit-animation-timing-function: ease-in;
                  animation-timing-function: ease-in;
        }
        70% {
          transform: translateY(0) translateX(-0.1em) rotate(-720deg);
          -webkit-animation-timing-function: ease-out;
                  animation-timing-function: ease-out;
        }
        80% {
          transform: translateY(-0.5em) translateX(-0.1em) rotate(-720deg);
          -webkit-animation-timing-function: ease-in;
                  animation-timing-function: ease-in;
        }
        90%,
          100% {
          transform: translateY(0) translateX(-0.1em) rotate(-720deg);
          -webkit-animation-timing-function: ease-out;
                  animation-timing-function: ease-out;
          color: #e74c3c;
        }
      }
      @keyframes jump0 {
        0% {
          transform: translateY(0) translateX(0) rotate(0);
          -webkit-animation-timing-function: ease-out;
                  animation-timing-function: ease-out;
        }
        50% {
          transform: translateY(-2em) translateX(-0.1em) rotate(-700deg);
          -webkit-animation-timing-function: ease-in;
                  animation-timing-function: ease-in;
        }
        70% {
          transform: translateY(0) translateX(-0.1em) rotate(-720deg);
          -webkit-animation-timing-function: ease-out;
                  animation-timing-function: ease-out;
        }
        80% {
          transform: translateY(-0.5em) translateX(-0.1em) rotate(-720deg);
          -webkit-animation-timing-function: ease-in;
                  animation-timing-function: ease-in;
        }
        90%,
          100% {
          transform: translateY(0) translateX(-0.1em) rotate(-720deg);
          -webkit-animation-timing-function: ease-out;
                  animation-timing-function: ease-out;
          color: #e74c3c;
        }
      }
      @-webkit-keyframes jump3 {
        0% {
          transform: translateY(0) translateX(0) rotate(0);
          -webkit-animation-timing-function: ease-out;
                  animation-timing-function: ease-out;
        }
        50% {
          transform: translateY(-3em) translateX(0.1em) rotate(-340deg);
          -webkit-animation-timing-function: ease-in;
                  animation-timing-function: ease-in;
        }
        70% {
          transform: translateY(0) translateX(0.2em) rotate(-360deg);
          -webkit-animation-timing-function: ease-out;
                  animation-timing-function: ease-out;
        }
        80% {
          transform: translateY(-1em) translateX(0.3em) rotate(-360deg);
          -webkit-animation-timing-function: ease-in;
                  animation-timing-function: ease-in;
        }
        90%,
          100% {
          transform: translateY(0) translateX(0.4em) rotate(-360deg);
          -webkit-animation-timing-function: ease-out;
                  animation-timing-function: ease-out;
          color: #e74c3c;
        }
      }
      @keyframes jump3 {
        0% {
          transform: translateY(0) translateX(0) rotate(0);
          -webkit-animation-timing-function: ease-out;
                  animation-timing-function: ease-out;
        }
        50% {
          transform: translateY(-3em) translateX(0.1em) rotate(-340deg);
          -webkit-animation-timing-function: ease-in;
                  animation-timing-function: ease-in;
        }
        70% {
          transform: translateY(0) translateX(0.2em) rotate(-360deg);
          -webkit-animation-timing-function: ease-out;
                  animation-timing-function: ease-out;
        }
        80% {
          transform: translateY(-1em) translateX(0.3em) rotate(-360deg);
          -webkit-animation-timing-function: ease-in;
                  animation-timing-function: ease-in;
        }
        90%,
          100% {
          transform: translateY(0) translateX(0.4em) rotate(-360deg);
          -webkit-animation-timing-function: ease-out;
                  animation-timing-function: ease-out;
          color: #e74c3c;
        }
      }
    </style>

</head>
<body>
<!-- partial:index.partial.html -->
<main>
  <header class="accessible-hide">
    <h1>CSS 403 Error</h1>
  </header>
  <div class="flexy-center">
    <div class="button__container">
      <div class="button" id="connect">Connect</div>
      <div class="button button--disabled" id="reload">Reload</div>
    </div>
    <div class="container" id="container">
      <svg class="computer svg-icon" id="computer" xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewbox="0 0 1024 1024">
        <path d="M864 159.872L160 160c-17.696 0-32 14.176-32 31.872v448c0 17.696 14.304 32 32 32h704c17.696 0 32-14.304 32-32v-448c0-17.696-14.304-32-32-32zM864 640H160V191.872h704V640zm64-608H96C42.976 32 0 74.944 0 128v640c0 52.928 42.816 95.808 95.68 95.936H416v38.944l-199.744 25.952C201.984 932.384 192 945.184 192 959.872c0 17.696 14.304 32 32 32h576c17.696 0 32-14.304 32-32 0-14.688-9.984-27.488-24.256-31.072L608 902.88v-38.944h320.32c52.864-.128 95.68-43.008 95.68-95.936V128c0-53.056-43.008-96-96-96zm32 736c0 17.632-14.368 32-32 32H96c-17.664 0-32-14.368-32-32V128c0-17.664 14.336-32 32-32h832c17.632 0 32 14.336 32 32v640z"></path>
      </svg>
      <svg class="server svg-icon" id="server" xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewbox="0 0 1024 1024">
        <path d="M512 0C296.192 0 64 65.056 64 208v608c0 142.88 232.192 208 448 208 215.776 0 448-65.12 448-208V208C960 65.056 727.744 0 512 0zm384 816c0 79.488-171.936 144-384 144-212.096 0-384-64.512-384-144V696.448C194.112 764.576 353.6 800 512 800s317.888-35.424 384-103.552V816zm0-192h-.128c0 .32.128.672.128.992C896 704 724.064 768 512 768s-384-64-384-143.008c0-.32.128-.672.128-.992H128V504.448C194.112 572.576 353.6 608 512 608s317.888-35.424 384-103.552V624zm0-192h-.128c0 .32.128.672.128.992C896 512 724.064 576 512 576s-384-64-384-143.008c0-.32.128-.672.128-.992H128V322.048C211.872 385.952 365.6 416 512 416s300.128-30.048 384-93.952V432zm-384-80c-212.096 0-384-64.512-384-144 0-79.552 171.904-144 384-144 212.064 0 384 64.448 384 144 0 79.488-171.936 144-384 144zm256 480c0-17.673 14.327-32 32-32s32 14.327 32 32c0 17.673-14.327 32-32 32s-32-14.327-32-32zm0-192c0-17.673 14.327-32 32-32s32 14.327 32 32c0 17.673-14.327 32-32 32s-32-14.327-32-32zm0-192c0-17.673 14.327-32 32-32s32 14.327 32 32c0 17.673-14.327 32-32 32s-32-14.327-32-32z"></path>
      </svg>
      <div class="response" id="response">
        <div class="item">4</div>
        <div class="item">0</div>
        <div class="item">3</div>
        <div class="sparks"></div>
      </div>
    </div>

    <div class="container__title" id="container__title"
      style="display: flex; flex-direction: column; align-items: center; text-align: center;">
      Forbidden !!
      <span style="padding-top: 10px;">You are not authorized to access this</span>
    </div>



  </div>
</main>
<!-- partial -->
  <script src='https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.0/jquery.min.js'></script>
  <script>
    var computer = $('#computer'),
    response = $('#response'),
    connect = $('#connect'),
    reload = $('#reload'),
    container = $('#container'),
    containerTit = $('#container__title');

    connect.click(function() {
      $(this).toggleClass('button--disabled');
      reload.toggleClass('button--disabled');
      container.addClass('container__anim');
      container.one('webkitTtransitionEnd otransitionend msTransitionEnd transitionend', function() {
        container.addClass('container__jump');
        container.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function() {
          containerTit.addClass('container__title--anim')
        });
      });
    });

    reload.click(function() {
      $(this).toggleClass('button--disabled');
      connect.toggleClass('button--disabled');
      container.removeClass('container__anim');
      container.removeClass('container__jump');
      containerTit.removeClass('container__title--anim');
    });
  </script>

</body>
</html>

    `,
    _404_not_found_error: `
<!DOCTYPE html>
<html lang="en" >
<head>
    <meta charset="UTF-8">
    <title>Page Not Found</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <base href="//s3-us-west-2.amazonaws.com/s.cdpn.io/157670/">
    <style>
        html {
            height: 100%;
        }

        body {
            height: 100%;
            background: url("https://wallpapercave.com/wp/6SLzBEY.jpg") no-repeat left top;
            background-size: cover;
            overflow: hidden;
            display: flex;
            flex-flow: column wrap;
            justify-content: center;
            align-items: center;
        }

        .text h1 {
            color: #011718;
            margin-top: -200px;
            font-size: 15em;
            text-align: center;
            text-shadow: -5px 5px 0px rgba(0, 0, 0, 0.7), -10px 10px 0px rgba(0, 0, 0, 0.4), -15px 15px 0px rgba(0, 0, 0, 0.2);
            font-family: monospace;
            font-weight: bold;
        }

        .text h2 {
            color: black;
            font-size: 5em;
            text-shadow: -5px 5px 0px rgba(0, 0, 0, 0.7);
            text-align: center;
            margin-top: -150px;
            font-family: monospace;
            font-weight: bold;
        }

        .text h3 {
            color: white;
            margin-left: 30px;
            font-size: 2em;
            text-shadow: -5px 5px 0px rgba(0, 0, 0, 0.7);
            margin-top: -40px;
            font-family: monospace;
            font-weight: bold;
        }

        .torch {
            margin: -150px 0 0 -150px;
            width: 200px;
            height: 200px;
            box-shadow: 0 0 0 9999em #000000f7;
            opacity: 1;
            border-radius: 50%;
            position: fixed;
            background: rgba(0, 0, 0, 0.3);
            pointer-events: none; /* Allows clicks to pass through */
        }
        .torch:after {
            content: "";
            display: block;
            border-radius: 50%;
            width: 100%;
            height: 100%;
            top: 0px;
            left: 0px;
            box-shadow: inset 0 0 40px 2px #000, 0 0 20px 4px rgba(13, 13, 10, 0.2);
        }
    </style>

    <!-- Add this inside <style> -->
    <style>
        .button-container {
            margin-top: 50px;
            text-align: center;
        }

        .glow-button {
            display: inline-block;
            padding: 12px 25px;
            font-size: 1.2em;
            font-family: monospace;
            font-weight: bold;
            text-transform: uppercase;
            text-decoration: none;
            color: #fff;
            background: #011718;
            border: 2px solid #fff;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.7);
            transition: all 0.3s ease-in-out;
            position: relative;
            overflow: hidden;
            z-index: 100; /* Ensures it's on top */
        }

        .glow-button:hover {
            background: #fff;
            color: #011718;
            border-color: #011718;
            box-shadow: 0 0 20px rgba(255, 255, 255, 1);
            transform: scale(1.1);
        }

        .glow-button:after {
            content: "";
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            background: rgba(255, 255, 255, 0.2);
            transform: scaleX(0);
            transition: transform 0.3s ease-in-out;
        }

        .glow-button:hover:after {
            transform: scaleX(1);
        }
    </style>

</head>
<body>
<!-- partial:index.partial.html -->
<div class="text">
    <h1>404</h1>
    <h2>Uh, Ohh</h2>
    <h3>Sorry we cant find what you are looking for 'cuz its so dark in here</h3>

    <!-- Add this inside <body>, below <h3> -->
    <div class="button-container">
        <button onclick="window.history.go(-1)" class="glow-button">Go Back</button>
    </div>
</div>
<div class="torch"></div>
<!-- partial -->
<script src='https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js'></script><script  src="./script.js"></script>
<script>
    $(document).mousemove(function (event) {
        $('.torch').css({
            'top': event.pageY,
            'left': event.pageX
        });
    });
</script>
</body>
</html>
    `,
    _500_internal_server_error: `
<?php

global $routes, $backend_routes;
require '../../routes.php';


@session_start();

$backend_error = "";
$logout_controller = $backend_routes["logout_controller"];



if(isset($_SESSION['internal_server_error_message']) && isset($_SESSION['internal_server_error_location'])){
    $backend_error = $_SESSION['internal_server_error_message'];
}else{
    header("Location: {$logout_controller}");
}



?>

<!DOCTYPE html>
<html lang="en" >
<head>
    <meta charset="UTF-8">
    <title>Internal Server Error</title>
    <style>
        @keyframes blink-fancy{
            0%, 25%, 28.33%, 45%, 48.33%, 51.67%, 93.33%, 96.67%{transform: scaleY(1);}
            26.67%, 46.67%, 50%, 95% {transform: scaleY(0.1);}
        }

        @keyframes flame-flicker-1{
            25% {transform: scale3d(1,1.1,1);}
            40% {transform: scale3d(1,0.8,1);}
            50% {transform: scale3d(1,1.05,1);}
            65% {transform: scale3d(1,0.75,1);}
            75% {transform: scale3d(1,1,1);}
            90% {transform: scale3d(1,1.15,1);}
        100 {transform: scale3d(1,1,1);}
        }

        @keyframes flame-flicker-2{
            15% {transform: scale3d(0.9,0.8,1);}
            33% {transform: scale3d(1.2, 0.5,1);}
            47% {transform: scale3d(0.7, 0.7,1);}
            63% {transform: scale3d(0.72, 1.1,1);}
            70% {transform: scale3d(0.65, 1,1);}
            77% {transform: scale3d(1, 0.8,1);}
            85% {transform: scale3d(0.7, 0.95,1)}
            100% {transform: scale3d(1,1,1);}
        }

        @keyframes flame-ember{
            0% {transform: translate(0, 0) rotate(0deg);}
            25% {transform: translate(10px, -25px) rotate(-45deg);}
            50% {transform: translate(0, -50px) rotate(0);}
            75% {transform: translate(-10px, -75px) rotate(45deg);}
            100% {transform: translate(0, -100px) rotate(0);}
        }

        @keyframes flame-ember-alt{
            0% {transform: translate(0, 0) rotate(0deg);}
            25% {transform: translate(-15px, -25px) rotate(45deg);}
            50% {transform: translate(0, -50px) rotate(0);}
            75% {transform: translate(10px, -75px) rotate(-45deg);}
            100% {transform: translate(0, -100px) rotate(0);}
        }

        @keyframes flame-ember-opacity{
            45% {opacity: 1;}
            100% {opacity: 0;}
        }

        @keyframes scale-pulse {
            0% {transform: scale(0.8,0.8);}
            50% {transform: scale(1.1, 1.1);}
            100% {transform: scale(0.8,0.8);}
        }

        @keyframes opacity-pulse{
            0% {opacity: 0.2;}
            50% {opacity: 0.5;}
            100% {opacity: 0.2;}
        }

        .flame-front{
            transform-origin: center bottom;
            animation: flame-flicker-1 1s ease-in-out infinite;
        }

        .flame-inner{
            transform-origin: center bottom;
            animation: flame-flicker-2 .8s ease-in-out infinite;
        }

        #flame-inner-right{animation-duration: 1s; animation-delay: -1s;}

        #flame-back{animation-direction: reverse; animation-delay: 0.5s; animation-duration: 1.6s;}

        #flame-front-right{animation-duration: 1.3s; animation-delay: 0.2s}

        .emitted-ember{
            transform-origin: center center;
            -moz-transform-origin: 485.125px 51.33px;
            animation: flame-ember 2s linear infinite, flame-ember-opacity 2s ease-out infinite;
        }

        .emitted-ember-alt{
            animation: flame-ember-alt 1.7s linear infinite, flame-ember-opacity 1.7s ease-out infinite;
        }

        .smoke{transform-origin: center center; animation: scale-pulse .7s ease-in-out infinite;}

        #smoke-float-1 {animation-delay: 0.4s;}
        #smoke-float-2 {animation-delay: 0.2s;}
        #smoke-float-3 {animation-delay: 0s;}
        #smoke-float-4 {animation-delay: -0.2s;}
        #smoke-float-5 {animation-delay: -0.4s;}

        .glow{
            transform-origin: center center;
            -moz-transform-origin: 378.729px 109.75px;
            animation: opacity-pulse 4s ease-in-out infinite 0.1s, scale-pulse 4s ease-in-out alternate infinite;
        }

        #glow-outer-1{animation-delay: -0.1s;}
        #glow-inner {animation-delay: -0.3s;}

        #eyes-left, #eyes-right{
            animation: blink-fancy 6s linear infinite;
        }

        .bill-highlight{animation: opacity-pulse 4s ease-in-out infinite;}

        @keyframes blink-fancy {
            0%, 25%, 28.33%, 45%, 48.33%, 51.67%, 93.33%, 96.67% { transform: scaleY(1); }
            26.67%, 46.67%, 50%, 95% { transform: scaleY(0.1); }
        }

        @keyframes scale-pulse {
            0% { transform: scale(0.8, 0.8); }
            50% { transform: scale(1.1, 1.1); }
            100% { transform: scale(0.8, 0.8); }
        }

        body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background-color: #1e1e1e;
            color: white;
            font-family: Arial, sans-serif;
            text-align: center;
        }

        .message {
            margin-top: 20px;
            font-size: 20px;
            font-weight: bold;
        }
    </style>

</head>
<body>
<!-- partial:index.partial.html -->
<svg id="500_Bill" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-8.5 9.5 560 250">
    <defs>
        <clipPath id="circle-mask">
            <path d="M242.7 52.3c-45.4 0-82.3 36.9-82.3 82.3s36.9 82.3 82.3 82.3S325 180 325 134.6c0-45.3-36.9-82.3-82.3-82.3zm186 0c-45.4 0-82.3 36.9-82.3 82.3s36.9 82.3 82.3 82.3S511 180 511 134.6c0-45.3-36.9-82.3-82.3-82.3z"/>
        </clipPath>
        <clipPath id="flame-mask">
            <path d="M451 37.4h48.2V93H451z"/>
        </clipPath>
        <rect id="ember-temp" x="483" y="54" width="5" height="5" fill="#fb6a4f" />
        <path id="ember-emit" fill="#FB6A4F" d="M485.128 48.46l2.828 2.83-2.828 2.827-2.828-2.828z"/>
    </defs>
    <path id="Five" fill="#263D52" d="M88.1 109.9c16.5 0 29.6 4.6 39.3 13.9 9.7 9.2 14.6 21.9 14.6 38 0 19-5.9 33.7-17.6 43.9-11.7 10.2-28.5 15.3-50.3 15.3-19 0-34.3-3.1-45.9-9.2v-31.1c6.1 3.3 13.3 5.9 21.4 8 8.2 2.1 15.9 3.1 23.2 3.1 22 0 33-9 33-27 0-17.2-11.4-25.7-34.1-25.7-4.1 0-8.7.4-13.6 1.2-5 .8-9 1.7-12.1 2.6l-14.3-7.7L38 48.3h92.4v30.5H69.5l-3.1 33.4 4.1-.8c4.7-1 10.6-1.5 17.6-1.5z"/>
    <g id="BG-Bill">
        <path id="Bg-Bill-Blue" fill="#2C495E" d="M242.7 219c-46.5 0-84.3-37.8-84.3-84.3s37.8-84.3 84.3-84.3S327 88.2 327 134.7 289.2 219 242.7 219z"/>
        <path fill="#27424F" d="M242.7 57.3c44.6 0 80.9 35.5 82.3 79.8 0-.8.1-1.7.1-2.5 0-45.5-36.9-82.3-82.3-82.3s-82.3 36.9-82.3 82.3c0 .8 0 1.7.1 2.5 1.1-44.2 37.4-79.8 82.1-79.8z" id="Bg-Bill-Innershadow" opacity=".5"/>
        <path id="Bg-Bill-Outline" fill="#263D52" d="M242.7 52.3c45.5 0 82.3 36.9 82.3 82.3S288.1 217 242.7 217s-82.3-36.9-82.3-82.3 36.8-82.4 82.3-82.4m0-4c-47.6 0-86.3 38.7-86.3 86.3s38.7 86.3 86.3 86.3c47.6 0 86.3-38.7 86.3-86.3s-38.7-86.3-86.3-86.3z"/>
    </g>
    <g id="BG-Tower">
        <path id="BG-Rack-Blue" fill="#2C495E" d="M428.7 219c-46.5 0-84.3-37.8-84.3-84.3s37.8-84.3 84.3-84.3S513 88.2 513 134.7 475.2 219 428.7 219z"/>
        <path id="BG-Rack-Outline" fill="#263D52" d="M428.7 52.3c45.5 0 82.3 36.9 82.3 82.3S474.1 217 428.7 217s-82.3-36.9-82.3-82.3 36.8-82.4 82.3-82.4m0-4c-47.6 0-86.3 38.7-86.3 86.3s38.7 86.3 86.3 86.3c47.6 0 86.3-38.7 86.3-86.3s-38.7-86.3-86.3-86.3z"/>
    </g>
    <g id="light-glow" clip-path="url(#circle-mask)">
        <path display="none" fill="none" d="M242.7 52.3c-45.4 0-82.3 36.9-82.3 82.3s36.9 82.3 82.3 82.3S325 180 325 134.6c0-45.3-36.9-82.3-82.3-82.3z"/>
        <path id="glow-outer-2" class="glow" opacity=".25" fill="#FF8D8D" d="M378.7 198.2c-48.8 0-88.5-39.7-88.5-88.5s39.7-88.5 88.5-88.5 88.5 39.7 88.5 88.5-39.7 88.5-88.5 88.5z"/>
        <circle id="glow-outer-1" class="glow" opacity=".35" fill="#F00" cx="378.7" cy="109.8" r="55.2"/>
        <circle id="glow-inner" class="glow" opacity=".35" fill="#F00" cx="378.7" cy="109.8" r="28.3"/>
    </g>
    <g id="Bill">
        <path id="Body" fill="#263D52" d="M218.5 199c-7 0-13.3 2.9-17.8 7.5 12.3 7.3 26.7 11.5 42 11.5 15.4 0 29.9-4.3 42.2-11.7-4.6-4.5-10.8-7.3-17.7-7.3h-48.7z"/>
        <g id="Neck">
            <path id="Neck-fill" fill="#FFF" d="M242.5 169c-8 0-14.5 6.5-14.5 14.5v15c0 8 6.5 14.5 14.5 14.5s14.5-6.5 14.5-14.5v-15c0-8-6.5-14.5-14.5-14.5z"/>
            <path id="Neck-outline" fill="#263D52" d="M242.5 214c-8.5 0-15.5-7-15.5-15.5v-15c0-8.5 7-15.5 15.5-15.5s15.5 7 15.5 15.5v15c0 8.5-7 15.5-15.5 15.5zm0-44c-7.4 0-13.5 6.1-13.5 13.5v15c0 7.4 6.1 13.5 13.5 13.5s13.5-6.1 13.5-13.5v-15c0-7.4-6.1-13.5-13.5-13.5z"/>
            <path fill="#E4ECF3" d="M229.1 199.7c4.5 1.3 9.3 1.9 14.4 1.7 4.4-.1 8.6-.8 12.5-2v-1.3l-.1-3.7c-4 1.2-8.2 1.9-12.6 2.1-5.1.2-9.9-.5-14.4-1.7l.1 4.2c0 .2.1.5.1.7z" id="Neck-Innershadow"/>
        </g>
        <g id="Ears">
            <g id="Ear-right">
                <path id="Ear-fill-right" fill="#B6CFD8" d="M281.8 142.2c-5.5 0-9.9-4.4-9.9-9.9s4.4-9.9 9.9-9.9 9.9 4.4 9.9 9.9-4.5 9.9-9.9 9.9z"/>
                <path id="Ear-fill-highlight" class="bill-highlight" fill="#F00" fill-opacity="0.7" d="M281.8 142.2c-5.5 0-9.9-4.4-9.9-9.9s4.4-9.9 9.9-9.9 9.9 4.4 9.9 9.9-4.5 9.9-9.9 9.9z"/>
                <path id="Ear-outline-right" fill="#263D52" d="M281.8 123.3c4.9 0 8.9 4 8.9 8.9s-4 8.9-8.9 8.9-8.9-4-8.9-8.9 3.9-8.9 8.9-8.9m0-2c-6 0-10.9 4.9-10.9 10.9s4.9 10.9 10.9 10.9 10.9-4.9 10.9-10.9-4.9-10.9-10.9-10.9z"/>
                <path id="Ear-outline-highlight" class="bill-highlight" fill="#F00" fill-opacity="0.7" d="M281.8 123.3c4.9 0 8.9 4 8.9 8.9s-4 8.9-8.9 8.9-8.9-4-8.9-8.9 3.9-8.9 8.9-8.9m0-2c-6 0-10.9 4.9-10.9 10.9s4.9 10.9 10.9 10.9 10.9-4.9 10.9-10.9-4.9-10.9-10.9-10.9z"/>
            </g>
            <g id="Ear-left">
                <path id="Ear-fill-left" fill="#E1EDF4" d="M201.8 142.2c-5.5 0-9.9-4.4-9.9-9.9s4.4-9.9 9.9-9.9 9.9 4.4 9.9 9.9-4.5 9.9-9.9 9.9z"/>
                <path id="Ear-outline-left" fill="#263D52" d="M201.8 123.3c4.9 0 8.9 4 8.9 8.9s-4 8.9-8.9 8.9-8.9-4-8.9-8.9 3.9-8.9 8.9-8.9m0-2c-6 0-10.9 4.9-10.9 10.9s4.9 10.9 10.9 10.9 10.9-4.9 10.9-10.9-4.9-10.9-10.9-10.9z"/>
            </g>
        </g>
        <g id="Face">
            <path id="Face-fill" fill="#F2F8FC" d="M242 184c22.6 0 41-18.3 41-40.9v-28.7c0-22.6-18.4-40.9-41-40.9s-41 18.3-41 40.9v28.7c0 22.6 18.4 40.9 41 40.9z"/>
            <path id="Face-Outline" fill="#263D52" d="M242 74.5c22 0 40 17.9 40 39.9v28.7c0 22-18 39.9-40 39.9s-40-17.9-40-39.9v-28.7c0-22 18-39.9 40-39.9m0-2c-23.2 0-42 18.8-42 41.9v28.7c0 23.1 18.8 41.9 42 41.9s42-18.8 42-41.9v-28.7c0-23.1-18.8-41.9-42-41.9z"/>
            <path id="Face-Outline-highlight" class="bill-highlight" fill="#F00" d="M242 72.5c-2.5 0-8.3.8-12.4 1.9l4.9.8c2.4-.5 4.9-.7 7.4-.7 22 0 40 17.9 40 39.9v28.7c0 22-18 39.9-40 39.9-2.6 0-5.2-.3-7.6-.7v2c2.5.5 5 .7 7.6.7 23.2 0 42-18.8 42-41.9v-28.7c.1-23.1-18.7-41.9-41.9-41.9z"/>
            <g id="Blush" fill="#E1EDF4">
                <circle id="blush-left" cx="267.5" cy="147" r="10.3"/>
                <circle id="blush-right" cx="216.5" cy="146" r="10.3"/>
            </g>
            <path id="Face-innershadow" display="none" fill="#E1EDF4" d="M242.4 74.5c2.2 0 4.2.2 6.3.5-19 3.1-33.7 19.5-33.7 39.4v28.7c0 19.8 15 36.3 33.9 39.4-2.1.3-4.5.5-6.7.5-22 0-40.2-17.9-40.2-39.9v-28.7c0-22 18.4-39.9 40.4-39.9z"/>
            <path id="Face-highlight" class="bill-highlight" fill="#F00" fill-opacity=".15" d="M241.5 74.5c-2.2 0-4.2.2-6.3.5 19 3.1 33.7 19.5 33.7 39.4v28.7c0 19.8-15 36.3-33.9 39.4 2.1.3 4.5.5 6.7.5 22 0 40.2-17.9 40.2-39.9v-28.7c0-22-18.4-39.9-40.4-39.9z"/>
        </g>
        <g id="Eyes" fill="#263D52">
            <circle id="eyes-left" style="transform-origin: 228.391px 126.333px" cx="228.4" cy="126.3" r="5.9"/>
            <circle id="eyes-right" style="transform-origin:266.289px 126.333px " cx="266.3" cy="126.3" r="5.9"/>
        </g>
        <path id="unibrow" fill="#263D52" d="M271 122h-57c-.6 0-1-.4-1-1s.4-1 1-1h57c.6 0 1 .4 1 1s-.4 1-1 1z"/>
        <g id="facial-hair">
            <path fill="#263D52" d="M284.2 121.7l-1.2.1-1.3 19.6c0 6.6-3.1 12.7-10.2 12.7H221 213.4c-7.1 0-11.2-6.2-11.2-12.8l-.2-19.8h-2c-.6 7-2 27.4-2 32.9 0 23.3 19.4 42.1 44.5 42.1s44.5-18.7 44.5-42c0-5.5-2.2-25.8-2.8-32.8z" id="beard-lower"/>
            <path fill="#263D52" d="M200.9 121.7h1.2l1.3 19.6c0 6.6 3.1 12.7 10.2 12.7h3.4v.4c0 20.3 14.6 37.1 35 41.1-3 .6-6.2.9-9.5.9-25.1 0-44.5-18.7-44.5-42 0-5.4 2.3-25.7 2.9-32.7z" id="beard-innershadow" display="none"/>
            <path id="moustache" fill="#263D52" d="M221 154c3-7 9.1-11.3 16.1-13 .9 2.1 3 3.4 5.5 3.4s4.5-1.3 5.3-3.4c7.1 1.6 13.1 6 16.1 13v1h-43v-1z"/>
            <path opacity=".3" fill="#F00" d="M284.2 121.7H283l-1.3 19.6c0 6.6-3.1 12.7-10.2 12.7H268v.4c0 20.3-14.6 37.1-35 41.1 3 .6 6.2.9 9.5.9 25.1 0 44.5-18.7 44.5-42 0-5.4-2.2-25.7-2.8-32.7z" id="beard-highlight" class="bill-highlight" fill-opacity="0.7"/>
        </g>
        <path fill="#263D52" d="M288.5 116.6h-3c-.3 0-.5.2-.5.5s.2.5.5.5h3c.3 0 .5-.2.5-.5s-.2-.5-.5-.5zm0-4l-3 .1c-.3 0-.4.2-.4.5s.2.5.5.5l3-.1c.3 0 .5-.2.5-.5-.1-.3-.3-.5-.6-.5zm-.3-3.4c.3 0 .5-.3.4-.6 0-.3-.3-.5-.6-.4l-3 .3c-.3 0-.5.3-.4.6 0 .3.3.5.6.4l3-.3zm-.2-4.9c-.1-.3-.3-.5-.6-.4l-3 .6c-.3.1-.4.3-.4.6.1.3.3.4.6.4l3-.6c.3 0 .4-.3.4-.6zm-1.1-4.2c-.1-.3-.4-.4-.6-.3l-2.9.9c-.3.1-.4.4-.3.6.1.3.4.4.6.3l2.9-.9c.2 0 .4-.3.3-.6zm-1.4-4c-.1-.3-.4-.4-.7-.3L282 97c-.3.1-.4.4-.3.7.1.3.4.4.7.3l2.8-1.2c.3-.1.4-.4.3-.7zm-1.8-3.8c-.1-.3-.4-.3-.7-.2l-2.7 1.4c-.2.1-.3.4-.2.7.1.2.4.3.7.2l2.7-1.4c.2-.2.3-.5.2-.7zm-2.1-3.7c-.2-.2-.5-.3-.7-.2l-2.6 1.6c-.2.1-.3.5-.2.7.1.2.5.3.7.2l2.6-1.6c.3-.2.3-.5.2-.7zm-2.4-3.4c-.2-.2-.5-.3-.7-.1l-2.4 1.9c-.2.2-.3.5-.1.7.2.2.5.3.7.1l2.4-1.9c.2-.2.2-.5.1-.7zm-2.8-3.2c-.2-.2-.5-.2-.7 0l-2.2 2.1c-.2.2-.2.5 0 .7.2.2.5.2.7 0l2.2-2.1c.2-.2.2-.5 0-.7zm-2.9-3c-.2-.2-.5-.2-.7 0l-2 2.3c-.2.2-.2.5 0 .7.2.2.5.2.7 0l2-2.3c.2-.2.2-.5 0-.7zm-3.3-2.7c-.2-.2-.5-.1-.7.1l-1.8 2.4c-.2.2-.1.5.1.7.2.2.5.1.7-.1l1.8-2.4c.2-.2.2-.5-.1-.7zm-3.4-2.3c-.2-.2-.6-.1-.7.2l-1.6 2.6c-.1.2-.1.5.2.7.2.1.5.1.7-.2l1.6-2.6c.1-.3 0-.6-.2-.7zm-3.7-2.1c-.3-.1-.6 0-.7.2l-1.4 2.7c-.1.2 0 .5.2.7.2.1.5 0 .7-.2l1.4-2.7c.1-.3 0-.6-.2-.7zm-3.9-1.7c-.3-.1-.6 0-.7.3l-1.1 2.8c-.1.3 0 .5.3.6.3.1.5 0 .6-.3l1.1-2.8c.2-.3.1-.5-.2-.6zm-4-1.4c-.3-.1-.6.1-.6.3l-.9 2.9c-.1.3.1.5.3.6.3.1.5-.1.6-.3l.9-2.9c.1-.3-.1-.6-.3-.6zm-4.2-1.1c-.3-.1-.5.1-.6.4l-.6 3c-.1.3.1.5.4.6.3.1.5-.1.6-.4l.6-3c0-.2-.2-.5-.4-.6zm-4.4-.7c-.3 0-.5.2-.6.5l-.3 3c0 .3.2.5.4.5.3 0 .5-.1.5-.4l.3-3c.2-.3 0-.6-.3-.6zm-4.4 0c-.3 0-.5.2-.5.5v3c0 .3.2.5.5.5s.5-.2.5-.5v-3.1c0-.2-.3-.4-.5-.4zm-4.5 0c-.3 0-.5.3-.5.6l.3 3c0 .3.3.4.5.4.3 0 .5-.2.5-.5l-.3-3c0-.3-.2-.5-.5-.5zm-4.4.7c-.3.1-.5.3-.4.6l.6 3c0 .3.3.5.6.4.3 0 .5-.3.4-.6l-.6-3c0-.3-.3-.5-.6-.4zm-3.6 1.3c-.1-.3-.4-.4-.6-.3-.3.1-.4.4-.3.6l.8 2.9c.1.3.4.4.6.3.3-.1.4-.4.3-.6l-.8-2.9zm-4 1.3c-.1-.3-.4-.4-.6-.3-.3.1-.4.4-.3.6l1.1 2.8c.1.3.4.4.6.3.3-.1.4-.4.3-.6l-1.1-2.8zm-3.9 1.6c-.1-.2-.4-.3-.7-.2-.2.1-.3.4-.2.7l1.3 2.7c.1.2.4.3.7.2.2-.1.3-.4.2-.7l-1.3-2.7zm-3.7 2c-.1-.2-.5-.3-.7-.2-.2.1-.3.5-.2.7l1.6 2.6c.1.2.5.3.7.2.2-.1.3-.5.2-.7l-1.6-2.6zm-3.5 2.3c-.2-.2-.5-.3-.7-.1-.2.2-.3.5-.1.7l1.8 2.4c.2.2.5.3.7.1.2-.2.3-.5.1-.7l-1.8-2.4zm-3.2 2.6c-.2-.2-.5-.2-.7 0-.2.2-.2.5 0 .7l2 2.3c.2.2.5.2.7 0 .2-.2.2-.5 0-.7l-2-2.3zm-3 2.8c-.2-.2-.5-.2-.7 0-.2.2-.2.5 0 .7l2.2 2.1c.2.2.5.2.7 0 .2-.2.2-.5 0-.7l-2.2-2.1zm-2.8 3.1c-.2-.2-.5-.1-.7.1-.2.2-.1.5.1.7l2.4 1.9c.2.2.5.1.7-.1.2-.2.1-.5-.1-.7l-2.4-1.9zm.1 5l-2.5-1.7c-.2-.2-.5-.1-.7.1-.2.2-.1.5.1.7l2.5 1.7c.2.2.5.1.7-.1.2-.2.2-.5-.1-.7zm-2 3.4l-2.7-1.4c-.2-.1-.5 0-.7.2-.1.2 0 .5.2.7l2.7 1.4c.2.1.5 0 .7-.2.1-.3.1-.6-.2-.7zm-1.7 3.5l-2.8-1.2c-.3-.1-.5 0-.7.3-.1.3 0 .5.3.7l2.8 1.2c.3.1.5 0 .7-.3.1-.3-.1-.6-.3-.7zm-1.4 3.7l-2.9-.9c-.3-.1-.5.1-.6.3-.1.3.1.5.3.6l2.9.9c.3.1.5-.1.6-.3.1-.2-.1-.5-.3-.6zm-1.1 3.8l-3-.6c-.3-.1-.5.1-.6.4-.1.3.1.5.4.6l3 .6c.3.1.5-.1.6-.4.1-.2-.1-.5-.4-.6zm-.7 4l-3-.4c-.3 0-.5.2-.6.4 0 .3.2.5.4.6l3 .4c.3 0 .5-.2.6-.4.1-.3-.1-.5-.4-.6zm-.3 4.1l-3-.1c-.3 0-.5.2-.5.5s.2.5.5.5l3 .1c.3 0 .5-.2.5-.5 0-.2-.2-.5-.5-.5zm0 4.1h-3.1c-.3 0-.4.2-.4.5s.2.5.5.5h3c.3 0 .5-.2.5-.5s-.2-.5-.5-.5z" id="Hair_2_"/>
        <path id="body-highlight" class="bill-highlight" fill="none" stroke="#F00" stroke-width="2" stroke-linejoin="round" stroke-miterlimit="10" stroke-opacity=".3" d="M257.2 194.2l-.2 5.8h13c6.4 0 14 6.9 14 6.9"/>
    </g>
    <g id="tower" clip-path="url(#circle-mask)">
        <path id="tower-outer-fill" fill="#F2F8FC" d="M396.5 48.3H530V228H396.5z"/>
        <path id="tower-outer-outline" fill="#263D52" d="M531 229H395.5V47.3H531V229zm-133.5-2H529V49.3H397.5V227z"/>
        <path id="tower-inner-fill" fill="#8BA8B0" d="M514 71v157h-99V71z"/>
        <path id="tower-inner-outline" fill="#2D495E" d="M515 228H414V70h101v158zm-99-2h97V72h-97v154z"/>
        <path id="tower-mount-fill" fill="#CCD7DC" d="M415.8 48.3h23.7v11.8h-23.7z"/>
        <path id="tower-mount-outline" fill="#2D495E" d="M439.5 61.1h-23.7c-.6 0-1-.4-1-1V48.3c0-.6.4-1 1-1h23.7c.6 0 1 .4 1 1v11.8c0 .6-.4 1-1 1zm-22.7-2h21.7v-9.8h-21.7v9.8z"/>
        <g id="Rack-three">
            <path fill="#E7EDEF" stroke="#2D495E" stroke-width="2" stroke-miterlimit="10" d="M415.1 177H514v32.2h-98.9z"/>
            <circle fill="#E7EDEF" stroke="#255B6C" stroke-width="2" stroke-miterlimit="10" cx="433.5" cy="193.1" r="5.8"/>
            <path fill="#2D495E" d="M415.1 209.2h18.4v5.8h-18.4z"/>
            <path fill="#195063" d="M465.7 186.2h2.3V200h-2.3zM472.6 186.2h2.3V200h-2.3z"/>
            <path fill="#0DB58A" d="M479.5 186.2h2.3V200h-2.3zM486.4 186.2h2.3V200h-2.3zM493.3 186.2h2.3V200h-2.3z"/>
            <path fill="#8E8E8E" d="M500.2 186.2h2.3V200h-2.3z"/>
        </g>
        <g id="Rack-two">
            <path fill="#E7EDEF" stroke="#2D495E" stroke-width="2" stroke-miterlimit="10" d="M415.1 135.1H514v32.2h-98.9z"/>
            <circle fill="#E7EDEF" stroke="#2D495E" stroke-width="2" stroke-miterlimit="10" cx="497.5" cy="151.2" r="5.8"/>
            <path fill="#0DB58A" d="M448.4 145.4h16.1v2.3h-16.1z"/>
            <path fill="#195063" d="M427.7 145.4h16.1v2.3h-16.1zM427.7 150h36.8v2.3h-36.8z"/>
            <path fill="#00B284" d="M427.7 154.6h2.3v2.3h-2.3zM432.3 154.6h2.3v2.3h-2.3z"/>
            <path fill="#0DB58A" d="M436.9 154.6h2.3v2.3h-2.3zM441.5 154.6h2.3v2.3h-2.3zM446.1 154.6h2.3v2.3h-2.3z"/>
            <path fill="#195063" d="M450.7 154.6h9.2v2.3h-9.2z"/>
            <path fill="#00B284" d="M462.2 154.6h2.3v2.3h-2.3z"/>
        </g>
        <g id="Rack-one">
            <path fill="#E7EDEF" stroke="#2D495E" stroke-width="2" stroke-miterlimit="10" d="M415.1 94.1H514v32.2h-98.9z"/>
            <path fill="#B9CAD0" d="M416.2 95.2h3.3v30.1h-3.3z"/>
            <circle fill="#E7EDEF" stroke="#2D495E" stroke-width="2" stroke-miterlimit="10" cx="433.5" cy="110.2" r="5.8"/>
            <path fill="#00B284" d="M465.7 103.3h2.3v13.8h-2.3zM472.6 103.3h2.3v13.8h-2.3z"/>
            <path fill="#195063" d="M479.5 103.3h2.3v13.8h-2.3z"/>
            <path fill="#00B284" d="M486.4 103.3h2.3v13.8h-2.3z"/>
            <path fill="#195063" d="M493.3 103.3h2.3v13.8h-2.3zM500.2 103.3h2.3v13.8h-2.3z"/>
        </g>
    </g>
    <g id="lamp">
        <path id="lamp-outer" fill="#F00" d="M378.3 97.9h7.8V119h-7.8c-5.8 0-10.6-4.8-10.6-10.6 0-5.7 4.8-10.5 10.6-10.5z"/>
        <path id="lamp-inner" fill="#FF4E1F" d="M377.5 103.5h7.6v10h-7.6c-2.8 0-5-2.2-5-5 0-2.7 2.2-5 5-5z"/>
        <path id="lamp-base-fill" fill="#8BA8B0" d="M386.1 90.7h10.3v35.7h-10.3z"/>
        <path id="lamp-base-outline" fill="#263D52" d="M396.4 127.3h-10.3c-.6 0-1-.4-1-1V90.7c0-.6.4-1 1-1h10.3c.6 0 1 .4 1 1v35.7c0 .5-.5.9-1 .9zm-9.3-2h8.3V91.7h-8.3v33.6z"/>
        <path id="lamp-cover-fill" fill="#FFF" fill-opacity=".1" d="M378.3 125c-9.1 0-16.6-7.4-16.6-16.5S369.2 92 378.3 92h7.7v33h-7.7z"/>
        <path id="lamp-cover-outline" fill="#263D52" d="M387 126h-8.7c-9.7 0-17.6-7.9-17.6-17.5S368.6 91 378.3 91h8.7v35zm-8.7-33c-8.6 0-15.6 7-15.6 15.5s7 15.5 15.6 15.5h6.7V93h-6.7z"/>
    </g>
    <g id="smokes" fill="#D5DADB">
        <use xlink:href="#ember-emit" class="emitted-ember"/>
        <use xlink:href="#ember-emit" class="emitted-ember emitted-ember-alt" style="animation-delay: -0.5s"/>
        <use xlink:href="#ember-emit" class="emitted-ember" style="animation-delay: -0.7s;"/>
        <use xlink:href="#ember-emit" class="emitted-ember emitted-ember-alt" style="animation-delay: -1s"/>
        <circle id="smoke-base-1" class="smoke" style="animation-delay: -0.2s; -moz-transform-origin:464.3px 78.4px;" cx="464.3" cy="78.4" r="11.3"/>
        <circle id="smoke-base-3" class="smoke" style="animation-delay: -0.1s; -moz-transform-origin:492.9px 83.8px;" cx="492.9" cy="83.8" r="8.6"/>
        <circle id="smoke-base-2" style="-moz-transform-origin:480px 70.4px;" class="smoke" cx="480" cy="70.4" r="8"/>
        <circle id="smoke-float-2" style="-moz-transform-origin:464.9px 53.3px;" class="emitted-ember" fill-opacity=".8" cx="464.9" cy="53.3" r="5.4"/>
        <circle id="smoke-float-1" style="-moz-transform-origin: 469.4px 62.3px;" class="emitted-ember emitted-ember-alt" fill-opacity=".8" cx="469.4" cy="62.3" r="7.6"/>
        <circle id="smoke-float-3" style="-moz-transform-origin: 471.1px 47.9px;" class="emitted-ember" fill-opacity=".8" cx="471.1" cy="47.9" r="4.5"/>
        <circle id="smoke-float-5" style="-moz-transform-origin:470.4px 28.2;" class="emitted-ember" fill-opacity=".3" cx="470.4" cy="28.2" r="2.5"/>
        <circle id="smoke-float-4" style="-moz-transform-origin: 467.2px 36.3px;" class="emitted-ember emitted-ember-alt" fill-opacity=".6" cx="467.2" cy="36.3" r="3.2"/>
    </g>
    <g id="fire" clip-path="url(#flame-mask)">
        <path id="flame-back" style="-moz-transform-origin: 470.729px 93px;" class="flame-front" fill="#D14D40" d="M456.3 93l14-24.8L485.1 93z"/>
        <path id="flame-front-left" style="-moz-transform-origin:462.55px 93px;" class="flame-front" fill="#FB6A4F" d="M458.7 79l-5.2 14h18.1z"/>
        <path id="flame-front-right" style="-moz-transform-origin: 479.162px 93px;" class="flame-front anim-delay-1" fill="#FB6A4F" d="M497 93l-9.2-35.5L461.3 93z"/>
        <path id="flame-inner-left" style="-moz-transform-origin:461.677px 97px;"  class="flame-inner" fill="#FFD657" d="M456.7 97l5.8-12.4 4.1 12.4z"/>
        <path id="flame-inner-right" style="-moz-transform-origin: 476.268px 97px;" class="flame-inner" fill="#FFD657" d="M492.1 97L484 77.3 460.4 97z"/>
    </g>

</svg>
<!-- partial -->
<!-- Error message below SVG -->
<div class="message">Something went wrong! At<br>
    <span style="color: #ff2e00; "><?php echo $_SESSION['internal_server_error_location']; ?></span>. <br>
    <p>Issue : <span style="color: #ff2e00;"><?php echo $backend_error; ?></span></p>

</div>

</body>
</html>
    `,
    _database_error: `
<?php

global $routes, $backend_routes;
require '../../routes.php';


@session_start();

$database_error = "";
$logout_controller = $backend_routes["logout_controller"];



if(isset($_SESSION['database_error']) && isset($_SESSION['error_location'])){
    $database_error = $_SESSION['database_error'];
}else{
    header("Location: {$logout_controller}");
}



?>

<!DOCTYPE html>
<html lang="en" >
<head>
    <meta charset="UTF-8">
    <title>Error</title>
    <link rel="stylesheet" href="../css/database_error/style.css">


</head>
<body>
<!-- partial:index.partial.html -->
<div class="container">
    <div class="error">
        <h1>500</h1>
        <h2>error</h2>
        <p><b>Ohh No! <span style="color: #ff2e00; "><?php echo $_SESSION['error_location']; ?></span> issue. Call your Software Engineer immediately.</b> <br><br> Issue : <p style="color: #ff2e00;"><?php echo $database_error; ?></p></p>
    </div>
    <div class="stack-container">
        <div class="card-container">
            <div class="perspec" style="--spreaddist: 125px; --scaledist: .75; --vertdist: -25px;">
                <div class="card">
                    <div class="writing">
                        <div class="topbar">
                            <div class="red"></div>
                            <div class="yellow"></div>
                            <div class="green"></div>
                        </div>
                        <div class="code">
                            <ul>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="card-container">
            <div class="perspec" style="--spreaddist: 100px; --scaledist: .8; --vertdist: -20px;">
                <div class="card">
                    <div class="writing">
                        <div class="topbar">
                            <div class="red"></div>
                            <div class="yellow"></div>
                            <div class="green"></div>
                        </div>
                        <div class="code">
                            <ul>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="card-container">
            <div class="perspec" style="--spreaddist:75px; --scaledist: .85; --vertdist: -15px;">
                <div class="card">
                    <div class="writing">
                        <div class="topbar">
                            <div class="red"></div>
                            <div class="yellow"></div>
                            <div class="green"></div>
                        </div>
                        <div class="code">
                            <ul>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="card-container">
            <div class="perspec" style="--spreaddist: 50px; --scaledist: .9; --vertdist: -10px;">
                <div class="card">
                    <div class="writing">
                        <div class="topbar">
                            <div class="red"></div>
                            <div class="yellow"></div>
                            <div class="green"></div>
                        </div>
                        <div class="code">
                            <ul>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="card-container">
            <div class="perspec" style="--spreaddist: 25px; --scaledist: .95; --vertdist: -5px;">
                <div class="card">
                    <div class="writing">
                        <div class="topbar">
                            <div class="red"></div>
                            <div class="yellow"></div>
                            <div class="green"></div>
                        </div>
                        <div class="code">
                            <ul>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="card-container">
            <div class="perspec" style="--spreaddist: 0px; --scaledist: 1; --vertdist: 0px;">
                <div class="card">
                    <div class="writing">
                        <div class="topbar">
                            <div class="red"></div>
                            <div class="yellow"></div>
                            <div class="green"></div>
                        </div>
                        <div class="code">
                            <ul>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</div>
<!-- partial -->
<script src="../js/database_error/script.js"></script>

</body>
</html>
    `,

    // view -> js -> database_error Folder Files
    script_js: `
const stackContainer = document.querySelector('.stack-container');
const cardNodes = document.querySelectorAll('.card-container');
const perspecNodes = document.querySelectorAll('.perspec');
const perspec = document.querySelector('.perspec');
const card = document.querySelector('.card');

let counter = stackContainer.children.length;

//function to generate random number
function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

//after tilt animation, fire the explode animation
card.addEventListener('animationend', function () {
    perspecNodes.forEach(function (elem, index) {
        elem.classList.add('explode');
    });
});

//after explode animation do a bunch of stuff
perspec.addEventListener('animationend', function (e) {
    if (e.animationName === 'explode') {
        cardNodes.forEach(function (elem, index) {

            //add hover animation class
            elem.classList.add('pokeup');

            //add event listner to throw card on click
            elem.addEventListener('click', function () {
                let updown = [800, -800]
                let randomY = updown[Math.floor(Math.random() * updown.length)];
                let randomX = Math.floor(Math.random() * 1000) - 1000;
                elem.style.transform = "translate(" + randomX + "px, " + randomY + "px) rotate(-540deg)";
                elem.style.transition = "transform 1s ease, opacity 2s";
                elem.style.opacity = "0";
                counter--;
                if (counter === 0) {
                    stackContainer.style.width = "0";
                    stackContainer.style.height = "0";
                }
            });

            //generate random number of lines of code between 4 and 10 and add to each card
            let numLines = randomIntFromInterval(5, 10);

            //loop through the lines and add them to the DOM
            for (let index = 0; index < numLines; index++) {
                let lineLength = randomIntFromInterval(25, 97);
                var node = document.createElement("li");
                node.classList.add('node-' + index);
                elem.querySelector('.code ul').appendChild(node).setAttribute('style', '--linelength: ' + lineLength + '%;');

                //draw lines of code 1 by 1
                if (index == 0) {
                    elem.querySelector('.code ul .node-' + index).classList.add('writeLine');
                } else {
                    elem.querySelector('.code ul .node-' + (index - 1)).addEventListener('animationend', function (e) {
                        elem.querySelector('.code ul .node-' + index).classList.add('writeLine');
                    });
                }
            }
        });
    }
});
    `,

    // view Folder Files
    Data_Provider: ``,
    Frontend_Test: ``,
    Loader: `
<div id="loadingOverlay">
    <div class="loader"></div>
</div>

<style>
    /* Full-page overlay */
    #loadingOverlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85); /* Darker semi-transparent */
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        backdrop-filter: blur(5px);
    }

    /* Modern Glow Loader */
    .loader {
        width: 70px;
        height: 70px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(0, 140, 255, 0.9) 10%, rgba(0, 140, 255, 0.4) 50%, transparent 60%);
        box-shadow: 0 0 20px rgba(0, 140, 255, 0.7), 0 0 40px rgba(0, 140, 255, 0.5);
        animation: spin 1.5s linear infinite, glow 1.5s alternate infinite ease-in-out;
    }

    /* Smooth rotation animation */
    @keyframes spin {
        0% { transform: rotate(0deg) scale(0.9); }
        100% { transform: rotate(360deg) scale(1.1); }
    }

    /* Glowing effect */
    @keyframes glow {
        0% { box-shadow: 0 0 15px rgba(0, 140, 255, 0.6), 0 0 30px rgba(0, 140, 255, 0.4); }
        100% { box-shadow: 0 0 25px rgba(0, 140, 255, 0.9), 0 0 50px rgba(0, 140, 255, 0.7); }
    }


</style>

    `,
    Login: `
<?php

global $routes, $backend_routes, $image_routes;
require '../routes.php';

$error_message = "";
$loginController_file = $backend_routes['login_controller'];
$logo = $image_routes['user_icon_background_less'];

// Message from Backend
if (isset($_GET['message'])) {
    $error_message = htmlspecialchars($_GET['message']);
    $show_backend_error_modal = true;
}

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Hospital Management System - Login</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">

    <style>
        /* General Reset */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Poppins', sans-serif;
        }

        body {
            background: radial-gradient(circle, #1a1a1a, #000000);
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            position: relative;
            overflow: hidden;
        }

        /* Glassmorphism Card */
        .wrapper {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(15px);
            box-shadow: 0px 10px 30px rgba(255, 255, 255, 0.2);
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            width: 350px;
            position: relative;
            animation: fadeIn 1.2s ease-in-out;
        }

        /* Fade In */
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }

        /* Logo */
        .logo img {
            width: 90px;
            margin-bottom: 15px;
        }

        .name {
            font-size: 24px;
            font-weight: bold;
            color: white;
            /*background: linear-gradient(135deg, #ff4b2b, #ff416c);*/
            padding: 10px;
            border-radius: 50px;
            display: inline-block;
            /*box-shadow: 0px 5px 15px rgba(255, 77, 77, 0.4);*/
        }

        /* Input Fields */
        .form-field {
            margin: 15px 0;
            display: flex;
            align-items: center;
            padding: 12px;
            border-radius: 50px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            background: rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;
            color: white;
        }

        .form-field input {
            border: none;
            background: transparent;
            outline: none;
            flex: 1;
            padding: 8px;
            color: white;
            font-size: 16px;
        }

        .form-field span {
            color: white;
            padding-left: 10px;
        }

        .form-field:focus-within {
            border-color: #ff416c;
            box-shadow: 0px 0px 15px rgba(255, 65, 108, 0.7);
        }

        /* Login Button */
        .btn {
            background: linear-gradient(135deg, #ff4b2b, #ff416c);
            color: white;
            font-size: 18px;
            font-weight: bold;
            border: none;
            border-radius: 50px;
            padding: 12px 25px;
            cursor: pointer;
            box-shadow: 0px 5px 15px rgba(255, 77, 77, 0.3);
            transition: all 0.3s ease-in-out;
            margin-top: 20px;
            width: 100%;
        }

        .btn:hover {
            background: linear-gradient(135deg, #ff2e00, #e6005c);
            box-shadow: 0px 8px 20px rgba(255, 77, 77, 0.6);
            transform: scale(1.05);
        }

        /* Register Link */
        .fs-6 {
            color: white;
            margin-top: 15px;
        }

        .fs-6 a {
            color: #ff416c;
            font-weight: bold;
            text-decoration: none;
            transition: color 0.3s;
        }

        .fs-6 a:hover {
            color: #ff2e00;
        }

        /* Validation Messages */
        /* General Alert Box */
        .alert {
            position: fixed;
            top: 20px;
            right: 20px;
            width: 350px;
            padding: 15px;
            border-radius: 12px;
            box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.2);
            display: none;
            font-family: 'Poppins', sans-serif;
            animation: fadeInSlide 0.5s ease-in-out;
        }

        /* Fade-In & Slide Animation */
        @keyframes fadeInSlide {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
        }

        /* User Input Error - Red & Bold */
        #validationModal {
            background: rgba(255, 208, 0, 0.2);
            color: white;
            border-left: 5px solid #ffcc00;
            backdrop-filter: blur(8px);
        }

        /* Backend Error - Red & Warn-Like */
        #backendValidationModal {
            background: rgba(255, 0, 0, 0.2);
            color: white;
            border-left: 5px solid #ff4b2b;
            backdrop-filter: blur(8px);
        }

        /* Close Button */
        .alert span {
            cursor: pointer;
            font-size: 20px;
            font-weight: bold;
            position: absolute;
            top: 5px;
            right: 10px;
            transition: transform 0.3s ease;
        }

        .alert span:hover {
            transform: scale(1.2);
        }

        /* Alert Text */
        .alert p {
            margin: 0;
            font-size: 16px;
            font-weight: bold;
            text-align: center;
        }


    </style>

    <script>
        function showModal(message) {
            document.getElementById("validationMessage").innerHTML = message;
            document.getElementById("validationModal").style.display = "block";
        }

        function close_modal() {
            document.getElementById("validationModal").style.display = "none";
        }

        function validateForm() {
            var email = document.getElementById("login_email").value;
            var password = document.getElementById("login_password").value;

            if (email === "") {
                showModal("Email is Required");
                return false;
            }

            if (password === "") {
                showModal("Password is Required");
                return false;
            }

            return true;
        }

        window.onload = function () {
            var errorMessage = "<?php echo addslashes($error_message); ?>";
            if (errorMessage.trim() !== "") {
                document.getElementById('backendValidationModal').style.display = 'block';
            }
        };

        function close_backend_modal() {
            document.getElementById("backendValidationModal").style.display = "none";
        }
    </script>

</head>
<body>

<!-- Validation Modal -->
<div id="validationModal" class="alert">
    <span onclick="close_modal();">&times;</span>
    <p id="validationMessage"></p>
</div>

<!-- Backend Validation Modal -->
<div id="backendValidationModal" class="alert">
    <span onclick="close_backend_modal();">&times;</span>
    <p id="backendValidationMessage"><?php echo $error_message; ?></p>
</div>

<!-- Login Form -->
<div class="wrapper">
    <div class="logo">
        <img src="<?php echo $logo;?>" alt="">
    </div>
    <div class="text-center mt-4 name">Login</div>
    <form action="<?php echo $loginController_file; ?>" method="post" id="login_form" onsubmit="return validateForm();">
        <div class="form-field">
            <span class="far fa-user"></span>
            <input type="text" name="email" id="login_email" placeholder="Email">
        </div>
        <div class="form-field">
            <span class="fas fa-key"></span>
            <input type="password" name="password" id="login_password" placeholder="Password">
        </div>
        <button class="btn">Login</button>
    </form>
    <div class="text-center fs-6">
<!--        Don't Have an Account? <a href="--><?php //echo ""; ?><!--">Register</a>-->
    </div>
</div>

</body>
</html>
    `,
    Signup_Decider: ``,


    // resource ->  database_sql -> database
    project_database_sql: ``,

    // resource -> DOCUMENTATIONS Folder Files
    Project_Details: `1. Put the user provided details in a pdf inside this folder`,
    Images_List: `
1. Mindmap  ==>  [pdf]
2. Data Flow Diagram[ Level - 0 ]  ==>  [pdf]
3. Entity Relationship Diagram  ==>  [pdf]
4. Data Flow Diagram[ Level - 1 ]  ==>  [pdf]
5. ER Diagram  ==>  [pdf]
6. logo  ==>  [png]
7. social-card  ==>  [jpg]
8. tutorial  ==> [gif]
9. Work-Flow Diagram  ==>  [pdf]
    `,
    Files_List: `
ER Diagram Design : https://dbdiagram.io/d/6654290bf84ecd1d22364c9f
ER Diagram Lucid Chart Link : https://lucid.app/lucidspark/d6b9c17c-7afe-4bd5-8b1d-e31345c20289/edit?viewport_loc=-2454%2C-1055%2C6416%2C2842%2C0_0&invitationId=inv_d22e24fd-4d28-4b66-ab9a-cdc39a4b7db8
Logo Maker : https://freelogocreator.com/
Mind-map Link : 
https://www.mindmeister.com/3297210961/car-shop-management-system

To Print it as pdf, please remember
[1] Press : ctrl + .
[2] Zoom out to fit
[3] Keep the starting of the mind map at the top-left corner of the screen
[4] To delete the extra writings/texts/lines, please use:
\t(i) https://www.sejda.com/
    
    
    `,
    Project_Manual: `After Creating the pdf of the project manual, please put inside the Documentation folder [the same location of this text file]`,

    // resource -> Folder Files
    Folder_Structure:`
|-- 📁 resource
|   |-- 📁 DOCUMENTATIONS
|   |   |-- 📁 user_story
|   |   |-- 📁 images
|   |   |-- 📁 files
|   |   |-- 📄 Project Manual.txt
|   |-- 📁 database_sql
|   |   |-- 📁 diagram
|   |   |-- 📁 database
|   |   |-- 📄 project_database_sql.sql
|-- 📁 view
|   |-- 📁 static
|   |   |-- 📁 image
|   |-- 📁 uploads
|   |-- 📁 js
|   |   |-- 📁 database_error
|   |-- 📁 css
|   |   |-- 📁 database_error
|   |-- 📁 error
|   |   |-- 📄 _500_internal_server_error.php
|   |   |-- 📄 _database_error.php
|   |   |-- 📄 _403_forbidden_error.php
|   |   |-- 📄 _404_not_found_error.php
|   |-- 📄 Login.php
|   |-- 📄 Signup_Decider.php
|   |-- 📄 Loader.php
|   |-- 📄 Data_Provider.php
|   |-- 📄 Frontend_Test.php
|-- 📁 controller
|   |-- 📄 TestController.php
|   |-- 📄 LogoutController.php
|   |-- 📄 LoginController.php
|-- 📁 model
|   |-- 📄 userRepo.php
|   |-- 📄 db_connect.php
|   |-- 📄 CalculationRepo.php
|-- 📄 Project Description.html
|-- 📄 README.md
|-- 📄 routes.php
|-- 📄 utility_functions.php
|-- 📄 .htaccess
|-- 📄 index.php
|-- 📄 LICENSE
    `,













};

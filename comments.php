<!DOCTYPE html>
<html>
<head>
	<title>PHP File</title>
</head>
<body>
	<h1>PHP Send</h1>

<?php
$servername = "localhost";
$username = "kthaokar";
$password = "kthaokar!";
$dbName = "CISC2500";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbName);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

$name = filter_input(INPUT_POST, 'name');
$email = filter_input(INPUT_POST, 'email');
$comment = filter_input(INPUT_POST, 'comments');

$sql = "INSERT INTO Cyber_Comments (name, email, comment) VALUES ('$name', '$email','$comment')";

/*$sql = "INSERT INTO account (username, password)
values ('$FirstName','$LastName','$SchoolName','$Address','$Major')";*/

/*if ($conn->query($sql) === TRUE) {
  echo "New record created successfully";
} else {
  echo "Error: " . $sql . "<br>" . $conn->error;
}*/

$conn->close();
?>

</body>
</html>
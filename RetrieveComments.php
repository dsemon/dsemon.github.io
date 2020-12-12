<!DOCTYPE html>
<html>
<head>
	<title>Comment Section</title>
</head>
<body>

<h1> User Comments: </h1>

<?php
         $dbhost = 'localhost:3306';
         $dbuser = 'kthaokar';
         $dbpass = 'kthaokar!';
         $dbname = 'CISC2500';
         
         $conn = mysqli_connect($dbhost, $dbuser, $dbpass,$dbname);
   
         if(! $conn ) {
            die('Could not connect: ' . mysqli_error());
         }
         echo 'Connected successfully<br>';
         $sql = 'SELECT name,email,comment FROM Cyber_Comments';
         $result = mysqli_query($conn, $sql);
echo mysqli_num_rows($result);
         if (mysqli_num_rows($result) > 0) {
             echo "<table border='1'>

<tr>

<th>Name</th>

<th>Email</th>

<th>Comment</th>

</tr>";
            while($row = mysqli_fetch_assoc($result)) {
                echo "<tr>";

  echo "<td>" . $row['name'] . "</td>";
  echo "<td>" . $row['email'] . "</td>";
  echo "<td>" . $row['comment'] . "</td>";
  echo "</tr>";
                
            }
             echo "</table>";
         } else {
            echo "0 results";
         }
         mysqli_close($conn);
      ?>
<br>
      <h2> Leave your own comment below!</h2>
</body>
</html>
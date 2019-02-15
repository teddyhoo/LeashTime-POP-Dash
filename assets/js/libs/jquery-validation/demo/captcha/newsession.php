<?php

// Include the random string file
require '../../../../../../petowner/assets/js/libs/jquery-validation/demo/captcha/rand.php';

// Begin a new session
session_start();

// Set the session contents
$_SESSION['captcha_id'] = $str;

?>
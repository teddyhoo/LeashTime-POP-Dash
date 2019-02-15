<? // frame-bannerless.php
// input: $windowTitle, $extraBodyStyle, $extraBodyAttributes, $excludeStylesheets
/* usage:
$windowTitle = 'xxx';
require "frame-bannerless.php";
*/
$windowTitle = isset($windowTitle) ? $windowTitle : '';
$extraBodyStyle = isset($extraBodyStyle) ? $extraBodyStyle : '';
$extraBodyAttributes = isset($extraBodyAttributes) ? $extraBodyAttributes : '';
$excludeStylesheets = isset($excludeStylesheets) ? $excludeStylesheets : false;
$customStyles = isset($customStyles) ? $customStyles : '';
$extraHeadContent = isset($extraHeadContent) ? $extraHeadContent : '';
$fullScreenMode = $_SESSION['frameLayout'] == 'fullScreenTabletView'; // || $_SESSION['staffuser'];
//if(agentIsATablet() || isMobileUserAgent()) $fullScreenMode = 'fullScreenTabletView';

$screenIsIPad = strpos($_SERVER["HTTP_USER_AGENT"], 'iPad') !== FALSE;
$screenIsIPhone = strpos($_SERVER["HTTP_USER_AGENT"], 'iPhone') !== FALSE;
if($_SESSION) {  // suppress headers when cron job is generating emails that include this file
	header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
	header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past
}

if(TRUE || !strpos($_SERVER["HTTP_USER_AGENT"], 'MSIE')) 
echo
'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">';

else echo
'<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN">'
?>
<html><!-- html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en" -->
<head> 
  <meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />
  <title><?= $windowTitle ?></title> 
	<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE8" />
  
<? if(!$excludeStylesheets) { ?>  
  <link rel="stylesheet" href="style.css" type="text/css" /> 
  <link rel="stylesheet" href="pet.css" type="text/css" />
<? }

  if($fullScreenMode || $screenIsIPad || $screenIsIPhone) { ?>  
	<meta name="format-detection" content="telephone=no">
	<meta name="format-detection" content="date=no">
	<meta name="format-detection" content="address=no">
	<meta name="format-detection" content="email=no">	
<? } 

if($customStyles) echo "
<style>
$customStyles
</style>\n";
echo $extraHeadContent;
?>
</head> 
<body style='padding:10px;font-size:0.7em;background-image:url("art/PRODUCTION_PLAIN.gif");<?= $extraBodyStyle ?>' <?= $extraBodyAttributes ?>>

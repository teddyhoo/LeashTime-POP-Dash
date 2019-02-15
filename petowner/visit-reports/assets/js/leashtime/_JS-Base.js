$(".module").prepend("<div class='module-control font-size-control'>Module: <input type='range'></div>");

$("input[type='range']").each(function() {
  var el = $(this);
  el.attr("min", 0.5);
  el.attr("max", 3.0);
  el.attr("step", 0.2);
  el.attr("value", el.parent().data("font-size-in-rem"));
})
.on("change", function() {
  $(this).closest(".module").css("font-size", $(this).val() + "rem");
});

$("#document-font-size-control")
.on("change", function() {
  $("html").css("font-size", $(this).val() + "rem");
});

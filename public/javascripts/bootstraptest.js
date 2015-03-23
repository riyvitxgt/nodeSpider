$(function() {
    $("#refreshJson").click(function() {
        $.ajax({
            type: "POST",
            dataType: "json",
            url: "Json_refreshJson.do",
            cache: false,
            data: {},
            success: function () {
                alert("success");
            }
        });
    });
});
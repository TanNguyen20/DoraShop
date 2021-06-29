$(function () {
    //Kết nối tới server socket đang lắng nghe
    var socket = io();

    //Socket nhận data và append vào giao diện
    socket.on("send", function (data) {
        console.log(data);
        $("#content-socket").append("<p class='message__container'>" + data.username + ": "+"<span class='content-message'>" + data.message + "</span>"+"</p>")
    })

    //Bắt sự kiện click gửi message
    $("#sendMessage").on('click', function () {
        var username = $('#username-socket').val();
        var message = $('#message').val();

        if (username == '' || message == '') {
            alert('Please enter name and message!!');
        } else {
            //Gửi dữ liệu cho socket
            socket.emit('send', {username: username, message: message});
            $('#message').val('');
        }
    })
    $("#message").on("keyup",function(event) {
        if(event.which===13){
            var username = $('#username-socket').val();
            var message = $('#message').val();
    
            if (username == '' || message == '') {
                alert('Please enter name and message!!');
            } else {
                //Gửi dữ liệu cho socket
                socket.emit('send', {username: username, message: message});
                $('#message').val('');
            }
        }
       
    });
})
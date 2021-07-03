$(function () {
    //Kết nối tới server socket đang lắng nghe
    var socket = io();
    //Socket nhận data và append vào giao diện
    socket.on("send", function (data) {
        var username = $('#username-socket').val();
        var objMessage={};
        if(username==data.username){
            $("#content-socket").append("<p class='message__container'>" + "<span class='content-message' style='background-color:blue;'>" + data.message + "</span> :Bạn"+"</p>"+"<br>");
        }
        else {
            $("#content-socket").append("<p class='message__container'>" + data.username + ": "+"<span class='content-message'>" + data.message + "</span>"+"</p>");
            var usernameReceive = $('#username-socket').val();
            objMessage.from=data.username;
            objMessage.to=usernameReceive;
            objMessage.content=data.message;
            // console.log(JSON.stringify(objMessage));
            socket.emit("receiver",objMessage);
        }
    })

    //Bắt sự kiện click gửi message
    $("#sendMessage").on('click', function () {
        // alert($('#content-socket')[0].scrollHeight);
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

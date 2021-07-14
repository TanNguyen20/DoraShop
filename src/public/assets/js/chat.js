$(function () {
    //Kết nối tới server socket đang lắng nghe
    var socket = io();
    //Socket nhận data và append vào giao diện
    socket.on("connect", () => {
        // console.log(socket.id);
        socket.emit("joinroom",socket.id);
      });
    socket.on("send", function (data) {
        var username = $('#username-socket').val();
        var objMessage={};
        if(username==data.username){
            $("#content-socket").append("<p class='message__container'>" + "<span class='content-message' style='background-color:blue;'>" + data.message + "</span> :Bạn"+"</p><br>");
        }
        else {
            $("#content-socket").append("<p class='message__container-1'>" + data.username + ": "+"<span class='content-message-1'>" + data.message + "</span>"+"</p><br>");
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

        if (message == '') {
            alert('Please enter message!!');
        } else {
            //Gửi dữ liệu cho socket
            socket.emit('send', {username: username, message: message});
            $('#message').val('');
        }
    })
    $("#message").on('keyup',function(event) {
        if(event.which===13){
            var username = $('#username-socket').val();
            var message = $('#message').val();
            if ( message == '\n' || message=='') {
                alert('Please enter message!!');
            } else {
                //Gửi dữ liệu cho socket
                socket.emit('send', {username: username, message: message});
                $('#message').val('');
            }
        }
       
    });
})

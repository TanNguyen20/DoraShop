$(function () {
    //Kết nối tới server socket đang lắng nghe
    var socket = io();
    //Socket nhận data và append vào giao diện
    socket.on("connect", () => {
        var url = window.location.href;
        var urlSplit =url.split('/');
        var usernameUrl = urlSplit[urlSplit.length-1];
        // console.log(socket.id);
        socket.emit("joinroom",usernameUrl);
    });
    socket.on("send", function (data) {
        var username = $('#username-socket').val();
        var objMessage={};
        var url = window.location.href;
        var urlSplit =url.split('/');
        var usernameUrl = urlSplit[urlSplit.length-1];
        var usernameReceive = $('#username-socket').val();
        // alert(JSON.stringify(username));
        if(username==data.username){
            $("#content-socket").append("<p class='message__container'>" + "<span class='content-message' style='background-color:blue;'>" + data.message + "</span> :Bạn"+"</p><br>");
            $("#content-socket").scrollTop($("#content-socket")[0].scrollHeight);
            if(data.size==1){
                if(data.username=='admin'){
                    objMessage.from=data.username;
                    objMessage.to=usernameUrl;
                    objMessage.content=data.message;
                }
                else{
                    objMessage.from=data.username;
                    objMessage.to='admin';
                    objMessage.content=data.message;
                }
                socket.emit("receiver",objMessage);
            }
        }
        else {
            $("#content-socket").append("<p class='message__container-1'>" + data.username + ": "+"<span class='content-message-1'>" + data.message + "</span>"+"</p><br>");
            $("#content-socket").scrollTop($("#content-socket")[0].scrollHeight);
            objMessage.from=data.username;
            objMessage.to=usernameReceive;
            objMessage.content=data.message;
            socket.emit("receiver",objMessage);
        }
    })

    //Bắt sự kiện click gửi message
    $("#sendMessage").on('click', function () {
        // alert($('#content-socket')[0].scrollHeight);
        var username = $('#username-socket').val();
        var message = $('#message').val();
        var url = window.location.href;
        var urlSplit =url.split('/');
        var usernameUrl = urlSplit[urlSplit.length-1];
        if (message == '') {
            alert('Please enter message!!');
        } else {
            //Gửi dữ liệu cho socket
            socket.emit('send', {username: username, message: message,usernameUrl:usernameUrl});
            $('#message').val('');
            
        }
    })
    $("#message").on('keyup',function(event) {
        var url = window.location.href;
        var urlSplit =url.split('/');
        var usernameUrl = urlSplit[urlSplit.length-1];
        if(event.which===13){
            var username = $('#username-socket').val();
            var message = $('#message').val();
            if ( message == '\n' || message=='') {
                alert('Please enter message!!');
            } else {
                //Gửi dữ liệu cho socket
                socket.emit('send', {username: username, message: message,usernameUrl:usernameUrl});
                $('#message').val('');
            }
        }
       
    });
})

$(function() {
	jqr = new Object();
	jqr.settings = new Object();
	jqr.settings.sprite_width = 16;
	jqr.settings.sprite_height = 16;
	jqr.settings.space = false;
	
	jqr.p = new Object();
	function jqrpgResetPlayer() {
	    jqr.p.face = 'd';
	    jqr.p.x = 3;
	    jqr.p.y = 3;
	    jqr.p.state = 'map';
	}
	
	jqr.map = new Object();
	jqr.map.height     = 16;
	jqr.map.width     = 16;
	jqr.map.terrain    = [
	 '01','02','03','11','11','11','11','11','11','11','11','11','11','11','11','11',
	 '01','01','00','00','11','00','00','11','11','00','00','00','00','00','00','00',
	 '01','00','00','00','11','00','00','00','00','11','00','00','00','00','00','00',
	 '01','00','00','00','00','00','00','11','00','11','00','00','00','00','00','00',
	 '01','00','00','00','00','00','00','11','00','11','11','11','11','00','00','00',
	 '00','00','00','00','00','11','11','00','00','00','00','00','11','00','00','00',
	 '00','00','00','00','00','00','00','00','00','11','00','00','00','00','00','00',
	 '00','00','00','00','00','00','00','00','00','00','00','00','00','00','00','00',
	 '00','00','00','00','00','00','00','00','00','11','00','00','00','00','00','00',
	 '00','00','00','00','00','00','00','00','00','00','00','00','11','00','00','00',
	 '00','00','00','00','00','00','00','00','00','11','00','00','00','00','00','00',
	 '00','00','00','00','00','00','00','00','00','11','00','00','00','00','00','00',
	 '00','00','00','00','00','00','00','00','00','11','00','00','11','01','01','01',
	 '00','00','00','00','00','00','00','00','00','11','11','11','00','00','00','01',
	 '00','00','00','00','00','00','00','00','00','00','00','00','00','00','00','00',
	 '00','00','00','00','00','00','00','00','00','00','00','00','00','00','00','00',
	];
	jqr.map.terrain_walkable = [
	 '00','01','02',
	];
	
	jqr.battle = new Object();
	
	jqrpgBuildMapHtml();
	jqrpgUpdateMapClasses();
	jqrpgResetPlayer();
	jqrpgBindKeys();
	
	/**
	 * only call this once
	 */
	function jqrpgBuildInterface() {
	    $('#jqrpg_wrapper').width($('#jqrpg_screen').width());
	}
	function jqrpgBuildMapHtml() {
	    $('#jqrpg_screen, #jqrpg_wrapper').height(jqr.map.height * jqr.settings.sprite_height)
	     .width(jqr.map.width * jqr.settings.sprite_width);
	    m = $('#jqrpg_map');
	    m.empty();
	    for (y = 0; y < jqr.map.height; y++) {
	        for (x = 0; x < jqr.map.width; x++) {
	            // cti = y * x; // current_tile_index
	            // <![CDATA[
	            m.append('<span>.</span>');
	            // ]]>
	        }
	    }
	}
	
	/**
	 * call this whenever enter a new screen
	 */
	function jqrpgUpdateMapClasses() {
	    for (y = 0; y < jqr.map.height; y++) {
	        for (x = 0; x < jqr.map.width; x++) {
	            cti = y * jqr.map.height + x; // current_tile_index
	            ct = $('#jqrpg_map span').eq(cti);
	            ct.removeClass()
	             .addClass('tile')
	             .addClass('tile_x' + x + 'y'+ y)
	             .addClass('tile_' + jqr.map.terrain[cti]);
	            if (y && x == 0) ct.addClass('tile_row');
	        }
	    }
	    $('#jqrpg_map').fadeIn('slow');
	}
	function jqrpgSetPlayerFace(name, new_face) {
	    $('#jqrpg_player_' + name).removeClass().addClass('jqrpg_player face_' + new_face);
	}
	function jqrpgSetPlayer(name, new_x, new_y) {
	    $('#jqrpg_player_' + name).css({
	    	'left' : new_x * jqr.settings.sprite_width,
	     	'top' : new_y * jqr.settings.sprite_height
	    });
	
	    $('#jqrpg_player_name_' + name).css({
	    	'left' : new_x * jqr.settings.sprite_width,
	     	'top' : new_y * jqr.settings.sprite_height - 20
	    });
	
	    $('#jqrpg_player_chat_' + name).css({
	    	'left' : new_x * jqr.settings.sprite_width,
			'top' : new_y * jqr.settings.sprite_height - 50
	    });
	}
	
	function jqrpgSendPlayerFace(new_face){
	    name = $("input[name='name']").val();
	    data = {'mode': 'face', 'name': name, 'face': new_face}
	    json = $.toJSON(data);
	    MyWebSocket.send(json);
	}
	
	/**
	 * key binding
	 */
	function jqrpgBindKeys() {
	    $(document).bind('keydown', 'up', function() {
	        if (jqr.p.state != 'map') return false;
	        jqrpgSendPlayerFace('u');
	        return jqrpgMovePlayer(0, -1);
	    })
	    .bind('keydown', 'Down', function() {
	        if (jqr.p.state != 'map') return false;
	        jqrpgSendPlayerFace('d');
	        return jqrpgMovePlayer(0, 1);
	    })
	    .bind('keydown', 'Left', function() {
	        if (jqr.p.state != 'map') return false;
	        jqrpgSendPlayerFace('l');
	        return jqrpgMovePlayer(-1, 0);
	    })
	    .bind('keydown', 'Right', function() {
	        if (jqr.p.state != 'map') return false;
	        jqrpgSendPlayerFace('r');
	        return jqrpgMovePlayer(1, 0);
	    })
	    .bind('keypress', 'Space', function() {
	        // if (console) console.log('space');
	        if (jqr.p.state == 'map') return false;
	        jqr.settings.space = true;
	        if (jqr.p.state == 'battle') jqrpgBattle();
	        return true;
	    });
	}
	
	/**
	 * movement
	 */
	function jqrpgMovePlayer(new_x, new_y) {
	    // if (console) console.log('x: ' + jqr.p.x + '  y: ' + jqr.p.y);
	    if (jqr.p.x + new_x + 1 > jqr.map.width
	     || jqr.p.y + new_y + 1 > jqr.map.height
	     || jqr.p.x + new_x + 1 == 0
	     || jqr.p.y + new_y + 1 == 0
	     || !jqrpgIsTileWalkable(jqr.p.x + new_x, jqr.p.y + new_y)
	    ) return;
	    jqr.p.x += new_x;    jqr.p.y += new_y;
	    
	    name = $("input[name='name']").val();
	    data = {'mode': 'move', 'name': name, 'x': jqr.p.x, 'y': jqr.p.y}
	    json = $.toJSON(data);
	    MyWebSocket.send(json);
	
	    return true;
	}
	function jqrpgIsTileWalkable(x, y) {
	    return jQuery.inArray(jqr.map.terrain[(y) * 16 + x], jqr.map.terrain_walkable) > -1;
	}
	
	/**
	 * battle
	 */
	function jqrpgGetRandomBattle() {
	    var likelihood = Math.floor(Math.random() * 6) + 1;
	    if (likelihood == 1) {
	        jqrpgBattleInit();
	    }
	}
	function jqrpgBattleInit() {
	    jqr.p.state = 'battle';
	    m = $('#jqrpg_menu');
	    m.show();
	    // <![CDATA[
	    m.html('<p>Random battle! Press [space] to continue.</p>');
	    // ]]>
	    $('#jqrpg_wrapper').css({'border-color' : '#a00'});
	}
	function jqrpgBattle() {
	    if (jqr.settings.space) {
	        jqr.settings.space = false;
	        jqrpgBattleEnd();
	    }
	}
	function jqrpgBattleEnd() {
	    jqr.p.state = 'map';
	    $('#jqrpg_wrapper').css({'border-color' : '#000'});
	    m.fadeOut('fast');
	}

	var MyWebSocket = {
	    ws : null,
	    timer : null,
	    init: function(){
	        var that = this;
	        that.connect('room1');
	    },
	    connect : function(resource) {
	        if(this.ws){
	            this.ws.close();
	        }
	        
	        this.ws = new WebSocket("ws://" + location.host + ":8000/" + resource);
	        var that = this;
	
	        this.ws.onopen = function(e) {
	            name = $("input[name='name']").val();
	            data = {'mode': 'create', 'name': name, 'x': jqr.p.x, 'y': jqr.p.y, 'face': jqr.p.face}
	            json = $.toJSON(data);
	            that.send(json);
	
	            data = {'mode':'get'}
	            json = $.toJSON(data);
	            that.send(json);
	
	            $("#login_box").hide();
	            $("#controll_box").show();
	            
	            alert('Welcome to jQMORPG!');
	        };
	
	        this.ws.onmessage = function(e) {
	            json = $.parseJSON(e.data);
	            console.log(json);
	            if(json.mode == 'move'){
	                $('#jqrpg_player_' + json.name).dequeue().animate({
	                    left: json.x * jqr.settings.sprite_width,
	                    top: json.y * jqr.settings.sprite_height
	                },
	                250,
	                function() {
	                	//jqrpgGetRandomBattle();
	                });
	
	                $('#jqrpg_player_name_' + json.name).dequeue().animate({
	                    left: json.x * jqr.settings.sprite_width,
	                    top: json.y * jqr.settings.sprite_height - 20
	                },
	                250,
	                function() {
	                     //jqrpgGetRandomBattle();
	                });
	
	                $('#jqrpg_player_chat_' + json.name).dequeue().animate({
	                    left: json.x * jqr.settings.sprite_width,
	                    top: json.y * jqr.settings.sprite_height - 50
	                },
	                250,
	                function() {
	                     //jqrpgGetRandomBattle();
	                });
	
	            }else if(json.mode == 'create'){
	                if(!$("#jqrpg_player_" + json.name).html()){
	                    tmp = $("#jqrpg_screen").html();
	                    tmp = tmp + '<span style="position:absolute;z-index:999;color:white;" class="jqrpg_player_name" id="jqrpg_player_name_' + json.name + '" style="color:white;">'+json.name+'</span>';
	                    tmp = tmp + '<span style="position:absolute;z-index:9999;color:white;display:none;" class="jqrpg_player_chat tooltip" id="jqrpg_player_chat_' + json.name + '" style="color:white;"><span class="tooltipAngle"><span class="tooltipAngleInner"></span></span></span>';
	
	                    $("#jqrpg_screen").html(tmp + '<span id="jqrpg_player_' + json.name + '">@</span></div>');
	                    jqrpgSetPlayerFace(json.name, json.face);
	                    jqrpgSetPlayer(json.name, json.x, json.y);
	                }
	            }else if(json.mode == 'face'){
	                jqrpgSetPlayerFace(json.name, json.face);
	            }else if(json.mode == 'remove'){
	                $('#jqrpg_player_' + json.name).remove();
	                $('#jqrpg_player_name_' + json.name).remove();
	            }else if(json.mode == 'message'){
	                tmp = $("#message").html();
	                tmp = tmp + "<p>" + json.name +  ": " + json.message + "</p>";
	                $("#message").html(tmp);
	                $("#message").animate({scrollTop: $("#message").attr('scrollHeight')}, 800);
	                $('#jqrpg_player_chat_' + json.name).html(json.message + '<span class="tooltipAngle"><span class="tooltipAngleInner"></span></span>').fadeIn(400).delay(5000).fadeOut(400);;
	            }
	        };
	
	        this.ws.onclose = function(e) {
	            if(that.timer) {
	                clearInterval(that.timer);
	                that.timer = null;
	            }
	
	            name = $("input[name='name']").val();
	            $(".jqrpg_player").remove();
	            $(".jqrpg_player_name").remove();
	            $("#controll_box").hide();
	            $("#login_box").show();
	            $("#message").html("");
	            
	            alert('Good bye.'); 
	        };
	
	        this.timer = setInterval(function(){
	            that.ws.send('Heartbeat');
	        }, 60000);
	    },
	
	    send: function(message){
	        if(!this.ws){
	        	return;
	        }
	        
	        if(typeof(message) == 'undefined' || message =='') {
	            alert('Please enter message.');
	            return;
	        }
	
	        this.ws.send(message);
	    },
	
	    close : function() {
	        if(this.ws) {
	            name = $("input[name='name']").val();
	            this.ws.send($.toJSON({'mode':'remove','name':name}));
	            this.ws.close();
	        }
	    }
	};
	
	$("input[name='login']").click(function(){
	    name = window.prompt("Enter nickname.");
	    if(name && name !=  "null"){
	       if(!name.match( /[^A-Za-z0-9\s.-]+/ )){
	           $("input[name='name']").val(name);
	           MyWebSocket.init();
	       }else{
	           alert("Please use only alphanumeric character.");
	       }
	    }
	});
	
	$("input[name='logout']").click(function(){
	    MyWebSocket.close();
	});
	
	$("input[name='send']").click(function(){
	    name = $("input[name='name']").val();
	    message = $("input[name='message']").val();
	    MyWebSocket.send($.toJSON({'mode': 'message', 'message': message, 'name': name}));
	    $("input[name='message']").val('');
	});
	
	$("input[name='logout']").hide(true);
	$("#chat").hide(true);
	
	$('form').submit(function(){
	    return false;
	});
	
	$("input[name='chat']").click(function(){
	    message = window.prompt("Enter message.");
	    if(message){
	        name = $("input[name='name']").val();
	        MyWebSocket.send($.toJSON({'mode': 'message', 'message': message, 'name': name}));
	    }
	});
	
	$("input[name='up']").click(function(){
	    if (jqr.p.state != 'map') return false;
	    jqrpgSendPlayerFace('u');
	    return jqrpgMovePlayer(0, -1);
	});
	
	$("input[name='down']").click(function(){
	    if (jqr.p.state != 'map') return false;
	    jqrpgSendPlayerFace('d');
	    return jqrpgMovePlayer(0, 1);
	});
	
	$("input[name='left']").click(function(){
	    if (jqr.p.state != 'map') return false;
	    jqrpgSendPlayerFace('l');
	    return jqrpgMovePlayer(-1, 0);
	});
	
	$("input[name='right']").click(function(){
	    if (jqr.p.state != 'map') return false;
	    jqrpgSendPlayerFace('r');
	    return jqrpgMovePlayer(1, 0);
	});
});
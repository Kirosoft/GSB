function handleWeb() {
	// This code is a stub to handle going full screen in Safari on iOS devices.
	if( ("standalone" in window.navigator) && !window.navigator.standalone)
	{
		document.getElementById('iPhoneSafari').style.display = "block";
	}

	document.body.style.backgroundColor = 'black';//hack to see buttons if not in sized iframe

	//make app fullscreen if user bookmarks
	var fullscreen = document.createElement('apple-mobile-web-app-capable');
	fullscreen.setAttribute('content', 'yes');
	document.getElementsByTagName('head')[0].appendChild(fullscreen);
	
	//detect if running fullscreen, popup dialog if not?
	
	//set up AppMobi minimum interface
	AppMobi = {};
	AppMobi.orientation = "";
	AppMobi.display = {};
	AppMobi.display.useViewport = function(pWidth, lWidth){
		//get reference to head
		var head, heads = document.getElementsByTagName('head');
		if(heads.length>0) head = heads[0];
		else return;
		//remove any viewport meta tags
		var metas = document.getElementsByTagName('meta');
		for(var i=0;i<metas.length;i++) {
			if(metas[i].name=='viewport') try {head.removeChild(metas[i]);} catch(e){}
		}
		//add the new viewport meta tag
		var viewport = document.createElement('meta');
		viewport.setAttribute('name', 'viewport');
		viewport.setAttribute('id', 'viewport');
		var content = 'width='+(AppMobi.orientation=='landscape'?lWidth:pWidth)+', initial-scale=1.0, maximum-scale=1, user-scalable=no';
		viewport.setAttribute('content', content);
		head.appendChild(viewport);
	};
	AppMobi.device = {};
	AppMobi.device.setRotateOrientation = function(o){
		AppMobi.orientation = o;
	};
	AppMobi.device.managePower = function(){};
	AppMobi.device.setAutoRotate = function(){};
	AppMobi.device.hideSplashScreen = function(){};
	AppMobi.device.platform = "web";
	AppMobi.isWeb = true;
	
	//needed in web layer
	AppMobi.player = {};
	AppMobi.player.playSound = function(sound) {
		//new Audio(sound).play();//kills performance in Mobile Safari
	}

	makeDirectCanvasShim();
	
	//redirect mouse to touch
	AppMobi.redirectMouseToTouch = function (type, originalEvent)
	{
		//stop propagation, and remove default behavior for everything but INPUT, TEXTAREA & SELECT fields
		// originalEvent.stopPropagation();
		if(originalEvent.target.tagName.toUpperCase().indexOf("SELECT")==-1&&
			originalEvent.target.tagName.toUpperCase().indexOf("TEXTAREA")==-1&&
			originalEvent.target.tagName.toUpperCase().indexOf("INPUT")==-1)//SELECT, TEXTAREA & INPUT
			{
				originalEvent.stopPropagation();
		}
		
		var touchevt = document.createEvent("Event");
		touchevt.initEvent(type, true, true);
		touchevt.touches=new Array();
		touchevt.touches[0]=new Object();
		touchevt.touches[0].pageX=originalEvent.clientX;
		touchevt.touches[0].pageY=originalEvent.clientY;
		touchevt.touches[0].target=originalEvent.target;
		touchevt.changedTouches = touchevt.touches;//for jqtouch
		touchevt.targetTouches = touchevt.touches;//for jqtouch
		touchevt.touches[0].clientX=touchevt.touches[0].pageX; //compatibility code
		touchevt.touches[0].clientY=touchevt.touches[0].pageY; //compatibility code
		touchevt.target=originalEvent.target;
		originalEvent.target.dispatchEvent(touchevt);
		return touchevt;
	}
	
	AppMobi.emulateTouchEvents = function()
	{
		var ee = document;
		document.mouseMoving=false;
		document.onmousedown=function(e) {
			try {
				this.mouseMoving=true;
				var touchevt=AppMobi.redirectMouseToTouch("touchstart", e);
				if(document.ontouchstart) document.ontouchstart(touchevt);
			}catch(e){ }
		}
		document.onmouseup=function(e) {
			try {
				this.mouseMoving=false;
				var touchevt=AppMobi.redirectMouseToTouch("touchend", e);
				if(document.ontouchend) document.ontouchend(touchevt);
			}
			catch(e){ }
		}
		document.onmousemove=function(e) {
			try {
				if(!this.mouseMoving) return;
				var touchevt=AppMobi.redirectMouseToTouch("touchmove", e);
				if(document.ontouchmove) document.ontouchmove(touchevt);
			}
			catch(e){ }
		}
	}		
	AppMobi.emulateTouchEvents();
	
	//fire deviceReady -- this will happen automatically on android - how to make sure DirectCanvas shim is ready first?
	AppMobi.available = true;
	var e = document.createEvent('Events');
	e.initEvent('appMobi.device.ready',true,true);
	document.dispatchEvent(e);
}

function checkAndroid() {
//	if("Android" == AppMobi.device.platform) {
//		makeDirectCanvasShim();
//	}
}

function makeDirectCanvasShim() {
	//set up DirectCanvas shim
		
	AppMobi.injectQueue = [];
	AppMobi.readyToInject = true;
	AppMobi.makeReadyToInject = function() {
		AppMobi.readyToInject = true;
		AppMobi.doInject();
	}
	window.addEventListener('message', function(e) {eval(e.data)}, false);
	AppMobi.doInject = function() {
		//if not ready or queue is empty return
		if(!AppMobi.readyToInject || !AppMobi.injectQueue.length) return;
		//set ready state
		AppMobi.readyToInject = false;
		//get next src from queue and make path absolute
		var src = AppMobi.injectQueue.shift();
		//create script tag with load listener
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.onload = AppMobi.makeReadyToInject;
		script.src = src;
		document.body.appendChild(script);
	}
	AppMobi.inject = function(src){
		//add src to queue, call doInject
		AppMobi.injectQueue.push(src);
		AppMobi.doInject();
	}
	AppMobi.webview = {};

	AppMobi.webview.execute = function(strJavascript) {
		eval(strJavascript);
	}

	AppMobi.webview.eval = function(strJavascript) {
		eval(strJavascript);
	}

	//DirectCanvas compatibility
	AppMobi.context = {};
	AppMobi.context.include = AppMobi.inject;
	AppMobi.context.playSound = function(sound) {
		new Audio(sound).play();
	}
	AppMobi.context.hideLoadingScreen = function(){};
	AppMobi.native = AppMobi.context;//backwards compatibility
	AppMobi.isnative = false;
	
	//DirectCanvas compatibility: should use iframe instead?
	Canvas = document.getElementById('_cvs');
	Canvas.context = {};

	Canvas.origGetContext = Canvas.getContext;
	Canvas.getContext = function(ctx) {
		var context = Canvas.origGetContext(ctx);
		context.setFPS = function(){};
		context.clear = function(){};
		context.present = function(){};

		context.__defineSetter__("height", function(h){
			Canvas.setAttribute("height", h + "px");
		});    
		context.__defineSetter__("width", function(w){
			Canvas.setAttribute("width", w + "px");
		});    
		context.__defineSetter__("globalScale", function(s){
		});    
		
		return context;
	}
	
	Canvas.isHidden = true;
	
	Canvas.load = function(strRelativeURL) {
		AppMobi.inject(strRelativeURL);
	};
	
	Canvas.show = function() {
		this.isHidden = false;
		Canvas.style.display = "block";
	};
	
	Canvas.hide = function() {
		this.isHidden = true;
		Canvas.style.display = "none";
	};
	
	Canvas.execute = function(strJavascript) {
		//alert(strJavascript);
		eval(strJavascript);
	};
	
	Canvas.eval = function(strJavascript) {
		eval(strJavascript);
	};
	
	Canvas.reset = function() {
		//compatibility stub
		
		//should reload page?
	};
	
	Canvas.setFramesPerSecond = function(fps) {
		//compatibility stub
	};
	
	Canvas.setFPS = function(fps) {
		//compatibility stub
	};		

	AppMobi.canvas = Canvas;
}

function loadAppMobiJS() {
	var script = document.createElement("script");
	script.type = "text/javascript";
	//if success, check for android
	script.onload = checkAndroid;
	//if fail, do web stuff
	script.onerror = handleWeb;
	script.src = "http://localhost:58888/_appMobi/appmobi.js";
	document.head.appendChild(script);
}
loadAppMobiJS();


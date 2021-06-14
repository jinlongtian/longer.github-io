var BROWSER={};
var USERAGENT=navigator.userAgent.toLowerCase();
browserVersion({
	'ie': 'msie',
	'firefox': '',
	'chrome': '',
	'opera': '',
	'safari': '',
	'mozilla': '',
	'webkit': '',
	'maxthon': '',
	'qq': 'qqbrowser',
	'rv': 'rv'
});
if(BROWSER.safari||BROWSER.rv) {
	BROWSER.firefox=true;
}
BROWSER.opera=BROWSER.opera?opera.version():0;
HTMLNODE=document.getElementsByTagName('head')[0].parentNode;
if(BROWSER.ie) {
	BROWSER.iemode=parseInt(typeof document.documentMode!='undefined'?document.documentMode:BROWSER.ie);
	HTMLNODE.className='ie_all ie'+BROWSER.iemode;
}
var LOADED=false;
var JSMENU=[];
JSMENU['active']=[];
JSMENU['timer']=[];
JSMENU['drag']=[];
JSMENU['layer']=0;
JSMENU['zIndex']={
	'win': 200,
	'menu': 300,
	'dialog': 400,
	'prompt': 500
};
JSMENU['float']='';
var userAgent=navigator.userAgent.toLowerCase();
var is_opera=userAgent.indexOf('opera')!= -1&&opera.version();
var is_moz=(navigator.product=='Gecko')&&userAgent.substr(userAgent.indexOf('firefox')+8,3);
var is_ie=(userAgent.indexOf('msie')!= -1&&!is_opera)&&userAgent.substr(userAgent.indexOf('msie')+5,3);

function _attachEvent(obj,evt,func,eventobj) {
	eventobj=!eventobj?obj:eventobj;
	if(obj.addEventListener) {
		obj.addEventListener(evt,func,false);
	} else if(eventobj.attachEvent) {
		obj.attachEvent('on'+evt,func);
	}
}
function _detachEvent(obj,evt,func,eventobj) {
	eventobj=!eventobj?obj:eventobj;
	if(obj.removeEventListener) {
		obj.removeEventListener(evt,func,false);
	} else if(eventobj.detachEvent) {
		obj.detachEvent('on'+evt,func);
	}
}
function browserVersion(types) {
	var other=1;
	for(i in types) {
		var v=types[i]?types[i]:i;
		if(USERAGENT.indexOf(v)!= -1) {
			var re=new RegExp(v+'(\\/|\\s|:)([\\d\\.]+)','ig');
			var matches=re.exec(USERAGENT);
			var ver=matches!=null?matches[2]:0;
			other=ver!==0&&v!='mozilla'?0:other;
		} else {
			var ver=0;
		}
		eval('BROWSER.'+i+'= ver');
	}
	BROWSER.other=other;
}
function getEvent() {
	if(document.all) return window.event;
	func=getEvent.caller;
	while(func!=null) {
		var arg0=func.arguments[0];
		if(arg0) {
			if((arg0.constructor==Event||arg0.constructor==MouseEvent)||(typeof (arg0)=="object"&&arg0.preventDefault&&arg0.stopPropagation)) {
				return arg0;
			}
		}
		func=func.caller;
	}
	return null;
}
function isUndefined(variable) {
	return typeof variable=='undefined'?true:false;
}
function in_array(needle,haystack) {
	if(typeof needle=='string'||typeof needle=='number') {
		for(var i in haystack) {
			if(haystack[i]==needle) {
				return true;
			}
		}
	}
	return false;
}

var dragMenuDisabled=false;
function dragMenu(menuObj,e,op) {
	e=e?e:window.event;
	if(op==1) {
		if(dragMenuDisabled||in_array(e.target?e.target.tagName:e.srcElement.tagName,['TEXTAREA','INPUT','BUTTON','SELECT'])) {
			return;
		}
		JSMENU['drag']=[e.clientX,e.clientY];
		JSMENU['drag'][2]=parseInt(menuObj.style.left);
		JSMENU['drag'][3]=parseInt(menuObj.style.top);
		document.onmousemove=function(e) {
			try {
				dragMenu(menuObj,e,2);
			} catch(err) { }
		};
		document.onmouseup=function(e) {
			try {
				dragMenu(menuObj,e,3);
			} catch(err) { }
		};
		doane(e);
	} else if(op==2&&JSMENU['drag'][0]) {
		var menudragnow=[e.clientX,e.clientY];
		menuObj.style.left=(JSMENU['drag'][2]+menudragnow[0]-JSMENU['drag'][0])+'px';
		menuObj.style.top=(JSMENU['drag'][3]+menudragnow[1]-JSMENU['drag'][1])+'px';
		menuObj.removeAttribute('top_');
		menuObj.removeAttribute('left_');
		doane(e);
	} else if(op==3) {
		JSMENU['drag']=[];
		document.onmousemove=null;
		document.onmouseup=null;
	}
}

function showUserLogin() {
	//显示登录进入会员中心
	if($.cookie('userName')) {
		location.href="user.html";
	} else {
		if(!LOADED) {
			LOADED=true;
			$("#append_parent").append($("#login").html());
			center(document.getElementById("fwin_login"));
			$(window).resize(function() {
				center(document.getElementById("fwin_login"));
			});
		}
	}
}

function clearUserCookie() {
	$.cookie('userName','',{ path: '/',domain: '.aizhan.com' });
	location.reload(true);
}

function showWindow(k,menuv) {
	$("#layer_login").hide();
	$("#layer_register").hide();
	$("#layer_lostpw").hide();
	$("#"+menuv).show();
}

function hideWindow(k,all,clear) {
	all=isUndefined(all)?1:all;
	clear=isUndefined(clear)?1:clear;
	LOADED=false;
	hideMenu('fwin_'+k,'win');
	if(clear&&document.getElementById('fwin_'+k)) {
		document.getElementById('append_parent').removeChild(document.getElementById('fwin_'+k));
	}
	if(all) {
		hideMenu();
	}
}
function hideMenu(attr,mtype) {
	attr=isUndefined(attr)?'':attr;
	mtype=isUndefined(mtype)?'menu':mtype;
	if(attr=='') {
		for(var i=1;i<=JSMENU['layer'];i++) {
			hideMenu(i,mtype);
		}
		return;
	} else if(typeof attr=='number') {
		for(var j in JSMENU['active'][attr]) {
			hideMenu(JSMENU['active'][attr][j],mtype);
		}
		return;
	} else if(typeof attr=='string') {
		var menuObj=$(attr);
		if(!menuObj||(mtype&&menuObj.mtype!=mtype)) return;
		var ctrlObj='',
        ctrlclass='';
		if((ctrlObj=$(menuObj.getAttribute('ctrlid')))&&(ctrlclass=menuObj.getAttribute('ctrlclass'))) {
			var reg=new RegExp(' '+ctrlclass);
			ctrlObj.className=ctrlObj.className.replace(reg,'');
		}
		clearTimeout(JSMENU['timer'][attr]);
		var hide=function() {
			if(menuObj.cache) {
				if(menuObj.style.visibility!='hidden') {
					menuObj.style.display='none';
					if(menuObj.cover) $(attr+'_cover').style.display='none';
				}
			} else {
				menuObj.parentNode.removeChild(menuObj);
				if(menuObj.cover) $(attr+'_cover').parentNode.removeChild($(attr+'_cover'));
			}
			var tmp=[];
			for(var k in JSMENU['active'][menuObj.layer]) {
				if(attr!=JSMENU['active'][menuObj.layer][k]) tmp.push(JSMENU['active'][menuObj.layer][k]);
			}
			JSMENU['active'][menuObj.layer]=tmp;
		};
		if(menuObj.fade) {
			var O=100;
			var fadeOut=function(O) {
				if(O==0) {
					clearTimeout(fadeOutTimer);
					hide();
					return;
				}
				menuObj.style.filter='progid:DXImageTransform.Microsoft.Alpha(opacity='+O+')';
				menuObj.style.opacity=O/100;
				O-=20;
				var fadeOutTimer=setTimeout(function() {
					fadeOut(O);
				},
                40);
			};
			fadeOut(O);
		} else {
			hide();
		}
	}
}

function fetchOffset(obj,mode) {
	var left_offset=0,
    top_offset=0,
    mode=!mode?0:mode;
	if(obj.getBoundingClientRect&&!mode) {
		var rect=obj.getBoundingClientRect();
		var scrollTop=Math.max(document.documentElement.scrollTop,document.body.scrollTop);
		var scrollLeft=Math.max(document.documentElement.scrollLeft,document.body.scrollLeft);
		if(document.documentElement.dir=='rtl') {
			scrollLeft=scrollLeft+document.documentElement.clientWidth-document.documentElement.scrollWidth;
		}
		left_offset=rect.left+scrollLeft-document.documentElement.clientLeft;
		top_offset=rect.top+scrollTop-document.documentElement.clientTop;
	}
	if(left_offset<=0||top_offset<=0) {
		left_offset=obj.offsetLeft;
		top_offset=obj.offsetTop;
		while((obj=obj.offsetParent)!=null) {
			position=getCurrentStyle(obj,'position','position');
			if(position=='relative') {
				continue;
			}
			left_offset+=obj.offsetLeft;
			top_offset+=obj.offsetTop;
		}
	}
	return {
		'left': left_offset,
		'top': top_offset
	};
}

function center(obj) {
	var windowWidth=document.documentElement.clientWidth;
	var windowHeight=document.documentElement.clientHeight;
	var popupHeight=$(obj).height();
	var popupWidth=$(obj).width();
	$(obj).css({
		"position": "fixed",
		"z-index": 200,
		"top": (windowHeight-popupHeight)/2+$(document).scrollTop(),
		"left": (windowWidth-popupWidth)/2
	});
}

function toQQLogin() {
	var A=window.open("http://www.aizhan.com/user/oauth/index.php","TencentLogin","width=450,height=320,menubar=0,scrollbars=1, resizable=1,status=1,titlebar=0,toolbar=0,location=1");
}

function check_reg() {
	var tip_email=document.getElementById("tip_email");
	var tip_password=document.getElementById("tip_password");
	var tip_password2=document.getElementById("tip_password2");

	if(tip_email.value==1&&tip_password.value==1&&tip_password2.value==1) {
		return true;
	}
	else {
		alert("请检查你的注册信息是否符合规范！");
		return false;
	}
}

function check_email(thisinput) {
	var tip_email=document.getElementById("tip_email");
	for(var i=0;i<thisinput.value.length;i++) {
		strCode=thisinput.value.charCodeAt(i);
		if((strCode>65248)||(strCode==12288)) {
			tip_email.className="show err";
			tip_email.innerHTML="含全角字符，请输入半角";
			return false;
		}
	}

	var re=/^[_a-zA-Z0-9\-\.]+@([\-_a-zA-Z0-9]+\.)+[a-zA-Z0-9]{2,3}$/;
	if((thisinput.value=="")) {
		tip_email.className="show null";
		tip_email.innerHTML="系统未检测到您的输入";
	}
	else if(!thisinput.value.match(re)) {
		tip_email.className="show err";
		tip_email.innerHTML="输入不符合规范";
	}
	else {
		tip_email.value=1;
		tip_email.innerHTML="OK";
	}
}

function check_password(thisinput) {
	var tip_password1=document.getElementById("tip_password1");
	if(thisinput.value.length<5) {
		tip_password1.innerHTML="密码不能少于5位";
		return false;
	}
	else {
		tip_password1.value=1;
		tip_password1.innerHTML="OK";
	}
}

function check_password2(thisinput) {
	var tip_password2=document.getElementById("tip_password2");
	if(thisinput.value!=document.getElementById('password1').value) {
		tip_password2.innerHTML="两次输入的密码不一致";
		return false;
	}
	else {
		tip_password2.value=1;
		tip_password2.innerHTML="OK";
	}
}

function showTopLink() {
	var ft=document.getElementById('ft');
	if(ft) {
		var scrolltop=document.getElementById('scrolltop');
		var viewPortHeight=parseInt(document.documentElement.clientHeight);
		var scrollHeight=parseInt(document.body.getBoundingClientRect().top);
		var basew=parseInt(ft.clientWidth);
		var sw=scrolltop.clientWidth;
		if(basew<1000) {
			var left=parseInt(fetchOffset(ft)['left']);
			left=left<sw?left*2-sw:left;
			scrolltop.style.left=(basew+left)+'px';
		} else {
			scrolltop.style.left='auto';
			scrolltop.style.right=0;
		}
		if(BROWSER.ie&&BROWSER.ie<7) {
			scrolltop.style.top=viewPortHeight-scrollHeight-150+'px';
		}
		if(scrollHeight< -100) {
			scrolltop.style.visibility='visible';
		} else {
			scrolltop.style.visibility='hidden';
		}
	}
}

function addFavorite(url,title) {
	try {
		window.external.addFavorite(url,title);
	} catch(e) {
		try {
			window.sidebar.addPanel(title,url,'');
		} catch(e) {
			alert("请按 Ctrl+D 键添加到收藏夹");
		}
	}
}
function setHomepage(sURL) {
	if(BROWSER.ie) {
		document.body.style.behavior='url(#default#homepage)';
		document.body.setHomePage(sURL);
	} else {
		alert("非 IE 浏览器请手动将本站设为首页");
		doane();
	}
}
function doane(event) {
	e=event?event:window.event;
	if(is_ie) {
		e.returnValue=false;
		e.cancelBubble=true;
	} else if(e) {
		e.stopPropagation();
		e.preventDefault();
	}
}
function OpenNewWin(_title,_pageUrl,_width,_height) {
	$.dialog({ title: _title,width: _width,height: _height,content: 'url:'+_pageUrl });
}
function exchange_fCode_eticket() {
	var title='兑换F码或优惠券';

	OpenNewWin(title,'/FCode_ETicketExchange.aspx',560,350);
}
function machine_unbund() {
    var title = '爱站SEO工具包解绑';

    OpenNewWin(title, '/MachineUnbunding.aspx', 560, 350);
}
function float_qq() {
	page_l=document.body.scrollTop;
	page_t=$(document).scrollTop();
	page_w=$(window).width();
	page_h=$(window).height();
	page_b=page_l+document.body.clientHeight;
	page_r=page_w+page_l;
	page_cw=Math.floor(page_w/2)+page_l;
	page_ch=Math.floor(page_h/2)+page_t;
	
	$("#qq_float").css({ 'right': '5px','top': page_b-200+'px' });
}
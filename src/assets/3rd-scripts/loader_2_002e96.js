;(function (window) {
	if (!window.BX)
	{
		window.BX = {};
	}
	else if (window.BX.SiteButton)
	{
		return;
	}

	window.BX.SiteButton = {

		isShown: false,
		init: function(config)
		{
			this.loadBxAnalytics();

			this.userParams = window.Bitrix24WidgetObject || {};
			this.config = config;
			this.handlers = this.userParams.handlers || {};
			this.eventHandlers = [];

			this.execEventHandler('init', [this]);

			if(!this.check())
			{
				return;
			}

			this.load();

			if(this.config.delay)
			{
				var _this = this;
				window.setTimeout(
					function(){
						_this.show();
					},
					1000 * this.config.delay
				);
			}
			else
			{
				this.show();
			}
		},
		check: function()
		{
			if(!this.config.isActivated)
			{
				return false;
			}

			if(this.config.widgets.length == 0)
			{
				return false;
			}

			if (!this.wm.checkPagesAll(this))
			{
				return false;
			}

			if (!this.wm.checkWorkTimeAll(this))
			{
				return false;
			}
			else
			{
				return true;
			}
		},
		loadBxAnalytics: function()
		{
			if(typeof window._ba != "undefined")
			{
				return;
			}

			var targetHost = document.location.hostname;

			window._ba = window._ba || [];
			window._ba.push(["aid", "ext:" + targetHost]);
			window._ba.push(["host", targetHost]);
			(function() {
				var ba = document.createElement("script"); ba.type = "text/javascript"; ba.async = true;
				ba.src = (document.location.protocol == "https:" ? "https://" : "http://") + "bitrix.info/ba.js";
				var s = document.getElementsByTagName("script")[0];
				s.parentNode.insertBefore(ba, s);
			})();
		},
		load: function()
		{
			this.execEventHandler('load', [this]);

			// set common classes
			if(this.util.isIOS()) this.addClass(document.documentElement, 'bx-ios');
			if(this.util.isMobile()) this.addClass(document.documentElement, 'bx-touch');

			// load resources
			this.config.resources.forEach(function(resource){

				switch (resource.type)
				{
					case 'text/css':

						var cssNode = document.createElement('STYLE');
						cssNode.setAttribute("type", "text/css");
						if(cssNode.styleSheet)
						{
							cssNode.styleSheet.cssText = resource.content;
						}
						else
						{
							cssNode.appendChild(document.createTextNode(resource.content))
						}
						document.head.appendChild(cssNode);

						break;
				}

			}, this);

			// insert layout
			this.context = this.util.getNodeFromText(this.config.layout);
			if (!this.context)
			{
				return;
			}

			document.body.appendChild(this.context);
			this.container = this.context.querySelector('[data-b24-crm-button-cont]');


			// init components
			this.shadow.init({
				'caller': this,
				'shadowNode': this.context.querySelector('[data-b24-crm-button-shadow]')
			});
			this.buttons.init({
				'caller': this,
				'container': this.container.querySelector('[data-b24-crm-button-block]'),
				'blankButtonNode': this.context.querySelector('[data-b24-crm-button-widget-blank]'),
				'openerButtonNode': this.context.querySelector('[data-b24-crm-button-block-button]')
			});
			this.wm.init({'caller': this});
			this.hello.init({
				caller: this,
				context: this.container.querySelector('[data-b24-crm-hello-cont]')
			});

			// load widgets
			this.wm.loadAll();

			this.execEventHandler('loaded', [this]);
		},
		setPulse: function(isActive)
		{
			isActive = isActive || false;
			var pulseNode = this.context.querySelector('[data-b24-crm-button-pulse]');
			if (!pulseNode)
			{
				return;
			}
			pulseNode.style.display = isActive ? '' : 'none';
		},
		show: function()
		{
			this.removeClass(this.container, 'b24-widget-button-disable');
			this.addClass(this.container, 'b24-widget-button-visible');

			this.execEventHandler('show', [this]);
			this.isShown = true;
		},
		hide: function()
		{
			this.addClass(this.container, 'b24-widget-button-disable');

			this.execEventHandler('hide', [this]);
		},
		addEventHandler: function(eventName, handler)
		{
			if (!eventName || !handler)
			{
				return;
			}

			this.eventHandlers.push({
				'eventName': eventName,
				'handler': handler
			});
		},
		execEventHandler: function(eventName, params)
		{
			params = params || [];
			if (!eventName)
			{
				return;
			}

			this.eventHandlers.forEach(function (eventHandler) {
				if (eventHandler.eventName == eventName)
				{
					eventHandler.handler.apply(this, params);
				}
			}, this);

			if(this.handlers[eventName])
			{
				this.handlers[eventName].apply(this, params);
			}

			var externalEventName = 'b24-sitebutton-' + eventName;
			if (window.BX.onCustomEvent)
			{
				window.BX.onCustomEvent(document, externalEventName, params);
			}
			if (window.jQuery && typeof(window.$) == 'function')
			{
				var obj = window.$( document );
				if (obj && obj.trigger) obj.trigger(externalEventName, params);
			}
		},
		onWidgetFormInit: function(form)
		{
			this.execEventHandler('form-init', [form]);
		},
		onWidgetClose: function()
		{
			this.buttons.hide();
			this.show();
		},
		addClass: function(element, className)
		{
			if (element && typeof element.className == "string" && element.className.indexOf(className) === -1)
			{
				element.className += " " + className;
				element.className = element.className.replace('  ', ' ');
			}
		},
		removeClass: function(element, className)
		{
			if (!element || !element.className)
			{
				return;
			}

			element.className = element.className.replace(className, '').replace('  ', ' ');
		},
		addEventListener: function(el, eventName, handler)
		{
			el = el || window;
			if (window.addEventListener)
			{
				el.addEventListener(eventName, handler, false);
			}
			else
			{
				el.attachEvent('on' + eventName, handler);
			}
		},
		buttons: {
			isShown: false,
			isInit: false,
			wasOnceShown: false,
			wasOnceClick: false,
			blankButtonNode: null,
			list: [],
			animatedNodes: [],
			attributeAnimateNode: 'data-b24-crm-button-icon',
			init: function(params)
			{
				this.c = params.caller;
				this.container = params.container;
				this.blankButtonNode = params.blankButtonNode;
				this.openerButtonNode = params.openerButtonNode;

				/* location magic */
				this.openerClassName = this.c.config.location > 3 ? 'b24-widget-button-bottom' : 'b24-widget-button-top';

				var _this = this;
				this.c.addEventListener(this.openerButtonNode, 'click', function (e) {
					if (_this.list.length == 1 && _this.list[0].onclick && !_this.list[0].href)
					{
						_this.list[0].onclick.apply(this, []);
					}
					else
					{
						_this.toggle();
					}
				});

				this.isInit = true;

				this.list.forEach(function (button) {
					if (!button.node) this.insert(button);
				}, this);

				// main button animation
				this.initAnimation();

				// pulse animation
				this.c.addClass(
					this.c.context.querySelector('[data-b24-crm-button-pulse]'),
					'b24-widget-button-pulse-animate'
				);
			},
			initAnimation: function()
			{
				var animatedNodes = this.c.util.nodeListToArray(
					this.c.context.querySelectorAll('[' + this.attributeAnimateNode + ']')
				);

				this.animatedNodes = animatedNodes.filter(function (node) {
					var type = node.getAttribute(this.attributeAnimateNode);
					var isHidden = !this.getByType(type);
					node.style.display = isHidden ? 'none' : '';
					return !isHidden;
				}, this);

				this.animate();
			},
			animate: function()
			{
				var className = 'b24-widget-button-icon-animation';
				var curIndex = 0;
				this.animatedNodes.forEach(function (node, index) {
					if (this.c.util.hasClass(node, className)) curIndex = index;
					this.c.removeClass(node, className);
				}, this);

				curIndex++;
				curIndex = curIndex < this.animatedNodes.length ? curIndex : 0;
				this.c.addClass(this.animatedNodes[curIndex], className);

				if (this.animatedNodes.length > 1)
				{
					var _this = this;
					setTimeout(function () {_this.animate();}, 1500);
				}
			},
			getByType: function(type)
			{
				var buttons = this.list.filter(function (button) {
					return type == button.type;
				}, this);

				return (buttons.length > 0 ? buttons[0] : null);
			},
			toggle: function()
			{
				this.isShown ? this.hide() : this.show();
			},
			show: function()
			{
				if(this.c.util.isIOS()) this.c.addClass(document.documentElement, 'bx-ios-fix-frame-focus');

				//if (this.c.util.isMobile())
				{
					this.c.shadow.show();
				}

				this.isShown = true;
				this.wasOnceShown = true;
				this.c.addClass(this.c.container, this.openerClassName);
				this.c.addClass(this.container, 'b24-widget-button-show');
				this.c.removeClass(this.container, 'b24-widget-button-hide');

				this.c.hello.hide();
			},
			hide: function()
			{
				if(this.c.util.isIOS()) this.c.removeClass(document.documentElement, 'bx-ios-fix-frame-focus');

				this.isShown = false;

				this.c.addClass(this.container, 'b24-widget-button-hide');
				this.c.removeClass(this.container, 'b24-widget-button-show');
				this.c.removeClass(this.c.container, this.openerClassName);

				this.c.hello.hide();
				this.c.shadow.hide();
			},
			displayButton: function (id, display)
			{
				this.list.forEach(function (button) {
					if (button.id != id) return;
					if (!button.node) return;
					button.node.style.display = display ? '' : 'none';
				});
			},
			sortOut: function ()
			{
				this.list.sort(function(buttonA, buttonB){
					return buttonA.sort > buttonB.sort ? 1 : -1;
				});

				this.list.forEach(function(button){
					if (!button.node) return;
					button.node.parentNode.appendChild(button.node);
				});
			},
			add: function (params)
			{
				this.list.push(params);
				return this.insert(params);
			},
			insert: function (params)
			{
				if (!this.isInit)
				{
					params.node = null;
					return null;
				}

				var buttonNode = this.blankButtonNode.cloneNode(true);
				params.node = buttonNode;
				params.sort = params.sort || 100;

				buttonNode.setAttribute('data-b24-crm-button-widget', params.id);
				buttonNode.setAttribute('data-b24-widget-sort', params.sort);

				if (params.classList && params.classList.length > 0)
				{
					params.classList.forEach(function (className) {
						this.c.addClass(buttonNode, className);
					}, this);
				}

				if (params.title)
				{
					var tooltipNode = buttonNode.querySelector('[data-b24-crm-button-tooltip]');
					if (tooltipNode)
					{
						tooltipNode.innerText = params.title;
					}
					else
					{
						buttonNode.title = params.title;
					}
				}

				if (params.icon)
				{
					buttonNode.style['background-image'] = 'url(' + params.icon + ')';
				}
				else
				{
					if (params.iconColor)
					{
						setTimeout(function () {
							var styleName = 'background-image';
							if(!window.getComputedStyle)
							{
								return;
							}

							var styleValue = window.getComputedStyle(buttonNode, null).getPropertyValue(styleName);
							buttonNode.style[styleName] = (
								styleValue || ''
							).replace('FFF', params.iconColor.substring(1));
						}, 1000);
					}

					if (params.bgColor)
					{
						buttonNode.style['background-color'] = params.bgColor;
					}
				}

				if (params.href)
				{
					buttonNode.href = params.href;
					buttonNode.target = params.target ? params.target : '_blank';
				}

				if (params.onclick)
				{
					var _this = this;
					this.c.addEventListener(buttonNode, 'click', function (e) {
						_this.wasOnceClick = true;
						params.onclick.apply(_this, []);
					});
				}

				this.container.appendChild(buttonNode);
				this.sortOut();
				this.initAnimation();

				return buttonNode;
			}
		},
		shadow: {
			clickHandler: null,
			shadowNode: null,
			init: function(params)
			{
				this.c = params.caller;
				this.shadowNode = params.shadowNode;

				var _this = this;
				this.c.addEventListener(this.shadowNode, 'click', function (e) {
					_this.onClick();
				});
				this.c.addEventListener(document, 'keyup', function (e) {
					e = e || window.e;
					if (e.keyCode == 27)
					{
						_this.onClick();
					}
				});
			},
			onClick: function()
			{
				this.c.wm.hide();
				this.c.buttons.hide();

				if (!this.clickHandler)
				{
					return;
				}

				this.clickHandler.apply(this, []);
				this.clickHandler = null;
			},
			show: function(clickHandler)
			{
				this.clickHandler = clickHandler;
				this.c.addClass(this.shadowNode, 'b24-widget-button-show');
				this.c.removeClass(this.shadowNode, 'b24-widget-button-hide');
				this.c.addClass(document.documentElement, 'crm-widget-button-mobile');
			},
			hide: function()
			{
				this.c.addClass(this.shadowNode, 'b24-widget-button-hide');
				this.c.removeClass(this.shadowNode, 'b24-widget-button-show');
				this.c.removeClass(document.documentElement, 'crm-widget-button-mobile');
			}
		},
		util: {
			getNodeFromText: function(text)
			{
				var node = document.createElement('div');
				node.innerHTML = text;
				return node.children[0];
			},
			hasClass: function(node, className)
			{
				var classList = this.nodeListToArray(node.classList);
				var filtered = classList.filter(function (name) { return name == className});
				return filtered.length > 0;
			},
			nodeListToArray: function(nodeList)
			{
				var list = [];
				if (!nodeList) return list;
				for (var i = 0; i < nodeList.length; i++)
				{
					list.push(nodeList.item(i));
				}
				return list;
			},
			isIOS: function()
			{
				return (/(iPad;)|(iPhone;)/i.test(navigator.userAgent));
			},
			isOpera: function()
			{
				return navigator.userAgent.toLowerCase().indexOf('opera') != -1;
			},
			isIE: function()
			{
				return document.attachEvent && !this.isOpera();
			},
			isMobile: function()
			{
				return (/(ipad|iphone|android|mobile|touch)/i.test(navigator.userAgent));
			},
			isArray: function(item) {
				return item && Object.prototype.toString.call(item) == "[object Array]";
			},
			isString: function(item) {
				return item === '' ? true : (item ? (typeof (item) == "string" || item instanceof String) : false);
			},
			evalGlobal: function(text)
			{
				if (!text)
				{
					return;
				}

				var head = document.getElementsByTagName("head")[0] || document.documentElement,
					script = document.createElement("script");

				script.type = "text/javascript";

				if (!this.isIE())
				{
					script.appendChild(document.createTextNode(text));
				}
				else
				{
					script.text = text;
				}

				head.insertBefore(script, head.firstChild);
				head.removeChild(script);
			},
			isCurPageInList: function(list)
			{
				var filtered = list.filter(function (page) {
					var pattern = this.prepareUrl(page).split('*').map(function(chunk){
						return chunk.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
					}).join('.*');
					pattern = '^' + pattern + '$';
					return (new RegExp(pattern)).test(this.prepareUrl(window.location.href));
				}, this);

				return filtered.length > 0;
			},
			prepareUrl: function(url)
			{
				if (url.substring(0, 5) == 'http:')
				{
					result = url.substring(7);
				}
				else if (url.substring(0, 6) == 'https:')
				{
					result = url.substring(8);
				}
				else
				{
					result = url;
				}

				return result;
			},
			getCookie: function (name)
			{
				var matches = document.cookie.match(new RegExp(
					"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
				));

				return matches ? decodeURIComponent(matches[1]) : undefined;
			},
			setCookie: function (name, value, options)
			{
				options = options || {};
				var expires = options.expires;
				if (typeof(expires) == "number" && expires)
				{
					var currentDate = new Date();
					currentDate.setTime(currentDate.getTime() + expires * 1000);
					expires = options.expires = currentDate;
				}

				if (expires && expires.toUTCString)
				{
					options.expires = expires.toUTCString();
				}
				value = encodeURIComponent(value);
				var updatedCookie = name + "=" + value;
				for (var propertyName in options)
				{
					if (!options.hasOwnProperty(propertyName))
					{
						continue;
					}
					updatedCookie += "; " + propertyName;
					var propertyValue = options[propertyName];
					if (propertyValue !== true)
					{
						updatedCookie += "=" + propertyValue;
					}
				}

				document.cookie = updatedCookie;
			}
		},
		wm: { /* Widget Manager */
			showedWidget: null,
			loadedCount: 0,
			init: function(params)
			{
				this.c = params.caller;
			},
			getList: function()
			{
				return this.c.config.widgets;
			},
			getById: function(id)
			{
				var widgets = this.c.config.widgets.filter(function (widget) {
					return id == widget.id;
				}, this);

				return (widgets.length > 0 ? widgets[0] : null);
			},
			hide: function()
			{
				if (!this.showedWidget)
				{
					return;
				}

				if(this.showedWidget.hide)
				{
					this.c.util.evalGlobal(this.showedWidget.hide);
				}

				this.c.onWidgetClose();
				this.c.shadow.hide();
				this.showedWidget = null;
			},
			show: function(widget)
			{
				if(!widget.show || !this.c.util.isString(widget.show))
				{
					return;
				}

				this.showedWidget = widget;
				this.c.shadow.show();

				this.c.util.evalGlobal(widget.show);
				this.c.hide();
			},
			checkPagesAll: function(manager)
			{
				this.c = manager;
				return this.c.config.widgets.some(this.checkPages, this);
			},
			checkPages: function(widget)
			{
				var isPageFound = this.c.util.isCurPageInList(widget.pages.list);
				if(widget.pages.mode == 'EXCLUDE')
				{
					return !isPageFound;
				}
				else
				{
					return isPageFound;
				}
			},
			checkWorkTimeAll: function(manager)
			{
				this.c = manager;
				return this.c.config.widgets.some(this.checkWorkTime, this);
			},
			checkWorkTime: function(widget)
			{
				widget.isWorkTimeNow = true;

				if (!widget.workTime) return true;
				if (widget.isWorkTimeChecked)
				{
					return widget.isWorkTimeNow;
				}

				var workTime = widget.workTime;

				// get date with timezone
				var date = new Date();
				var timeZoneOffset = workTime.timeZoneOffset + date.getTimezoneOffset();
				date = new Date(date.valueOf() + timeZoneOffset * 60000);
				var currentTime = parseFloat(date.getHours() + '.' + date.getMinutes());

				var isSuccess = true;
				if (workTime.dayOff) // check day off
				{
					var day = date.getDay();
					if (workTime.dayOff.some(function (item) { return item === day; }))
					{
						isSuccess = false;
					}
				}

				if (isSuccess && workTime.holidays) // check holidays
				{
					var currentDay = (date.getMonth() + 1).toString();
					currentDay = (currentDay.length == 1 ? '0' : '') + currentDay;
					currentDay = date.getDate() + '.' + currentDay;
					if (workTime.holidays.some(function (item) { return item === currentDay; }))
					{
						isSuccess = false;
					}
				}

				if (isSuccess && (currentTime < workTime.timeFrom || currentTime > workTime.timeTo)) // check time
				{
					isSuccess = false;
				}

				widget.isWorkTimeChecked = true;
				widget.isWorkTimeNow = isSuccess;
				if (isSuccess)
				{
					return true;
				}
				else
				{
					return !!workTime.actionRule;
				}
			},
			loadAll: function()
			{
				this.c.config.widgets.forEach(this.load, this);
			},
			load: function(widget)
			{
				widget.isLoaded = false;

				this.c.execEventHandler('load-widget-' + widget.id, [widget]);

				if(!this.checkPages(widget))
				{
					return;
				}

				if(!this.checkWorkTime(widget))
				{
					return;
				}

				if (widget.workTime && !widget.isWorkTimeNow)
				{
					switch (widget.workTime.actionRule)
					{
						case 'text':
							if (widget.type == 'callback')
							{
								this.c.addEventHandler('form-init', function (form) {
									if (!form.isCallbackForm) return;
									window.Bitrix24FormLoader.addEventHandler(
										form, 'init-frame-params', function (form, frameParameters) {
											frameParameters.resultSuccessText = widget.workTime.actionText;
											frameParameters.stopCallBack = true;
										}
									);
								});
							}
							break;
					}
				}

				widget.buttonNode = this.c.buttons.add({
					'id': widget.id,
					'type': widget.type,
					'href': this.getButtonUrl(widget),
					'sort': widget.sort,
					'classList': (typeof widget.classList != "undefined" ? widget.classList : null),
					'title': (typeof widget.title != "undefined" ? widget.title : null),
					'onclick': this.getButtonHandler(widget),
					'bgColor': widget.useColors ? this.c.config.bgColor : null,
					'iconColor': widget.useColors ? this.c.config.iconColor : null
				});

				this.loadScript(widget);
				widget.isLoaded = true;
				this.loadedCount++;
			},
			getButtonHandler: function(widget)
			{
				var _this = this;
				return function () {
					_this.show(widget);
				};
			},
			getButtonUrl: function(widget)
			{
				if (widget.script || !widget.show)
				{
					return null;
				}

				if (this.c.util.isString(widget.show) || !widget.show.url)
				{
					return null;
				}

				var url = null;
				if (this.c.util.isMobile() && widget.show.url.mobile)
					url = widget.show.url.mobile;
				else if (!this.c.util.isMobile() && widget.show.url.desktop)
					url = widget.show.url.desktop;
				else if (this.c.util.isString(widget.show.url))
					url = widget.show.url;

				return url;
			},
			loadScript: function(widget)
			{
				if (!widget.script)
				{
					return;
				}

				var scriptText = '';
				var isAddInHead = false;
				var parsedScript = widget.script.match(/<script\b[^>]*>(.*?)<\/script>/i);
				if(parsedScript && parsedScript[1])
				{
					scriptText = parsedScript[1];
					isAddInHead = true;
				}
				else
				{
					widget.node = this.c.util.getNodeFromText(widget.script);
					if(!widget.node)
					{
						return;
					}
					isAddInHead = false;

					if (typeof widget.caption != "undefined")
					{
						var widgetCaptionNode = widget.node.querySelector('[data-bx-crm-widget-caption]');
						if (widgetCaptionNode)
						{
							widgetCaptionNode.innerText = widget.caption;
						}
					}
				}

				if (isAddInHead)
				{
					widget.node = document.createElement("script");
					try {
						widget.node.appendChild(document.createTextNode(scriptText));
					} catch(e) {
						widget.node.text = scriptText;
					}
					document.head.appendChild(widget.node);
				}
				else
				{
					document.body.insertBefore(widget.node, document.body.firstChild);
				}
			}
		},
		hello: {
			isInit: false,
			wasOnceShown: false,
			condition: null,
			cookieName: 'b24_sitebutton_hello',
			init: function (params)
			{
				this.c = params.caller;

				if (this.isInit || this.c.util.getCookie(this.cookieName) == 'y')
				{
					return;
				}

				this.context = params.context;
				this.showClassName = 'b24-widget-button-popup-show';
				this.config = this.c.config.hello;
				this.delay = this.config.delay;

				this.buttonHideNode = this.context.querySelector('[data-b24-hello-btn-hide]');
				this.iconNode = this.context.querySelector('[data-b24-hello-icon]');
				this.nameNode = this.context.querySelector('[data-b24-hello-name]');
				this.textNode = this.context.querySelector('[data-b24-hello-text]');

				this.initHandlers();

				if (!this.config || !this.config.conditions || this.config.conditions.length == 0)
				{
					return;
				}

				if (!this.condition)
				{
					this.setConditions(this.config.conditions);
				}
				var _this = this;
				this.c.addEventHandler('show', function () {
					if (!_this.c.isShown)
					{
						_this.initCondition();
					}
				});
				this.isInit = true;
			},
			setConditions: function (conditions)
			{
				this.condition = this.findCondition(conditions);
				this.initCondition();
			},
			initCondition: function ()
			{
				if (!this.condition)
				{
					return;
				}

				if (!this.isInit)
				{
					return;
				}

				if (this.condition.icon)
				{
					this.iconNode.style['background-image'] = 'url(' + this.condition.icon + ')';
				}
				if (this.condition.name)
				{
					this.nameNode.innerText = this.condition.name;
				}
				if (this.condition.text)
				{
					this.textNode.innerText = this.condition.text;
				}
				if (this.condition.delay)
				{
					this.delay = this.condition.delay;
				}

				this.planShowing();
			},
			initHandlers: function ()
			{
				var _this = this;
				this.c.addEventListener(this.buttonHideNode, 'click', function (e) {
					_this.hide();

					if(!e) e = window.event;
					if(e.stopPropagation){e.preventDefault();e.stopPropagation();}
					else{e.cancelBubble = true;e.returnValue = false;}
				});
				this.c.addEventListener(this.context, 'click', function () {
					_this.showWidget();
				});
			},
			planShowing: function ()
			{
				if (this.wasOnceShown || this.c.buttons.wasOnceClick)
				{
					return;
				}

				var showDelay = this.delay || 10;
				var _this = this;
				setTimeout(function () {
					_this.show();
				}, showDelay * 1000);
			},
			findCondition: function (conditions)
			{
				if (!conditions)
				{
					return;
				}

				var filtered;
				// find first suitable condition with mode 'include'
				filtered = conditions.filter(function (condition) {
					if (!condition.pages || condition.pages.MODE == 'EXCLUDE' || condition.pages.LIST.length == 0)
					{
						return false;
					}

					return this.c.util.isCurPageInList(condition.pages.LIST);
				}, this);
				if (filtered.length > 0)
				{
					return filtered[0];
				}

				// find first suitable condition with mode 'exclude'
				filtered = conditions.filter(function (condition) {
					if (!condition.pages || condition.pages.MODE == 'INCLUDE')
					{
						return false;
					}

					return !this.c.util.isCurPageInList(condition.pages.LIST);
				}, this);
				if (filtered.length > 0)
				{
					return filtered[0];
				}

				// find first condition with empty pages
				filtered = conditions.filter(function (condition) {
					return !condition.pages;
				}, this);
				if (filtered.length > 0)
				{
					return filtered[0];
				}

				// nothing found
				return null;
			},
			showWidget: function ()
			{
				this.hide();

				var widget = null;
				if (this.condition && this.condition.showWidgetId)
				{
					widget = this.c.wm.getById(this.condition.showWidgetId);
				}

				if (!widget)
				{
					widget = this.c.wm.getById(this.config.showWidgetId);
				}

				if (!widget)
				{
					widget = this.c.wm.getList()[0];
				}

				if (widget)
				{
					this.c.wm.show(widget);
				}
			},
			show: function ()
			{
				if (this.c.buttons.isShown) //maybe use wasOnceShown
				{
					this.planShowing();
					return;
				}

				this.wasOnceShown = true;
				this.c.addClass(this.context, this.showClassName);
			},
			hide: function ()
			{
				this.c.removeClass(this.context, this.showClassName);
				this.c.util.setCookie(this.cookieName, 'y', {expires: 60*60*6});
			}
		}
	};


})(window);

window.BX.SiteButton.init({"isActivated":true,"resources":[{"name":"style.css","type":"text\/css","content":"html.bx-ios.bx-ios-fix-frame-focus,.bx-ios.bx-ios-fix-frame-focus body{-webkit-overflow-scrolling:touch}.bx-touch{-webkit-tap-highlight-color:rgba(0,0,0,0)}.bx-touch.crm-widget-button-mobile,.bx-touch.crm-widget-button-mobile body{height:100%;overflow:auto}.b24-widget-button-shadow{position:fixed;background:rgba(33,33,33,.3);width:100%;height:100%;top:0;left:0;visibility:hidden;z-index:10100}.bx-touch .b24-widget-button-shadow{background:rgba(33,33,33,.75)}.b24-widget-button-inner-container{position:relative;display:inline-block}.b24-widget-button-position-fixed{position:fixed;z-index:10000}.b24-widget-button-block{width:66px;height:66px;border-radius:100%;box-sizing:border-box;overflow:hidden;cursor:pointer}.b24-widget-button-block .b24-widget-button-icon{opacity:1}.b24-widget-button-block-active .b24-widget-button-icon{opacity:.7}.b24-widget-button-position-top-left{top:50px;left:50px}.b24-widget-button-position-top-middle{top:50px;left:50%;margin:0 0 0 -33px}.b24-widget-button-position-top-right{top:50px;right:50px}.b24-widget-button-position-bottom-left{left:50px;bottom:50px}.b24-widget-button-position-bottom-middle{left:50%;bottom:50px;margin:0 0 0 -33px}.b24-widget-button-position-bottom-right{right:50px;bottom:50px}.b24-widget-button-inner-block{position:relative;display:-webkit-box;display:-ms-flexbox;display:flex;height:66px;border-radius:100px;background:#00aeef;box-sizing:border-box}.b24-widget-button-icon-container{position:relative}.b24-widget-button-inner-item{position:absolute;top:0;left:0;padding:20px 19px;-webkit-transition:opacity .6s ease-out;transition:opacity .6s ease-out;-webkit-animation:socialRotateBack .4s;animation:socialRotateBack .4s;opacity:0}.b24-widget-button-icon-animation{opacity:1}.b24-widget-button-inner-mask{position:absolute;top:-8px;left:-8px;height:82px;min-width:66px;-webkit-width:calc(100% + 16px);width:calc(100% + 16px);border-radius:100px;background:#00aeef;opacity:.2}.b24-widget-button-icon{-webkit-transition:opacity .3s ease-out;transition:opacity .3s ease-out;cursor:pointer}.b24-widget-button-icon:hover{opacity:1}.b24-widget-button-inner-item-active .b24-widget-button-icon{opacity:1}.b24-widget-button-wrapper{position:fixed;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;-webkit-box-align:end;-ms-flex-align:end;align-items:flex-end;visibility:hidden;z-index:10150}.bx-imopenlines-config-sidebar{z-index:10101}.b24-widget-button-visible{visibility:visible;-webkit-animation:b24-widget-button-visible 1s ease-out forwards 1;animation:b24-widget-button-visible 1s ease-out forwards 1}@-webkit-keyframes b24-widget-button-visible{0%{-webkit-transform:scale(0);transform:scale(0)}30.001%{-webkit-transform:scale(1.2);transform:scale(1.2)}62.999%{-webkit-transform:scale(1);transform:scale(1)}100%{-webkit-transform:scale(1);transform:scale(1)}}@keyframes b24-widget-button-visible{0%{-webkit-transform:scale(0);transform:scale(0)}30.001%{-webkit-transform:scale(1.2);transform:scale(1.2)}62.999%{-webkit-transform:scale(1);transform:scale(1)}100%{-webkit-transform:scale(1);transform:scale(1)}}.b24-widget-button-disable{-webkit-animation:b24-widget-button-disable .3s ease-out forwards 1;animation:b24-widget-button-disable .3s ease-out forwards 1}@-webkit-keyframes b24-widget-button-disable{0%{-webkit-transform:scale(1);transform:scale(1)}50.001%{-webkit-transform:scale(.5);transform:scale(.5)}92.999%{-webkit-transform:scale(0);transform:scale(0)}100%{-webkit-transform:scale(0);transform:scale(0)}}@keyframes b24-widget-button-disable{0%{-webkit-transform:scale(1);transform:scale(1)}50.001%{-webkit-transform:scale(.5);transform:scale(.5)}92.999%{-webkit-transform:scale(0);transform:scale(0)}100%{-webkit-transform:scale(0);transform:scale(0)}}.b24-widget-button-social{display:none}.b24-widget-button-social-item{position:relative;display:block;margin:0 10px 10px 0;width:45px;height:44px;background-color:#fff;background-size:100%;border-radius:25px;-webkit-box-shadow:0 8px 6px -6px rgba(33,33,33,.2);-moz-box-shadow:0 8px 6px -6px rgba(33,33,33,.2);box-shadow:0 8px 6px -6px rgba(33,33,33,.2);cursor:pointer}.b24-widget-button-social-item:hover{-webkit-box-shadow:0 0 6px rgba(0,0,0,.16),0 6px 12px rgba(0,0,0,.32);box-shadow:0 0 6px rgba(0,0,0,.16),0 6px 12px rgba(0,0,0,.32);-webkit-transition:box-shadow .17s cubic-bezier(0,0,.2,1);transition:box-shadow .17s cubic-bezier(0,0,.2,1)}.connector-icon-45{width:45px;height:45px}.b24-widget-button-callback{background-image:url(\u0027data:image\/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A\/\/www.w3.org\/2000\/svg%22%20width%3D%2229%22%20height%3D%2230%22%20viewBox%3D%220%200%2029%2030%22%3E%3Cpath%20fill%3D%22%23FFF%22%20fill-rule%3D%22evenodd%22%20d%3D%22M21.872%2019.905c-.947-.968-2.13-.968-3.072%200-.718.737-1.256.974-1.962%201.723-.193.206-.356.25-.59.112-.466-.262-.96-.474-1.408-.76-2.082-1.356-3.827-3.098-5.372-5.058-.767-.974-1.45-2.017-1.926-3.19-.096-.238-.078-.394.11-.587.717-.718.96-.98%201.665-1.717.984-1.024.984-2.223-.006-3.253-.56-.586-1.103-1.397-1.56-2.034-.458-.636-.817-1.392-1.403-1.985C5.4%202.2%204.217%202.2%203.275%203.16%202.55%203.9%201.855%204.654%201.12%205.378.438%206.045.093%206.863.02%207.817c-.114%201.556.255%203.023.774%204.453%201.062%202.96%202.68%205.587%204.642%207.997%202.65%203.26%205.813%205.837%209.513%207.698%201.665.836%203.39%201.48%205.268%201.585%201.292.075%202.415-.262%203.314-1.304.616-.712%201.31-1.36%201.962-2.042.966-1.01.972-2.235.012-3.234-1.147-1.192-2.48-1.88-3.634-3.065zm-.49-5.36l.268-.047c.583-.103.953-.707.79-1.295-.465-1.676-1.332-3.193-2.537-4.445-1.288-1.33-2.857-2.254-4.59-2.708-.574-.15-1.148.248-1.23.855l-.038.28c-.07.522.253%201.01.747%201.142%201.326.355%202.53%201.064%203.517%202.086.926.958%201.59%202.125%201.952%203.412.14.5.624.807%201.12.72zm2.56-9.85C21.618%202.292%2018.74.69%2015.56.02c-.56-.117-1.1.283-1.178.868l-.038.28c-.073.537.272%201.04.786%201.15%202.74.584%205.218%201.968%207.217%204.03%201.885%201.95%203.19%204.36%203.803%207.012.122.53.617.873%201.136.78l.265-.046c.57-.1.934-.678.8-1.26-.71-3.08-2.223-5.873-4.41-8.14z%22\/%3E%3C\/svg%3E\u0027);background-repeat:no-repeat;background-position:center;background-color:#00aeef;background-size:43%}.b24-widget-button-crmform{background-image:url(\u0027data:image\/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A\/\/www.w3.org\/2000\/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%23FFF%22%20fill-rule%3D%22evenodd%22%20d%3D%22M22.407%200h-21.1C.586%200%200%20.586%200%201.306v21.1c0%20.72.586%201.306%201.306%201.306h21.1c.72%200%201.306-.586%201.306-1.305V1.297C23.702.587%2023.117%200%2022.407%200zm-9.094%2018.046c0%20.41-.338.737-.738.737H3.9c-.41%200-.738-.337-.738-.737v-1.634c0-.408.337-.737.737-.737h8.675c.41%200%20.738.337.738.737v1.634zm7.246-5.79c0%20.408-.338.737-.738.737H3.89c-.41%200-.737-.338-.737-.737v-1.634c0-.41.337-.737.737-.737h15.923c.41%200%20.738.337.738.737v1.634h.01zm0-5.8c0%20.41-.338.738-.738.738H3.89c-.41%200-.737-.338-.737-.738V4.822c0-.408.337-.737.737-.737h15.923c.41%200%20.738.338.738.737v1.634h.01z%22\/%3E%3C\/svg%3E\u0027);background-repeat:no-repeat;background-position:center;background-color:#00aeef;background-size:43%}.b24-widget-button-openline_livechat{background-image:url(\u0027data:image\/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A\/\/www.w3.org\/2000\/svg%22%20width%3D%2231%22%20height%3D%2228%22%20viewBox%3D%220%200%2031%2028%22%3E%3Cpath%20fill%3D%22%23FFF%22%20fill-rule%3D%22evenodd%22%20d%3D%22M23.29%2013.25V2.84c0-1.378-1.386-2.84-2.795-2.84h-17.7C1.385%200%200%201.462%200%202.84v10.41c0%201.674%201.385%203.136%202.795%202.84H5.59v5.68h.93c.04%200%20.29-1.05.933-.947l3.726-4.732h9.315c1.41.296%202.795-1.166%202.795-2.84zm2.795-3.785v4.733c.348%202.407-1.756%204.558-4.658%204.732h-8.385l-1.863%201.893c.22%201.123%201.342%202.127%202.794%201.893h7.453l2.795%203.786c.623-.102.93.947.93.947h.933v-4.734h1.863c1.57.234%202.795-1.02%202.795-2.84v-7.57c0-1.588-1.225-2.84-2.795-2.84h-1.863z%22\/%3E%3C\/svg%3E\u0027);background-repeat:no-repeat;background-position:center;background-color:#00aeef;background-size:43%}.b24-widget-button-social-tooltip{position:absolute;top:50%;left:-9000px;display:inline-block;padding:5px 10px;border-radius:10px;font:13px\/15px \u0022Helvetica Neue\u0022,Arial,Helvetica,sans-serif;color:#000;background:#fff;text-align:center;-webkit-transform:translate(0,-50%);transform:translate(0,-50%);-webkit-transition:opacity .6s linear;transition:opacity .6s linear;opacity:0}.b24-widget-button-social-item:hover .b24-widget-button-social-tooltip{left:50px;-webkit-transform:translate(0%,-50%);transform:translate(0%,-50%);opacity:1;z-index:1}.b24-widget-button-close{display:none}.b24-widget-button-position-bottom-left .b24-widget-button-social-item:hover .b24-widget-button-social-tooltip,.b24-widget-button-position-top-left .b24-widget-button-social-item:hover .b24-widget-button-social-tooltip{left:50px;-webkit-transform:translate(0%,-50%);transform:translate(0%,-50%);opacity:1}.b24-widget-button-position-top-right .b24-widget-button-social-item:hover .b24-widget-button-social-tooltip,.b24-widget-button-position-bottom-right .b24-widget-button-social-item:hover .b24-widget-button-social-tooltip{left:-5px;-webkit-transform:translate(-100%,-50%);transform:translate(-100%,-50%);opacity:1}.b24-widget-button-inner-container,.bx-touch .b24-widget-button-inner-container{-webkit-transform:scale(.85);transform:scale(.85);-webkit-transition:transform .3s;transition:transform .3s}.b24-widget-button-top .b24-widget-button-inner-container,.b24-widget-button-bottom .b24-widget-button-inner-container{-webkit-transform:scale(.7);transform:scale(.7);-webkit-transition:transform .3s linear;transition:transform .3s linear}.b24-widget-button-top .b24-widget-button-inner-block,.b24-widget-button-top .b24-widget-button-inner-mask,.b24-widget-button-bottom .b24-widget-button-inner-block,.b24-widget-button-bottom .b24-widget-button-inner-mask{background:#d6d6d6!important;-webkit-transition:background .3s linear;transition:background .3s linear}.b24-widget-button-top .b24-widget-button-pulse,.b24-widget-button-bottom .b24-widget-button-pulse{display:none}.b24-widget-button-wrapper.b24-widget-button-position-bottom-right,.b24-widget-button-wrapper.b24-widget-button-position-bottom-middle,.b24-widget-button-wrapper.b24-widget-button-position-bottom-left{-webkit-box-orient:vertical;-webkit-box-direction:reverse;-ms-flex-direction:column-reverse;flex-direction:column-reverse}.b24-widget-button-bottom .b24-widget-button-social,.b24-widget-button-top .b24-widget-button-social{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:reverse;-ms-flex-direction:column-reverse;flex-direction:column-reverse;-ms-flex-wrap:wrap;flex-wrap:wrap;-ms-flex-line-pack:end;align-content:flex-end;height:-webkit-calc(100vh - 110px);height:calc(100vh - 110px);-webkit-animation:bottomOpen .3s;animation:bottomOpen .3s;visibility:visible}.b24-widget-button-top .b24-widget-button-social{-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;-ms-flex-wrap:wrap;flex-wrap:wrap;-webkit-box-align:start;-ms-flex-align:start;align-items:flex-start;padding:10px 0 0 0;-webkit-animation:topOpen .3s;animation:topOpen .3s}.b24-widget-button-position-bottom-left.b24-widget-button-bottom .b24-widget-button-social{-ms-flex-line-pack:start;align-content:flex-start}.b24-widget-button-position-top-left.b24-widget-button-top .b24-widget-button-social{-ms-flex-line-pack:start;align-content:flex-start}.b24-widget-button-position-top-right.b24-widget-button-top .b24-widget-button-social{-ms-flex-line-pack:start;align-content:flex-start;-ms-flex-wrap:wrap-reverse;flex-wrap:wrap-reverse}.b24-widget-button-position-bottom-right.b24-widget-button-bottom .b24-widget-button-social,.b24-widget-button-position-bottom-left.b24-widget-button-bottom .b24-widget-button-social,.b24-widget-button-position-bottom-middle.b24-widget-button-bottom .b24-widget-button-social{-ms-flex-line-pack:start;align-content:flex-start;-ms-flex-wrap:wrap-reverse;flex-wrap:wrap-reverse;order:1}.b24-widget-button-position-bottom-left.b24-widget-button-bottom .b24-widget-button-social{-ms-flex-wrap:wrap;flex-wrap:wrap}.b24-widget-button-position-bottom-left .b24-widget-button-social-item,.b24-widget-button-position-top-left .b24-widget-button-social-item,.b24-widget-button-position-top-middle .b24-widget-button-social-item,.b24-widget-button-position-bottom-middle .b24-widget-button-social-item{margin:0 0 10px 10px}.b24-widget-button-position-bottom-left.b24-widget-button-wrapper{-webkit-box-align:start;-ms-flex-align:start;align-items:flex-start}.b24-widget-button-position-top-left.b24-widget-button-wrapper{-webkit-box-align:start;-ms-flex-align:start;align-items:flex-start}.b24-widget-button-position-bottom-middle.b24-widget-button-wrapper,.b24-widget-button-position-top-middle.b24-widget-button-wrapper{-webkit-box-align:start;-ms-flex-align:start;align-items:flex-start;-ms-flex-line-pack:start;align-content:flex-start}.b24-widget-button-position-top-middle.b24-widget-button-top .b24-widget-button-social{-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;-ms-flex-line-pack:start;align-content:flex-start}.b24-widget-button-bottom .b24-widget-button-inner-item{display:none}.b24-widget-button-bottom .b24-widget-button-close{display:block;-webkit-animation:socialRotate .4s;animation:socialRotate .4s;opacity:1}.b24-widget-button-top .b24-widget-button-inner-item{display:none}.b24-widget-button-top .b24-widget-button-close{display:block;-webkit-animation:socialRotate .4s;animation:socialRotate .4s;opacity:1}.b24-widget-button-show{-webkit-animation:show .3s linear forwards;animation:show .3s linear forwards}@-webkit-keyframes show{0%{opacity:0}50%{opacity:0}100%{opacity:1;visibility:visible}}@keyframes show{0%{opacity:0}50%{opacity:0}100%{opacity:1;visibility:visible}}.b24-widget-button-hide{-webkit-animation:hidden .3s linear forwards;animation:hidden .3s linear forwards}@-webkit-keyframes hidden{0%{opacity:1;visibility:visible}50%{opacity:1}99.999%{visibility:visible}100%{opacity:0;visibility:hidden}}@keyframes hidden{0%{opacity:1;visibility:visible}50%{opacity:1}99.999%{visibility:visible}100%{opacity:0;visibility:hidden}}.b24-widget-button-hide-icons{-webkit-animation:hideIconsBottom .2s linear forwards;animation:hideIconsBottom .2s linear forwards}@-webkit-keyframes hideIconsBottom{0%{opacity:1}50%{opacity:1}100%{opacity:0;-webkit-transform:translate(0,20px);transform:translate(0,20px);visibility:hidden}}@keyframes hideIconsBottom{0%{opacity:1}50%{opacity:1}100%{opacity:0;-webkit-transform:translate(0,20px);transform:translate(0,20px);visibility:hidden}}@-webkit-keyframes hideIconsTop{0%{opacity:1}50%{opacity:1}100%{opacity:0;-webkit-transform:translate(0,-20px);transform:translate(0,-20px);visibility:hidden}}@keyframes hideIconsTop{0%{opacity:1}50%{opacity:1}100%{opacity:0;-webkit-transform:translate(0,-20px);transform:translate(0,-20px);visibility:hidden}}.b24-widget-button-popup-name{font:bold 14px \u0022Helvetica Neue\u0022,Arial,Helvetica,sans-serif;color:#000}.b24-widget-button-popup-description{margin:4px 0 0 0;font:13px \u0022Helvetica Neue\u0022,Arial,Helvetica,sans-serif;color:#424956}.b24-widget-button-close-item{width:28px;height:28px;background-image:url(\u0027data:image\/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A\/\/www.w3.org\/2000\/svg%22%20width%3D%2229%22%20height%3D%2229%22%20viewBox%3D%220%200%2029%2029%22%3E%3Cpath%20fill%3D%22%23FFF%22%20fill-rule%3D%22evenodd%22%20d%3D%22M18.866%2014.45l9.58-9.582L24.03.448l-9.587%209.58L4.873.447.455%204.866l9.575%209.587-9.583%209.57%204.418%204.42%209.58-9.577%209.58%209.58%204.42-4.42%22\/%3E%3C\/svg%3E\u0027);background-repeat:no-repeat;background-position:center;cursor:pointer}.b24-widget-button-wrapper.b24-widget-button-top{-webkit-box-orient:vertical;-webkit-box-direction:reverse;-ms-flex-direction:column-reverse;flex-direction:column-reverse}@-webkit-keyframes bottomOpen{0%{opacity:0;-webkit-transform:translate(0,20px);transform:translate(0,20px)}100%{opacity:1;-webkit-transform:translate(0,0);transform:translate(0,0)}}@keyframes bottomOpen{0%{opacity:0;-webkit-transform:translate(0,20px);transform:translate(0,20px)}100%{opacity:1;-webkit-transform:translate(0,0);transform:translate(0,0)}}@-webkit-keyframes topOpen{0%{opacity:0;-webkit-transform:translate(0,-20px);transform:translate(0,-20px)}100%{opacity:1;-webkit-transform:translate(0,0);transform:translate(0,0)}}@keyframes topOpen{0%{opacity:0;-webkit-transform:translate(0,-20px);transform:translate(0,-20px)}100%{opacity:1;-webkit-transform:translate(0,0);transform:translate(0,0)}}@-webkit-keyframes socialRotate{0%{-webkit-transform:rotate(-90deg);transform:rotate(-90deg)}100%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}}@keyframes socialRotate{0%{-webkit-transform:rotate(-90deg);transform:rotate(-90deg)}100%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}}@-webkit-keyframes socialRotateBack{0%{-webkit-transform:rotate(90deg);transform:rotate(90deg)}100%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}}@keyframes socialRotateBack{0%{-webkit-transform:rotate(90deg);transform:rotate(90deg)}100%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}}.b24-widget-button-popup{display:none;position:absolute;left:100px;padding:12px 20px 12px 14px;width:312px;border:2px solid #2fc7f7;background:#fff;border-radius:15px;box-sizing:border-box;z-index:1;cursor:pointer}.b24-widget-button-popup-triangle{position:absolute;display:block;width:8px;height:8px;background:#fff;border-right:2px solid #2fc7f7;border-bottom:2px solid #2fc7f7}.b24-widget-button-popup-show{display:block;-webkit-animation:show .4s linear forwards;animation:show .4s linear forwards}.b24-widget-button-position-top-left .b24-widget-button-popup-triangle{top:19px;left:-6px;-webkit-transform:rotate(134deg);transform:rotate(134deg)}.b24-widget-button-position-bottom-left .b24-widget-button-popup-triangle{bottom:25px;left:-6px;-webkit-transform:rotate(134deg);transform:rotate(134deg)}.b24-widget-button-position-bottom-left .b24-widget-button-popup,.b24-widget-button-position-bottom-middle .b24-widget-button-popup{bottom:0;left:75px}.b24-widget-button-position-bottom-right .b24-widget-button-popup-triangle{bottom:25px;right:-6px;-webkit-transform:rotate(-45deg);transform:rotate(-45deg)}.b24-widget-button-position-bottom-right .b24-widget-button-popup{left:-320px;bottom:0}.b24-widget-button-position-top-right .b24-widget-button-popup-triangle{top:19px;right:-6px;-webkit-transform:rotate(-45deg);transform:rotate(-45deg)}.b24-widget-button-position-top-right .b24-widget-button-popup{top:0;left:-320px}.b24-widget-button-position-top-middle .b24-widget-button-popup-triangle{top:19px;left:-6px;-webkit-transform:rotate(134deg);transform:rotate(134deg)}.b24-widget-button-position-top-middle .b24-widget-button-popup,.b24-widget-button-position-top-left .b24-widget-button-popup{top:0;left:75px}.b24-widget-button-position-bottom-middle .b24-widget-button-popup-triangle{bottom:25px;left:-6px;-webkit-transform:rotate(134deg);transform:rotate(134deg)}.bx-touch .b24-widget-button-popup{padding:10px 22px 10px 15px}.bx-touch .b24-widget-button-popup{width:230px}.bx-touch .b24-widget-button-position-bottom-left .b24-widget-button-popup{bottom:90px;left:0}.bx-touch .b24-widget-button-popup-image{margin:0 auto 10px auto}.bx-touch .b24-widget-button-popup-content{text-align:center}.bx-touch .b24-widget-button-position-bottom-left .b24-widget-button-popup-triangle{bottom:-6px;left:25px;-webkit-transform:rotate(45deg);transform:rotate(45deg)}.bx-touch .b24-widget-button-position-bottom-left .b24-widget-button-popup{bottom:90px;left:0}.bx-touch .b24-widget-button-position-bottom-right .b24-widget-button-popup{bottom:90px;left:-160px}.bx-touch .b24-widget-button-position-bottom-right .b24-widget-button-popup-triangle{bottom:-6px;right:30px;-webkit-transform:rotate(-45deg);transform:rotate(45deg)}.bx-touch .b24-widget-button-position-bottom-middle .b24-widget-button-popup{bottom:90px;left:50%;-webkit-transform:translate(-50%,0%);transform:translate(-50%,0%)}.bx-touch .b24-widget-button-position-bottom-middle .b24-widget-button-popup-triangle{bottom:-6px;left:108px;-webkit-transform:rotate(134deg);transform:rotate(45deg)}.bx-touch .b24-widget-button-position-top-middle .b24-widget-button-popup{top:90px;left:50%;-webkit-transform:translate(-50%,0);transform:translate(-50%,0)}.bx-touch .b24-widget-button-position-top-middle .b24-widget-button-popup-triangle{top:-7px;left:auto;right:108px;-webkit-transform:rotate(-135deg);transform:rotate(-135deg)}.bx-touch .b24-widget-button-position-top-left .b24-widget-button-popup{top:90px;left:0}.bx-touch .b24-widget-button-position-top-left .b24-widget-button-popup-triangle{left:25px;top:-6px;-webkit-transform:rotate(-135deg);transform:rotate(-135deg)}.bx-touch .b24-widget-button-position-top-right .b24-widget-button-popup{top:90px;left:-150px}.bx-touch .b24-widget-button-position-top-right .b24-widget-button-popup-triangle{top:-7px;right:40px;-webkit-transform:rotate(-135deg);transform:rotate(-135deg)}.b24-widget-button-popup-btn-hide{position:absolute;top:4px;right:4px;display:inline-block;height:20px;width:20px;background-image:url(\u0027data:image\/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A\/\/www.w3.org\/2000\/svg%22%20width%3D%2210%22%20height%3D%2210%22%20viewBox%3D%220%200%2010%2010%22%3E%3Cpath%20fill%3D%22%23525C68%22%20fill-rule%3D%22evenodd%22%20d%3D%22M6.41%205.07l2.867-2.864-1.34-1.34L5.07%203.73%202.207.867l-1.34%201.34L3.73%205.07.867%207.938l1.34%201.34L5.07%206.41l2.867%202.867%201.34-1.34L6.41%205.07z%22\/%3E%3C\/svg%3E\u0027);background-repeat:no-repeat;background-position:center;opacity:.2;-webkit-transition:opacity .3s;transition:opacity .3s;cursor:pointer}.b24-widget-button-popup-btn-hide:hover{opacity:1}.bx-touch .b24-widget-button-popup-btn-hide{background-image:url(\u0027data:image\/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A\/\/www.w3.org\/2000\/svg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2014%2014%22%3E%3Cpath%20fill%3D%22%23525C68%22%20fill-rule%3D%22evenodd%22%20d%3D%22M8.36%207.02l5.34-5.34L12.36.34%207.02%205.68%201.68.34.34%201.68l5.34%205.34-5.34%205.342%201.34%201.34%205.34-5.34%205.34%205.34%201.34-1.34-5.34-5.34z%22\/%3E%3C\/svg%3E\u0027);background-repeat:no-repeat}.b24-widget-button-popup-inner{display:-webkit-box;display:-ms-flexbox;display:flex;-ms-flex-flow:row wrap;flex-flow:row wrap}.b24-widget-button-popup-content{width:222px}.b24-widget-button-popup-image{margin:0 10px 0 0;width:42px;text-align:center}.b24-widget-button-popup-image-item{display:inline-block;width:42px;height:42px;border-radius:100%;background-repeat:no-repeat;background-position:center;background-size:cover}.b24-widget-button-popup-button{margin:15px 0 0 0;-webkit-box-flex:1;-ms-flex:1;flex:1;text-align:center}.b24-widget-button-popup-button-item{display:inline-block;margin:0 16px 0 0;font:bold 12px \u0022Helvetica Neue\u0022,Arial,Helvetica,sans-serif;color:#08a6d8;text-transform:uppercase;border-bottom:1px solid #08a6d8;-webkit-transition:border-bottom .3s;transition:border-bottom .3s;cursor:pointer}.b24-widget-button-popup-button-item:hover{border-bottom:1px solid transparent}.b24-widget-button-popup-button-item:last-child{margin:0}.b24-widget-button-pulse{position:absolute;top:0;left:0;bottom:0;right:0;border:1px solid #00aeef;border-radius:50%}.b24-widget-button-pulse-animate{-webkit-animation:widgetPulse infinite 1.5s;animation:widgetPulse infinite 1.5s}@-webkit-keyframes widgetPulse{50%{-webkit-transform:scale(1,1);transform:scale(1,1);opacity:1}100%{-webkit-transform:scale(2,2);transform:scale(2,2);opacity:0}}@keyframes widgetPulse{50%{-webkit-transform:scale(1,1);transform:scale(1,1);opacity:1}100%{-webkit-transform:scale(2,2);transform:scale(2,2);opacity:0}}@media(min-height:1024px){.b24-widget-button-top .b24-widget-button-social,.b24-widget-button-bottom .b24-widget-button-social{max-height:900px}}@media(max-height:768px){.b24-widget-button-top .b24-widget-button-social,.b24-widget-button-bottom .b24-widget-button-social{max-height:600px}}@media(max-height:667px){.b24-widget-button-top .b24-widget-button-social,.b24-widget-button-bottom .b24-widget-button-social{max-height:440px}}@media(max-height:568px){.b24-widget-button-top .b24-widget-button-social,.b24-widget-button-bottom .b24-widget-button-social{max-height:380px}}@media(max-height:480px){.b24-widget-button-top .b24-widget-button-social,.b24-widget-button-bottom .b24-widget-button-social{max-height:335px}}"},{"name":"webform_style.css","type":"text\/css","content":".bx-crm-widget-form-config-sidebar{position:fixed;left:-3850px;height:100%;width:369px;box-shadow:0 0 5px 0 rgba(0,0,0,0.25);background:rgba(255,255,255,.98);overflow:hidden;-webkit-transition:opacity .5s ease;-moz-transition:opacity .5s ease;transition:opacity .5s ease;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;opacity:0;z-index:10101}.bx-crm-widget-form-config-sidebar-inner{position:absolute;width:100%;height:100%;overflow:hidden}.bx-crm-widget-form-config-sidebar.open-sidebar{left:auto;right:0;opacity:1;top:0}.bx-crm-widget-form-config-button.open-sidebar{display:none}.bx-crm-widget-form-config-button.button-visible{display:block}.bx-crm-widget-form-config-sidebar.close-sidebar{right:-385px}.bx-crm-widget-form-config-sidebar-header{position:absolute;top:0;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;padding:0 20px;height:60px;width:100%;border-bottom:1px solid #e6e6e7;box-shadow:0 1px 0 0 rgba(0,0,0,0.03);background:#fff;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;z-index:4}.bx-crm-widget-form-config-sidebar-close{display:inline-block;-webkit-box-flex:1;-ms-flex:1;flex:1}.bx-crm-widget-form-config-sidebar-close-item{display:inline-block;background-image:url(data:image\/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNSIgdmlld0JveD0iMCAwIDE1IDE1Ij4gIDxwYXRoIGZpbGw9IiM4MDg2OEUiIGZpbGwtcnVsZT0iZXZlbm9kZCIgZD0iTTE2NDIuNDI0NjIsMjQ1LjAxMDQwOCBMMTYzNi40MTQyMSwyMzkgTDE2MzUsMjQwLjQxNDIxNCBMMTY0MS4wMTA0MSwyNDYuNDI0NjIxIEwxNjM1LDI1Mi40MzUwMjkgTDE2MzYuNDE0MjEsMjUzLjg0OTI0MiBMMTY0Mi40MjQ2MiwyNDcuODM4ODM1IEwxNjQ4LjQzNTAzLDI1My44NDkyNDIgTDE2NDkuODQ5MjQsMjUyLjQzNTAyOSBMMTY0My44Mzg4MywyNDYuNDI0NjIxIEwxNjQ5Ljg0OTI0LDI0MC40MTQyMTQgTDE2NDguNDM1MDMsMjM5IEwxNjQyLjQyNDYyLDI0NS4wMTA0MDggWiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTE2MzUgLTIzOSkiLz48L3N2Zz4=);cursor:pointer;-webkit-transition:opacity .3s ease-in-out;-moz-transition:opacity .3s ease-in-out;transition:opacity .3s ease-in-out;opacity:.5}.bx-crm-widget-form-config-sidebar-close-item{width:20px;height:18px;background-position:3px 2px;background-repeat:no-repeat}.bx-crm-widget-form-config-sidebar-close-item:hover{opacity:1}.bx-crm-widget-form-config-sidebar-message{-webkit-box-flex:16;-ms-flex:16;flex:16;text-align:center}.bx-crm-widget-form-config-sidebar-message-item{display:inline-block;max-width:310px;font:bold 10px \u0022Helvetica Neue\u0022,Arial,Helvetica,sans-serif;color:#424956;text-transform:uppercase;text-overflow:ellipsis;overflow:hidden;white-space:nowrap}.bx-crm-widget-form-config-sidebar-rollup{display:none;margin:0 6px 0 0}.bx-crm-widget-form-config-sidebar-hamburger{display:none}.bx-crm-widget-form-config-sidebar-info{position:absolute;top:60px;width:100%;-webkit-height:calc(100% - 130px);height:calc(100% - 130px);background:#fff;-webkit-transition:opacity .6s ease;-moz-transition:opacity .6s ease;transition:opacity .6s ease;overflow:auto;opacity:1;-webkit-overflow-scrolling:touch}.bx-crm-widget-form-config-sidebar-chat-container{position:absolute;bottom:0;width:100%;background:#fff;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;z-index:4}.bx-crm-widget-form-config-sidebar-chat{padding:20px;-webkit-box-shadow:0 -2px 0 0 rgba(0,0,0,0.03);box-shadow:0 -2px 0 0 rgba(0,0,0,0.03)}.bx-crm-widget-form-config-sidebar-chat-border{height:3px;background:#2fc7f7;background:-moz-linear-gradient(left,#2fc7f7 0,#35e8f6 50%,#7ce3a7 74%,#bcf664 100%);background:-webkit-linear-gradient(left,#2fc7f7 0,#35e8f6 50%,#7ce3a7 74%,#bcf664 100%);background:linear-gradient(to right,#2fc7f7 0,#35e8f6 50%,#7ce3a7 74%,#bcf664 100%)}.bx-crm-widget-form-config-sidebar-logo{padding:15px 0 10px 0;text-align:center}.bx-crm-widget-form-config-sidebar-logo-text{display:inline-block;margin:0 0 0 -2px;font:12px \u0022Helvetica Neue\u0022,Arial,Helvetica,sans-serif;color:#b2b6bd}.bx-crm-widget-form-config-sidebar-logo-bx{display:inline-block;margin:0 -2px 0 0;font:bold 14px \u0022Helvetica Neue\u0022,Helvetica,Arial,sans-serif;color:#2fc7f7}.bx-crm-widget-form-config-sidebar-logo-24{display:inline-block;font:bold 15px \u0022Helvetica Neue\u0022,Helvetica,Arial,sans-serif;color:#215f98}@media(min-width:320px) and (max-width:420px){.bx-crm-widget-form-config-sidebar{width:100%}.bx-crm-widget-form-config-sidebar-info-block-container{padding:0;width:100%;height:115px;border-radius:0}.bx-crm-widget-form-config-sidebar-info-block-container:before{top:0;left:0;width:100%;height:113px;border-radius:0}.bx-crm-widget-form-config-sidebar-info-block-container:after{top:0;left:0;width:100%;height:100px;border-radius:0}.bx-crm-widget-form-config-sidebar-social{width:100%}.crm-webform-header-container{text-align:center}}"},{"name":"ol_imcon_icon_style.css","type":"text\/css","content":".connector-icon{display:inline-block;width:44px;height:44px;background:#f2f2f2;-webkit-border-radius:50%;-moz-border-radius:50%;border-radius:50%;background-color:#ebeff2;background-size:50% 50%;background-position:center center;background-repeat:no-repeat}.connector-icon-square{-webkit-border-radius:0;-moz-border-radius:0;border-radius:0}.connector-icon-22{width:22px;height:22px}.connector-icon-30{width:30px;height:30px}.connector-icon-40{width:40px;height:40px}.connector-icon-botframework-twilio{background-color:#e22330;background-size:60%;background-image:url(\u0027data:image\/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A\/\/www.w3.org\/2000\/svg%22%20viewBox%3D%220%200%2018.01%2018.01%22%3E%3Cpath%20d%3D%22M6.81%2C9.38a1.83%2C1.83%2C0%2C1%2C0%2C1.83%2C1.83A1.84%2C1.84%2C0%2C0%2C0%2C6.81%2C9.38Zm4.46%2C0a1.83%2C1.83%2C0%2C1%2C0%2C1.83%2C1.83%2C1.84%2C1.84%2C0%2C0%2C0-1.83-1.83ZM6.81%2C4.91A1.83%2C1.83%2C0%2C1%2C0%2C8.64%2C6.75%2C1.84%2C1.84%2C0%2C0%2C0%2C6.81%2C4.91Zm4.46%2C0a1.83%2C1.83%2C0%2C1%2C0%2C1.83%2C1.83%2C1.84%2C1.84%2C0%2C0%2C0-1.83-1.83ZM9%2C0a9%2C9%2C0%2C1%2C0%2C9%2C9A9%2C9%2C0%2C0%2C0%2C9%2C0ZM9%2C14.92A5.92%2C5.92%2C0%2C1%2C1%2C14.92%2C9%2C5.92%2C5.92%2C0%2C0%2C1%2C9%2C14.92Z%22%20fill%3D%22%23ffffff%22\/%3E%3C\/svg%3E\u0027)}.connector-icon-botframework-telegram{background-color:#20a4e2;background-position:40% center;background-image:url(\u0027data:image\/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A\/\/www.w3.org\/2000\/svg%22%20viewBox%3D%220%200%20300%20300%22%3E%3Cpath%20d%3D%22M5.299%2C144.645l69.126%2C25.8l26.756%2C86.047c1.712%2C5.511%2C8.451%2C7.548%2C12.924%2C3.891l38.532-31.412%20%20%20c4.039-3.291%2C9.792-3.455%2C14.013-0.391l69.498%2C50.457c4.785%2C3.478%2C11.564%2C0.856%2C12.764-4.926L299.823%2C29.22%20%20%20c1.31-6.316-4.896-11.585-10.91-9.259L5.218%2C129.402C-1.783%2C132.102-1.722%2C142.014%2C5.299%2C144.645z%20M96.869%2C156.711l135.098-83.207%20%20%20c2.428-1.491%2C4.926%2C1.792%2C2.841%2C3.726L123.313%2C180.87c-3.919%2C3.648-6.447%2C8.53-7.163%2C13.829l-3.798%2C28.146%20%20%20c-0.503%2C3.758-5.782%2C4.131-6.819%2C0.494l-14.607-51.325C89.253%2C166.16%2C91.691%2C159.907%2C96.869%2C156.711z%22%20fill%3D%22%23ffffff%22\/%3E%3C\/svg%3E%0A\u0027)}.connector-icon-botframework-facebookmessenger{background-color:#0183ff;background-size:53%;background-image:url(\u0027data:image\/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A\/\/www.w3.org\/2000\/svg%22%20viewBox%3D%220%200%2016.74%2017.98%22%3E%3Cpath%20d%3D%22M2.65%2C18V14.05a.16.16%2C0%2C0%2C0-.05-.12%2C8.37%2C8.37%2C0%2C0%2C1-1.21-1.4%2C7.77%2C7.77%2C0%2C0%2C1-1-1.88A7.6%2C7.6%2C0%2C0%2C1%2C.07%2C9.11%2C7.83%2C7.83%2C0%2C0%2C1%2C0%2C7.71%2C7.68%2C7.68%2C0%2C0%2C1%2C.35%2C5.76%2C7.91%2C7.91%2C0%2C0%2C1%2C1.62%2C3.31%2C8.22%2C8.22%2C0%2C0%2C1%2C3.3%2C1.65%2C8.47%2C8.47%2C0%2C0%2C1%2C5.77.39%2C8.83%2C8.83%2C0%2C0%2C1%2C7.26.07%2C7.68%2C7.68%2C0%2C0%2C1%2C8.34%2C0%2C9.77%2C9.77%2C0%2C0%2C1%2C9.47.07a8.9%2C8.9%2C0%2C0%2C1%2C1.34.28%2C8.13%2C8.13%2C0%2C0%2C1%2C1.75.74%2C8.26%2C8.26%2C0%2C0%2C1%2C2%2C1.56%2C8%2C8%2C0%2C0%2C1%2C2%2C3.82%2C7.5%2C7.5%2C0%2C0%2C1%2C.16%2C1.15%2C7.67%2C7.67%2C0%2C0%2C1%2C0%2C1.32%2C7.82%2C7.82%2C0%2C0%2C1-.56%2C2.17%2C8%2C8%2C0%2C0%2C1-1.48%2C2.33%2C8.29%2C8.29%2C0%2C0%2C1-2.93%2C2.08%2C8%2C8%2C0%2C0%2C1-2%2C.56%2C7.85%2C7.85%2C0%2C0%2C1-1.68.1A8.66%2C8.66%2C0%2C0%2C1%2C6.45%2C16l-.32-.08a.13.13%2C0%2C0%2C0-.11%2C0L3.9%2C17.22%2C2.7%2C18l-.05%2C0Zm.48-7.24v0l.09-.05L7%2C8.57a.08.08%2C0%2C0%2C1%2C.12%2C0l2.1%2C2.15s.06%2C0%2C.1%2C0L10.88%2C9%2C13.48%2C6l.15-.17a.14.14%2C0%2C0%2C0-.1%2C0L9.77%2C8.06a.08.08%2C0%2C0%2C1-.12%2C0L7.55%2C5.89s-.06%2C0-.1%2C0L5.87%2C7.66l-2.6%2C2.92-.15.16Z%22%20fill%3D%22%23ffffff%22\/%3E%3C\/svg%3E\u0027)}.connector-icon-botframework-groupme{background-color:#1db0ed;background-size:53%;background-position:center 58%;background-image:url(\u0027data:image\/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A\/\/www.w3.org\/2000\/svg%22%20viewBox%3D%220%200%2015.94%2018.35%22%3E%3Ctitle%3E%u0420%u0435%u0441%u0443%u0440%u0441%202%3C\/title%3E%3Cpath%20d%3D%22M7.45%2C6.26h1c.07%2C0%2C.1%2C0%2C.1-.1v-1c0-.08%2C0-.1-.1-.1h-1c-.07%2C0-.1%2C0-.1.1v1c0%2C.08%2C0%2C.1.1.1Zm8.46-3a3%2C3%2C0%2C0%2C0-.16-.86A3.48%2C3.48%2C0%2C0%2C0%2C14.35.58%2C3.63%2C3.63%2C0%2C0%2C0%2C12.29%2C0H3.94A8.27%2C8.27%2C0%2C0%2C0%2C3%2C.05%2C3.25%2C3.25%2C0%2C0%2C0%2C1.89.4%2C3.46%2C3.46%2C0%2C0%2C0%2C.53%2C1.67%2C3.32%2C3.32%2C0%2C0%2C0%2C0%2C3.46q0%2C3.87%2C0%2C7.73c0%2C.54%2C0%2C1.08%2C0%2C1.62a3.29%2C3.29%2C0%2C0%2C0%2C.35%2C1.27%2C3.59%2C3.59%2C0%2C0%2C0%2C1%2C1.23%2C3.36%2C3.36%2C0%2C0%2C0%2C2%2C.68c1%2C0%2C2%2C0%2C3%2C0%2C.07%2C0%2C.13%2C0%2C.17.07l.47.77.91%2C1.46c0%2C.06.07.08.12%2C0l.4-.64%2C1-1.55A.19.19%2C0%2C0%2C1%2C9.55%2C16h2.77a4.27%2C4.27%2C0%2C0%2C0%2C.83-.08%2C3.42%2C3.42%2C0%2C0%2C0%2C2.1-1.35%2C3.6%2C3.6%2C0%2C0%2C0%2C.68-2.18c0-1.47%2C0-2.94%2C0-4.73%2C0-1.27%2C0-2.84%2C0-4.41ZM4.76%2C6.37c0-.09%2C0-.12.12-.12H5.94c.1%2C0%2C.13%2C0%2C.13-.12q0-.48%2C0-1c0-.1%2C0-.12-.12-.12H4.86c-.07%2C0-.1%2C0-.1-.1%2C0-.38%2C0-.75%2C0-1.12%2C0-.1%2C0-.1.12-.1h1c.1%2C0%2C.14%2C0%2C.14-.14%2C0-.35%2C0-.7%2C0-1%2C0-.09%2C0-.14.12-.13h1c.1%2C0%2C.12%2C0%2C.12.12%2C0%2C.35%2C0%2C.7%2C0%2C1%2C0%2C.12%2C0%2C.15.15.15h1c.1%2C0%2C.13%2C0%2C.13-.12%2C0-.35%2C0-.7%2C0-1%2C0-.11%2C0-.14.14-.14h1c.1%2C0%2C.12%2C0%2C.12.13%2C0%2C.36%2C0%2C.71%2C0%2C1.07%2C0%2C.09%2C0%2C.12.12.12h1.08c.09%2C0%2C.12%2C0%2C.12.11q0%2C.53%2C0%2C1.07c0%2C.1%2C0%2C.13-.13.13H10c-.09%2C0-.12%2C0-.12.12%2C0%2C.33%2C0%2C.66%2C0%2C1%2C0%2C.09%2C0%2C.12.12.11h1c.1%2C0%2C.14%2C0%2C.14.14q0%2C.53%2C0%2C1.07c0%2C.08%2C0%2C.11-.11.11H10c-.12%2C0-.15%2C0-.15.15%2C0%2C.35%2C0%2C.7%2C0%2C1%2C0%2C.09%2C0%2C.12-.11.12H8.69c-.1%2C0-.12%2C0-.12-.12%2C0-.36%2C0-.71%2C0-1.07%2C0-.1%2C0-.12-.12-.12h-1c-.11%2C0-.14%2C0-.14.14%2C0%2C.35%2C0%2C.7%2C0%2C1.05%2C0%2C.09%2C0%2C.12-.11.12h-1c-.1%2C0-.12%2C0-.12-.12%2C0-.35%2C0-.7%2C0-1%2C0-.11%2C0-.14-.14-.14h-1c-.09%2C0-.13%2C0-.12-.12%2C0-.35%2C0-.71%2C0-1.07ZM14%2C10.23a3.74%2C3.74%2C0%2C0%2C1-.5.76%2C7.08%2C7.08%2C0%2C0%2C1-.65.7%2C6.14%2C6.14%2C0%2C0%2C1-1.36%2C1%2C6.33%2C6.33%2C0%2C0%2C1-1.68.66%2C6.86%2C6.86%2C0%2C0%2C1-1.12.17c-.24%2C0-.48%2C0-.71%2C0a7.18%2C7.18%2C0%2C0%2C1-1.87-.2%2C6.68%2C6.68%2C0%2C0%2C1-2.47-1.2%2C6.93%2C6.93%2C0%2C0%2C1-.9-.83%2C4.72%2C4.72%2C0%2C0%2C1-.74-1%2C.78.78%2C0%2C0%2C1-.08-.7.73.73%2C0%2C0%2C1%2C.89-.4%2C1.16%2C1.16%2C0%2C0%2C1%2C.61.5A5.33%2C5.33%2C0%2C0%2C0%2C5.2%2C11.32%2C5.69%2C5.69%2C0%2C0%2C0%2C7%2C12a4.75%2C4.75%2C0%2C0%2C0%2C.82.09%2C5.51%2C5.51%2C0%2C0%2C0%2C2-.33%2C5.91%2C5.91%2C0%2C0%2C0%2C1.76-1%2C5.35%2C5.35%2C0%2C0%2C0%2C1-1.17.88.88%2C0%2C0%2C1%2C.89-.38.69.69%2C0%2C0%2C1%2C.48%2C1Z%22%20fill%3D%22%23ffffff%22\/%3E%3C\/svg%3E\u0027)}.connector-icon-botframework-kik{background-size:70%;background-position:60% center;background-color:#92d300;background-image:url(\u0027data:image\/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A\/\/www.w3.org\/2000\/svg%22%20viewBox%3D%220%200%2018.47%209.84%22%3E%3Cpath%20d%3D%22M14.42%2C5.71l1.5-1.36a1.25%2C1.25%2C0%2C0%2C0%2C.43-.89.85.85%2C0%2C0%2C0-.82-.89%2C1.09%2C1.09%2C0%2C0%2C0-.82.46L12.36%2C5.42V1a1%2C1%2C0%2C0%2C0-1-1%2C1%2C1%2C0%2C0%2C0-1%2C1V8.81a1%2C1%2C0%2C0%2C0%2C1%2C1%2C1%2C1%2C0%2C0%2C0%2C1-1V7.67L13.1%2C7l1.64%2C2.43a.91.91%2C0%2C0%2C0%2C.82.46.89.89%2C0%2C0%2C0%2C.89-.93%2C1%2C1%2C0%2C0%2C0-.25-.64L14.42%2C5.71ZM8%2C2.71a1%2C1%2C0%2C0%2C0-1%2C1v5.1a1%2C1%2C0%2C0%2C0%2C1%2C1%2C1%2C1%2C0%2C0%2C0%2C1-1V3.71a1%2C1%2C0%2C0%2C0-1-1Zm-4%2C3%2C1.5-1.36a1.25%2C1.25%2C0%2C0%2C0%2C.43-.89.85.85%2C0%2C0%2C0-.82-.89A1.09%2C1.09%2C0%2C0%2C0%2C4.27%2C3L1.92%2C5.42V1A1%2C1%2C0%2C0%2C0%2C1%2C0%2C1%2C1%2C0%2C0%2C0%2C0%2C1V8.81a1%2C1%2C0%2C0%2C0%2C1%2C1%2C1%2C1%2C0%2C0%2C0%2C1-1V7.67L2.67%2C7%2C4.31%2C9.38a.91.91%2C0%2C0%2C0%2C.82.46A.89.89%2C0%2C0%2C0%2C6%2C8.92a1%2C1%2C0%2C0%2C0-.25-.64L4%2C5.71ZM17.4%2C5.17a1.07%2C1.07%2C0%2C1%2C0%2C1.07%2C1.07A1.05%2C1.05%2C0%2C0%2C0%2C17.4%2C5.17Z%22%20fill%3D%22%23ffffff%22\/%3E%3C\/svg%3E\u0027)}.connector-icon-botframework-slack{background-size:57%;background-color:#776ebd;background-image:url(\u0027data:image\/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A\/\/www.w3.org\/2000\/svg%22%20viewBox%3D%220%200%2016.31%2016.31%22%3E%3Cpath%20d%3D%22M16.18%2C8.49a1.43%2C1.43%2C0%2C0%2C0-1.89-.72l-.69.31L11.85%2C4.14l.69-.31a1.43%2C1.43%2C0%2C0%2C0-1.17-2.61l-.69.31L10.38.84A1.43%2C1.43%2C0%2C0%2C0%2C7.77%2C2l.31.69L4.14%2C4.46l-.31-.69A1.43%2C1.43%2C0%2C1%2C0%2C1.22%2C4.94l.31.69-.69.31A1.43%2C1.43%2C0%2C0%2C0%2C2%2C8.54l.69-.31%2C1.76%2C3.94-.69.31a1.43%2C1.43%2C0%2C0%2C0%2C1.17%2C2.61l.69-.31.31.69A1.43%2C1.43%2C0%2C1%2C0%2C8.54%2C14.3l-.31-.69%2C3.94-1.76.31.69a1.43%2C1.43%2C0%2C1%2C0%2C2.61-1.16l-.31-.69.69-.31a1.43%2C1.43%2C0%2C0%2C0%2C.72-1.89ZM7.07%2C11%2C5.3%2C7.07%2C9.24%2C5.31%2C11%2C9.24%2C7.07%2C11Z%22%20fill%3D%22%23ffffff%22\/%3E%3C\/svg%3E\u0027)}.connector-icon-instagram{background-size:57%;background-color:#d12988;background-image:url(\u0027data:image\/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A\/\/www.w3.org\/2000\/svg%22%20viewBox%3D%220%200%20135.25%20135.25%22%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M97.93%2C0H37.32A37.37%2C37.37%2C0%2C0%2C0%2C0%2C37.32v60.6a37.36%2C37.36%2C0%2C0%2C0%2C37.32%2C37.32h60.6a37.37%2C37.37%2C0%2C0%2C0%2C37.32-37.32V37.32A37.37%2C37.37%2C0%2C0%2C0%2C97.93%2C0Zm25.32%2C97.93a25.35%2C25.35%2C0%2C0%2C1-25.32%2C25.32H37.32A25.35%2C25.35%2C0%2C0%2C1%2C12%2C97.93V37.32A25.35%2C25.35%2C0%2C0%2C1%2C37.32%2C12h60.6a25.35%2C25.35%2C0%2C0%2C1%2C25.32%2C25.32Zm0%2C0%22\/%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M67.62%2C32.78a34.85%2C34.85%2C0%2C1%2C0%2C34.85%2C34.85A34.89%2C34.89%2C0%2C0%2C0%2C67.62%2C32.78Zm0%2C57.7A22.85%2C22.85%2C0%2C1%2C1%2C90.48%2C67.63%2C22.88%2C22.88%2C0%2C0%2C1%2C67.62%2C90.47Zm0%2C0%22\/%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M103.94%2C22.6a8.8%2C8.8%2C0%2C1%2C0%2C6.22%2C2.57%2C8.83%2C8.83%2C0%2C0%2C0-6.22-2.57Zm0%2C0%22\/%3E%3C\/svg%3E\u0027)}.connector-icon-network{background-size:57%;background-color:#3bc8f5;background-image:url(\u0027data:image\/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A\/\/www.w3.org\/2000\/svg%22%20viewBox%3D%220%200%2017.1%2012.71%22%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M14.63%2C5.82V5.74A3.58%2C3.58%2C0%2C0%2C0%2C11.09%2C2.1a3.5%2C3.5%2C0%2C0%2C0-1.17.21A3.61%2C3.61%2C0%2C0%2C0%2C6.57%2C0%2C3.68%2C3.68%2C0%2C0%2C0%2C3%2C3.75v.08A4.59%2C4.59%2C0%2C0%2C0%2C0%2C8.14a4.51%2C4.51%2C0%2C0%2C0%2C4.44%2C4.57h9.31A3.42%2C3.42%2C0%2C0%2C0%2C17.1%2C9.23%2C3.46%2C3.46%2C0%2C0%2C0%2C14.63%2C5.82ZM8.51%2C10.34A3.2%2C3.2%2C0%2C0%2C1%2C5.37%2C7.1%2C3.2%2C3.2%2C0%2C0%2C1%2C8.51%2C3.86%2C3.2%2C3.2%2C0%2C0%2C1%2C11.65%2C7.1%2C3.2%2C3.2%2C0%2C0%2C1%2C8.51%2C10.34ZM10%2C7.1H8.72V5.53a.4.4%2C0%2C0%2C0-.8%2C0v2a.41.41%2C0%2C0%2C0%2C.4.4H10a.4.4%2C0%2C0%2C0%2C0-.8Z%22\/%3E%3C\/svg%3E\u0027)}.connector-icon-vkgroup{background-size:60%;background-color:#4a74a5;background-image:url(\u0027data:image\/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A\/\/www.w3.org\/2000\/svg%22%20viewBox%3D%220%200%2069.59%2039.71%22%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M61.7%2C16.6q1.48-1.92%2C2.36-3.08%2C6.27-8.33%2C5.43-10.65l-.22-.36a2.16%2C2.16%2C0%2C0%2C0-1.12-.6%2C5.8%2C5.8%2C0%2C0%2C0-2.32-.09l-10.43.07a3%2C3%2C0%2C0%2C0-.72%2C0A2.18%2C2.18%2C0%2C0%2C0%2C54.2%2C2L54%2C2.11l-.15.11a1.63%2C1.63%2C0%2C0%2C0-.4.38%2C2.38%2C2.38%2C0%2C0%2C0-.36.63%2C58.65%2C58.65%2C0%2C0%2C1-3.88%2C8.15c-.89%2C1.5-1.71%2C2.8-2.46%2C3.89a19%2C19%2C0%2C0%2C1-1.88%2C2.43A13.22%2C13.22%2C0%2C0%2C1%2C43.51%2C19c-.41.32-.72.45-.94.4L42%2C19.21a2.38%2C2.38%2C0%2C0%2C1-.81-.89%2C4%2C4%2C0%2C0%2C1-.42-1.41%2C14.17%2C14.17%2C0%2C0%2C1-.12-1.47c0-.41%2C0-1%2C0-1.74s0-1.25%2C0-1.52q0-1.38.05-3c0-1.08.07-1.93.09-2.56s0-1.29%2C0-2A8.24%2C8.24%2C0%2C0%2C0%2C40.7%2C3a5.63%2C5.63%2C0%2C0%2C0-.38-1.16A2%2C2%2C0%2C0%2C0%2C39.58%2C1%2C4.25%2C4.25%2C0%2C0%2C0%2C38.37.48%2C24.4%2C24.4%2C0%2C0%2C0%2C33.48%2C0q-6.74-.07-8.66.87A4.92%2C4.92%2C0%2C0%2C0%2C23.44%2C2c-.44.54-.5.83-.18.87a4.45%2C4.45%2C0%2C0%2C1%2C3.08%2C1.56l.21.43a6.76%2C6.76%2C0%2C0%2C1%2C.51%2C1.67%2C17.22%2C17.22%2C0%2C0%2C1%2C.33%2C2.64%2C28.09%2C28.09%2C0%2C0%2C1%2C0%2C4.53q-.18%2C1.89-.34%2C2.93a5.94%2C5.94%2C0%2C0%2C1-.49%2C1.7%2C6.48%2C6.48%2C0%2C0%2C1-.44.8.66.66%2C0%2C0%2C1-.18.18%2C2.79%2C2.79%2C0%2C0%2C1-1%2C.18A2.3%2C2.3%2C0%2C0%2C1%2C23.73%2C19a8.46%2C8.46%2C0%2C0%2C1-1.5-1.39%2C18.24%2C18.24%2C0%2C0%2C1-1.76-2.48%2C42.33%2C42.33%2C0%2C0%2C1-2-3.77l-.58-1.05q-.54-1-1.49-3C15.75%2C6%2C15.19%2C4.77%2C14.71%2C3.56a2.42%2C2.42%2C0%2C0%2C0-.87-1.16l-.18-.11A2.44%2C2.44%2C0%2C0%2C0%2C13.08%2C2a4%2C4%2C0%2C0%2C0-.83-.24l-9.93.07A2.53%2C2.53%2C0%2C0%2C0%2C.25%2C2.5l-.14.22A1.16%2C1.16%2C0%2C0%2C0%2C0%2C3.3a2.89%2C2.89%2C0%2C0%2C0%2C.22%2C1q2.17%2C5.11%2C4.73%2C9.85t4.44%2C7.65q1.89%2C2.9%2C3.84%2C5.47t2.59%2C3.3q.63.73%2C1%2C1.09l.91.87a21.44%2C21.44%2C0%2C0%2C0%2C2.55%2C2.09A42.52%2C42.52%2C0%2C0%2C0%2C24%2C37a20.08%2C20.08%2C0%2C0%2C0%2C4.76%2C1.92%2C16.44%2C16.44%2C0%2C0%2C0%2C5.29.6h4.16a2.87%2C2.87%2C0%2C0%2C0%2C1.92-.8l.14-.18a2.43%2C2.43%2C0%2C0%2C0%2C.27-.67%2C3.61%2C3.61%2C0%2C0%2C0%2C.13-1A12%2C12%2C0%2C0%2C1%2C40.92%2C34a7.37%2C7.37%2C0%2C0%2C1%2C.62-1.89%2C4.66%2C4.66%2C0%2C0%2C1%2C.78-1.07%2C3.06%2C3.06%2C0%2C0%2C1%2C.62-.53l.29-.13a2.3%2C2.3%2C0%2C0%2C1%2C2%2C.56%2C12.12%2C12.12%2C0%2C0%2C1%2C2.21%2C2.1q1%2C1.25%2C2.48%2C2.81a17%2C17%2C0%2C0%2C0%2C2.54%2C2.32l.72.43a8.88%2C8.88%2C0%2C0%2C0%2C1.88.8%2C4.06%2C4.06%2C0%2C0%2C0%2C2%2C.18l9.27-.15A4.16%2C4.16%2C0%2C0%2C0%2C68.55%2C39a1.76%2C1.76%2C0%2C0%2C0%2C.91-1%2C2.74%2C2.74%2C0%2C0%2C0%2C0-1.23%2C4.42%2C4.42%2C0%2C0%2C0-.25-1c-.09-.18-.16-.33-.23-.45a36.11%2C36.11%2C0%2C0%2C0-6.92-8l-.14-.14h0a41%2C41%2C0%2C0%2C1-2.93-3%2C2.79%2C2.79%2C0%2C0%2C1-.51-2.93A27.27%2C27.27%2C0%2C0%2C1%2C61.7%2C16.6Zm0%2C0%22\/%3E%3C\/svg%3E\u0027)}.connector-icon-livechat{background-position:center 55%;background-color:#4a90e2;background-image:url(\u0027data:image\/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A\/\/www.w3.org\/2000\/svg%22%20viewBox%3D%220%200%2013.95%2013.13%22%3E%3Cpath%20d%3D%22M12.54%2C3.08h-.79v3.5a2.09%2C2.09%2C0%2C0%2C1-2.06%2C2.1H5.57L4.11%2C10.23a1.38%2C1.38%2C0%2C0%2C0%2C.76.23H8.74c.8%2C1%2C1.81%2C2.13%2C2.08%2C2.36a1.1%2C1.1%2C0%2C0%2C0%2C.55.32A.14.14%2C0%2C0%2C0%2C11.5%2C13V10.45h1A1.42%2C1.42%2C0%2C0%2C0%2C13.95%2C9V4.51a1.41%2C1.41%2C0%2C0%2C0-1.4-1.43M9.08%2C0H1.4A1.42%2C1.42%2C0%2C0%2C0%2C0%2C1.43V5.94A1.42%2C1.42%2C0%2C0%2C0%2C1.4%2C7.37h1V9.87a.14.14%2C0%2C0%2C0%2C.13.17%2C1.09%2C1.09%2C0%2C0%2C0%2C.55-.32c.27-.23%2C1.28-1.4%2C2.08-2.36H9.08a1.42%2C1.42%2C0%2C0%2C0%2C1.4-1.43V1.42A1.42%2C1.42%2C0%2C0%2C0%2C9.08%2C0%22%20fill%3D%22%23ffffff%22\/%3E%3C\/svg%3E\u0027)}.connector-icon-botframework-skype{background-color:#06afe5;background-image:url(\u0027data:image\/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A\/\/www.w3.org\/2000\/svg%22%20viewBox%3D%220%200%20438.536%20438.536%22%3E%3Cpath%20d%3D%22M415.7%2C262.093c3.039-14.657%2C4.564-28.935%2C4.564-42.826c0-27.218-5.276-53.247-15.844-78.087%20%20%20c-10.562-24.838-24.838-46.249-42.825-64.237C343.608%2C58.955%2C322.2%2C44.68%2C297.361%2C34.114%20%20%20c-24.845-10.559-50.866-15.843-78.088-15.843c-13.894%2C0-28.171%2C1.524-42.827%2C4.57C156.651%2C7.614%2C134.381%2C0%2C109.637%2C0%20%20%20C79.375%2C0%2C53.538%2C10.705%2C32.124%2C32.115c-21.416%2C21.416-32.12%2C47.253-32.12%2C77.516c0%2C24.744%2C7.614%2C47.014%2C22.839%2C66.809%20%20%20c-3.044%2C14.655-4.568%2C28.933-4.568%2C42.827c0%2C27.215%2C5.28%2C53.243%2C15.843%2C78.085c10.562%2C24.838%2C24.838%2C46.25%2C42.827%2C64.241%20%20%20c17.987%2C17.986%2C39.401%2C32.257%2C64.239%2C42.824c24.84%2C10.564%2C50.869%2C15.845%2C78.087%2C15.845c13.893%2C0%2C28.17-1.526%2C42.834-4.572%20%20%20c19.79%2C15.229%2C42.058%2C22.847%2C66.804%2C22.847c30.259%2C0%2C56.103-10.711%2C77.505-32.12c21.416-21.416%2C32.12-47.253%2C32.12-77.519%20%20%20C438.529%2C304.158%2C430.918%2C281.891%2C415.7%2C262.093z%20M325.472%2C304.49c-6.276%2C11.136-14.702%2C20.033-25.263%2C26.696%20%20%20c-10.567%2C6.663-22.224%2C11.748-34.975%2C15.273c-12.751%2C3.518-26.073%2C5.283-39.971%2C5.283c-32.163%2C0-59.855-6.235-83.078-18.705%20%20%20c-23.223-12.471-34.833-27.453-34.833-44.968c0-8.562%2C2.428-15.693%2C7.282-21.408c4.853-5.712%2C12.038-8.562%2C21.555-8.562%20%20%20c5.52%2C0%2C10.657%2C1.522%2C15.415%2C4.564c4.758%2C3.046%2C9.135%2C6.715%2C13.134%2C10.999c3.999%2C4.285%2C8.326%2C8.562%2C12.99%2C12.847%20%20%20c4.661%2C4.285%2C10.847%2C7.946%2C18.555%2C10.992c7.71%2C3.046%2C16.418%2C4.572%2C26.128%2C4.572c12.371%2C0%2C22.36-2.423%2C29.981-7.275%20%20%20c7.61-4.859%2C11.416-10.999%2C11.416-18.418c0-7.618-3.042-13.326-9.13-17.132c-4.182-2.673-14.846-6.098-31.977-10.283%20%20%20l-41.688-10.284c-11.419-2.662-21.222-5.752-29.408-9.271c-8.186-3.524-15.8-8.134-22.841-13.849%20%20%20c-7.039-5.708-12.369-12.891-15.986-21.555c-3.616-8.658-5.424-18.796-5.424-30.406c0-13.896%2C3.189-26.121%2C9.563-36.688%20%20%20c6.374-10.565%2C14.849-18.846%2C25.409-24.841c10.562-5.996%2C21.935-10.468%2C34.119-13.418c12.179-2.951%2C24.742-4.426%2C37.685-4.426%20%20%20c18.276%2C0%2C35.589%2C2.19%2C51.961%2C6.567c16.368%2C4.377%2C29.882%2C10.801%2C40.538%2C19.271c10.657%2C8.473%2C15.985%2C17.942%2C15.985%2C28.409%20%20%20c0%2C8.562-2.707%2C15.893-8.138%2C21.982c-5.414%2C6.088-12.601%2C9.134-21.55%2C9.134c-4.948%2C0-9.514-1.143-13.702-3.427%20%20%20c-4.186-2.283-7.99-5.042-11.423-8.278c-3.426-3.234-7.047-6.423-10.852-9.563c-3.806-3.14-8.946-5.852-15.41-8.136%20%20%20c-6.479-2.284-13.802-3.427-21.986-3.427c-27.406%2C0-41.112%2C7.323-41.112%2C21.982c0%2C3.234%2C0.715%2C6.09%2C2.141%2C8.564%20%20%20c1.427%2C2.474%2C3%2C4.473%2C4.71%2C5.996c1.709%2C1.525%2C4.565%2C3.046%2C8.564%2C4.57c3.999%2C1.525%2C7.33%2C2.622%2C9.994%2C3.284%20%20%20c2.663%2C0.666%2C6.854%2C1.665%2C12.562%2C2.996l29.694%2C6.851c9.325%2C2.096%2C17.648%2C4.286%2C24.981%2C6.567c7.331%2C2.288%2C15.181%2C5.521%2C23.555%2C9.71%20%20%20c8.374%2C4.187%2C15.321%2C8.848%2C20.838%2C13.988c5.523%2C5.144%2C10.137%2C11.656%2C13.853%2C19.555c3.714%2C7.901%2C5.564%2C16.61%2C5.564%2C26.124%20%20%20C334.896%2C280.84%2C331.761%2C293.357%2C325.472%2C304.49z%22%20fill%3D%22%23ffffff%22\/%3E%3C\/svg%3E%0A\u0027)}.connector-icon-telegrambot{background-color:#20a4e2;background-position:40% center;background-image:url(\u0027data:image\/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A\/\/www.w3.org\/2000\/svg%22%20viewBox%3D%220%200%20300%20300%22%3E%3Cpath%20d%3D%22M5.299%2C144.645l69.126%2C25.8l26.756%2C86.047c1.712%2C5.511%2C8.451%2C7.548%2C12.924%2C3.891l38.532-31.412%20%20%20c4.039-3.291%2C9.792-3.455%2C14.013-0.391l69.498%2C50.457c4.785%2C3.478%2C11.564%2C0.856%2C12.764-4.926L299.823%2C29.22%20%20%20c1.31-6.316-4.896-11.585-10.91-9.259L5.218%2C129.402C-1.783%2C132.102-1.722%2C142.014%2C5.299%2C144.645z%20M96.869%2C156.711l135.098-83.207%20%20%20c2.428-1.491%2C4.926%2C1.792%2C2.841%2C3.726L123.313%2C180.87c-3.919%2C3.648-6.447%2C8.53-7.163%2C13.829l-3.798%2C28.146%20%20%20c-0.503%2C3.758-5.782%2C4.131-6.819%2C0.494l-14.607-51.325C89.253%2C166.16%2C91.691%2C159.907%2C96.869%2C156.711z%22%20fill%3D%22%23ffffff%22\/%3E%3C\/svg%3E%0A\u0027)}.connector-icon-facebook{background-color:#3680f9;background-image:url(\u0027data:image\/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A\/\/www.w3.org\/2000\/svg%22%20viewBox%3D%220%200%20430.113%20430.114%22%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M158.081%2C83.3c0%2C10.839%2C0%2C59.218%2C0%2C59.218h-43.385v72.412h43.385v215.183h89.122V214.936h59.805%20%20%20c0%2C0%2C5.601-34.721%2C8.316-72.685c-7.784%2C0-67.784%2C0-67.784%2C0s0-42.127%2C0-49.511c0-7.4%2C9.717-17.354%2C19.321-17.354%20%20%20c9.586%2C0%2C29.818%2C0%2C48.557%2C0c0-9.859%2C0-43.924%2C0-75.385c-25.016%2C0-53.476%2C0-66.021%2C0C155.878-0.004%2C158.081%2C72.48%2C158.081%2C83.3z%22\/%3E%3C\/svg%3E%0A\u0027)}.connector-icon-viber{background-color:#9a5aca;background-size:93% 93%;background-image:url(\u0027data:image\/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A\/\/www.w3.org\/2000\/svg%22%20viewBox%3D%220%200%20455.7%20455.7%22%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M372%20146.9l-.1-.4c-7.3-29.4-40.1-61-70.2-67.6l-.3-.1c-48.8-9.3-98.2-9.3-146.9%200l-.4.1c-30.1%206.6-62.9%2038.2-70.2%2067.6l-.1.4c-9%2041.1-9%2082.8%200%20123.9l.1.4c7%2028.2%2037.4%2058.3%2066.4%2066.6v32.9c0%2011.9%2014.5%2017.7%2022.7%209.1l33.3-34.6c7.2.4%2014.4.6%2021.7.6%2024.5%200%2049.1-2.3%2073.5-7l.3-.1c30.1-6.6%2063-38.1%2070.2-67.6l.1-.4c8.9-41%208.9-82.7-.1-123.8zm-26.3%20117.9c-4.9%2019.2-29.8%2043.1-49.6%2047.5-25.9%204.9-52%207-78.1%206.3-.5%200-1%20.2-1.4.6-3.7%203.8-24.3%2024.9-24.3%2024.9l-25.9%2026.5c-1.9%202-5.2.6-5.2-2.1v-54.4c0-.9-.6-1.7-1.5-1.8-19.8-4.4-44.7-28.3-49.6-47.5-8.1-37.2-8.1-74.8%200-112%204.9-19.2%2029.8-43.1%2049.6-47.5%2045.3-8.6%2091.2-8.6%20136.4%200%2019.8%204.4%2044.7%2028.3%2049.6%2047.5%208.1%2037.2%208.1%2074.9%200%20112z%22\/%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M270.9%20289.9c-3-.9-5.9-1.5-8.6-2.7-27.9-11.6-53.6-26.5-74-49.4-11.6-13-20.6-27.7-28.3-43.3-3.6-7.4-6.7-15-9.8-22.7-2.8-6.9%201.3-14.1%205.8-19.4%204.1-4.9%209.5-8.7%2015.2-11.4%204.5-2.2%208.9-.9%2012.2%202.9%207.1%208.2%2013.6%2016.9%2018.9%2026.5%203.3%205.9%202.4%2013.1-3.5%2017.1-1.4%201-2.7%202.1-4.1%203.2-1.2%201-2.3%201.9-3.1%203.2-1.5%202.4-1.5%205.2-.6%207.8%207.3%2020%2019.5%2035.5%2039.6%2043.9%203.2%201.3%206.4%202.9%2010.2%202.5%206.2-.7%208.2-7.5%2012.6-11.1%204.2-3.5%209.7-3.5%2014.3-.6%204.6%202.9%209%206%2013.4%209.2%204.3%203.1%208.6%206.1%2012.6%209.6%203.8%203.4%205.2%207.8%203%2012.4-4%208.4-9.7%2015.4-18%2019.9-2.3%201.2-5.1%201.6-7.8%202.4-3-.9%202.7-.8%200%200zM227.9%20131.5c36.5%201%2066.5%2025.3%2072.9%2061.4%201.1%206.2%201.5%2012.4%202%2018.7.2%202.6-1.3%205.1-4.1%205.2-2.9%200-4.2-2.4-4.4-5-.4-5.2-.6-10.4-1.4-15.6-3.8-27.2-25.5-49.7-52.5-54.5-4.1-.7-8.2-.9-12.4-1.4-2.6-.3-6-.4-6.6-3.7-.5-2.7%201.8-4.9%204.4-5%20.7-.2%201.4-.1%202.1-.1%2036.6%201-.7%200%200%200z%22\/%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M283.4%20203.4c-.1.5-.1%201.5-.4%202.5-1%203.7-6.5%204.1-7.8.4-.4-1.1-.4-2.3-.4-3.5%200-7.7-1.7-15.5-5.6-22.2-4-6.9-10.1-12.7-17.3-16.2-4.3-2.1-9-3.4-13.8-4.2-2.1-.3-4.2-.6-6.3-.8-2.5-.4-3.9-2-3.8-4.5.1-2.3%201.8-4%204.4-3.9%208.4.5%2016.5%202.3%2023.9%206.2%2015.1%208%2023.8%2020.7%2026.3%2037.6.1.8.3%201.5.4%202.3.2%201.9.3%203.8.4%206.3%200%20.5-.1-2.5%200%200z%22\/%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M260.7%20202.5c-3.1.1-4.7-1.6-5-4.4-.2-2-.4-3.9-.9-5.8-.9-3.7-2.9-7.2-6.1-9.5-1.5-1.1-3.2-1.9-4.9-2.4-2.2-.6-4.6-.5-6.8-1-2.4-.6-3.8-2.6-3.4-4.8.3-2.1%202.4-3.7%204.6-3.5%2014.2%201%2024.3%208.3%2025.7%2025%20.1%201.2.2%202.4%200%203.5-.4%201.9-1.8%202.8-3.2%202.9-3%20.1%201.4-.1%200%200z%22\/%3E%3C\/svg%3E\u0027)}.connector-icon-botframework{background-color:#06afe5;background-image:url(\u0027data:image\/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A\/\/www.w3.org\/2000\/svg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M7.34093369%2C2.99392205%20L0.182586149%2C2.99392205%20C0.156106442%2C2.99392205%200.138453304%2C3.01157519%200.138453304%2C3.0380549%20L0.138453304%2C10.1964024%20C0.138453304%2C10.2228821%200.156106442%2C10.2405353%200.182586149%2C10.2405353%20L7.34093369%2C10.2405353%20C7.36741339%2C10.2405353%207.38506653%2C10.2228821%207.38506653%2C10.1964024%20L7.38506653%2C3.0380549%20C7.38506653%2C3.02040176%207.36741339%2C2.99392205%207.34093369%2C2.99392205%20L7.34093369%2C2.99392205%20Z%20M15.4437241%2C2.99392205%20L8.28537658%2C2.99392205%20C8.25889687%2C2.99392205%208.24124373%2C3.01157519%208.24124373%2C3.0380549%20L8.24124373%2C10.1964024%20C8.24124373%2C10.2228821%208.25889687%2C10.2405353%208.28537658%2C10.2405353%20L15.4437241%2C10.2405353%20C15.4702038%2C10.2405353%2015.487857%2C10.2228821%2015.487857%2C10.1964024%20L15.487857%2C3.0380549%20C15.487857%2C3.02040176%2015.4702038%2C2.99392205%2015.4437241%2C2.99392205%20L15.4437241%2C2.99392205%20Z%20M7.34093369%2C11.0967125%20L0.182586149%2C11.0967125%20C0.156106442%2C11.0967125%200.138453304%2C11.1143656%200.138453304%2C11.1408453%20L0.138453304%2C18.2991929%20C0.138453304%2C18.3256726%200.156106442%2C18.3433257%200.182586149%2C18.3433257%20L7.34093369%2C18.3433257%20C7.36741339%2C18.3433257%207.38506653%2C18.3256726%207.38506653%2C18.2991929%20L7.38506653%2C11.1408453%20C7.38506653%2C11.1231922%207.36741339%2C11.0967125%207.34093369%2C11.0967125%20L7.34093369%2C11.0967125%20Z%20M15.4437241%2C11.0967125%20L8.28537658%2C11.0967125%20C8.25889687%2C11.0967125%208.24124373%2C11.1143656%208.24124373%2C11.1408453%20L8.24124373%2C18.2991929%20C8.24124373%2C18.3256726%208.25889687%2C18.3433257%208.28537658%2C18.3433257%20L15.4437241%2C18.3433257%20C15.4702038%2C18.3433257%2015.487857%2C18.3256726%2015.487857%2C18.2991929%20L15.487857%2C11.1408453%20C15.487857%2C11.1231922%2015.4702038%2C11.0967125%2015.4437241%2C11.0967125%20L15.4437241%2C11.0967125%20Z%22%20transform%3D%22translate%280%20-2.803%29%22\/%3E%3C\/svg%3E%0A\u0027)}.connector-icon-botframework-emailoffice365{background-color:#0071c9;background-image:url(\u0027data:image\/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A\/\/www.w3.org\/2000\/svg%22%20width%3D%22150%22%20height%3D%22150%22%20viewBox%3D%220%200%20150%20150%22%3E%3Cpath%20fill%3D%22%23FFF%22%20fill-rule%3D%22evenodd%22%20d%3D%22M83.67%2075.23V2.398c0-1.764%200-2.772-2.33-2.268C55.003%205.422%2028.434%2010.462%202.098%2015.503.466%2015.755%200%2016.51%200%2018.275v114.163c0%201.764.466%202.52%202.098%202.772%2026.336%204.79%2052.44%209.83%2078.542%2014.617%202.33.504%203.03%200%203.03-2.772V75.23zM48.244%2098.92c-6.06%204.788-14.217%203.78-19.577-2.016C19.344%2086.57%2018.645%2067.922%2026.57%2056.33c7.224-10.837%2020.276-10.333%2027.035%201.007C56.868%2062.882%2058.5%2068.93%2058.5%2076.995c-.467%207.812-2.798%2016.13-10.256%2021.925zm101.15-53.68c-.7-.25-1.398.253-2.097%201.01l-39.854%2034.02c-2.797%202.52-4.428%202.52-7.225%200-2.797-2.267-5.594-4.536-8.624-7.308-.233.756-.233%201.008-.233%201.26v43.6c0%202.267%201.167%202.015%202.565%202.015h49.643c4.428%200%206.293-2.016%206.293-6.804V47.005c.234-.504.234-1.512-.466-1.764zm-57.8%2016.886c0%201.512.233%202.268%201.4%203.276%203.262%202.52%206.525%205.292%209.554%208.064.933.756%201.632%201.008%202.797%200%2014.45-12.348%2028.9-24.95%2043.35-37.298%201.4-1.26%201.4-2.268.466-3.78-1.397-2.268-3.728-2.268-5.825-2.268H94.158c-1.63%200-2.33.504-2.33%202.52-.234%209.828-.234%2019.657-.234%2029.486zm-56.867-1.008c-3.962%203.78-4.895%208.82-5.128%2012.6%200%206.805.93%2011.593%204.194%2015.373%203.73%204.538%209.09%204.034%2012.12-.755%201.63-2.52%202.33-5.544%202.797-8.316.7-6.302.467-12.35-3.03-17.642-2.796-4.537-7.457-4.79-10.953-1.26z%22\/%3E%3C\/svg%3E\u0027)}.connector-icon-botframework-webchat{background-color:#4393d0;background-image:url(\u0027data:image\/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A\/\/www.w3.org\/2000\/svg%22%20width%3D%22150%22%20height%3D%22150%22%20viewBox%3D%220%200%20150%20150%22%3E%3Cpath%20fill%3D%22%23FFF%22%20fill-rule%3D%22evenodd%22%20d%3D%22M109.86%2075c-7.043%200-12.677%206.522-12.677%2014.674s5.634%2014.674%2012.676%2014.674c7.04%200%2012.675-6.522%2012.675-14.674S116.197%2075%20109.86%2075zM75.35%2075c-7.042%200-12.676%206.522-12.676%2014.674s5.634%2014.674%2012.676%2014.674%2012.676-6.522%2012.676-14.674S82.394%2075%2075.352%2075zM41.55%2075c-7.043%200-12.677%206.522-12.677%2014.674s5.634%2014.674%2012.676%2014.674%2012.675-6.522%2012.675-14.674S48.592%2075%2041.55%2075zM148.59%200H1.408C.704%200%200%20.815%200%201.63v146.74c0%20.815.704%201.63%201.408%201.63h147.184c.704%200%201.408-.815%201.408-1.63V1.63c0-.815-.704-1.63-1.408-1.63zm-21.127%2015.49c0-1.63.704-2.447%202.112-2.447h7.043c1.408%200%202.112.816%202.112%202.446v8.15c0%201.632-.704%202.447-2.112%202.447h-7.043c-1.408%200-2.112-.815-2.112-2.446v-8.15zm-18.31%200c0-1.63.704-2.447%202.113-2.447h7.042c1.408%200%202.113.816%202.113%202.446v8.15c0%201.632-.705%202.447-2.113%202.447h-7.042c-1.41%200-2.113-.815-2.113-2.446v-8.15zm-97.183%200c0-1.63.704-2.447%202.113-2.447H85.21c1.41%200%202.114.816%202.114%202.446v8.15c0%201.632-.704%202.447-2.113%202.447H14.086c-1.41%200-2.113-.815-2.113-2.446v-8.15zM141.55%20138.586c0%201.63-.705%202.446-2.113%202.446H9.86c-1.41%200-2.114-.816-2.114-2.446V44.022c0-1.63.705-2.446%202.113-2.446h129.577c1.408%200%202.112.815%202.112%202.446v94.565z%22\/%3E%3C\/svg%3E\u0027)}.connector-icon-botframework-directline{background-color:#4393d0;background-image:url(\u0027data:image\/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A\/\/www.w3.org\/2000\/svg%22%20width%3D%22150%22%20height%3D%22150%22%20viewBox%3D%220%200%20150%20150%22%3E%3Cpath%20fill%3D%22%23FFF%22%20fill-rule%3D%22evenodd%22%20d%3D%22M75%200C43.32%200%2016.81%2019.397%205.172%2047.198v.647C1.94%2056.25%200%2065.302%200%2075c0%2041.38%2033.62%2075%2075%2075s75-33.62%2075-75S116.38%200%2075%200zm61.422%2091.164H110.56c.647-5.173.647-10.345.647-15.517%200-7.113-.647-14.225-1.293-20.69h26.508c1.94%206.465%203.233%2013.577%203.233%2020.69%200%205.172-.646%2010.99-1.94%2016.163%200-.646-.646-.646-1.293-.646zM75%20140.948c-9.698%200-20.043-15.517-24.57-39.44h49.786C95.043%20125.432%2084.698%20140.95%2075%20140.95zM48.49%2091.164c-.645-5.173-.645-10.345-.645-15.517%200-7.113.646-14.225%201.293-20.69h51.078c.646%206.465%201.293%2013.577%201.293%2020.69%200%205.172%200%2010.99-.648%2015.517h-52.37zM9.7%2075.647c0-7.113%201.293-14.225%203.233-20.69h26.51c-.647%206.465-1.293%2013.577-1.293%2020.69%200%205.172%200%2010.344.646%2015.517H11.638c-1.293-5.173-1.94-10.345-1.94-15.517zM75%209.697c9.052%200%2018.75%2012.932%2023.922%2034.27H51.724C56.25%2023.276%2065.948%209.696%2075%209.696zm57.543%2034.27H108.62c-2.586-12.286-7.11-23.277-12.284-31.036%2015.517%205.82%2028.448%2016.81%2036.207%2031.036zm-78.88-30.39c-5.172%207.76-9.697%2018.104-12.284%2031.035H17.456c7.76-14.87%2020.69-25.862%2036.207-31.034zM14.872%20101.51h25.216c2.586%2014.87%207.112%2027.154%2013.578%2035.56-17.457-5.82-31.68-18.75-38.793-35.56zm80.82%2035.56c6.465-8.406%2010.99-21.337%2013.577-35.56h25.216c-7.112%2016.81-21.336%2029.74-38.793%2035.56z%22\/%3E%3C\/svg%3E\u0027)}.connector-icon-facebookcomments{background-color:#0183ff;background-image:url(\u0027data:image\/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A\/\/www.w3.org\/2000\/svg%22%20width%3D%22150%22%20height%3D%22150%22%20viewBox%3D%220%200%20150%20150%22%3E%3Cpath%20fill%3D%22%23FFF%22%20fill-rule%3D%22evenodd%22%20d%3D%22M10.96%2028.93v20.567H0v25.15h10.96v74.734h22.515V74.65h15.108s1.415-12.06%202.1-25.246H33.56V32.21c0-2.57%202.455-6.028%204.88-6.028H50.71V0h-16.68C10.405-.002%2010.96%2025.172%2010.96%2028.93zm122.01%2042.292H81.318c-1.02%200-1.847-1.158-1.847-2.582v-10.6c0-1.424.827-2.582%201.847-2.582h51.654c1.022%200%201.846%201.158%201.846%202.582v10.6c0%201.424-.824%202.582-1.845%202.582zm0%2026.164H81.318c-1.02%200-1.847-1.158-1.847-2.582v-10.6c0-1.428.827-2.582%201.847-2.582h51.654c1.022%200%201.846%201.154%201.846%202.582v10.6c0%201.424-.824%202.582-1.845%202.582zm8.08-63.92H73.238c-4.923%200-8.95%205.64-8.95%2012.53v64.227c0%206.893%204.027%2012.532%208.95%2012.532h41.144c.52%200%201.012.304%201.363.84l12.543%2019.226c1.136%201.742%203.207.618%203.207-1.744l-.006-15.74c0-1.423.827-2.58%201.847-2.58h7.717c4.925%200%208.95-5.64%208.95-12.533V45.995c0-6.89-4.025-12.528-8.95-12.528z%22\/%3E%3C\/svg%3E\u0027)}.connector-icon-botframework-msteams{background-size:80%;background-color:#5455b0;background-image:url(\u0027data:image\/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A\/\/www.w3.org\/2000\/svg%22%20viewBox%3D%220%200%2093%2093%22%3E%0A%20%20%3Cpath%20fill%3D%22%23fff%22%20d%3D%22M59.8127%2C33.6932%20C62.6427%2C36.0142%2066.5957%2C36.0892%2069.4417%2C33.8732%20C72.3087%2C31.6422%2073.2557%2C27.6852%2071.6887%2C24.4892%20C70.1357%2C21.3232%2066.5617%2C19.5242%2063.2167%2C20.2242%20C59.5417%2C20.9942%2058.5407%2C22.6122%2058.5407%2C27.7812%20C58.5407%2C32.6492%2058.5407%2C32.6492%2059.8127%2C33.6932%20L59.8127%2C33.6932%20Z%20M84.7917%2C40.0892%20C89.0347%2C40.1072%2092.5267%2C36.7282%2092.6027%2C32.5322%20C92.6797%2C28.2692%2089.1227%2C24.7342%2084.7777%2C24.7562%20C80.5557%2C24.7782%2077.0897%2C28.2382%2077.0937%2C32.4282%20C77.0977%2C36.6292%2080.5567%2C40.0712%2084.7917%2C40.0892%20L84.7917%2C40.0892%20Z%20M92.5667%2C44.9862%20L77.1797%2C44.9862%20L77.1797%2C67.8832%20C80.2187%2C68.2252%2082.9897%2C68.0522%2085.6807%2C67.4012%20C88.8077%2C66.6442%2091.7507%2C65.1752%2092.2777%2C61.6852%20C93.1137%2C56.1382%2092.5287%2C50.5262%2092.5667%2C44.9862%20L92.5667%2C44.9862%20Z%20M58.6537%2C74.0892%20C61.0207%2C75.0042%2063.3417%2C75.2022%2065.7437%2C74.8952%20C71.6347%2C74.1412%2074.0707%2C71.4092%2074.0787%2C65.4732%20C74.0827%2C62.3052%2074.0797%2C59.1382%2074.0797%2C55.9712%20L74.0797%2C40.2622%20L58.6537%2C40.2622%20L58.6537%2C74.0892%20Z%20M12.4797%2C29.2982%20C21.5367%2C28.7242%2030.5857%2C28.1512%2039.8207%2C27.5662%20L39.8207%2C35.3722%20C36.4657%2C35.5582%2033.1097%2C35.7432%2029.5357%2C35.9402%20L29.5357%2C65.6882%20L21.5887%2C65.6882%20L21.5887%2C36.4112%20L12.4797%2C36.4112%20L12.4797%2C29.2982%20Z%20M-0.0003%2C80.3642%20C18.5197%2C84.4762%2036.8697%2C88.5512%2055.3287%2C92.6502%20L55.3287%2C0.0002%20C36.7497%2C4.1292%2018.4077%2C8.2062%20-0.0003%2C12.2972%20L-0.0003%2C80.3642%20Z%22\/%3E%0A%3C\/svg%3E%0A\u0027)}"}],"location":4,"delay":0,"bgColor":"#00AEEF","iconColor":"#FFFFFF","widgets":[{"id":"openline_livechat","title":"\u041e\u043d\u043b\u0430\u0439\u043d-\u0447\u0430\u0442","script":"\u003C!-- Bitrix24.LiveChat button --\u003E\n\u003Cscript type=\u0022text\/javascript\u0022\u003E(function (d) {var f = function () {var n1 = document.getElementsByTagName(\u0022script\u0022)[0], r1=1*new Date(), s1 = document.createElement(\u0022script\u0022); s1.type = \u0022text\/javascript\u0022; s1.async = \u0022true\u0022; s1.charset = \u0022UTF-8\u0022; s1.src = \u0022https:\/\/cdn.bitrix24.ru\/b1769931\/livechat\/button\/a9bd9a.js?r=\u0022+r1;n1.parentNode.insertBefore(s1, n1); }; if (typeof(BX)!=\u0022undefined\u0022 \u0026\u0026 typeof(BX.ready)!=\u0022undefined\u0022) {BX.ready(f)} else if (typeof(jQuery)!=\u0022undefined\u0022) {jQuery(f)} else { setTimeout(f, 150); }})(document);\u003C\/script\u003E\n\u003C!-- \/Bitrix24.LiveChat button --\u003E","show":"window.BX.LiveChat.openLiveChat();","hide":"window.BX.LiveChat.closeLiveChat();","sort":100,"useColors":true,"classList":["b24-widget-button-openline_livechat"],"type":"openline","pages":{"mode":"EXCLUDE","list":[]},"workTime":null},{"id":"crmform","title":"\u041e\u0431\u0440\u0430\u0442\u043d\u0430\u044f \u0441\u0432\u044f\u0437\u044c","script":"\u003Cdiv class=\u0022bx-crm-widget-form-config-wrapper\u0022\u003E\n\t\u003Cdiv id=\u0022bx24_form_container_4\u0022 class=\u0022bx-crm-widget-form-config-sidebar\u0022\u003E\n\t\t\u003Cdiv class=\u0022bx-crm-widget-form-config-sidebar-inner\u0022\u003E\n\t\t\t\u003Cdiv class=\u0022bx-crm-widget-form-config-sidebar-header\u0022\u003E\n\t\t\t\t\u003Cspan class=\u0022bx-crm-widget-form-config-sidebar-hamburger\u0022\u003E\n\t\t\t\t\t\u003Cspan class=\u0022bx-crm-widget-form-config-sidebar-hamburger-item\u0022\u003E\u003C\/span\u003E\n\t\t\t\t\u003C\/span\u003E\n\t\t\t\t\u003Cspan class=\u0022bx-crm-widget-form-config-sidebar-message\u0022\u003E\n\t\t\t\t\t\u003Cspan data-bx-crm-widget-caption=\u0022\u0022 class=\u0022bx-crm-widget-form-config-sidebar-message-item\u0022\u003E\u0417\u0430\u043f\u043e\u043b\u043d\u0438\u0442\u0435 \u0444\u043e\u0440\u043c\u0443\u003C\/span\u003E\n\t\t\t\t\u003C\/span\u003E\n\t\t\t\t\u003Cdiv class=\u0022bx-crm-widget-form-config-sidebar-rollup\u0022\u003E\n\t\t\t\t\t\u003Cspan class=\u0022bx-crm-widget-form-config-sidebar-rollup-item\u0022\u003E\u003C\/span\u003E\n\t\t\t\t\u003C\/div\u003E\n\t\t\t\t\u003Cspan class=\u0022bx-crm-widget-form-config-sidebar-close\u0022\u003E\n\t\t\t\t\t\u003Cspan class=\u0022bx-crm-widget-form-config-sidebar-close-item\u0022 onclick=\u0022BX.SiteButton.removeClass(document.getElementById(\u0027bx24_form_container_4\u0027), \u0027open-sidebar\u0027); BX.SiteButton.onWidgetClose();\u0022\u003E\u003C\/span\u003E\n\t\t\t\t\u003C\/span\u003E\n\t\t\t\u003C\/div\u003E\n\n\t\t\t\u003Cdiv class=\u0022bx-crm-widget-form-config-sidebar-info\u0022\u003E\n\n\t\t\t\t\u003Cdiv id=\u0022bx24_form_inline_loader_container_4\u0022 class=\u0022\u0022\u003E\n\t\t\t\t\t\t\t\t\t\u003C\/div\u003E\n\n\t\t\t\u003C\/div\u003E\n\n\t\t\t\u003Cdiv class=\u0022bx-crm-widget-form-config-sidebar-chat-container\u0022\u003E\n\t\t\t\t\u003Cdiv class=\u0022bx-crm-widget-form-config-sidebar-chat-border\u0022\u003E\u003C\/div\u003E\n\t\t\t\t\t\t\t\t\u003Cdiv class=\u0022bx-crm-widget-form-config-sidebar-logo\u0022\u003E\n\t\t\t\t\t\u003Ca target=\u0022_blank\u0022 href=\u0022https:\/\/www.bitrix24.ru\/?c=yourock.bitrix24.ru\u0022\u003E\n\t\t\t\t\t\t\u003Cspan class=\u0022bx-crm-widget-form-config-sidebar-logo-text\u0022\u003E\u0417\u0430\u0440\u044f\u0436\u0435\u043d\u043e\u003C\/span\u003E\n\t\t\t\t\t\t\u003Cspan class=\u0022bx-crm-widget-form-config-sidebar-logo-bx\u0022\u003E\u0411\u0438\u0442\u0440\u0438\u043a\u0441\u003C\/span\u003E\n\t\t\t\t\t\t\u003Cspan class=\u0022bx-crm-widget-form-config-sidebar-logo-24\u0022\u003E24\u003C\/span\u003E\n\t\t\t\t\t\t\t\t\t\t\t\u003C\/a\u003E\n\t\t\t\t\u003C\/div\u003E\n\t\t\t\t\t\t\t\u003C\/div\u003E\n\t\t\u003C\/div\u003E\n\t\u003C\/div\u003E\n\u003C\/div\u003E","sort":300,"useColors":true,"classList":["b24-widget-button-crmform"],"show":"\n\t\t\t(function(w,d,u,b){w[\u0027Bitrix24FormObject\u0027]=b;w[b] = w[b] || function(){arguments[0].ref=u;\n\t\t\t\t(w[b].forms=w[b].forms||[]).push(arguments[0])};\n\t\t\t\tif(w[b][\u0027forms\u0027]) return;\n\t\t\t\ts=d.createElement(\u0027script\u0027);r=1*new Date();s.async=1;s.src=u+\u0027?\u0027+r;\n\t\t\t\th=d.getElementsByTagName(\u0027script\u0027)[0];h.parentNode.insertBefore(s,h);\n\t\t\t})(window,document,\u0027https:\/\/yourock.bitrix24.ru\/bitrix\/js\/crm\/form_loader.js\u0027,\u0027b24form\u0027);\n\t\t\t\n\t\t\t(function(w,b){\t\t\t\t\n\t\t\t\tparams = {\n\t\t\t\t\t\u0022id\u0022:\u00224\u0022,\u0022lang\u0022:\u0022ru\u0022,\u0022sec\u0022:\u0022koubyy\u0022,\u0022type\u0022:\u0022inline\u0022, \n\t\t\t\t\t\u0022node\u0022: document.getElementById(\u0022bx24_form_inline_loader_container_4\u0022),\n\t\t\t\t\t\u0022isCallbackForm\u0022: false,\n\t\t\t\t\t\u0022options\u0022: {\n\t\t\t\t\t\t\u0022borders\u0022: false, \n\t\t\t\t\t\t\u0022logo\u0022: false\n\t\t\t\t\t},\n\t\t\t\t\t\u0022handlers\u0022: {\n\t\t\t\t\t\t\u0022init\u0022: function (form){\n\t\t\t\t\t\t\tBX.SiteButton.onWidgetFormInit(form);\n\t\t\t\t\t\t},\n\t\t\t\t\t\t\u0022keyboard\u0022: function (form, keyCode){\n\t\t\t\t\t\t\tif (keyCode == 27) BX.SiteButton.wm.hide();\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t};\n\t\t\t\t\n\t\t\t\tif(w[\u0027Bitrix24FormLoader\u0027] \u0026\u0026 !Bitrix24FormLoader.isFormExisted(params)) \n\t\t\t\t{\n\t\t\t\t\tparams.ref = \u0022https:\/\/yourock.bitrix24.ru\/bitrix\/js\/crm\/form_loader.js\u0022;\n\t\t\t\t\tBitrix24FormLoader.preLoad(params);\n\t\t\t\t}\n\t\t\t\telse\n\t\t\t\t{\n\t\t\t\t\tw[b](params);\n\t\t\t\t}\n\t\t\t\t\n\t\t\t})(window,\u0027b24form\u0027);\t\t\t\n\t\t\t\n\t\t\tbx24FormCont=document.getElementById(\u0022bx24_form_container_4\u0022);\n\t\t\tif (bx24FormCont) \n\t\t\t{\n\t\t\t\tBX.SiteButton.addClass(bx24FormCont, \u0022open-sidebar\u0022);\n\t\t\t}\n\t\t","hide":"BX.SiteButton.removeClass(document.getElementById(\u0027bx24_form_container_4\u0027), \u0027open-sidebar\u0027); BX.SiteButton.onWidgetClose();","type":"crmform","pages":{"mode":"EXCLUDE","list":[]},"workTime":null},{"id":"callback","title":"\u041e\u0431\u0440\u0430\u0442\u043d\u044b\u0439 \u0437\u0432\u043e\u043d\u043e\u043a","script":"\u003Cdiv class=\u0022bx-crm-widget-form-config-wrapper\u0022\u003E\n\t\u003Cdiv id=\u0022bx24_form_container_6\u0022 class=\u0022bx-crm-widget-form-config-sidebar\u0022\u003E\n\t\t\u003Cdiv class=\u0022bx-crm-widget-form-config-sidebar-inner\u0022\u003E\n\t\t\t\u003Cdiv class=\u0022bx-crm-widget-form-config-sidebar-header\u0022\u003E\n\t\t\t\t\u003Cspan class=\u0022bx-crm-widget-form-config-sidebar-hamburger\u0022\u003E\n\t\t\t\t\t\u003Cspan class=\u0022bx-crm-widget-form-config-sidebar-hamburger-item\u0022\u003E\u003C\/span\u003E\n\t\t\t\t\u003C\/span\u003E\n\t\t\t\t\u003Cspan class=\u0022bx-crm-widget-form-config-sidebar-message\u0022\u003E\n\t\t\t\t\t\u003Cspan data-bx-crm-widget-caption=\u0022\u0022 class=\u0022bx-crm-widget-form-config-sidebar-message-item\u0022\u003E\u041c\u044b \u043f\u0435\u0440\u0435\u0437\u0432\u043e\u043d\u0438\u043c \u0432\u0430\u043c\u003C\/span\u003E\n\t\t\t\t\u003C\/span\u003E\n\t\t\t\t\u003Cdiv class=\u0022bx-crm-widget-form-config-sidebar-rollup\u0022\u003E\n\t\t\t\t\t\u003Cspan class=\u0022bx-crm-widget-form-config-sidebar-rollup-item\u0022\u003E\u003C\/span\u003E\n\t\t\t\t\u003C\/div\u003E\n\t\t\t\t\u003Cspan class=\u0022bx-crm-widget-form-config-sidebar-close\u0022\u003E\n\t\t\t\t\t\u003Cspan class=\u0022bx-crm-widget-form-config-sidebar-close-item\u0022 onclick=\u0022BX.SiteButton.removeClass(document.getElementById(\u0027bx24_form_container_6\u0027), \u0027open-sidebar\u0027); BX.SiteButton.onWidgetClose();\u0022\u003E\u003C\/span\u003E\n\t\t\t\t\u003C\/span\u003E\n\t\t\t\u003C\/div\u003E\n\n\t\t\t\u003Cdiv class=\u0022bx-crm-widget-form-config-sidebar-info\u0022\u003E\n\n\t\t\t\t\u003Cdiv id=\u0022bx24_form_inline_loader_container_6\u0022 class=\u0022\u0022\u003E\n\t\t\t\t\t\t\t\t\t\u003C\/div\u003E\n\n\t\t\t\u003C\/div\u003E\n\n\t\t\t\u003Cdiv class=\u0022bx-crm-widget-form-config-sidebar-chat-container\u0022\u003E\n\t\t\t\t\u003Cdiv class=\u0022bx-crm-widget-form-config-sidebar-chat-border\u0022\u003E\u003C\/div\u003E\n\t\t\t\t\t\t\t\t\u003Cdiv class=\u0022bx-crm-widget-form-config-sidebar-logo\u0022\u003E\n\t\t\t\t\t\u003Ca target=\u0022_blank\u0022 href=\u0022https:\/\/www.bitrix24.ru\/?c=yourock.bitrix24.ru\u0022\u003E\n\t\t\t\t\t\t\u003Cspan class=\u0022bx-crm-widget-form-config-sidebar-logo-text\u0022\u003E\u0417\u0430\u0440\u044f\u0436\u0435\u043d\u043e\u003C\/span\u003E\n\t\t\t\t\t\t\u003Cspan class=\u0022bx-crm-widget-form-config-sidebar-logo-bx\u0022\u003E\u0411\u0438\u0442\u0440\u0438\u043a\u0441\u003C\/span\u003E\n\t\t\t\t\t\t\u003Cspan class=\u0022bx-crm-widget-form-config-sidebar-logo-24\u0022\u003E24\u003C\/span\u003E\n\t\t\t\t\t\t\t\t\t\t\t\u003C\/a\u003E\n\t\t\t\t\u003C\/div\u003E\n\t\t\t\t\t\t\t\u003C\/div\u003E\n\t\t\u003C\/div\u003E\n\t\u003C\/div\u003E\n\u003C\/div\u003E","sort":200,"useColors":true,"classList":["b24-widget-button-callback"],"show":"\n\t\t\t(function(w,d,u,b){w[\u0027Bitrix24FormObject\u0027]=b;w[b] = w[b] || function(){arguments[0].ref=u;\n\t\t\t\t(w[b].forms=w[b].forms||[]).push(arguments[0])};\n\t\t\t\tif(w[b][\u0027forms\u0027]) return;\n\t\t\t\ts=d.createElement(\u0027script\u0027);r=1*new Date();s.async=1;s.src=u+\u0027?\u0027+r;\n\t\t\t\th=d.getElementsByTagName(\u0027script\u0027)[0];h.parentNode.insertBefore(s,h);\n\t\t\t})(window,document,\u0027https:\/\/yourock.bitrix24.ru\/bitrix\/js\/crm\/form_loader.js\u0027,\u0027b24form\u0027);\n\t\t\t\n\t\t\t(function(w,b){\t\t\t\t\n\t\t\t\tparams = {\n\t\t\t\t\t\u0022id\u0022:\u00226\u0022,\u0022lang\u0022:\u0022ru\u0022,\u0022sec\u0022:\u00229asb7p\u0022,\u0022type\u0022:\u0022inline\u0022, \n\t\t\t\t\t\u0022node\u0022: document.getElementById(\u0022bx24_form_inline_loader_container_6\u0022),\n\t\t\t\t\t\u0022isCallbackForm\u0022: true,\n\t\t\t\t\t\u0022options\u0022: {\n\t\t\t\t\t\t\u0022borders\u0022: false, \n\t\t\t\t\t\t\u0022logo\u0022: false\n\t\t\t\t\t},\n\t\t\t\t\t\u0022handlers\u0022: {\n\t\t\t\t\t\t\u0022init\u0022: function (form){\n\t\t\t\t\t\t\tBX.SiteButton.onWidgetFormInit(form);\n\t\t\t\t\t\t},\n\t\t\t\t\t\t\u0022keyboard\u0022: function (form, keyCode){\n\t\t\t\t\t\t\tif (keyCode == 27) BX.SiteButton.wm.hide();\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t};\n\t\t\t\t\n\t\t\t\tif(w[\u0027Bitrix24FormLoader\u0027] \u0026\u0026 !Bitrix24FormLoader.isFormExisted(params)) \n\t\t\t\t{\n\t\t\t\t\tparams.ref = \u0022https:\/\/yourock.bitrix24.ru\/bitrix\/js\/crm\/form_loader.js\u0022;\n\t\t\t\t\tBitrix24FormLoader.preLoad(params);\n\t\t\t\t}\n\t\t\t\telse\n\t\t\t\t{\n\t\t\t\t\tw[b](params);\n\t\t\t\t}\n\t\t\t\t\n\t\t\t})(window,\u0027b24form\u0027);\t\t\t\n\t\t\t\n\t\t\tbx24FormCont=document.getElementById(\u0022bx24_form_container_6\u0022);\n\t\t\tif (bx24FormCont) \n\t\t\t{\n\t\t\t\tBX.SiteButton.addClass(bx24FormCont, \u0022open-sidebar\u0022);\n\t\t\t}\n\t\t","hide":"BX.SiteButton.removeClass(document.getElementById(\u0027bx24_form_container_6\u0027), \u0027open-sidebar\u0027); BX.SiteButton.onWidgetClose();","type":"callback","pages":{"mode":"EXCLUDE","list":[]},"workTime":null}],"layout":"\u003Cdiv\u003E\n\t\u003Cdiv data-b24-crm-button-shadow=\u0022\u0022 class=\u0022b24-widget-button-shadow\u0022\u003E\u003C\/div\u003E\n\t\u003Cdiv style=\u0022display: none;\u0022\u003E\n\t\t\u003Ca data-b24-crm-button-widget-blank=\u0022\u0022 data-b24-crm-button-widget=\u0022\u0022 class=\u0022b24-widget-button-social-item\u0022 title=\u0022\u0022\u003E\n\t\t\t\u003Cspan data-b24-crm-button-tooltip=\u0022\u0022 class=\u0022b24-widget-button-social-tooltip\u0022\u003E\u003C\/span\u003E\n\t\t\u003C\/a\u003E\n\t\u003C\/div\u003E\n\n\t\u003Cdiv data-b24-crm-button-cont=\u0022\u0022 class=\u0022b24-widget-button-wrapper b24-widget-button-position-bottom-right\u0022\u003E\n\t\t\u003Cdiv data-b24-crm-hello-cont=\u0022\u0022 class=\u0022b24-widget-button-popup\u0022 style=\u0022border-color: #00AEEF;\u0022\u003E\n\t\t\t\u003Cspan data-b24-hello-btn-hide=\u0022\u0022 class=\u0022b24-widget-button-popup-btn-hide\u0022\u003E\u003C\/span\u003E\n\t\t\t\u003Cdiv class=\u0022b24-widget-button-popup-inner\u0022\u003E\n\t\t\t\t\u003Cdiv class=\u0022b24-widget-button-popup-image\u0022\u003E\n\t\t\t\t\t\u003Cspan data-b24-hello-icon=\u0022\u0022 class=\u0022b24-widget-button-popup-image-item\u0022\u003E\u003C\/span\u003E\n\t\t\t\t\u003C\/div\u003E\n\t\t\t\t\u003Cdiv class=\u0022b24-widget-button-popup-content\u0022\u003E\n\t\t\t\t\t\u003Cdiv data-b24-hello-name=\u0022\u0022 class=\u0022b24-widget-button-popup-name\u0022\u003E\u003C\/div\u003E\n\t\t\t\t\t\u003Cdiv data-b24-hello-text=\u0022\u0022 class=\u0022b24-widget-button-popup-description\u0022\u003E\u003C\/div\u003E\n\t\t\t\t\u003C\/div\u003E\n\t\t\t\u003C\/div\u003E\n\t\t\t\u003Cdiv class=\u0022b24-widget-button-popup-triangle\u0022 style=\u0022border-color: #00AEEF;\u0022\u003E\u003C\/div\u003E\n\t\t\u003C\/div\u003E\n\n\t\t\u003Cdiv data-b24-crm-button-block=\u0022\u0022 class=\u0022b24-widget-button-social\u0022\u003E\n\n\t\t\u003C\/div\u003E\n\t\t\u003Cdiv data-b24-crm-button-block-button=\u0022\u0022 class=\u0022b24-widget-button-inner-container\u0022\u003E\n\t\t\t\u003Cdiv data-b24-crm-button-block-border=\u0022\u0022 class=\u0022b24-widget-button-inner-mask\u0022 style=\u0022background: #00AEEF;\u0022\u003E\u003C\/div\u003E\n\t\t\t\u003Cdiv class=\u0022b24-widget-button-block\u0022\u003E\n\t\t\t\t\u003Cdiv data-b24-crm-button-pulse=\u0022\u0022 class=\u0022b24-widget-button-pulse\u0022 style=\u0022border-color: #00AEEF;\u0022\u003E\u003C\/div\u003E\n\t\t\t\t\u003Cdiv data-b24-crm-button-block-inner=\u0022\u0022 class=\u0022b24-widget-button-inner-block\u0022 style=\u0022background: #00AEEF;\u0022\u003E\n\t\t\t\t\t\u003Cdiv class=\u0022b24-widget-button-icon-container\u0022\u003E\n\t\t\t\t\t\t\t\t\t\t\t\t\t\u003Cdiv data-b24-crm-button-icon=\u0022crmform\u0022 class=\u0022b24-widget-button-inner-item\u0022\u003E\n\t\t\t\t\t\t\t\t\u003Csvg class=\u0022b24-crm-button-icon\u0022 xmlns=\u0022http:\/\/www.w3.org\/2000\/svg\u0022 width=\u002228\u0022 height=\u002228\u0022\n\t\t\t\t\t\t\t\t\tviewBox=\u00220 0 24 28\u0022\u003E\n\t\t\t\t\t\t\t\t\t\u003Cpath class=\u0022b24-crm-button-webform-icon\u0022 fill=\u0022#FFFFFF\u0022 fill-rule=\u0022evenodd\u0022\n\t\t\t\t\t\t\t\t\t\td=\u0022M815.406703,961 L794.305503,961 C793.586144,961 793,961.586144 793,962.305503 L793,983.406703 C793,984.126062 793.586144,984.712206 794.305503,984.712206 L815.406703,984.712206 C816.126062,984.712206 816.712206,984.126062 816.712206,983.406703 L816.712206,962.296623 C816.703325,961.586144 816.117181,961 815.406703,961 L815.406703,961 Z M806.312583,979.046143 C806.312583,979.454668 805.975106,979.783264 805.575462,979.783264 L796.898748,979.783264 C796.490224,979.783264 796.161627,979.445787 796.161627,979.046143 L796.161627,977.412044 C796.161627,977.003519 796.499105,976.674923 796.898748,976.674923 L805.575462,976.674923 C805.983987,976.674923 806.312583,977.0124 806.312583,977.412044 L806.312583,979.046143 L806.312583,979.046143 Z M813.55946,973.255747 C813.55946,973.664272 813.221982,973.992868 812.822339,973.992868 L796.889868,973.992868 C796.481343,973.992868 796.152746,973.655391 796.152746,973.255747 L796.152746,971.621647 C796.152746,971.213122 796.490224,970.884526 796.889868,970.884526 L812.813458,970.884526 C813.221982,970.884526 813.550579,971.222003 813.550579,971.621647 L813.550579,973.255747 L813.55946,973.255747 Z M813.55946,967.45647 C813.55946,967.864994 813.221982,968.193591 812.822339,968.193591 L796.889868,968.193591 C796.481343,968.193591 796.152746,967.856114 796.152746,967.45647 L796.152746,965.82237 C796.152746,965.413845 796.490224,965.085249 796.889868,965.085249 L812.813458,965.085249 C813.221982,965.085249 813.550579,965.422726 813.550579,965.82237 L813.550579,967.45647 L813.55946,967.45647 Z\u0022\n\t\t\t\t\t\t\t\t\t\ttransform=\u0022translate(-793 -961)\u0022\/\u003E\n\t\t\t\t\t\t\t\t\u003C\/svg\u003E\n\t\t\t\t\t\t\t\u003C\/div\u003E\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\u003Cdiv data-b24-crm-button-icon=\u0022callback\u0022 class=\u0022b24-widget-button-inner-item\u0022\u003E\n\t\t\t\t\t\t\t\t\u003Csvg class=\u0022b24-crm-button-icon\u0022 xmlns=\u0022http:\/\/www.w3.org\/2000\/svg\u0022 width=\u002228\u0022 height=\u002228\u0022\n\t\t\t\t\t\t\t\t\tviewBox=\u00220 0 28 30\u0022\u003E\n\t\t\t\t\t\t\t\t\t\u003Cpath class=\u0022b24-crm-button-call-icon\u0022 fill=\u0022#FFFFFF\u0022 fill-rule=\u0022evenodd\u0022\n\t\t\t\t\t\t\t\t\t\td=\u0022M940.872414,978.904882 C939.924716,977.937215 938.741602,977.937215 937.79994,978.904882 C937.08162,979.641558 936.54439,979.878792 935.838143,980.627954 C935.644982,980.833973 935.482002,980.877674 935.246586,980.740328 C934.781791,980.478121 934.286815,980.265859 933.840129,979.97868 C931.757607,978.623946 930.013117,976.882145 928.467826,974.921839 C927.701216,973.947929 927.019115,972.905345 926.542247,971.731659 C926.445666,971.494424 926.463775,971.338349 926.6509,971.144815 C927.36922,970.426869 927.610672,970.164662 928.316918,969.427987 C929.300835,968.404132 929.300835,967.205474 928.310882,966.175376 C927.749506,965.588533 927.206723,964.77769 926.749111,964.14109 C926.29156,963.50449 925.932581,962.747962 925.347061,962.154875 C924.399362,961.199694 923.216248,961.199694 922.274586,962.161118 C921.55023,962.897794 920.856056,963.653199 920.119628,964.377388 C919.437527,965.045391 919.093458,965.863226 919.021022,966.818407 C918.906333,968.372917 919.274547,969.840026 919.793668,971.269676 C920.856056,974.228864 922.473784,976.857173 924.43558,979.266977 C927.085514,982.52583 930.248533,985.104195 933.948783,986.964613 C935.6148,987.801177 937.341181,988.444207 939.218469,988.550339 C940.510236,988.625255 941.632988,988.288132 942.532396,987.245549 C943.148098,986.533845 943.842272,985.884572 944.494192,985.204083 C945.459999,984.192715 945.466036,982.969084 944.506265,981.970202 C943.359368,980.777786 942.025347,980.091055 940.872414,978.904882 Z M940.382358,973.54478 L940.649524,973.497583 C941.23257,973.394635 941.603198,972.790811 941.439977,972.202844 C940.97488,970.527406 940.107887,969.010104 938.90256,967.758442 C937.61538,966.427182 936.045641,965.504215 934.314009,965.050223 C933.739293,964.899516 933.16512,965.298008 933.082785,965.905204 L933.044877,966.18514 C932.974072,966.707431 933.297859,967.194823 933.791507,967.32705 C935.117621,967.682278 936.321439,968.391422 937.308977,969.412841 C938.23579,970.371393 938.90093,971.53815 939.261598,972.824711 C939.401641,973.324464 939.886476,973.632369 940.382358,973.54478 Z M942.940854,963.694228 C940.618932,961.29279 937.740886,959.69052 934.559939,959.020645 C934.000194,958.902777 933.461152,959.302642 933.381836,959.8878 L933.343988,960.167112 C933.271069,960.705385 933.615682,961.208072 934.130397,961.317762 C936.868581,961.901546 939.347628,963.286122 941.347272,965.348626 C943.231864,967.297758 944.53673,969.7065 945.149595,972.360343 C945.27189,972.889813 945.766987,973.232554 946.285807,973.140969 L946.55074,973.094209 C947.119782,972.993697 947.484193,972.415781 947.350127,971.835056 C946.638568,968.753629 945.126778,965.960567 942.940854,963.694228 Z\u0022\n\t\t\t\t\t\t\t\t\t\ttransform=\u0022translate(-919 -959)\u0022\/\u003E\n\t\t\t\t\t\t\t\t\u003C\/svg\u003E\n\t\t\t\t\t\t\t\u003C\/div\u003E\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\u003Cdiv data-b24-crm-button-icon=\u0022openline\u0022 class=\u0022b24-widget-button-inner-item\u0022\u003E\n\t\t\t\t\t\t\t\t\u003Csvg class=\u0022b24-crm-button-icon b24-crm-button-icon-active\u0022 xmlns=\u0022http:\/\/www.w3.org\/2000\/svg\u0022\n\t\t\t\t\t\t\t\t\twidth=\u002228\u0022 height=\u002228\u0022 viewBox=\u00220 0 28 29\u0022\u003E\n\t\t\t\t\t\t\t\t\t\u003Cpath class=\u0022b24-crm-button-chat-icon\u0022 fill=\u0022#FFFFFF\u0022 fill-rule=\u0022evenodd\u0022\n\t\t\t\t\t\t\t\t\t\td=\u0022M878.289968,975.251189 L878.289968,964.83954 C878.289968,963.46238 876.904379,962 875.495172,962 L857.794796,962 C856.385491,962 855,963.46238 855,964.83954 L855,975.251189 C855,976.924031 856.385491,978.386204 857.794796,978.090729 L860.589592,978.090729 L860.589592,981.876783 L860.589592,983.76981 L861.521191,983.76981 C861.560963,983.76981 861.809636,982.719151 862.45279,982.823297 L866.179185,978.090729 L875.495172,978.090729 C876.904379,978.386204 878.289968,976.924031 878.289968,975.251189 Z M881.084764,971.465135 L881.084764,976.197702 C881.43316,978.604561 879.329051,980.755508 876.426771,980.93027 L868.042382,980.93027 L866.179185,982.823297 C866.400357,983.946455 867.522357,984.94992 868.973981,984.716324 L876.426771,984.716324 L879.221567,988.502377 C879.844559,988.400361 880.153166,989.448891 880.153166,989.448891 L881.084764,989.448891 L881.084764,987.555864 L881.084764,984.716324 L882.947962,984.716324 C884.517696,984.949819 885.742758,983.697082 885.742758,981.876783 L885.742758,974.304675 C885.742659,972.717669 884.517597,971.465135 882.947962,971.465135 L881.084764,971.465135 Z\u0022\n\t\t\t\t\t\t\t\t\t\ttransform=\u0022translate(-855 -962)\u0022\/\u003E\n\t\t\t\t\t\t\t\t\u003C\/svg\u003E\n\t\t\t\t\t\t\t\u003C\/div\u003E\n\t\t\t\t\t\t\t\t\t\t\t\u003C\/div\u003E\n\t\t\t\t\t\u003Cdiv class=\u0022b24-widget-button-inner-item b24-widget-button-close\u0022\u003E\n\t\t\t\t\t\t\u003Csvg class=\u0022b24-widget-button-icon b24-widget-button-close-item\u0022 xmlns=\u0022http:\/\/www.w3.org\/2000\/svg\u0022 width=\u002229\u0022 height=\u002229\u0022 viewBox=\u00220 0 29 29\u0022\u003E\u003Cpath fill=\u0022#FFF\u0022 fill-rule=\u0022evenodd\u0022 d=\u0022M18.866 14.45l9.58-9.582L24.03.448l-9.587 9.58L4.873.447.455 4.866l9.575 9.587-9.583 9.57 4.418 4.42 9.58-9.577 9.58 9.58 4.42-4.42\u0022\/\u003E\u003C\/svg\u003E\n\t\t\t\t\t\u003C\/div\u003E\n\t\t\t\t\u003C\/div\u003E\n\t\t\t\u003C\/div\u003E\n\t\t\u003C\/div\u003E\n\t\u003C\/div\u003E\n\n\u003C\/div\u003E\n\n","hello":{"delay":1,"showWidgetId":"openline_livechat","conditions":[]}});